import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Bot,
  Grid,
  History,
  FileCode,
  Layers,
  Terminal,
  Zap,
  MousePointer,
  Keyboard,
  Clock,
  Circle,
  Command,
} from 'lucide-react';
import { BlockNode, CustomBlockDefinition } from '../../types';
import { BLOCK_CATALOG, createBlockInstance } from '../../data/blockCatalog';

interface BlockCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (block: BlockNode) => void;
  customBlocks: CustomBlockDefinition[];
  onTriggerRun: () => void;
  onTriggerPause: () => void;
  onTriggerAutoArrange: () => void;
  onOpenAiAssistant: () => void;
  onOpenRecorder: () => void;
  onOpenTemplates: () => void;
  onOpenVersionHistory: () => void;
}

export const BlockCommandPalette: React.FC<BlockCommandPaletteProps> = ({
  isOpen,
  onClose,
  onAddBlock,
  customBlocks,
  onTriggerRun,
  onTriggerPause,
  onTriggerAutoArrange,
  onOpenAiAssistant,
  onOpenRecorder,
  onOpenTemplates,
  onOpenVersionHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCatalog = BLOCK_CATALOG.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustom = customBlocks.filter(
    (cb) =>
      cb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cb.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const macroActions = [
    {
      id: 'act_run',
      title: 'Run / Execute Macro Stack',
      category: 'Command',
      icon: Play,
      color: '#39FF14',
      action: onTriggerRun,
    },
    {
      id: 'act_pause',
      title: 'Pause Execution',
      category: 'Command',
      icon: Pause,
      color: '#FF9100',
      action: onTriggerPause,
    },
    {
      id: 'act_ai',
      title: 'Open Gemini Macro AI Studio',
      category: 'AI Tool',
      icon: Bot,
      color: '#D500F9',
      action: onOpenAiAssistant,
    },
    {
      id: 'act_rec',
      title: 'Open Live Macro Recorder',
      category: 'Tool',
      icon: Circle,
      color: '#FF1744',
      action: onOpenRecorder,
    },
    {
      id: 'act_arrange',
      title: 'Auto-Arrange Stack Alignment',
      category: 'Layout',
      icon: Grid,
      color: '#00E5FF',
      action: onTriggerAutoArrange,
    },
    {
      id: 'act_templates',
      title: 'Browse Macro Starter Templates',
      category: 'Templates',
      icon: Sparkles,
      color: '#FFD600',
      action: onOpenTemplates,
    },
    {
      id: 'act_history',
      title: 'Open Time Machine Snapshots',
      category: 'History',
      icon: History,
      color: '#7C4DFF',
      action: onOpenVersionHistory,
    },
  ].filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelectBlock = (proto: any) => {
    const instance = createBlockInstance(proto);
    onAddBlock(instance);
    onClose();
  };

  const handleSelectCustomBlock = (cb: CustomBlockDefinition) => {
    const customInstance: BlockNode = {
      id: `cb_inst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'custom_block',
      category: cb.category,
      title: cb.name,
      color: cb.color || '#D500F9',
      icon: cb.icon || 'Box',
      description: cb.description,
      customBlockId: cb.id,
      parameters: {},
    };
    onAddBlock(customInstance);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b0e17] rounded-3xl border-2 border-cyan-500/50 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Search Bar */}
        <div className="p-4 border-b border-[#1b2538] flex items-center space-x-3 bg-[#0e121e]">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a block name (e.g. click, delay, loop), action, or command..."
            className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-[#4e5d78]"
          />
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161f33] text-[#8892b0] border border-[#253352]">
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 bg-[#070912]">
          {/* Macro Actions & Commands */}
          {macroActions.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-[#8892b0] px-2 py-1">
                Studio Actions & Tools
              </div>
              {macroActions.map((act) => {
                const IconComp = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => {
                      act.action();
                      onClose();
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#0e1322] hover:bg-[#182136] border border-[#1e2942] flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${act.color}20`, color: act.color }}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white">{act.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#141b2c] text-[#8892b0]">
                      {act.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Block Catalog */}
          {filteredCatalog.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-[#8892b0] px-2 py-1">
                Add Puzzle Blocks ({filteredCatalog.length})
              </div>
              {filteredCatalog.slice(0, 15).map((proto) => (
                <button
                  key={proto.type}
                  onClick={() => handleSelectBlock(proto)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1322] hover:bg-[#182136] border border-[#1e2942] flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: `${proto.color}20`, color: proto.color }}
                    >
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white">{proto.title}</div>
                      <div className="text-[10px] text-[#8892b0] truncate max-w-sm">
                        {proto.description}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded font-black uppercase"
                    style={{ backgroundColor: `${proto.color}15`, color: proto.color }}
                  >
                    {proto.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Custom Blocks */}
          {filteredCustom.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase text-[#8892b0] px-2 py-1">
                Custom Blocks ({filteredCustom.length})
              </div>
              {filteredCustom.map((cb) => (
                <button
                  key={cb.id}
                  onClick={() => handleSelectCustomBlock(cb)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0e1322] hover:bg-[#182136] border border-purple-500/30 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white">{cb.name}</div>
                      <div className="text-[10px] text-[#8892b0]">{cb.description}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">
                    Custom
                  </span>
                </button>
              ))}
            </div>
          )}

          {macroActions.length === 0 && filteredCatalog.length === 0 && filteredCustom.length === 0 && (
            <div className="text-center py-12 text-xs text-[#8892b0]">
              No matching blocks or commands found for "{searchQuery}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
