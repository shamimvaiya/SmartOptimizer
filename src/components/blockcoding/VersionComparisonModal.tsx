import React, { useState } from 'react';
import {
  History,
  GitCompare,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  RotateCcw,
  X,
  Layers,
  Sliders,
  Check,
} from 'lucide-react';
import { MacroVersionSnapshot, VersionDiffResult } from '../../types';
import { computeVersionDiff } from '../../utils/versionDiffEngine';

interface VersionComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: MacroVersionSnapshot[];
  onRestoreSnapshot: (snapshotId: string) => void;
}

export const VersionComparisonModal: React.FC<VersionComparisonModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  onRestoreSnapshot,
}) => {
  const [baseVersionId, setBaseVersionId] = useState<string>(
    snapshots.length > 1 ? snapshots[1].id : snapshots[0]?.id || ''
  );
  const [compareVersionId, setCompareVersionId] = useState<string>(snapshots[0]?.id || '');

  if (!isOpen || snapshots.length === 0) return null;

  const baseSnapshot = snapshots.find((s) => s.id === baseVersionId) || snapshots[0];
  const compareSnapshot = snapshots.find((s) => s.id === compareVersionId) || snapshots[0];

  const diff: VersionDiffResult = computeVersionDiff(baseSnapshot, compareSnapshot);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0e17] rounded-3xl border-2 border-indigo-500/50 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#1b2538] flex items-center justify-between bg-[#0e121e]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Visual Version Diff & Comparison</h2>
              <p className="text-xs text-[#8892b0]">
                Deep inspection of structural block additions, parameter mutations, and variable changes across version snapshots.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8892b0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version Selectors Ribbon */}
        <div className="p-4 bg-[#070912] border-b border-[#1b2538] flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase text-[#8892b0] mb-1">
                Base Version (Before):
              </label>
              <select
                value={baseVersionId}
                onChange={(e) => setBaseVersionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0e1322] border border-[#1e2942] text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    v{s.versionNumber} • {s.label} ({new Date(s.timestamp).toLocaleTimeString()})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-indigo-400 font-bold text-lg pt-4">➔</span>

            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase text-[#8892b0] mb-1">
                Compare Target (After):
              </label>
              <select
                value={compareVersionId}
                onChange={(e) => setCompareVersionId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0e1322] border border-[#1e2942] text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {snapshots.map((s) => (
                  <option key={s.id} value={s.id}>
                    v{s.versionNumber} • {s.label} ({new Date(s.timestamp).toLocaleTimeString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4">
            <button
              onClick={() => {
                onRestoreSnapshot(compareSnapshot.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Target Version</span>
            </button>
          </div>
        </div>

        {/* Diff Summary Badges */}
        <div className="px-5 py-2.5 bg-[#06080e] border-b border-[#141b2e] flex items-center space-x-4 text-xs font-bold">
          <span className="text-emerald-400 flex items-center gap-1">
            <PlusCircle className="w-3.5 h-3.5" /> +{diff.addedBlocks.length} Added Blocks
          </span>
          <span className="text-rose-400 flex items-center gap-1">
            <MinusCircle className="w-3.5 h-3.5" /> -{diff.removedBlocks.length} Removed Blocks
          </span>
          <span className="text-amber-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> ~{diff.modifiedBlocks.length} Modified Blocks
          </span>
          <span className="text-purple-400 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" /> {diff.variableChanges.length} Variable Changes
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#05070d] space-y-4">
          {/* Modified Blocks */}
          {diff.modifiedBlocks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Modified Blocks ({diff.modifiedBlocks.length})</span>
              </h3>
              <div className="space-y-2">
                {diff.modifiedBlocks.map((mb, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-[#090d18] border border-amber-500/30 space-y-1.5"
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{mb.title}</span>
                      <span className="text-[10px] font-mono text-[#8892b0]">ID: {mb.blockId}</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-amber-200/90 space-y-1">
                      {mb.changes.map((c, cIdx) => (
                        <li key={cIdx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Added Blocks */}
          {diff.addedBlocks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                <span>Added Blocks ({diff.addedBlocks.length})</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {diff.addedBlocks.map((b, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200"
                  >
                    <div className="font-bold">{b.title}</div>
                    <div className="text-[10px] text-emerald-400/70">{b.description || b.type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Removed Blocks */}
          {diff.removedBlocks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <MinusCircle className="w-4 h-4" />
                <span>Removed Blocks ({diff.removedBlocks.length})</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {diff.removedBlocks.map((b, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200"
                  >
                    <div className="font-bold">{b.title}</div>
                    <div className="text-[10px] text-rose-400/70">{b.description || b.type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variable Changes */}
          {diff.variableChanges.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                <span>Variable Changes ({diff.variableChanges.length})</span>
              </h3>
              <div className="space-y-1.5">
                {diff.variableChanges.map((vc, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#090d18] border border-purple-500/30 text-xs flex items-center justify-between"
                  >
                    <span className="font-bold text-white font-mono">{vc.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                        vc.type === 'added'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : vc.type === 'removed'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {vc.type} ({JSON.stringify(vc.oldValue)} ➔ {JSON.stringify(vc.newValue)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {diff.addedBlocks.length === 0 &&
            diff.removedBlocks.length === 0 &&
            diff.modifiedBlocks.length === 0 &&
            diff.variableChanges.length === 0 && (
              <div className="text-center py-16 text-[#8892b0] text-xs">
                Both version snapshots are identical in structure and parameters.
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
