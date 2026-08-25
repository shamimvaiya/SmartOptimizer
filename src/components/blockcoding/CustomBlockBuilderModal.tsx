import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Boxes,
  Check,
  Zap,
  Play,
  GitBranch,
  Repeat,
  Sliders,
  Layers,
} from 'lucide-react';
import { BlockCategory, BlockNode, CustomBlockDefinition, CustomBlockInputDef, CustomBlockOutputDef } from '../../types';
import { BLOCK_CATALOG, createBlockInstance } from '../../data/blockCatalog';

interface CustomBlockBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomBlock: (customBlock: CustomBlockDefinition) => void;
  initialBlocksToConvert?: BlockNode[];
}

export const CustomBlockBuilderModal: React.FC<CustomBlockBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomBlock,
  initialBlocksToConvert,
}) => {
  const [name, setName] = useState<string>('My Custom Logic');
  const [category, setCategory] = useState<BlockCategory>('custom');
  const [color, setColor] = useState<string>('#f43f5e');
  const [icon, setIcon] = useState<string>('Boxes');
  const [description, setDescription] = useState<string>('Reusable custom block procedure');
  const [inputs, setInputs] = useState<CustomBlockInputDef[]>([
    { id: 'inp_1', name: 'targetParam', type: 'number', defaultValue: 100, label: 'Target Value' },
  ]);
  const [outputs, setOutputs] = useState<CustomBlockOutputDef[]>([]);
  const [internalBlocks, setInternalBlocks] = useState<BlockNode[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialBlocksToConvert && initialBlocksToConvert.length > 0) {
      setName('Composite Custom Routine');
      setDescription(`Encapsulated routine with ${initialBlocksToConvert.length} action blocks`);
      setInternalBlocks(JSON.parse(JSON.stringify(initialBlocksToConvert)));
    } else {
      setName('My Custom Logic');
      setDescription('Reusable custom block procedure');
      const clickProto = BLOCK_CATALOG.find((b) => b.type === 'action_human_click');
      if (clickProto) {
        setInternalBlocks([createBlockInstance(clickProto)]);
      }
    }
  }, [isOpen, initialBlocksToConvert]);

  if (!isOpen) return null;

  const handleAddInput = () => {
    const newInp: CustomBlockInputDef = {
      id: `inp_${Date.now()}`,
      name: `param${inputs.length + 1}`,
      type: 'number',
      defaultValue: 0,
      label: `Parameter ${inputs.length + 1}`,
    };
    setInputs((prev) => [...prev, newInp]);
  };

  const handleRemoveInput = (id: string) => {
    setInputs((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const customDef: CustomBlockDefinition = {
      id: `cblk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      category,
      color,
      icon,
      description: description.trim(),
      inputs,
      outputs,
      internalBlocks,
      createdAt: new Date().toISOString(),
      version: 1,
    };

    onSaveCustomBlock(customDef);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0e17] rounded-3xl border-2 border-rose-500/50 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1b2538] flex items-center justify-between bg-gradient-to-r from-rose-950/40 to-pink-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Custom Block Builder</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Block SDK
                </span>
              </h2>
              <p className="text-xs text-[#8892b0]">
                Design custom reusable puzzle blocks with encapsulated inputs, parameters, and internal logic.
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Live Scratch Block Preview Box */}
          <div className="p-4 rounded-2xl bg-[#070911] border border-[#1e2842] space-y-2">
            <span className="text-[10px] font-black text-[#8892b0] uppercase tracking-wider block">
              Live Block Preview
            </span>
            <div className="flex items-center justify-center p-4 bg-[#04060b] rounded-xl border border-dashed border-[#1f293d]">
              <div
                style={{ backgroundColor: color || '#FF6680' }}
                className="px-4 py-2 rounded-xl text-white font-black text-xs shadow-xl border-2 border-white/20 flex items-center space-x-2 relative"
              >
                <div className="absolute top-0 left-4 w-3 h-1 bg-[#04060b] rounded-b-sm" />
                <span className="uppercase text-[10px] text-white/80">DEFINE</span>
                <span className="font-extrabold">{name || 'Custom Block Name'}</span>
                {inputs.map((inp) => (
                  <span
                    key={inp.id}
                    className="bg-black/30 px-2 py-0.5 rounded-full text-[10px] font-bold text-white border border-white/20"
                  >
                    {inp.name}: ({inp.defaultValue || inp.type})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* General Block Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#8892b0] uppercase tracking-wider block mb-1">
                Block Title / Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rapid Aim & Tap"
                className="w-full px-3 py-2 rounded-xl bg-[#06080d] border border-[#1f283d] text-white text-xs font-bold focus:border-rose-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#8892b0] uppercase tracking-wider block mb-1">
                Accent Theme Color
              </label>
              <div className="flex items-center space-x-2">
                {['#f43f5e', '#ec4899', '#a855f7', '#3b82f6', '#00e5ff', '#00e676', '#ffd600', '#ff007f'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-lg border-2 transition-transform cursor-pointer ${
                      color === c ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#8892b0] uppercase tracking-wider block mb-1">
                Description / Purpose
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this custom block accomplishes..."
                className="w-full px-3 py-2 rounded-xl bg-[#06080d] border border-[#1f283d] text-white text-xs focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          {/* Inputs & Parameters Specification */}
          <div className="space-y-3 bg-[#080b12] p-4 rounded-2xl border border-[#1a2338]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Exposed Block Inputs & Parameters</span>
              </span>

              <button
                onClick={handleAddInput}
                className="px-2 py-1 rounded-lg bg-[#141b2c] hover:bg-[#1f2b45] text-[10px] font-bold text-rose-300 border border-rose-500/30 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Input</span>
              </button>
            </div>

            <div className="space-y-2">
              {inputs.map((inp, idx) => (
                <div
                  key={inp.id}
                  className="grid grid-cols-12 gap-2 items-center bg-[#0d111c] p-2.5 rounded-xl border border-[#1b2538]"
                >
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={inp.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInputs((prev) => prev.map((x) => (x.id === inp.id ? { ...x, name: val, label: val } : x)));
                      }}
                      placeholder="Input Name"
                      className="w-full px-2 py-1 rounded bg-[#06080d] border border-[#232e48] text-xs text-white font-mono"
                    />
                  </div>

                  <div className="col-span-3">
                    <select
                      value={inp.type}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setInputs((prev) => prev.map((x) => (x.id === inp.id ? { ...x, type: val } : x)));
                      }}
                      className="w-full px-2 py-1 rounded bg-[#06080d] border border-[#232e48] text-xs text-[#00e5ff]"
                    >
                      <option value="number">Number</option>
                      <option value="string">String</option>
                      <option value="boolean">Boolean</option>
                    </select>
                  </div>

                  <div className="col-span-4">
                    <input
                      type="text"
                      value={String(inp.defaultValue ?? '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInputs((prev) => prev.map((x) => (x.id === inp.id ? { ...x, defaultValue: val } : x)));
                      }}
                      placeholder="Default Value"
                      className="w-full px-2 py-1 rounded bg-[#06080d] border border-[#232e48] text-xs text-[#39ff14] font-mono"
                    />
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => handleRemoveInput(inp.id)}
                      className="p-1 rounded text-[#8892b0] hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Encapsulated Block Logic Preview */}
          <div className="space-y-3 bg-[#080b12] p-4 rounded-2xl border border-[#1a2338]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Internal Encapsulated Logic ({internalBlocks.length} blocks)</span>
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {internalBlocks.map((b, idx) => (
                <div
                  key={b.id || idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#0e1320] border border-[#1e283d] text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-[#8892b0] font-mono text-[10px]">#{idx + 1}</span>
                    <span className="font-bold text-white">{b.title}</span>
                    <span className="text-[10px] text-[#8892b0] font-mono">({b.category})</span>
                  </div>
                  <span className="text-[10px] text-[#00e5ff] font-mono">
                    {Object.keys(b.parameters || {}).length} params
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1b2538] flex items-center justify-end space-x-3 bg-[#090b10]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141824] hover:bg-[#1f283d] text-xs font-bold text-[#8892b0] hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-xs font-black text-white shadow-lg flex items-center space-x-2 cursor-pointer transition-transform hover:scale-105"
          >
            <Check className="w-4 h-4" />
            <span>Save Custom Block to Library</span>
          </button>
        </div>
      </div>
    </div>
  );
};
