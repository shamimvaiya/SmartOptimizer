import { BlockCategory, BlockNode, BlockParameterDef, BlockShape } from '../types';

export interface BlockPrototype {
  type: string;
  category: BlockCategory;
  title: string;
  color: string;
  shape?: BlockShape;
  returnType?: 'statement' | 'number' | 'string' | 'boolean';
  icon?: string;
  description: string;
  parameters: BlockParameterDef[];
  hasContainerSlot?: boolean;
  statementSlots?: string[];
  defaultChildSlots?: Record<string, BlockNode[]>;
  isBreakpointBlock?: boolean;
}

export const SCRATCH_CATEGORIES: Array<{
  id: BlockCategory;
  name: string;
  label: string;
  bnLabel: string;
  color: string;
  borderColor: string;
  icon: string;
}> = [
  { id: 'motion', name: 'Motion', label: 'Motion & Movement', bnLabel: 'মোশন', color: '#4C97FF', borderColor: '#3373CC', icon: 'Move' },
  { id: 'looks', name: 'Looks', label: 'Looks & Display', bnLabel: 'লুকস', color: '#9966FF', borderColor: '#7744CC', icon: 'Smile' },
  { id: 'sound', name: 'Sound', label: 'Sound & Audio', bnLabel: 'সাউন্ড', color: '#CF63CF', borderColor: '#BD42BD', icon: 'Volume2' },
  { id: 'events', name: 'Events', label: 'Events & Triggers', bnLabel: 'ইভেন্ট', color: '#FFBF00', borderColor: '#CC9900', icon: 'Zap' },
  { id: 'control', name: 'Control', label: 'Control & Loops', bnLabel: 'কন্ট্রোল', color: '#FFAB19', borderColor: '#CF8B00', icon: 'GitBranch' },
  { id: 'sensing', name: 'Sensing', label: 'Sensing & Input', bnLabel: 'সেন্সিং', color: '#4CBFE6', borderColor: '#2E99BF', icon: 'Eye' },
  { id: 'operators', name: 'Operators', label: 'Operators & Math', bnLabel: 'অপারেটর', color: '#59C059', borderColor: '#389438', icon: 'Calculator' },
  { id: 'variables', name: 'Variables', label: 'Variables & Data', bnLabel: 'ভেরিয়েবল', color: '#FF8C1A', borderColor: '#DB6E00', icon: 'Variable' },
  { id: 'myblocks', name: 'My Blocks', label: 'My Blocks / Custom', bnLabel: 'কাস্টম ব্লক', color: '#FF6680', borderColor: '#CF455C', icon: 'Boxes' },
  { id: 'adb', name: 'ADB', label: 'ADB Bridge & Emulator', bnLabel: 'ADB অ্যাকশন', color: '#FF4D6A', borderColor: '#D92B48', icon: 'Smartphone' },
];

export const CATEGORY_METADATA: Record<
  string,
  { name: string; label: string; color: string; border: string; glow: string; icon: string }
> = {
  motion: { name: 'Motion', label: 'Motion', color: '#4C97FF', border: '#3373CC', glow: 'rgba(76, 151, 255, 0.4)', icon: 'Move' },
  actions: { name: 'Motion', label: 'Motion & Actions', color: '#4C97FF', border: '#3373CC', glow: 'rgba(76, 151, 255, 0.4)', icon: 'Play' },
  looks: { name: 'Looks', label: 'Looks & Display', color: '#9966FF', border: '#7744CC', glow: 'rgba(153, 102, 255, 0.4)', icon: 'Smile' },
  sound: { name: 'Sound', label: 'Sound & Audio', color: '#CF63CF', border: '#BD42BD', glow: 'rgba(207, 99, 207, 0.4)', icon: 'Volume2' },
  events: { name: 'Events', label: 'Events & Triggers', color: '#FFBF00', border: '#CC9900', glow: 'rgba(255, 191, 0, 0.4)', icon: 'Zap' },
  control: { name: 'Control', label: 'Control & Logic', color: '#FFAB19', border: '#CF8B00', glow: 'rgba(255, 171, 25, 0.4)', icon: 'GitBranch' },
  conditions: { name: 'Control', label: 'Control & Logic', color: '#FFAB19', border: '#CF8B00', glow: 'rgba(255, 171, 25, 0.4)', icon: 'GitBranch' },
  loops: { name: 'Control', label: 'Loops & Iterators', color: '#FFAB19', border: '#CF8B00', glow: 'rgba(255, 171, 25, 0.4)', icon: 'Repeat' },
  sensing: { name: 'Sensing', label: 'Sensing & Input', color: '#4CBFE6', border: '#2E99BF', glow: 'rgba(76, 191, 230, 0.4)', icon: 'Eye' },
  input: { name: 'Sensing', label: 'Input Sensing', color: '#4CBFE6', border: '#2E99BF', glow: 'rgba(76, 191, 230, 0.4)', icon: 'MousePointer' },
  mouse: { name: 'Sensing', label: 'Mouse Controls', color: '#4CBFE6', border: '#2E99BF', glow: 'rgba(76, 191, 230, 0.4)', icon: 'Crosshair' },
  keyboard: { name: 'Sensing', label: 'Keyboard Actions', color: '#4CBFE6', border: '#2E99BF', glow: 'rgba(76, 191, 230, 0.4)', icon: 'Keyboard' },
  operators: { name: 'Operators', label: 'Operators & Math', color: '#59C059', border: '#389438', glow: 'rgba(89, 192, 89, 0.4)', icon: 'Calculator' },
  math: { name: 'Operators', label: 'Math Operators', color: '#59C059', border: '#389438', glow: 'rgba(89, 192, 89, 0.4)', icon: 'Calculator' },
  string: { name: 'Operators', label: 'String Operations', color: '#59C059', border: '#389438', glow: 'rgba(89, 192, 89, 0.4)', icon: 'Type' },
  boolean: { name: 'Operators', label: 'Boolean Logic', color: '#59C059', border: '#389438', glow: 'rgba(89, 192, 89, 0.4)', icon: 'ToggleRight' },
  variables: { name: 'Variables', label: 'Variables', color: '#FF8C1A', border: '#DB6E00', glow: 'rgba(255, 140, 26, 0.4)', icon: 'Variable' },
  myblocks: { name: 'My Blocks', label: 'My Blocks', color: '#FF6680', border: '#CF455C', glow: 'rgba(255, 102, 128, 0.4)', icon: 'Boxes' },
  custom: { name: 'My Blocks', label: 'My Blocks', color: '#FF6680', border: '#CF455C', glow: 'rgba(255, 102, 128, 0.4)', icon: 'Boxes' },
  adb: { name: 'ADB', label: 'ADB Bridge & Emulator', color: '#FF4D6A', border: '#D92B48', glow: 'rgba(255, 77, 106, 0.4)', icon: 'Smartphone' },
  timing: { name: 'Control', label: 'Timing & Clocks', color: '#FFAB19', border: '#CF8B00', glow: 'rgba(255, 171, 25, 0.4)', icon: 'Clock' },
  utility: { name: 'Utility', label: 'Debug & Utilities', color: '#64748b', border: '#475569', glow: 'rgba(100, 116, 139, 0.4)', icon: 'Sliders' },
};

export const BLOCK_CATALOG: BlockPrototype[] = [
  // ==========================================
  // 1. MOTION BLOCKS (Blue #4C97FF)
  // ==========================================
  {
    type: 'motion_move_steps',
    category: 'motion',
    title: 'move steps',
    shape: 'command',
    color: '#4C97FF',
    icon: 'Move',
    description: 'Moves sprite forward by specified number of steps.',
    parameters: [
      { id: 'steps', name: 'steps', type: 'number', label: 'steps', defaultValue: 10, min: -1000, max: 1000 },
    ],
  },
  {
    type: 'motion_turn_right',
    category: 'motion',
    title: 'turn ↻ degrees',
    shape: 'command',
    color: '#4C97FF',
    icon: 'RotateCw',
    description: 'Rotates clockwise by degrees.',
    parameters: [
      { id: 'degrees', name: 'degrees', type: 'number', label: 'degrees', defaultValue: 15, min: 0, max: 360 },
    ],
  },
  {
    type: 'motion_turn_left',
    category: 'motion',
    title: 'turn ↺ degrees',
    shape: 'command',
    color: '#4C97FF',
    icon: 'RotateCcw',
    description: 'Rotates counter-clockwise by degrees.',
    parameters: [
      { id: 'degrees', name: 'degrees', type: 'number', label: 'degrees', defaultValue: 15, min: 0, max: 360 },
    ],
  },
  {
    type: 'motion_goto_menu',
    category: 'motion',
    title: 'go to',
    shape: 'command',
    color: '#4C97FF',
    icon: 'Crosshair',
    description: 'Jumps to random position or mouse-pointer.',
    parameters: [
      {
        id: 'destination',
        name: 'destination',
        type: 'select',
        label: 'to',
        defaultValue: 'random position',
        options: [
          { label: 'random position', value: 'random position' },
          { label: 'mouse-pointer', value: 'mouse-pointer' },
          { label: 'center (0, 0)', value: 'center' },
        ],
      },
    ],
  },
  {
    type: 'motion_gotoxy',
    category: 'motion',
    title: 'go to x: y:',
    shape: 'command',
    color: '#4C97FF',
    icon: 'Crosshair',
    description: 'Sets sprite position to specific X and Y coordinates.',
    parameters: [
      { id: 'x', name: 'x', type: 'number', label: 'x', defaultValue: 0 },
      { id: 'y', name: 'y', type: 'number', label: 'y', defaultValue: 0 },
    ],
  },
  {
    type: 'motion_glideto',
    category: 'motion',
    title: 'glide secs to x: y:',
    shape: 'command',
    color: '#4C97FF',
    icon: 'Navigation',
    description: 'Smoothly glides over time to target coordinates.',
    parameters: [
      { id: 'secs', name: 'secs', type: 'number', label: 'secs', defaultValue: 1, min: 0.1, max: 60 },
      { id: 'x', name: 'x', type: 'number', label: 'x', defaultValue: 0 },
      { id: 'y', name: 'y', type: 'number', label: 'y', defaultValue: 0 },
    ],
  },
  {
    type: 'motion_pointindirection',
    category: 'motion',
    title: 'point in direction',
    shape: 'command',
    color: '#4C97FF',
    icon: 'Compass',
    description: 'Points in angle direction (90 is right, -90 is left, 0 is up, 180 is down).',
    parameters: [
      { id: 'direction', name: 'direction', type: 'number', label: 'direction', defaultValue: 90, min: -180, max: 180 },
    ],
  },
  {
    type: 'motion_changexby',
    category: 'motion',
    title: 'change x by',
    shape: 'command',
    color: '#4C97FF',
    icon: 'ArrowRight',
    description: 'Changes X coordinate by delta value.',
    parameters: [
      { id: 'dx', name: 'dx', type: 'number', label: 'dx', defaultValue: 10 },
    ],
  },
  {
    type: 'motion_setx',
    category: 'motion',
    title: 'set x to',
    shape: 'command',
    color: '#4C97FF',
    icon: 'ArrowRight',
    description: 'Sets absolute X coordinate.',
    parameters: [
      { id: 'x', name: 'x', type: 'number', label: 'x', defaultValue: 0 },
    ],
  },
  {
    type: 'motion_changeyby',
    category: 'motion',
    title: 'change y by',
    shape: 'command',
    color: '#4C97FF',
    icon: 'ArrowUp',
    description: 'Changes Y coordinate by delta value.',
    parameters: [
      { id: 'dy', name: 'dy', type: 'number', label: 'dy', defaultValue: 10 },
    ],
  },
  {
    type: 'motion_sety',
    category: 'motion',
    title: 'set y to',
    shape: 'command',
    color: '#4C97FF',
    icon: 'ArrowUp',
    description: 'Sets absolute Y coordinate.',
    parameters: [
      { id: 'y', name: 'y', type: 'number', label: 'y', defaultValue: 0 },
    ],
  },
  {
    type: 'motion_setrotationstyle',
    category: 'motion',
    title: 'set rotation style',
    shape: 'command',
    color: '#4C97FF',
    icon: 'RefreshCw',
    description: 'Changes how sprite rotates.',
    parameters: [
      {
        id: 'style',
        name: 'style',
        type: 'select',
        label: 'style',
        defaultValue: 'left-right',
        options: [
          { label: 'left-right', value: 'left-right' },
          { label: "don't rotate", value: "don't rotate" },
          { label: 'all around', value: 'all around' },
        ],
      },
    ],
  },
  {
    type: 'motion_xposition',
    category: 'motion',
    title: 'x position',
    shape: 'reporter',
    returnType: 'number',
    color: '#4C97FF',
    icon: 'Activity',
    description: 'Current X position of sprite.',
    parameters: [],
  },
  {
    type: 'motion_yposition',
    category: 'motion',
    title: 'y position',
    shape: 'reporter',
    returnType: 'number',
    color: '#4C97FF',
    icon: 'Activity',
    description: 'Current Y position of sprite.',
    parameters: [],
  },
  {
    type: 'motion_direction',
    category: 'motion',
    title: 'direction',
    shape: 'reporter',
    returnType: 'number',
    color: '#4C97FF',
    icon: 'Compass',
    description: 'Current direction angle in degrees.',
    parameters: [],
  },
  {
    type: 'action_human_click',
    category: 'motion',
    title: 'human click',
    shape: 'command',
    color: '#4C97FF',
    icon: 'MousePointer',
    description: 'Simulates humanized physical mouse click with organic jitter.',
    parameters: [
      {
        id: 'button',
        name: 'button',
        type: 'select',
        label: 'button',
        defaultValue: 'left',
        options: [
          { label: 'left', value: 'left' },
          { label: 'right', value: 'right' },
          { label: 'middle', value: 'middle' },
        ],
      },
      { id: 'jitterRadius', name: 'jitterRadius', type: 'number', label: 'jitter (px)', defaultValue: 2, min: 0, max: 20 },
      { id: 'holdDurationMs', name: 'holdDurationMs', type: 'number', label: 'hold (ms)', defaultValue: 50, min: 10, max: 500 },
    ],
  },

  // ==========================================
  // 2. LOOKS BLOCKS (Purple #9966FF)
  // ==========================================
  {
    type: 'looks_sayforsecs',
    category: 'looks',
    title: 'say for secs',
    shape: 'command',
    color: '#9966FF',
    icon: 'MessageSquare',
    description: 'Displays a speech bubble for a duration.',
    parameters: [
      { id: 'message', name: 'message', type: 'string', label: 'say', defaultValue: 'Hello!' },
      { id: 'secs', name: 'secs', type: 'number', label: 'for secs', defaultValue: 2, min: 0.1, max: 60 },
    ],
  },
  {
    type: 'looks_say',
    category: 'looks',
    title: 'say',
    shape: 'command',
    color: '#9966FF',
    icon: 'MessageSquare',
    description: 'Displays a persistent speech bubble.',
    parameters: [
      { id: 'message', name: 'message', type: 'string', label: 'say', defaultValue: 'Hello!' },
    ],
  },
  {
    type: 'looks_switchcostumeto',
    category: 'looks',
    title: 'switch costume to',
    shape: 'command',
    color: '#9966FF',
    icon: 'Image',
    description: 'Changes visual costume.',
    parameters: [
      {
        id: 'costume',
        name: 'costume',
        type: 'select',
        label: 'costume',
        defaultValue: 'costume1',
        options: [
          { label: 'costume1', value: 'costume1' },
          { label: 'costume2', value: 'costume2' },
        ],
      },
    ],
  },
  {
    type: 'looks_nextcostume',
    category: 'looks',
    title: 'next costume',
    shape: 'command',
    color: '#9966FF',
    icon: 'SkipForward',
    description: 'Switches to the next costume in sequence.',
    parameters: [],
  },
  {
    type: 'looks_changesizeby',
    category: 'looks',
    title: 'change size by',
    shape: 'command',
    color: '#9966FF',
    icon: 'Maximize',
    description: 'Changes sprite scale by percentage points.',
    parameters: [
      { id: 'delta', name: 'delta', type: 'number', label: 'by', defaultValue: 10, min: -100, max: 100 },
    ],
  },
  {
    type: 'looks_setsizeto',
    category: 'looks',
    title: 'set size to %',
    shape: 'command',
    color: '#9966FF',
    icon: 'Maximize',
    description: 'Sets absolute sprite scale percentage.',
    parameters: [
      { id: 'size', name: 'size', type: 'number', label: 'size %', defaultValue: 100, min: 5, max: 500 },
    ],
  },
  {
    type: 'looks_seteffectto',
    category: 'looks',
    title: 'set effect to',
    shape: 'command',
    color: '#9966FF',
    icon: 'Sparkles',
    description: 'Applies visual shaders (color, ghost, brightness).',
    parameters: [
      {
        id: 'effect',
        name: 'effect',
        type: 'select',
        label: 'effect',
        defaultValue: 'color',
        options: [
          { label: 'color', value: 'color' },
          { label: 'ghost', value: 'ghost' },
          { label: 'brightness', value: 'brightness' },
          { label: 'fisheye', value: 'fisheye' },
        ],
      },
      { id: 'value', name: 'value', type: 'number', label: 'to', defaultValue: 0, min: 0, max: 100 },
    ],
  },
  {
    type: 'looks_cleargraphiceffects',
    category: 'looks',
    title: 'clear graphic effects',
    shape: 'command',
    color: '#9966FF',
    icon: 'Eraser',
    description: 'Resets all visual filters and tints.',
    parameters: [],
  },
  {
    type: 'looks_show',
    category: 'looks',
    title: 'show',
    shape: 'command',
    color: '#9966FF',
    icon: 'Eye',
    description: 'Makes the sprite visible on canvas.',
    parameters: [],
  },
  {
    type: 'looks_hide',
    category: 'looks',
    title: 'hide',
    shape: 'command',
    color: '#9966FF',
    icon: 'EyeOff',
    description: 'Hides the sprite from view.',
    parameters: [],
  },
  {
    type: 'looks_gotofrontback',
    category: 'looks',
    title: 'go to layer',
    shape: 'command',
    color: '#9966FF',
    icon: 'Layers',
    description: 'Moves sprite z-index layer.',
    parameters: [
      {
        id: 'layer',
        name: 'layer',
        type: 'select',
        label: 'layer',
        defaultValue: 'front',
        options: [
          { label: 'front', value: 'front' },
          { label: 'back', value: 'back' },
        ],
      },
    ],
  },
  {
    type: 'looks_goforwardbackwardlayers',
    category: 'looks',
    title: 'go layers',
    shape: 'command',
    color: '#9966FF',
    icon: 'Layers',
    description: 'Changes depth layer by number.',
    parameters: [
      {
        id: 'direction',
        name: 'direction',
        type: 'select',
        label: 'direction',
        defaultValue: 'forward',
        options: [
          { label: 'forward', value: 'forward' },
          { label: 'backward', value: 'backward' },
        ],
      },
      { id: 'num', name: 'num', type: 'number', label: 'layers', defaultValue: 1, min: 1, max: 50 },
    ],
  },
  {
    type: 'looks_costumenumbername',
    category: 'looks',
    title: 'costume',
    shape: 'reporter',
    returnType: 'number',
    color: '#9966FF',
    icon: 'Image',
    description: 'Current costume index number or name.',
    parameters: [
      {
        id: 'property',
        name: 'property',
        type: 'select',
        label: 'prop',
        defaultValue: 'number',
        options: [
          { label: 'number', value: 'number' },
          { label: 'name', value: 'name' },
        ],
      },
    ],
  },
  {
    type: 'looks_backdropnumbername',
    category: 'looks',
    title: 'backdrop',
    shape: 'reporter',
    returnType: 'number',
    color: '#9966FF',
    icon: 'Image',
    description: 'Current stage backdrop index number or name.',
    parameters: [
      {
        id: 'property',
        name: 'property',
        type: 'select',
        label: 'prop',
        defaultValue: 'number',
        options: [
          { label: 'number', value: 'number' },
          { label: 'name', value: 'name' },
        ],
      },
    ],
  },
  {
    type: 'looks_size',
    category: 'looks',
    title: 'size',
    shape: 'reporter',
    returnType: 'number',
    color: '#9966FF',
    icon: 'Maximize',
    description: 'Current scale size percentage.',
    parameters: [],
  },

  // ==========================================
  // 3. SOUND BLOCKS (Magenta #CF63CF)
  // ==========================================
  {
    type: 'sound_playuntildone',
    category: 'sound',
    title: 'play sound until done',
    shape: 'command',
    color: '#CF63CF',
    icon: 'Volume2',
    description: 'Plays audio clip and waits until completed.',
    parameters: [
      {
        id: 'sound',
        name: 'sound',
        type: 'select',
        label: 'sound',
        defaultValue: 'Meow',
        options: [
          { label: 'Meow', value: 'Meow' },
          { label: 'Pop', value: 'Pop' },
          { label: 'Laser', value: 'Laser' },
          { label: 'Coin', value: 'Coin' },
        ],
      },
    ],
  },
  {
    type: 'sound_play',
    category: 'sound',
    title: 'start sound',
    shape: 'command',
    color: '#CF63CF',
    icon: 'Volume2',
    description: 'Starts playing audio without blocking subsequent blocks.',
    parameters: [
      {
        id: 'sound',
        name: 'sound',
        type: 'select',
        label: 'sound',
        defaultValue: 'Meow',
        options: [
          { label: 'Meow', value: 'Meow' },
          { label: 'Pop', value: 'Pop' },
          { label: 'Laser', value: 'Laser' },
          { label: 'Coin', value: 'Coin' },
        ],
      },
    ],
  },
  {
    type: 'sound_stopallsounds',
    category: 'sound',
    title: 'stop all sounds',
    shape: 'command',
    color: '#CF63CF',
    icon: 'VolumeX',
    description: 'Immediately mutes and stops all audio playback.',
    parameters: [],
  },
  {
    type: 'sound_changeeffectby',
    category: 'sound',
    title: 'change effect by',
    shape: 'command',
    color: '#CF63CF',
    icon: 'Sliders',
    description: 'Changes pitch or pan audio effect.',
    parameters: [
      {
        id: 'effect',
        name: 'effect',
        type: 'select',
        label: 'effect',
        defaultValue: 'pitch',
        options: [
          { label: 'pitch', value: 'pitch' },
          { label: 'pan left/right', value: 'pan' },
        ],
      },
      { id: 'value', name: 'value', type: 'number', label: 'by', defaultValue: 10 },
    ],
  },
  {
    type: 'sound_seteffectto',
    category: 'sound',
    title: 'set effect to',
    shape: 'command',
    color: '#CF63CF',
    icon: 'Sliders',
    description: 'Sets absolute audio filter value.',
    parameters: [
      {
        id: 'effect',
        name: 'effect',
        type: 'select',
        label: 'effect',
        defaultValue: 'pitch',
        options: [
          { label: 'pitch', value: 'pitch' },
          { label: 'pan left/right', value: 'pan' },
        ],
      },
      { id: 'value', name: 'value', type: 'number', label: 'to', defaultValue: 100 },
    ],
  },
  {
    type: 'sound_cleareffects',
    category: 'sound',
    title: 'clear sound effects',
    shape: 'command',
    color: '#CF63CF',
    icon: 'Eraser',
    description: 'Resets all pitch and pan audio modifiers.',
    parameters: [],
  },
  {
    type: 'sound_changevolumeby',
    category: 'sound',
    title: 'change volume by',
    shape: 'command',
    color: '#CF63CF',
    icon: 'Volume1',
    description: 'Increments or decrements sound volume percentage.',
    parameters: [
      { id: 'delta', name: 'delta', type: 'number', label: 'by', defaultValue: -10, min: -100, max: 100 },
    ],
  },
  {
    type: 'sound_setvolumeto',
    category: 'sound',
    title: 'set volume to %',
    shape: 'command',
    color: '#CF63CF',
    icon: 'Volume2',
    description: 'Sets output sound level percentage.',
    parameters: [
      { id: 'volume', name: 'volume', type: 'number', label: 'volume', defaultValue: 100, min: 0, max: 100 },
    ],
  },
  {
    type: 'sound_volume',
    category: 'sound',
    title: 'volume',
    shape: 'reporter',
    returnType: 'number',
    color: '#CF63CF',
    icon: 'Volume2',
    description: 'Current sound volume percentage.',
    parameters: [],
  },

  // ==========================================
  // 4. EVENTS BLOCKS (Yellow/Gold #FFBF00)
  // ==========================================
  {
    type: 'event_whenflagclicked',
    category: 'events',
    title: 'when ⚑ clicked',
    shape: 'hat',
    color: '#FFBF00',
    icon: 'Flag',
    description: 'Triggered when the green run flag is clicked.',
    parameters: [],
  },
  {
    type: 'event_whenkeypressed',
    category: 'events',
    title: 'when key pressed',
    shape: 'hat',
    color: '#FFBF00',
    icon: 'Keyboard',
    description: 'Triggered when a specific key is pressed on keyboard.',
    parameters: [
      {
        id: 'key',
        name: 'key',
        type: 'select',
        label: 'key',
        defaultValue: 'space',
        options: [
          { label: 'space', value: 'space' },
          { label: 'up arrow', value: 'ArrowUp' },
          { label: 'down arrow', value: 'ArrowDown' },
          { label: 'left arrow', value: 'ArrowLeft' },
          { label: 'right arrow', value: 'ArrowRight' },
          { label: 'any', value: 'any' },
          { label: 'a', value: 'a' },
          { label: 'b', value: 'b' },
          { label: 'c', value: 'c' },
          { label: 'f1', value: 'F1' },
        ],
      },
    ],
  },
  {
    type: 'event_whenthisspriteclicked',
    category: 'events',
    title: 'when this sprite clicked',
    shape: 'hat',
    color: '#FFBF00',
    icon: 'MousePointer',
    description: 'Triggered when user clicks directly on the sprite.',
    parameters: [],
  },
  {
    type: 'event_whengreaterthan',
    category: 'events',
    title: 'when >',
    shape: 'hat',
    color: '#FFBF00',
    icon: 'Activity',
    description: 'Triggered when sensor value exceeds threshold.',
    parameters: [
      {
        id: 'menu',
        name: 'menu',
        type: 'select',
        label: 'sensor',
        defaultValue: 'loudness',
        options: [
          { label: 'loudness', value: 'loudness' },
          { label: 'timer', value: 'timer' },
        ],
      },
      { id: 'threshold', name: 'threshold', type: 'number', label: '>', defaultValue: 10 },
    ],
  },
  {
    type: 'event_whenbroadcastreceived',
    category: 'events',
    title: 'when I receive',
    shape: 'hat',
    color: '#FFBF00',
    icon: 'Radio',
    description: 'Triggered when a named broadcast message is transmitted.',
    parameters: [
      { id: 'message', name: 'message', type: 'string', label: 'message', defaultValue: 'message1' },
    ],
  },
  {
    type: 'event_broadcast',
    category: 'events',
    title: 'broadcast',
    shape: 'command',
    color: '#FFBF00',
    icon: 'Radio',
    description: 'Sends message to all scripts listening for it.',
    parameters: [
      { id: 'message', name: 'message', type: 'string', label: 'message', defaultValue: 'message1' },
    ],
  },
  {
    type: 'event_broadcastandwait',
    category: 'events',
    title: 'broadcast and wait',
    shape: 'command',
    color: '#FFBF00',
    icon: 'Radio',
    description: 'Sends broadcast and pauses until all receivers finish execution.',
    parameters: [
      { id: 'message', name: 'message', type: 'string', label: 'message', defaultValue: 'message1' },
    ],
  },

  // ==========================================
  // 5. CONTROL & LOOPS (Amber #FFAB19)
  // ==========================================
  {
    type: 'control_wait',
    category: 'control',
    title: 'wait seconds',
    shape: 'command',
    color: '#FFAB19',
    icon: 'Clock',
    description: 'Pauses execution for a duration in seconds.',
    parameters: [
      { id: 'duration', name: 'duration', type: 'number', label: 'secs', defaultValue: 1, min: 0.01, max: 3600 },
    ],
  },
  {
    type: 'control_repeat',
    category: 'control',
    title: 'repeat',
    shape: 'c_block',
    color: '#FFAB19',
    icon: 'Repeat',
    description: 'Runs child blocks a specified number of times.',
    parameters: [
      { id: 'times', name: 'times', type: 'number', label: 'times', defaultValue: 10, min: 1, max: 10000 },
    ],
    hasContainerSlot: true,
    statementSlots: ['body'],
  },
  {
    type: 'control_forever',
    category: 'control',
    title: 'forever',
    shape: 'c_block',
    color: '#FFAB19',
    icon: 'Infinity',
    description: 'Loops continuously until manually stopped.',
    parameters: [],
    hasContainerSlot: true,
    statementSlots: ['body'],
  },
  {
    type: 'control_if',
    category: 'control',
    title: 'if then',
    shape: 'c_block',
    color: '#FFAB19',
    icon: 'GitBranch',
    description: 'Executes child blocks only if condition evaluates to true.',
    parameters: [
      { id: 'condition', name: 'condition', type: 'string', label: 'condition', defaultValue: 'true' },
    ],
    hasContainerSlot: true,
    statementSlots: ['then'],
  },
  {
    type: 'control_if_else',
    category: 'control',
    title: 'if then else',
    shape: 'c_block',
    color: '#FFAB19',
    icon: 'GitFork',
    description: 'Executes "then" blocks if true, otherwise executes "else" blocks.',
    parameters: [
      { id: 'condition', name: 'condition', type: 'string', label: 'condition', defaultValue: 'true' },
    ],
    hasContainerSlot: true,
    statementSlots: ['then', 'else'],
  },
  {
    type: 'control_wait_until',
    category: 'control',
    title: 'wait until',
    shape: 'command',
    color: '#FFAB19',
    icon: 'Clock',
    description: 'Pauses until condition becomes true.',
    parameters: [
      { id: 'condition', name: 'condition', type: 'string', label: 'condition', defaultValue: 'mouse down?' },
    ],
  },
  {
    type: 'control_repeat_until',
    category: 'control',
    title: 'repeat until',
    shape: 'c_block',
    color: '#FFAB19',
    icon: 'RotateCcw',
    description: 'Repeats enclosed blocks until condition becomes true.',
    parameters: [
      { id: 'condition', name: 'condition', type: 'string', label: 'condition', defaultValue: 'false' },
    ],
    hasContainerSlot: true,
    statementSlots: ['body'],
  },
  {
    type: 'control_stop',
    category: 'control',
    title: 'stop',
    shape: 'command',
    color: '#FFAB19',
    icon: 'Octagon',
    description: 'Terminates all running scripts or this script.',
    parameters: [
      {
        id: 'stopOption',
        name: 'stopOption',
        type: 'select',
        label: 'mode',
        defaultValue: 'all',
        options: [
          { label: 'all', value: 'all' },
          { label: 'this script', value: 'this script' },
          { label: 'other scripts in sprite', value: 'other scripts in sprite' },
        ],
      },
    ],
  },

  // ==========================================
  // 6. SENSING BLOCKS (Cyan #4CBFE6)
  // ==========================================
  {
    type: 'sensing_touchingobject',
    category: 'sensing',
    title: 'touching ?',
    shape: 'boolean',
    returnType: 'boolean',
    color: '#4CBFE6',
    icon: 'Crosshair',
    description: 'Checks if sprite collides with mouse or target.',
    parameters: [
      {
        id: 'touchingOption',
        name: 'touchingOption',
        type: 'select',
        label: 'target',
        defaultValue: 'mouse-pointer',
        options: [
          { label: 'mouse-pointer', value: 'mouse-pointer' },
          { label: 'edge', value: 'edge' },
          { label: 'Sprite1', value: 'Sprite1' },
        ],
      },
    ],
  },
  {
    type: 'sensing_touchingcolor',
    category: 'sensing',
    title: 'touching color ?',
    shape: 'boolean',
    returnType: 'boolean',
    color: '#4CBFE6',
    icon: 'Pipette',
    description: 'Detects if sprite touches a specific pixel color.',
    parameters: [
      { id: 'color', name: 'color', type: 'color', label: 'color', defaultValue: '#FF0055' },
    ],
  },
  {
    type: 'sensing_distanceto',
    category: 'sensing',
    title: 'distance to',
    shape: 'reporter',
    returnType: 'number',
    color: '#4CBFE6',
    icon: 'Ruler',
    description: 'Calculates pixel distance to mouse or target.',
    parameters: [
      {
        id: 'target',
        name: 'target',
        type: 'select',
        label: 'to',
        defaultValue: 'mouse-pointer',
        options: [
          { label: 'mouse-pointer', value: 'mouse-pointer' },
          { label: 'Sprite1', value: 'Sprite1' },
        ],
      },
    ],
  },
  {
    type: 'sensing_askandwait',
    category: 'sensing',
    title: 'ask and wait',
    shape: 'command',
    color: '#4CBFE6',
    icon: 'HelpCircle',
    description: 'Prompts user with a question modal and waits for reply.',
    parameters: [
      { id: 'question', name: 'question', type: 'string', label: 'ask', defaultValue: "What's your name?" },
    ],
  },
  {
    type: 'sensing_answer',
    category: 'sensing',
    title: 'answer',
    shape: 'reporter',
    returnType: 'string',
    color: '#4CBFE6',
    icon: 'MessageSquare',
    description: 'Last text string submitted to "ask and wait".',
    parameters: [],
  },
  {
    type: 'sensing_keypressed',
    category: 'sensing',
    title: 'key pressed ?',
    shape: 'boolean',
    returnType: 'boolean',
    color: '#4CBFE6',
    icon: 'Keyboard',
    description: 'Returns true if specified key is held down.',
    parameters: [
      {
        id: 'key',
        name: 'key',
        type: 'select',
        label: 'key',
        defaultValue: 'space',
        options: [
          { label: 'space', value: 'space' },
          { label: 'up arrow', value: 'ArrowUp' },
          { label: 'down arrow', value: 'ArrowDown' },
          { label: 'left arrow', value: 'ArrowLeft' },
          { label: 'right arrow', value: 'ArrowRight' },
          { label: 'any', value: 'any' },
        ],
      },
    ],
  },
  {
    type: 'sensing_mousedown',
    category: 'sensing',
    title: 'mouse down ?',
    shape: 'boolean',
    returnType: 'boolean',
    color: '#4CBFE6',
    icon: 'MousePointer',
    description: 'Returns true if left mouse button is held down.',
    parameters: [],
  },
  {
    type: 'sensing_mousex',
    category: 'sensing',
    title: 'mouse x',
    shape: 'reporter',
    returnType: 'number',
    color: '#4CBFE6',
    icon: 'Crosshair',
    description: 'Current horizontal mouse cursor position on stage.',
    parameters: [],
  },
  {
    type: 'sensing_mousey',
    category: 'sensing',
    title: 'mouse y',
    shape: 'reporter',
    returnType: 'number',
    color: '#4CBFE6',
    icon: 'Crosshair',
    description: 'Current vertical mouse cursor position on stage.',
    parameters: [],
  },
  {
    type: 'sensing_setdragmode',
    category: 'sensing',
    title: 'set drag mode',
    shape: 'command',
    color: '#4CBFE6',
    icon: 'Move',
    description: 'Configures sprite draggable state by user cursor.',
    parameters: [
      {
        id: 'mode',
        name: 'mode',
        type: 'select',
        label: 'mode',
        defaultValue: 'draggable',
        options: [
          { label: 'draggable', value: 'draggable' },
          { label: 'not draggable', value: 'not draggable' },
        ],
      },
    ],
  },
  {
    type: 'sensing_timer',
    category: 'sensing',
    title: 'timer',
    shape: 'reporter',
    returnType: 'number',
    color: '#4CBFE6',
    icon: 'Clock',
    description: 'Seconds elapsed since project start or last timer reset.',
    parameters: [],
  },
  {
    type: 'sensing_resettimer',
    category: 'sensing',
    title: 'reset timer',
    shape: 'command',
    color: '#4CBFE6',
    icon: 'RotateCcw',
    description: 'Resets the system stopwatch timer back to 0.',
    parameters: [],
  },

  // ==========================================
  // 7. OPERATORS & MATH (Green #59C059)
  // ==========================================
  {
    type: 'operator_add',
    category: 'operators',
    title: '+',
    shape: 'reporter',
    returnType: 'number',
    color: '#59C059',
    icon: 'Plus',
    description: 'Adds two numbers together.',
    parameters: [
      { id: 'num1', name: 'num1', type: 'number', label: 'a', defaultValue: 0 },
      { id: 'num2', name: 'num2', type: 'number', label: 'b', defaultValue: 0 },
    ],
  },
  {
    type: 'operator_subtract',
    category: 'operators',
    title: '-',
    shape: 'reporter',
    returnType: 'number',
    color: '#59C059',
    icon: 'Minus',
    description: 'Subtracts second number from first number.',
    parameters: [
      { id: 'num1', name: 'num1', type: 'number', label: 'a', defaultValue: 0 },
      { id: 'num2', name: 'num2', type: 'number', label: 'b', defaultValue: 0 },
    ],
  },
  {
    type: 'operator_multiply',
    category: 'operators',
    title: '*',
    shape: 'reporter',
    returnType: 'number',
    color: '#59C059',
    icon: 'X',
    description: 'Multiplies two numbers together.',
    parameters: [
      { id: 'num1', name: 'num1', type: 'number', label: 'a', defaultValue: 0 },
      { id: 'num2', name: 'num2', type: 'number', label: 'b', defaultValue: 0 },
    ],
  },
  {
    type: 'operator_divide',
    category: 'operators',
    title: '/',
    shape: 'reporter',
    returnType: 'number',
    color: '#59C059',
    icon: 'Divide',
    description: 'Divides first number by second number.',
    parameters: [
      { id: 'num1', name: 'num1', type: 'number', label: 'a', defaultValue: 10 },
      { id: 'num2', name: 'num2', type: 'number', label: 'b', defaultValue: 2 },
    ],
  },
  {
    type: 'operator_random',
    category: 'operators',
    title: 'pick random to',
    shape: 'reporter',
    returnType: 'number',
    color: '#59C059',
    icon: 'Sparkles',
    description: 'Generates a random integer within inclusive bounds.',
    parameters: [
      { id: 'from', name: 'from', type: 'number', label: 'from', defaultValue: 1 },
      { id: 'to', name: 'to', type: 'number', label: 'to', defaultValue: 10 },
    ],
  },
  {
    type: 'operator_gt',
    category: 'operators',
    title: '>',
    shape: 'boolean',
    returnType: 'boolean',
    color: '#59C059',
    icon: 'ChevronRight',
    description: 'Tests if first value is strictly greater than second value.',
    parameters: [
      { id: 'val1', name: 'val1', type: 'string', label: 'a', defaultValue: '50' },
      { id: 'val2', name: 'val2', type: 'string', label: 'b', defaultValue: '50' },
    ],
  },
  {
    type: 'operator_lt',
    category: 'operators',
    title: '<',
    shape: 'boolean',
    returnType: 'boolean',
    color: '#59C059',
    icon: 'ChevronLeft',
    description: 'Tests if first value is strictly less than second value.',
    parameters: [
      { id: 'val1', name: 'val1', type: 'string', label: 'a', defaultValue: '50' },
      { id: 'val2', name: 'val2', type: 'string', label: 'b', defaultValue: '50' },
    ],
  },
  {
    type: 'operator_equals',
    category: 'operators',
    title: '=',
    shape: 'boolean',
    returnType: 'boolean',
    color: '#59C059',
    icon: 'Equal',
    description: 'Tests if two values or strings are identical.',
    parameters: [
      { id: 'val1', name: 'val1', type: 'string', label: 'a', defaultValue: '50' },
      { id: 'val2', name: 'val2', type: 'string', label: 'b', defaultValue: '50' },
    ],
  },
  {
    type: 'operator_and',
    category: 'operators',
    title: 'and',
    shape: 'boolean',
    returnType: 'boolean',
    color: '#59C059',
    icon: 'GitCommit',
    description: 'Returns true only if both conditions are true.',
    parameters: [
      { id: 'cond1', name: 'cond1', type: 'string', label: 'a', defaultValue: 'true' },
      { id: 'cond2', name: 'cond2', type: 'string', label: 'b', defaultValue: 'true' },
    ],
  },
  {
    type: 'operator_or',
    category: 'operators',
    title: 'or',
    shape: 'boolean',
    returnType: 'boolean',
    color: '#59C059',
    icon: 'GitBranch',
    description: 'Returns true if either of the conditions is true.',
    parameters: [
      { id: 'cond1', name: 'cond1', type: 'string', label: 'a', defaultValue: 'true' },
      { id: 'cond2', name: 'cond2', type: 'string', label: 'b', defaultValue: 'false' },
    ],
  },
  {
    type: 'operator_not',
    category: 'operators',
    title: 'not',
    shape: 'boolean',
    returnType: 'boolean',
    color: '#59C059',
    icon: 'AlertCircle',
    description: 'Inverts boolean value (True becomes False, False becomes True).',
    parameters: [
      { id: 'cond', name: 'cond', type: 'string', label: 'value', defaultValue: 'false' },
    ],
  },
  {
    type: 'operator_join',
    category: 'operators',
    title: 'join',
    shape: 'reporter',
    returnType: 'string',
    color: '#59C059',
    icon: 'Link2',
    description: 'Concatenates two strings together.',
    parameters: [
      { id: 'str1', name: 'str1', type: 'string', label: 'a', defaultValue: 'apple ' },
      { id: 'str2', name: 'str2', type: 'string', label: 'b', defaultValue: 'banana' },
    ],
  },
  {
    type: 'operator_letter_of',
    category: 'operators',
    title: 'letter of',
    shape: 'reporter',
    returnType: 'string',
    color: '#59C059',
    icon: 'Type',
    description: 'Gets character at 1-based index position.',
    parameters: [
      { id: 'letter', name: 'letter', type: 'number', label: 'letter', defaultValue: 1, min: 1 },
      { id: 'string', name: 'string', type: 'string', label: 'of', defaultValue: 'apple' },
    ],
  },
  {
    type: 'operator_length',
    category: 'operators',
    title: 'length of',
    shape: 'reporter',
    returnType: 'number',
    color: '#59C059',
    icon: 'Ruler',
    description: 'Counts total character count in text string.',
    parameters: [
      { id: 'string', name: 'string', type: 'string', label: 'string', defaultValue: 'apple' },
    ],
  },
  {
    type: 'operator_contains',
    category: 'operators',
    title: 'contains ?',
    shape: 'boolean',
    returnType: 'boolean',
    color: '#59C059',
    icon: 'Search',
    description: 'Returns true if substring exists inside text.',
    parameters: [
      { id: 'str1', name: 'str1', type: 'string', label: 'text', defaultValue: 'apple' },
      { id: 'str2', name: 'str2', type: 'string', label: 'contains', defaultValue: 'a' },
    ],
  },
  {
    type: 'operator_mod',
    category: 'operators',
    title: 'mod',
    shape: 'reporter',
    returnType: 'number',
    color: '#59C059',
    icon: 'Percent',
    description: 'Calculates remainder after division (Modulo).',
    parameters: [
      { id: 'num1', name: 'num1', type: 'number', label: 'a', defaultValue: 10 },
      { id: 'num2', name: 'num2', type: 'number', label: 'b', defaultValue: 3 },
    ],
  },
  {
    type: 'operator_round',
    category: 'operators',
    title: 'round',
    shape: 'reporter',
    returnType: 'number',
    color: '#59C059',
    icon: 'Circle',
    description: 'Rounds float number to closest integer.',
    parameters: [
      { id: 'num', name: 'num', type: 'number', label: 'num', defaultValue: 4.7 },
    ],
  },
  {
    type: 'operator_mathop',
    category: 'operators',
    title: 'of',
    shape: 'reporter',
    returnType: 'number',
    color: '#59C059',
    icon: 'FunctionSquare',
    description: 'Trigonometric and mathematical advanced functions.',
    parameters: [
      {
        id: 'operator',
        name: 'operator',
        type: 'select',
        label: 'func',
        defaultValue: 'abs',
        options: [
          { label: 'abs', value: 'abs' },
          { label: 'floor', value: 'floor' },
          { label: 'ceiling', value: 'ceiling' },
          { label: 'sqrt', value: 'sqrt' },
          { label: 'sin', value: 'sin' },
          { label: 'cos', value: 'cos' },
          { label: 'tan', value: 'tan' },
          { label: 'ln', value: 'ln' },
        ],
      },
      { id: 'num', name: 'num', type: 'number', label: 'of', defaultValue: 9 },
    ],
  },

  // ==========================================
  // 8. VARIABLES BLOCKS (Orange #FF8C1A)
  // ==========================================
  {
    type: 'var_set',
    category: 'variables',
    title: 'set to',
    shape: 'command',
    color: '#FF8C1A',
    icon: 'Variable',
    description: 'Assigns value or expression to named variable.',
    parameters: [
      { id: 'varName', name: 'varName', type: 'string', label: 'variable', defaultValue: 'my variable' },
      { id: 'value', name: 'value', type: 'string', label: 'to', defaultValue: '0' },
    ],
  },
  {
    type: 'var_change_by',
    category: 'variables',
    title: 'change by',
    shape: 'command',
    color: '#FF8C1A',
    icon: 'Plus',
    description: 'Increments or decrements variable by delta number.',
    parameters: [
      { id: 'varName', name: 'varName', type: 'string', label: 'variable', defaultValue: 'my variable' },
      { id: 'delta', name: 'delta', type: 'number', label: 'by', defaultValue: 1 },
    ],
  },
  {
    type: 'var_show',
    category: 'variables',
    title: 'show variable',
    shape: 'command',
    color: '#FF8C1A',
    icon: 'Eye',
    description: 'Shows variable on-screen watcher readout.',
    parameters: [
      { id: 'varName', name: 'varName', type: 'string', label: 'variable', defaultValue: 'my variable' },
    ],
  },
  {
    type: 'var_hide',
    category: 'variables',
    title: 'hide variable',
    shape: 'command',
    color: '#FF8C1A',
    icon: 'EyeOff',
    description: 'Hides variable on-screen watcher readout.',
    parameters: [
      { id: 'varName', name: 'varName', type: 'string', label: 'variable', defaultValue: 'my variable' },
    ],
  },

  // ==========================================
  // 9. ADB & HARDWARE (Red #FF4D6A)
  // ==========================================
  {
    type: 'adb_tap',
    category: 'adb',
    title: 'adb tap x: y:',
    shape: 'command',
    color: '#FF4D6A',
    icon: 'Smartphone',
    description: 'Sends direct touch tap event to mobile emulator via ADB.',
    parameters: [
      { id: 'x', name: 'x', type: 'number', label: 'x', defaultValue: 540 },
      { id: 'y', name: 'y', type: 'number', label: 'y', defaultValue: 960 },
    ],
  },
  {
    type: 'adb_swipe',
    category: 'adb',
    title: 'adb swipe from to',
    shape: 'command',
    color: '#FF4D6A',
    icon: 'Move',
    description: 'Performs swipe gesture between coordinate vectors.',
    parameters: [
      { id: 'x1', name: 'x1', type: 'number', label: 'x1', defaultValue: 500 },
      { id: 'y1', name: 'y1', type: 'number', label: 'y1', defaultValue: 1400 },
      { id: 'x2', name: 'x2', type: 'number', label: 'x2', defaultValue: 500 },
      { id: 'y2', name: 'y2', type: 'number', label: 'y2', defaultValue: 300 },
      { id: 'durationMs', name: 'durationMs', type: 'number', label: 'duration (ms)', defaultValue: 300 },
    ],
  },
  {
    type: 'adb_shell',
    category: 'adb',
    title: 'adb shell command',
    shape: 'command',
    color: '#FF4D6A',
    icon: 'Terminal',
    description: 'Executes raw Android shell command on connected device.',
    parameters: [
      { id: 'command', name: 'command', type: 'string', label: 'cmd', defaultValue: 'input keyevent 3' },
    ],
  },

  // ==========================================
  // 10. MACRO AUTOMATION & SMART ACTIONS (Extended Compatibility)
  // ==========================================
  {
    type: 'event_start',
    category: 'events',
    title: 'when start trigger fired',
    shape: 'hat',
    color: '#FFBF00',
    icon: 'Play',
    description: 'Entry point when macro or script begins execution.',
    parameters: [],
  },
  {
    type: 'event_key_pressed',
    category: 'events',
    title: 'when key pressed',
    shape: 'hat',
    color: '#FFBF00',
    icon: 'Keyboard',
    description: 'Triggered when hotkey is pressed.',
    parameters: [
      { id: 'key', name: 'key', type: 'string', label: 'key', defaultValue: 'F6' },
    ],
  },
  {
    type: 'event_timer_tick',
    category: 'events',
    title: 'when timer ticks',
    shape: 'hat',
    color: '#FFBF00',
    icon: 'Clock',
    description: 'Triggered periodically on timer interval.',
    parameters: [
      { id: 'intervalMs', name: 'intervalMs', type: 'number', label: 'every (ms)', defaultValue: 1000 },
    ],
  },
  {
    type: 'action_human_click',
    category: 'motion',
    title: 'human click',
    shape: 'command',
    color: '#4C97FF',
    icon: 'MousePointer',
    description: 'Executes anti-detection mouse click with randomized micro-jitter curve.',
    parameters: [
      {
        id: 'button',
        name: 'button',
        type: 'select',
        label: 'button',
        defaultValue: 'left',
        options: [
          { label: 'left', value: 'left' },
          { label: 'right', value: 'right' },
          { label: 'middle', value: 'middle' },
        ],
      },
      { id: 'jitterRadius', name: 'jitterRadius', type: 'number', label: 'jitter px', defaultValue: 3 },
      { id: 'holdDurationMs', name: 'holdDurationMs', type: 'number', label: 'hold ms', defaultValue: 45 },
    ],
  },
  {
    type: 'action_move_mouse',
    category: 'motion',
    title: 'move mouse to x: y:',
    shape: 'command',
    color: '#4C97FF',
    icon: 'Navigation',
    description: 'Moves cursor using natural human-like Bezier curve.',
    parameters: [
      { id: 'x', name: 'x', type: 'number', label: 'x', defaultValue: 960 },
      { id: 'y', name: 'y', type: 'number', label: 'y', defaultValue: 540 },
      { id: 'smooth', name: 'smooth', type: 'boolean', label: 'smooth', defaultValue: true },
    ],
  },
  {
    type: 'action_press_key',
    category: 'sensing',
    title: 'press key',
    shape: 'command',
    color: '#4CBFE6',
    icon: 'Keyboard',
    description: 'Simulates physical key press with realistic hold duration.',
    parameters: [
      { id: 'key', name: 'key', type: 'string', label: 'key', defaultValue: 'R' },
      { id: 'durationMs', name: 'durationMs', type: 'number', label: 'hold (ms)', defaultValue: 60 },
    ],
  },
  {
    type: 'action_send_text',
    category: 'sensing',
    title: 'type text',
    shape: 'command',
    color: '#4CBFE6',
    icon: 'Type',
    description: 'Types text sequence with variable human cadence.',
    parameters: [
      { id: 'text', name: 'text', type: 'string', label: 'text', defaultValue: 'Hello' },
      { id: 'delayBetweenKeys', name: 'delayBetweenKeys', type: 'number', label: 'delay (ms)', defaultValue: 30 },
    ],
  },
  {
    type: 'action_log_message',
    category: 'looks',
    title: 'log message',
    shape: 'command',
    color: '#9966FF',
    icon: 'Terminal',
    description: 'Outputs formatted debug message to runtime console.',
    parameters: [
      { id: 'message', name: 'message', type: 'string', label: 'msg', defaultValue: 'Macro running...' },
    ],
  },
  {
    type: 'action_sound_beep',
    category: 'sound',
    title: 'play sound tone',
    shape: 'command',
    color: '#CF63CF',
    icon: 'Volume2',
    description: 'Plays audio tone through WebAudio oscillator.',
    parameters: [
      { id: 'frequency', name: 'frequency', type: 'number', label: 'freq (Hz)', defaultValue: 880 },
      { id: 'durationMs', name: 'durationMs', type: 'number', label: 'duration (ms)', defaultValue: 120 },
    ],
  },
  {
    type: 'action_notification',
    category: 'looks',
    title: 'show notification',
    shape: 'command',
    color: '#9966FF',
    icon: 'Bell',
    description: 'Displays toast message banner on screen.',
    parameters: [
      { id: 'title', name: 'title', type: 'string', label: 'title', defaultValue: 'Alert' },
      { id: 'message', name: 'message', type: 'string', label: 'msg', defaultValue: 'Task complete' },
    ],
  },
  {
    type: 'condition_color_found',
    category: 'sensing',
    title: 'if color in region found',
    shape: 'c_block',
    color: '#4CBFE6',
    icon: 'Eye',
    description: 'Scans bounding box for pixel color match.',
    hasContainerSlot: true,
    statementSlots: ['then', 'else'],
    parameters: [
      { id: 'regionX', name: 'regionX', type: 'number', label: 'x', defaultValue: 860 },
      { id: 'regionY', name: 'regionY', type: 'number', label: 'y', defaultValue: 440 },
      { id: 'width', name: 'width', type: 'number', label: 'w', defaultValue: 200 },
      { id: 'height', name: 'height', type: 'number', label: 'h', defaultValue: 200 },
      { id: 'color', name: 'color', type: 'color', label: 'color', defaultValue: '#39FF14' },
      { id: 'tolerance', name: 'tolerance', type: 'number', label: 'tolerance', defaultValue: 10 },
    ],
  },
  {
    type: 'condition_if_else',
    category: 'control',
    title: 'if then else',
    shape: 'c_block',
    color: '#FFAB19',
    icon: 'GitBranch',
    description: 'Evaluates logical expression condition and routes execution.',
    hasContainerSlot: true,
    statementSlots: ['then', 'else'],
    parameters: [
      { id: 'expression', name: 'expression', type: 'string', label: 'condition', defaultValue: 'mouseX > 500' },
    ],
  },
  {
    type: 'condition_compare',
    category: 'operators',
    title: 'compare',
    shape: 'c_block',
    color: '#59C059',
    icon: 'Code',
    description: 'Compares two operands using comparison operator.',
    hasContainerSlot: true,
    statementSlots: ['then', 'else'],
    parameters: [
      { id: 'leftOperand', name: 'leftOperand', type: 'string', label: 'left', defaultValue: '{{score}}' },
      {
        id: 'operator',
        name: 'operator',
        type: 'select',
        label: 'op',
        defaultValue: '==',
        options: [
          { label: '==', value: '==' },
          { label: '!=', value: '!=' },
          { label: '>', value: '>' },
          { label: '<', value: '<' },
          { label: '>=', value: '>=' },
          { label: '<=', value: '<=' },
        ],
      },
      { id: 'rightOperand', name: 'rightOperand', type: 'string', label: 'right', defaultValue: '100' },
    ],
  },
  {
    type: 'loop_repeat_count',
    category: 'control',
    title: 'repeat times',
    shape: 'c_block',
    color: '#FFAB19',
    icon: 'Repeat',
    description: 'Iterates inner blocks for exact count.',
    hasContainerSlot: true,
    statementSlots: ['body'],
    parameters: [
      { id: 'count', name: 'count', type: 'number', label: 'count', defaultValue: 10 },
      { id: 'counterVar', name: 'counterVar', type: 'string', label: 'as var', defaultValue: 'i' },
    ],
  },
  {
    type: 'loop_while',
    category: 'control',
    title: 'while condition',
    shape: 'c_block',
    color: '#FFAB19',
    icon: 'Repeat',
    description: 'Repeats blocks while condition expression holds true.',
    hasContainerSlot: true,
    statementSlots: ['body'],
    parameters: [
      { id: 'condition', name: 'condition', type: 'string', label: 'condition', defaultValue: 'targetLocked == true' },
      { id: 'maxIterations', name: 'maxIterations', type: 'number', label: 'max limit', defaultValue: 500 },
    ],
  },
  {
    type: 'loop_break',
    category: 'control',
    title: 'break loop',
    shape: 'command',
    color: '#FFAB19',
    icon: 'Square',
    description: 'Immediately exits current loop structure.',
    parameters: [],
  },
  {
    type: 'loop_continue',
    category: 'control',
    title: 'continue loop',
    shape: 'command',
    color: '#FFAB19',
    icon: 'RotateCw',
    description: 'Skips remainder of iteration and continues next cycle.',
    parameters: [],
  },
  {
    type: 'timing_delay',
    category: 'control',
    title: 'delay ms (jitter)',
    shape: 'command',
    color: '#FFAB19',
    icon: 'Clock',
    description: 'Pauses execution with randomized anti-detection timing.',
    parameters: [
      { id: 'durationMs', name: 'durationMs', type: 'number', label: 'delay (ms)', defaultValue: 50 },
      { id: 'jitterMs', name: 'jitterMs', type: 'number', label: '± jitter', defaultValue: 10 },
    ],
  },
  {
    type: 'timing_wait_until',
    category: 'control',
    title: 'wait until condition',
    shape: 'command',
    color: '#FFAB19',
    icon: 'Clock',
    description: 'Blocks until condition expression evaluates to true.',
    parameters: [
      { id: 'condition', name: 'condition', type: 'string', label: 'cond', defaultValue: 'true' },
      { id: 'timeoutMs', name: 'timeoutMs', type: 'number', label: 'timeout (ms)', defaultValue: 5000 },
    ],
  },
  {
    type: 'math_calc',
    category: 'operators',
    title: 'calculate',
    shape: 'command',
    color: '#59C059',
    icon: 'Calculator',
    description: 'Computes arithmetic operation and stores result into variable.',
    parameters: [
      { id: 'operandA', name: 'operandA', type: 'string', label: 'A', defaultValue: '10' },
      {
        id: 'operator',
        name: 'operator',
        type: 'select',
        label: 'op',
        defaultValue: '+',
        options: [
          { label: '+', value: '+' },
          { label: '-', value: '-' },
          { label: '*', value: '*' },
          { label: '/', value: '/' },
          { label: '%', value: '%' },
        ],
      },
      { id: 'operandB', name: 'operandB', type: 'string', label: 'B', defaultValue: '5' },
      { id: 'outputVar', name: 'outputVar', type: 'string', label: 'into', defaultValue: 'calcResult' },
    ],
  },
  {
    type: 'math_random',
    category: 'operators',
    title: 'pick random into var',
    shape: 'command',
    color: '#59C059',
    icon: 'Sparkles',
    description: 'Generates random integer in range and saves to variable.',
    parameters: [
      { id: 'min', name: 'min', type: 'number', label: 'min', defaultValue: 1 },
      { id: 'max', name: 'max', type: 'number', label: 'max', defaultValue: 100 },
      { id: 'outputVar', name: 'outputVar', type: 'string', label: 'into', defaultValue: 'randomVal' },
    ],
  },
  {
    type: 'util_breakpoint',
    category: 'control',
    title: 'breakpoint pause',
    shape: 'command',
    color: '#FF4D6A',
    icon: 'PauseCircle',
    isBreakpointBlock: true,
    description: 'Forces debugger pause when reached.',
    parameters: [
      { id: 'reason', name: 'reason', type: 'string', label: 'reason', defaultValue: 'Manual breakpoint' },
    ],
  },
  {
    type: 'util_safe_halt',
    category: 'control',
    title: 'emergency safe halt',
    shape: 'command',
    color: '#FF4D6A',
    icon: 'Octagon',
    description: 'Immediately halts all automation scripts safely.',
    parameters: [],
  },
];

export function createBlockInstance(
  protoOrType?: BlockPrototype | string | null,
  overrides?: Record<string, any>
): BlockNode {
  let proto: BlockPrototype | undefined;

  if (typeof protoOrType === 'string') {
    proto = BLOCK_CATALOG.find((b) => b.type === protoOrType);
  } else if (protoOrType && typeof protoOrType === 'object') {
    proto = protoOrType;
  }

  // Fallback if not found in catalog
  if (!proto) {
    const fallbackType = typeof protoOrType === 'string' ? protoOrType : 'motion_move_steps';
    proto = BLOCK_CATALOG.find((b) => b.type === fallbackType) || {
      type: fallbackType,
      category: 'motion',
      title: fallbackType.replace(/_/g, ' '),
      color: '#4C97FF',
      shape: 'command',
      description: 'Block instance',
      parameters: [],
    };
  }

  const params: Record<string, any> = {};
  if (Array.isArray(proto.parameters)) {
    for (const p of proto.parameters) {
      params[p.id] = p.defaultValue;
    }
  }

  const childSlots: Record<string, BlockNode[]> = {};
  if (Array.isArray(proto.statementSlots)) {
    for (const s of proto.statementSlots) {
      childSlots[s] = [];
    }
  }

  // Infer shape if not specified
  let shape = proto.shape;
  if (!shape) {
    if (proto.category === 'events' || proto.type.startsWith('event_')) {
      shape = 'hat';
    } else if (proto.hasContainerSlot) {
      shape = 'c_block';
    } else if (proto.category === 'operators' && (proto.type.includes('gt') || proto.type.includes('lt') || proto.type.includes('and') || proto.type.includes('or') || proto.type.includes('not') || proto.type.includes('contains') || proto.type.includes('equals'))) {
      shape = 'boolean';
    } else if (proto.category === 'sensing' && (proto.type.includes('touching') || proto.type.includes('keypressed') || proto.type.includes('mousedown'))) {
      shape = 'boolean';
    } else if (proto.category === 'variables' && proto.type === 'var_get') {
      shape = 'reporter';
    } else if (proto.returnType === 'number' || proto.returnType === 'string') {
      shape = 'reporter';
    } else if (proto.returnType === 'boolean') {
      shape = 'boolean';
    } else {
      shape = 'command';
    }
  }

  const topLevelKeys = new Set([
    'id', 'type', 'category', 'title', 'color', 'shape', 'returnType',
    'icon', 'description', 'parameters', 'hasContainerSlot', 'statementSlots',
    'childSlots', 'comment', 'isCollapsed', 'hasBreakpoint', 'isBreakpointBlock',
    'isDisabled', 'customBlockId', 'subMacroId', 'positionX', 'positionY'
  ]);

  const explicitParams: Record<string, any> = overrides?.parameters ? { ...overrides.parameters } : {};
  const topLevelOverrides: Record<string, any> = {};

  if (overrides) {
    for (const [k, v] of Object.entries(overrides)) {
      if (topLevelKeys.has(k)) {
        if (k !== 'parameters') {
          topLevelOverrides[k] = v;
        }
      } else {
        explicitParams[k] = v;
      }
    }
  }

  const base: BlockNode = {
    id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type: proto.type,
    category: proto.category,
    title: proto.title,
    color: proto.color,
    shape,
    returnType: proto.returnType,
    icon: proto.icon,
    description: proto.description,
    parameters: { ...params, ...explicitParams },
    hasContainerSlot: proto.hasContainerSlot || false,
    statementSlots: proto.statementSlots,
    childSlots: proto.hasContainerSlot ? childSlots : undefined,
    ...topLevelOverrides,
  };

  return base;
}
