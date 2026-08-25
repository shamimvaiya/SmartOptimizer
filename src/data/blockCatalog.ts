import { BlockCategory, BlockNode, BlockParameterDef } from '../types';

export interface BlockPrototype {
  type: string;
  category: BlockCategory;
  title: string;
  color: string;
  icon: string;
  description: string;
  parameters: BlockParameterDef[];
  hasContainerSlot?: boolean;
  statementSlots?: string[];
  defaultChildSlots?: Record<string, BlockNode[]>;
  isBreakpointBlock?: boolean;
}

export const CATEGORY_METADATA: Record<
  BlockCategory,
  { name: string; label: string; color: string; border: string; glow: string; icon: string }
> = {
  events: { name: 'Events', label: 'Events & Triggers', color: '#eab308', border: '#ca8a04', glow: 'rgba(234, 179, 8, 0.4)', icon: 'Zap' },
  actions: { name: 'Actions', label: 'Direct Actions', color: '#2979ff', border: '#1d4ed8', glow: 'rgba(41, 121, 255, 0.4)', icon: 'Play' },
  conditions: { name: 'Conditions', label: 'Logic & Conditions', color: '#ff007f', border: '#be123c', glow: 'rgba(255, 0, 127, 0.4)', icon: 'GitBranch' },
  loops: { name: 'Loops', label: 'Repeat & Iterators', color: '#ffd600', border: '#d97706', glow: 'rgba(255, 214, 0, 0.4)', icon: 'Repeat' },
  variables: { name: 'Variables', label: 'State & Variables', color: '#a855f7', border: '#7e22ce', glow: 'rgba(168, 85, 247, 0.4)', icon: 'Variable' },
  math: { name: 'Math', label: 'Arithmetic & Formulas', color: '#06b6d4', border: '#0891b2', glow: 'rgba(6, 182, 212, 0.4)', icon: 'Calculator' },
  string: { name: 'String', label: 'Text & Formatting', color: '#10b981', border: '#059669', glow: 'rgba(16, 185, 129, 0.4)', icon: 'Type' },
  boolean: { name: 'Boolean', label: 'Boolean Logic', color: '#ec4899', border: '#db2777', glow: 'rgba(236, 72, 153, 0.4)', icon: 'ToggleRight' },
  timing: { name: 'Timing', label: 'Delays & Clocks', color: '#f59e0b', border: '#d97706', glow: 'rgba(245, 158, 11, 0.4)', icon: 'Clock' },
  input: { name: 'Input', label: 'Input Sensing', color: '#3b82f6', border: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)', icon: 'MousePointer' },
  mouse: { name: 'Mouse', label: 'Mouse Controls', color: '#00e5ff', border: '#0284c7', glow: 'rgba(0, 229, 255, 0.4)', icon: 'Crosshair' },
  keyboard: { name: 'Keyboard', label: 'Keyboard Actions', color: '#d500f9', border: '#a21caf', glow: 'rgba(213, 0, 249, 0.4)', icon: 'Keyboard' },
  adb: { name: 'ADB', label: 'ADB Bridge & Emulator', color: '#00e676', border: '#15803d', glow: 'rgba(0, 230, 118, 0.4)', icon: 'Smartphone' },
  utility: { name: 'Utility', label: 'Debug & Utilities', color: '#64748b', border: '#475569', glow: 'rgba(100, 116, 139, 0.4)', icon: 'Sliders' },
  custom: { name: 'Custom', label: 'Custom Blocks & Sub-Macros', color: '#f43f5e', border: '#e11d48', glow: 'rgba(244, 63, 94, 0.4)', icon: 'Boxes' },
};

export const BLOCK_CATALOG: BlockPrototype[] = [
  // --- 1. EVENTS ---
  {
    type: 'event_start',
    category: 'events',
    title: 'When Macro Starts',
    color: '#eab308',
    icon: 'Zap',
    description: 'Triggered when the macro execution begins.',
    parameters: [
      { id: 'triggerMode', name: 'triggerMode', type: 'select', label: 'Trigger Mode', defaultValue: 'OnHotkey', options: [{ label: 'On Hotkey Press', value: 'OnHotkey' }, { label: 'Immediate Start', value: 'Immediate' }, { label: 'On Game Launch', value: 'OnLaunch' }] },
    ],
    hasContainerSlot: true,
    statementSlots: ['actions'],
  },
  {
    type: 'event_key_pressed',
    category: 'events',
    title: 'When Key Pressed',
    color: '#eab308',
    icon: 'Keyboard',
    description: 'Triggered whenever a specific hardware key is pressed down.',
    parameters: [
      { id: 'key', name: 'key', type: 'string', label: 'Trigger Key', defaultValue: 'F1', placeholder: 'e.g. F1, Space, X' },
    ],
    hasContainerSlot: true,
    statementSlots: ['actions'],
  },
  {
    type: 'event_timer_tick',
    category: 'events',
    title: 'Every Interval (ms)',
    color: '#eab308',
    icon: 'Clock',
    description: 'Repeatedly executes internal action blocks at a steady time interval.',
    parameters: [
      { id: 'intervalMs', name: 'intervalMs', type: 'number', label: 'Interval (ms)', defaultValue: 1000, min: 10, max: 60000, step: 50 },
    ],
    hasContainerSlot: true,
    statementSlots: ['actions'],
  },

  // --- 2. ACTIONS ---
  {
    type: 'action_human_click',
    category: 'actions',
    title: 'Humanized Click',
    color: '#2979ff',
    icon: 'MousePointer',
    description: 'Simulates organic human clicking with micro-jitter and natural duration.',
    parameters: [
      { id: 'button', name: 'button', type: 'select', label: 'Mouse Button', defaultValue: 'left', options: [{ label: 'Left Button', value: 'left' }, { label: 'Right Button', value: 'right' }, { label: 'Middle Button', value: 'middle' }] },
      { id: 'jitterRadius', name: 'jitterRadius', type: 'number', label: 'Offset Jitter (px)', defaultValue: 3, min: 0, max: 20 },
      { id: 'holdDurationMs', name: 'holdDurationMs', type: 'number', label: 'Hold Time (ms)', defaultValue: 45, min: 10, max: 500 },
    ],
  },
  {
    type: 'action_move_mouse',
    category: 'actions',
    title: 'Move Cursor To',
    color: '#2979ff',
    icon: 'Crosshair',
    description: 'Moves cursor to specific absolute coordinates using Bezier curve physics.',
    parameters: [
      { id: 'x', name: 'x', type: 'number', label: 'Target X', defaultValue: 960 },
      { id: 'y', name: 'y', type: 'number', label: 'Target Y', defaultValue: 540 },
      { id: 'smooth', name: 'smooth', type: 'boolean', label: 'Smooth Human Curve', defaultValue: true },
    ],
  },
  {
    type: 'action_press_key',
    category: 'actions',
    title: 'Press & Release Key',
    color: '#2979ff',
    icon: 'Keyboard',
    description: 'Sends hardware key down and up event sequence.',
    parameters: [
      { id: 'key', name: 'key', type: 'string', label: 'Key Name', defaultValue: 'R', placeholder: 'e.g. R, Shift, Ctrl' },
      { id: 'durationMs', name: 'durationMs', type: 'number', label: 'Press Duration (ms)', defaultValue: 60, min: 10, max: 1000 },
    ],
  },
  {
    type: 'action_send_text',
    category: 'actions',
    title: 'Type Text Sentence',
    color: '#2979ff',
    icon: 'Type',
    description: 'Types a sequence of characters with human-like inter-key delays.',
    parameters: [
      { id: 'text', name: 'text', type: 'string', label: 'Text Message', defaultValue: 'Hello World', placeholder: 'Text or {{variable}}' },
      { id: 'delayBetweenKeys', name: 'delayBetweenKeys', type: 'number', label: 'Key Delay (ms)', defaultValue: 30, min: 5, max: 200 },
    ],
  },
  {
    type: 'action_log_message',
    category: 'actions',
    title: 'Log Message to Console',
    color: '#2979ff',
    icon: 'Terminal',
    description: 'Prints custom debug text to telemetry output window.',
    parameters: [
      { id: 'message', name: 'message', type: 'string', label: 'Log Content', defaultValue: 'Action executed successfully: {{mouseX}}, {{mouseY}}' },
      { id: 'level', name: 'level', type: 'select', label: 'Log Level', defaultValue: 'info', options: [{ label: 'Info', value: 'info' }, { label: 'Success', value: 'success' }, { label: 'Warning', value: 'warning' }, { label: 'Error', value: 'error' }] },
    ],
  },
  {
    type: 'action_sound_beep',
    category: 'actions',
    title: 'Audio Beep Alert',
    color: '#2979ff',
    icon: 'Volume2',
    description: 'Plays a frequency synthesizer beep sound for audible feedback.',
    parameters: [
      { id: 'frequency', name: 'frequency', type: 'number', label: 'Frequency (Hz)', defaultValue: 880, min: 200, max: 3000 },
      { id: 'durationMs', name: 'durationMs', type: 'number', label: 'Duration (ms)', defaultValue: 120, min: 30, max: 1000 },
    ],
  },

  // --- 3. CONDITIONS ---
  {
    type: 'condition_if_else',
    category: 'conditions',
    title: 'If / Else Branch',
    color: '#ff007f',
    icon: 'GitBranch',
    description: 'Evaluates logical expression and executes the corresponding branch.',
    parameters: [
      { id: 'expression', name: 'expression', type: 'string', label: 'Condition Expression', defaultValue: '{{targetLocked}} == true', placeholder: 'e.g. {{ammoCount}} > 0' },
    ],
    hasContainerSlot: true,
    statementSlots: ['then', 'else'],
  },
  {
    type: 'condition_color_found',
    category: 'conditions',
    title: 'If Pixel Color Present',
    color: '#ff007f',
    icon: 'Eye',
    description: 'Scans screen region for color and runs matching branch.',
    parameters: [
      { id: 'color', name: 'color', type: 'color', label: 'Target Color', defaultValue: '#39FF14' },
      { id: 'regionX', name: 'regionX', type: 'number', label: 'Search X', defaultValue: 860 },
      { id: 'regionY', name: 'regionY', type: 'number', label: 'Search Y', defaultValue: 440 },
      { id: 'width', name: 'width', type: 'number', label: 'Region Width', defaultValue: 200 },
      { id: 'height', name: 'height', type: 'number', label: 'Region Height', defaultValue: 200 },
      { id: 'tolerance', name: 'tolerance', type: 'number', label: 'Tolerance', defaultValue: 15, min: 0, max: 100 },
    ],
    hasContainerSlot: true,
    statementSlots: ['then', 'else'],
  },
  {
    type: 'condition_compare',
    category: 'conditions',
    title: 'Compare Variables',
    color: '#ff007f',
    icon: 'Sliders',
    description: 'Direct comparison between two variables or values.',
    parameters: [
      { id: 'leftOperand', name: 'leftOperand', type: 'string', label: 'Value A', defaultValue: '{{ammoCount}}' },
      { id: 'operator', name: 'operator', type: 'select', label: 'Operator', defaultValue: '>', options: [{ label: '== (Equal)', value: '==' }, { label: '!= (Not Equal)', value: '!=' }, { label: '> (Greater)', value: '>' }, { label: '< (Less)', value: '<' }, { label: '>= (Greater or Equal)', value: '>=' }, { label: '<= (Less or Equal)', value: '<=' }] },
      { id: 'rightOperand', name: 'rightOperand', type: 'string', label: 'Value B', defaultValue: '0' },
    ],
    hasContainerSlot: true,
    statementSlots: ['then', 'else'],
  },

  // --- 4. LOOPS ---
  {
    type: 'loop_repeat_count',
    category: 'loops',
    title: 'Repeat (N) Times',
    color: '#ffd600',
    icon: 'Repeat',
    description: 'Executes child blocks repeatedly for a fixed number of iterations.',
    parameters: [
      { id: 'count', name: 'count', type: 'number', label: 'Times to Repeat', defaultValue: 5, min: 1, max: 10000 },
      { id: 'counterVar', name: 'counterVar', type: 'string', label: 'Store Index In', defaultValue: 'i', placeholder: 'Variable name' },
    ],
    hasContainerSlot: true,
    statementSlots: ['body'],
  },
  {
    type: 'loop_while',
    category: 'loops',
    title: 'While Condition is True',
    color: '#ffd600',
    icon: 'RefreshCw',
    description: 'Repeats execution continuously while condition holds true.',
    parameters: [
      { id: 'condition', name: 'condition', type: 'string', label: 'While Condition', defaultValue: '{{targetLocked}} == true', placeholder: 'e.g. {{health}} > 20' },
      { id: 'maxIterations', name: 'maxIterations', type: 'number', label: 'Safety Limit', defaultValue: 500, min: 1, max: 100000 },
    ],
    hasContainerSlot: true,
    statementSlots: ['body'],
  },
  {
    type: 'loop_break',
    category: 'loops',
    title: 'Break Out of Loop',
    color: '#ffd600',
    icon: 'Square',
    description: 'Terminates the nearest enclosing loop immediately.',
    parameters: [],
  },
  {
    type: 'loop_continue',
    category: 'loops',
    title: 'Continue Next Iteration',
    color: '#ffd600',
    icon: 'RotateCcw',
    description: 'Skips the remaining blocks in the current iteration and starts next.',
    parameters: [],
  },

  // --- 5. VARIABLES ---
  {
    type: 'var_set',
    category: 'variables',
    title: 'Set Variable Value',
    color: '#a855f7',
    icon: 'Variable',
    description: 'Assigns a new value or expression result to a variable.',
    parameters: [
      { id: 'varName', name: 'varName', type: 'string', label: 'Variable Name', defaultValue: 'ammoCount', placeholder: 'Variable identifier' },
      { id: 'value', name: 'value', type: 'string', label: 'New Value', defaultValue: '30', placeholder: 'Number, string, or boolean' },
    ],
  },
  {
    type: 'var_change_by',
    category: 'variables',
    title: 'Change Variable By',
    color: '#a855f7',
    icon: 'Plus',
    description: 'Increments or decrements a numeric variable by an amount.',
    parameters: [
      { id: 'varName', name: 'varName', type: 'string', label: 'Variable Name', defaultValue: 'ammoCount' },
      { id: 'delta', name: 'delta', type: 'number', label: 'Amount', defaultValue: -1 },
    ],
  },

  // --- 6. MATH ---
  {
    type: 'math_calc',
    category: 'math',
    title: 'Calculate Math Formula',
    color: '#06b6d4',
    icon: 'Calculator',
    description: 'Computes arithmetic operations and stores result in target variable.',
    parameters: [
      { id: 'outputVar', name: 'outputVar', type: 'string', label: 'Save Result In', defaultValue: 'calcResult' },
      { id: 'operandA', name: 'operandA', type: 'string', label: 'Operand A', defaultValue: '{{mouseX}}' },
      { id: 'operator', name: 'operator', type: 'select', label: 'Math Op', defaultValue: '+', options: [{ label: '+ (Add)', value: '+' }, { label: '- (Subtract)', value: '-' }, { label: '* (Multiply)', value: '*' }, { label: '/ (Divide)', value: '/' }, { label: '% (Modulo)', value: '%' }] },
      { id: 'operandB', name: 'operandB', type: 'string', label: 'Operand B', defaultValue: '25' },
    ],
  },
  {
    type: 'math_random',
    category: 'math',
    title: 'Generate Random Number',
    color: '#06b6d4',
    icon: 'Sparkles',
    description: 'Generates a random integer or float within range.',
    parameters: [
      { id: 'outputVar', name: 'outputVar', type: 'string', label: 'Save Result In', defaultValue: 'randomVal' },
      { id: 'min', name: 'min', type: 'number', label: 'Min Value', defaultValue: 1 },
      { id: 'max', name: 'max', type: 'number', label: 'Max Value', defaultValue: 100 },
    ],
  },

  // --- 7. TIMING ---
  {
    type: 'timing_delay',
    category: 'timing',
    title: 'Delay Milliseconds',
    color: '#f59e0b',
    icon: 'Clock',
    description: 'Pauses macro execution for specified milliseconds.',
    parameters: [
      { id: 'durationMs', name: 'durationMs', type: 'number', label: 'Delay (ms)', defaultValue: 100, min: 1, max: 60000, step: 10 },
      { id: 'jitterMs', name: 'jitterMs', type: 'number', label: 'Random Jitter (ms)', defaultValue: 10, min: 0, max: 500 },
    ],
  },
  {
    type: 'timing_wait_until',
    category: 'timing',
    title: 'Wait Until Condition',
    color: '#f59e0b',
    icon: 'Clock',
    description: 'Suspends execution until condition becomes true or timeout expires.',
    parameters: [
      { id: 'condition', name: 'condition', type: 'string', label: 'Condition', defaultValue: '{{targetLocked}} == true' },
      { id: 'timeoutMs', name: 'timeoutMs', type: 'number', label: 'Timeout (ms)', defaultValue: 5000, min: 100, max: 60000 },
    ],
  },

  // --- 8. ADB & EMULATOR ---
  {
    type: 'adb_tap',
    category: 'adb',
    title: 'ADB Screen Tap',
    color: '#00e676',
    icon: 'Smartphone',
    description: 'Sends direct ADB input tap touch command to target emulator instance.',
    parameters: [
      { id: 'x', name: 'x', type: 'number', label: 'Screen X', defaultValue: 960 },
      { id: 'y', name: 'y', type: 'number', label: 'Screen Y', defaultValue: 540 },
    ],
  },
  {
    type: 'adb_swipe',
    category: 'adb',
    title: 'ADB Swipe Gesture',
    color: '#00e676',
    icon: 'MoveDown',
    description: 'Sends ADB drag swipe gesture with duration.',
    parameters: [
      { id: 'startX', name: 'startX', type: 'number', label: 'Start X', defaultValue: 500 },
      { id: 'startY', name: 'startY', type: 'number', label: 'Start Y', defaultValue: 800 },
      { id: 'endX', name: 'endX', type: 'number', label: 'End X', defaultValue: 500 },
      { id: 'endY', name: 'endY', type: 'number', label: 'End Y', defaultValue: 300 },
      { id: 'durationMs', name: 'durationMs', type: 'number', label: 'Swipe Time (ms)', defaultValue: 250, min: 50, max: 2000 },
    ],
  },
  {
    type: 'adb_shell',
    category: 'adb',
    title: 'ADB Shell Command',
    color: '#00e676',
    icon: 'Terminal',
    description: 'Executes raw shell command inside emulator Android VM.',
    parameters: [
      { id: 'command', name: 'command', type: 'string', label: 'Shell Command', defaultValue: 'input keyevent 4', placeholder: 'e.g. input keyevent 4' },
    ],
  },

  // --- 9. UTILITY & DEBUGGER ---
  {
    type: 'util_breakpoint',
    category: 'utility',
    title: 'Pause & Breakpoint Block',
    color: '#f43f5e',
    icon: 'Pause',
    description: 'Macro runtime statement block that forces execution pause for inspection.',
    parameters: [
      { id: 'reason', name: 'reason', type: 'string', label: 'Pause Note', defaultValue: 'Inspect ammo & target coordinates' },
    ],
    isBreakpointBlock: true,
  },
  {
    type: 'util_safe_halt',
    category: 'utility',
    title: 'Emergency Safe Halt',
    color: '#64748b',
    icon: 'Power',
    description: 'Instantly stops macro runtime cleanly and clears all active states.',
    parameters: [],
  },

  // --- 10. SUB-MACRO / CALL ---
  {
    type: 'macro_call_sub',
    category: 'custom',
    title: 'Call Sub-Macro Routine',
    color: '#f43f5e',
    icon: 'Boxes',
    description: 'Executes another macro workflow routine with isolated context.',
    parameters: [
      { id: 'subMacroName', name: 'subMacroName', type: 'string', label: 'Macro Name', defaultValue: 'TargetAcquisitionRoutine' },
      { id: 'passVariables', name: 'passVariables', type: 'boolean', label: 'Share Global Variables', defaultValue: true },
    ],
  },
];

export function createBlockInstance(
  prototype: BlockPrototype,
  customOverrides: Record<string, any> = {}
): BlockNode {
  const defaultParams: Record<string, any> = {};
  for (const p of prototype.parameters) {
    defaultParams[p.name] = p.defaultValue;
  }

  const childSlots: Record<string, BlockNode[]> = {};
  if (prototype.statementSlots) {
    for (const slot of prototype.statementSlots) {
      childSlots[slot] = prototype.defaultChildSlots?.[slot] ? [...prototype.defaultChildSlots[slot]] : [];
    }
  }

  // Separate block node root properties from parameter overrides
  const rootProps: Record<string, any> = {};
  const paramOverrides: Record<string, any> = {};

  const knownRootKeys = new Set([
    'id',
    'type',
    'category',
    'title',
    'color',
    'icon',
    'description',
    'parameters',
    'hasContainerSlot',
    'statementSlots',
    'childSlots',
    'isBreakpointBlock',
    'hasBreakpoint',
    'isDisabled',
    'isCollapsed',
    'positionX',
    'positionY',
    'comment',
  ]);

  for (const [k, v] of Object.entries(customOverrides)) {
    if (knownRootKeys.has(k)) {
      rootProps[k] = v;
    } else {
      paramOverrides[k] = v;
    }
  }

  return {
    id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: prototype.type,
    category: prototype.category,
    title: prototype.title,
    color: prototype.color,
    icon: prototype.icon,
    description: prototype.description,
    parameters: {
      ...defaultParams,
      ...(customOverrides.parameters || {}),
      ...paramOverrides,
    },
    hasContainerSlot: prototype.hasContainerSlot,
    statementSlots: prototype.statementSlots,
    childSlots: prototype.hasContainerSlot ? childSlots : undefined,
    isBreakpointBlock: prototype.isBreakpointBlock,
    hasBreakpoint: false,
    isDisabled: false,
    isCollapsed: false,
    ...rootProps,
  };
}
