import React, { useState } from 'react';
import {
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
  Boxes,
  Trash2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Copy,
  GripVertical,
  Unlink,
  Flag,
  RotateCw,
  RotateCcw,
  Volume2,
  Eye,
  EyeOff,
  Radio,
  Infinity,
  HelpCircle,
  Link2,
  Percent,
  Sparkles,
} from 'lucide-react';
import { BlockNode, BlockShape } from '../../types';

export interface SleekPuzzleBlockProps {
  block: BlockNode;
  isExecuting?: boolean;
  onUpdateBlock: (updated: BlockNode) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock?: (block: BlockNode) => void;
  onToggleBreakpoint: (id: string) => void;
  hasBreakpoint?: boolean;
  onAddChildBlock?: (parentId: string, slotName: string, prototypeType: string) => void;
  onDeleteChildBlock?: (parentId: string, slotName: string, childId: string) => void;
  onUpdateChildBlock?: (parentId: string, slotName: string, updatedChild: BlockNode) => void;
  onSelectBlock?: (block: BlockNode) => void;
  onContextMenuBlock?: (e: React.MouseEvent, block: BlockNode) => void;
  isSelected?: boolean;
  depth?: number;
  parentId?: string;
  slotName?: string;
  onDetachBlock?: (blockId: string) => void;
  onDragStartBlock?: (e: React.DragEvent, block: BlockNode, parentId?: string, slotName?: string) => void;
}

export const SCRATCH_THEMES: Record<string, { bg: string; border: string; highlight: string }> = {
  motion: { bg: '#4C97FF', border: '#3373CC', highlight: '#70ACFF' },
  actions: { bg: '#4C97FF', border: '#3373CC', highlight: '#70ACFF' },
  looks: { bg: '#9966FF', border: '#7744CC', highlight: '#B388FF' },
  sound: { bg: '#CF63CF', border: '#BD42BD', highlight: '#DE83DE' },
  events: { bg: '#FFBF00', border: '#CC9900', highlight: '#FFD147' },
  control: { bg: '#FFAB19', border: '#CF8B00', highlight: '#FFBE4D' },
  conditions: { bg: '#FFAB19', border: '#CF8B00', highlight: '#FFBE4D' },
  loops: { bg: '#FFAB19', border: '#CF8B00', highlight: '#FFBE4D' },
  sensing: { bg: '#4CBFE6', border: '#2E99BF', highlight: '#70D0EE' },
  input: { bg: '#4CBFE6', border: '#2E99BF', highlight: '#70D0EE' },
  mouse: { bg: '#4CBFE6', border: '#2E99BF', highlight: '#70D0EE' },
  keyboard: { bg: '#4CBFE6', border: '#2E99BF', highlight: '#70D0EE' },
  operators: { bg: '#59C059', border: '#389438', highlight: '#7ECE7E' },
  math: { bg: '#59C059', border: '#389438', highlight: '#7ECE7E' },
  string: { bg: '#59C059', border: '#389438', highlight: '#7ECE7E' },
  boolean: { bg: '#59C059', border: '#389438', highlight: '#7ECE7E' },
  variables: { bg: '#FF8C1A', border: '#DB6E00', highlight: '#FFA547' },
  myblocks: { bg: '#FF6680', border: '#CF455C', highlight: '#FF8A9E' },
  custom: { bg: '#FF6680', border: '#CF455C', highlight: '#FF8A9E' },
  adb: { bg: '#FF4D6A', border: '#D92B48', highlight: '#FF738B' },
  timing: { bg: '#FFAB19', border: '#CF8B00', highlight: '#FFBE4D' },
  utility: { bg: '#64748B', border: '#475569', highlight: '#94A3B8' },
};

function getBlockShape(block: BlockNode): BlockShape {
  if (block.shape) return block.shape;
  if (block.category === 'events' || block.type.startsWith('event_')) return 'hat';
  if (block.hasContainerSlot) return 'c_block';
  if (
    block.category === 'operators' &&
    (block.type.includes('gt') ||
      block.type.includes('lt') ||
      block.type.includes('and') ||
      block.type.includes('or') ||
      block.type.includes('not') ||
      block.type.includes('contains') ||
      block.type.includes('equals'))
  ) {
    return 'boolean';
  }
  if (
    block.category === 'sensing' &&
    (block.type.includes('touching') || block.type.includes('keypressed') || block.type.includes('mousedown'))
  ) {
    return 'boolean';
  }
  if (block.category === 'variables' && block.type === 'var_get') return 'reporter';
  if (block.returnType === 'number' || block.returnType === 'string') return 'reporter';
  if (block.returnType === 'boolean') return 'boolean';
  return 'command';
}

export const SleekPuzzleBlock: React.FC<SleekPuzzleBlockProps> = ({
  block,
  isExecuting = false,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onToggleBreakpoint,
  hasBreakpoint = false,
  onAddChildBlock,
  onDeleteChildBlock,
  onUpdateChildBlock,
  onSelectBlock,
  onContextMenuBlock,
  isSelected = false,
  depth = 0,
  parentId,
  slotName,
  onDetachBlock,
  onDragStartBlock,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const theme = SCRATCH_THEMES[block.category] || {
    bg: block.color || '#4C97FF',
    border: '#3373CC',
    highlight: '#70ACFF',
  };

  const shape = getBlockShape(block);
  const isHat = shape === 'hat';
  const isCBlock = shape === 'c_block';
  const isReporter = shape === 'reporter';
  const isBoolean = shape === 'boolean';
  const isLoop = isCBlock && (block.type.includes('repeat') || block.type.includes('forever') || block.type.includes('loop'));

  const handleParamChange = (key: string, val: any) => {
    onUpdateBlock({
      ...block,
      parameters: {
        ...block.parameters,
        [key]: val,
      },
    });
  };

  // Render inline parameter fields based on parameter types
  const renderInlineParams = () => {
    const entries = Object.entries(block.parameters || {});
    if (entries.length === 0) return null;

    return (
      <div className="flex items-center space-x-1 ml-1.5 inline-flex" onClick={(e) => e.stopPropagation()}>
        {entries.map(([key, val]) => {
          // Boolean Toggle
          if (typeof val === 'boolean') {
            return (
              <button
                key={key}
                onClick={() => handleParamChange(key, !val)}
                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase transition-all shadow-inner ${
                  val ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                {val ? 'TRUE' : 'FALSE'}
              </button>
            );
          }

          // Select Dropdown
          if (
            key === 'destination' ||
            key === 'style' ||
            key === 'layer' ||
            key === 'direction' ||
            key === 'sound' ||
            key === 'effect' ||
            key === 'key' ||
            key === 'menu' ||
            key === 'touchingOption' ||
            key === 'target' ||
            key === 'mode' ||
            key === 'stopOption' ||
            key === 'operator' ||
            key === 'costume' ||
            key === 'property'
          ) {
            return (
              <div
                key={key}
                className="bg-black/20 hover:bg-black/30 border border-black/10 text-white px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-inner"
              >
                <span className="truncate max-w-[85px]">{String(val)}</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-80 flex-shrink-0" />
              </div>
            );
          }

          // Color Swatch Picker
          if (key === 'color' && typeof val === 'string' && val.startsWith('#')) {
            return (
              <div key={key} className="flex items-center space-x-1 bg-black/25 px-1.5 py-0.5 rounded-full border border-black/20">
                <input
                  type="color"
                  value={val}
                  onChange={(e) => handleParamChange(key, e.target.value)}
                  className="w-4 h-4 rounded-full border border-white cursor-pointer bg-transparent"
                />
                <span className="text-[8px] font-mono font-bold text-white uppercase">{val}</span>
              </div>
            );
          }

          // Standard White Number / Text Bubble (Scratch Style)
          return (
            <input
              key={key}
              type="text"
              value={String(val ?? '')}
              onChange={(e) => handleParamChange(key, e.target.value)}
              className="min-w-[32px] max-w-[70px] h-5 bg-white text-gray-900 font-bold text-[10px] px-1.5 rounded-full outline-none text-center shadow-inner border border-black/10 focus:border-[#4C97FF] focus:ring-1 focus:ring-[#4C97FF]"
            />
          );
        })}
      </div>
    );
  };

  // --- RENDER 1: BOOLEAN BLOCK (Hexagon with pointed triangular edges < >) ---
  if (isBoolean) {
    return (
      <div
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing_block', block, parentId, slotName }));
          onDragStartBlock?.(e, block, parentId, slotName);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onContextMenuBlock?.(e, block);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectBlock?.(block);
        }}
        style={{
          backgroundColor: theme.bg,
          borderColor: isExecuting ? '#39FF14' : isSelected ? '#FFFFFF' : theme.border,
          boxShadow: isExecuting
            ? '0 0 12px rgba(57, 255, 20, 0.9)'
            : isSelected
            ? '0 0 8px rgba(255, 255, 255, 0.9)'
            : '0 2px 4px rgba(0,0,0,0.35)',
          clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0% 50%)',
          opacity: block.isDisabled ? 0.45 : 1,
        }}
        className="inline-flex items-center h-6 px-3 text-white font-bold text-[10px] select-none cursor-grab active:cursor-grabbing border relative transition-all duration-75 group"
        title={block.description}
      >
        <span className="tracking-tight drop-shadow-sm truncate">{block.title}</span>
        {renderInlineParams()}
      </div>
    );
  }

  // --- RENDER 2: REPORTER BLOCK (Oval Capsule / Pill Shape ( )) ---
  if (isReporter) {
    return (
      <div
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing_block', block, parentId, slotName }));
          onDragStartBlock?.(e, block, parentId, slotName);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onContextMenuBlock?.(e, block);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelectBlock?.(block);
        }}
        style={{
          backgroundColor: theme.bg,
          borderColor: isExecuting ? '#39FF14' : isSelected ? '#FFFFFF' : theme.border,
          boxShadow: isExecuting
            ? '0 0 12px rgba(57, 255, 20, 0.9)'
            : isSelected
            ? '0 0 8px rgba(255, 255, 255, 0.9)'
            : '0 2px 4px rgba(0,0,0,0.3)',
          opacity: block.isDisabled ? 0.45 : 1,
        }}
        className="inline-flex items-center h-6 px-2.5 rounded-full text-white font-bold text-[10px] select-none cursor-grab active:cursor-grabbing border relative transition-all duration-75 shadow-sm group"
        title={block.description}
      >
        <span className="tracking-tight drop-shadow-sm truncate">{block.title}</span>
        {renderInlineParams()}
      </div>
    );
  }

  // --- RENDER 3: HAT, COMMAND & C-BLOCK (Full Scratch Puzzle Pieces) ---
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing_block', block, parentId, slotName }));
        onDragStartBlock?.(e, block, parentId, slotName);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onContextMenuBlock?.(e, block);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelectBlock?.(block);
      }}
      style={{
        backgroundColor: theme.bg,
        borderColor: isExecuting ? '#39FF14' : isSelected ? '#FFFFFF' : theme.border,
        boxShadow: isExecuting
          ? '0 0 14px rgba(57, 255, 20, 0.9)'
          : isSelected
          ? '0 0 10px rgba(255, 255, 255, 0.9)'
          : '0 2px 5px rgba(0,0,0,0.35)',
        opacity: block.isDisabled ? 0.45 : 1,
      }}
      className={`group relative text-white select-none transition-all duration-75 border inline-block ${
        isHat
          ? 'rounded-t-[18px] rounded-b-[4px] min-w-[200px]'
          : isCBlock
          ? 'rounded-[4px] min-w-[210px]'
          : 'rounded-[4px] min-w-[190px]'
      }`}
    >
      {/* Top Puzzle Inward Notch (for Command and C-Blocks) */}
      {!isHat && (
        <div className="absolute -top-[4px] left-[14px] w-[14px] h-[4px] bg-[#070911] rounded-b-[3px] border-b border-black/40 z-10" />
      )}

      {/* Breakpoint Dot */}
      {hasBreakpoint && (
        <div className="absolute -left-2 top-1.5 w-3 h-3 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center animate-pulse z-30">
          <CircleDot className="w-1.5 h-1.5 text-white" />
        </div>
      )}

      {/* Header Bar */}
      <div className={`h-8 px-2.5 flex items-center justify-between space-x-1.5 ${isHat ? 'pt-1' : ''}`}>
        {/* Grip, Flag/Icon, Title and Inline Parameters */}
        <div className="flex items-center space-x-1.5 flex-1 min-w-0">
          <GripVertical className="w-2.5 h-2.5 opacity-50 cursor-grab active:cursor-grabbing flex-shrink-0" />

          {/* Icon */}
          {isHat ? (
            <Flag className="w-3 h-3 fill-white text-white flex-shrink-0 drop-shadow" />
          ) : (
            <span className="text-[10px] opacity-90 flex-shrink-0">●</span>
          )}

          {/* Block Title */}
          <span className="font-bold text-[11px] tracking-tight text-white drop-shadow-sm truncate">
            {block.title}
          </span>

          {/* Inline Parameters */}
          {!block.isCollapsed && renderInlineParams()}

          {/* C-Block Collapse Chevron */}
          {isCBlock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateBlock({ ...block, isCollapsed: !block.isCollapsed });
              }}
              className="p-0.5 rounded hover:bg-black/20 text-white/90 ml-1 cursor-pointer"
            >
              {block.isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Hover Quick Actions Ribbon */}
        <div className={`flex items-center space-x-0.5 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {parentId && onDetachBlock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDetachBlock(block.id);
              }}
              className="p-0.5 rounded hover:bg-black/30 text-amber-200 cursor-pointer"
              title="Detach Block"
            >
              <Unlink className="w-2.5 h-2.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBreakpoint(block.id);
            }}
            className={`p-0.5 rounded cursor-pointer ${
              hasBreakpoint ? 'bg-rose-600 text-white' : 'hover:bg-black/30 text-white/80'
            }`}
            title="Toggle Breakpoint"
          >
            <CircleDot className="w-2.5 h-2.5" />
          </button>

          {onDuplicateBlock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateBlock(block);
              }}
              className="p-0.5 rounded hover:bg-black/30 text-white/80 cursor-pointer"
              title="Duplicate"
            >
              <Copy className="w-2.5 h-2.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(block.id);
            }}
            className="p-0.5 rounded hover:bg-black/30 text-rose-200 cursor-pointer"
            title="Delete Block"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* C-BLOCK INNER MOUTH & CHILD SLOTS (If / Else / Loops) */}
      {!block.isCollapsed && isCBlock && block.statementSlots && (
        <div className="space-y-0.5">
          {block.statementSlots.map((slot, sIdx) => {
            const childList = block.childSlots?.[slot] || [];
            return (
              <div key={slot} className="relative">
                {/* Else Divider Shelf if multiple statement slots */}
                {sIdx > 0 && (
                  <div
                    style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                    className="h-7 px-2.5 flex items-center justify-between border-t border-b text-white"
                  >
                    <span className="font-bold text-[11px] tracking-tight uppercase">{slot}</span>
                  </div>
                )}

                {/* Inner Indented Mouth */}
                <div className="flex">
                  {/* Left Solid Backbone Bar */}
                  <div
                    style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                    className="w-3.5 flex-shrink-0 border-r border-black/20"
                  />

                  {/* Nested Block Container */}
                  <div className="flex-1 bg-black/25 min-h-[28px] p-1.5 space-y-1.5 relative">
                    {/* Inner Top Notch for child blocks */}
                    <div
                      style={{ backgroundColor: theme.bg }}
                      className="absolute top-0 left-[14px] w-[14px] h-[3px] rounded-b-[2px]"
                    />

                    {childList.map((child) => (
                      <SleekPuzzleBlock
                        key={child.id}
                        block={child}
                        isExecuting={isExecuting}
                        onUpdateBlock={(updated) => onUpdateChildBlock?.(block.id, slot, updated)}
                        onDeleteBlock={(id) => onDeleteChildBlock?.(block.id, slot, id)}
                        onToggleBreakpoint={onToggleBreakpoint}
                        hasBreakpoint={hasBreakpoint}
                        onSelectBlock={onSelectBlock}
                        onContextMenuBlock={onContextMenuBlock}
                        depth={depth + 1}
                        parentId={block.id}
                        slotName={slot}
                        onDetachBlock={onDetachBlock}
                        onDragStartBlock={onDragStartBlock}
                      />
                    ))}

                    {childList.length === 0 && (
                      <div className="h-6 flex items-center justify-between px-2 text-[9px] text-white/50 italic border border-dashed border-white/20 rounded">
                        <span>Drop blocks here</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddChildBlock?.(block.id, slot, 'motion_move_steps');
                          }}
                          className="px-1.5 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white font-bold text-[8px] cursor-pointer"
                        >
                          + Add Block
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom Closing Bar */}
          <div
            style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            className="h-4 px-2 flex items-center justify-end border-t border-black/20"
          >
            {isLoop && (
              <RotateCcw className="w-3 h-3 text-white/90 drop-shadow-sm mr-1" />
            )}
          </div>
        </div>
      )}

      {/* Bottom Outward Puzzle Tab (Nub sticking down) */}
      <div
        className="absolute -bottom-[4px] left-[14px] w-[14px] h-[4px] rounded-b-[3px] border-b border-r border-black/40 z-10"
        style={{ backgroundColor: theme.bg }}
      />
    </div>
  );
};
