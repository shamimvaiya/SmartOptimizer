import React, { useState, useEffect, useRef } from 'react';
import {
  Keyboard,
  Eye,
  Save,
  Check,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  Crosshair,
  FileKey,
  Layers,
  Sparkles,
  Sliders,
  Cpu,
  Monitor,
  Activity,
  Plus,
  Copy,
  Edit2,
  PackageCheck,
  FolderArchive,
  Info,
} from 'lucide-react';
import { GlobalConfig, PresetProfile, CrosshairConfig } from '../types';
import { Language } from '../i18n/translations';

interface SettingsOverlayViewProps {
  globalConfig: GlobalConfig;
  activePreset: PresetProfile | null;
  crosshairConfig?: CrosshairConfig;
  onSaveHotkey: (hotkey: string) => Promise<void>;
  onSaveCrosshairHotkey?: (hotkey: string) => void;
  onToggleAutoHide: (autoHide: boolean) => Promise<void>;
  onSavePreset?: (preset: PresetProfile) => Promise<void>;
  onExportCurrentProfile?: () => void;
  onExportAllProfiles?: () => void;
  onImportSEOFile?: (file: File) => void;
  onHardResetApp?: () => void;
  onUpdateProcessOverride?: (proc: string) => void;
  onCreatePresetModal?: () => void;
  onDuplicatePreset?: () => void;
  onDeletePreset?: (name: string) => void;
  onUpdateGlobalConfig?: (partial: Partial<GlobalConfig>) => Promise<void>;
  lang?: Language;
}

export const SettingsOverlayView: React.FC<SettingsOverlayViewProps> = ({
  globalConfig,
  activePreset,
  crosshairConfig,
  onSaveHotkey,
  onSaveCrosshairHotkey,
  onToggleAutoHide,
  onSavePreset,
  onExportCurrentProfile,
  onExportAllProfiles,
  onImportSEOFile,
  onHardResetApp,
  onCreatePresetModal,
  onDuplicatePreset,
  onDeletePreset,
  lang = 'bn',
}) => {
  const isBn = lang === 'bn';

  // Hotkey 1: Stealth HUD Overlay
  const [hudHotkey, setHudHotkey] = useState<string>(
    activePreset?.overlay?.toggleHotkey || globalConfig.defaultHotkey || 'HOME'
  );
  const [isRecordingHud, setIsRecordingHud] = useState<boolean>(false);

  // Hotkey 2: Crosshair Toggle
  const [crosshairHotkey, setCrosshairHotkey] = useState<string>(
    crosshairConfig?.toggleHotkey || 'INSERT'
  );
  const [isRecordingCrosshair, setIsRecordingCrosshair] = useState<boolean>(false);

  // Auto Hide
  const [autoHide, setAutoHide] = useState<boolean>(activePreset?.overlay?.enableAutoHide ?? true);

  // Active Profile Editing States
  const [profileName, setProfileName] = useState<string>('');
  const [profileGame, setProfileGame] = useState<string>('');
  const [profileFps, setProfileFps] = useState<number>(144);
  const [profileDpi, setProfileDpi] = useState<number>(320);
  const [profilePriority, setProfilePriority] = useState<string>('High');
  const [profileDesc, setProfileDesc] = useState<string>('');

  // Status message
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Hard Reset 3-Step Modal State
  const [resetModalStep, setResetModalStep] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHudHotkey(activePreset?.overlay?.toggleHotkey || globalConfig.defaultHotkey || 'HOME');
    setAutoHide(activePreset?.overlay?.enableAutoHide ?? true);
    if (crosshairConfig?.toggleHotkey) {
      setCrosshairHotkey(crosshairConfig.toggleHotkey);
    }
    if (activePreset) {
      setProfileName(activePreset.name || '');
      setProfileGame(activePreset.targetGame || '');
      setProfileFps(activePreset.performance?.targetFps || 144);
      setProfileDpi(activePreset.display?.dpi || 320);
      setProfilePriority(activePreset.emulator?.priorityClass || 'Normal');
      setProfileDesc(activePreset.description || '');
    }
  }, [activePreset, globalConfig, crosshairConfig]);

  const showStatus = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3500);
  };

  // Recording listeners
  const handleKeyDownHud = (e: React.KeyboardEvent) => {
    if (!isRecordingHud) return;
    e.preventDefault();
    e.stopPropagation();

    let key = e.key.toUpperCase();
    if (key === ' ') key = 'SPACE';
    if (key === 'ESCAPE') key = 'ESC';
    if (key === 'CONTROL') key = 'CTRL';
    if (key === 'ALT') key = 'ALT';
    if (key === 'SHIFT') key = 'SHIFT';

    setHudHotkey(key);
    setIsRecordingHud(false);
  };

  const handleKeyDownCrosshair = (e: React.KeyboardEvent) => {
    if (!isRecordingCrosshair) return;
    e.preventDefault();
    e.stopPropagation();

    let key = e.key.toUpperCase();
    if (key === ' ') key = 'SPACE';
    if (key === 'ESCAPE') key = 'ESC';
    if (key === 'CONTROL') key = 'CTRL';
    if (key === 'ALT') key = 'ALT';
    if (key === 'SHIFT') key = 'SHIFT';

    setCrosshairHotkey(key);
    setIsRecordingCrosshair(false);
  };

  const handleSaveHudHotkey = async () => {
    await onSaveHotkey(hudHotkey);
    showStatus(isBn ? '✅ স্টিলথ HUD হট-কি সফলভাবে সেভ হয়েছে!' : '✅ Stealth HUD Hotkey saved!');
  };

  const handleSaveCrosshairHotkey = () => {
    if (onSaveCrosshairHotkey) {
      onSaveCrosshairHotkey(crosshairHotkey);
    } else if (crosshairConfig) {
      const updated = { ...crosshairConfig, toggleHotkey: crosshairHotkey };
      try {
        localStorage.setItem('aimopt_crosshair_config', JSON.stringify(updated));
      } catch (e) {}
    }
    showStatus(isBn ? '✅ ক্রসহায়্যার টগল হট-কি সফলভাবে সেভ হয়েছে!' : '✅ Crosshair Toggle Hotkey saved!');
  };

  const handleToggleAutoHide = async (checked: boolean) => {
    setAutoHide(checked);
    await onToggleAutoHide(checked);
    showStatus(isBn ? `অটো-হাইড ${checked ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।` : `Auto-Hide ${checked ? 'enabled' : 'disabled'}.`);
  };

  const handleSaveProfileEdits = async () => {
    if (!activePreset || !onSavePreset) return;
    const updated: PresetProfile = {
      ...activePreset,
      name: profileName.trim() || activePreset.name,
      targetGame: profileGame.trim(),
      description: profileDesc.trim(),
      performance: {
        ...activePreset.performance,
        targetFps: Number(profileFps) || 144,
      },
      display: {
        ...activePreset.display,
        dpi: Number(profileDpi) || 320,
      },
      emulator: {
        ...activePreset.emulator,
        priorityClass: profilePriority as any,
      },
    };
    await onSavePreset(updated);
    showStatus(isBn ? `✅ প্রোফাইল '${updated.name}' সফলভাবে আপডেট হয়েছে!` : `✅ Profile '${updated.name}' updated!`);
  };

  // SEO Import file handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportSEOFile) {
      onImportSEOFile(file);
      showStatus(isBn ? '✅ .SEO ফাইল থেকে সফলভাবে ব্যাকআপ ডাটা রিস্টোর করা হয়েছে!' : '✅ Data restored from .SEO backup file!');
    }
    // reset input
    if (e.target) e.target.value = '';
  };

  // Hard Reset Execution
  const handleExecuteHardReset = () => {
    setResetModalStep(0);
    if (onHardResetApp) {
      onHardResetApp();
    } else {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4 pb-10 max-w-5xl mx-auto select-none">
      {/* Toast Notification Banner */}
      {saveStatus && (
        <div className="p-3 rounded-xl bg-[#142817] border border-[#39ff14] text-[#39ff14] text-xs font-bold flex items-center space-x-2 animate-in fade-in shadow-[0_0_20px_rgba(57,255,20,0.3)]">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: COMPACT HOTKEYS GRID (HUD + CROSSHAIR) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Hotkey 1: Stealth HUD */}
        <div className="bg-[#11121a] rounded-xl p-4 border border-[#202232] shadow-lg flex flex-col justify-between hover:border-[#39ff14]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#39ff14]/10 border border-[#39ff14]/40 flex items-center justify-center text-[#39ff14]">
                <Keyboard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {isBn ? '১. স্টিলথ HUD হট-কি' : '1. Stealth HUD Hotkey'}
                </h4>
                <p className="text-[10px] text-[#8892b0]">
                  {isBn ? 'ইনপুট বক্সে ডাবল-ক্লিক করে কি চাপুন' : 'Double-click box to record key'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#39ff14] bg-[#162616] px-2 py-0.5 rounded-md border border-[#39ff14]/30">
              HUD
            </span>
          </div>

          <div className="flex items-center space-x-2 mt-1">
            <div
              id="box-hud-hotkey-input"
              tabIndex={0}
              onDoubleClick={() => setIsRecordingHud(true)}
              onKeyDown={handleKeyDownHud}
              onBlur={() => {
                if (isRecordingHud) {
                  setHudHotkey('NONE');
                  setIsRecordingHud(false);
                }
              }}
              className={`flex-1 h-9 px-3 rounded-lg font-mono font-black text-xs border transition-all cursor-pointer flex items-center justify-between outline-none ${
                isRecordingHud
                  ? 'bg-[#182a18] border-[#39ff14] text-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.4)] animate-pulse'
                  : 'bg-[#151624] border-[#292c3e] text-white hover:border-[#39ff14]/70'
              }`}
            >
              <span className="truncate">
                {isRecordingHud ? '>>> PRESS KEY <<<' : `[ ${hudHotkey} ]`}
              </span>
              <span className="text-[9px] font-sans font-bold text-[#64748b] uppercase">
                {isRecordingHud ? 'REC' : '2x Click'}
              </span>
            </div>

            <button
              id="btn-save-hud-hotkey"
              type="button"
              onClick={handleSaveHudHotkey}
              className="h-9 px-3.5 rounded-lg bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.2)] hover:scale-105"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isBn ? 'সেভ' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Hotkey 2: Crosshair Toggle */}
        <div className="bg-[#11121a] rounded-xl p-4 border border-[#202232] shadow-lg flex flex-col justify-between hover:border-[#00e5ff]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff]">
                <Crosshair className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {isBn ? '২. ক্রসহায়্যার টগল হট-কি' : '2. Crosshair Toggle Hotkey'}
                </h4>
                <p className="text-[10px] text-[#8892b0]">
                  {isBn ? 'ইনপুট বক্সে ডাবল-ক্লিক করে শর্টকাট কি দিন' : 'Double-click to change hotkey'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#00e5ff] bg-[#12242a] px-2 py-0.5 rounded-md border border-[#00e5ff]/30">
              CROSSHAIR
            </span>
          </div>

          <div className="flex items-center space-x-2 mt-1">
            <div
              id="box-crosshair-hotkey-input"
              tabIndex={0}
              onDoubleClick={() => setIsRecordingCrosshair(true)}
              onKeyDown={handleKeyDownCrosshair}
              onBlur={() => {
                if (isRecordingCrosshair) {
                  setCrosshairHotkey('NONE');
                  setIsRecordingCrosshair(false);
                }
              }}
              className={`flex-1 h-9 px-3 rounded-lg font-mono font-black text-xs border transition-all cursor-pointer flex items-center justify-between outline-none ${
                isRecordingCrosshair
                  ? 'bg-[#12252a] border-[#00e5ff] text-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)] animate-pulse'
                  : 'bg-[#151624] border-[#292c3e] text-white hover:border-[#00e5ff]/70'
              }`}
            >
              <span className="truncate">
                {isRecordingCrosshair ? '>>> PRESS KEY <<<' : `[ ${crosshairHotkey} ]`}
              </span>
              <span className="text-[9px] font-sans font-bold text-[#64748b] uppercase">
                {isRecordingCrosshair ? 'REC' : '2x Click'}
              </span>
            </div>

            <button
              id="btn-save-crosshair-hotkey"
              type="button"
              onClick={handleSaveCrosshairHotkey}
              className="h-9 px-3.5 rounded-lg bg-[#12252a] hover:bg-[#19373e] text-[#00e5ff] border border-[#00e5ff] font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:scale-105"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isBn ? 'সেভ' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: ACTIVE PROFILE MASTER HUB & EDITOR */}
      {/* ========================================================================= */}
      <div className="bg-[#11121a] rounded-xl p-4 border border-[#202232] shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c1e2c] pb-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ffd600]/10 border border-[#ffd600]/40 flex items-center justify-center text-[#ffd600]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>{isBn ? 'বর্তমান প্রোফাইল কনফিগারেশন ও ডাটা হাব' : 'Active Profile Configuration & Scope'}</span>
                {activePreset && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#39ff14]/15 text-[#39ff14] border border-[#39ff14]/40 font-bold">
                    {activePreset.name}
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-[#8892b0]">
                {isBn
                  ? 'এই প্রোফাইলের অধীনে সমস্ত ম্যাক্রো, স্ক্রিপ্ট, ক্যালিব্রেশন, ডিপিআই ও রেজোলিউশন সংরক্ষিত থাকে।'
                  : 'All macros, scripts, calibration coordinates, DPI, and tweaks are tied to this profile.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onCreatePresetModal && (
              <button
                type="button"
                onClick={onCreatePresetModal}
                className="h-8 px-2.5 rounded-lg bg-[#182618] hover:bg-[#203620] text-[#39ff14] border border-[#39ff14]/50 font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-all"
                title="Create New Profile"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isBn ? 'নতুন' : 'New'}</span>
              </button>
            )}

            {onDuplicatePreset && activePreset && (
              <button
                type="button"
                onClick={onDuplicatePreset}
                className="h-8 px-2.5 rounded-lg bg-[#15222b] hover:bg-[#1d313e] text-[#00e5ff] border border-[#00e5ff]/50 font-bold text-[11px] flex items-center space-x-1 cursor-pointer transition-all"
                title="Duplicate Active Profile"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isBn ? 'ক্লোন' : 'Clone'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Inline Editor Fields */}
        {activePreset ? (
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* Profile Name */}
              <div>
                <label className="text-[10px] font-bold text-[#8892b0] uppercase block mb-1">
                  {isBn ? 'প্রোফাইলের নাম' : 'Profile Name'}
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#161725] text-white font-bold text-xs border border-[#292c3f] outline-none focus:border-[#39ff14]"
                />
              </div>

              {/* Target Game */}
              <div>
                <label className="text-[10px] font-bold text-[#8892b0] uppercase block mb-1">
                  {isBn ? 'টার্গেট গেম' : 'Target Game'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free Fire / PUBG"
                  value={profileGame}
                  onChange={(e) => setProfileGame(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#161725] text-[#00e5ff] font-bold text-xs border border-[#292c3f] outline-none focus:border-[#00e5ff]"
                />
              </div>

              {/* Target FPS */}
              <div>
                <label className="text-[10px] font-bold text-[#8892b0] uppercase block mb-1">
                  {isBn ? 'টার্গেট FPS' : 'Target FPS'}
                </label>
                <input
                  type="number"
                  value={profileFps}
                  onChange={(e) => setProfileFps(parseInt(e.target.value) || 144)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#161725] text-[#39ff14] font-mono font-bold text-xs border border-[#292c3f] outline-none focus:border-[#39ff14]"
                />
              </div>

              {/* WM DPI */}
              <div>
                <label className="text-[10px] font-bold text-[#8892b0] uppercase block mb-1">
                  {isBn ? 'DPI ডেনসিটি' : 'Display DPI'}
                </label>
                <input
                  type="number"
                  value={profileDpi}
                  onChange={(e) => setProfileDpi(parseInt(e.target.value) || 320)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[#161725] text-[#ffd600] font-mono font-bold text-xs border border-[#292c3f] outline-none focus:border-[#ffd600]"
                />
              </div>
            </div>

            {/* Profile Description & Save Button */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <input
                type="text"
                placeholder={isBn ? 'প্রোফাইল নোট বা ডেসক্রিপশন...' : 'Profile notes or optimization summary...'}
                value={profileDesc}
                onChange={(e) => setProfileDesc(e.target.value)}
                className="flex-1 w-full h-8 px-2.5 rounded-lg bg-[#161725] text-[#cbd5e1] text-xs border border-[#292c3f] outline-none focus:border-[#39ff14]"
              />

              <button
                type="button"
                onClick={handleSaveProfileEdits}
                className="w-full sm:w-auto h-8 px-4 rounded-lg bg-[#162b16] hover:bg-[#1f3d1f] text-[#39ff14] border border-[#39ff14] font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.2)]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isBn ? 'প্রোফাইল সেটিংস সেভ করুন' : 'Save Profile'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#8892b0] py-2">
            {isBn ? 'কোনো প্রোফাইল সিলেক্ট করা নেই।' : 'No active profile selected.'}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: SMART AUTO-HIDE & GENERAL SETTINGS (COMPACT) */}
      {/* ========================================================================= */}
      <div className="bg-[#11121a] rounded-xl p-4 border border-[#202232] shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#d500f9]/10 border border-[#d500f9]/40 flex items-center justify-center text-[#d500f9]">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              {isBn ? 'স্মার্ট অটো-হাইড ইন-গেম HUD (Smart Auto-Hide)' : 'Smart Auto-Hide In-Game HUD'}
            </h4>
            <p className="text-[10px] text-[#8892b0]">
              {isBn
                ? '৪ সেকেন্ড নিষ্ক্রিয় থাকলে HUD সংকুচিত হবে এবং মাউস রাখলে প্রসারিত হবে।'
                : 'Auto-collapses HUD after 4 seconds idle and restores on hover.'}
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="checkbox-overlay-autohide"
            type="checkbox"
            checked={autoHide}
            onChange={(e) => handleToggleAutoHide(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-[#252733] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#39ff14]"></div>
        </label>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: COMPLETE BACKUP ENGINE (.SEO EXPORT 2 OPTIONS & IMPORT) */}
      {/* ========================================================================= */}
      <div className="bg-[#11121a] rounded-xl p-4 border border-[#202232] shadow-lg space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ffd600]/10 border border-[#ffd600]/40 flex items-center justify-center text-[#ffd600]">
            <FileKey className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>{isBn ? 'ডাটা ব্যাকআপ ও এক্সপোর্ট হাব (.SEO Encrypted Backup)' : 'Data Backup & Export Hub (.SEO)'}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#ffd600]/20 text-[#ffd600] border border-[#ffd600]/30 font-bold">
                PORTABLE
              </span>
            </h4>
            <p className="text-[10px] text-[#8892b0]">
              {isBn
                ? 'সিঙ্গেল প্রোফাইল অথবা পুরো সিস্টেমের সমস্ত প্রিসেট ও ম্যাক্রো ডাটা এক্সপোর্ট বা রিস্টোর করুন।'
                : 'Export either the active profile or a full system snapshot with all profiles & custom macros.'}
            </p>
          </div>
        </div>

        {/* Dual Export Buttons + Single Import Button */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* 1. Export Active Profile */}
          <button
            id="btn-export-current-profile-seo"
            type="button"
            onClick={onExportCurrentProfile}
            className="h-10 px-3 rounded-lg bg-[#182329] hover:bg-[#20313a] text-[#00e5ff] border border-[#00e5ff]/60 font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.15)] hover:scale-[1.02]"
            title={isBn ? 'শুধুমাত্র বর্তমান সিলেক্টেড প্রোফাইলের সমস্ত ডাটা এক্সপোর্ট করুন' : 'Export only active profile'}
          >
            <PackageCheck className="w-4 h-4 shrink-0" />
            <div className="text-left truncate">
              <div className="truncate font-black">{isBn ? 'নির্দিষ্ট প্রোফাইল এক্সপোর্ট' : 'Export Current Profile'}</div>
              <div className="text-[9px] text-[#00e5ff]/70">{activePreset?.name || 'Active'} (.SEO)</div>
            </div>
          </button>

          {/* 2. Export All Profiles & Full System */}
          <button
            id="btn-export-all-profiles-seo"
            type="button"
            onClick={onExportAllProfiles}
            className="h-10 px-3 rounded-lg bg-[#252016] hover:bg-[#342c1c] text-[#ffd600] border border-[#ffd600]/60 font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(255,214,0,0.15)] hover:scale-[1.02]"
            title={isBn ? 'সফ্টওয়্যারের সমস্ত প্রোফাইল ও ম্যাক্রো একসাথে একটি ফাইলে এক্সপোর্ট করুন' : 'Export all profiles and global dataset'}
          >
            <FolderArchive className="w-4 h-4 shrink-0" />
            <div className="text-left truncate">
              <div className="truncate font-black">{isBn ? 'সমস্ত প্রোফাইল এক্সপোর্ট' : 'Export All Profiles'}</div>
              <div className="text-[9px] text-[#ffd600]/70">{isBn ? 'ফুল সিস্টেম ব্যাকআপ' : 'Full Backup (.SEO)'}</div>
            </div>
          </button>

          {/* 3. Universal Import / Restore (.SEO) */}
          <button
            id="btn-import-seo-file"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 px-3 rounded-lg bg-[#172618] hover:bg-[#203621] text-[#39ff14] border border-[#39ff14]/60 font-bold text-[11px] flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.15)] hover:scale-[1.02]"
            title={isBn ? 'সিঙ্গেল বা মাল্টি-প্রোফাইল ব্যাকআপ ফাইল নির্বাচন করে ডাটা ফিরিয়ে আনুন' : 'Restore data from .SEO file'}
          >
            <Upload className="w-4 h-4 shrink-0" />
            <div className="text-left truncate">
              <div className="truncate font-black">{isBn ? 'ব্যাকআপ ফাইল রিস্টোর' : 'Import / Restore Data'}</div>
              <div className="text-[9px] text-[#39ff14]/70">.SEO / JSON</div>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".seo,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: FACTORY HARD RESET (COMPACT 3-STEP TRIGGER) */}
      {/* ========================================================================= */}
      <div className="bg-[#181114] rounded-xl p-3.5 border border-[#ff4444]/40 shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#ff4444]/15 border border-[#ff4444]/40 flex items-center justify-center text-[#ff4444]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#ff6666]">
              {isBn ? 'ফ্যাক্টরি হার্ড রিসেট (Data Wipe)' : 'Factory Hard Reset & Wipe'}
            </h4>
            <p className="text-[10px] text-[#8892b0]">
              {isBn ? 'সমস্ত কনফিগারেশন মুছে সফটওয়্যারকে ফ্রেশ অবস্থায় নিয়ে যায়।' : 'Wipes all local and storage datasets back to clean state.'}
            </p>
          </div>
        </div>

        <button
          id="btn-initiate-hard-reset"
          type="button"
          onClick={() => setResetModalStep(1)}
          className="h-8 px-3.5 rounded-lg bg-[#291416] hover:bg-[#3d181c] text-[#ff4444] border border-[#ff4444] font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer shadow-[0_0_8px_rgba(255,68,68,0.2)]"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{isBn ? 'রিসেট' : 'Reset'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3-STEP HARD RESET CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {resetModalStep > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#0e0a0c] border-2 border-[#ff4444] shadow-[0_0_50px_rgba(255,68,68,0.4)] overflow-hidden text-white">
            <div className="p-3.5 bg-[#260e10] border-b border-[#ff4444]/40 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#ff4444]">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider">
                  HARD RESET WARNING - STEP {resetModalStep} OF 3
                </span>
              </div>
              <button
                onClick={() => setResetModalStep(0)}
                className="text-xs font-bold text-[#8892b0] hover:text-white"
              >
                বাতিল
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              {resetModalStep === 1 && (
                <>
                  <div className="p-3 rounded-xl bg-[#381214] border border-[#ff4444]/40 text-xs text-[#ff8888]">
                    <strong>ধাপ ১ সতর্কতা:</strong> আপনার তৈরি করা সমস্ত ম্যাক্রো, ক্রসহায়্যার এবং প্রোফাইল মুছে যাবে। আপনি কি এগিয়ে যেতে চান?
                  </div>
                  <div className="flex justify-end space-x-2.5 pt-1">
                    <button
                      onClick={() => setResetModalStep(0)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#1b1c28] text-xs font-bold text-white hover:bg-[#25283a]"
                    >
                      না, ফিরে যান
                    </button>
                    <button
                      onClick={() => setResetModalStep(2)}
                      className="px-4 py-1.5 rounded-lg bg-[#ff4444] text-black font-black text-xs hover:bg-[#ff6666]"
                    >
                      হ্যাঁ, ধাপ ২-এ যান &rarr;
                    </button>
                  </div>
                </>
              )}

              {resetModalStep === 2 && (
                <>
                  <div className="p-3 rounded-xl bg-[#381214] border border-[#ff4444]/40 text-xs text-[#ff8888]">
                    <strong>ধাপ ২ চ্যালেন্জ:</strong> ডিলিট হওয়া ডাটা কোনভাবেই ফেরত পাওয়া যাবে না! ব্যাকআপ না নিয়ে থাকলে আগে <strong>.SEO</strong> এক্সপোর্ট করুন।
                  </div>
                  <div className="flex justify-end space-x-2.5 pt-1">
                    <button
                      onClick={() => setResetModalStep(0)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#1b1c28] text-xs font-bold text-white hover:bg-[#25283a]"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={() => setResetModalStep(3)}
                      className="px-4 py-1.5 rounded-lg bg-[#ff4444] text-black font-black text-xs hover:bg-[#ff6666]"
                    >
                      ধাপ ৩ (চূড়ান্ত) &rarr;
                    </button>
                  </div>
                </>
              )}

              {resetModalStep === 3 && (
                <>
                  <div className="p-3 rounded-xl bg-[#4a0d10] border-2 border-[#ff4444] text-xs text-white shadow-[0_0_15px_rgba(255,68,68,0.3)]">
                    <strong className="text-[#ff4444] block text-sm mb-1">⚠ শেষ সুযোগ!</strong>
                    ক্লিক করলেই সমস্ত কাস্টম কনফিগারেশন মুছে যাবে এবং সফটওয়্যার রিসেট হবে।
                  </div>
                  <div className="flex justify-end space-x-2.5 pt-1">
                    <button
                      onClick={() => setResetModalStep(0)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#1b1c28] text-xs font-bold text-white hover:bg-[#25283a]"
                    >
                      বাতিল
                    </button>
                    <button
                      id="btn-confirm-final-hard-reset"
                      onClick={handleExecuteHardReset}
                      className="px-5 py-2 rounded-lg bg-[#ff0000] text-white font-black text-xs hover:bg-[#cc0000] shadow-[0_0_20px_rgba(255,0,0,0.6)] animate-pulse"
                    >
                      🔥 চূড়ান্ত রিসেট সম্পন্ন করুন
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
