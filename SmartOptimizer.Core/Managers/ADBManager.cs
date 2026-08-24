using System.Diagnostics;
using System.IO;
using System.Text.RegularExpressions;

namespace SmartOptimizer.Core.Managers;

public sealed class AdbDevice
{
    public string Serial { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string Model { get; init; } = string.Empty;
}

public sealed class ADBManager
{
    private static readonly int[] KnownEmulatorPorts = [5555, 5554, 5556, 7555, 21503, 62001, 5565, 5575];
    private string _adbPath = "adb.exe";
    private bool _missingBinaryWarned = false;
    private int _targetPort = 5555;

    public bool IsServerRunning { get; private set; }
    public AdbDevice? ConnectedDevice { get; private set; }
    public string CurrentAdbPath => _adbPath;
    public int CurrentPort => _targetPort;
    public bool HasAdbBinary => File.Exists(_adbPath) || IsInSystemPath("adb.exe");

    public event Action<string>? LogMessage;
    public event Action<AdbDevice?>? DeviceStateChanged;

    public ADBManager(string? customAdbPath = null)
    {
        if (!string.IsNullOrWhiteSpace(customAdbPath) && File.Exists(customAdbPath))
        {
            _adbPath = customAdbPath;
        }
        else
        {
            AutoDiscoverAdb(null);
        }
    }

    public void SetAdbPath(string path)
    {
        if (!string.IsNullOrWhiteSpace(path) && File.Exists(path))
        {
            _adbPath = path;
            _missingBinaryWarned = false;
            Log($"ADB binary set to: {_adbPath}");
        }
    }

    public void SetPort(int port)
    {
        if (port is >= 1 and <= 65535)
        {
            _targetPort = port;
            Log($"Target ADB port set to: {_targetPort}");
        }
    }

    public bool AutoDiscoverAdb(string? emulatorExePath)
    {
        // 1. If emulatorExePath is provided, search its directory & parent
        if (!string.IsNullOrWhiteSpace(emulatorExePath) && File.Exists(emulatorExePath))
        {
            var dir = Path.GetDirectoryName(emulatorExePath);
            if (!string.IsNullOrEmpty(dir) && Directory.Exists(dir))
            {
                var candidates = new[] { "HD-Adb.exe", "adb.exe", "nox_adb.exe", "vbox_adb.exe" };
                foreach (var name in candidates)
                {
                    var exact = Path.Combine(dir, name);
                    if (File.Exists(exact))
                    {
                        _adbPath = exact;
                        _missingBinaryWarned = false;
                        Log($"Found emulator-bundled ADB: {_adbPath}");
                        return true;
                    }

                    // Check subfolders (like bin/)
                    var subBin = Path.Combine(dir, "bin", name);
                    if (File.Exists(subBin))
                    {
                        _adbPath = subBin;
                        _missingBinaryWarned = false;
                        Log($"Found emulator-bundled ADB: {_adbPath}");
                        return true;
                    }

                    // Check parent folder
                    var parent = Directory.GetParent(dir)?.FullName;
                    if (!string.IsNullOrEmpty(parent))
                    {
                        var parentPath = Path.Combine(parent, name);
                        if (File.Exists(parentPath))
                        {
                            _adbPath = parentPath;
                            _missingBinaryWarned = false;
                            Log($"Found emulator ADB in parent directory: {_adbPath}");
                            return true;
                        }
                    }
                }
            }
        }

        // 2. Check standard common emulator paths
        var standardPaths = new[]
        {
            @"C:\Program Files\BlueStacks_nxt\HD-Adb.exe",
            @"C:\Program Files\BlueStacks\HD-Adb.exe",
            @"C:\Program Files (x86)\BlueStacks_nxt\HD-Adb.exe",
            @"C:\LDPlayer\LDPlayer9\adb.exe",
            @"C:\LDPlayer\LDPlayer4.0\adb.exe",
            @"C:\Program Files\Nox\bin\nox_adb.exe",
            @"C:\Program Files (x86)\Nox\bin\nox_adb.exe",
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "adb.exe"),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "tools", "adb.exe")
        };

        foreach (var path in standardPaths)
        {
            if (File.Exists(path))
            {
                _adbPath = path;
                _missingBinaryWarned = false;
                Log($"Auto-discovered ADB binary at: {_adbPath}");
                return true;
            }
        }

        // 3. Fallback to system adb if available
        if (IsInSystemPath("adb.exe"))
        {
            _adbPath = "adb.exe";
            _missingBinaryWarned = false;
            return true;
        }

        return false;
    }

    public async Task<bool> StartServerAsync()
    {
        if (!HasAdbBinary)
            return false;

        var result = await ExecuteAdbCommandAsync("start-server");
        IsServerRunning = result.ExitCode == 0;
        if (IsServerRunning)
            Log("ADB server started successfully.");
        return IsServerRunning;
    }

    public async Task<bool> KillServerAsync()
    {
        if (!HasAdbBinary)
            return false;

        var result = await ExecuteAdbCommandAsync("kill-server");
        IsServerRunning = result.ExitCode != 0;
        ConnectedDevice = null;
        DeviceStateChanged?.Invoke(null);
        Log("ADB server stopped.");
        return result.ExitCode == 0;
    }

    public async Task<bool> AutoConnectAsync()
    {
        if (!HasAdbBinary)
        {
            if (!_missingBinaryWarned)
            {
                Log("[ADB] No ADB binary found on system or in emulator folder. ADB auto-sync paused.");
                _missingBinaryWarned = true;
            }
            return false;
        }

        // Check if any device is already connected
        var devices = await RefreshDevicesAsync();
        if (ConnectedDevice is not null)
            return true;

        // Try user specified target port first
        if (_targetPort > 0)
        {
            if (await ConnectDeviceAsync("127.0.0.1", _targetPort))
                return true;
        }

        // Scan known ports
        foreach (var port in KnownEmulatorPorts)
        {
            if (port == _targetPort) continue;
            var connected = await ConnectDeviceAsync("127.0.0.1", port);
            if (connected)
            {
                _targetPort = port;
                Log($"Successfully auto-connected on 127.0.0.1:{port}");
                return true;
            }
        }

        return false;
    }

    public async Task<bool> ConnectDeviceAsync(string ip = "127.0.0.1", int port = 5555)
    {
        if (!HasAdbBinary || string.IsNullOrWhiteSpace(ip) || port is < 1 or > 65535)
            return false;

        var target = $"{ip}:{port}";
        var result = await ExecuteAdbCommandAsync($"connect {target}");
        if (result.ExitCode == 0 &&
            (result.Output.Contains("connected to", StringComparison.OrdinalIgnoreCase) ||
             result.Output.Contains("already connected", StringComparison.OrdinalIgnoreCase)))
        {
            await RefreshDevicesAsync();
            return ConnectedDevice is not null;
        }

        return false;
    }

    public async Task<List<AdbDevice>> RefreshDevicesAsync()
    {
        var devices = new List<AdbDevice>();
        if (!HasAdbBinary)
            return devices;

        var result = await ExecuteAdbCommandAsync("devices -l");
        if (result.ExitCode == 0)
        {
            foreach (var line in result.Output.Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries))
            {
                if (line.StartsWith("List of devices", StringComparison.OrdinalIgnoreCase))
                    continue;

                var match = Regex.Match(line.Trim(), @"^(\S+)\s+(\S+)(.*)$");
                if (!match.Success)
                    continue;

                var modelMatch = Regex.Match(match.Groups[3].Value, @"\bmodel:(\S+)");
                devices.Add(new AdbDevice
                {
                    Serial = match.Groups[1].Value,
                    State = match.Groups[2].Value,
                    Model = modelMatch.Success ? modelMatch.Groups[1].Value : "Generic Emulator"
                });
            }
        }

        var prev = ConnectedDevice;
        ConnectedDevice = devices.FirstOrDefault(device =>
            string.Equals(device.State, "device", StringComparison.OrdinalIgnoreCase));

        if (ConnectedDevice != null && prev?.Serial != ConnectedDevice.Serial)
            Log($"Active ADB device hooked: {ConnectedDevice.Serial} ({ConnectedDevice.Model})");

        DeviceStateChanged?.Invoke(ConnectedDevice);
        return devices;
    }

    public async Task<bool> SetResolutionAsync(int width, int height)
    {
        if (width <= 0 || height <= 0)
            return false;

        return await RunDeviceCommandAsync($"wm size {width}x{height}", $"Set resolution ({width}x{height})");
    }

    public Task<bool> ResetResolutionAsync() => RunDeviceCommandAsync("wm size reset", "Reset resolution");

    public async Task<bool> SetDpiAsync(int dpi)
    {
        if (dpi <= 0)
            return false;

        return await RunDeviceCommandAsync($"wm density {dpi}", $"Set density ({dpi} DPI)");
    }

    public Task<bool> ResetDpiAsync() => RunDeviceCommandAsync("wm density reset", "Reset density");

    public async Task<bool> BoostFpsAsync(int targetFps = 90)
    {
        if (ConnectedDevice is null)
            return false;

        Log($"Applying ADB FPS Boost ({targetFps} FPS)...");
        var commands = new[]
        {
            $"setprop debug.sf.fps {targetFps}",
            $"setprop debug.fps {targetFps}",
            $"setprop debug.gr.swapinterval 0",
            $"settings put system peak_refresh_rate {targetFps}.0",
            $"settings put system min_refresh_rate {targetFps}.0"
        };

        var allOk = true;
        foreach (var cmd in commands)
        {
            var res = await ExecuteShellCommandAsync(cmd);
            if (res.ExitCode != 0)
                allOk = false;
        }

        Log($"FPS Boost to {targetFps} FPS applied: {(allOk ? "Success" : "Partial")}");
        return allOk;
    }

    public async Task<bool> TapAsync(int x, int y)
    {
        return await RunDeviceCommandAsync($"input tap {x} {y}", $"Tap at ({x}, {y})");
    }

    public async Task<bool> SwipeAsync(int x1, int y1, int x2, int y2, int durationMs = 150)
    {
        return await RunDeviceCommandAsync($"input swipe {x1} {y1} {x2} {y2} {durationMs}", $"Swipe ({x1},{y1}) -> ({x2},{y2})");
    }

    public async Task<bool> SendKeyEventAsync(int keyCode)
    {
        return await RunDeviceCommandAsync($"input keyevent {keyCode}", $"Key event {keyCode}");
    }

    public async Task<bool> SendTextAsync(string text)
    {
        return await RunDeviceCommandAsync($"input text \"{text}\"", $"Send text");
    }

    public async Task<string> GetPackageListAsync()
    {
        if (ConnectedDevice is null)
            return string.Empty;

        var result = await ExecuteShellCommandAsync("pm list packages -3");
        return result.Output;
    }

    public async Task<bool> ForceStopAppAsync(string packageName)
    {
        if (ConnectedDevice is null || !Regex.IsMatch(packageName, "^[A-Za-z0-9_.]+$"))
            return false;

        var result = await ExecuteShellCommandAsync($"am force-stop {packageName}");
        return result.ExitCode == 0;
    }

    public Task<(int ExitCode, string Output, string Error)> ExecuteShellCommandAsync(string shellCommand)
    {
        return ConnectedDevice is null
            ? Task.FromResult((-1, string.Empty, "No device connected"))
            : ExecuteAdbCommandAsync($"-s {ConnectedDevice.Serial} shell {shellCommand}");
    }

    public async Task<(int ExitCode, string Output, string Error)> ExecuteAdbCommandAsync(string arguments)
    {
        if (!HasAdbBinary)
        {
            if (!_missingBinaryWarned)
            {
                Log("[ADB] No ADB binary found. Skipping ADB commands.");
                _missingBinaryWarned = true;
            }
            return (-1, string.Empty, "ADB binary not found");
        }

        try
        {
            using var process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    FileName = _adbPath,
                    Arguments = arguments,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                }
            };

            process.Start();
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            var outputTask = process.StandardOutput.ReadToEndAsync(cts.Token);
            var errorTask = process.StandardError.ReadToEndAsync(cts.Token);
            await process.WaitForExitAsync(cts.Token);
            var output = await outputTask;
            var error = await errorTask;
            return (process.ExitCode, output.Trim(), error.Trim());
        }
        catch (Exception ex) when (ex is InvalidOperationException or System.ComponentModel.Win32Exception or IOException or OperationCanceledException)
        {
            if (!_missingBinaryWarned)
            {
                Log($"[ADB] Execution error ({arguments}): {ex.Message}");
                _missingBinaryWarned = true;
            }
            return (-1, string.Empty, ex.Message);
        }
    }

    private async Task<bool> RunDeviceCommandAsync(string command, string description)
    {
        if (ConnectedDevice is null)
            return false;

        var result = await ExecuteShellCommandAsync(command);
        var succeeded = result.ExitCode == 0;
        Log($"{description}: {(succeeded ? "success" : "failed")}");
        return succeeded;
    }

    private static bool IsInSystemPath(string fileName)
    {
        if (File.Exists(fileName)) return true;
        var pathEnv = Environment.GetEnvironmentVariable("PATH");
        if (string.IsNullOrEmpty(pathEnv)) return false;
        return pathEnv.Split(';').Any(dir => {
            try { return File.Exists(Path.Combine(dir.Trim(), fileName)); } catch { return false; }
        });
    }

    private void Log(string message) => LogMessage?.Invoke($"[ADB] {DateTime.Now:HH:mm:ss} - {message}");
}
