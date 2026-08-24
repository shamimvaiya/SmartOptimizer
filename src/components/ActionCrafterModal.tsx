import React, { useState } from 'react';
import { X, Sparkles, Code2, Palette, Cpu, Terminal, Target, Zap, Sliders, Check } from 'lucide-react';

export interface CustomActionDefinition {
  id: string;
  name: string;
  category: 'Vision' | 'Input' | 'Loops' | 'Logic' | 'ADB' | 'Custom';
  color: string;
  iconName: string;
  defaultParameters: string;
  csharpScript: string;
}

interface ActionCrafterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAction: (action: CustomActionDefinition) => void;
}

const PRESET_COLORS = ['#39ff14', '#00e5ff', '#a855f7', '#ff0055', '#eab308', '#2563eb', '#f97316'];
const PRESET_ICONS = [
  { name: 'Zap', Icon: Zap },
  { name: 'Target', Icon: Target },
  { name: 'Cpu', Icon: Cpu },
  { name: 'Terminal', Icon: Terminal },
  { name: 'Sliders', Icon: Sliders },
  { name: 'Sparkles', Icon: Sparkles },
];

export const ActionCrafterModal: React.FC<ActionCrafterModalProps> = ({ isOpen, onClose, onSaveAction }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Vision' | 'Input' | 'Loops' | 'Logic' | 'ADB' | 'Custom'>('Custom');
  const [color, setColor] = useState('#39ff14');
  const [iconName, setIconName] = useState('Zap');
  const [defaultParameters, setDefaultParameters] = useState('X: 960, Y: 540, Count: 3');
  const [csharpScript, setCsharpScript] = useState(
    `// Custom C# Logic Execution\nfor(int i = 0; i < Count; i++) {\n    AdbDriver.Tap(X, Y);\n    await Task.Delay(50);\n}`
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAction: CustomActionDefinition = {
      id: `custom_action_${Date.now()}`,
      name: name.trim(),
      category,
      color,
      iconName,
      defaultParameters,
      csharpScript,
    };

    onSaveAction(newAction);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-2xl bg-[#0e1017] border-2 border-[#00e5ff] rounded-2xl shadow-[0_0_35px_rgba(0,229,255,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#141824] border-b border-[#1f283d] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-wide">Action Crafter Studio</h3>
              <p className="text-xs text-[#8892b0]">Define new modular macro actions with custom C# scripts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8892b0] hover:text-white hover:bg-[#1f283d] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Action Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8892b0] font-bold mb-1.5">Action Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fast Auto-Loot Tap"
                className="w-full h-10 px-3 rounded-xl bg-[#08090e] text-white border border-[#232d42] focus:border-[#00e5ff] font-bold outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[#8892b0] font-bold mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl bg-[#08090e] text-[#00e5ff] border border-[#232d42] focus:border-[#00e5ff] font-bold outline-none cursor-pointer"
              >
                <option value="Custom">Custom</option>
                <option value="Vision">Vision</option>
                <option value="Input">Input</option>
                <option value="Loops">Loops</option>
                <option value="Logic">Logic</option>
                <option value="ADB">ADB</option>
              </select>
            </div>
          </div>

          {/* Color & Icon Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#8892b0] font-bold mb-1.5">Glow Accent Color</label>
              <div className="flex items-center space-x-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-lg transition-transform cursor-pointer flex items-center justify-center ${
                      color === c ? 'scale-110 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-black font-black" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#8892b0] font-bold mb-1.5">Icon Symbol</label>
              <div className="flex items-center space-x-2">
                {PRESET_ICONS.map(({ name: iName, Icon }) => (
                  <button
                    key={iName}
                    type="button"
                    onClick={() => setIconName(iName)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      iconName === iName
                        ? 'bg-[#182235] text-[#00e5ff] border-[#00e5ff]'
                        : 'bg-[#08090e] text-[#8892b0] border-[#232d42] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Default Parameters */}
          <div>
            <label className="block text-[#8892b0] font-bold mb-1.5">Default Parameters Template</label>
            <input
              type="text"
              value={defaultParameters}
              onChange={(e) => setDefaultParameters(e.target.value)}
              placeholder="e.g. 960, 540, 50"
              className="w-full h-10 px-3 rounded-xl bg-[#08090e] text-[#39ff14] font-mono border border-[#232d42] focus:border-[#39ff14] outline-none"
            />
          </div>

          {/* C# Code Script Body */}
          <div>
            <label className="block text-[#8892b0] font-bold mb-1.5 flex items-center justify-between">
              <span>Executable C# Script Body</span>
              <span className="text-[10px] text-[#00e5ff] font-mono">.NET 8 Runtime Engine</span>
            </label>
            <textarea
              rows={5}
              value={csharpScript}
              onChange={(e) => setCsharpScript(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#06070a] text-[#ccd6f6] font-mono text-xs border border-[#232d42] focus:border-[#00e5ff] outline-none leading-relaxed"
            />
          </div>

          {/* Submit Controls */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#1a1f2c] hover:bg-[#252c3e] text-[#8892b0] font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#00e5ff] hover:bg-[#00c2d8] text-black font-extrabold flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all hover:scale-105"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Register Action</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
