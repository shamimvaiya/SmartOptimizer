import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Boxes,
  Zap,
  Play,
  GitBranch,
  Repeat,
  Variable,
  Calculator,
  Type,
  ToggleRight,
  Clock,
  MousePointer,
  Crosshair,
  Keyboard,
  Smartphone,
  Sliders,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { BLOCK_CATALOG, CATEGORY_METADATA, BlockPrototype, createBlockInstance } from '../../data/blockCatalog';
import { BlockCategory, BlockNode, CustomBlockDefinition, MacroVariable } from '../../types';
import { SCRATCH_PALETTE } from './PuzzlePieceBlock';

interface BlockCodingPaletteProps {
  onAddBlock: (block: BlockNode) => void;
  variables?: MacroVariable[];
  onOpenCreateVariable?: () => void;
  customBlocks: CustomBlockDefinition[];
  onOpenCustomBlockBuilder: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const CATEGORY_DOTS: Array<{ id: BlockCategory | 'all'; label: string; color: string }> = [
  { id: 'all', label: 'All', color: '#FFFFFF' },
  { id: 'events', label: 'Events', color: '#FFBF00' },
  { id: 'actions', label: 'Actions', color: '#4C97FF' },
  { id: 'conditions', label: 'Conditions', color: '#9966FF' },
  { id: 'loops', label: 'Control', color: '#FFAB19' },
  { id: 'variables', label: 'Variables', color: '#FF6680' },
  { id: 'math', label: 'Operators', color: '#59C059' },
  { id: 'timing', label: 'Sensing', color: '#4CBFE6' },
  { id: 'adb', label: 'ADB Mobile', color: '#FF4D6A' },
  { id: 'utility', label: 'Utility', color: '#9A59B5' },
  { id: 'custom', label: 'My Blocks', color: '#00B5AD' },
];

export const BlockCodingPalette: React.FC<BlockCodingPaletteProps> = ({
  onAddBlock,
  variables = [],
  onOpenCreateVariable,
  customBlocks,
  onOpenCustomBlockBuilder,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<BlockCategory | 'all'>('all');

  const filteredBlocks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // Standard prototypes
    const standardMatches = BLOCK_CATALOG.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });

    // Dynamic variable getter/setter blocks
    const variableMatches: BlockPrototype[] = [];
    if (selectedCategory === 'all' || selectedCategory === 'variables') {
      for (const v of variables) {
        if (!q || v.name.toLowerCase().includes(q)) {
          // Reporter block
          variableMatches.push({
            type: 'var_get',
            category: 'variables',
            title: `( ${v.name} )`,
            color: '#FF6680',
            icon: 'Variable',
            description: `Reporter block for variable "${v.name}"`,
            parameters: [{ id: 'varName', name: 'varName', type: 'variable', label: 'Variable', defaultValue: v.name }],
          });
          // Setter block
          variableMatches.push({
            type: 'var_set',
            category: 'variables',
            title: `Set ${v.name} to`,
            color: '#FF6680',
            icon: 'Variable',
            description: `Assign value to variable "${v.name}"`,
            parameters: [
              { id: 'varName', name: 'varName', type: 'variable', label: 'Variable', defaultValue: v.name },
              { id: 'value', name: 'value', type: 'number', label: 'Value', defaultValue: 0 },
            ],
          });
        }
      }
    }

    // Custom blocks matching
    const customMatches: BlockPrototype[] = customBlocks
      .filter((cb) => {
        const matchCat = selectedCategory === 'all' || selectedCategory === 'custom';
        if (!matchCat) return false;
        if (!q) return true;
        return (
          cb.name.toLowerCase().includes(q) ||
          cb.description.toLowerCase().includes(q) ||
          cb.category.toLowerCase().includes(q)
        );
      })
      .map((cb) => ({
        type: 'custom_block',
        category: 'custom',
        title: cb.name,
        color: cb.color || '#00B5AD',
        icon: 'Boxes',
        description: cb.description || 'User-defined custom block macro routine',
        parameters: cb.inputs.map((inp) => ({
          id: inp.id,
          name: inp.name,
          type: inp.type,
          label: inp.label || inp.name,
          defaultValue: inp.defaultValue,
        })),
        hasContainerSlot: false,
      }));

    return [...standardMatches, ...variableMatches, ...customMatches];
  }, [searchQuery, selectedCategory, customBlocks, variables]);

  const handleDragStart = (e: React.DragEvent, proto: BlockPrototype) => {
    const instance = createBlockInstance(proto);
    e.dataTransfer.setData('application/json', JSON.stringify(instance));
    e.dataTransfer.effectAllowed = 'copy';
  };

  if (isCollapsed) {
    return (
      <div className="bg-[#0b0e17] rounded-2xl border border-[#1f283d] flex flex-col items-center py-3 space-y-3 h-full shadow-2xl w-12 flex-shrink-0">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl bg-[#141a2c] text-[#00e5ff] hover:bg-[#1e2742] transition-colors cursor-pointer"
          title="Expand Block Palette"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-full h-px bg-[#1f283d]" />

        {/* Scratch Vertical Category Dots */}
        <div className="flex flex-col items-center space-y-2 overflow-y-auto no-scrollbar flex-1 w-full">
          {CATEGORY_DOTS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                onToggleCollapse?.();
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative group cursor-pointer"
              style={{ backgroundColor: cat.color }}
              title={cat.label}
            >
              <span className="text-[9px] font-black text-black">
                {cat.label.substring(0, 1)}
              </span>
              <div className="absolute left-10 bg-[#0e1322] text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-[#232f48] shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                {cat.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0e17] rounded-2xl border border-[#1f283d] flex h-full shadow-2xl overflow-hidden w-80">
      {/* Left Vertical Category Rail (Scratch Style) */}
      <div className="w-14 bg-[#080b12] border-r border-[#182136] flex flex-col items-center py-3 space-y-2.5 flex-shrink-0 overflow-y-auto no-scrollbar">
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl bg-[#141a2c] text-[#8892b0] hover:text-white hover:bg-[#1e2742] transition-colors cursor-pointer mb-1"
            title="Collapse Palette"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {CATEGORY_DOTS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
              selectedCategory === cat.id
                ? 'scale-110 ring-2 ring-white shadow-lg'
                : 'opacity-75 hover:opacity-100 hover:scale-105'
            }`}
            style={{ backgroundColor: cat.color }}
            title={cat.label}
          >
            <span
              className={`text-[10px] font-black ${
                cat.color === '#FFFFFF' || cat.color === '#FFBF00' || cat.color === '#FFAB19' || cat.color === '#4CBFE6'
                  ? 'text-black'
                  : 'text-white'
              }`}
            >
              {cat.label.substring(0, 2)}
            </span>
            <div className="absolute left-12 bg-[#0e1322] text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-[#232f48] shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              {cat.label}
            </div>
          </button>
        ))}
      </div>

      {/* Main Block Palette List */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0b0e17]">
        {/* Header Bar */}
        <div className="p-3 border-b border-[#1b2538] space-y-2 bg-[#0e121e]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Boxes className="w-4 h-4 text-[#4C97FF]" />
              <span className="font-black text-xs text-white uppercase tracking-wider">
                Block Palette
              </span>
            </div>

            <div className="flex items-center space-x-1">
              {onOpenCreateVariable && (
                <button
                  onClick={onOpenCreateVariable}
                  className="px-2 py-1 rounded-lg bg-gradient-to-r from-[#FF6680] to-[#CF455C] hover:from-[#FF6680] hover:to-[#CF455C] text-[10px] font-black text-white flex items-center space-x-0.5 shadow-md cursor-pointer transition-transform hover:scale-105"
                  title="Create Variable"
                >
                  <Variable className="w-3 h-3 text-white" />
                  <span>+ Var</span>
                </button>
              )}
              <button
                onClick={onOpenCustomBlockBuilder}
                className="px-2 py-1 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-[10px] font-black text-white flex items-center space-x-0.5 shadow-md cursor-pointer transition-transform hover:scale-105"
                title="Create Custom Block"
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span>+ Custom</span>
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8892b0] absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blocks..."
              className="w-full pl-8 pr-2.5 py-1 rounded-xl bg-[#06080d] border border-[#1f283d] text-xs text-white placeholder:text-[#8892b0]/50 outline-none focus:border-[#4C97FF] transition-colors"
            />
          </div>
        </div>

        {/* Scrollable Block List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {filteredBlocks.map((proto) => {
            const theme = SCRATCH_PALETTE[proto.category] || { bg: proto.color || '#4C97FF', border: '#3373CC' };
            const isReporter = proto.category === 'variables' && proto.type === 'var_get';
            const isHat = proto.category === 'events' || proto.type === 'custom_block_definition';

            return (
              <div
                key={`${proto.category}_${proto.type}_${proto.title}`}
                draggable
                onDragStart={(e) => handleDragStart(e, proto)}
                onClick={() => {
                  const instance = createBlockInstance(proto);
                  onAddBlock(instance);
                }}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                }}
                className={`p-2 border-2 text-white transition-all cursor-grab active:cursor-grabbing group hover:scale-[1.02] hover:shadow-lg space-y-1 relative select-none ${
                  isReporter ? 'rounded-full px-3' : isHat ? 'rounded-t-2xl rounded-b-lg' : 'rounded-lg'
                }`}
              >
                {/* Scratch Notch Preview */}
                {!isHat && !isReporter && (
                  <div className="absolute top-0 left-3 w-3 h-1 bg-[#0b0e17] rounded-b-sm" />
                )}

                <div className="flex items-center justify-between space-x-2">
                  <span className="font-bold text-xs text-white drop-shadow truncate">
                    {proto.title}
                  </span>
                  <div className="p-0.5 rounded bg-black/30 text-white/90 group-hover:bg-black/50">
                    <Plus className="w-3 h-3" />
                  </div>
                </div>

                {proto.description && (
                  <p className="text-[9px] text-white/80 line-clamp-1 leading-snug">
                    {proto.description}
                  </p>
                )}
              </div>
            );
          })}

          {filteredBlocks.length === 0 && (
            <div className="p-6 text-center text-xs text-[#8892b0]">
              No blocks found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
