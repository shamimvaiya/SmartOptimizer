using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Windows;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using SmartOptimizer.Core.Engines;
using SmartOptimizer.Core.Managers;

namespace SmartOptimizer.UI.ViewModels;

public sealed partial class CpuCoreItem : ObservableObject
{
    [ObservableProperty]
    private int _coreIndex;

    [ObservableProperty]
    private string _displayName = string.Empty;

    [ObservableProperty]
    private bool _isSelected = true;
}

public sealed partial class MainViewModel : ObservableObject, IDisposable
{
    private readonly BackgroundEngine _engine;
    private bool _disposed;

    public BackgroundEngine Engine => _engine;

    // Telemetry & Status
    [ObservableProperty]
    private string _emulatorStatusText = "NOT DETECTED";

    [ObservableProperty]
    private bool _isEmulatorDetected;

    [ObservableProperty]
    private string _adbStatusText = "DISCONNECTED";

    [ObservableProperty]
    private bool _isAdbConnected;

    [ObservableProperty]
    private string _engineStatusText = "IDLE";

    [ObservableProperty]
    private bool _isEngineActive;

    [ObservableProperty]
    private float _cpuPercentage;

    [ObservableProperty]
    private long _ramUsageMb;

    // Navigation
    [ObservableProperty]
    private string _currentPage = "Dashboard";

    [ObservableProperty]
    private string _pageTitle = "Dashboard";

    // Presets
    [ObservableProperty]
    private ObservableCollection<string> _availablePresets = new();

    [ObservableProperty]
    private string _selectedPreset = string.Empty;

    // Installed Emulators
    [ObservableProperty]
    private ObservableCollection<InstalledEmulatorInfo> _installedEmulators = new();

    [ObservableProperty]
    private InstalledEmulatorInfo? _selectedInstalledEmulator;

    // ADB Port Configuration
    [ObservableProperty]
    private int _adbPort = 5555;

    // Performance Tweaks
    [ObservableProperty]
    private ObservableCollection<string> _availablePriorities = new() { "Normal", "AboveNormal", "High", "RealTime" };

    [ObservableProperty]
    private string _selectedPriority = "High";

    [ObservableProperty]
    private bool _enableCpuAffinity = true;

    [ObservableProperty]
    private ObservableCollection<CpuCoreItem> _cpuCores = new();

    [ObservableProperty]
    private int _targetFps = 90;

    [ObservableProperty]
    private int _displayDpi = 240;

    // Overlay & Settings
    [ObservableProperty]
    private string _overlayHotkey = "HOME";

    [ObservableProperty]
    private bool _overlayAutoHide = true;

    [ObservableProperty]
    private double _overlayTransparency = 0.90;

    [ObservableProperty]
    private string _targetProcessOverride = "HD-Player.exe";

    // Logs
    [ObservableProperty]
    private ObservableCollection<string> _logs = new();

    public event Action<string, bool>? OverlayStatusUpdated;
    public event Action<string>? OverlayPresetUpdated;

    public MainViewModel()
    {
        _engine = new BackgroundEngine();

        _engine.LogMessage += AddLog;
        _engine.StatusUpdated += OnEngineStatusUpdated;
        _engine.TelemetryUpdated += OnTelemetryUpdated;
        _engine.Detector.EmulatorDetected += OnEmulatorDetected;
        _engine.Detector.EmulatorExited += OnEmulatorExited;

        InitializeCpuCores();
    }

    public async Task InitializeAsync()
    {
        AddLog("[System] Initializing SmartOptimizer Core Engine...");
        await _engine.InitializeAsync();
        RefreshPresets();
        RefreshInstalledEmulators();
        LoadCurrentPresetIntoUi();
        AddLog("[System] Engine initialized and ready.");
    }

    private void InitializeCpuCores()
    {
        CpuCores.Clear();
        var coreCount = Environment.ProcessorCount;
        for (var i = 0; i < coreCount; i++)
        {
            CpuCores.Add(new CpuCoreItem
            {
                CoreIndex = i,
                DisplayName = $"Core {i}",
                IsSelected = true
            });
        }
    }

    public void RefreshPresets()
    {
        AvailablePresets.Clear();
        var presets = _engine.Presets.GetAvailablePresetNames();
        foreach (var p in presets)
            AvailablePresets.Add(p);

        if (!string.IsNullOrEmpty(_engine.Presets.GlobalSettings.ActivePresetName) &&
            AvailablePresets.Contains(_engine.Presets.GlobalSettings.ActivePresetName))
        {
            SelectedPreset = _engine.Presets.GlobalSettings.ActivePresetName;
        }
        else if (AvailablePresets.Count > 0)
        {
            SelectedPreset = AvailablePresets[0];
        }
        else
        {
            SelectedPreset = string.Empty;
        }
    }

    public void RefreshInstalledEmulators()
    {
        InstalledEmulators.Clear();
        var scanned = _engine.Detector.ScanInstalledEmulators(_engine.Presets.GlobalSettings.CustomEmulators);
        foreach (var emu in scanned)
            InstalledEmulators.Add(emu);

        if (InstalledEmulators.Count > 0 && SelectedInstalledEmulator == null)
            SelectedInstalledEmulator = InstalledEmulators[0];
    }

    public async Task AddCustomEmulatorAsync(string name, string executablePath)
    {
        if (string.IsNullOrWhiteSpace(executablePath) || !File.Exists(executablePath))
            return;

        var cleanName = string.IsNullOrWhiteSpace(name) ? Path.GetFileNameWithoutExtension(executablePath) : name.Trim();
        var emu = new InstalledEmulatorInfo
        {
            Name = cleanName,
            ExecutablePath = executablePath,
            Version = "Custom",
            Type = EmulatorType.Custom
        };

        await _engine.Presets.AddCustomEmulatorAsync(emu);
        _engine.Detector.RegisterTargetProcess(executablePath);
        _engine.Adb.AutoDiscoverAdb(executablePath);

        RefreshInstalledEmulators();
        SelectedInstalledEmulator = InstalledEmulators.FirstOrDefault(e => string.Equals(e.ExecutablePath, executablePath, StringComparison.OrdinalIgnoreCase));
        AddLog($"[Emulator] Added custom emulator: {cleanName}");
    }

    partial void OnSelectedInstalledEmulatorChanged(InstalledEmulatorInfo? value)
    {
        if (value != null && !string.IsNullOrWhiteSpace(value.ExecutablePath))
        {
            _engine.Adb.AutoDiscoverAdb(value.ExecutablePath);
            _engine.Detector.RegisterTargetProcess(value.ExecutablePath);
            TargetProcessOverride = Path.GetFileName(value.ExecutablePath);
        }
    }

    partial void OnAdbPortChanged(int value)
    {
        if (value is >= 1 and <= 65535)
        {
            _engine.Adb.SetPort(value);
            var active = _engine.Presets.ActivePreset;
            if (active != null)
                active.Emulator.AdbPort = value;
        }
    }

    private void LoadCurrentPresetIntoUi()
    {
        var active = _engine.Presets.ActivePreset;
        if (active == null) return;

        SelectedPriority = active.Emulator.PriorityClass;
        EnableCpuAffinity = active.Performance.EnableCpuAffinity;
        TargetFps = active.Performance.TargetFps;
        DisplayDpi = active.Display.Dpi;
        OverlayHotkey = active.Overlay.ToggleHotkey;
        OverlayAutoHide = active.Overlay.EnableAutoHide;
        OverlayTransparency = active.Overlay.Transparency;
        TargetProcessOverride = active.Emulator.ProcessName;
        AdbPort = active.Emulator.AdbPort > 0 ? active.Emulator.AdbPort : 5555;
        _engine.Adb.SetPort(AdbPort);

        // Apply affinity mask to checkboxes if specified
        if (active.Emulator.AffinityMask > 0)
        {
            for (var i = 0; i < CpuCores.Count; i++)
            {
                CpuCores[i].IsSelected = ((active.Emulator.AffinityMask >> i) & 1) == 1;
            }
        }
    }

    [RelayCommand]
    private async Task SwitchPresetAsync(string? presetName)
    {
        if (string.IsNullOrWhiteSpace(presetName))
            return;

        SelectedPreset = presetName;
        var loaded = await _engine.ApplyPresetAsync(presetName);
        if (loaded)
        {
            LoadCurrentPresetIntoUi();
            OverlayPresetUpdated?.Invoke(presetName);
            AddLog($"[Preset] Active preset switched to: {presetName}");
        }
    }

    [RelayCommand]
    private async Task InitializeSystemAsync()
    {
        if (!IsEngineActive)
        {
            AddLog("[Engine] Starting optimization engine and hooks...");
            await _engine.StartEngineAsync();
            EngineStatusText = "OPTIMIZED";
            IsEngineActive = true;
            OverlayStatusUpdated?.Invoke("System Active", true);
        }
        else
        {
            AddLog("[Engine] Stopping optimization engine...");
            _engine.StopEngine();
            EngineStatusText = "IDLE";
            IsEngineActive = false;
            OverlayStatusUpdated?.Invoke("System Idle", false);
        }
    }

    [RelayCommand]
    private void LaunchEmulator()
    {
        if (SelectedInstalledEmulator == null)
        {
            MessageBox.Show("Please select an emulator to launch.", "Launcher", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        AddLog($"[Launcher] Launching {SelectedInstalledEmulator.Name}...");
        _engine.Adb.AutoDiscoverAdb(SelectedInstalledEmulator.ExecutablePath);
        var launched = _engine.Detector.LaunchEmulator(SelectedInstalledEmulator.ExecutablePath);
        if (launched)
        {
            EmulatorStatusText = "STARTING...";
            AdbStatusText = "SYNCING...";
            OverlayStatusUpdated?.Invoke("Emulator Starting...", true);
        }
        else
        {
            MessageBox.Show($"Could not launch {SelectedInstalledEmulator.Name}. Path: {SelectedInstalledEmulator.ExecutablePath}", "Launch Failed", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private async Task ApplyPerformanceTweaksAsync()
    {
        AddLog("[Performance] Applying live performance tweaks...");
        var preset = _engine.Presets.ActivePreset;
        if (preset != null)
        {
            preset.Emulator.PriorityClass = SelectedPriority;
            preset.Performance.EnableCpuAffinity = EnableCpuAffinity;
            preset.Performance.TargetFps = TargetFps;
            preset.Display.Dpi = DisplayDpi;
            preset.Emulator.AdbPort = AdbPort;

            // Compute affinity mask
            long mask = 0;
            for (var i = 0; i < CpuCores.Count; i++)
            {
                if (CpuCores[i].IsSelected)
                    mask |= (1L << i);
            }
            preset.Emulator.AffinityMask = mask;
            preset.Emulator.ProcessName = TargetProcessOverride;
            preset.Overlay.ToggleHotkey = OverlayHotkey;
            preset.Overlay.EnableAutoHide = OverlayAutoHide;

            await _engine.Presets.SavePresetAsync(preset);

            if (_engine.Detector.ActiveEmulator != null)
                _engine.ApplyProcessOptimizations(_engine.Detector.ActiveEmulator, preset);

            if (_engine.Adb.ConnectedDevice != null)
            {
                await _engine.Adb.BoostFpsAsync(TargetFps);
                await _engine.Adb.SetDpiAsync(DisplayDpi);
            }

            AddLog($"[Performance] Tweaks applied and saved to profile '{preset.Name}'!");
        }
    }

    [RelayCommand]
    private async Task OptimizeMemoryAsync()
    {
        AddLog("[Memory] Flushing emulator working set memory...");
        var freed = await _engine.OptimizeMemoryAsync();
        AddLog(freed ? "[Memory] Memory cache flushed successfully." : "[Memory] Memory optimizer completed.");
    }

    [RelayCommand]
    private async Task SaveCurrentPresetAsync()
    {
        await ApplyPerformanceTweaksAsync();
    }

    [RelayCommand]
    private void SelectAllPerformanceCores()
    {
        for (var i = 0; i < CpuCores.Count; i++)
        {
            CpuCores[i].IsSelected = (i % 2 == 0) || (i < CpuCores.Count / 2);
        }
    }

    [RelayCommand]
    private void SelectAllCores()
    {
        foreach (var core in CpuCores)
            core.IsSelected = true;
    }

    [RelayCommand]
    private void Navigate(string? page)
    {
        if (string.IsNullOrWhiteSpace(page)) return;
        CurrentPage = page;
        PageTitle = page switch
        {
            "Performance" => "Performance Engine & Core Tweaks",
            "Macro" => "Visual Macro Studio",
            "Settings" => "Settings & Overlay Configuration",
            _ => "Dashboard"
        };
    }

    public void AddLog(string message)
    {
        Application.Current?.Dispatcher?.Invoke(() =>
        {
            if (Logs.Count > 150)
                Logs.RemoveAt(0);
            Logs.Add($"[{DateTime.Now:HH:mm:ss}] {message}");
        });
    }

    private void OnEngineStatusUpdated(string text, bool isActive)
    {
        Application.Current?.Dispatcher?.Invoke(() =>
        {
            OverlayStatusUpdated?.Invoke(text, isActive);
        });
    }

    private void OnTelemetryUpdated(TelemetryData telemetry)
    {
        Application.Current?.Dispatcher?.Invoke(() =>
        {
            CpuPercentage = telemetry.CpuPercentage;
            RamUsageMb = telemetry.RamUsageMb;
            EmulatorStatusText = telemetry.EmulatorStatus;
            AdbStatusText = telemetry.AdbStatus;
            IsEmulatorDetected = telemetry.IsEmulatorRunning;
            IsAdbConnected = telemetry.IsAdbConnected;
        });
    }

    private void OnEmulatorDetected(EmulatorProcessInfo info)
    {
        Application.Current?.Dispatcher?.Invoke(() =>
        {
            EmulatorStatusText = $"RUNNING: {info.ProcessName} (PID: {info.ProcessId})";
            IsEmulatorDetected = true;
            OverlayStatusUpdated?.Invoke($"Active: {info.ProcessName}", true);
        });
    }

    private void OnEmulatorExited(EmulatorProcessInfo info)
    {
        Application.Current?.Dispatcher?.Invoke(() =>
        {
            EmulatorStatusText = "NOT DETECTED";
            IsEmulatorDetected = false;
            AdbStatusText = "DISCONNECTED";
            IsAdbConnected = false;
            OverlayStatusUpdated?.Invoke("Not Active", false);
        });
    }

    public void Dispose()
    {
        if (_disposed) return;
        _engine.Dispose();
        _disposed = true;
        GC.SuppressFinalize(this);
    }
}
