import React, { useState, useEffect } from 'react';
import {
  X,
  Tv,
  Plus,
  Edit3,
  Cpu,
  Radio,
  FileCode,
  Check,
  Smartphone,
  Layers,
  Trash2,
  Sparkles,
  Info,
} from 'lucide-react';
import { InstalledEmulatorInfo } from '../types';
import { api } from '../services/api';

export interface EmulatorEnginePresetItem {
  id: string;
  name: string;
  executablePath: string;
  adbPort: number;
  color: string;
  family: string;
}

interface AddEmulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (data: { name: string; executablePath: string; adbPort: number; type: string; version?: string }) => Promise<void>;
  onUpdate?: (id: string, data: Partial<InstalledEmulatorInfo>) => Promise<void>;
  initialData?: InstalledEmulatorInfo | null;
  isBn?: boolean;
}

export const AddEmulatorModal: React.FC<AddEmulatorModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  onUpdate,
  initialData = null,
  isBn = false,
}) => {
  const isEditMode = Boolean(initialData);

  const [name, setName] = useState('');
  const [executablePath, setExecutablePath] = useState('');
  const [adbPort, setAdbPort] = useState<number>(5555);
  const [type, setType] = useState('BlueStacks');
  const [detectedVersion, setDetectedVersion] = useState<string>('Auto-detecting on run');
  const [loading, setLoading] = useState(false);

  // Portable Engine Presets state
  const [enginePresets, setEnginePresets] = useState<EmulatorEnginePresetItem[]>([]);
  const [isCreatingPreset, setIsCreatingPreset] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newPresetPath, setNewPresetPath] = useState<string>('');
  const [newPresetPort, setNewPresetPort] = useState<number>(5555);

  // Fetch portable engine presets on open
  useEffect(() => {
    if (isOpen) {
      loadEnginePresets();
    }
  }, [isOpen]);

  const loadEnginePresets = async () => {
    try {
      const res = await api.getEmulatorEnginePresets();
      if (res.presets) {
        setEnginePresets(res.presets);
      }
    } catch (e) {
      console.error('Failed to load engine presets:', e);
    }
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setExecutablePath(initialData.executablePath || '');
      setAdbPort(initialData.adbPort || 5555);
      setType(initialData.type || 'Custom');
      setDetectedVersion(
        initialData.version && !initialData.version.includes('Custom Build')
          ? initialData.version
          : (initialData.pid ? 'x86_64 (64-Bit Android 11)' : 'Auto-detects on first launch')
      );
    } else {
      setName('');
      setExecutablePath('');
      setAdbPort(5555);
      setType('BlueStacks');
      setDetectedVersion('Auto-detects on first launch');
    }
    setIsCreatingPreset(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (isEditMode && initialData && onUpdate) {
        await onUpdate(initialData.id, {
          name: name.trim(),
          executablePath: executablePath.trim() || 'C:\\Program Files\\AndroidEmulator\\emulator.exe',
          adbPort: Number(adbPort) || 5555,
          type: type.trim() || 'Custom',
          version: detectedVersion,
        });
      } else if (onAdd) {
        await onAdd({
          name: name.trim(),
          executablePath: executablePath.trim() || 'C:\\Program Files\\AndroidEmulator\\emulator.exe',
          adbPort: Number(adbPort) || 5555,
          type: type.trim() || 'Custom',
          version: detectedVersion,
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to save emulator:', err);
    } finally {
      setLoading(false);
    }
  };

  // Quick preset select
  const handleSelectPresetEngine = (preset: EmulatorEnginePresetItem) => {
    setType(preset.family || preset.name);
    if (!name || name === 'New Emulator' || name === 'BlueStacks' || name === 'LDPlayer' || name === 'Gameloop' || name === 'MSI App Player') {
      setName(preset.name);
    }
    if (!executablePath || executablePath.includes('Program Files')) {
      setExecutablePath(preset.executablePath);
    }
    setAdbPort(preset.adbPort || 5555);
  };

  // Delete portable preset permanently
  const handleDeletePresetEngine = async (e: React.MouseEvent, id: string, presetName: string) => {
    e.stopPropagation();
    try {
      await api.deleteEmulatorEnginePreset(id);
      setEnginePresets((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete engine preset:', err);
    }
  };

  // Save new custom engine preset
  const handleSaveNewEnginePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    try {
      const res = await api.addEmulatorEnginePreset({
        name: newPresetName.trim(),
        executablePath: newPresetPath.trim() || 'C:\\Program Files\\...',
        adbPort: Number(newPresetPort) || 5555,
        color: '#00e5ff',
        family: newPresetName.trim(),
      });
      if (res.preset) {
        setEnginePresets((prev) => [...prev, res.preset]);
        handleSelectPresetEngine(res.preset);
      }
      setIsCreatingPreset(false);
      setNewPresetName('');
      setNewPresetPath('');
    } catch (err) {
      console.error('Failed to add engine preset:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg rounded-2xl bg-[#10111a] border-2 border-[#00e5ff]/60 shadow-[0_0_40px_rgba(0,229,255,0.3)] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="h-16 px-6 bg-gradient-to-r from-[#141b24] via-[#0f121a] to-[#141b24] border-b border-[#222538] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.25)]">
              {isEditMode ? (
                <Edit3 className="w-5 h-5 text-[#00e5ff]" />
              ) : (
                <Tv className="w-5 h-5 text-[#00e5ff]" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>
                  {isEditMode
                    ? isBn
                      ? 'ইমুলেটর কনফিগারেশন এডিট করুন'
                      : 'Edit Emulator Configuration'
                    : isBn
                    ? 'নতুন ইমুলেটর ইনস্ট্যান্স যোগ করুন'
                    : 'Add New Emulator Instance'}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40">
                  {type}
                </span>
              </h3>
              <p className="text-[11px] text-[#8892b0]">
                {isEditMode
                  ? isBn
                    ? 'ইমুলেটর নাম, পোর্ট ও পাথ পরিবর্তন করে সেভ করুন'
                    : 'Update display name, ADB port, and executable path parameters'
                  : isBn
                  ? 'কাস্টম বা পোর্টেবল অ্যান্ড্রয়েড ইমুলেটর ব্রিজ রেজিস্টার করুন'
                  : 'Register custom or portable Android emulator process hook'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1b1d2a] hover:bg-[#25283a] text-[#8892b0] hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Engine Presets Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#8892b0] uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#00e5ff]" />
                <span>{isBn ? 'ইমুলেটর ইঞ্জিন প্রিসেট' : 'Quick Engine Presets'}</span>
              </label>

              <button
                type="button"
                onClick={() => setIsCreatingPreset(!isCreatingPreset)}
                className="text-[10px] font-bold text-[#39ff14] hover:text-[#55ff33] flex items-center gap-1 cursor-pointer transition-all bg-[#162916] px-2 py-0.5 rounded-md border border-[#39ff14]/30 hover:border-[#39ff14]"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>{isBn ? 'প্রিসেট তৈরি করুন' : 'New Preset'}</span>
              </button>
            </div>

            {/* Inline Preset Creator */}
            {isCreatingPreset && (
              <div className="p-3 rounded-xl bg-[#141624] border border-[#39ff14]/40 space-y-2.5 animate-in fade-in duration-150">
                <div className="text-[11px] font-bold text-[#39ff14] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পোর্টেবল ইঞ্জিন প্রিসেট তৈরি করুন' : 'Create Portable Engine Preset'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder={isBn ? 'ইঞ্জিন নাম (e.g. MuMu 12)' : 'Preset Name (e.g. MuMu 12)'}
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="h-8 px-2.5 rounded-lg bg-[#0e0f18] text-white text-xs border border-[#2b2e40] outline-none focus:border-[#39ff14]"
                  />
                  <input
                    type="number"
                    placeholder="ADB Port (e.g. 5555)"
                    value={newPresetPort}
                    onChange={(e) => setNewPresetPort(parseInt(e.target.value) || 5555)}
                    className="h-8 px-2.5 rounded-lg bg-[#0e0f18] text-[#00e5ff] font-mono text-xs border border-[#2b2e40] outline-none focus:border-[#39ff14]"
                  />
                </div>
                <input
                  type="text"
                  placeholder={isBn ? 'ডিফল্ট পাথ (e.g. C:\\MuMuPlayer\\mumu.exe)' : 'Default Executable Path'}
                  value={newPresetPath}
                  onChange={(e) => setNewPresetPath(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#0e0f18] text-[#39ff14] font-mono text-xs border border-[#2b2e40] outline-none focus:border-[#39ff14]"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingPreset(false)}
                    className="px-2.5 py-1 text-[11px] text-[#8892b0] hover:text-white"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewEnginePreset}
                    className="px-3 py-1 rounded-md bg-[#162b16] text-[#39ff14] border border-[#39ff14] text-[11px] font-bold hover:bg-[#1f3d1f]"
                  >
                    {isBn ? 'প্রিসেট সেভ করুন' : 'Save Preset'}
                  </button>
                </div>
              </div>
            )}

            {/* Presets Badges List with Permanent Delete */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {enginePresets.length > 0 ? (
                enginePresets.map((eng) => {
                  const isSelected = type.toLowerCase().includes(eng.name.toLowerCase().split(' ')[0]);
                  return (
                    <div
                      key={eng.id}
                      onClick={() => handleSelectPresetEngine(eng)}
                      className={`group relative h-8 pl-3 pr-2 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#182b1c] border-[#39ff14] text-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                          : 'bg-[#151622] border-[#262838] text-[#8892b0] hover:text-white hover:border-[#00e5ff]/50'
                      }`}
                    >
                      <span className="truncate">{eng.name}</span>
                      {/* Permanent Delete Button for preset */}
                      <button
                        type="button"
                        onClick={(e) => handleDeletePresetEngine(e, eng.id, eng.name)}
                        className="w-4 h-4 rounded-md flex items-center justify-center text-[#64748b] hover:text-[#ff4444] hover:bg-[#ff4444]/20 transition-all ml-1 cursor-pointer"
                        title={isBn ? `প্রিসেট '${eng.name}' স্থায়ীভাবে মুছুন` : `Permanently delete '${eng.name}'`}
                      >
                        <X className="w-3 h-3 stroke-[3]" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-[#64748b] py-1 italic">
                  {isBn ? 'কোনো ইঞ্জিন প্রিসেট নেই। উপরে থেকে নতুন তৈরি করুন।' : 'No engine presets saved. Create one above.'}
                </div>
              )}
            </div>
          </div>

          {/* Instance Name */}
          <div>
            <label className="text-[11px] font-bold text-[#8892b0] uppercase flex items-center justify-between">
              <span>{isBn ? 'ইমুলেটর নাম (Display Name)' : 'Instance Display Name'}</span>
              <span className="text-[10px] text-[#64748b]">Required</span>
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                required
                placeholder="e.g. BlueStacks 5 (Pie 64) / Gameloop Ultra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#141520] text-white border border-[#262838] text-xs font-semibold outline-none focus:border-[#00e5ff] transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Executable Binary Path */}
          <div>
            <label className="text-[11px] font-bold text-[#8892b0] uppercase flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-[#39ff14]" />
                <span>{isBn ? 'এক্সিকিউটেবল পাথ (.exe)' : 'Executable Binary Path (.exe)'}</span>
              </span>
              <span className="text-[10px] text-[#64748b]">Auto-hook target</span>
            </label>
            <input
              type="text"
              placeholder="C:\Program Files\BlueStacks_nxt\HD-Player.exe"
              value={executablePath}
              onChange={(e) => setExecutablePath(e.target.value)}
              className="w-full h-10 mt-1 px-3.5 rounded-xl bg-[#141520] text-[#39ff14] font-mono text-xs border border-[#262838] outline-none focus:border-[#00e5ff] transition-all"
            />
          </div>

          {/* ADB Port & Auto-detected Architecture */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#8892b0] uppercase flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-[#00e5ff]" />
                <span>{isBn ? 'ADB পোর্ট' : 'ADB Port'}</span>
              </label>
              <div className="relative mt-1">
                <input
                  type="number"
                  value={adbPort}
                  onChange={(e) => setAdbPort(parseInt(e.target.value) || 5555)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#141520] text-[#00e5ff] font-mono font-bold text-xs border border-[#262838] outline-none focus:border-[#00e5ff]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#8892b0] uppercase flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-[#ffd600]" />
                <span>{isBn ? 'আর্কিটেকচার স্ট্যাটাস' : 'Architecture Status'}</span>
              </label>
              <div className="h-10 mt-1 px-3 rounded-xl bg-[#141520] border border-[#262838] flex items-center space-x-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse"></span>
                <span className="text-[#cbd5e1] font-mono text-[11px] truncate">
                  {detectedVersion}
                </span>
              </div>
            </div>
          </div>

          {/* Platform / Engine Family Selection */}
          <div>
            <label className="text-[11px] font-bold text-[#8892b0] uppercase flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-[#ff007f]" />
              <span>{isBn ? 'ইমুলেটর টাইপ / প্ল্যাটফর্ম' : 'Emulator Type / Family'}</span>
            </label>
            <input
              type="text"
              placeholder="e.g. BlueStacks, LDPlayer, Gameloop, MSI, MuMu, Custom..."
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 mt-1 px-3.5 rounded-xl bg-[#141520] text-white border border-[#262838] text-xs outline-none focus:border-[#00e5ff]"
              list="emulator-family-options"
            />
            <datalist id="emulator-family-options">
              <option value="BlueStacks" />
              <option value="MSIAppPlayer" />
              <option value="LDPlayer" />
              <option value="Gameloop" />
              <option value="NoxPlayer" />
              <option value="MuMu" />
              <option value="MEmu" />
              <option value="Custom Android" />
            </datalist>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-[#1e202e]">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-xl bg-[#181924] hover:bg-[#222434] text-[#8892b0] hover:text-white text-xs font-bold transition-all cursor-pointer"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#003840] to-[#005f6b] hover:from-[#004f5b] hover:to-[#007b8b] text-[#00e5ff] border-2 border-[#00e5ff] text-xs font-black flex items-center space-x-2 cursor-pointer shadow-[0_0_18px_rgba(0,229,255,0.35)] transition-all hover:scale-[1.02]"
            >
              {isEditMode ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{loading ? (isBn ? 'সেভ হচ্ছে...' : 'Saving...') : isBn ? 'পরিবর্তন সেভ করুন' : 'Save Changes'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{loading ? (isBn ? 'যুক্ত হচ্ছে...' : 'Adding...') : isBn ? 'ইমুলেটর যুক্ত করুন' : 'Add Emulator'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
