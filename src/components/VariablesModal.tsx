import React, { useState } from 'react';
import {
  X,
  Variable,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';
import { MacroVariable } from '../types';

interface VariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  variables: MacroVariable[];
  onSaveVariables: (vars: MacroVariable[]) => void;
  liveValues?: Record<string, any>;
}

export const VariablesModal: React.FC<VariablesModalProps> = ({
  isOpen,
  onClose,
  variables,
  onSaveVariables,
  liveValues = {},
}) => {
  const [localVars, setLocalVars] = useState<MacroVariable[]>(variables);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [newName, setNewName] = useState<string>('');
  const [newType, setNewType] = useState<'number' | 'string' | 'boolean'>('number');
  const [newDefaultVal, setNewDefaultVal] = useState<string>('0');
  const [newDesc, setNewDesc] = useState<string>('');

  if (!isOpen) return null;

  const handleAddVariable = () => {
    if (!newName.trim()) return;

    let parsedVal: any = newDefaultVal;
    if (newType === 'number') parsedVal = Number(newDefaultVal) || 0;
    if (newType === 'boolean') parsedVal = newDefaultVal.toLowerCase() === 'true';

    const newVar: MacroVariable = {
      id: `var_${Date.now()}`,
      name: newName.trim(),
      type: newType,
      defaultValue: parsedVal,
      value: parsedVal,
      scope: 'global',
      description: newDesc.trim(),
    };

    const updated = [...localVars, newVar];
    setLocalVars(updated);
    onSaveVariables(updated);

    setNewName('');
    setNewDefaultVal('0');
    setNewDesc('');
  };

  const handleDelete = (id: string) => {
    const updated = localVars.filter((v) => v.id !== id);
    setLocalVars(updated);
    onSaveVariables(updated);
  };

  const filteredVars = localVars.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      id="variables-manager-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="variables-manager-container"
        className="w-full max-w-2xl bg-[#0a0d16] border-2 border-[#1f283d] rounded-2xl shadow-2xl flex flex-col p-6 overflow-hidden max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f283d] pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/40">
              <Variable className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide">Macro Variables Manager</h3>
              <p className="text-xs text-[#8892b0]">Define &amp; inspect global runtime variables for conditions and math</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8892b0] hover:text-white hover:bg-[#1f283d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Variable Form */}
        <div className="p-4 rounded-xl bg-[#0e121e] border border-[#1f283d] mb-4 space-y-3">
          <span className="text-xs font-black text-[#00e5ff] uppercase tracking-wider block">
            + Create New Variable
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] text-[#8892b0] font-bold block mb-1">Variable Name</label>
              <input
                type="text"
                placeholder="e.g. ammoCount"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#05070c] text-white text-xs border border-[#1f283d] focus:border-[#00e5ff] outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-[#8892b0] font-bold block mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => {
                  const t = e.target.value as any;
                  setNewType(t);
                  if (t === 'number') setNewDefaultVal('0');
                  if (t === 'boolean') setNewDefaultVal('false');
                  if (t === 'string') setNewDefaultVal('');
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#05070c] text-white text-xs border border-[#1f283d] focus:border-[#00e5ff] outline-none"
              >
                <option value="number">Number</option>
                <option value="string">String</option>
                <option value="boolean">Boolean</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#8892b0] font-bold block mb-1">Default Value</label>
              <input
                type="text"
                placeholder="0"
                value={newDefaultVal}
                onChange={(e) => setNewDefaultVal(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#05070c] text-[#00e5ff] text-xs border border-[#1f283d] focus:border-[#00e5ff] outline-none font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAddVariable}
                disabled={!newName.trim()}
                className="w-full h-8 px-3 rounded-lg bg-[#00e5ff] hover:bg-[#33ebff] text-black font-extrabold text-xs flex items-center justify-center space-x-1 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,229,255,0.3)]"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-[#8892b0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search defined variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#101424] text-white text-xs border border-[#1f283d] focus:border-[#00e5ff] outline-none font-medium placeholder-[#64748b]"
          />
        </div>

        {/* Variables List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-[#1f283d]">
          {filteredVars.length === 0 ? (
            <div className="text-center py-8 text-[#64748b] text-xs">
              No variables defined yet. Use the form above to add your first variable.
            </div>
          ) : (
            filteredVars.map((v) => {
              const liveVal = liveValues[v.name] !== undefined ? liveValues[v.name] : v.defaultValue;
              return (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-[#0e121e] border border-[#1f283d] flex items-center justify-between hover:border-[#a855f7]/60 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-extrabold text-[#00e5ff]">
                      {v.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#162238] text-[#a855f7] border border-[#a855f7]/30 font-bold uppercase">
                      {v.type}
                    </span>
                    <span className="text-xs text-[#8892b0] font-mono">
                      Default: <span className="text-white">{String(v.defaultValue)}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-[10px] text-[#8892b0] block font-mono">Live Value:</span>
                      <span className="text-xs font-mono font-bold text-[#39ff14]">
                        {String(liveVal)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 rounded-lg text-[#8892b0] hover:text-[#ff4444] hover:bg-[#2a1414] transition-colors cursor-pointer"
                      title="Delete Variable"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1f283d] pt-4 mt-4 flex items-center justify-between">
          <span className="text-xs text-[#8892b0]">
            {localVars.length} variable{localVars.length !== 1 ? 's' : ''} configured
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#00e5ff] text-black font-extrabold text-xs hover:bg-[#33ebff] transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.4)]"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
