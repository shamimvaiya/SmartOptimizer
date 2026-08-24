import React from 'react';
import { Plus, Eye, Layers, Sparkles, Crop, ClipboardPaste, Trash2 } from 'lucide-react';
import { PresetProfile } from '../types';

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
}) => {
  return (
    <header className="h-16 px-6 bg-[#101015] border-b border-[#1f202b] flex items-center justify-between select-none z-10 shrink-0">
      {/* Title */}
      <div className="flex items-center space-x-3">
        <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          {pageTitle}
        </h1>
      </div>

      {/* Right Controls: Quick Snip + Preset Selector + HUD Status + Actions */}
      <div className="flex items-center space-x-3">
        {/* Quick Snipping Tool Trigger */}
        <button
          id="btn-header-quick-snip"
          onClick={onOpenSnipper}
          className="h-9 px-3.5 rounded-lg bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] font-black text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.2)] hover:scale-105"
          title="Open Lightshot-style Smart Snipping Tool"
        >
          <Crop className="w-3.5 h-3.5" />
          <span>Snip Area</span>
        </button>

        {/* Hotkey Indicator */}
        <div
          onClick={onToggleOverlay}
          className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#15151c] border border-[#252733] text-xs font-semibold text-[#8892b0] hover:border-[#00e5ff] hover:text-[#00e5ff] cursor-pointer transition-colors"
          title="Click or press the hotkey to toggle the floating HUD overlay"
        >
          <Eye className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span>HUD Hotkey:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#20202b] text-[#39ff14] font-mono text-[11px] font-bold border border-[#39ff14]/40">
            {overlayHotkey || 'HOME'}
          </kbd>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-[#8892b0] font-semibold hidden sm:flex">
            <Layers className="w-3.5 h-3.5 text-[#39ff14]" />
            <span>Profile:</span>
          </div>
          <select
            id="preset-dropdown-header"
            value={selectedPresetName}
            onChange={(e) => onSwitchPreset(e.target.value)}
            className="h-9 px-3 rounded-lg bg-[#16161e] text-[#39ff14] border border-[#2d2d3b] hover:border-[#39ff14]/60 font-bold text-xs outline-none focus:border-[#39ff14] cursor-pointer transition-all"
          >
            {presets.map((preset) => (
              <option key={preset.id || preset.name} value={preset.name} className="bg-[#16161e] text-white">
                {preset.name} {preset.targetGame ? `(${preset.targetGame})` : ''}
              </option>
            ))}
          </select>

          {/* New Preset Button */}
          <button
            id="btn-new-preset-header"
            onClick={onOpenNewPresetModal}
            className="h-9 px-3.5 rounded-lg bg-[#1a2a1a] hover:bg-[#233a23] text-[#39ff14] border border-[#39ff14] font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.15)]"
            title="Create a new JSON Profile"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ New</span>
          </button>

          {/* Delete Preset Button */}
          {onDeletePreset && presets.length > 1 && (
            <button
              id="btn-delete-preset-header"
              onClick={() => onDeletePreset(selectedPresetName)}
              className="h-9 px-2.5 rounded-lg bg-[#2a1a1a] hover:bg-[#3a2020] text-[#ff4444] border border-[#ff4444]/60 font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(255,68,68,0.15)]"
              title={`Delete profile '${selectedPresetName}'`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Delete</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
