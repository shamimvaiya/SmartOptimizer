export interface CustomActionDefinition {
  id: string;
  name: string;
  category: 'Vision' | 'Input' | 'Loops' | 'Logic' | 'ADB' | 'Custom';
  color: string;
  iconName: string;
  defaultParameters: string;
  csharpScript: string;
}

export interface CrosshairDesign {
  id: string;
  name: string;
  category:
    | 'morph'
    | 'cyber_scifi'
    | 'anime_mystic'
    | 'orbit_vortex'
    | 'tactical_hud'
    | 'plasma_neon'
    | 'pro_static'
    | 'esport'
    | 'dot'
    | 'circle'
    | 'sniper'
    | 'scifi'
    | 'minimal'
    | 'special'
    | string;
  description: string;
  color: string;
  size: number;
  thickness: number;
  gap: number;
  dotSize?: number;
  showDot?: boolean;
  hasOutline?: boolean;
  outlineColor?: string;
  opacity: number;
  rotation?: number;
  isAnimated?: boolean;
  animationType?: string;
  shapeType:
    | 'classic_cross'
    | 'dot'
    | 'dot_circle'
    | 'circle'
    | 'sniper_mil_dot'
    | 'chevron'
    | 'quad_chevron'
    | 'diamond'
    | 'hologram_ring'
    | 'tri_vector'
    | 'biohazard'
    | 'falcon_wing'
    | 'heavy_artillery'
    | 'valkyrie'
    | 'pulse_target'
    | 'hexagon'
    | 'cross_gap'
    | 't_shape'
    | 'box_cross'
    | 'shuriken'
    | 'apex_arrow'
    | 'laser_cross'
    | 'cyber_reticle'
    | 'target_lock'
    | 'stealth_optic'
    | 'omega_cross'
    | 'matrix_grid'
    | 'predator_tri'
    | 'dual_circle'
    | 'shotgun_spread'
    | 'clutch_reticle'
    | 'assault_brackets'
    | 'fire_dragon_vortex'
    | 'cyber_pulsar_ring'
    | 'quantum_glitch'
    | 'plasma_core'
    | 'sniper_predator_lock'
    | 'neon_vortex'
    | 'cyber_rage_tri'
    | 'void_singularity'
    | 'solar_flare_bloom'
    | 'hyper_recoil_gyro'
    | 'tactical_hud_hex'
    | 'matrix_stream_reticle'
    | 'nano_tech_focus'
    | 'phoenix_wing'
    | 'astral_nebula_dot'
    | 'thunder_bolt_core'
    | 'ghost_phantom_pulse'
    | 'chakra_energy_orb'
    | 'cyber_valkyrie_cross'
    | 'drag_headshot_master'
    | 'chrono_warp_optic'
    | 'blaze_inferno_ring'
    | 'shadow_assassin_x'
    | 'titan_mech_target'
    | 'prism_rainbow_laser'
    | 'spectral_arrow_cross'
    | 'hyper_drive_reticle'
    | 'apex_overcharge_optic'
    | 'frost_crystal_glaze'
    | 'venom_viper_fang'
    | string;
}

export interface CrosshairCustomSettings {
  color: string;
  size: number;
  thickness: number;
  gap: number;
  dotSize: number;
  showDot: boolean;
  hasOutline: boolean;
  outlineColor: string;
  outlineThickness?: number;
  opacity: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  pulseAnimation: boolean;
  glowIntensity?: number;
  ringThickness?: number;
  vfxSpeed?: number;
}

export interface CrosshairConfig {
  isEnabled: boolean;
  isActivatedToEmulator: boolean;
  autoInjectToEmulator?: boolean;
  selectedDesignId: string;
  favoriteDesignIds?: string[];
  customSettings: CrosshairCustomSettings;
  toggleHotkey?: string;
}

export interface MacroProfileItem {
  id: string;
  name: string;
  category: string;
  descriptionEn: string;
  descriptionBn: string;
  usageGuideEn: string;
  usageGuideBn: string;
  inGameSettingsEn: string;
  inGameSettingsBn: string;
  developerGuideEn: string;
  developerGuideBn: string;
  hotkey: string;
  isEnabled: boolean;
  isExecuted: boolean;
  codeScript: string;
  tags: string[];
  executionLayers: string[];
  lastExecutedTime?: string;
  author?: string;
  version?: string;
  createdDate?: string;
  originStudio?: 'code' | 'visual' | 'block';
  defaultStudio?: 'code' | 'visual' | 'block';
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
  isPinned?: boolean;
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

export type PortType = 'exec' | 'number' | 'string' | 'boolean' | 'list' | 'object' | 'any';

export interface NodePort {
  id: string;
  name: string;
  type: PortType;
  direction: 'in' | 'out';
  defaultValue?: any;
  value?: any;
}

export interface NodeConnection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
  type: PortType;
}

export interface MacroVariable {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'list' | 'object';
  value: any;
  defaultValue: any;
  scope: 'global' | 'local';
  description?: string;
}

export interface MacroGroup {
  id: string;
  title: string;
  color: string;
  nodeIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed?: boolean;
}

export type ActionType =
  | 'Event (Start)'
  | 'Event (Key Pressed)'
  | 'Event (Key Released)'
  | 'Event (Mouse Event)'
  | 'Event (Timer Tick)'
  | 'Search Color'
  | 'Multi-Image Search'
  | 'Move Mouse'
  | 'Human Click'
  | 'Click Mouse'
  | 'Press Key'
  | 'Delay'
  | 'Condition (If)'
  | 'Compare'
  | 'Set Variable'
  | 'Get Variable'
  | 'Math Operation'
  | 'Repeat Loop'
  | 'While Color Exists'
  | 'Loop (While)'
  | 'Loop (For Range)'
  | 'Break'
  | 'Continue'
  | 'ADB Tap'
  | 'ADB Swipe'
  | 'ADB Shell'
  | 'Notification'
  | 'Sound Beep'
  | 'Log Message'
  | 'Script Block'
  | 'Custom Action';

export interface MacroNode {
  id: string;
  actionType: ActionType;
  title?: string;
  parameters: string;
  positionX: number;
  positionY: number;
  nextNodes: string[];
  nodeCategory?: 'event' | 'action' | 'vision' | 'condition' | 'variable' | 'loop' | 'script' | 'adb' | 'utility';
  inputs?: NodePort[];
  outputs?: NodePort[];
  conditionBranch?: {
    trueNodeId?: string;
    falseNodeId?: string;
  };
  loopBranch?: {
    bodyNodeId?: string;
    doneNodeId?: string;
  };
  group?: string;
  comment?: string;
  disabled?: boolean;
  executionTimeMs?: number;
  lastExecutionStatus?: 'idle' | 'running' | 'success' | 'failed';
  variables?: Record<string, any>;
  customActionId?: string;
  data?: Record<string, any>;
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
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
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
  marqueeAnimationMode?: 'cyberNeon' | 'laserPulse' | 'matrixSmooth' | 'amberClassic' | 'gradientWave';
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
  isMacroRunning?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'macro';
}

export type BlockCategory =
  | 'motion'
  | 'looks'
  | 'sound'
  | 'events'
  | 'control'
  | 'sensing'
  | 'operators'
  | 'variables'
  | 'myblocks'
  | 'actions'
  | 'conditions'
  | 'loops'
  | 'math'
  | 'string'
  | 'boolean'
  | 'timing'
  | 'input'
  | 'mouse'
  | 'keyboard'
  | 'adb'
  | 'utility'
  | 'custom';

export type BlockShape = 'hat' | 'command' | 'c_block' | 'reporter' | 'boolean';

export type BlockSocketType = 'statement' | 'number' | 'string' | 'boolean' | 'variable' | 'any';

export interface BlockParameterDef {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'color' | 'coords' | 'variable';
  label: string;
  defaultValue: any;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface BlockNode {
  id: string;
  type: string;
  category: BlockCategory;
  title: string;
  color: string;
  shape?: BlockShape;
  returnType?: 'statement' | 'number' | 'string' | 'boolean';
  icon?: string;
  description?: string;
  parameters: Record<string, any>;
  hasContainerSlot?: boolean;
  statementSlots?: string[]; // e.g. ['then', 'else'] or ['body'] or ['actions']
  childSlots?: Record<string, BlockNode[]>; // e.g. { then: [...], else: [...] } or { body: [...] }
  comment?: string;
  isCollapsed?: boolean;
  hasBreakpoint?: boolean;
  isBreakpointBlock?: boolean;
  isDisabled?: boolean;
  customBlockId?: string;
  subMacroId?: string;
  positionX?: number;
  positionY?: number;
}

export interface CustomBlockInputDef {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'variable';
  defaultValue: any;
  label?: string;
}

export interface CustomBlockOutputDef {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean';
}

export interface CustomBlockDefinition {
  id: string;
  name: string;
  category: BlockCategory;
  color: string;
  icon: string;
  description: string;
  inputs: CustomBlockInputDef[];
  outputs: CustomBlockOutputDef[];
  internalBlocks: BlockNode[];
  createdAt: string;
  version?: number;
}

export interface SubMacroDefinition {
  id: string;
  name: string;
  description: string;
  parameters: Array<{ name: string; type: string; defaultValue: any }>;
  blocks: BlockNode[];
  createdAt: string;
}

export interface DebuggerState {
  status: 'idle' | 'running' | 'paused' | 'stepping' | 'error' | 'completed';
  activeBlockId?: string | null;
  currentBlockId?: string | null;
  stepCount: number;
  executionTimeMs: number;
  error?: string | null;
  pausedReason?: 'breakpoint' | 'manual' | 'step' | 'error';
  stepMode?: 'over' | 'into' | 'out';
  callStack?: Array<{ macroName: string; blockId: string; blockTitle: string }>;
}

export interface ExecutionHistoryItem {
  id: string;
  timestamp: number;
  blockId: string;
  blockTitle: string;
  category: string;
  status: 'success' | 'failed' | 'paused' | 'skipped' | 'running';
  durationMs: number;
  message: string;
  variablesSnapshot: Record<string, any>;
}

export interface ExecutionTraceItem {
  id: string;
  timestamp: number;
  macroId?: string;
  blockId: string;
  blockTitle: string;
  category: string;
  state: 'start' | 'success' | 'failed' | 'paused' | 'retrying';
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  durationMs: number;
  error?: string;
}

export interface RuntimeErrorModel {
  errorId: string;
  timestamp: number;
  message: string;
  blockId: string;
  blockTitle: string;
  macroId?: string;
  context?: Record<string, any>;
  severity: 'warning' | 'error' | 'fatal';
  recoveryStrategy?: 'stop' | 'retry' | 'continue' | 'fallback';
  retryCount?: number;
}

export interface PerformanceBlockMetric {
  blockId: string;
  title: string;
  category: string;
  executionCount: number;
  totalTimeMs: number;
  avgTimeMs: number;
  maxTimeMs: number;
  minTimeMs: number;
}

export interface PerformanceProfileReport {
  totalExecutionTimeMs: number;
  totalBlocksExecuted: number;
  perBlockMetrics: Record<string, PerformanceBlockMetric>;
  slowestBlocks: PerformanceBlockMetric[];
  loopCounts: Record<string, number>;
  callDepthMax: number;
}

export interface VersionDiffResult {
  addedBlocks: BlockNode[];
  removedBlocks: BlockNode[];
  modifiedBlocks: Array<{
    blockId: string;
    title: string;
    changes: string[];
    oldBlock: BlockNode;
    newBlock: BlockNode;
  }>;
  variableChanges: Array<{
    name: string;
    type: 'added' | 'removed' | 'changed';
    oldValue?: any;
    newValue?: any;
  }>;
}

export type ConflictResolutionOption = 'replace' | 'keep_both' | 'rename_imported';

export type ErrorRecoveryStrategy = 'halt' | 'skip_and_continue' | 'retry' | 'fallback_action';

export interface AiBlockGenerationResponse {
  success: boolean;
  explanation: string;
  blocks: BlockNode[];
  suggestedVariables?: MacroVariable[];
  validationErrors?: string[];
}

export interface AiMacroValidationResponse {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
  complexityScore: number;
}

export interface AiDebugAnalysisResponse {
  errorSummary: string;
  rootCause: string;
  suggestedFix: string;
  recommendedBlockChanges?: {
    blockId: string;
    replacementParameters?: Record<string, any>;
    explanation: string;
  }[];
}

export interface MacroVersionSnapshot {
  id: string;
  versionNumber: number;
  timestamp: string;
  label: string;
  description?: string;
  nodeGraph: MacroNode[];
  blockCoding: BlockNode[];
  variables: MacroVariable[];
  customBlocks: CustomBlockDefinition[];
  isAutoSave?: boolean;
}

export interface MacroTemplateDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  tags: string[];
  blockCoding: BlockNode[];
  nodeGraph?: MacroNode[];
  variables?: MacroVariable[];
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

