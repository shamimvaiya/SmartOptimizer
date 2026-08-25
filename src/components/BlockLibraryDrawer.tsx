import React, { useState } from 'react';
import {
  Search,
  X,
  Plus,
  Play,
  Eye,
  MousePointer,
  Keyboard,
  Clock,
  Repeat,
  RefreshCw,
  Smartphone,
  Terminal,
  Code2,
  Sparkles,
  Layers,
  GitBranch,
  Variable,
  Calculator,
  Bell,
  Volume2,
  MessageSquare,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { ActionType } from '../types';
import { CustomActionDefinition } from './ActionCrafterModal';

export interface BlockTemplate {
  actionType: ActionType | string;
  category: 'event' | 'action' | 'vision' | 'condition' | 'variable' | 'loop' | 'adb' | 'script' | 'custom';
  title: string;
  description: string;
  defaultParams: string;
  icon: any;
  color: string;
  bg: string;
}

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  // Events
  {
    actionType: 'Event (Start)',
    category: 'event',
    title: 'Event: Macro Started',
    description: 'Triggered when the macro execution begins.',
    defaultParams: 'OnStart',
    icon: Play,
    color: '#eab308',
    bg: '#231d0a',
  },
  {
    actionType: 'Event (Key Pressed)',
    category: 'event',
    title: 'Event: Key Pressed',
    description: 'Fires when a specific keyboard key is pressed.',
    defaultParams: 'F6',
    icon: Keyboard,
    color: '#eab308',
    bg: '#231d0a',
  },
  {
    actionType: 'Event (Timer Tick)',
    category: 'event',
    title: 'Event: Timer Tick',
    description: 'Triggers on a recurring millisecond interval.',
    defaultParams: '1000',
    icon: Clock,
    color: '#eab308',
    bg: '#231d0a',
  },

  // Vision
  {
    actionType: 'Search Color',
    category: 'vision',
    title: 'Search Color',
    description: 'Finds a pixel color in specified screen region.',
    defaultParams: '860, 440, 200, 200, #39FF14',
    icon: Eye,
    color: '#39ff14',
    bg: '#142914',
  },
  {
    actionType: 'Multi-Image Search',
    category: 'vision',
    title: 'Multi-Image Match',
    description: 'Searches for template image assets with confidence score.',
    defaultParams: 'crosshair_head.png, 0.85',
    icon: Eye,
    color: '#39ff14',
    bg: '#142914',
  },
  {
    actionType: 'While Color Exists',
    category: 'vision',
    title: 'While Color Exists',
    description: 'Loops continuously while target color remains on screen.',
    defaultParams: '860, 440, 200, 200, #39FF14',
    icon: RefreshCw,
    color: '#00e5ff',
    bg: '#10252e',
  },

  // Input & Actions
  {
    actionType: 'Move Mouse',
    category: 'action',
    title: 'Move Mouse (Bézier)',
    description: 'Moves mouse smoothly with human-like curved trajectory.',
    defaultParams: '960, 540, true',
    icon: MousePointer,
    color: '#00e5ff',
    bg: '#14252e',
  },
  {
    actionType: 'Human Click',
    category: 'action',
    title: 'Human Click',
    description: 'Clicks mouse with realistic offset jitter and randomized hold.',
    defaultParams: 'left, 2.5',
    icon: MousePointer,
    color: '#2979ff',
    bg: '#151e2e',
  },
  {
    actionType: 'Click Mouse',
    category: 'action',
    title: 'Click Mouse',
    description: 'Standard mouse button click (left, right, middle).',
    defaultParams: 'left',
    icon: MousePointer,
    color: '#2979ff',
    bg: '#151e2e',
  },
  {
    actionType: 'Press Key',
    category: 'action',
    title: 'Press Key',
    description: 'Simulates a keyboard key press with hold duration.',
    defaultParams: 'R',
    icon: Keyboard,
    color: '#d500f9',
    bg: '#25142b',
  },
  {
    actionType: 'Delay',
    category: 'action',
    title: 'Delay / Wait',
    description: 'Pauses execution for specified milliseconds with anti-ban jitter.',
    defaultParams: '50',
    icon: Clock,
    color: '#ffd600',
    bg: '#292514',
  },

  // Conditions & Logic
  {
    actionType: 'Condition (If)',
    category: 'condition',
    title: 'Condition (If / Else)',
    description: 'Branches execution based on expression or variable comparison.',
    defaultParams: 'foundX > 500',
    icon: GitBranch,
    color: '#ff007f',
    bg: '#29101f',
  },
  {
    actionType: 'Compare',
    category: 'condition',
    title: 'Compare Values',
    description: 'Compares two values (==, !=, >, <, contains).',
    defaultParams: 'matchScore >= 0.85',
    icon: GitBranch,
    color: '#ff007f',
    bg: '#29101f',
  },

  // Variables & Math
  {
    actionType: 'Set Variable',
    category: 'variable',
    title: 'Set Variable',
    description: 'Assigns a value to a global or local runtime variable.',
    defaultParams: 'ammoCount = 30',
    icon: Variable,
    color: '#a855f7',
    bg: '#221530',
  },
  {
    actionType: 'Math Operation',
    category: 'variable',
    title: 'Math Operation',
    description: 'Performs arithmetic calculation and stores in variable.',
    defaultParams: 'ammoCount = ammoCount - 1',
    icon: Calculator,
    color: '#a855f7',
    bg: '#221530',
  },

  // Loops
  {
    actionType: 'Repeat Loop',
    category: 'loop',
    title: 'Repeat Loop',
    description: 'Executes a block of connected nodes for N iterations.',
    defaultParams: '5',
    icon: Repeat,
    color: '#ff007f',
    bg: '#29101f',
  },

  // ADB (Android)
  {
    actionType: 'ADB Tap',
    category: 'adb',
    title: 'ADB Tap Coordinate',
    description: 'Sends hardware touch tap event directly to emulator via ADB.',
    defaultParams: '960, 540',
    icon: Smartphone,
    color: '#00e676',
    bg: '#132b1f',
  },
  {
    actionType: 'ADB Swipe',
    category: 'adb',
    title: 'ADB Swipe Gesture',
    description: 'Simulates swipe drag gesture (x1, y1, x2, y2, durationMs).',
    defaultParams: '500, 1000, 500, 300, 300',
    icon: Smartphone,
    color: '#00e676',
    bg: '#132b1f',
  },
  {
    actionType: 'ADB Shell',
    category: 'adb',
    title: 'ADB Shell Command',
    description: 'Runs raw shell command in emulator (e.g. input keyevent 4).',
    defaultParams: 'input keyevent 4',
    icon: Terminal,
    color: '#00b4d8',
    bg: '#142830',
  },

  // Script & Utilities
  {
    actionType: 'Notification',
    category: 'action',
    title: 'Overlay Notification',
    description: 'Displays a real-time HUD notification message.',
    defaultParams: 'Macro Action Executed',
    icon: Bell,
    color: '#39ff14',
    bg: '#142914',
  },
  {
    actionType: 'Sound Beep',
    category: 'action',
    title: 'Audio Beep / Ping',
    description: 'Plays an audio feedback tone for status confirmation.',
    defaultParams: '1000, 150',
    icon: Volume2,
    color: '#00e5ff',
    bg: '#14252e',
  },
  {
    actionType: 'Script Block',
    category: 'script',
    title: 'Custom Script Block',
    description: 'Embeds custom C# or JavaScript code directly.',
    defaultParams: '// Write custom script here\ncontext.Log("Hello");',
    icon: Code2,
    color: '#a855f7',
    bg: '#221530',
  },
];

interface BlockLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (template: BlockTemplate) => void;
  customActions?: CustomActionDefinition[];
}

export const BlockLibraryDrawer: React.FC<BlockLibraryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectBlock,
  customActions = [],
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  // Merge custom actions into templates
  const allTemplates: BlockTemplate[] = [
    ...BLOCK_TEMPLATES,
    ...customActions.map((c) => ({
      actionType: c.name,
      category: 'custom' as const,
      title: c.name,
      description: `Custom Action: ${c.category}`,
      defaultParams: c.defaultParameters || '',
      icon: Sparkles,
      color: c.color || '#a855f7',
      bg: '#1e142b',
    })),
  ];

  const filteredTemplates = allTemplates.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.actionType.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'event', label: 'Events' },
    { id: 'vision', label: 'Vision' },
    { id: 'action', label: 'Actions' },
    { id: 'condition', label: 'Logic' },
    { id: 'variable', label: 'Variables' },
    { id: 'loop', label: 'Loops' },
    { id: 'adb', label: 'ADB' },
    { id: 'script', label: 'Script' },
    { id: 'custom', label: 'Custom' },
  ];

  return (
    <div
      id="block-library-drawer-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="block-library-drawer-container"
        className="w-full max-w-md h-full bg-[#0a0d16] border-l-2 border-[#1f283d] shadow-2xl flex flex-col p-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f283d] pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/40">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide">Block Library</h3>
              <p className="text-xs text-[#8892b0]">Click any block to insert it onto the canvas</p>
            </div>
          </div>

          <button
            id="close-block-library-drawer-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8892b0] hover:text-white hover:bg-[#1f283d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-[#8892b0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="block-library-search-input"
            type="text"
            placeholder="Search blocks (e.g. Color, Mouse, Key, Loop)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#101424] text-white text-xs border border-[#1f283d] focus:border-[#00e5ff] outline-none font-medium placeholder-[#64748b]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8892b0] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#00e5ff] text-black shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                  : 'bg-[#141824] text-[#8892b0] hover:text-white hover:bg-[#1a2333] border border-[#1f283d]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Blocks List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin scrollbar-thumb-[#1f283d]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-[#64748b] text-xs">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No matching blocks found for &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            filteredTemplates.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={`${item.actionType}-${idx}`}
                  id={`block-template-card-${idx}`}
                  onClick={() => {
                    onSelectBlock(item);
                    onClose();
                  }}
                  style={{ borderColor: `${item.color}40` }}
                  className="p-3.5 rounded-xl bg-[#0e121e] hover:bg-[#141a2c] border transition-all cursor-pointer group hover:scale-[1.01] hover:shadow-lg flex items-start space-x-3"
                >
                  <div
                    className="p-2 rounded-lg shrink-0"
                    style={{ backgroundColor: item.bg, color: item.color }}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-white group-hover:text-[#00e5ff] transition-colors truncate">
                        {item.title}
                      </span>
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold"
                        style={{ backgroundColor: item.bg, color: item.color }}
                      >
                        {item.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8892b0] mt-1 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#64748b] font-mono">
                      <span className="truncate max-w-[200px]">Default: {item.defaultParams}</span>
                      <span className="text-[#00e5ff] font-bold group-hover:underline flex items-center gap-0.5">
                        <Plus className="w-3 h-3" /> Add
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
