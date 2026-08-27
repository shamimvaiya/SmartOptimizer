import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Gauge, Layers, Save, Sliders, Zap, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { PresetProfile } from '../types';

interface PerformanceViewProps {
  activePreset: PresetProfile;
  onApplyTweaks: (tweaks: {
    priority: string;
    cpuAffinityMask: number;
    targetFps: number;
    dpi: number;
  }) => Promise<void>;
  onSendAdbFps: (fps: number) => void;
  onSendAdbDpi: (dpi: number) => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  activePreset,
  onApplyTweaks,
  onSendAdbFps,
  onSendAdbDpi,
}) => {
  const [priority, setPriority] = useState<string>(activePreset.emulator?.priorityClass || 'Normal');
  const [affinityMask, setAffinityMask] = useState<number>(activePreset.emulator?.affinityMask || 3); // Default 2 cores for Normal (11 binary = 3)
  const [enableAffinity, setEnableAffinity] = useState<boolean>(activePreset.performance?.enableCpuAffinity ?? true);
  const [targetFps, setTargetFps] = useState<number>(activePreset.performance?.targetFps || 60);
  const [dpi, setDpi] = useState<number>(activePreset.display?.dpi || 240);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Click-to-edit state
  const [isEditingFps, setIsEditingFps] = useState(false);
  const [isEditingDpi, setIsEditingDpi] = useState(false);

  // Slider refs for mouse wheel control without scrolling page
  const fpsSliderRef = useRef<HTMLInputElement>(null);
  const dpiSliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = fpsSliderRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const step = e.shiftKey ? 10 : 1;
      const delta = e.deltaY < 0 ? step : -step;
      setTargetFps((prev) => Math.min(5000, Math.max(1, prev + delta)));
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => {
    const el = dpiSliderRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const step = e.shiftKey ? 10 : 1;
      const delta = e.deltaY < 0 ? step : -step;
      setDpi((prev) => Math.min(5000, Math.max(1, prev + delta)));
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const numCores = 8; // standard 8-core visualization

  const isCoreSelected = (coreIndex: number) => {
    return (affinityMask & (1 << coreIndex)) !== 0;
  };

  const toggleCore = (coreIndex: number) => {
    const newMask = affinityMask ^ (1 << coreIndex);
    setAffinityMask(newMask);
  };

  const selectCoresForPriority = (p: string) => {
    let mask = 0;
    // Normal: 2 cores
    // AboveNormal: 4 cores
    // High: 6 cores
    // RealTime: 8 cores
    switch (p) {
      case 'Normal':
        mask = 3; // 00000011 (Cores 0, 1)
        break;
      case 'AboveNormal':
        mask = 15; // 00001111 (Cores 0, 1, 2, 3)
        break;
      case 'High':
        mask = 63; // 00111111 (Cores 0, 1, 2, 3, 4, 5)
        break;
      case 'RealTime':
        mask = 255; // 11111111 (All Cores)
        break;
      default:
        mask = 3;
    }
    setAffinityMask(mask);
  };

  const handlePriorityChange = (p: string) => {
    setPriority(p);
    selectCoresForPriority(p);
  };

  const selectPerformanceCores = () => {
    // Select upper 4 cores (Cores 4, 5, 6, 7) -> 11110000 = 240
    setAffinityMask(240);
  };

  const selectAllCores = () => {
    setAffinityMask(255);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onApplyTweaks({
      priority,
      cpuAffinityMask: affinityMask,
      targetFps,
      dpi,
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-10 max-w-6xl mx-auto">
      {/* Save Button Header Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141419] p-5 rounded-2xl border border-[#252733] shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#00e5ff]" />
            <span>Optimization Engine &amp; Performance Core Tuning</span>
          </h2>
          <p className="text-xs text-[#8892b0] mt-0.5">
            Active Target Profile: <strong className="text-[#39ff14]">{activePreset.name}</strong> ({activePreset.targetGame})
          </p>
        </div>

        <button
          id="btn-apply-performance-tweaks"
          onClick={handleSave}
          disabled={isSaving}
          className={`h-11 px-6 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-lg ${
            savedSuccess
              ? 'bg-[#162b16] text-[#39ff14] border border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.4)]'
              : 'bg-[#002b30] hover:bg-[#003d45] text-[#00e5ff] border border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.3)]'
          }`}
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'TWEAKS APPLIED & SAVED' : 'APPLY & SAVE TO PROFILE'}</span>
        </button>
      </div>

      {/* Process Priority Injection Card */}
      <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl">
        <div className="flex items-center space-x-3">
          <Zap className="w-5 h-5 text-[#39ff14]" />
          <div>
            <h3 className="text-base font-bold text-white">Process Priority Class Injection</h3>
            <p className="text-xs text-[#8892b0]">
              Forces the Windows kernel thread scheduler to give priority CPU slices to the emulator process.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {[
            {
              id: 'Normal',
              name: 'Normal',
              desc: 'Standard Windows multitasking priority.',
              color: '#8892b0',
            },
            {
              id: 'AboveNormal',
              name: 'Above Normal',
              desc: 'Slight prioritization over background utilities.',
              color: '#00e5ff',
            },
            {
              id: 'High',
              name: 'High (Recommended)',
              desc: 'Eliminates stutter and frame latency spikes.',
              color: '#39ff14',
            },
            {
              id: 'RealTime',
              name: 'RealTime (Extreme)',
              desc: 'Full kernel thread lock for zero-jitter input.',
              color: '#ff4444',
            },
          ].map((item) => {
            const isSelected = priority === item.id;
            return (
              <div
                key={item.id}
                id={`priority-card-${item.id.toLowerCase()}`}
                onClick={() => handlePriorityChange(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#182618] border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.25)]'
                    : 'bg-[#181822] border-[#252733] hover:border-[#39ff14]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{item.name}</span>
                    <span
                      className={`w-3 h-3 rounded-full border ${
                        isSelected
                          ? 'bg-[#39ff14] border-[#39ff14] shadow-[0_0_8px_#39ff14]'
                          : 'border-[#475569]'
                      }`}
                    ></span>
                  </div>
                  <p className="text-xs text-[#8892b0] mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CPU Core Affinity Matrix */}
      <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1f202b]">
          <div className="flex items-center space-x-3">
            <Cpu className="w-5 h-5 text-[#00e5ff]" />
            <div>
              <h3 className="text-base font-bold text-white">CPU Core Affinity Matrix</h3>
              <p className="text-xs text-[#8892b0]">
                Pins emulator rendering threads to dedicated performance cores to eliminate L3 cache thrashing.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-affinity-perf-cores"
              onClick={selectPerformanceCores}
              className="h-8 px-3 rounded-lg bg-[#182430] hover:bg-[#203040] text-[#00e5ff] border border-[#00e5ff]/50 text-xs font-bold transition-all cursor-pointer"
            >
              🚀 All Performance Cores (4-7)
            </button>
            <button
              id="btn-affinity-all-cores"
              onClick={selectAllCores}
              className="h-8 px-3 rounded-lg bg-[#181824] hover:bg-[#222233] text-white border border-[#2d2d3d] text-xs font-bold transition-all cursor-pointer"
            >
              Select All (0-7)
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {Array.from({ length: numCores }).map((_, i) => {
              const active = isCoreSelected(i);
              return (
                <div
                  key={i}
                  id={`cpu-core-chip-${i}`}
                  onClick={() => toggleCore(i)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer select-none flex flex-col items-center justify-between h-24 ${
                    active
                      ? 'bg-[#122b16] border-[#39ff14] text-[#39ff14] shadow-[0_0_12px_rgba(57,255,20,0.2)]'
                      : 'bg-[#181822] border-[#252733] text-[#64748b] hover:border-[#475569]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {i >= 4 ? 'P-Core' : 'E-Core'}
                  </span>
                  <span className="text-sm font-black font-mono text-white">CPU {i}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                      active ? 'bg-[#39ff14] text-black' : 'bg-[#252733] text-[#64748b]'
                    }`}
                  >
                    {active ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f202b] flex items-center justify-between text-xs">
            <span className="text-[#8892b0]">
              Affinity Mask (Bitmask): <strong className="font-mono text-[#00e5ff]">0x{affinityMask.toString(16).toUpperCase()} ({affinityMask})</strong>
            </span>
            <span className="text-[#39ff14] font-semibold">
              {Array.from({ length: numCores }).filter((_, i) => isCoreSelected(i)).length} Cores Allocated
            </span>
          </div>
        </div>
      </div>

      {/* Sliders Grid: ADB FPS Booster & DPI Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ADB FPS Booster */}
        <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Gauge className="w-5 h-5 text-[#39ff14]" />
                <h3 className="text-base font-bold text-white">ADB FPS Target Booster</h3>
              </div>
              {isEditingFps ? (
                <input
                  autoFocus
                  type="number"
                  value={targetFps}
                  onBlur={() => setIsEditingFps(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingFps(false)}
                  onChange={(e) => setTargetFps(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded bg-[#162b16] text-[#39ff14] font-mono font-black text-sm border border-[#39ff14] outline-none"
                />
              ) : (
                <span 
                  onClick={() => setIsEditingFps(true)}
                  className="px-3 py-1 rounded-xl bg-[#162b16] text-[#39ff14] font-mono font-black text-sm border border-[#39ff14]/60 shadow-[0_0_10px_rgba(57,255,20,0.3)] cursor-pointer hover:bg-[#1f3a1f]"
                >
                  {targetFps} FPS
                </span>
              )}
            </div>
            <p className="text-xs text-[#8892b0] mt-2">
              Injects <code className="text-[#00e5ff]">debug.sf.fps</code> and disables swapinterval for ultra smooth rendering.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <input
              ref={fpsSliderRef}
              id="slider-target-fps"
              type="range"
              min="1"
              max="5000"
              step="1"
              value={targetFps}
              onChange={(e) => setTargetFps(parseInt(e.target.value) || 1)}
              className="w-full h-2.5 bg-[#252733] rounded-lg appearance-none cursor-pointer accent-[#39ff14] hover:bg-[#2d3040] transition-all"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#64748b] flex-wrap gap-1">
              <span className="cursor-pointer hover:text-[#39ff14]" onClick={() => setTargetFps(1)}>1</span>
              <span className="cursor-pointer hover:text-[#39ff14]" onClick={() => setTargetFps(60)}>60 (Std)</span>
              <span className="cursor-pointer hover:text-[#39ff14]" onClick={() => setTargetFps(144)}>144</span>
              <span className="cursor-pointer hover:text-[#39ff14]" onClick={() => setTargetFps(240)}>240</span>
              <span className="cursor-pointer hover:text-[#39ff14]" onClick={() => setTargetFps(500)}>500</span>
              <span className="cursor-pointer hover:text-[#39ff14]" onClick={() => setTargetFps(1000)}>1000</span>
              <span className="cursor-pointer hover:text-[#39ff14]" onClick={() => setTargetFps(2500)}>2500</span>
              <span className="cursor-pointer hover:text-[#39ff14]" onClick={() => setTargetFps(5000)}>5000 (Max)</span>
            </div>

            <button
              id="btn-inject-fps-adb"
              onClick={() => onSendAdbFps(targetFps)}
              className="w-full h-10 rounded-xl bg-[#182618] hover:bg-[#203620] text-[#39ff14] border border-[#39ff14]/60 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.15)]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>INJECT FPS SYS-PROP VIA ADB</span>
            </button>
          </div>
        </div>

        {/* Android DPI Density Scaling */}
        <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Layers className="w-5 h-5 text-[#00e5ff]" />
                <h3 className="text-base font-bold text-white">Android DPI Density Scaling</h3>
              </div>
              {isEditingDpi ? (
                <input
                  autoFocus
                  type="number"
                  min="1"
                  max="5000"
                  value={dpi}
                  onBlur={() => setIsEditingDpi(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingDpi(false)}
                  onChange={(e) => setDpi(parseInt(e.target.value) || 1)}
                  className="w-24 px-2 py-1 rounded bg-[#002b30] text-[#00e5ff] font-mono font-black text-sm border border-[#00e5ff] outline-none"
                />
              ) : (
                <span 
                  onClick={() => setIsEditingDpi(true)}
                  className="px-3 py-1 rounded-xl bg-[#002b30] text-[#00e5ff] font-mono font-black text-sm border border-[#00e5ff]/60 shadow-[0_0_10px_rgba(0,229,255,0.3)] cursor-pointer hover:bg-[#003d45]"
                >
                  {dpi} DPI
                </span>
              )}
            </div>
            <p className="text-xs text-[#8892b0] mt-2">
              Modifies window manager density (<code className="text-[#00e5ff]">wm density</code>) for precise touch aim sensitivity.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <input
              ref={dpiSliderRef}
              id="slider-target-dpi"
              type="range"
              min="1"
              max="5000"
              step="1"
              value={dpi}
              onChange={(e) => setDpi(parseInt(e.target.value) || 1)}
              className="w-full h-2.5 bg-[#252733] rounded-lg appearance-none cursor-pointer accent-[#00e5ff] hover:bg-[#2d3040] transition-all"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#64748b] flex-wrap gap-1">
              <span className="cursor-pointer hover:text-[#00e5ff]" onClick={() => setDpi(1)}>1</span>
              <span className="cursor-pointer hover:text-[#00e5ff]" onClick={() => setDpi(160)}>160</span>
              <span className="cursor-pointer hover:text-[#00e5ff]" onClick={() => setDpi(240)}>240 (Std)</span>
              <span className="cursor-pointer hover:text-[#00e5ff]" onClick={() => setDpi(480)}>480</span>
              <span className="cursor-pointer hover:text-[#00e5ff]" onClick={() => setDpi(1000)}>1000</span>
              <span className="cursor-pointer hover:text-[#00e5ff]" onClick={() => setDpi(2500)}>2500</span>
              <span className="cursor-pointer hover:text-[#00e5ff]" onClick={() => setDpi(5000)}>5000 (Max)</span>
            </div>

            <button
              id="btn-apply-dpi-adb"
              onClick={() => onSendAdbDpi(dpi)}
              className="w-full h-10 rounded-xl bg-[#142630] hover:bg-[#1a3340] text-[#00e5ff] border border-[#00e5ff]/60 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.15)]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>APPLY DENSITY VIA WM COMMAND</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
