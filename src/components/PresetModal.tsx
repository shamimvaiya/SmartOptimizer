import React, { useState } from 'react';
import { X, Layers, Plus } from 'lucide-react';
import { PresetProfile } from '../types';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preset: PresetProfile) => Promise<void>;
  basePreset: PresetProfile;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  basePreset,
}) => {
  const [name, setName] = useState('');
  const [targetGame, setTargetGame] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);

    const newPreset: PresetProfile = {
      ...JSON.parse(JSON.stringify(basePreset)),
      id: `preset_${Date.now()}`,
      name: name.replace(/\s+/g, '_'),
      targetGame: targetGame || 'Custom Game',
      description: description || `Optimized profile for ${name}`,
    };

    await onSave(newPreset);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#14141c] border-2 border-[#39ff14] shadow-[0_0_30px_rgba(57,255,20,0.3)] overflow-hidden">
        {/* Header */}
        <div className="h-14 px-6 bg-[#162b16] border-b border-[#252733] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#39ff14]" />
            <h3 className="text-base font-black text-white">Create New Optimizer Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#20202e] text-[#8892b0] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#8892b0] uppercase">Profile Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex_Mobile_Ultra"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 mt-1 px-3.5 rounded-xl bg-[#181824] text-white border border-[#2d2d3d] text-xs outline-none focus:border-[#39ff14]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#8892b0] uppercase">Target Game / App</label>
            <input
              type="text"
              placeholder="e.g. Apex Legends Mobile / Free Fire Max"
              value={targetGame}
              onChange={(e) => setTargetGame(e.target.value)}
              className="w-full h-10 mt-1 px-3.5 rounded-xl bg-[#181824] text-[#00e5ff] text-xs border border-[#2d2d3d] outline-none focus:border-[#39ff14]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#8892b0] uppercase">Description</label>
            <textarea
              rows={3}
              placeholder="144 FPS Lock, High Priority, Performance Cores..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl bg-[#181824] text-[#ccd6f6] text-xs border border-[#2d2d3d] outline-none focus:border-[#39ff14]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[#1f202b]">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-[#181822] text-[#8892b0] hover:text-white text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-5 rounded-xl bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer shadow-[0_0_12px_rgba(57,255,20,0.3)]"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
