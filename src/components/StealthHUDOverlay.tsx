import React, { useState, useEffect, useRef } from 'react';
import {
  Tv,
  Cpu,
  Flame,
  X,
  Move,
  EyeOff,
  Radio,
  ShieldCheck,
  Minimize2,
  Terminal,
  ChevronDown,
  ChevronUp,
  Square,
  Sparkles,
  Zap,
} from 'lucide-react';
import { TelemetryData } from '../types';

interface StealthHUDOverlayProps {
  telemetry: TelemetryData | null;
  activePresetName: string;
  isOpen: boolean;
  onClose: () => void;
  autoHideEnabled: boolean;
  hotkey: string;
  logs?: string[];
  isMacroActive?: boolean;
  activeMacroName?: string;
  onStopMacroProcess?: () => void;
  onSaveHotkey?: (newHotkey: string) => void;
}

export const StealthHUDOverlay: React.FC<StealthHUDOverlayProps> = ({
  telemetry,
  activePresetName,
  isOpen,
  onClose,
  autoHideEnabled,
  hotkey,
  logs = [],
  isMacroActive = true,
  activeMacroName = 'Recoil & Humanizer AI Engine',
  onStopMacroProcess,
  onSaveHotkey,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 24, y: 80 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDimmed, setIsDimmed] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showMiniTerminal, setShowMiniTerminal] = useState<boolean>(false);

  // Session Hotkey Recording state inside HUD
  const [currentHotkey, setCurrentHotkey] = useState<string>(hotkey);
  const [isRecordingHotkey, setIsRecordingHotkey] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    setCurrentHotkey(hotkey);
  }, [hotkey]);

  // Auto-hide countdown
  useEffect(() => {
    if (!autoHideEnabled || !isOpen || isHovered || showMiniTerminal || isRecordingHotkey) {
      setIsDimmed(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(() => {
      setIsDimmed(true);
    }, 4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoHideEnabled, isOpen, isHovered, showMiniTerminal, isRecordingHotkey]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(10, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x)),
          y: Math.max(10, Math.min(window.innerHeight - 180, e.clientY - dragOffset.y)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleKeyDownHotkeyRecord = (e: React.KeyboardEvent) => {
    if (!isRecordingHotkey) return;
    e.preventDefault();
    e.stopPropagation();

    let key = e.key.toUpperCase();
    if (key === ' ') key = 'SPACE';
    if (key === 'ESCAPE') key = 'ESC';

    setCurrentHotkey(key);
    setIsRecordingHotkey(false);
    if (onSaveHotkey) {
      onSaveHotkey(key);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="stealth-hud-overlay-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: isDimmed ? 0.35 : 0.96,
      }}
      className={`fixed z-50 select-none transition-opacity duration-300 ${
        isDimmed ? 'scale-90 hover:scale-100 hover:opacity-100' : ''
      }`}
    >
      <div className="w-80 rounded-2xl bg-[#0d0d12]/95 backdrop-blur-md border-2 border-[#39ff14] shadow-[0_0_25px_rgba(57,255,20,0.4)] overflow-hidden breathing-glow">
        {/* Drag Bar Header */}
        <div
          onMouseDown={handleMouseDown}
          className="h-9 px-3 bg-[#162b16] border-b border-[#39ff14]/40 flex items-center justify-between cursor-move"
        >
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#39ff14] animate-pulse"></span>
            <span className="text-xs font-black text-[#39ff14] tracking-wider">
              AIM/OPT STEALTH HUD
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {/* Terminal Toggle Icon */}
            <button
              onClick={() => setShowMiniTerminal((prev) => !prev)}
              className={`p-1 rounded cursor-pointer transition-colors ${
                showMiniTerminal
                  ? 'bg-[#39ff14] text-black'
                  : 'text-[#8892b0] hover:text-[#00e5ff] hover:bg-[#15242b]'
              }`}
              title="Toggle Live In-Game Terminal Logs"
            >
              <Terminal className="w-3.5 h-3.5" />
            </button>

            {/* Double-Click Session Hotkey Recorder Badge */}
            <span
              tabIndex={0}
              onDoubleClick={() => setIsRecordingHotkey(true)}
              onKeyDown={handleKeyDownHotkeyRecord}
              onBlur={() => setIsRecordingHotkey(false)}
              className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded border cursor-pointer select-none transition-all ${
                isRecordingHotkey
                  ? 'bg-[#182a18] text-[#39ff14] border-[#39ff14] animate-pulse'
                  : 'bg-[#101016] text-[#8892b0] border-[#252733] hover:text-[#39ff14]'
              }`}
              title="Double-click to change HUD hotkey"
            >
              {isRecordingHotkey ? 'KEY?' : currentHotkey}
            </span>

            <button
              id="btn-close-hud"
              onClick={onClose}
              className="p-1 text-[#8892b0] hover:text-[#ff4444] rounded hover:bg-[#201416] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* NEON MARQUEE ACTIVE MACRO BAR & END PROCESS BUTTON */}
        {isMacroActive && (
          <div className="px-3 py-1.5 bg-[#0a180a] border-b border-[#39ff14]/30 flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-[#39ff14] shrink-0 animate-ping" />
              <div className="overflow-hidden whitespace-nowrap text-[11px] font-mono font-bold text-[#39ff14]">
                <div className="inline-block animate-marquee">
                  ⚡ ACTIVE MACRO: {activeMacroName} &nbsp;●&nbsp; DIRECTINPUT HOOK ARMED &nbsp;●&nbsp; BÉZIER HUMANIZER 100% ACTIVE
                </div>
              </div>
            </div>

            {/* END PROCESS / STOP MACRO SESSION BUTTON */}
            <button
              id="btn-stop-macro-session-hud"
              onClick={onStopMacroProcess}
              className="px-2 py-0.5 rounded-md bg-[#2a1416] hover:bg-[#3d181b] text-[#ff4444] border border-[#ff4444]/60 font-black text-[10px] flex items-center space-x-1 shrink-0 cursor-pointer shadow-[0_0_8px_rgba(255,68,68,0.3)]"
              title="Terminate running macro process"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>END</span>
            </button>
          </div>
        )}

        {/* Telemetry Display */}
        <div className="p-3.5 space-y-2.5">
          {/* Main FPS Banner */}
          <div className="flex items-center justify-between bg-[#121218] p-2.5 rounded-xl border border-[#252733]">
            <div className="text-[11px] font-bold text-[#8892b0]">GAME REFRESH</div>
            <div className="text-xl font-black text-[#39ff14] font-mono drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">
              {telemetry?.isEmulatorRunning ? `${telemetry.currentFps} FPS` : '144 FPS'}
            </div>
          </div>

          {/* CPU & RAM Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#121218] p-2 rounded-xl border border-[#252733] flex flex-col">
              <span className="text-[9px] font-bold text-[#64748b] uppercase">CPU LOAD</span>
              <span className="text-sm font-bold text-[#00e5ff] font-mono mt-0.5">
                {telemetry ? `${telemetry.cpuPercentage}%` : '12%'}
              </span>
            </div>

            <div className="bg-[#121218] p-2 rounded-xl border border-[#252733] flex flex-col">
              <span className="text-[9px] font-bold text-[#64748b] uppercase">RAM FLUSHED</span>
              <span className="text-sm font-bold text-[#d500f9] font-mono mt-0.5">
                {telemetry ? `${telemetry.ramUsageMb} MB` : '1980 MB'}
              </span>
            </div>
          </div>

          {/* Expandable Live Terminal Drawer */}
          {showMiniTerminal && (
            <div className="p-2.5 rounded-xl bg-[#06070a] border border-[#26283d] space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#00e5ff] border-b border-[#181a28] pb-1">
                <span className="flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  <span>LIVE INJECTOR LOGS</span>
                </span>
                <span className="text-[9px] text-[#64748b]">{logs.length} events</span>
              </div>
              <div className="h-28 overflow-y-auto font-mono text-[10px] text-[#39ff14] space-y-1 pr-1">
                {logs.length > 0 ? (
                  logs.slice(-6).map((log, idx) => (
                    <div key={idx} className="leading-tight break-all text-[9.5px]">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-[#64748b] italic">No active logs recorded yet.</div>
                )}
              </div>
            </div>
          )}

          {/* Profile & Status Footer */}
          <div className="pt-2 border-t border-[#1f202b] flex items-center justify-between text-[10px]">
            <span className="text-[#8892b0] truncate max-w-[150px] font-semibold">
              Profile: <strong className="text-white">{activePresetName}</strong>
            </span>
            <span className="text-[#39ff14] font-extrabold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#39ff14]" />
              HOOKED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
