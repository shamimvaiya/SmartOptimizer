import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  Eye,
  Sliders,
  Layers,
  Save,
  Plus,
  Copy,
  Trash2,
  Check,
  Sparkles,
  Shield,
} from 'lucide-react';
import { GlobalConfig, PresetProfile } from '../types';

interface SettingsOverlayViewProps {
  globalConfig: GlobalConfig;
  activePreset: PresetProfile;
  onSaveHotkey: (hotkey: string) => Promise<void>;
  onToggleAutoHide: (autoHide: boolean) => Promise<void>;
  onUpdateProcessOverride: (processName: string) => Promise<void>;
  onCreatePresetModal: () => void;
  onDuplicatePreset: () => void;
  onDeletePreset: () => void;
}

export const SettingsOverlayView: React.FC<SettingsOverlayViewProps> = ({
  globalConfig,
  activePreset,
  onSaveHotkey,
  onToggleAutoHide,
  onUpdateProcessOverride,
  onCreatePresetModal,
  onDuplicatePreset,
  onDeletePreset,
}) => {
  const [hotkey, setHotkey] = useState<string>(
    activePreset.overlay?.toggleHotkey || globalConfig.defaultHotkey || 'HOME'
  );
  const [isRecordingHotkey, setIsRecordingHotkey] = useState<boolean>(false);
  const [autoHide, setAutoHide] = useState<boolean>(activePreset.overlay?.enableAutoHide ?? true);
  const [processOverride, setProcessOverride] = useState<string>(
    activePreset.emulator?.processName || 'HD-Player.exe'
  );
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    setHotkey(activePreset.overlay?.toggleHotkey || globalConfig.defaultHotkey || 'HOME');
    setAutoHide(activePreset.overlay?.enableAutoHide ?? true);
    setProcessOverride(activePreset.emulator?.processName || 'HD-Player.exe');
  }, [activePreset, globalConfig]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecordingHotkey) return;
    e.preventDefault();
    let key = e.key.toUpperCase();
    if (key === ' ') key = 'SPACE';
    if (key === 'ESCAPE') key = 'ESC';
    setHotkey(key);
    setIsRecordingHotkey(false);
  };

  const handleSaveHotkey = async () => {
    await onSaveHotkey(hotkey);
    showStatus('Hotkey saved successfully!');
  };

  const handleToggleAutoHide = async (checked: boolean) => {
    setAutoHide(checked);
    await onToggleAutoHide(checked);
    showStatus(`Auto-Hide ${checked ? 'enabled' : 'disabled'}.`);
  };

  const handleSaveProcess = async () => {
    await onUpdateProcessOverride(processOverride);
    showStatus('Target Process updated.');
  };

  const showStatus = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Notification Banner */}
      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-[#162b16] border border-[#39ff14] text-[#39ff14] text-xs font-bold flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Interactive Hotkey Recorder Card */}
      <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-[#39ff14]" />
              <span>Interactive Stealth Overlay Hotkey</span>
            </h3>
            <p className="text-xs text-[#8892b0] mt-1">
              Click the box below and press any key on your keyboard to assign your toggle shortcut.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="btn-hotkey-recorder-box"
              onClick={() => setIsRecordingHotkey(true)}
              onKeyDown={handleKeyDown}
              className={`w-36 h-11 rounded-xl font-mono font-black text-sm border-2 transition-all cursor-pointer flex items-center justify-center ${
                isRecordingHotkey
                  ? 'bg-[#182a18] border-[#39ff14] text-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.5)] animate-pulse'
                  : 'bg-[#181824] border-[#39ff14]/70 text-[#39ff14] hover:border-[#39ff14]'
              }`}
              title="Click here and press any key (e.g. HOME, INSERT, F8, F12)"
            >
              {isRecordingHotkey ? 'PRESS ANY KEY...' : `[ ${hotkey} ]`}
            </button>

            <button
              id="btn-save-hotkey"
              onClick={handleSaveHotkey}
              className="h-11 px-4 rounded-xl bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.2)]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay Smart Auto-Hide Card */}
      <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#00e5ff]" />
              <span>Smart Auto-Hide In-Game HUD</span>
            </h3>
            <p className="text-xs text-[#8892b0] mt-1">
              Automatically collapses the HUD after 4 seconds of inactivity; instantly expands on mouse hover.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="checkbox-overlay-autohide"
              type="checkbox"
              checked={autoHide}
              onChange={(e) => handleToggleAutoHide(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-13 h-7 bg-[#252733] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#39ff14]"></div>
          </label>
        </div>
      </div>

      {/* Target Process Override Card */}
      <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#d500f9]" />
            <span>Target Emulator Process Override</span>
          </h3>
          <p className="text-xs text-[#8892b0] mt-1">
            Specify the exact executable binary hooked by the background scheduler (e.g. <code className="text-[#39ff14]">HD-Player.exe</code>, <code className="text-[#00e5ff]">dnplayer.exe</code>, <code className="text-[#d500f9]">Nox.exe</code>).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            id="input-target-process-override"
            type="text"
            value={processOverride}
            onChange={(e) => setProcessOverride(e.target.value)}
            className="flex-1 h-11 px-4 rounded-xl bg-[#181824] text-[#39ff14] font-mono text-sm border border-[#2d2d3d] outline-none focus:border-[#39ff14]"
            placeholder="HD-Player.exe"
          />

          <button
            id="btn-save-process-override"
            onClick={handleSaveProcess}
            className="h-11 px-5 rounded-xl bg-[#1a1e29] hover:bg-[#232938] text-[#00e5ff] border border-[#00e5ff] font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.2)]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Override</span>
          </button>
        </div>
      </div>

      {/* Preset Management Hub */}
      <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#ffd600]" />
            <span>Preset Management Hub &amp; Profiles</span>
          </h3>
          <p className="text-xs text-[#8892b0] mt-1">
            Create, duplicate, or delete custom optimization configuration profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            id="btn-create-profile-settings"
            onClick={onCreatePresetModal}
            className="h-11 px-5 rounded-xl bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.2)]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Profile</span>
          </button>

          <button
            id="btn-duplicate-profile-settings"
            onClick={onDuplicatePreset}
            className="h-11 px-5 rounded-xl bg-[#1a1e29] hover:bg-[#232938] text-[#00e5ff] border border-[#00e5ff] font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.2)]"
          >
            <Copy className="w-4 h-4" />
            <span>📋 Duplicate Active</span>
          </button>

          <button
            id="btn-delete-profile-settings"
            onClick={onDeletePreset}
            className="h-11 px-5 rounded-xl bg-[#2a1616] hover:bg-[#3d1a1a] text-[#ff4444] border border-[#ff4444] font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_10px_rgba(255,68,68,0.2)]"
          >
            <Trash2 className="w-4 h-4" />
            <span>🗑 Delete Active</span>
          </button>
        </div>
      </div>
    </div>
  );
};
