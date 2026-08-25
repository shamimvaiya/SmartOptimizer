import React, { useState } from 'react';
import {
  History,
  X,
  Plus,
  RotateCcw,
  Trash2,
  Check,
  Calendar,
  Layers,
  Save,
  ShieldCheck,
  Sparkles,
  GitCompare,
} from 'lucide-react';
import { MacroVersionSnapshot } from '../../types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: MacroVersionSnapshot[];
  onCreateSnapshot: (label: string, description?: string) => void;
  onRestoreSnapshot: (snapshotId: string) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
  onCompareSnapshots?: (baseId: string, targetId: string) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  onCreateSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  onCompareSnapshots,
}) => {

  const [newLabel, setNewLabel] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onCreateSnapshot(newLabel.trim(), newDesc.trim() || undefined);
    setNewLabel('');
    setNewDesc('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0e17] rounded-3xl border-2 border-[#1f283d] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1b2538] flex items-center justify-between bg-[#0e121e]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Version History & Rollback</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Time Machine
                </span>
              </h2>
              <p className="text-xs text-[#8892b0]">
                Access previous versions, create manual snapshots, and safely revert anytime.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8892b0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Create Manual Snapshot Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Saved Version Snapshots ({snapshots.length})
            </span>
            <button
              onClick={() => setIsCreating((prev) => !prev)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-black text-white flex items-center space-x-1.5 shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Take Manual Snapshot</span>
            </button>
          </div>

          {/* Create Snapshot Form */}
          {isCreating && (
            <form
              onSubmit={handleCreate}
              className="p-4 rounded-2xl bg-[#0e1322] border border-purple-500/30 space-y-3"
            >
              <div>
                <label className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                  Snapshot Label
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Pre-Boss Fight Optimization v2"
                  className="w-full px-3 py-2 rounded-xl bg-[#070910] border border-[#1f2b45] text-xs text-white outline-none focus:border-purple-500 font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#8892b0] uppercase tracking-wider block mb-1">
                  Notes / Changelog (Optional)
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What changed in this revision?"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#070910] border border-[#1f2b45] text-xs text-[#8892b0] outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#8892b0] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-black text-white flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Snapshot</span>
                </button>
              </div>
            </form>
          )}

          {/* Snapshot Cards List */}
          <div className="space-y-3">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-4 rounded-2xl bg-[#0d101a] border border-[#1b2538] hover:border-purple-500/40 transition-all flex items-center justify-between space-x-4 group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      v{snap.versionNumber}
                    </span>
                    <strong className="text-sm font-extrabold text-white truncate">
                      {snap.label}
                    </strong>
                    {snap.isAutoSave && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300">
                        Auto-Save
                      </span>
                    )}
                  </div>

                  {snap.description && (
                    <p className="text-xs text-[#8892b0] line-clamp-1">{snap.description}</p>
                  )}

                  <div className="flex items-center space-x-3 text-[10px] text-[#55607a] font-mono">
                    <span>{new Date(snap.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span>{snap.blockCoding?.length || 0} blocks</span>
                    <span>•</span>
                    <span>{snap.variables?.length || 0} variables</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {onCompareSnapshots && (
                    <button
                      onClick={() => onCompareSnapshots(snap.id, 'current')}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-xs font-bold text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5 transition-colors cursor-pointer"
                      title="Compare this snapshot with current state"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Diff</span>
                    </button>
                  )}

                  {restoreConfirmId === snap.id ? (
                    <div className="flex items-center space-x-1.5 bg-purple-950/80 p-1 rounded-xl border border-purple-500">
                      <span className="text-[10px] font-bold text-purple-200 px-1">Restore?</span>
                      <button
                        onClick={() => {
                          onRestoreSnapshot(snap.id);
                          setRestoreConfirmId(null);
                          onClose();
                        }}
                        className="px-2 py-1 rounded bg-[#39ff14] text-black font-black text-[10px] uppercase cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setRestoreConfirmId(null)}
                        className="px-1.5 py-1 rounded text-[#8892b0] hover:text-white text-[10px]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRestoreConfirmId(snap.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#141b2c] hover:bg-[#202c47] text-xs font-bold text-[#00e5ff] border border-[#00e5ff]/30 flex items-center space-x-1.5 transition-colors cursor-pointer"
                      title="Safely Revert / Restore this Version"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Revert</span>
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteSnapshot(snap.id)}
                    className="p-2 rounded-xl text-[#8892b0] hover:text-rose-400 hover:bg-black/40 transition-colors cursor-pointer"
                    title="Delete Snapshot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {snapshots.length === 0 && (
              <div className="py-12 text-center text-xs text-[#8892b0]">
                No snapshots saved yet. Click &ldquo;Take Manual Snapshot&rdquo; to preserve current state.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1b2538] flex items-center justify-between bg-[#080b12] text-xs text-[#8892b0]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#39ff14]" />
            <span>Restoring creates an automatic safety backup of current state.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1f283d] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
