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
  MessageSquare,
  EyeOff,
  Eye,
  Plus,
  CircleDot,
  Copy,
  GripVertical,
} from 'lucide-react';
import { BlockNode } from '../../types';

export interface PuzzlePieceBlockProps {
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
  onMouseDownBlock?: (e: React.MouseEvent, block: BlockNode, parentId?: string, slotName?: string) => void;
  parentId?: string;
  slotName?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  events: <Zap className="w-3.5 h-3.5" />,
  actions: <Play className="w-3.5 h-3.5" />,
  conditions: <GitBranch className="w-3.5 h-3.5" />,
  loops: <Repeat className="w-3.5 h-3.5" />,
  variables: <Variable className="w-3.5 h-3.5" />,
  math: <Calculator className="w-3.5 h-3.5" />,
  string: <Type className="w-3.5 h-3.5" />,
  boolean: <ToggleRight className="w-3.5 h-3.5" />,
  timing: <Clock className="w-3.5 h-3.5" />,
  input: <MousePointer className="w-3.5 h-3.5" />,
  mouse: <Crosshair className="w-3.5 h-3.5" />,
  keyboard: <Keyboard className="w-3.5 h-3.5" />,
  adb: <Smartphone className="w-3.5 h-3.5" />,
  utility: <Sliders className="w-3.5 h-3.5" />,
  custom: <Boxes className="w-3.5 h-3.5" />,
};

// Vibrant Scratch Category Palette
export const SCRATCH_PALETTE: Record<string, { bg: string; border: string; darkText?: boolean }> = {
  events: { bg: '#FFBF00', border: '#D9A300', darkText: true },
  actions: { bg: '#4C97FF', border: '#3373CC' },
  conditions: { bg: '#9966FF', border: '#7744CC' },
  loops: { bg: '#FFAB19', border: '#CF8B00', darkText: true },
  variables: { bg: '#FF6680', border: '#CF455C' },
  math: { bg: '#59C059', border: '#389438' },
  string: { bg: '#59C059', border: '#389438' },
  boolean: { bg: '#59C059', border: '#389438' },
  timing: { bg: '#4CBFE6', border: '#2E99BF', darkText: true },
  input: { bg: '#00B5AD', border: '#008C86' },
  mouse: { bg: '#00B5AD', border: '#008C86' },
  keyboard: { bg: '#00B5AD', border: '#008C86' },
  adb: { bg: '#FF4D6A', border: '#D92B48' },
  utility: { bg: '#9A59B5', border: '#763B91' },
  custom: { bg: '#00B5AD', border: '#008C86' },
};

export const PuzzlePieceBlock: React.FC<PuzzlePieceBlockProps> = ({
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
  onMouseDownBlock,
  parentId,
  slotName,
}) => {
  const [showCommentInput, setShowCommentInput] = useState<boolean>(Boolean(block.comment));
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const theme = SCRATCH_PALETTE[block.category] || {
    bg: block.color || '#4C97FF',
    border: '#3373CC',
  };

  const handleParamChange = (key: string, val: any) => {
    onUpdateBlock({
      ...block,
      parameters: {
        ...block.parameters,
        [key]: val,
      },
    });
  };

  const handleToggleCollapse = () => {
    onUpdateBlock({
      ...block,
      isCollapsed: !block.isCollapsed,
    });
  };

  const handleToggleDisabled = () => {
    onUpdateBlock({
      ...block,
      isDisabled: !block.isDisabled,
    });
  };

  const isHatBlock = block.category === 'events' || block.type === 'custom_block_definition';
  const isReporterBlock = block.category === 'variables' && block.type === 'var_get';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => {
        if (onMouseDownBlock) {
          onMouseDownBlock(e, block, parentId, slotName);
        }
      }}
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
          ? '0 0 20px rgba(57, 255, 20, 0.9), 0 0 6px rgba(57, 255, 20, 0.5)'
          : isSelected
          ? '0 0 14px rgba(255, 255, 255, 0.8)'
          : hasBreakpoint
          ? '0 0 12px rgba(244, 63, 94, 0.8)'
          : '0 3px 8px rgba(0,0,0,0.3)',
        opacity: block.isDisabled ? 0.45 : 1,
      }}
      className={`group relative rounded-lg border-2 text-white select-none transition-shadow duration-150 inline-block min-w-[260px] max-w-[420px] ${
        isHatBlock ? 'rounded-t-2xl' : ''
      }`}
    >
      {/* Top Puzzle Notch (for Non-Hat Blocks) */}
      {!isHatBlock && (
        <div
          className="absolute -top-1.5 left-4 w-4 h-1.5 bg-[#070911] rounded-b-sm z-10 border-b border-x border-[#1e293b]"
        />
      )}

      {/* Breakpoint Indicator Pill */}
      {hasBreakpoint && (
        <div className="absolute -left-3 top-2 w-4 h-4 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center animate-pulse z-30">
          <CircleDot className="w-2.5 h-2.5 text-white" />
        </div>
      )}

      {/* Compact Header Bar */}
      <div className="px-3 py-1.5 flex items-center justify-between space-x-2">
        {/* Left Drag Grip & Title */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <GripVertical className="w-3.5 h-3.5 opacity-60 cursor-grab active:cursor-grabbing flex-shrink-0" />

          {/* Category Icon */}
          <div className="w-4 h-4 rounded flex items-center justify-center text-white/90 flex-shrink-0">
            {CATEGORY_ICONS[block.category] || <Zap className="w-3.5 h-3.5" />}
          </div>

          <span className="font-bold text-xs tracking-tight text-white drop-shadow-sm truncate">
            {block.title}
          </span>

          {/* Collapse Icon for Containers */}
          {block.hasContainerSlot && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleCollapse();
              }}
              className="p-0.5 rounded hover:bg-black/20 text-white/90 transition-colors"
            >
              {block.isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Quick Action Controls (Hover Toolbar) */}
        <div className={`flex items-center space-x-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-40'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBreakpoint(block.id);
            }}
            className={`p-0.5 rounded transition-colors ${
              hasBreakpoint ? 'bg-rose-600 text-white' : 'hover:bg-black/20 text-white/80'
            }`}
            title="Breakpoint"
          >
            <CircleDot className="w-3 h-3" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCommentInput((prev) => !prev);
            }}
            className="p-0.5 rounded hover:bg-black/20 text-white/80 transition-colors"
            title="Comment"
          >
            <MessageSquare className="w-3 h-3" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleDisabled();
            }}
            className="p-0.5 rounded hover:bg-black/20 text-white/80 transition-colors"
            title="Toggle Enable"
          >
            {block.isDisabled ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>

          {onDuplicateBlock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateBlock(block);
              }}
              className="p-0.5 rounded hover:bg-black/20 text-white/80 transition-colors"
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(block.id);
            }}
            className="p-0.5 rounded hover:bg-black/20 text-white/80 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Inline Parameter Input Pills */}
      {!block.isCollapsed && Object.entries(block.parameters || {}).length > 0 && (
        <div className="px-3 pb-2 flex flex-wrap items-center gap-1.5 text-xs">
          {Object.entries(block.parameters).map(([key, val]) => (
            <div key={key} className="flex items-center space-x-1 bg-black/25 px-2 py-0.5 rounded-full border border-white/20">
              <span className="text-[10px] font-bold text-white/80 uppercase">{key}:</span>
              {typeof val === 'boolean' ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleParamChange(key, !val);
                  }}
                  className={`px-2 py-0.2 rounded-full text-[9px] font-black ${
                    val ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  {val ? 'TRUE' : 'FALSE'}
                </button>
              ) : (
                <input
                  type="text"
                  value={String(val ?? '')}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleParamChange(key, e.target.value)}
                  className="w-16 bg-white/90 text-black font-semibold text-[11px] px-2 py-0.2 rounded-full outline-none text-center shadow-inner focus:ring-2 focus:ring-[#00e5ff]"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Comment Note Box */}
      {showCommentInput && (
        <div className="px-3 pb-2" onClick={(e) => e.stopPropagation()}>
          <div className="bg-black/40 p-1.5 rounded-lg border border-white/20 flex items-center space-x-1.5">
            <MessageSquare className="w-3 h-3 text-amber-300 flex-shrink-0" />
            <input
              type="text"
              value={block.comment || ''}
              onChange={(e) => onUpdateBlock({ ...block, comment: e.target.value })}
              placeholder="Add block note..."
              className="w-full bg-transparent text-[10px] text-amber-100 outline-none placeholder:text-amber-200/50"
            />
          </div>
        </div>
      )}

      {/* Container Slots for Loops / Conditions */}
      {!block.isCollapsed && block.hasContainerSlot && block.statementSlots && (
        <div className="px-2 pb-2 space-y-2">
          {block.statementSlots.map((slot) => {
            const childList = block.childSlots?.[slot] || [];
            return (
              <div
                key={slot}
                className="bg-black/30 rounded-lg p-1.5 space-y-1.5 border border-white/10"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-white/90 uppercase tracking-wider px-1">
                  <span>{slot} ({childList.length})</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddChildBlock?.(block.id, slot, 'action_human_click');
                    }}
                    className="px-1.5 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white text-[9px] font-bold flex items-center space-x-0.5 cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-1.5 pl-2 border-l-2 border-white/30 min-h-[28px]">
                  {childList.map((child) => (
                    <PuzzlePieceBlock
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
                      onMouseDownBlock={onMouseDownBlock}
                      parentId={block.id}
                      slotName={slot}
                    />
                  ))}
                  {childList.length === 0 && (
                    <div className="py-2 text-center text-[9px] text-white/50 italic border border-dashed border-white/20 rounded">
                      Snap block here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Puzzle Nub (for Non-Terminal Blocks) */}
      <div
        className="absolute -bottom-1.5 left-4 w-4 h-1.5 rounded-b-sm shadow-sm z-10 border-b border-x border-[#1e293b]"
        style={{ backgroundColor: theme.bg }}
      />
    </div>
  );
};
