import React, { useState, useRef, useEffect } from 'react';
import { Plus, Layers, Globe, Copy, Minus, Square, X, Trash2, Check } from 'lucide-react';
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
  marqueeStyle = 'cyberNeon',
  lang = 'bn',
  onToggleLanguage,
}) => {
  const t = translations[lang];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-4 sm:px-5 bg-[#0e0f16] border-b border-[#1f212f] flex items-center justify-between select-none z-20 shrink-0 gap-3">
      {/* Dynamic Single-Line Neon Marquee Title */}
      <div className="flex items-center space-x-3 min-w-0 max-w-[220px] sm:max-w-[320px] md:max-w-[420px]">
        <NeonMarquee
          text={pageTitle}
          styleMode={marqueeStyle}
          className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight"
        />
      </div>

      {/* Right Controls: Language Selector + Modern Card Profile Selector + Actions + Window Controls */}
      <div className="flex items-center space-x-2 shrink-0 flex-wrap">
        {/* Language Selector Toggle */}
        <div className="flex items-center rounded-xl bg-[#141520] border border-[#252838] p-0.5 space-x-1">
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

        {/* Modern Custom Glowing Profile Selector (No Native Dropdown, No Arrow) */}
        <div className="flex items-center space-x-1.5">
          {presets.length > 0 ? (
            <div ref={dropdownRef} className="relative flex items-center">
              <button
                id="btn-profile-dropdown-toggle"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="h-9 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-[#111922] via-[#0d131c] to-[#111922] border border-[#39ff14]/60 shadow-[0_0_12px_rgba(57,255,20,0.2)] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:border-[#39ff14] transition-all flex items-center min-w-[100px] sm:min-w-[130px] max-w-[170px] cursor-pointer overflow-hidden group"
              >
                <Layers className="w-4 h-4 text-[#39ff14] shrink-0 mr-2 group-hover:scale-110 transition-transform" />
                <div className="flex-1 overflow-hidden min-w-0 text-left">
                  <NeonMarquee
                    text={selectedPresetName || (lang === 'bn' ? 'কোনো প্রোফাইল নেই' : 'No Profile')}
                    styleMode="cyberNeon"
                    speedSec={8}
                    className="text-xs font-black tracking-wide"
                  />
                </div>
              </button>

              {/* Custom Cyberpunk Dropdown Overlay */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 w-64 sm:w-72 rounded-2xl bg-[#0a0d14]/95 backdrop-blur-2xl border border-[#39ff14]/60 shadow-[0_0_30px_rgba(57,255,20,0.35)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2.5 bg-[#121824]/90 border-b border-[#222c3d] flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#39ff14] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      {lang === 'bn' ? 'প্রোফাইল তালিকা' : 'Profile List'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#39ff14]/15 text-[#39ff14] font-bold border border-[#39ff14]/30">
                      {presets.length} {lang === 'bn' ? 'টি' : 'Total'}
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
                    {presets.map((preset) => {
                      const isSelected = preset.name === selectedPresetName;
                      return (
                        <button
                          key={preset.id || preset.name}
                          onClick={() => {
                            onSwitchPreset(preset.name);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#162e1a] to-[#0f2214] text-[#39ff14] font-black border-l-4 border-[#39ff14] shadow-[0_0_12px_rgba(57,255,20,0.15)]'
                              : 'text-gray-300 hover:text-white hover:bg-[#161f2c] font-semibold'
                          }`}
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="truncate text-xs group-hover:translate-x-0.5 transition-transform">
                              {preset.name}
                            </span>
                            {preset.targetGame && (
                              <span className="text-[10px] text-gray-400 group-hover:text-[#00e5ff] truncate mt-0.5">
                                🎮 {preset.targetGame}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded bg-[#39ff14] text-black font-black uppercase shadow-[0_0_8px_rgba(57,255,20,0.5)] flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-9 px-3 rounded-xl bg-[#1a1414] text-[#ff6b6b] border border-[#ff4444]/40 font-bold text-xs flex items-center">
              No Profiles
            </div>
          )}

          {/* New Profile Button */}
          <button
            id="btn-new-preset-header"
            onClick={onOpenNewPresetModal}
            className="h-9 px-3 rounded-xl bg-[#162916] hover:bg-[#203a20] text-[#39ff14] border border-[#39ff14] font-black text-xs flex items-center space-x-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.2)] hover:scale-105"
            title="Create a new Profile"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">{t.newProfile}</span>
          </button>

          {/* Delete Active Profile Button */}
          {onDeletePreset && presets.length > 0 && selectedPresetName && (
            <button
              id="btn-delete-preset-header"
              onClick={() => onDeletePreset(selectedPresetName)}
              className="h-9 px-2.5 rounded-xl bg-[#2b1618] hover:bg-[#3d1a1e] text-[#ff4444] border border-[#ff4444] font-bold text-xs flex items-center justify-center transition-all cursor-pointer shadow-[0_0_10px_rgba(255,68,68,0.2)] hover:scale-105"
              title={lang === 'bn' ? `প্রোফাইল '${selectedPresetName}' ডিলিট করুন` : `Delete profile '${selectedPresetName}'`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Duplicate Active Profile Button */}
          {onDuplicatePreset && presets.length > 0 && selectedPresetName && (
            <button
              id="btn-duplicate-preset-header"
              onClick={onDuplicatePreset}
              className="h-9 px-2.5 rounded-xl bg-[#14232c] hover:bg-[#1a313d] text-[#00e5ff] border border-[#00e5ff]/60 font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.15)] hover:scale-105"
              title={`Clone / Duplicate active profile '${selectedPresetName}'`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{lang === 'bn' ? 'ক্লোন' : 'Clone'}</span>
            </button>
          )}
        </div>

        {/* Standard OS Window Controls (Minimize, Restore, Close) */}
        <div className="flex items-center space-x-1 pl-1.5 border-l border-[#252733]/80">
          <button
            onClick={() => {
              if ((window as any).electronAPI?.minimize) {
                (window as any).electronAPI.minimize();
              }
            }}
            className="w-7 h-7 rounded-lg bg-[#161722] hover:bg-[#242738] text-[#8892b0] hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if ((window as any).electronAPI?.toggleMaximize) {
                (window as any).electronAPI.toggleMaximize();
              }
            }}
            className="w-7 h-7 rounded-lg bg-[#161722] hover:bg-[#242738] text-[#8892b0] hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Maximize"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={() => {
              if ((window as any).electronAPI?.close) {
                (window as any).electronAPI.close();
              }
            }}
            className="w-7 h-7 rounded-lg bg-[#161722] hover:bg-[#ff4444] text-[#8892b0] hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};

