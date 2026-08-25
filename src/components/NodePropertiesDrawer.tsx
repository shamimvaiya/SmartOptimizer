import React from 'react';
import {
  X,
  Settings2,
  Trash2,
  CopyPlus,
  Play,
  Eye,
  Sliders,
  Check,
  AlertCircle,
  GitBranch,
  Repeat,
  FileText,
  Power,
  Crop,
} from 'lucide-react';
import { MacroNode } from '../types';

interface NodePropertiesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  node: MacroNode | null;
  allNodes: MacroNode[];
  onUpdateNode: (updated: MacroNode) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (node: MacroNode) => void;
  onOpenSnipper?: () => void;
}

export const NodePropertiesDrawer: React.FC<NodePropertiesDrawerProps> = ({
  isOpen,
  onClose,
  node,
  allNodes,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onOpenSnipper,
}) => {
  if (!isOpen || !node) return null;

  const isCondition = node.actionType === 'Condition (If)' || node.actionType === 'Compare';
  const isLoop =
    node.actionType === 'Repeat Loop' ||
    node.actionType === 'While Color Exists' ||
    node.actionType === 'Loop (While)' ||
    node.actionType === 'Loop (For Range)';
  const isVision = node.actionType === 'Search Color' || node.actionType === 'While Color Exists';

  const otherNodes = allNodes.filter((n) => n.id !== node.id);

  return (
    <div
      id="node-properties-drawer-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="node-properties-drawer-container"
        className="w-full max-w-md h-full bg-[#0a0d16] border-l-2 border-[#1f283d] shadow-2xl flex flex-col p-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f283d] pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/40">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide">Node Inspector</h3>
              <p className="text-xs text-[#8892b0] font-mono">ID: {node.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onDuplicateNode(node)}
              className="p-1.5 rounded-lg text-[#8892b0] hover:text-[#00e5ff] hover:bg-[#1f283d] transition-colors cursor-pointer"
              title="Duplicate Node"
            >
              <CopyPlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                onDeleteNode(node.id);
                onClose();
              }}
              className="p-1.5 rounded-lg text-[#8892b0] hover:text-[#ff0055] hover:bg-[#1f283d] transition-colors cursor-pointer"
              title="Delete Node"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="close-node-properties-drawer-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8892b0] hover:text-white hover:bg-[#1f283d] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Form */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-[#1f283d]">
          {/* Action Type & Active State */}
          <div className="p-3.5 rounded-xl bg-[#0e121e] border border-[#1f283d] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Action Category</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#162238] text-[#00e5ff] border border-[#00e5ff]/30 font-bold">
                {node.actionType}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1f283d]">
              <div className="flex items-center space-x-2">
                <Power className={`w-3.5 h-3.5 ${node.disabled ? 'text-[#ff4444]' : 'text-[#39ff14]'}`} />
                <span className="text-xs font-bold text-white">Node Enabled</span>
              </div>
              <button
                onClick={() => onUpdateNode({ ...node, disabled: !node.disabled })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  node.disabled
                    ? 'bg-[#2a1414] text-[#ff4444] border border-[#ff4444]/40'
                    : 'bg-[#142914] text-[#39ff14] border border-[#39ff14]/40'
                }`}
              >
                {node.disabled ? 'Disabled' : 'Enabled'}
              </button>
            </div>
          </div>

          {/* Node Custom Title / Label */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#ccd6f6] flex items-center justify-between">
              <span>Custom Display Title</span>
              <span className="text-[10px] text-[#8892b0] font-normal">Optional</span>
            </label>
            <input
              type="text"
              placeholder={node.actionType}
              value={node.title || ''}
              onChange={(e) => onUpdateNode({ ...node, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#101424] text-white text-xs border border-[#1f283d] focus:border-[#00e5ff] outline-none"
            />
          </div>

          {/* Parameters Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#ccd6f6]">Action Parameters</label>
              {isVision && onOpenSnipper && (
                <button
                  onClick={onOpenSnipper}
                  className="text-[10px] text-[#39ff14] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Crop className="w-3 h-3" /> Snip from Screen
                </button>
              )}
            </div>

            <textarea
              rows={3}
              value={node.parameters}
              onChange={(e) => onUpdateNode({ ...node, parameters: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#101424] text-[#00e5ff] font-mono text-xs border border-[#1f283d] focus:border-[#00e5ff] outline-none resize-y"
              placeholder="e.g. 860, 440, 200, 200, #39FF14"
            />
            <p className="text-[10px] text-[#8892b0]">
              Tip: You can use variables in params like <code className="text-[#00e5ff]">&#123;&#123;foundX&#125;&#125;</code> or{' '}
              <code className="text-[#00e5ff]">&#123;&#123;mouseX&#125;&#125;</code>
            </p>
          </div>

          {/* Conditional Branching Controls */}
          {isCondition && (
            <div className="p-3.5 rounded-xl bg-[#1a1224] border border-[#ff007f]/40 space-y-3">
              <div className="flex items-center space-x-2 text-[#ff007f]">
                <GitBranch className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wide">Condition Branches</span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-[#39ff14] block mb-1">
                    IF TRUE: Branch to Node
                  </label>
                  <select
                    value={node.conditionBranch?.trueNodeId || ''}
                    onChange={(e) =>
                      onUpdateNode({
                        ...node,
                        conditionBranch: {
                          ...node.conditionBranch,
                          trueNodeId: e.target.value || undefined,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e121e] text-white text-xs border border-[#1f283d] focus:border-[#39ff14] outline-none"
                  >
                    <option value="">-- None (Stop or Fallback) --</option>
                    {otherNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title || n.actionType} ({n.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#ff4444] block mb-1">
                    IF FALSE: Branch to Node
                  </label>
                  <select
                    value={node.conditionBranch?.falseNodeId || ''}
                    onChange={(e) =>
                      onUpdateNode({
                        ...node,
                        conditionBranch: {
                          ...node.conditionBranch,
                          falseNodeId: e.target.value || undefined,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e121e] text-white text-xs border border-[#1f283d] focus:border-[#ff4444] outline-none"
                  >
                    <option value="">-- None (Stop or Fallback) --</option>
                    {otherNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title || n.actionType} ({n.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Loop Branching Controls */}
          {isLoop && (
            <div className="p-3.5 rounded-xl bg-[#1f1422] border border-[#ff007f]/40 space-y-3">
              <div className="flex items-center space-x-2 text-[#ff007f]">
                <Repeat className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wide">Loop Branching</span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-[#00e5ff] block mb-1">
                    Loop Body Target (Executes on each iteration)
                  </label>
                  <select
                    value={node.loopBranch?.bodyNodeId || ''}
                    onChange={(e) =>
                      onUpdateNode({
                        ...node,
                        loopBranch: {
                          ...node.loopBranch,
                          bodyNodeId: e.target.value || undefined,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e121e] text-white text-xs border border-[#1f283d] focus:border-[#00e5ff] outline-none"
                  >
                    <option value="">-- First Output Node --</option>
                    {otherNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title || n.actionType} ({n.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#39ff14] block mb-1">
                    Loop Done Target (Executes when loop finishes)
                  </label>
                  <select
                    value={node.loopBranch?.doneNodeId || ''}
                    onChange={(e) =>
                      onUpdateNode({
                        ...node,
                        loopBranch: {
                          ...node.loopBranch,
                          doneNodeId: e.target.value || undefined,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0e121e] text-white text-xs border border-[#1f283d] focus:border-[#39ff14] outline-none"
                  >
                    <option value="">-- None (Continue Next) --</option>
                    {otherNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title || n.actionType} ({n.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Comment / Documentation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#ccd6f6] flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-[#8892b0]" />
              <span>Node Notes / Documentation</span>
            </label>
            <textarea
              rows={2}
              value={node.comment || ''}
              onChange={(e) => onUpdateNode({ ...node, comment: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#101424] text-white text-xs border border-[#1f283d] focus:border-[#00e5ff] outline-none placeholder-[#64748b]"
              placeholder="Add developer notes or description for this node..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1f283d] pt-4 mt-2 flex items-center justify-between">
          <span className="text-[11px] text-[#8892b0]">Changes saved automatically</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#00e5ff] text-black font-extrabold text-xs hover:bg-[#33ebff] transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.4)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
