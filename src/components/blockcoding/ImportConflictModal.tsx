import React from 'react';
import { AlertCircle, ArrowRight, Check, Copy, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { ConflictResolutionOption } from '../../types';

interface ImportConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictDetails: {
    conflictingCustomBlocks: string[];
    conflictingVariables: string[];
  };
  onResolve: (option: ConflictResolutionOption) => void;
}

export const ImportConflictModal: React.FC<ImportConflictModalProps> = ({
  isOpen,
  onClose,
  conflictDetails,
  onResolve,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0e17] rounded-3xl border-2 border-amber-500/50 w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#1b2538] flex items-center justify-between bg-[#0e121e]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Import Conflict Detected</h2>
              <p className="text-xs text-[#8892b0]">
                Some custom blocks or variables in the imported file share identical names with your workspace.
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

        {/* Content */}
        <div className="p-5 space-y-4 bg-[#070912]">
          {/* Conflicts Summary */}
          {conflictDetails.conflictingCustomBlocks.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#0e1322] border border-amber-500/30 text-xs space-y-1">
              <div className="font-black text-amber-300 uppercase tracking-wider">
                Conflicting Custom Blocks:
              </div>
              <div className="text-white font-mono">
                {conflictDetails.conflictingCustomBlocks.join(', ')}
              </div>
            </div>
          )}

          {conflictDetails.conflictingVariables.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#0e1322] border border-cyan-500/30 text-xs space-y-1">
              <div className="font-black text-cyan-300 uppercase tracking-wider">
                Conflicting Variables:
              </div>
              <div className="text-white font-mono">
                {conflictDetails.conflictingVariables.join(', ')}
              </div>
            </div>
          )}

          <div className="text-xs font-bold text-[#8892b0]">
            Please choose how you want to resolve the conflict:
          </div>

          {/* Resolution Choices */}
          <div className="space-y-2.5">
            <button
              onClick={() => onResolve('keep_both')}
              className="w-full p-3.5 rounded-2xl bg-[#0e1322] hover:bg-[#182136] border border-emerald-500/30 text-left flex items-center justify-between group transition-colors cursor-pointer"
            >
              <div>
                <div className="text-xs font-black text-emerald-400">
                  Keep Both (Auto-Rename Imported) [Recommended]
                </div>
                <div className="text-[11px] text-[#8892b0] mt-0.5">
                  Appends a (Imported) suffix to colliding blocks and variables without overwriting existing ones.
                </div>
              </div>
              <Check className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button
              onClick={() => onResolve('replace')}
              className="w-full p-3.5 rounded-2xl bg-[#0e1322] hover:bg-[#182136] border border-amber-500/30 text-left flex items-center justify-between group transition-colors cursor-pointer"
            >
              <div>
                <div className="text-xs font-black text-amber-400">
                  Overwrite / Replace Existing
                </div>
                <div className="text-[11px] text-[#8892b0] mt-0.5">
                  Replaces your current custom block definitions and variable values with the imported versions.
                </div>
              </div>
              <RefreshCw className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
