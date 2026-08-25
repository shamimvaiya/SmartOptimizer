import React, { useState } from 'react';
import { X, Tv, Folder, Plus } from 'lucide-react';

interface AddEmulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; executablePath: string; adbPort: number; type: string }) => Promise<void>;
}

export const AddEmulatorModal: React.FC<AddEmulatorModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [executablePath, setExecutablePath] = useState('');
  const [adbPort, setAdbPort] = useState<number>(5555);
  const [type, setType] = useState('Custom');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !executablePath) return;
    setLoading(true);
    await onAdd({ name, executablePath, adbPort, type });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#14141c] border-2 border-[#00e5ff] shadow-[0_0_30px_rgba(0,229,255,0.3)] overflow-hidden">
        {/* Modal Header */}
        <div className="h-14 px-6 bg-[#162029] border-b border-[#252733] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tv className="w-5 h-5 text-[#00e5ff]" />
            <h3 className="text-base font-black text-white">Add Custom Emulator Instance</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-[#20202e] text-[#8892b0] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#8892b0] uppercase">Instance Display Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Gameloop Global / Custom BlueStacks"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 mt-1 px-3.5 rounded-xl bg-[#181824] text-white border border-[#2d2d3d] text-xs outline-none focus:border-[#00e5ff]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#8892b0] uppercase">
              Executable Binary Path (.exe)
            </label>
            <input
              type="text"
              required
              placeholder="C:\Program Files\...\emulator.exe"
              value={executablePath}
              onChange={(e) => setExecutablePath(e.target.value)}
              className="w-full h-10 mt-1 px-3.5 rounded-xl bg-[#181824] text-[#39ff14] font-mono text-xs border border-[#2d2d3d] outline-none focus:border-[#00e5ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#8892b0] uppercase">ADB Port</label>
              <input
                type="number"
                value={adbPort}
                onChange={(e) => setAdbPort(parseInt(e.target.value) || 5555)}
                className="w-full h-10 mt-1 px-3.5 rounded-xl bg-[#181824] text-[#00e5ff] font-mono text-xs border border-[#2d2d3d] outline-none focus:border-[#00e5ff]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#8892b0] uppercase">
                Emulator Family / Engine
              </label>
              <input
                type="text"
                placeholder="e.g. BlueStacks, LDPlayer, Custom..."
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 mt-1 px-3.5 rounded-xl bg-[#181824] text-white border border-[#2d2d3d] text-xs outline-none focus:border-[#00e5ff]"
                list="emulator-family-suggestions"
              />
              <datalist id="emulator-family-suggestions">
                <option value="Custom" />
                <option value="BlueStacks" />
                <option value="LDPlayer" />
                <option value="NoxPlayer" />
                <option value="Gameloop" />
                <option value="MuMu" />
                <option value="MEmu" />
                <option value="MSIAppPlayer" />
              </datalist>
            </div>
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
              className="h-10 px-5 rounded-xl bg-[#002b30] hover:bg-[#003e47] text-[#00e5ff] border border-[#00e5ff] text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.3)]"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Adding...' : 'Add Emulator'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
