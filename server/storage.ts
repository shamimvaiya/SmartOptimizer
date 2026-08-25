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
const CUSTOM_ACTIONS_FILE = path.join(DATA_DIR, 'custom_actions.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// Default initial profiles
const defaultPresets: Record<string, PresetProfile> = {
  FreeFire_Opt: {
    id: 'preset_ff_01',
    name: 'FreeFire_Opt',
    description: 'Ultra High Sensitivity & 144 FPS Lock for Free Fire Battle Royale & MAX',
    targetGame: 'Free Fire / FF MAX',
    emulator: {
      processName: 'HD-Player.exe',
      executablePath: 'C:\\Program Files\\BlueStacks_nxt\\HD-Player.exe',
      priorityClass: 'High',
      affinityMask: 240, // Cores 4-7 (Performance Cores)
      adbPort: 5555,
      autoLaunch: true,
    },
    performance: {
      targetFps: 144,
      enableCpuAffinity: true,
      enableRamOptimization: true,
      monitorIntervalMs: 1000,
      autoBoostFpsOnLaunch: true,
    },
    display: {
      width: 1920,
      height: 1080,
      dpi: 240,
      autoScaleResolution: true,
    },
    visualProcessing: {
      captureRegionX: 860,
      captureRegionY: 440,
      captureRegionWidth: 200,
      captureRegionHeight: 200,
      colorTolerance: 15,
      captureIntervalMs: 16,
    },
    overlay: {
      toggleHotkey: 'HOME',
      enableAutoHide: true,
      autoHideDelaySec: 4,
      transparency: 0.92,
      showFps: true,
      showSystemStats: true,
    },
    macroGraph: [
      {
        id: 'node_1',
        actionType: 'Search Color',
        parameters: '860, 440, 200, 200, #39FF14',
        positionX: 80,
        positionY: 80,
        nextNodes: ['node_2'],
      },
      {
        id: 'node_2',
        actionType: 'Move Mouse',
        parameters: '960, 540, true',
        positionX: 360,
        positionY: 80,
        nextNodes: ['node_3'],
      },
      {
        id: 'node_3',
        actionType: 'Click Mouse',
        parameters: 'left',
        positionX: 640,
        positionY: 80,
        nextNodes: ['node_4'],
      },
      {
        id: 'node_4',
        actionType: 'Delay',
        parameters: '45',
        positionX: 920,
        positionY: 80,
        nextNodes: [],
      },
    ],
  },
  PUBG_Mobile_144Hz: {
    id: 'preset_pubg_02',
    name: 'PUBG_Mobile_144Hz',
    description: 'DirectX 11 Duplication & 90/120/144Hz Refresh Unlocker for LDPlayer 9 / BlueStacks',
    targetGame: 'PUBG Mobile / BGMI',
    emulator: {
      processName: 'dnplayer.exe',
      executablePath: 'C:\\LDPlayer\\LDPlayer9\\dnplayer.exe',
      priorityClass: 'RealTime',
      affinityMask: 252, // Cores 2-7
      adbPort: 5555,
      autoLaunch: false,
    },
    performance: {
      targetFps: 144,
      enableCpuAffinity: true,
      enableRamOptimization: true,
      monitorIntervalMs: 1000,
      autoBoostFpsOnLaunch: true,
    },
    display: {
      width: 2560,
      height: 1440,
      dpi: 320,
      autoScaleResolution: false,
    },
    visualProcessing: {
      captureRegionX: 1180,
      captureRegionY: 620,
      captureRegionWidth: 200,
      captureRegionHeight: 200,
      colorTolerance: 12,
      captureIntervalMs: 10,
    },
    overlay: {
      toggleHotkey: 'F8',
      enableAutoHide: true,
      autoHideDelaySec: 5,
      transparency: 0.88,
      showFps: true,
      showSystemStats: true,
    },
    macroGraph: [
      {
        id: 'p_node_1',
        actionType: 'Press Key',
        parameters: 'R',
        positionX: 80,
        positionY: 100,
        nextNodes: ['p_node_2'],
      },
      {
        id: 'p_node_2',
        actionType: 'Delay',
        parameters: '120',
        positionX: 360,
        positionY: 100,
        nextNodes: ['p_node_3'],
      },
      {
        id: 'p_node_3',
        actionType: 'ADB Tap',
        parameters: '1280, 720',
        positionX: 640,
        positionY: 100,
        nextNodes: [],
      },
    ],
  },
  CODM_UltraLatency: {
    id: 'preset_codm_03',
    name: 'CODM_UltraLatency',
    description: 'Zero input jitter & high DPI scaling for Call of Duty Mobile',
    targetGame: 'Call of Duty: Mobile',
    emulator: {
      processName: 'HD-Player.exe',
      executablePath: 'C:\\Program Files\\BlueStacks_nxt\\HD-Player.exe',
      priorityClass: 'High',
      affinityMask: 255,
      adbPort: 5555,
      autoLaunch: false,
    },
    performance: {
      targetFps: 120,
      enableCpuAffinity: true,
      enableRamOptimization: true,
      monitorIntervalMs: 1000,
      autoBoostFpsOnLaunch: true,
    },
    display: {
      width: 1920,
      height: 1080,
      dpi: 280,
      autoScaleResolution: true,
    },
    visualProcessing: {
      captureRegionX: 910,
      captureRegionY: 490,
      captureRegionWidth: 100,
      captureRegionHeight: 100,
      colorTolerance: 18,
      captureIntervalMs: 16,
    },
    overlay: {
      toggleHotkey: 'INSERT',
      enableAutoHide: false,
      autoHideDelaySec: 4,
      transparency: 0.95,
      showFps: true,
      showSystemStats: true,
    },
    macroGraph: [
      {
        id: 'c_node_1',
        actionType: 'Search Color',
        parameters: '910, 490, 100, 100, #FF0055',
        positionX: 80,
        positionY: 120,
        nextNodes: ['c_node_2'],
      },
      {
        id: 'c_node_2',
        actionType: 'Click Mouse',
        parameters: 'right',
        positionX: 360,
        positionY: 120,
        nextNodes: [],
      },
    ],
  },
};

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

const defaultEmulators: InstalledEmulatorInfo[] = [
  {
    id: 'emu_bs5',
    name: 'BlueStacks 5 (Nougat/Pie 64-Bit)',
    executablePath: 'C:\\Program Files\\BlueStacks_nxt\\HD-Player.exe',
    type: 'BlueStacks',
    version: 'v5.21.500.1001',
    status: 'Ready',
    adbPort: 5555,
  },
  {
    id: 'emu_ld9',
    name: 'LDPlayer 9 (Android 9.0 Kernel)',
    executablePath: 'C:\\LDPlayer\\LDPlayer9\\dnplayer.exe',
    type: 'LDPlayer',
    version: 'v9.0.68',
    status: 'Ready',
    adbPort: 5555,
  },
  {
    id: 'emu_msi',
    name: 'MSI App Player',
    executablePath: 'C:\\Program Files\\MSI App Player\\HD-Player.exe',
    type: 'MSIAppPlayer',
    version: 'v5.11.56',
    status: 'Ready',
    adbPort: 5555,
  },
  {
    id: 'emu_mumu',
    name: 'MuMu Player 12',
    executablePath: 'C:\\Program Files\\Netease\\MuMuPlayer-12.0\\shell\\MuMuPlayer.exe',
    type: 'MuMu',
    version: 'v12.4.12',
    status: 'Ready',
    adbPort: 7555,
  },
];

const defaultGlobalConfig: GlobalConfig = {
  activePresetName: 'FreeFire_Opt',
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

  public deleteEmulator(id: string): boolean {
    this.emulators = this.emulators.filter((e) => e.id !== id);
    this.safeWriteJson(EMULATORS_FILE, this.emulators);
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
}

export const storage = new StorageEngine();
