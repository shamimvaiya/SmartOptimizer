using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartOptimizer.Core.Managers;

public sealed class EmulatorConfig
{
    public string ProcessName { get; set; } = "HD-Player.exe";
    public string ExecutablePath { get; set; } = string.Empty;
    public string PriorityClass { get; set; } = "High";
    public long AffinityMask { get; set; } = 0; // 0 means all cores
    public int AdbPort { get; set; } = 5555;
    public bool AutoLaunch { get; set; } = false;
}

public sealed class PerformanceConfig
{
    public int TargetFps { get; set; } = 90;
    public bool EnableCpuAffinity { get; set; } = true;
    public bool EnableRamOptimization { get; set; } = true;
    public int MonitorIntervalMs { get; set; } = 1000;
    public bool AutoBoostFpsOnLaunch { get; set; } = true;
}

public sealed class DisplayConfig
{
    public int Width { get; set; } = 1920;
    public int Height { get; set; } = 1080;
    public int Dpi { get; set; } = 240;
    public bool AutoScaleResolution { get; set; } = true;
}

public sealed class VisualProcessingConfig
{
    public int CaptureRegionX { get; set; } = 860;
    public int CaptureRegionY { get; set; } = 440;
    public int CaptureRegionWidth { get; set; } = 200;
    public int CaptureRegionHeight { get; set; } = 200;
    public double ColorTolerance { get; set; } = 15;
    public int CaptureIntervalMs { get; set; } = 16;
}

public sealed class OverlayConfig
{
    public string ToggleHotkey { get; set; } = "HOME";
    public bool EnableAutoHide { get; set; } = true;
    public int AutoHideDelaySec { get; set; } = 4;
    public double Transparency { get; set; } = 0.90;
    public bool ShowFps { get; set; } = true;
    public bool ShowSystemStats { get; set; } = true;
}

public sealed class PresetProfile
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = "Custom Profile";
    public string Description { get; set; } = "Custom Optimization Profile";
    public string TargetGame { get; set; } = "General";
    public EmulatorConfig Emulator { get; set; } = new();
    public PerformanceConfig Performance { get; set; } = new();
    public DisplayConfig Display { get; set; } = new();
    public VisualProcessingConfig VisualProcessing { get; set; } = new();
    public OverlayConfig Overlay { get; set; } = new();
    public List<MacroNode> MacroGraph { get; set; } = new();
}

public sealed class GlobalConfig
{
    public string ActivePresetName { get; set; } = string.Empty;
    public bool EnableDarkTheme { get; set; } = true;
    public string AdbPath { get; set; } = "adb.exe";
    public int DefaultAdbPort { get; set; } = 5555;
    public bool AutoStartDriver { get; set; } = false;
    public string DefaultHotkey { get; set; } = "HOME";
    public bool StartMinimizedToOverlay { get; set; } = false;
    public List<InstalledEmulatorInfo> CustomEmulators { get; set; } = new();
}

public sealed class PresetManager
{
    private readonly string _configDir;
    private readonly string _profilesDir;
    private readonly string _globalConfigFile;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        PropertyNameCaseInsensitive = true
    };

    public GlobalConfig GlobalSettings { get; private set; } = new();
    public PresetProfile? ActivePreset { get; private set; }

    public event Action<string>? LogMessage;
    public event Action<PresetProfile>? PresetChanged;

    public PresetManager(string? baseDirectory = null)
    {
        var root = string.IsNullOrWhiteSpace(baseDirectory)
            ? AppDomain.CurrentDomain.BaseDirectory
            : baseDirectory;
        _configDir = Path.Combine(root, "Config");
        _profilesDir = Path.Combine(_configDir, "profiles");
        _globalConfigFile = Path.Combine(_configDir, "global.json");
        EnsureDirectoriesExist();
    }

    public async Task InitializeAsync()
    {
        EnsureDirectoriesExist();
        await LoadGlobalConfigAsync().ConfigureAwait(false);

        if (!string.IsNullOrWhiteSpace(GlobalSettings.ActivePresetName))
            await LoadPresetAsync(GlobalSettings.ActivePresetName).ConfigureAwait(false);

        var available = GetAvailablePresetNames();
        if (ActivePreset is null && available.Count > 0)
            await LoadPresetAsync(available[0]).ConfigureAwait(false);
    }

    public async Task LoadGlobalConfigAsync()
    {
        try
        {
            if (!File.Exists(_globalConfigFile))
            {
                await SaveGlobalConfigAsync().ConfigureAwait(false);
                return;
            }

            var json = await File.ReadAllTextAsync(_globalConfigFile).ConfigureAwait(false);
            GlobalSettings = JsonSerializer.Deserialize<GlobalConfig>(json, _jsonOptions) ?? new GlobalConfig();
            Log("Global configuration loaded.");
        }
        catch (Exception ex) when (ex is IOException or JsonException or UnauthorizedAccessException)
        {
            GlobalSettings = new GlobalConfig();
            Log($"Error loading global config: {ex.Message}");
        }
    }

    public async Task SaveGlobalConfigAsync()
    {
        try
        {
            EnsureDirectoriesExist();
            var json = JsonSerializer.Serialize(GlobalSettings, _jsonOptions);
            await File.WriteAllTextAsync(_globalConfigFile, json).ConfigureAwait(false);
            Log("Global configuration saved.");
        }
        catch (Exception ex) when (ex is IOException or JsonException or UnauthorizedAccessException)
        {
            Log($"Error saving global config: {ex.Message}");
        }
    }

    public async Task AddCustomEmulatorAsync(InstalledEmulatorInfo emulator)
    {
        EnsureDirectoriesExist();
        GlobalSettings.CustomEmulators.RemoveAll(e => string.Equals(e.ExecutablePath, emulator.ExecutablePath, StringComparison.OrdinalIgnoreCase));
        GlobalSettings.CustomEmulators.Add(emulator);
        await SaveGlobalConfigAsync();
        Log($"Saved custom emulator: {emulator.Name} ({emulator.ExecutablePath})");
    }

    public List<string> GetAvailablePresetNames()
    {
        try
        {
            EnsureDirectoriesExist();
            return Directory.EnumerateFiles(_profilesDir, "*.json")
                .Select(Path.GetFileNameWithoutExtension)
                .Where(name => !string.IsNullOrWhiteSpace(name))
                .OrderBy(name => name, StringComparer.OrdinalIgnoreCase)
                .ToList()!;
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
        {
            Log($"Error listing presets: {ex.Message}");
            return [];
        }
    }

    public async Task<PresetProfile?> LoadPresetAsync(string presetName)
    {
        var filePath = GetPresetPath(presetName);
        if (filePath is null)
            return null;

        try
        {
            if (!File.Exists(filePath))
            {
                return null;
            }

            var json = await File.ReadAllTextAsync(filePath).ConfigureAwait(false);
            var preset = JsonSerializer.Deserialize<PresetProfile>(json, _jsonOptions);
            if (preset is null)
                return null;

            ActivePreset = preset;
            GlobalSettings.ActivePresetName = Path.GetFileNameWithoutExtension(filePath);
            await SaveGlobalConfigAsync().ConfigureAwait(false);
            Log($"Preset loaded: {GlobalSettings.ActivePresetName}");
            PresetChanged?.Invoke(preset);
            return preset;
        }
        catch (Exception ex) when (ex is IOException or JsonException or UnauthorizedAccessException)
        {
            Log($"Error loading preset {presetName}: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> SavePresetAsync(PresetProfile preset)
    {
        ArgumentNullException.ThrowIfNull(preset);
        var safeName = MakeSafeFileName(preset.Name);
        if (safeName.Length == 0)
            return false;

        try
        {
            EnsureDirectoriesExist();
            var filePath = Path.Combine(_profilesDir, $"{safeName}.json");
            var json = JsonSerializer.Serialize(preset, _jsonOptions);
            await File.WriteAllTextAsync(filePath, json).ConfigureAwait(false);
            ActivePreset = preset;
            GlobalSettings.ActivePresetName = safeName;
            await SaveGlobalConfigAsync().ConfigureAwait(false);
            Log($"Preset saved: {safeName}");
            PresetChanged?.Invoke(preset);
            return true;
        }
        catch (Exception ex) when (ex is IOException or JsonException or UnauthorizedAccessException)
        {
            Log($"Error saving preset {safeName}: {ex.Message}");
            return false;
        }
    }

    public bool DeletePreset(string presetName)
    {
        var filePath = GetPresetPath(presetName);
        if (filePath is null || !File.Exists(filePath))
            return false;

        try
        {
            File.Delete(filePath);
            if (string.Equals(GlobalSettings.ActivePresetName, Path.GetFileNameWithoutExtension(filePath), StringComparison.OrdinalIgnoreCase))
            {
                ActivePreset = null;
                GlobalSettings.ActivePresetName = string.Empty;
                _ = SaveGlobalConfigAsync();
            }

            Log($"Preset deleted: {presetName}");
            return true;
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
        {
            Log($"Error deleting preset {presetName}: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> DuplicatePresetAsync(string sourceName, string newName)
    {
        var source = await LoadPresetAsync(sourceName).ConfigureAwait(false);
        if (source is null)
            return false;

        var copy = new PresetProfile
        {
            Id = Guid.NewGuid().ToString("N"),
            Name = newName,
            Description = $"Copy of {source.Name}",
            TargetGame = source.TargetGame,
            Emulator = new EmulatorConfig
            {
                ProcessName = source.Emulator.ProcessName,
                ExecutablePath = source.Emulator.ExecutablePath,
                PriorityClass = source.Emulator.PriorityClass,
                AffinityMask = source.Emulator.AffinityMask,
                AdbPort = source.Emulator.AdbPort,
                AutoLaunch = source.Emulator.AutoLaunch
            },
            Performance = new PerformanceConfig
            {
                TargetFps = source.Performance.TargetFps,
                EnableCpuAffinity = source.Performance.EnableCpuAffinity,
                EnableRamOptimization = source.Performance.EnableRamOptimization,
                MonitorIntervalMs = source.Performance.MonitorIntervalMs,
                AutoBoostFpsOnLaunch = source.Performance.AutoBoostFpsOnLaunch
            },
            Display = new DisplayConfig
            {
                Width = source.Display.Width,
                Height = source.Display.Height,
                Dpi = source.Display.Dpi,
                AutoScaleResolution = source.Display.AutoScaleResolution
            },
            VisualProcessing = new VisualProcessingConfig
            {
                CaptureRegionX = source.VisualProcessing.CaptureRegionX,
                CaptureRegionY = source.VisualProcessing.CaptureRegionY,
                CaptureRegionWidth = source.VisualProcessing.CaptureRegionWidth,
                CaptureRegionHeight = source.VisualProcessing.CaptureRegionHeight,
                ColorTolerance = source.VisualProcessing.ColorTolerance,
                CaptureIntervalMs = source.VisualProcessing.CaptureIntervalMs
            },
            Overlay = new OverlayConfig
            {
                ToggleHotkey = source.Overlay.ToggleHotkey,
                EnableAutoHide = source.Overlay.EnableAutoHide,
                AutoHideDelaySec = source.Overlay.AutoHideDelaySec,
                Transparency = source.Overlay.Transparency,
                ShowFps = source.Overlay.ShowFps,
                ShowSystemStats = source.Overlay.ShowSystemStats
            },
            MacroGraph = new List<MacroNode>(source.MacroGraph)
        };

        return await SavePresetAsync(copy).ConfigureAwait(false);
    }

    private void EnsureDirectoriesExist()
    {
        try
        {
            Directory.CreateDirectory(_configDir);
            Directory.CreateDirectory(_profilesDir);
        }
        catch (Exception ex)
        {
            Log($"Failed to create directories: {ex.Message}");
        }
    }

    private string? GetPresetPath(string presetName)
    {
        if (string.IsNullOrWhiteSpace(presetName))
            return null;

        var safeName = MakeSafeFileName(presetName);
        return Path.Combine(_profilesDir, $"{safeName}.json");
    }

    private static string MakeSafeFileName(string name)
    {
        var invalid = Path.GetInvalidFileNameChars();
        return string.Concat(name.Where(c => !invalid.Contains(c))).Trim();
    }

    private void Log(string message) => LogMessage?.Invoke($"[Preset] {DateTime.Now:HH:mm:ss} - {message}");
}
