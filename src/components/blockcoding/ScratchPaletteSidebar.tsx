import React, { useState } from 'react';
import {
  Search,
  Boxes,
  Zap,
  Play,
  GitBranch,
  Repeat,
  Variable,
  Calculator,
  Clock,
  Smartphone,
  Sparkles,
  Trash2,
  GripVertical,
  Move,
  Smile,
  Volume2,
  Eye,
  Radio,
  Sliders,
  Maximize,
  Compass,
  ArrowRight,
  ArrowUp,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { BLOCK_CATALOG, BlockPrototype, createBlockInstance, SCRATCH_CATEGORIES } from '../../data/blockCatalog';
import { BlockCategory, BlockNode, CustomBlockDefinition, MacroVariable } from '../../types';
import { SCRATCH_THEMES } from './SleekPuzzleBlock';

interface ScratchPaletteSidebarProps {
  onAddBlock: (block: BlockNode) => void;
  variables?: MacroVariable[];
  onOpenCreateVariable?: () => void;
  customBlocks: CustomBlockDefinition[];
  onOpenCustomBlockBuilder: () => void;
  onDeleteDraggedBlock?: (blockId: string) => void;
}

export const ScratchPaletteSidebar: React.FC<ScratchPaletteSidebarProps> = ({
  onAddBlock,
  variables = [],
  onOpenCreateVariable,
  customBlocks,
  onOpenCustomBlockBuilder,
  onDeleteDraggedBlock,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<BlockCategory | 'all'>('motion');
  const [isDragOverTrash, setIsDragOverTrash] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  // Filtered block list
  const filteredBlocks = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // Standard prototypes
    const standardMatches = BLOCK_CATALOG.filter((p) => {
      const matchCat =
        activeCategory === 'all' ||
        p.category === activeCategory ||
        (activeCategory === 'control' && (p.category === 'loops' || p.category === 'conditions' || p.category === 'timing')) ||
        (activeCategory === 'operators' && (p.category === 'math' || p.category === 'string' || p.category === 'boolean')) ||
        (activeCategory === 'motion' && (p.category === 'actions' || p.category === 'input' || p.category === 'mouse')) ||
        (activeCategory === 'sensing' && (p.category === 'keyboard' || p.category === 'input'));
      if (!matchCat) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
    });

    // Variables
    const variableMatches: BlockPrototype[] = [];
    if (activeCategory === 'all' || activeCategory === 'variables') {
      for (const v of variables) {
        if (!q || v.name.toLowerCase().includes(q)) {
          variableMatches.push({
            type: 'var_get',
            category: 'variables',
            title: v.name,
            shape: 'reporter',
            returnType: 'string',
            color: '#FF8C1A',
            icon: 'Variable',
            description: `Reporter block for variable "${v.name}"`,
            parameters: [{ id: 'varName', name: 'varName', type: 'variable', label: 'Variable', defaultValue: v.name }],
          });
          variableMatches.push({
            type: 'var_set',
            category: 'variables',
            title: `set ${v.name} to`,
            shape: 'command',
            color: '#FF8C1A',
            icon: 'Variable',
            description: `Assign value to variable "${v.name}"`,
            parameters: [
              { id: 'varName', name: 'varName', type: 'variable', label: 'Variable', defaultValue: v.name },
              { id: 'value', name: 'value', type: 'number', label: 'value', defaultValue: 0 },
            ],
          });
        }
      }
    }

    // Custom Blocks
    const customMatches: BlockPrototype[] = customBlocks
      .filter((cb) => {
        const matchCat = activeCategory === 'all' || activeCategory === 'myblocks' || activeCategory === 'custom';
        if (!matchCat) return false;
        if (!q) return true;
        return cb.name.toLowerCase().includes(q);
      })
      .map((cb) => ({
        type: 'custom_block',
        category: 'myblocks',
        title: cb.name,
        shape: 'command',
        color: cb.color || '#FF6680',
        icon: 'Boxes',
        description: cb.description || 'User-defined custom block routine',
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
  }, [searchQuery, activeCategory, customBlocks, variables]);

  const handleDragStart = (e: React.DragEvent, proto: BlockPrototype) => {
    const instance = createBlockInstance(proto);
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'new_block', block: instance }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleTrashDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTrash(true);
  };

  const handleTrashDragLeave = () => {
    setIsDragOverTrash(false);
  };

  const handleTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTrash(false);
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;
    try {
      const parsed = JSON.parse(rawData);
      if (parsed.type === 'existing_block' && parsed.block?.id) {
        onDeleteDraggedBlock?.(parsed.block.id);
      }
    } catch (err) {
      console.error('Error dropping into trash:', err);
    }
  };

  return (
    <div
      onDragOver={handleTrashDragOver}
      onDragLeave={handleTrashDragLeave}
      onDrop={handleTrashDrop}
      className={`h-full bg-[#080b12] border-r border-[#1a2236] flex select-none flex-shrink-0 z-20 shadow-2xl relative ${
        isDragOverTrash ? 'bg-rose-950/40 ring-2 ring-rose-500' : ''
      }`}
    >
      {/* 1. LEFT ICON CATEGORY RAIL (Authentic Scratch 3.0 Icon Column) */}
      <div className="w-[68px] bg-[#070a10] border-r border-[#141b2d] flex flex-col items-center py-2 space-y-1 flex-shrink-0 overflow-y-auto no-scrollbar relative">
        {/* Toggle Expand/Collapse Drawer Button on Top of Rail */}
        <button
          onClick={() => setIsDrawerOpen((prev) => !prev)}
          className="w-10 h-6 mb-1 rounded-lg bg-[#141926] hover:bg-[#1f283e] text-[#00e5ff] border border-[#00e5ff]/30 flex items-center justify-center cursor-pointer transition-all shadow-sm"
          title={isDrawerOpen ? 'Collapse Palette Drawer' : 'Expand Palette Drawer'}
        >
          {isDrawerOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 animate-pulse" />}
        </button>

        {SCRATCH_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setIsDrawerOpen(true);
              }}
              className={`w-[60px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group ${
                isActive
                  ? 'bg-[#151c2e] ring-1 scale-105 shadow-md'
                  : 'hover:bg-[#0f1422] opacity-80 hover:opacity-100'
              }`}
              style={{
                borderColor: isActive ? cat.color : 'transparent',
              }}
              title={cat.label}
            >
              {/* Category Colored Circle */}
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center mb-1 shadow-sm transition-transform group-hover:scale-110"
                style={{ backgroundColor: cat.color }}
              />
              <span
                className="text-[9px] font-bold tracking-tight text-center leading-tight truncate max-w-full"
                style={{ color: isActive ? '#FFFFFF' : '#8892b0' }}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. RIGHT BLOCK PALETTE */}
      <div
        className={`flex flex-col bg-[#0b0f19] transition-all duration-300 ease-in-out ${
          isDrawerOpen
            ? 'w-[240px] opacity-100 border-r border-[#39ff14]/30 shadow-[0_0_20px_rgba(57,255,20,0.15)]'
            : 'w-0 opacity-0 overflow-hidden border-none pointer-events-none'
        }`}
      >
        {/* Search & Header */}
        <div className="p-2 border-b border-[#182136] bg-[#0d1322] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1">
              <span>{activeCategory === 'all' ? 'All Blocks' : activeCategory}</span>
            </span>
            <div className="flex items-center space-x-1">
              {onOpenCreateVariable && (
                <button
                  onClick={onOpenCreateVariable}
                  className="px-1.5 py-0.5 rounded bg-[#FF8C1A]/20 hover:bg-[#FF8C1A]/30 border border-[#FF8C1A]/40 text-[#FF8C1A] text-[8px] font-black cursor-pointer uppercase"
                >
                  + Var
                </button>
              )}
              <button
                onClick={onOpenCustomBlockBuilder}
                className="px-1.5 py-0.5 rounded bg-[#FF6680]/20 hover:bg-[#FF6680]/30 border border-[#FF6680]/40 text-[#FF6680] text-[8px] font-black cursor-pointer uppercase"
              >
                + Block
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded bg-[#161a29] hover:bg-[#252c45] text-[#8892b0] hover:text-[#39ff14] cursor-pointer"
                title="Collapse Drawer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-[#64748b] absolute left-2 top-1.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blocks..."
              className="w-full pl-6 pr-2 py-0.5 rounded-lg bg-[#070911] border border-[#1e273f] text-[11px] text-white placeholder:text-[#64748b] outline-none focus:border-[#4C97FF]"
            />
          </div>
        </div>

        {/* Scrollable Blocks List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar bg-[#080b12]">
          {filteredBlocks.map((proto, idx) => {
            const theme = SCRATCH_THEMES[proto.category] || { bg: proto.color || '#4C97FF', border: '#3373CC' };
            const shape = proto.shape || (proto.category === 'events' ? 'hat' : proto.hasContainerSlot ? 'c_block' : 'command');
            const isReporter = shape === 'reporter';
            const isBoolean = shape === 'boolean';
            const isHat = shape === 'hat';
            const isCBlock = shape === 'c_block';

            return (
              <div
                key={`${proto.category}_${proto.type}_${proto.title}_${idx}`}
                draggable
                onDragStart={(e) => handleDragStart(e, proto)}
                onClick={() => {
                  const instance = createBlockInstance(proto);
                  onAddBlock(instance);
                }}
                style={{
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  clipPath: isBoolean
                    ? 'polygon(6px 0%, calc(100% - 6px) 0%, 100% 50%, calc(100% - 6px) 100%, 6px 100%, 0% 50%)'
                    : undefined,
                }}
                className={`px-2.5 py-1.5 border text-white transition-all cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:brightness-110 flex items-center justify-between select-none relative ${
                  isBoolean
                    ? 'text-[10px] w-fit min-w-[90px] h-6 justify-center'
                    : isReporter
                    ? 'rounded-full text-[10px] w-fit min-w-[90px] h-6 justify-center'
                    : isHat
                    ? 'rounded-t-[14px] rounded-b-[3px] text-[10px] min-w-[170px]'
                    : isCBlock
                    ? 'rounded-[3px] text-[10px] min-w-[170px]'
                    : 'rounded-[3px] text-[10px] min-w-[170px]'
                }`}
                title={proto.description}
              >
                {/* Top Notch for standard blocks */}
                {!isHat && !isReporter && !isBoolean && (
                  <div className="absolute -top-[3px] left-[10px] w-[10px] h-[3px] bg-[#080b12] rounded-b-[2px] border-b border-black/40" />
                )}

                <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                  <GripVertical className="w-2.5 h-2.5 opacity-50 flex-shrink-0" />
                  <span className="font-bold text-[10px] text-white tracking-tight drop-shadow-sm truncate">
                    {proto.title}
                  </span>
                </div>

                {/* Default parameter chip */}
                {proto.parameters && proto.parameters.length > 0 && !isReporter && !isBoolean && (
                  <span className="text-[8px] bg-black/25 px-1.5 py-0.2 rounded-full font-mono text-white/90 truncate max-w-[60px]">
                    {String(proto.parameters[0].defaultValue ?? '')}
                  </span>
                )}

                {/* Bottom Nub */}
                {!isReporter && !isBoolean && (
                  <div
                    className="absolute -bottom-[3px] left-[10px] w-[10px] h-[3px] rounded-b-[2px] border-b border-black/40"
                    style={{ backgroundColor: theme.bg }}
                  />
                )}
              </div>
            );
          })}

          {filteredBlocks.length === 0 && (
            <div className="py-8 text-center text-[10px] text-[#8892b0]">
              No blocks found
            </div>
          )}
        </div>

        {/* Drag Over Trash Drop Target Banner */}
        {isDragOverTrash && (
          <div className="absolute inset-0 bg-rose-950/90 flex flex-col items-center justify-center text-rose-300 z-30 p-4 border-2 border-dashed border-rose-500 animate-pulse">
            <Trash2 className="w-8 h-8 mb-2 animate-bounce text-rose-400" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Drop here to Delete Block
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
