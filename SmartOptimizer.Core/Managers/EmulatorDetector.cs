using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using Microsoft.Win32;

namespace SmartOptimizer.Core.Managers;

public enum EmulatorType
{
    Unknown,
    BlueStacks,
    MSIAppPlayer,
    LDPlayer,
    NoxPlayer,
    MEmu,
    Gameloop,
    MuMu,
    Custom
}

public sealed class InstalledEmulatorInfo
{
    public string Name { get; init; } = string.Empty;
    public string Version { get; init; } = "Unknown";
    public string ExecutablePath { get; init; } = string.Empty;
    public EmulatorType Type { get; init; }
}

public sealed class EmulatorProcessInfo
{
    public int ProcessId { get; init; }
    public string ProcessName { get; init; } = string.Empty;
    public string MainModulePath { get; init; } = string.Empty;
    public IntPtr MainWindowHandle { get; set; }
    public EmulatorType Type { get; init; }
    public Rectangle WindowBounds { get; set; }
    public bool IsRunning { get; set; }
}

public sealed class EmulatorDetector : IDisposable
{
    private delegate bool EnumWindowsCallback(IntPtr hWnd, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    private struct Rect
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool EnumWindows(EnumWindowsCallback callback, IntPtr lParam);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool GetWindowRect(IntPtr hWnd, out Rect rect);

    [DllImport("user32.dll")]
    private static extern bool IsWindowVisible(IntPtr hWnd);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

    [DllImport("psapi.dll")]
    private static extern bool EmptyWorkingSet(IntPtr hProcess);

    private readonly Dictionary<string, EmulatorType> _knownProcessMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["HD-Player"] = EmulatorType.BlueStacks,
        ["BlueStacks"] = EmulatorType.BlueStacks,
        ["dnplayer"] = EmulatorType.LDPlayer,
        ["LdVBoxHeadless"] = EmulatorType.LDPlayer,
        ["dnmultiplayer"] = EmulatorType.LDPlayer,
        ["Nox"] = EmulatorType.NoxPlayer,
        ["NoxVMHandle"] = EmulatorType.NoxPlayer,
        ["MEmu"] = EmulatorType.MEmu,
        ["MEmuHeadless"] = EmulatorType.MEmu,
        ["AndroidEmulator"] = EmulatorType.Gameloop,
        ["AndroidEmulatorEn"] = EmulatorType.Gameloop,
        ["AppMarket"] = EmulatorType.Gameloop,
        ["NemuHeadless"] = EmulatorType.MuMu,
        ["MuMuPlayer"] = EmulatorType.MuMu,
        ["MuMuNxPlayer"] = EmulatorType.MuMu
    };

    private readonly object _stateLock = new();
    private CancellationTokenSource? _monitorCts;
    private Task? _monitorTask;
    private bool _disposed;

    public EmulatorProcessInfo? ActiveEmulator { get; private set; }

    public event Action<EmulatorProcessInfo>? EmulatorDetected;
    public event Action<EmulatorProcessInfo>? EmulatorExited;
    public event Action<Rectangle>? BoundsChanged;
    public event Action<string>? LogMessage;

    public EmulatorDetector(Dictionary<string, EmulatorType>? customMappings = null)
    {
        if (customMappings is null)
            return;

        foreach (var mapping in customMappings)
            _knownProcessMap[mapping.Key] = mapping.Value;
    }

    public List<InstalledEmulatorInfo> ScanInstalledEmulators(IEnumerable<InstalledEmulatorInfo>? customEmulators = null)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);

        var found = new List<InstalledEmulatorInfo>();
        Log("Scanning Windows Registry for installed emulators...");

        // LDPlayer 9 / 64 / 4
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\dnplayer", "path", "version", "LDPlayer 9", "dnplayer.exe", EmulatorType.LDPlayer);
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\LDPlayer64", "path", "version", "LDPlayer 64", "dnplayer.exe", EmulatorType.LDPlayer);
        ScanRegistryPath(found, RegistryHive.CurrentUser, @"SOFTWARE\dnplayer", "path", "version", "LDPlayer", "dnplayer.exe", EmulatorType.LDPlayer);
        ScanRegistryPath(found, RegistryHive.CurrentUser, @"SOFTWARE\dnplayer9", "path", "version", "LDPlayer 9", "dnplayer.exe", EmulatorType.LDPlayer);

        // BlueStacks 5 & Classic
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\BlueStacks_nxt", "InstallDir", "Version", "BlueStacks 5", "HD-Player.exe", EmulatorType.BlueStacks);
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\BlueStacks", "InstallDir", "Version", "BlueStacks Classic", "HD-Player.exe", EmulatorType.BlueStacks);
        ScanRegistryPath(found, RegistryHive.CurrentUser, @"SOFTWARE\BlueStacks_nxt", "InstallDir", "Version", "BlueStacks 5 (User)", "HD-Player.exe", EmulatorType.BlueStacks);

        // MSI App Player
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\MSI_nxt", "InstallDir", "Version", "MSI App Player", "HD-Player.exe", EmulatorType.MSIAppPlayer);
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\MSI", "InstallDir", "Version", "MSI App Player Classic", "HD-Player.exe", EmulatorType.MSIAppPlayer);

        // Gameloop / Tencent
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\WOW6432Node\Tencent\MobileGamePC", "InstallPath", "Version", "Gameloop", @"AppMarket\AppMarket.exe", EmulatorType.Gameloop);
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\Tencent\MobileGamePC", "InstallPath", "Version", "Gameloop", @"AppMarket\AppMarket.exe", EmulatorType.Gameloop);

        // NoxPlayer
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\Nox", "InstallDir", "Version", "NoxPlayer", @"bin\Nox.exe", EmulatorType.NoxPlayer);
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\WOW6432Node\Nox", "InstallDir", "Version", "NoxPlayer", @"bin\Nox.exe", EmulatorType.NoxPlayer);

        // MEmu Play
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\Microvirt\MEmu", "InstallDir", "Version", "MEmu Play", @"MEmu\MEmu.exe", EmulatorType.MEmu);
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\WOW6432Node\Microvirt\MEmu", "InstallDir", "Version", "MEmu Play", @"MEmu\MEmu.exe", EmulatorType.MEmu);

        // MuMu Player
        ScanRegistryPath(found, RegistryHive.LocalMachine, @"SOFTWARE\Netease\MuMuPlayer", "InstallDir", "Version", "MuMu Player", @"nx_main\MuMuNxPlayer.exe", EmulatorType.MuMu);

        if (customEmulators != null)
        {
            foreach (var custom in customEmulators)
            {
                if (!string.IsNullOrWhiteSpace(custom.ExecutablePath) && File.Exists(custom.ExecutablePath))
                {
                    found.Add(custom);
                    var procName = Path.GetFileNameWithoutExtension(custom.ExecutablePath);
                    if (!string.IsNullOrWhiteSpace(procName))
                        _knownProcessMap[procName] = custom.Type;
                }
            }
        }

        // Deduplicate
        var unique = found
            .GroupBy(item => Path.GetFullPath(item.ExecutablePath), StringComparer.OrdinalIgnoreCase)
            .Select(group => group.First())
            .ToList();

        foreach (var emu in unique)
        {
            var pName = Path.GetFileNameWithoutExtension(emu.ExecutablePath);
            if (!string.IsNullOrWhiteSpace(pName) && !_knownProcessMap.ContainsKey(pName))
                _knownProcessMap[pName] = emu.Type;
        }

        Log($"Emulator scan completed. Found {unique.Count} installed/custom emulator(s).");
        return unique;
    }

    public void RegisterTargetProcess(string processName)
    {
        if (string.IsNullOrWhiteSpace(processName)) return;
        var clean = Path.GetFileNameWithoutExtension(processName);
        _knownProcessMap[clean] = EmulatorType.Custom;
        Log($"Registered custom target process: {clean}");
    }

    public bool LaunchEmulator(string executablePath)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        if (string.IsNullOrWhiteSpace(executablePath) || !File.Exists(executablePath))
        {
            Log($"Launch failed; executable not found: {executablePath}");
            return false;
        }

        try
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = executablePath,
                WorkingDirectory = Path.GetDirectoryName(executablePath) ?? string.Empty,
                UseShellExecute = true
            });
            Log($"Launched emulator: {executablePath}");
            return true;
        }
        catch (Exception ex) when (ex is InvalidOperationException or System.ComponentModel.Win32Exception or IOException)
        {
            Log($"Launch failed: {ex.Message}");
            return false;
        }
    }

    public EmulatorProcessInfo? ScanNow()
    {
        ObjectDisposedException.ThrowIf(_disposed, this);

        foreach (var mapping in _knownProcessMap)
        {
            foreach (var process in Process.GetProcessesByName(mapping.Key))
            {
                using (process)
                {
                    try
                    {
                        if (process.HasExited)
                            continue;

                        var windowHandle = process.MainWindowHandle;
                        if (windowHandle == IntPtr.Zero)
                            windowHandle = FindWindowForProcess(process.Id);

                        var info = new EmulatorProcessInfo
                        {
                            ProcessId = process.Id,
                            ProcessName = process.ProcessName,
                            MainModulePath = GetProcessPathSafe(process),
                            MainWindowHandle = windowHandle,
                            Type = mapping.Value,
                            WindowBounds = GetWindowBounds(windowHandle),
                            IsRunning = true
                        };

                        SetActiveEmulator(info);
                        Log($"Detected: {info.ProcessName} (PID: {info.ProcessId}, Type: {info.Type})");
                        EmulatorDetected?.Invoke(info);
                        return info;
                    }
                    catch (Exception ex) when (ex is InvalidOperationException or System.ComponentModel.Win32Exception or SystemException)
                    {
                        Log($"Scan error on PID {process.Id}: {ex.Message}");
                    }
                }
            }
        }

        EmulatorProcessInfo? exited;
        lock (_stateLock)
        {
            exited = ActiveEmulator;
            ActiveEmulator = null;
        }

        if (exited is not null)
        {
            exited.IsRunning = false;
            EmulatorExited?.Invoke(exited);
        }

        return null;
    }

    public void StartMonitoring(int intervalMs = 1500)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        if (intervalMs < 1)
            throw new ArgumentOutOfRangeException(nameof(intervalMs));

        lock (_stateLock)
        {
            if (_monitorTask is { IsCompleted: false })
                return;

            _monitorCts?.Dispose();
            _monitorCts = new CancellationTokenSource();
            _monitorTask = MonitorAsync(_monitorCts.Token, intervalMs);
        }
    }

    public void StopMonitoring()
    {
        CancellationTokenSource? cts;
        lock (_stateLock)
        {
            cts = _monitorCts;
            _monitorCts = null;
        }

        cts?.Cancel();
        cts?.Dispose();
        Log("Emulator lifecycle monitor stopped.");
    }

    public bool SetProcessPriority(ProcessPriorityClass priority)
    {
        var emulator = ActiveEmulator;
        if (emulator is null)
            return false;

        try
        {
            using var process = Process.GetProcessById(emulator.ProcessId);
            process.PriorityClass = priority;
            Log($"Priority set to {priority} for PID: {emulator.ProcessId}");
            return true;
        }
        catch (Exception ex) when (ex is InvalidOperationException or System.ComponentModel.Win32Exception or ArgumentException)
        {
            Log($"Failed to set priority: {ex.Message}");
            return false;
        }
    }

    public bool SetProcessAffinity(long affinityMask)
    {
        var emulator = ActiveEmulator;
        if (emulator is null || affinityMask <= 0)
            return false;

        try
        {
            using var process = Process.GetProcessById(emulator.ProcessId);
            process.ProcessorAffinity = (IntPtr)affinityMask;
            Log($"Affinity mask set to 0x{affinityMask:X} for PID: {emulator.ProcessId}");
            return true;
        }
        catch (Exception ex) when (ex is InvalidOperationException or System.ComponentModel.Win32Exception or ArgumentException)
        {
            Log($"Failed to set affinity: {ex.Message}");
            return false;
        }
    }

    public bool OptimizeMemoryWorkingSet()
    {
        var emulator = ActiveEmulator;
        if (emulator is null)
            return false;

        try
        {
            using var process = Process.GetProcessById(emulator.ProcessId);
            var before = process.WorkingSet64 / (1024 * 1024);
            var success = EmptyWorkingSet(process.Handle);
            process.Refresh();
            var after = process.WorkingSet64 / (1024 * 1024);
            Log($"Memory optimization: {before} MB -> {after} MB (Freed {Math.Max(0, before - after)} MB)");
            return success;
        }
        catch (Exception ex)
        {
            Log($"Failed to optimize memory: {ex.Message}");
            return false;
        }
    }

    public void Dispose()
    {
        if (_disposed)
            return;

        StopMonitoring();
        _disposed = true;
        GC.SuppressFinalize(this);
    }

    private async Task MonitorAsync(CancellationToken cancellationToken, int intervalMs)
    {
        Log("Emulator lifecycle monitor started.");
        try
        {
            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();
                var emulator = ActiveEmulator;
                if (emulator is null)
                {
                    ScanNow();
                }
                else if (!IsProcessAlive(emulator.ProcessId))
                {
                    lock (_stateLock)
                    {
                        if (ReferenceEquals(ActiveEmulator, emulator))
                            ActiveEmulator = null;
                    }

                    emulator.IsRunning = false;
                    Log($"Emulator exited: {emulator.ProcessName} (PID: {emulator.ProcessId})");
                    EmulatorExited?.Invoke(emulator);
                }
                else
                {
                    var currentBounds = GetWindowBounds(emulator.MainWindowHandle);
                    if (currentBounds != emulator.WindowBounds)
                    {
                        emulator.WindowBounds = currentBounds;
                        BoundsChanged?.Invoke(currentBounds);
                    }
                }

                await Task.Delay(intervalMs, cancellationToken).ConfigureAwait(false);
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            Log($"Monitoring exception: {ex.Message}");
        }
    }

    private void SetActiveEmulator(EmulatorProcessInfo info)
    {
        lock (_stateLock)
            ActiveEmulator = info;
    }

    private void ScanRegistryPath(
        List<InstalledEmulatorInfo> found,
        RegistryHive hive,
        string subKey,
        string pathValueName,
        string versionValueName,
        string displayName,
        string executableRelativePath,
        EmulatorType type)
    {
        foreach (var view in new[] { RegistryView.Registry64, RegistryView.Registry32 })
        {
            try
            {
                using var baseKey = RegistryKey.OpenBaseKey(hive, view);
                using var key = baseKey.OpenSubKey(subKey);
                var installDirectory = key?.GetValue(pathValueName) as string;
                if (string.IsNullOrWhiteSpace(installDirectory) || !Directory.Exists(installDirectory))
                    continue;

                var executablePath = Path.GetFullPath(Path.Combine(installDirectory, executableRelativePath));
                if (!File.Exists(executablePath))
                    continue;

                var version = key?.GetValue(versionValueName) as string;
                if (string.IsNullOrWhiteSpace(version))
                    version = FileVersionInfo.GetVersionInfo(executablePath).FileVersion;

                found.Add(new InstalledEmulatorInfo
                {
                    Name = displayName,
                    Version = string.IsNullOrWhiteSpace(version) ? "Unknown" : version,
                    ExecutablePath = executablePath,
                    Type = type
                });
            }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException or System.Security.SecurityException)
            {
                Log($"Registry scan skipped for {displayName} ({view}): {ex.Message}");
            }
        }
    }

    private static Rectangle GetWindowBounds(IntPtr windowHandle)
    {
        return windowHandle != IntPtr.Zero && GetWindowRect(windowHandle, out var rect)
            ? new Rectangle(rect.Left, rect.Top, Math.Max(0, rect.Right - rect.Left), Math.Max(0, rect.Bottom - rect.Top))
            : Rectangle.Empty;
    }

    private static IntPtr FindWindowForProcess(int processId)
    {
        var result = IntPtr.Zero;
        EnumWindows((windowHandle, _) =>
        {
            if (!IsWindowVisible(windowHandle))
                return true;

            GetWindowThreadProcessId(windowHandle, out var ownerProcessId);
            if (ownerProcessId != processId)
                return true;

            result = windowHandle;
            return false;
        }, IntPtr.Zero);
        return result;
    }

    private static bool IsProcessAlive(int processId)
    {
        try
        {
            using var process = Process.GetProcessById(processId);
            return !process.HasExited;
        }
        catch (ArgumentException)
        {
            return false;
        }
    }

    private static string GetProcessPathSafe(Process process)
    {
        try
        {
            return process.MainModule?.FileName ?? string.Empty;
        }
        catch (Exception)
        {
            return string.Empty;
        }
    }

    private void Log(string message) => LogMessage?.Invoke($"[Detector] {DateTime.Now:HH:mm:ss} - {message}");
}