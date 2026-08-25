import React, { useState } from 'react';
import { X, Variable, Plus, Check } from 'lucide-react';
import { MacroVariable } from '../../types';

interface CreateVariableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateVariable: (newVar: MacroVariable) => void;
}

export const CreateVariableModal: React.FC<CreateVariableModalProps> = ({
  isOpen,
  onClose,
  onCreateVariable,
}) => {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<'number' | 'string' | 'boolean'>('number');
  const [scope, setScope] = useState<'global' | 'local'>('global');
  const [defaultValue, setDefaultValue] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim().replace(/\s+/g, '_');
    if (!trimmed) {
      setError('Variable name cannot be empty.');
      return;
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed)) {
      setError('Name must start with a letter or underscore and contain alphanumeric characters.');
      return;
    }

    let parsedVal: any = defaultValue;
    if (type === 'number') {
      parsedVal = Number(defaultValue) || 0;
    } else if (type === 'boolean') {
      parsedVal = defaultValue.toLowerCase() === 'true';
    }

    const newVar: MacroVariable = {
      id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      type,
      value: parsedVal,
      defaultValue: parsedVal,
      scope,
    };

    onCreateVariable(newVar);
    setName('');
    setDefaultValue('0');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0e17] rounded-3xl border border-[#232f48] w-full max-w-md p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b2538] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6680] to-[#CF455C] flex items-center justify-center text-white shadow-md">
              <Variable className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Create New Variable</h2>
              <p className="text-[11px] text-[#8892b0]">Add dynamic state for macros & blocks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8892b0] hover:text-white hover:bg-[#18233c] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Variable Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Variable Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. score, ammoCount, targetX"
              autoFocus
              className="w-full px-3 py-2 rounded-xl bg-[#06080d] border border-[#1f283d] text-xs text-white placeholder:text-[#8892b0]/50 outline-none focus:border-[#FF6680] transition-colors"
            />
          </div>

          {/* Type Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Variable Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['number', 'string', 'boolean'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    if (t === 'number') setDefaultValue('0');
                    else if (t === 'string') setDefaultValue('Text');
                    else if (t === 'boolean') setDefaultValue('true');
                  }}
                  className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                    type === t
                      ? 'bg-[#FF6680]/20 border-[#FF6680] text-[#FF6680]'
                      : 'bg-[#06080d] border-[#1f283d] text-[#8892b0] hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Scope Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['global', 'local'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={`py-2 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                    scope === s
                      ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff]'
                      : 'bg-[#06080d] border-[#1f283d] text-[#8892b0] hover:text-white'
                  }`}
                >
                  {s} Scope
                </button>
              ))}
            </div>
          </div>

          {/* Default Value */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-white uppercase tracking-wider">
              Initial Default Value
            </label>
            <input
              type="text"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="Default initial value"
              className="w-full px-3 py-2 rounded-xl bg-[#06080d] border border-[#1f283d] text-xs text-white outline-none focus:border-[#FF6680] transition-colors"
            />
          </div>

          {error && <div className="text-xs text-rose-400 font-bold">{error}</div>}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1b2538]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#141a2c] hover:bg-[#1e2742] text-xs font-bold text-[#8892b0] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6680] to-[#CF455C] hover:from-[#FF6680] hover:to-[#CF455C] text-xs font-black text-white flex items-center space-x-1.5 shadow-lg cursor-pointer transition-transform hover:scale-105"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create Variable</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
