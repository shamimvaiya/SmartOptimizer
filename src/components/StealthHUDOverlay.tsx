import React, { useState, useEffect, useRef } from 'react';
import { Tv, Cpu, Flame, X, Move, EyeOff, Radio, ShieldCheck, Minimize2 } from 'lucide-react';
import { TelemetryData } from '../types';

interface StealthHUDOverlayProps {
  telemetry: TelemetryData | null;
  activePresetName: string;
  isOpen: boolean;
  onClose: () => void;
  autoHideEnabled: boolean;
  hotkey: string;
}

export const StealthHUDOverlay: React.FC<StealthHUDOverlayProps> = ({
  telemetry,
  activePresetName,
  isOpen,
  onClose,
  autoHideEnabled,
  hotkey,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 24, y: 80 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDimmed, setIsDimmed] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const timerRef = useRef<any>(null);

  // Auto-hide countdown
  useEffect(() => {
    if (!autoHideEnabled || !isOpen || isHovered) {
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
  }, [autoHideEnabled, isOpen, isHovered]);

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
      <div className="w-72 rounded-2xl bg-[#0d0d12]/95 backdrop-blur-md border-2 border-[#39ff14] shadow-[0_0_25px_rgba(57,255,20,0.4)] overflow-hidden breathing-glow">
        {/* Drag Bar Header */}
        <div
          onMouseDown={handleMouseDown}
          className="h-9 px-3 bg-[#162b16] border-b border-[#39ff14]/40 flex items-center justify-between cursor-move"
        >
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse"></span>
            <span className="text-xs font-black text-[#39ff14] tracking-wider">
              AIM/OPT STEALTH HUD
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-mono text-[#8892b0] bg-[#101016] px-1.5 py-0.5 rounded border border-[#252733]">
              {hotkey}
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

          {/* Profile & Status Footer */}
          <div className="pt-2 border-t border-[#1f202b] flex items-center justify-between text-[10px]">
            <span className="text-[#8892b0] truncate max-w-[140px] font-semibold">
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
