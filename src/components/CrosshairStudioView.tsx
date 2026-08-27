import React, { useState, useMemo } from 'react';
import {
  Crosshair,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Zap,
  Eye,
  Shield,
  Layers,
  Search,
  CheckCircle2,
  Tv,
  Radio,
  Maximize2,
  Volume2,
  VolumeX,
  Target,
  Palette,
  Power,
  Flame,
  MousePointer2,
} from 'lucide-react';
import { CrosshairConfig, CrosshairDesign } from '../types';
import { CROSSHAIR_DESIGNS } from '../data/crosshairCatalog';
import { CrosshairRenderer } from './CrosshairRenderer';
import { Language } from '../i18n/translations';

interface CrosshairStudioViewProps {
  crosshairConfig: CrosshairConfig;
  onUpdateConfig: (config: CrosshairConfig) => void;
  onNavigateToDashboard?: () => void;
  onLog?: (msg: string) => void;
  lang?: Language;
}

export const CrosshairStudioView: React.FC<CrosshairStudioViewProps> = ({
  crosshairConfig,
  onUpdateConfig,
  onNavigateToDashboard,
  onLog,
  lang = 'bn',
}) => {
  const isBn = lang === 'bn';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewBg, setPreviewBg] = useState<'cyber' | 'warzone' | 'range' | 'dark' | 'transparent'>('cyber');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [shotCount, setShotCount] = useState<number>(0);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);

  // Active Selected Design
  const activeDesign = useMemo(() => {
    return (
      CROSSHAIR_DESIGNS.find((d) => d.id === crosshairConfig.selectedDesignId) ||
      CROSSHAIR_DESIGNS[0]
    );
  }, [crosshairConfig.selectedDesignId]);

  // Categories list
  const categories = [
    { id: 'all', label: isBn ? 'সবগুলো (৩২টি)' : 'All Designs (32)' },
    { id: 'esport', label: isBn ? '🏆 প্রো স্পোর্টস' : '🏆 Pro Esports' },
    { id: 'dot', label: isBn ? '🎯 প্রিসিশন ডট' : '🎯 Precision Dot' },
    { id: 'circle', label: isBn ? '⭕ সার্কেল ও রিং' : '⭕ Rings & Circles' },
    { id: 'scifi', label: isBn ? '⚡ সাই-ফাই ও সাইবার' : '⚡ Sci-Fi & Cyber' },
    { id: 'sniper', label: isBn ? '🔭 স্নাইপার ও অপটিক্স' : '🔭 Sniper Optics' },
    { id: 'minimal', label: isBn ? '✨ মিনিমালিস্ট' : '✨ Minimal' },
    { id: 'special', label: isBn ? '🔥 স্পেশাল রেইজ' : '🔥 Special Rage' },
  ];

  // Filtered designs
  const filteredDesigns = useMemo(() => {
    return CROSSHAIR_DESIGNS.filter((d) => {
      const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
      const matchSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.shapeType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Neon Color Palette presets
  const COLOR_PALETTE = [
    { hex: '#39ff14', name: 'Neon Green' },
    { hex: '#00e5ff', name: 'Cyber Cyan' },
    { hex: '#ff007f', name: 'Laser Pink' },
    { hex: '#ffd600', name: 'Electric Gold' },
    { hex: '#ff2a4b', name: 'Crimson Red' },
    { hex: '#d500f9', name: 'Matrix Violet' },
    { hex: '#ffffff', name: 'Pure White' },
    { hex: '#ff9100', name: 'Blaze Orange' },
  ];

  // Handle selecting a design
  const handleSelectDesign = (design: CrosshairDesign) => {
    const updated: CrosshairConfig = {
      ...crosshairConfig,
      selectedDesignId: design.id,
      customSettings: {
        ...crosshairConfig.customSettings,
        color: design.color,
        size: design.size,
        thickness: design.thickness,
        gap: design.gap,
        dotSize: design.dotSize ?? 3,
        showDot: design.showDot ?? true,
        hasOutline: design.hasOutline ?? true,
        outlineColor: design.outlineColor ?? '#000000',
        opacity: design.opacity,
        rotation: design.rotation ?? 0,
      },
    };
    onUpdateConfig(updated);
    onLog?.(`[Crosshair] Selected design '${design.name}'`);
    playBeep(880, 0.05);
  };

  // Sound generator
  const playBeep = (freq = 600, duration = 0.04) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted
    }
  };

  // Test firing shot in preview arena
  const handlePreviewClick = (e: React.MouseEvent) => {
    setShotCount((prev) => prev + 1);
    playBeep(1200, 0.06);
  };

  // Update specific custom settings
  const handleUpdateSetting = <K extends keyof CrosshairConfig['customSettings']>(
    key: K,
    val: CrosshairConfig['customSettings'][K]
  ) => {
    const updated: CrosshairConfig = {
      ...crosshairConfig,
      customSettings: {
        ...crosshairConfig.customSettings,
        [key]: val,
      },
    };
    onUpdateConfig(updated);
  };

  // Add to Dashboard / Set Active Toast
  const handleApplyToDashboard = () => {
    setShowSaveToast(true);
    playBeep(1000, 0.1);
    onLog?.(`[Crosshair] Saved and locked '${activeDesign.name}' to dashboard & emulator bridge.`);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {showSaveToast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-[#162b16] border-2 border-[#39ff14] text-white shadow-[0_0_25px_rgba(57,255,20,0.5)] flex items-center space-x-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#39ff14]" />
          <div>
            <div className="text-xs font-black text-[#39ff14]">
              {isBn ? 'ড্যাশবোর্ডে সফলভাবে যুক্ত হয়েছে!' : 'Crosshair Added to Dashboard!'}
            </div>
            <div className="text-[11px] text-[#94a3b8]">
              {isBn
                ? `'${activeDesign.name}' এখন আপনার সক্রিয় এইম ক্রসহায়ার হিসেবে কনফিগার করা হয়েছে।`
                : `'${activeDesign.name}' is now active on your dashboard & emulator.`}
            </div>
          </div>
        </div>
      )}

      {/* Top Banner / Studio Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#12131c] via-[#161824] to-[#12131c] border-2 border-[#39ff14]/30 shadow-[0_0_30px_rgba(57,255,20,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-[#162b16] text-[#39ff14] border-2 border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.4)] shrink-0">
            <Crosshair className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isBn ? 'প্রো ক্রসহায়ার ও এইম স্টুডিও' : 'Pro Crosshair & Aim Studio'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/50 text-xs font-mono font-black uppercase tracking-wider">
                v3.0 Esport Edition
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8892b0] mt-1 max-w-2xl">
              {isBn
                ? 'ইমুলেটর এবং গেমের জন্য কাস্টম নিয়ন ক্রসহায়ার ডিজাইন করুন। ৩২+ ইউনিক স্টাইল থেকে যেকোনোটি বেছে নিন, লাইভ প্রিভিউ করুন এবং এক ক্লিকেই ড্যাশবোর্ড ও ইমুলেটরে চালু করুন।'
                : 'Engineered for competitive Android FPS gamers. Real-time vector rendering, custom geometries, zero input lag, and automatic in-game emulator overlay hook.'}
            </p>
          </div>
        </div>

        {/* Master State Badges & Jump Button */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => {
              const nextVal = !crosshairConfig.isEnabled;
              onUpdateConfig({ ...crosshairConfig, isEnabled: nextVal });
              onLog?.(`[Crosshair] ${nextVal ? 'ENABLED' : 'DISABLED'} crosshair engine.`);
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center space-x-2 transition-all cursor-pointer border ${
              crosshairConfig.isEnabled
                ? 'bg-[#162b16] text-[#39ff14] border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                : 'bg-[#1e1418] text-[#8892b0] border-[#39242d]'
            }`}
          >
            <Power className={`w-4 h-4 ${crosshairConfig.isEnabled ? 'text-[#39ff14]' : 'text-[#64748b]'}`} />
            <span>{crosshairConfig.isEnabled ? (isBn ? 'ক্রসহায়ার চালু' : 'Crosshair ON') : (isBn ? 'ক্রসহায়ার বন্ধ' : 'Crosshair OFF')}</span>
          </button>

          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-2.5 rounded-xl bg-[#1a2333] hover:bg-[#223048] text-[#00e5ff] border border-[#00e5ff]/50 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Tv className="w-4 h-4" />
              <span>{isBn ? 'ড্যাশবোর্ডে দেখুন' : 'Go to Dashboard'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Interactive Live Preview Arena + Realtime Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Live Preview Arena (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#101118] rounded-2xl border-2 border-[#252733] overflow-hidden shadow-2xl flex flex-col">
            {/* Arena Header */}
            <div className="h-12 px-4 bg-[#151622] border-b border-[#252733] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-[#39ff14]" />
                <span className="text-xs font-black text-white tracking-wider uppercase font-mono">
                  {isBn ? 'ইন্টারেক্টিভ লাইভ প্রিভিউ অ্যারিনা' : 'INTERACTIVE LIVE AIM ARENA'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#162b16] text-[#39ff14] font-mono font-bold">
                  {activeDesign.name}
                </span>
              </div>

              {/* Background & Sound Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    soundEnabled
                      ? 'bg-[#182618] text-[#39ff14] border-[#39ff14]/40'
                      : 'bg-[#181822] text-[#64748b] border-[#252733]'
                  }`}
                  title={soundEnabled ? 'Mute Test Click Sound' : 'Enable Test Click Sound'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center bg-[#0d0e14] p-0.5 rounded-lg border border-[#252733]">
                  {(['cyber', 'warzone', 'range', 'dark'] as const).map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setPreviewBg(bg)}
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        previewBg === bg
                          ? 'bg-[#39ff14] text-black shadow-[0_0_8px_rgba(57,255,20,0.5)]'
                          : 'text-[#8892b0] hover:text-white'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Arena Viewport Stage */}
            <div
              id="crosshair-interactive-stage"
              onClick={handlePreviewClick}
              className={`relative h-[360px] sm:h-[420px] w-full flex items-center justify-center cursor-crosshair overflow-hidden select-none transition-all ${
                previewBg === 'dark'
                  ? 'bg-[#08080c]'
                  : previewBg === 'warzone'
                  ? 'bg-gradient-to-b from-[#1b2838] via-[#21374d] to-[#0e1822]'
                  : previewBg === 'range'
                  ? 'bg-gradient-to-br from-[#1a1423] via-[#2d1b38] to-[#120e1a]'
                  : 'bg-[#0a0c13]'
              }`}
            >
              {/* Background Grid & Game Scenario Simulation */}
              {previewBg === 'cyber' && (
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at center, #39ff14 1px, transparent 1px), linear-gradient(to right, #1f283d 1px, transparent 1px), linear-gradient(to bottom, #1f283d 1px, transparent 1px)',
                    backgroundSize: '40px 40px, 20px 20px, 20px 20px',
                  }}
                />
              )}

              {/* Simulated FPS Enemy Target Mockout */}
              {previewBg === 'range' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="w-24 h-48 border-2 border-dashed border-red-500/40 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border border-red-500/60 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-red-500/80 animate-ping"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Center Coordinate Axis Lines */}
              <div className="absolute w-full h-[1px] bg-[#39ff14]/15 pointer-events-none"></div>
              <div className="absolute h-full w-[1px] bg-[#39ff14]/15 pointer-events-none"></div>

              {/* Rendered Dynamic Crosshair */}
              <div
                className="relative z-10 transition-transform duration-75"
                style={{
                  transform: `translate(${crosshairConfig.customSettings.offsetX}px, ${crosshairConfig.customSettings.offsetY}px)`,
                }}
              >
                <CrosshairRenderer
                  design={activeDesign}
                  customSettings={crosshairConfig.customSettings}
                  showGlow={true}
                />
              </div>

              {/* Click Shot Counter Badge */}
              <div className="absolute bottom-3 left-3 bg-[#000000]/80 px-2.5 py-1 rounded-lg border border-[#252733] text-[10px] font-mono text-[#8892b0] pointer-events-none flex items-center space-x-2">
                <MousePointer2 className="w-3 h-3 text-[#39ff14]" />
                <span>{isBn ? 'ক্লিক করে টেস্ট করুন' : 'Click to test recoil & shot sound'}</span>
                <span className="text-[#39ff14] font-bold font-mono">[{shotCount} shots]</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-[#000000]/80 px-2.5 py-1 rounded-lg border border-[#252733] text-[10px] font-mono text-[#00e5ff] pointer-events-none">
                Offset: X={crosshairConfig.customSettings.offsetX}px, Y={crosshairConfig.customSettings.offsetY}px
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="p-4 bg-[#141520] border-t border-[#252733] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#8892b0]">
                  {isBn ? 'নির্বাচিত ক্রসহায়ার:' : 'Active Design:'}
                </span>
                <span className="text-xs font-extrabold text-[#39ff14] font-mono">
                  {activeDesign.name}
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => {
                    handleSelectDesign(activeDesign); // reset custom tweaks to design defaults
                    onLog?.(`[Crosshair] Reset '${activeDesign.name}' to default parameters.`);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#1b1c28] hover:bg-[#242636] text-[#8892b0] hover:text-white border border-[#2d2f40] text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isBn ? 'রিসেট' : 'Reset'}</span>
                </button>

                <button
                  id="btn-add-crosshair-to-dashboard"
                  onClick={handleApplyToDashboard}
                  className="px-5 py-2 rounded-xl bg-[#39ff14] hover:bg-[#32e012] text-black font-black text-xs flex items-center space-x-2 shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all hover:scale-105 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isBn ? '➕ ড্যাশবোর্ডে যুক্ত করুন' : '➕ Add to Dashboard'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Geometry & Optics Customizer (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#101118] rounded-2xl border-2 border-[#252733] p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#1f202b]">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-[#00e5ff]" />
                  <span className="text-xs font-black text-white tracking-wider uppercase font-mono">
                    {isBn ? 'ক্রসহায়ার কাস্টমাইজেশন ও অপটিক্স' : 'OPTICS & GEOMETRY TUNER'}
                  </span>
                </div>
                <span className="text-[10px] text-[#64748b] font-mono">Real-time Hook</span>
              </div>

              {/* Color Palette Selector + Native Color Picker */}
              <div className="mt-4">
                <label className="text-xs font-bold text-[#8892b0] flex items-center justify-between mb-2">
                  <span>{isBn ? 'রং ও কাস্টম পিক (Neon Color & Native Picker)' : 'Reticle Color & Custom Picker'}</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={crosshairConfig.customSettings.color || '#39ff14'}
                      onChange={(e) => handleUpdateSetting('color', e.target.value)}
                      className="w-6 h-6 rounded-md bg-transparent border border-[#2e3146] cursor-pointer"
                      title="Choose Custom Color"
                    />
                    <input
                      type="text"
                      value={crosshairConfig.customSettings.color || '#39ff14'}
                      onChange={(e) => handleUpdateSetting('color', e.target.value)}
                      className="w-20 h-6 px-1.5 rounded bg-[#161824] border border-[#2e3146] text-[#39ff14] text-[11px] font-mono text-center outline-none uppercase"
                    />
                  </div>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {COLOR_PALETTE.map((c) => {
                    const isSelected = crosshairConfig.customSettings.color.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        onClick={() => handleUpdateSetting('color', c.hex)}
                        style={{ backgroundColor: c.hex }}
                        className={`h-7 rounded-lg transition-transform cursor-pointer relative flex items-center justify-center ${
                          isSelected ? 'scale-110 shadow-[0_0_10px_currentColor] ring-2 ring-white' : 'opacity-80 hover:opacity-100 hover:scale-105'
                        }`}
                        title={c.name}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="mt-5 space-y-4">
                {/* Size */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#8892b0] mb-1">
                    <span>{isBn ? 'সাইজ (Size / Radius)' : 'Crosshair Size'}</span>
                    <span className="text-white font-mono">{crosshairConfig.customSettings.size}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    step="1"
                    value={crosshairConfig.customSettings.size ?? 24}
                    onChange={(e) => handleUpdateSetting('size', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1f202b] rounded-lg appearance-none cursor-pointer accent-[#39ff14]"
                  />
                </div>

                {/* Thickness */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#8892b0] mb-1">
                    <span>{isBn ? 'লাইনের পুরুত্ব (Thickness)' : 'Line Thickness'}</span>
                    <span className="text-white font-mono">{crosshairConfig.customSettings.thickness}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={crosshairConfig.customSettings.thickness ?? 2}
                    onChange={(e) => handleUpdateSetting('thickness', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1f202b] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                  />
                </div>

                {/* Outline Thickness */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#8892b0] mb-1">
                    <span>{isBn ? 'আউটলাইন থিকনেস (Outline Thickness)' : 'Outline Thickness'}</span>
                    <span className="text-white font-mono">{crosshairConfig.customSettings.outlineThickness || 1}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={crosshairConfig.customSettings.outlineThickness ?? 1}
                    onChange={(e) => handleUpdateSetting('outlineThickness', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1f202b] rounded-lg appearance-none cursor-pointer accent-[#d500f9]"
                  />
                </div>

                {/* Glow Intensity */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#8892b0] mb-1">
                    <span>{isBn ? 'গ্লো ইনটেনসিটি (Glow Intensity)' : 'Glow Intensity'}</span>
                    <span className="text-white font-mono">{crosshairConfig.customSettings.glowIntensity || 10}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="1"
                    value={crosshairConfig.customSettings.glowIntensity ?? 10}
                    onChange={(e) => handleUpdateSetting('glowIntensity', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1f202b] rounded-lg appearance-none cursor-pointer accent-[#ffd600]"
                  />
                </div>

                {/* Center Gap */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#8892b0] mb-1">
                    <span>{isBn ? 'মাঝের ফাঁক (Center Gap)' : 'Center Gap'}</span>
                    <span className="text-white font-mono">{crosshairConfig.customSettings.gap}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={crosshairConfig.customSettings.gap ?? 0}
                    onChange={(e) => handleUpdateSetting('gap', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1f202b] rounded-lg appearance-none cursor-pointer accent-[#ff007f]"
                  />
                </div>

                {/* Dot Size */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#8892b0] mb-1">
                    <span>{isBn ? 'সেন্টার ডট সাইজ (Dot Size)' : 'Center Dot Size'}</span>
                    <span className="text-white font-mono">{crosshairConfig.customSettings.dotSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={crosshairConfig.customSettings.dotSize ?? 3}
                    onChange={(e) => handleUpdateSetting('dotSize', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1f202b] rounded-lg appearance-none cursor-pointer accent-[#ffd600]"
                  />
                </div>

                {/* Opacity */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#8892b0] mb-1">
                    <span>{isBn ? 'স্বচ্ছতা (Opacity)' : 'Transparency / Opacity'}</span>
                    <span className="text-white font-mono">{Math.round(crosshairConfig.customSettings.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={crosshairConfig.customSettings.opacity ?? 1}
                    onChange={(e) => handleUpdateSetting('opacity', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#1f202b] rounded-lg appearance-none cursor-pointer accent-[#39ff14]"
                  />
                </div>

                {/* Rotation Angle */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#8892b0] mb-1">
                    <span>{isBn ? 'ঘূর্ণন কোণ (Rotation Angle)' : 'Rotation'}</span>
                    <span className="text-white font-mono">{crosshairConfig.customSettings.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={crosshairConfig.customSettings.rotation ?? 0}
                    onChange={(e) => handleUpdateSetting('rotation', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1f202b] rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                  />
                </div>
              </div>

              {/* Toggles Strip */}
              <div className="mt-5 pt-4 border-t border-[#1f202b] grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleUpdateSetting('showDot', !crosshairConfig.customSettings.showDot)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    crosshairConfig.customSettings.showDot
                      ? 'bg-[#182618] text-[#39ff14] border-[#39ff14]/50'
                      : 'bg-[#161722] text-[#64748b] border-[#252733]'
                  }`}
                >
                  <span>{isBn ? 'সেন্টার ডট' : 'Center Dot'}</span>
                  <span className="text-[10px] font-mono">{crosshairConfig.customSettings.showDot ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => handleUpdateSetting('hasOutline', !crosshairConfig.customSettings.hasOutline)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    crosshairConfig.customSettings.hasOutline
                      ? 'bg-[#182618] text-[#39ff14] border-[#39ff14]/50'
                      : 'bg-[#161722] text-[#64748b] border-[#252733]'
                  }`}
                >
                  <span>{isBn ? 'কালো আউটলাইন' : 'Black Outline'}</span>
                  <span className="text-[10px] font-mono">{crosshairConfig.customSettings.hasOutline ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => handleUpdateSetting('pulseAnimation', !crosshairConfig.customSettings.pulseAnimation)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer col-span-2 ${
                    crosshairConfig.customSettings.pulseAnimation
                      ? 'bg-[#2b1828] text-[#ff007f] border-[#ff007f]/50'
                      : 'bg-[#161722] text-[#64748b] border-[#252733]'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ডাইনামিক পালস / ব্রিদিং গ্লো ইফেক্ট' : 'Dynamic Pulse / Breathing Glow'}</span>
                  </span>
                  <span className="text-[10px] font-mono">{crosshairConfig.customSettings.pulseAnimation ? 'ACTIVE' : 'OFF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crosshair Designs Card Catalog Section */}
      <div className="bg-[#101118] rounded-2xl border-2 border-[#252733] p-6 shadow-2xl">
        {/* Catalog Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1f202b]">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#39ff14]" />
              <span>{isBn ? 'ক্রসহায়ার ডিজাইন ক্যাটালগ (৩২+ ইউনিক ডিজাইন)' : 'CROSSHAIR DESIGN CATALOG (32+ STYLES)'}</span>
            </h2>
            <p className="text-xs text-[#8892b0] mt-0.5">
              {isBn
                ? 'যেকোনো কার্ডের ওপর ক্লিক করলে সেটি লাইভ প্রিভিউতে ওপেন হবে এবং সিলেক্ট হবে।'
                : 'Click any card to load, preview, customize, and add to your active dashboard.'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'ক্রসহায়ার সার্চ করুন...' : 'Search crosshairs (e.g. Dot, CS2, Valorant)...'}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#181926] text-white border border-[#2b2d3d] text-xs outline-none focus:border-[#39ff14]"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-[#39ff14] text-black border-[#39ff14] shadow-[0_0_12px_rgba(57,255,20,0.4)]'
                  : 'bg-[#161724] text-[#8892b0] border-[#252738] hover:border-[#39ff14]/40 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {filteredDesigns.map((design) => {
            const isSelected = crosshairConfig.selectedDesignId === design.id;
            return (
              <div
                key={design.id}
                id={`crosshair-card-${design.id}`}
                onClick={() => handleSelectDesign(design)}
                className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#182618] border-[#39ff14] shadow-[0_0_20px_rgba(57,255,20,0.3)] scale-[1.02]'
                    : 'bg-[#141520] border-[#252733] hover:border-[#39ff14]/60 hover:bg-[#181a28]'
                }`}
              >
                {/* Active selection ribbon */}
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-[#39ff14] text-black font-black text-[9px] px-2.5 py-0.5 rounded-bl-lg font-mono uppercase tracking-wider">
                    ACTIVE
                  </div>
                )}

                <div>
                  {/* Miniature Crosshair Display Stage */}
                  <div className="h-28 rounded-xl bg-[#090a10] border border-[#202230] flex items-center justify-center relative overflow-hidden group-hover:border-[#39ff14]/40 transition-colors">
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, #39ff14 1px, transparent 1px), linear-gradient(to bottom, #39ff14 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      }}
                    />
                    <CrosshairRenderer
                      design={design}
                      customSettings={isSelected ? crosshairConfig.customSettings : undefined}
                      showGlow={true}
                    />
                  </div>

                  {/* Design Info */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#00e5ff] px-2 py-0.5 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/30">
                        {design.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#8892b0]">
                        {design.size}px
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-1.5 truncate group-hover:text-[#39ff14] transition-colors">
                      {design.name}
                    </h3>
                    <p className="text-xs text-[#8892b0] mt-1 line-clamp-2 leading-relaxed">
                      {design.description}
                    </p>
                  </div>
                </div>

                {/* Card Action Strip */}
                <div className="mt-4 pt-3 border-t border-[#1f202b] flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: design.color }}
                    />
                    <span className="text-[10px] font-mono text-[#64748b]">{design.shapeType}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDesign(design);
                      handleApplyToDashboard();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#39ff14] text-black shadow-[0_0_8px_rgba(57,255,20,0.4)]'
                        : 'bg-[#1e202f] hover:bg-[#39ff14] text-[#8892b0] hover:text-black'
                    }`}
                  >
                    {isSelected ? (isBn ? '✓ সক্রিয়' : '✓ Active') : (isBn ? 'নির্বাচন করুন' : 'Select')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
