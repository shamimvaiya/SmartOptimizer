using System.Diagnostics;
using System.Runtime.InteropServices;
using SmartOptimizer.Core.Managers;

namespace SmartOptimizer.Core.Engines;

public sealed class TelemetryData
{
    public float CpuPercentage { get; set; }
    public long RamUsageMb { get; set; }
    public string EmulatorStatus { get; set; } = "NOT DETECTED";
    public string AdbStatus { get; set; } = "DISCONNECTED";
    public bool IsEmulatorRunning { get; set; }
    public bool IsAdbConnected { get; set; }
    public bool IsEngineActive { get; set; }
}

public sealed class BackgroundEngine : IDisposable
{
    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetSystemTimes(out long idleTime, out long kernelTime, out long userTime);

    public EmulatorDetector Detector { get; }
    public ADBManager Adb { get; }
    public PresetManager Presets { get; }
    public ExecutionManager Execution { get; }

    private readonly object _stateLock = new();
    private CancellationTokenSource? _backgroundCts;
    private Task? _backgroundTask;
    private long _prevIdleTime;
    private long _prevKernelTime;
    private long _prevUserTime;
    private bool _initialized;
    private bool _disposed;

    public bool IsRunning { get; private set; }

    public event Action<string>? LogMessage;
    public event Action<string, bool>? StatusUpdated;
    public event Action<TelemetryData>? TelemetryUpdated;

    public BackgroundEngine(string? baseConfigDirectory = null)
    {
        Presets = new PresetManager(baseConfigDirectory);
        Detector = new EmulatorDetector();
        Adb = new ADBManager();
        Execution = new ExecutionManager(Adb);

        Detector.EmulatorDetected += OnEmulatorDetected;
        Detector.EmulatorExited += OnEmulatorExited;
        Detector.LogMessage += message => Log(message);
        Adb.LogMessage += message => Log(message);
        Presets.LogMessage += message => Log(message);
        Execution.LogMessage += message => Log(message);

        GetSystemTimes(out _prevIdleTime, out _prevKernelTime, out _prevUserTime);
    }

    public async Task InitializeAsync()
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        if (_initialized)
            return;

        Log("Initializing Background Engine & Subsystems...");
        await Presets.InitializeAsync().ConfigureAwait(false);
        await Adb.StartServerAsync().ConfigureAwait(false);
        _initialized = true;
        Log("Background Engine initialized successfully.");
    }

    public Task StartEngineAsync()
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        lock (_stateLock)
        {
            if (IsRunning)
                return Task.CompletedTask;

            IsRunning = true;
            _backgroundCts = new CancellationTokenSource();
            Detector.StartMonitoring(GetMonitorInterval());
            _backgroundTask = BackgroundWorkerAsync(_backgroundCts.Token);
        }

        Log("Background worker and monitoring started.");
        StatusUpdated?.Invoke("System Engine Active", true);
        return Task.CompletedTask;
    }

    public void StopEngine()
    {
        CancellationTokenSource? cts;
        lock (_stateLock)
        {
            if (!IsRunning)
                return;

            IsRunning = false;
            cts = _backgroundCts;
            _backgroundCts = null;
        }

        Log("Stopping background engine...");
        Detector.StopMonitoring();
        Execution.StopExecution();
        cts?.Cancel();
        cts?.Dispose();
        StatusUpdated?.Invoke("System Engine Idle", false);
        Log("Background engine stopped.");
    }

    public async Task<bool> ApplyPresetAsync(string presetName)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        var preset = await Presets.LoadPresetAsync(presetName).ConfigureAwait(false);
        if (preset is null)
            return false;

        Log($"Applying preset profile: {presetName}");
        var emulator = Detector.ActiveEmulator;
        if (emulator is not null)
            ApplyProcessOptimizations(emulator, preset);

        if (Adb.ConnectedDevice is not null)
        {
            await Adb.SetResolutionAsync(preset.Display.Width, preset.Display.Height).ConfigureAwait(false);
            await Adb.SetDpiAsync(preset.Display.Dpi).ConfigureAwait(false);
            if (preset.Performance.AutoBoostFpsOnLaunch)
                await Adb.BoostFpsAsync(preset.Performance.TargetFps).ConfigureAwait(false);
        }

        return true;
    }

    public async Task<bool> OptimizeMemoryAsync()
    {
        return await Task.Run(() => Detector.OptimizeMemoryWorkingSet()).ConfigureAwait(false);
    }

    public void Dispose()
    {
        if (_disposed)
            return;

        StopEngine();
        Detector.EmulatorDetected -= OnEmulatorDetected;
        Detector.EmulatorExited -= OnEmulatorExited;
        Detector.Dispose();
        Execution.Dispose();
        _disposed = true;
        GC.SuppressFinalize(this);
    }

    private async Task BackgroundWorkerAsync(CancellationToken cancellationToken)
    {
        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                // Auto connect ADB if emulator is detected
                if (Detector.ActiveEmulator is not null && Adb.ConnectedDevice is null)
                {
                    await Adb.AutoConnectAsync().ConfigureAwait(false);
                }

                // Collect and send telemetry
                var telemetry = CollectTelemetry();
                TelemetryUpdated?.Invoke(telemetry);

                await Task.Delay(1000, cancellationToken).ConfigureAwait(false);
            }
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            Log($"Background worker exception: {ex.Message}");
        }
    }

    private TelemetryData CollectTelemetry()
    {
        var cpu = CalculateCpuUsage();

        long ram = 0;
        try
        {
            if (Detector.ActiveEmulator is not null)
            {
                using var p = Process.GetProcessById(Detector.ActiveEmulator.ProcessId);
                ram = p.WorkingSet64 / (1024 * 1024);
            }
            else
            {
                using var p = Process.GetCurrentProcess();
                ram = p.WorkingSet64 / (1024 * 1024);
            }
        }
        catch { }

        return new TelemetryData
        {
            CpuPercentage = (float)Math.Round(cpu, 1),
            RamUsageMb = ram,
            EmulatorStatus = Detector.ActiveEmulator is not null ? $"ACTIVE ({Detector.ActiveEmulator.ProcessName})" : "NOT DETECTED",
            AdbStatus = Adb.ConnectedDevice is not null ? $"CONNECTED ({Adb.ConnectedDevice.Serial})" : "DISCONNECTED",
            IsEmulatorRunning = Detector.ActiveEmulator is not null,
            IsAdbConnected = Adb.ConnectedDevice is not null,
            IsEngineActive = IsRunning
        };
    }

    private float CalculateCpuUsage()
    {
        if (!GetSystemTimes(out var idleTime, out var kernelTime, out var userTime))
            return 0f;

        var usr = userTime - _prevUserTime;
        var ker = kernelTime - _prevKernelTime;
        var idl = idleTime - _prevIdleTime;

        var sys = ker + usr;
        _prevIdleTime = idleTime;
        _prevKernelTime = kernelTime;
        _prevUserTime = userTime;

        if (sys <= 0)
            return 0f;

        var cpu = (float)((sys - idl) * 100.0 / sys);
        return Math.Clamp(cpu, 0f, 100f);
    }

    private async void OnEmulatorDetected(EmulatorProcessInfo info)
    {
        try
        {
            Log($"[AUTO-HOOK] Emulator detected: {info.ProcessName} (PID: {info.ProcessId})");
            StatusUpdated?.Invoke($"Emulator Connected: {info.ProcessName}", true);

            // Automatically check and use emulator's local ADB binary
            Adb.AutoDiscoverAdb(info.MainModulePath);

            var preset = Presets.ActivePreset;
            if (preset is not null)
            {
                if (preset.Emulator.AdbPort > 0)
                    Adb.SetPort(preset.Emulator.AdbPort);
                ApplyProcessOptimizations(info, preset);
            }

            if (await Adb.AutoConnectAsync().ConfigureAwait(false))
            {
                if (preset is not null)
                {
                    await Adb.SetResolutionAsync(preset.Display.Width, preset.Display.Height).ConfigureAwait(false);
                    await Adb.SetDpiAsync(preset.Display.Dpi).ConfigureAwait(false);
                    if (preset.Performance.AutoBoostFpsOnLaunch)
                        await Adb.BoostFpsAsync(preset.Performance.TargetFps).ConfigureAwait(false);
                }
            }
        }
        catch (Exception ex)
        {
            Log($"Emulator detected handler error: {ex.Message}");
        }
    }

    private void OnEmulatorExited(EmulatorProcessInfo info)
    {
        Log($"[AUTO-HOOK] Emulator closed: {info.ProcessName}.");
        StatusUpdated?.Invoke("Emulator Disconnected", false);
        Execution.StopExecution();
    }

    public void ApplyProcessOptimizations(EmulatorProcessInfo info, PresetProfile preset)
    {
        if (Enum.TryParse<ProcessPriorityClass>(preset.Emulator.PriorityClass, true, out var priority))
            Detector.SetProcessPriority(priority);

        if (preset.Performance.EnableCpuAffinity && preset.Emulator.AffinityMask > 0)
            Detector.SetProcessAffinity(preset.Emulator.AffinityMask);
    }

    private int GetMonitorInterval()
    {
        var interval = Presets.ActivePreset?.Performance.MonitorIntervalMs ?? 1000;
        return Math.Clamp(interval, 250, 60_000);
    }

    private void Log(string message) => LogMessage?.Invoke(message);
}
