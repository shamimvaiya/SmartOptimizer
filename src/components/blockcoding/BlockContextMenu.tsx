import React, { useEffect, useRef } from 'react';
import {
  Copy,
  Trash2,
  Unlink,
  Eye,
  EyeOff,
  CircleDot,
  MessageSquare,
  Boxes,
  Code,
  Layers,
  Sparkles,
  Clipboard,
} from 'lucide-react';
import { BlockNode } from '../../types';

export interface ContextMenuPosition {
  x: number;
  y: number;
}

export interface BlockContextMenuProps {
  position: ContextMenuPosition;
  targetBlock: BlockNode | null;
  onClose: () => void;
  onDuplicate?: (block: BlockNode) => void;
  onCopy?: (block: BlockNode) => void;
  onPaste?: () => void;
  onDelete?: (blockId: string) => void;
  onDisconnect?: (blockId: string) => void;
  onToggleDisabled?: (block: BlockNode) => void;
  onToggleBreakpoint?: (blockId: string) => void;
  onAddComment?: (block: BlockNode) => void;
  onShowDefinition?: (customBlockId: string) => void;
  onConvertToCustomBlock?: (block: BlockNode) => void;
  canPaste?: boolean;
}

export const BlockContextMenu: React.FC<BlockContextMenuProps> = ({
  position,
  targetBlock,
  onClose,
  onDuplicate,
  onCopy,
  onPaste,
  onDelete,
  onDisconnect,
  onToggleDisabled,
  onToggleBreakpoint,
  onAddComment,
  onShowDefinition,
  onConvertToCustomBlock,
  canPaste = false,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ left: position.x, top: position.y }}
      className="fixed z-50 min-w-[200px] bg-[#0c101c] border border-[#232f48] rounded-2xl shadow-2xl p-1.5 text-xs text-white space-y-0.5 animate-fade-in backdrop-blur-md"
    >
      {targetBlock && (
        <div className="px-2.5 py-1.5 mb-1 border-b border-[#1f293d] flex items-center space-x-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: targetBlock.color || '#00e5ff' }}
          />
          <span className="font-bold text-white truncate max-w-[150px]">
            {targetBlock.title}
          </span>
        </div>
      )}

      {targetBlock ? (
        <>
          {/* Duplicate */}
          {onDuplicate && (
            <button
              onClick={() => {
                onDuplicate(targetBlock);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#18233c] text-white flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>Duplicate</span>
              <span className="ml-auto text-[9px] text-[#8892b0] font-mono">Ctrl+D</span>
            </button>
          )}

          {/* Copy */}
          {onCopy && (
            <button
              onClick={() => {
                onCopy(targetBlock);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#18233c] text-white flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5 text-[#39ff14]" />
              <span>Copy</span>
              <span className="ml-auto text-[9px] text-[#8892b0] font-mono">Ctrl+C</span>
            </button>
          )}

          {/* Disconnect */}
          {onDisconnect && (
            <button
              onClick={() => {
                onDisconnect(targetBlock.id);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#18233c] text-white flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Unlink className="w-3.5 h-3.5 text-amber-400" />
              <span>Detach Stack</span>
            </button>
          )}

          {/* Disable / Enable */}
          {onToggleDisabled && (
            <button
              onClick={() => {
                onToggleDisabled(targetBlock);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#18233c] text-white flex items-center space-x-2 transition-colors cursor-pointer"
            >
              {targetBlock.isDisabled ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enable Block</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#8892b0]" />
                  <span>Disable Block</span>
                </>
              )}
            </button>
          )}

          {/* Toggle Breakpoint */}
          {onToggleBreakpoint && (
            <button
              onClick={() => {
                onToggleBreakpoint(targetBlock.id);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#18233c] text-white flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <CircleDot className="w-3.5 h-3.5 text-rose-500" />
              <span>
                {targetBlock.hasBreakpoint ? 'Remove Breakpoint' : 'Set Breakpoint'}
              </span>
            </button>
          )}

          {/* Add Comment */}
          {onAddComment && (
            <button
              onClick={() => {
                onAddComment(targetBlock);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#18233c] text-white flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
              <span>{targetBlock.comment ? 'Edit Comment' : 'Add Comment'}</span>
            </button>
          )}

          {/* Show Definition for Custom Blocks */}
          {targetBlock.customBlockId && onShowDefinition && (
            <button
              onClick={() => {
                onShowDefinition(targetBlock.customBlockId!);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#18233c] text-cyan-300 flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              <span>Show Definition</span>
            </button>
          )}

          {/* Convert Stack to Custom Block */}
          {onConvertToCustomBlock && (
            <button
              onClick={() => {
                onConvertToCustomBlock(targetBlock);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#18233c] text-teal-300 flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Create Custom Block From Stack</span>
            </button>
          )}

          <div className="my-1 border-t border-[#1f293d]" />

          {/* Delete */}
          {onDelete && (
            <button
              onClick={() => {
                onDelete(targetBlock.id);
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-rose-500/20 text-rose-300 flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete Block</span>
              <span className="ml-auto text-[9px] text-[#8892b0] font-mono">Del</span>
            </button>
          )}
        </>
      ) : (
        /* Canvas Context Menu */
        <>
          {canPaste && onPaste && (
            <button
              onClick={() => {
                onPaste();
                onClose();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#18233c] text-white flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5 text-[#39ff14]" />
              <span>Paste Block</span>
              <span className="ml-auto text-[9px] text-[#8892b0] font-mono">Ctrl+V</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};
