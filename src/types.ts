export interface InstalledEmulatorInfo {
  id: string;
  name: string;
  executablePath: string;
  version: string;
  type: 'BlueStacks' | 'LDPlayer' | 'NoxPlayer' | 'MSIAppPlayer' | 'Gameloop' | 'MEmu' | 'MuMu' | 'Custom';
  status: 'Running' | 'Stopped' | 'Ready';
  pid?: number;
  adbPort: number;
}

export interface EmulatorConfig {
  processName: string;
  executablePath: string;
  priorityClass: 'Normal' | 'AboveNormal' | 'High' | 'RealTime';
  affinityMask: number; // Bitmask (e.g. 255 for 8 cores)
  adbPort: number;
  autoLaunch: boolean;
}

export interface PerformanceConfig {
  targetFps: number;
  enableCpuAffinity: boolean;
  enableRamOptimization: boolean;
  monitorIntervalMs: number;
  autoBoostFpsOnLaunch: boolean;
}

export interface DisplayConfig {
  width: number;
  height: number;
  dpi: number;
  autoScaleResolution: boolean;
}

export interface MultiImageTarget {
  id: string;
  name: string;
  imageBase64?: string;
  confidence: number;
  priority: number;
  tag?: string;
}

export interface VisualProcessingConfig {
  captureRegionX: number;
  captureRegionY: number;
  captureRegionWidth: number;
  captureRegionHeight: number;
  colorTolerance: number;
  sensitivity?: number;
  enableGrayscale?: boolean;
  enableMultiImageSearch?: boolean;
  multiImageTargets?: MultiImageTarget[];
  baseResolution?: { width: number; height: number };
  currentResolution?: { width: number; height: number };
  autoScaleCoords?: boolean;
  captureIntervalMs: number;
}

export interface OverlayConfig {
  toggleHotkey: string;
  enableAutoHide: boolean;
  autoHideDelaySec: number;
  transparency: number;
  showFps: boolean;
  showSystemStats: boolean;
}

export type ActionType =
  | 'Event (Start)'
  | 'Search Color'
  | 'Multi-Image Search'
  | 'Move Mouse'
  | 'Human Click'
  | 'Click Mouse'
  | 'Press Key'
  | 'Delay'
  | 'ADB Tap'
  | 'ADB Shell'
  | 'Script Block';

export interface MacroNode {
  id: string;
  actionType: ActionType;
  parameters: string;
  positionX: number;
  positionY: number;
  nextNodes: string[];
  nodeCategory?: 'event' | 'action' | 'vision' | 'script';
  executionTimeMs?: number;
  lastExecutionStatus?: 'idle' | 'running' | 'success' | 'failed';
  variables?: Record<string, any>;
}

export interface HumanizerConfig {
  enableBezier: boolean;
  curvatureIntensity: number; // 0.1 to 1.0
  easingType: 'naturalHuman' | 'easeOutQuad' | 'easeInOutCubic';
  minDelayJitterMs: number;
  maxDelayJitterMs: number;
  clickOffsetRadiusPx: number;
  randomJitterEnabled: boolean;
}

export interface GhostMacroEvent {
  id: string;
  type: 'mousemove' | 'mousedown' | 'mouseup' | 'keydown' | 'keyup' | 'delay';
  timestampMs: number;
  x?: number;
  y?: number;
  deltaX?: number;
  deltaY?: number;
  button?: 'left' | 'right' | 'middle';
  key?: string;
  durationMs?: number;
}

export interface GhostMacroFile {
  id: string;
  name: string;
  createdAt: string;
  totalDurationMs: number;
  eventsCount: number;
  screenResolution: { width: number; height: number };
  events: GhostMacroEvent[];
}

export interface ScriptExecutionResult {
  success: boolean;
  output: string;
  executionTimeMs: number;
  language: 'csharp' | 'javascript';
  variables?: Record<string, any>;
  logs: string[];
}

export interface PresetProfile {
  id: string;
  name: string;
  description: string;
  targetGame: string;
  emulator: EmulatorConfig;
  performance: PerformanceConfig;
  display: DisplayConfig;
  visualProcessing: VisualProcessingConfig;
  overlay: OverlayConfig;
  macroGraph: MacroNode[];
}

export interface GlobalConfig {
  activePresetName: string;
  enableDarkTheme: boolean;
  adbPath: string;
  defaultAdbPort: number;
  autoStartDriver: boolean;
  defaultHotkey: string;
  startMinimizedToOverlay: boolean;
  customEmulators: InstalledEmulatorInfo[];
}

export interface TelemetryData {
  cpuPercentage: number;
  ramUsageMb: number;
  currentFps: number;
  targetFps: number;
  isEmulatorRunning: boolean;
  isAdbConnected: boolean;
  isEngineActive: boolean;
  emulatorStatus: string;
  adbStatus: string;
  engineStatus: string;
  activeProcessName: string;
  activePid: number | null;
  driverConnected: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'macro';
}

export interface SnipData {
  x: number;
  y: number;
  width: number;
  height: number;
  imageBase64?: string;
  colorHex?: string;
  timestamp?: string;
}
