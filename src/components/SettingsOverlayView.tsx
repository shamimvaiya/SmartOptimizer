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
  HelpCircle,
  Crosshair,
  Lock,
  FileKey,
  Flame,
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
  onExportSEOFile?: () => void;
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
  onExportSEOFile,
  onImportSEOFile,
  onHardResetApp,
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

  // SEO Import file handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportSEOFile) {
      onImportSEOFile(file);
      showStatus(isBn ? '✅ .SEO ফাইল থেকে সফলভাবে সমস্ত ডাটা রিস্টোর করা হয়েছে!' : '✅ Data restored from .SEO backup file!');
    }
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
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Toast Banner */}
      {saveStatus && (
        <div className="p-4 rounded-xl bg-[#162b16] border border-[#39ff14] text-[#39ff14] text-xs font-bold flex items-center space-x-2 animate-bounce shadow-lg">
          <Check className="w-4 h-4" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* SECTION 1: HOTKEY 1 - STEALTH HUD OVERLAY */}
      <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-[#39ff14]" />
              <span>১. স্টিলথ HUD ওভারলে হট-কি (Stealth HUD Toggle Hotkey)</span>
            </h3>
            <p className="text-xs text-[#8892b0] mt-1">
              ইন-গেম স্টিলথ HUD ওভারলে অন/অফ করার মূল হট-কি। ইনপুট বক্সে <strong className="text-[#39ff14]">ডাবল-ক্লিক (Double-Click)</strong> করে নতুন কি সিলেক্ট করুন।
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0f17] border border-[#222436] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto flex-1 space-y-1.5">
            <label className="text-[11px] font-bold text-[#8892b0] uppercase tracking-wider flex items-center gap-1.5">
              <span>HUD Hotkey (Double-Click to Record):</span>
              {isRecordingHud && (
                <span className="text-[#39ff14] text-[10px] animate-pulse">● কীবোর্ড কি প্রেসের জন্য অপেক্ষা করছে...</span>
              )}
            </label>

            <div
              id="box-hud-hotkey-input"
              tabIndex={0}
              onDoubleClick={() => setIsRecordingHud(true)}
              onKeyDown={handleKeyDownHud}
              onBlur={() => setIsRecordingHud(false)}
              className={`w-full md:w-72 h-12 px-4 rounded-xl font-mono font-black text-base border-2 transition-all cursor-pointer select-none flex items-center justify-between outline-none ${
                isRecordingHud
                  ? 'bg-[#182a18] border-[#39ff14] text-[#39ff14] shadow-[0_0_20px_rgba(57,255,20,0.4)] animate-pulse'
                  : 'bg-[#141522] border-[#2f3248] text-white hover:border-[#39ff14]/70'
              }`}
            >
              <span className="truncate">
                {isRecordingHud ? '>>> PRESS ANY KEY <<<' : `[ ${hudHotkey} ]`}
              </span>
              <span className="text-[10px] font-sans font-bold text-[#64748b] uppercase">
                {isRecordingHud ? 'LISTENING' : '2x Click'}
              </span>
            </div>
          </div>

          <button
            id="btn-save-hud-hotkey"
            type="button"
            onClick={handleSaveHudHotkey}
            className="h-11 px-6 rounded-xl bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] font-black text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(57,255,20,0.25)] hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>{isBn ? 'HUD হট-কি সেভ করুন' : 'Save HUD Hotkey'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: HOTKEY 2 - CROSSHAIR TOGGLE */}
      <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-[#00e5ff]" />
              <span>২. ক্রসহায়্যার টগল হট-কি (Crosshair Overlay Toggle Hotkey)</span>
            </h3>
            <p className="text-xs text-[#8892b0] mt-1">
              স্ক্রিনের ওপর কাস্টম সাইবার ক্রসহায়্যার তাৎক্ষণিক হাইড বা শো করার আলাদা শর্টকাট কি। ইনপুট বক্সে <strong className="text-[#00e5ff]">ডাবল-ক্লিক</strong> করুন।
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0f17] border border-[#222436] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-auto flex-1 space-y-1.5">
            <label className="text-[11px] font-bold text-[#8892b0] uppercase tracking-wider flex items-center gap-1.5">
              <span>Crosshair Hotkey (Double-Click to Record):</span>
              {isRecordingCrosshair && (
                <span className="text-[#00e5ff] text-[10px] animate-pulse">● কীবোর্ড কি প্রেসের জন্য অপেক্ষা করছে...</span>
              )}
            </label>

            <div
              id="box-crosshair-hotkey-input"
              tabIndex={0}
              onDoubleClick={() => setIsRecordingCrosshair(true)}
              onKeyDown={handleKeyDownCrosshair}
              onBlur={() => setIsRecordingCrosshair(false)}
              className={`w-full md:w-72 h-12 px-4 rounded-xl font-mono font-black text-base border-2 transition-all cursor-pointer select-none flex items-center justify-between outline-none ${
                isRecordingCrosshair
                  ? 'bg-[#12252a] border-[#00e5ff] text-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.4)] animate-pulse'
                  : 'bg-[#141522] border-[#2f3248] text-white hover:border-[#00e5ff]/70'
              }`}
            >
              <span className="truncate">
                {isRecordingCrosshair ? '>>> PRESS ANY KEY <<<' : `[ ${crosshairHotkey} ]`}
              </span>
              <span className="text-[10px] font-sans font-bold text-[#64748b] uppercase">
                {isRecordingCrosshair ? 'LISTENING' : '2x Click'}
              </span>
            </div>
          </div>

          <button
            id="btn-save-crosshair-hotkey"
            type="button"
            onClick={handleSaveCrosshairHotkey}
            className="h-11 px-6 rounded-xl bg-[#12252a] hover:bg-[#19373e] text-[#00e5ff] border border-[#00e5ff] font-black text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.25)] hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>{isBn ? 'ক্রসহায়্যার হট-কি সেভ করুন' : 'Save Crosshair Hotkey'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: SMART AUTO-HIDE HUD */}
      <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#d500f9]" />
              <span>স্মার্ট অটো-হাইড ইন-গেম HUD (Smart Auto-Hide)</span>
            </h3>
            <p className="text-xs text-[#8892b0] mt-1">
              ৪ সেকেন্ড নিষ্ক্রিয় থাকলে HUD স্বয়ংক্রিয়ভাবে সংকুচিত হবে এবং মাউস নিলে তৎক্ষণাৎ প্রসারিত হবে।
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

      {/* SECTION 4: FULL DATA BACKUP (.SEO ENCRYPTED FILE EXPORT & IMPORT) */}
      <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileKey className="w-5 h-5 text-[#ffd600]" />
            <span>সম্পূর্ণ সিস্টেম ডাটা এক্সপোর্ট ও ইম্পোর্ট (.SEO Encrypted Backup)</span>
          </h3>
          <p className="text-xs text-[#8892b0] mt-1">
            সমস্ত প্রিসেট প্রোফাইল, কাস্টম ক্রসহায়্যার ডিজাইন, ম্যাক্রো সিকোয়েন্স এবং গ্লোবাল সেটিংস একটি সিঙ্গল সিকিউর <code className="text-[#ffd600]">.SEO</code> (Smart Emulator Optimizer) ব্যাকআপ ফাইলেই রোপণ করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Export SEO Button */}
          <button
            id="btn-export-seo-file"
            onClick={onExportSEOFile}
            className="h-11 px-5 rounded-xl bg-[#292212] hover:bg-[#382e18] text-[#ffd600] border border-[#ffd600] font-black text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,214,0,0.2)] hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>{isBn ? 'ব্যাকআপ ফাইল এক্সপোর্ট (.SEO)' : 'Export Full Data (.SEO)'}</span>
          </button>

          {/* Import SEO Button */}
          <button
            id="btn-import-seo-file"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 px-5 rounded-xl bg-[#1a1e29] hover:bg-[#232938] text-[#00e5ff] border border-[#00e5ff] font-black text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.2)] hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            <span>{isBn ? 'ব্যাকআপ ফাইল রিস্টোর (.SEO)' : 'Import / Restore Data (.SEO)'}</span>
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

      {/* SECTION 5: HARD RESET (3-STEP WARNING SYSTEM) */}
      <div className="bg-[#1a1114] rounded-2xl p-6 border border-[#ff4444]/40 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#ff4444] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#ff4444]" />
            <span>হার্ড রিসেট ও ডাটা ওয়াইপ (Factory Hard Reset)</span>
          </h3>
          <p className="text-xs text-[#8892b0] mt-1">
            সমস্ত কাস্টমাইজড প্রিসেট, মেমরি ক্যাশ, সেভ করা ম্যাক্রো ও ক্রসহায়্যার মুছে ফেলে সম্পূর্ণ ফ্রেশ প্রিস্টিন অবস্থায় ফিরুন।
          </p>
        </div>

        <div>
          <button
            id="btn-initiate-hard-reset"
            onClick={() => setResetModalStep(1)}
            className="h-11 px-5 rounded-xl bg-[#2a1616] hover:bg-[#3d1a1a] text-[#ff4444] border border-[#ff4444] font-black text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,68,68,0.25)] hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isBn ? '⚠ ফ্যাক্টরি রিসেট শুরু করুন' : 'Initiate Hard Reset'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3-STEP HARD RESET CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {resetModalStep > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-[#0e0a0c] border-2 border-[#ff4444] shadow-[0_0_50px_rgba(255,68,68,0.4)] overflow-hidden text-white">
            {/* Modal Header */}
            <div className="p-4 bg-[#260e10] border-b border-[#ff4444]/40 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#ff4444]">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider">
                  HARD RESET WARNING - STEP {resetModalStep} OF 3
                </span>
              </div>
              <button
                onClick={() => setResetModalStep(0)}
                className="text-xs font-bold text-[#8892b0] hover:text-white"
              >
                বাতিল (Cancel)
              </button>
            </div>

            {/* Modal Content depending on step */}
            <div className="p-6 space-y-4">
              {resetModalStep === 1 && (
                <>
                  <div className="p-3 rounded-xl bg-[#381214] border border-[#ff4444]/40 text-xs text-[#ff8888]">
                    <strong>ধাপ ১ সতর্কতা:</strong> হার্ড রিসেট দিলে আপনার তৈরি করা সমস্ত ম্যাক্রো, কাস্টম ক্রসহায়্যার এবং প্রিসেট মুছে যাবে। আপনি কি এগিয়ে যেতে চান?
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => setResetModalStep(0)}
                      className="px-4 py-2 rounded-xl bg-[#1b1c28] text-xs font-bold text-white hover:bg-[#25283a]"
                    >
                      না, ফিরে যান
                    </button>
                    <button
                      onClick={() => setResetModalStep(2)}
                      className="px-5 py-2 rounded-xl bg-[#ff4444] text-black font-black text-xs hover:bg-[#ff6666]"
                    >
                      হ্যাঁ, ধাপ ২-এ যান &rarr;
                    </button>
                  </div>
                </>
              )}

              {resetModalStep === 2 && (
                <>
                  <div className="p-3 rounded-xl bg-[#381214] border border-[#ff4444]/40 text-xs text-[#ff8888]">
                    <strong>ধাপ ২ চ্যালেন্জ:</strong> ডিলিট হওয়া ডাটা কোনভাবেই উদ্ধার করা সম্ভব নয়! ব্যাকআপ না নিয়ে থাকলে আগে <strong>.SEO</strong> এক্সপোর্ট করুন।
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => setResetModalStep(0)}
                      className="px-4 py-2 rounded-xl bg-[#1b1c28] text-xs font-bold text-white hover:bg-[#25283a]"
                    >
                      বাতিল করুন
                    </button>
                    <button
                      onClick={() => setResetModalStep(3)}
                      className="px-5 py-2 rounded-xl bg-[#ff4444] text-black font-black text-xs hover:bg-[#ff6666]"
                    >
                      চূড়ান্ত নিশ্চিতকরণ ধাপ ৩ &rarr;
                    </button>
                  </div>
                </>
              )}

              {resetModalStep === 3 && (
                <>
                  <div className="p-3 rounded-xl bg-[#4a0d10] border-2 border-[#ff4444] text-xs text-white shadow-[0_0_15px_rgba(255,68,68,0.3)]">
                    <strong className="text-[#ff4444] block text-sm mb-1">⚠ শেষ সুযোগ!</strong>
                    ক্লিক করলেই সমস্ত কাস্টম কনফিগারেশন মোছা হবে এবং অ্যাপ্লিকেশন ফ্রেশ অবস্থায় রিলোড হবে।
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={() => setResetModalStep(0)}
                      className="px-4 py-2 rounded-xl bg-[#1b1c28] text-xs font-bold text-white hover:bg-[#25283a]"
                    >
                      না! রিসেট করবেন না
                    </button>
                    <button
                      id="btn-confirm-final-hard-reset"
                      onClick={handleExecuteHardReset}
                      className="px-6 py-2.5 rounded-xl bg-[#ff0000] text-white font-black text-xs hover:bg-[#cc0000] shadow-[0_0_20px_rgba(255,0,0,0.6)] animate-pulse"
                    >
                      🔥 চূড়ান্ত রিসেট সম্পন্ন করুন (EXECUTE RESET)
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
