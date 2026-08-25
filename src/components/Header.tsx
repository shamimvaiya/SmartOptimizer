import React from 'react';
import { Plus, Eye, Layers, Crop, Trash2, Globe } from 'lucide-react';
import { PresetProfile } from '../types';
import { NeonMarquee } from './NeonMarquee';
import { Language, translations } from '../i18n/translations';

interface HeaderProps {
  pageTitle: string;
  presets: PresetProfile[];
  selectedPresetName: string;
  onSwitchPreset: (name: string) => void;
  onOpenNewPresetModal: () => void;
  onDeletePreset?: (name: string) => void;
  overlayHotkey: string;
  onToggleOverlay: () => void;
  onOpenSnipper: () => void;
  marqueeStyle?: 'cyberNeon' | 'laserPulse' | 'matrixSmooth' | 'amberClassic' | 'gradientWave';
  lang: Language;
  onToggleLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  presets,
  selectedPresetName,
  onSwitchPreset,
  onOpenNewPresetModal,
  onDeletePreset,
  overlayHotkey,
  onToggleOverlay,
  onOpenSnipper,
  marqueeStyle = 'cyberNeon',
  lang = 'bn',
  onToggleLanguage,
}) => {
  const t = translations[lang];

  return (
    <header className="h-16 px-5 bg-[#101015] border-b border-[#1f202b] flex items-center justify-between select-none z-10 shrink-0 gap-3">
      {/* Dynamic Single-Line Neon Marquee Title */}
      <div className="flex items-center space-x-3 min-w-0 max-w-[240px] sm:max-w-[320px] md:max-w-[420px]">
        <NeonMarquee
          text={pageTitle}
          styleMode={marqueeStyle}
          className="text-lg md:text-xl font-extrabold tracking-tight"
        />
      </div>

      {/* Right Controls: Language Selector + Quick Snip + Preset Selector + HUD Status */}
      <div className="flex items-center space-x-2.5 shrink-0 flex-wrap">
        {/* Language Selector Toggle */}
        <div className="flex items-center rounded-xl bg-[#15151c] border border-[#252733] p-1 space-x-1">
          <Globe className="w-3.5 h-3.5 text-[#00e5ff] ml-1.5 hidden sm:inline" />
          <button
            onClick={() => onToggleLanguage('bn')}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              lang === 'bn'
                ? 'bg-[#39ff14] text-black shadow-[0_0_8px_rgba(57,255,20,0.4)]'
                : 'text-[#8892b0] hover:text-white'
            }`}
            title="বাংলা ভাষায় পরিবর্তন করুন"
          >
            বাংলা
          </button>
          <button
            onClick={() => onToggleLanguage('en')}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-[#00e5ff] text-black shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                : 'text-[#8892b0] hover:text-white'
            }`}
            title="Switch language to English"
          >
            EN
          </button>
        </div>

        {/* Quick Snipping Tool Trigger */}
        <button
          id="btn-header-quick-snip"
          onClick={onOpenSnipper}
          className="h-9 px-3 rounded-xl bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] font-black text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.2)] hover:scale-105"
          title="Open Lightshot-style Smart Snipping Tool"
        >
          <Crop className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.snipArea}</span>
        </button>

        {/* Hotkey Indicator */}
        <div
          onClick={onToggleOverlay}
          className="hidden xl:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#15151c] border border-[#252733] text-xs font-semibold text-[#8892b0] hover:border-[#00e5ff] hover:text-[#00e5ff] cursor-pointer transition-colors"
          title="Click or press the hotkey to toggle the floating HUD overlay"
        >
          <Eye className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>{t.hudHotkey}:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#20202b] text-[#39ff14] font-mono text-[11px] font-bold border border-[#39ff14]/40">
            {overlayHotkey || 'HOME'}
          </kbd>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-1 text-xs text-[#8892b0] font-semibold hidden md:flex">
            <Layers className="w-3.5 h-3.5 text-[#39ff14]" />
            <span>{t.profile}:</span>
          </div>

          {presets.length > 0 ? (
            <select
              id="preset-dropdown-header"
              value={selectedPresetName}
              onChange={(e) => onSwitchPreset(e.target.value)}
              className="h-9 max-w-[140px] sm:max-w-[200px] px-2.5 rounded-xl bg-[#16161e] text-[#39ff14] border border-[#2d2d3b] hover:border-[#39ff14]/60 font-bold text-xs outline-none focus:border-[#39ff14] cursor-pointer transition-all truncate"
            >
              {presets.map((preset) => (
                <option key={preset.id || preset.name} value={preset.name} className="bg-[#16161e] text-white">
                  {preset.name} {preset.targetGame ? `(${preset.targetGame})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="h-9 px-3 rounded-xl bg-[#1a1414] text-[#ff6b6b] border border-[#ff4444]/40 font-bold text-xs flex items-center">
              No Profiles
            </div>
          )}

          {/* New Preset Button */}
          <button
            id="btn-new-preset-header"
            onClick={onOpenNewPresetModal}
            className="h-9 px-3 rounded-xl bg-[#1a2a1a] hover:bg-[#233a23] text-[#39ff14] border border-[#39ff14] font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.15)] hover:scale-105"
            title="Create a new JSON Profile"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">{t.newProfile}</span>
          </button>

          {/* Delete Preset Button */}
          {onDeletePreset && presets.length > 0 && selectedPresetName && (
            <button
              id="btn-delete-preset-header"
              onClick={() => onDeletePreset(selectedPresetName)}
              className="h-9 px-2 rounded-xl bg-[#2a1a1a] hover:bg-[#3a2020] text-[#ff4444] border border-[#ff4444]/60 font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(255,68,68,0.15)]"
              title={`Delete profile '${selectedPresetName}'`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
