import fs from 'fs';
import path from 'path';

export interface CustomActionDefinition {
  id: string;
  name: string;
  category: 'Vision' | 'Input' | 'Loops' | 'Logic' | 'ADB' | 'Custom';
  color: string;
  iconName: string;
  defaultParameters: string;
  csharpScript: string;
}

export interface PresetProfile {
  id: string;
  name: string;
  description: string;
  targetGame: string;
  emulator: {
    processName: string;
    executablePath: string;
    priorityClass: 'Normal' | 'AboveNormal' | 'High' | 'RealTime';
    affinityMask: number;
    adbPort: number;
    autoLaunch: boolean;
  };
  performance: {
    targetFps: number;
    enableCpuAffinity: boolean;
    enableRamOptimization: boolean;
    monitorIntervalMs: number;
    autoBoostFpsOnLaunch: boolean;
  };
  display: {
    width: number;
    height: number;
    dpi: number;
    autoScaleResolution: boolean;
  };
  visualProcessing: {
    captureRegionX: number;
    captureRegionY: number;
    captureRegionWidth: number;
    captureRegionHeight: number;
    colorTolerance: number;
    captureIntervalMs: number;
  };
  overlay: {
    toggleHotkey: string;
    enableAutoHide: boolean;
    autoHideDelaySec: number;
    transparency: number;
    showFps: boolean;
    showSystemStats: boolean;
  };
  macroGraph: Array<{
    id: string;
    actionType: string;
    title?: string;
    parameters: string;
    positionX: number;
    positionY: number;
    nextNodes: string[];
    inputs?: any[];
    outputs?: any[];
    conditionBranch?: { trueNodeId?: string; falseNodeId?: string };
    loopBranch?: { bodyNodeId?: string; doneNodeId?: string };
    group?: string;
    comment?: string;
    disabled?: boolean;
    customActionId?: string;
    variables?: Record<string, any>;
    data?: Record<string, any>;
  }>;
}

export interface InstalledEmulatorInfo {
  id: string;
  name: string;
  executablePath: string;
  version: string;
  type: string;
  status: 'Running' | 'Stopped' | 'Ready';
  pid?: number;
  adbPort: number;
}

export interface EmulatorEnginePreset {
  id: string;
  name: string;
  executablePath: string;
  adbPort: number;
  color: string;
  family: string;
}

export interface GlobalConfig {
  activePresetName: string;
  enableDarkTheme: boolean;
  adbPath: string;
  defaultAdbPort: number;
  autoStartDriver: boolean;
  defaultHotkey: string;
  startMinimizedToOverlay: boolean;
  marqueeAnimationMode?: 'cyberNeon' | 'laserPulse' | 'matrixSmooth' | 'amberClassic' | 'gradientWave';
}

const DATA_DIR = path.join(process.cwd(), 'data');
const PRESETS_FILE = path.join(DATA_DIR, 'presets.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const EMULATORS_FILE = path.join(DATA_DIR, 'emulators.json');
const EMULATOR_ENGINE_PRESETS_FILE = path.join(DATA_DIR, 'emulator_engine_presets.json');
const CUSTOM_ACTIONS_FILE = path.join(DATA_DIR, 'custom_actions.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// Default initial profiles
const defaultPresets: Record<string, PresetProfile> = {};

const defaultEmulatorEnginePresets: EmulatorEnginePreset[] = [
  { id: 'ep_bluestacks', name: 'BlueStacks', executablePath: 'C:\\Program Files\\BlueStacks_nxt\\HD-Player.exe', adbPort: 5555, color: '#00e5ff', family: 'BlueStacks' },
  { id: 'ep_msi', name: 'MSI App Player', executablePath: 'C:\\Program Files\\BlueStacks_msi5\\HD-Player.exe', adbPort: 5555, color: '#39ff14', family: 'MSIAppPlayer' },
  { id: 'ep_ldplayer', name: 'LDPlayer', executablePath: 'C:\\LDPlayer\\LDPlayer9\\dnplayer.exe', adbPort: 5555, color: '#ffd600', family: 'LDPlayer' },
  { id: 'ep_gameloop', name: 'Gameloop', executablePath: 'C:\\Program Files\\TxGameAssistant\\ui\\AndroidEmulator.exe', adbPort: 5555, color: '#ff2a4b', family: 'Gameloop' },
];

const defaultCustomActions: CustomActionDefinition[] = [
  {
    id: 'ca_anti_recoil',
    name: 'Anti-Recoil Pull Down',
    category: 'Input',
    color: '#00e5ff',
    iconName: 'Crosshair',
    defaultParameters: 'PullPixels: 14, DurationMs: 180, SmoothSteps: 10',
    csharpScript: `// Smooth Bézier Anti-Recoil Vector Pull
for (int i = 0; i < 10; i++) {
    SmartOptimizerKernel.InjectRelativeMouse(0, 2);
    await Task.Delay(18);
}`,
  },
  {
    id: 'ca_fast_gloo_wall',
    name: 'Fast Gloo Wall Tap',
    category: 'ADB',
    color: '#39ff14',
    iconName: 'Zap',
    defaultParameters: 'WallSlotX: 1620, WallSlotY: 820, CrouchKey: C',
    csharpScript: `// 1-Click Fast Crouch & Gloo Wall Placement
await AdbService.TapAsync(1620, 820);
SmartOptimizerKernel.InjectKeyEvent(0x43, true); // Key 'C' Down
await Task.Delay(25);
SmartOptimizerKernel.InjectKeyEvent(0x43, false);
await AdbService.TapAsync(960, 680);`,
  },
  {
    id: 'ca_jitter_click',
    name: 'Jitter Click Burst',
    category: 'Input',
    color: '#a855f7',
    iconName: 'Target',
    defaultParameters: 'BurstCount: 5, IntervalMs: 30',
    csharpScript: `// Gaussian Micro-Jitter Left Click Burst
for (int i = 0; i < 5; i++) {
    SmartOptimizerKernel.InjectMouseButton(MouseButton.Left, true);
    await Task.Delay(15);
    SmartOptimizerKernel.InjectMouseButton(MouseButton.Left, false);
    await Task.Delay(15);
}`,
  },
];

const defaultEmulators: InstalledEmulatorInfo[] = [];

const defaultGlobalConfig: GlobalConfig = {
  activePresetName: '',
  enableDarkTheme: true,
  adbPath: 'adb.exe',
  defaultAdbPort: 5555,
  autoStartDriver: true,
  defaultHotkey: 'HOME',
  startMinimizedToOverlay: false,
};

class StorageEngine {
  private presets: Record<string, PresetProfile> = {};
  private globalConfig: GlobalConfig = { ...defaultGlobalConfig };
  private emulators: InstalledEmulatorInfo[] = [];
  private emulatorEnginePresets: EmulatorEnginePreset[] = [];
  private customActions: CustomActionDefinition[] = [];
  private logs: string[] = [];

  constructor() {
    this.ensureDataDirectory();
    this.loadAll();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private safeWriteJson(filePath: string, data: any) {
    try {
      this.ensureDataDirectory();
      const tmpPath = `${filePath}.tmp_${Date.now()}`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, filePath);
    } catch (err) {
      console.error(`[StorageEngine] Failed to safely write to ${filePath}:`, err);
    }
  }

  private safeReadJson<T>(filePath: string, fallback: T): T {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as T;
      }
    } catch (err) {
      console.error(`[StorageEngine] Failed to read ${filePath}, using fallback:`, err);
    }
    return fallback;
  }

  private loadAll() {
    // 1. Presets
    const loadedPresets = this.safeReadJson<Record<string, PresetProfile> | null>(PRESETS_FILE, null);
    if (loadedPresets === null) {
      this.presets = {};
      this.safeWriteJson(PRESETS_FILE, this.presets);
    } else {
      this.presets = loadedPresets;
    }

    // 2. Config
    const loadedConfig = this.safeReadJson<GlobalConfig | null>(CONFIG_FILE, null);
    if (!loadedConfig) {
      this.globalConfig = { ...defaultGlobalConfig, activePresetName: Object.keys(this.presets)[0] || '' };
      this.safeWriteJson(CONFIG_FILE, this.globalConfig);
    } else {
      this.globalConfig = { ...defaultGlobalConfig, ...loadedConfig };
    }

    // 3. Emulators
    const loadedEmulators = this.safeReadJson<InstalledEmulatorInfo[] | null>(EMULATORS_FILE, null);
    if (loadedEmulators === null) {
      this.emulators = [];
      this.safeWriteJson(EMULATORS_FILE, this.emulators);
    } else {
      this.emulators = loadedEmulators;
    }

    // 3b. Emulator Engine Presets (Portable & Removable)
    const loadedEnginePresets = this.safeReadJson<EmulatorEnginePreset[] | null>(EMULATOR_ENGINE_PRESETS_FILE, null);
    if (loadedEnginePresets === null) {
      this.emulatorEnginePresets = [...defaultEmulatorEnginePresets];
      this.safeWriteJson(EMULATOR_ENGINE_PRESETS_FILE, this.emulatorEnginePresets);
    } else {
      this.emulatorEnginePresets = loadedEnginePresets;
    }

    // 4. Custom Actions
    const loadedCustomActions = this.safeReadJson<CustomActionDefinition[] | null>(CUSTOM_ACTIONS_FILE, null);
    if (!loadedCustomActions || loadedCustomActions.length === 0) {
      this.customActions = [...defaultCustomActions];
      this.safeWriteJson(CUSTOM_ACTIONS_FILE, this.customActions);
    } else {
      this.customActions = loadedCustomActions;
    }

    // 5. Initial Logs
    const loadedLogs = this.safeReadJson<string[] | null>(LOGS_FILE, null);
    const initialStamp = new Date().toLocaleTimeString();
    if (!loadedLogs || loadedLogs.length === 0) {
      this.logs = [
        `[${initialStamp}] [System] SmartOptimizer Core Engine (AIM/OPT Pro v3.0) loaded.`,
        `[${initialStamp}] [StorageEngine] Persistent database verified at /data directory.`,
        `[${initialStamp}] [IOCTL] Kernel Driver Interface registered: \\\\.\\SmartOptimizer.`,
      ];
      this.safeWriteJson(LOGS_FILE, this.logs);
    } else {
      this.logs = loadedLogs;
      this.logs.push(`[${initialStamp}] [System] SmartOptimizer Engine booted with ${Object.keys(this.presets).length} profiles.`);
      if (this.logs.length > 250) this.logs = this.logs.slice(-250);
    }
  }

  // --- Presets API ---
  public getPresets(): PresetProfile[] {
    return Object.values(this.presets);
  }

  public getPreset(name: string): PresetProfile | null {
    return this.presets[name] || null;
  }

  public savePreset(preset: PresetProfile): PresetProfile {
    this.presets[preset.name] = preset;
    this.globalConfig.activePresetName = preset.name;
    this.safeWriteJson(PRESETS_FILE, this.presets);
    this.safeWriteJson(CONFIG_FILE, this.globalConfig);
    return preset;
  }

  public duplicatePreset(sourceName: string, newName?: string): PresetProfile | null {
    const source = this.presets[sourceName];
    if (!source) return null;
    const targetName = newName || `${sourceName}_Copy`;
    const copy: PresetProfile = {
      ...JSON.parse(JSON.stringify(source)),
      id: `preset_${Date.now()}`,
      name: targetName,
      description: `Duplicate of ${source.name}`,
    };
    this.presets[targetName] = copy;
    this.globalConfig.activePresetName = targetName;
    this.safeWriteJson(PRESETS_FILE, this.presets);
    this.safeWriteJson(CONFIG_FILE, this.globalConfig);
    return copy;
  }

  public deletePreset(name: string): boolean {
    delete this.presets[name];
    if (this.globalConfig.activePresetName === name) {
      const keys = Object.keys(this.presets);
      this.globalConfig.activePresetName = keys.length > 0 ? keys[0] : '';
    }
    this.safeWriteJson(PRESETS_FILE, this.presets);
    this.safeWriteJson(CONFIG_FILE, this.globalConfig);
    return true;
  }

  public switchPreset(name: string): PresetProfile | null {
    const p = this.presets[name];
    if (!p) return null;
    this.globalConfig.activePresetName = name;
    this.safeWriteJson(CONFIG_FILE, this.globalConfig);
    return p;
  }

  // --- Global Config API ---
  public getGlobalConfig(): GlobalConfig {
    return this.globalConfig;
  }

  public updateGlobalConfig(partial: Partial<GlobalConfig>): GlobalConfig {
    this.globalConfig = { ...this.globalConfig, ...partial };
    this.safeWriteJson(CONFIG_FILE, this.globalConfig);
    return this.globalConfig;
  }

  // --- Emulators API ---
  public getEmulators(): InstalledEmulatorInfo[] {
    return this.emulators;
  }

  public addEmulator(emu: InstalledEmulatorInfo): InstalledEmulatorInfo {
    this.emulators.push(emu);
    this.safeWriteJson(EMULATORS_FILE, this.emulators);
    return emu;
  }

  public updateEmulator(id: string, partial: Partial<InstalledEmulatorInfo>): InstalledEmulatorInfo | null {
    const idx = this.emulators.findIndex((e) => e.id === id);
    if (idx >= 0) {
      this.emulators[idx] = { ...this.emulators[idx], ...partial };
      this.safeWriteJson(EMULATORS_FILE, this.emulators);
      return this.emulators[idx];
    }
    return null;
  }

  public deleteEmulator(id: string): boolean {
    this.emulators = this.emulators.filter((e) => e.id !== id);
    this.safeWriteJson(EMULATORS_FILE, this.emulators);
    return true;
  }

  // --- Emulator Engine Presets API (Portable & Removable) ---
  public getEmulatorEnginePresets(): EmulatorEnginePreset[] {
    return this.emulatorEnginePresets;
  }

  public saveEmulatorEnginePreset(preset: EmulatorEnginePreset): EmulatorEnginePreset {
    const idx = this.emulatorEnginePresets.findIndex((p) => p.id === preset.id || p.name.toLowerCase() === preset.name.toLowerCase());
    if (idx >= 0) {
      this.emulatorEnginePresets[idx] = preset;
    } else {
      this.emulatorEnginePresets.push(preset);
    }
    this.safeWriteJson(EMULATOR_ENGINE_PRESETS_FILE, this.emulatorEnginePresets);
    return preset;
  }

  public deleteEmulatorEnginePreset(id: string): boolean {
    this.emulatorEnginePresets = this.emulatorEnginePresets.filter((p) => p.id !== id && p.name !== id);
    this.safeWriteJson(EMULATOR_ENGINE_PRESETS_FILE, this.emulatorEnginePresets);
    return true;
  }

  // --- Custom Actions API ---
  public getCustomActions(): CustomActionDefinition[] {
    return this.customActions;
  }

  public saveCustomAction(action: CustomActionDefinition): CustomActionDefinition {
    const idx = this.customActions.findIndex((a) => a.id === action.id || a.name === action.name);
    if (idx >= 0) {
      this.customActions[idx] = action;
    } else {
      this.customActions.push(action);
    }
    this.safeWriteJson(CUSTOM_ACTIONS_FILE, this.customActions);
    return action;
  }

  public deleteCustomAction(id: string): boolean {
    this.customActions = this.customActions.filter((a) => a.id !== id);
    this.safeWriteJson(CUSTOM_ACTIONS_FILE, this.customActions);
    return true;
  }

  // --- Logs API ---
  public getLogs(): string[] {
    return this.logs;
  }

  public addLog(msg: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${msg}`;
    this.logs.push(entry);
    if (this.logs.length > 300) {
      this.logs = this.logs.slice(-300);
    }
    this.safeWriteJson(LOGS_FILE, this.logs);
  }

  public clearLogs(): string[] {
    const timestamp = new Date().toLocaleTimeString();
    this.logs = [`[${timestamp}] [System] Live terminal logs cleared.`];
    this.safeWriteJson(LOGS_FILE, this.logs);
    return this.logs;
  }

  public factoryReset(): void {
    this.presets = {};
    this.globalConfig = { ...defaultGlobalConfig, activePresetName: '' };
    this.emulators = [];
    this.customActions = [...defaultCustomActions];
    const timestamp = new Date().toLocaleTimeString();
    this.logs = [`[${timestamp}] [System] Factory Reset executed. All user data, graphs, and presets wiped.`];
    this.safeWriteJson(PRESETS_FILE, this.presets);
    this.safeWriteJson(CONFIG_FILE, this.globalConfig);
    this.safeWriteJson(EMULATORS_FILE, this.emulators);
    this.safeWriteJson(CUSTOM_ACTIONS_FILE, this.customActions);
    this.safeWriteJson(LOGS_FILE, this.logs);
  }
}

export const storage = new StorageEngine();
