import React, { useState } from 'react';
import { Plus, Eye, Layers, Crop, Trash2, Globe, Copy, Minus, Square, X } from 'lucide-react';
import { PresetProfile } from '../types';
import { NeonMarquee } from './NeonMarquee';
import { Language, translations } from '../i18n/translations';

interface HeaderProps {
  pageTitle: string;
  presets: PresetProfile[];
  selectedPresetName: string;
  onSwitchPreset: (name: string) => void;
  onOpenNewPresetModal: () => void;
  onDuplicatePreset?: () => void;
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
  onDuplicatePreset,
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

        {/* Preset Selector & Description */}
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-1 text-xs text-[#8892b0] font-semibold hidden md:flex">
            <Layers className="w-3.5 h-3.5 text-[#39ff14]" />
            <span>{t.profile}:</span>
          </div>

          {presets.length > 0 ? (
            <div className="relative group">
              <select
                id="preset-dropdown-header"
                value={selectedPresetName}
                onChange={(e) => onSwitchPreset(e.target.value)}
                className="h-9 max-w-[140px] sm:max-w-[200px] px-2.5 rounded-xl bg-[#16161e] text-[#39ff14] border border-[#2d2d3b] hover:border-[#39ff14]/60 font-bold text-xs outline-none focus:border-[#39ff14] cursor-pointer transition-all truncate"
                title={presets.find((p) => p.name === selectedPresetName)?.description || selectedPresetName}
              >
                {presets.map((preset) => (
                  <option key={preset.id || preset.name} value={preset.name} className="bg-[#16161e] text-white">
                    {preset.name} {preset.targetGame ? `(${preset.targetGame})` : ''}
                  </option>
                ))}
              </select>

              {/* Profile Description Hover Card */}
              {presets.find((p) => p.name === selectedPresetName)?.description && (
                <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-50 w-64 p-2.5 rounded-xl bg-[#181822] border border-[#39ff14]/40 shadow-2xl text-[11px] text-[#cbd5e1] pointer-events-none backdrop-blur-md">
                  <div className="text-[10px] font-bold text-[#39ff14] uppercase tracking-wider mb-1">
                    Profile Description:
                  </div>
                  <div className="line-clamp-3">
                    {presets.find((p) => p.name === selectedPresetName)?.description}
                  </div>
                </div>
              )}
            </div>
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

          {/* Duplicate Active Profile Button */}
          {onDuplicatePreset && presets.length > 0 && selectedPresetName && (
            <button
              id="btn-duplicate-preset-header"
              onClick={onDuplicatePreset}
              className="h-9 px-2.5 rounded-xl bg-[#1a1e29] hover:bg-[#232938] text-[#00e5ff] border border-[#00e5ff]/60 font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.15)] hover:scale-105"
              title={`Clone / Duplicate active profile '${selectedPresetName}'`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{lang === 'bn' ? 'ক্লোন' : 'Clone'}</span>
            </button>
          )}

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

        {/* Standard OS Window Controls (Minimize, Restore, Close) */}
        <div className="flex items-center space-x-1 pl-2 border-l border-[#252733]/80">
          {/* Minimize Button */}
          <button
            id="btn-window-minimize"
            onClick={onToggleOverlay}
            className="w-7 h-7 rounded-lg bg-[#141622] hover:bg-[#1f2338] text-[#8892b0] hover:text-[#00e5ff] flex items-center justify-center transition-all cursor-pointer border border-[#232738]"
            title={lang === 'bn' ? 'মিনিমাইজ / স্টিলথ HUD ওভারলে' : 'Minimize to Stealth HUD'}
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Restore / Maximize Button */}
          <button
            id="btn-window-restore"
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              } else {
                document.documentElement.requestFullscreen().catch(() => {});
              }
            }}
            className="w-7 h-7 rounded-lg bg-[#141622] hover:bg-[#1f2338] text-[#8892b0] hover:text-[#39ff14] flex items-center justify-center transition-all cursor-pointer border border-[#232738]"
            title={lang === 'bn' ? 'ফুলস্ক্রিন / রিস্টোর' : 'Toggle Fullscreen / Restore'}
          >
            <Square className="w-3 h-3 stroke-[2.5]" />
          </button>

          {/* Close Application Button */}
          <button
            id="btn-window-close"
            onClick={onToggleOverlay}
            className="w-7 h-7 rounded-lg bg-[#2b1618] hover:bg-[#45181c] text-[#ff4444] hover:text-white flex items-center justify-center transition-all cursor-pointer border border-[#ff4444]/50 shadow-[0_0_8px_rgba(255,68,68,0.2)]"
            title={lang === 'bn' ? 'অ্যাপ্লিকেশন হাইড / এক্সিট' : 'Minimize / Exit App Window'}
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
};
