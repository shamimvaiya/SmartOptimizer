import React, { useState, useEffect, useRef } from 'react';
import { CrosshairConfig, CrosshairDesign } from '../types';
import { CROSSHAIR_DESIGNS } from '../data/crosshairCatalog';
import { CrosshairRenderer } from './CrosshairRenderer';
import {
  Lock,
  Unlock,
  Move,
  X,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sliders,
  Target,
} from 'lucide-react';

interface ScreenCrosshairOverlayProps {
  config: CrosshairConfig;
  onUpdateOffset?: (offsetX: number, offsetY: number) => void;
  isEmulatorRunning?: boolean;
}

export const ScreenCrosshairOverlay: React.FC<ScreenCrosshairOverlayProps> = ({
  config,
  onUpdateOffset,
  isEmulatorRunning = false,
}) => {
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [stepSize, setStepSize] = useState<number>(1); // 1px or 5px increments
  const [localOffset, setLocalOffset] = useState<{ x: number; y: number }>({
    x: config.customSettings.offsetX || 0,
    y: config.customSettings.offsetY || 0,
  });

  useEffect(() => {
    setLocalOffset({
      x: config.customSettings.offsetX || 0,
      y: config.customSettings.offsetY || 0,
    });
  }, [config.customSettings.offsetX, config.customSettings.offsetY]);

  const activeDesign =
    CROSSHAIR_DESIGNS.find((d) => d.id === config.selectedDesignId) ||
    CROSSHAIR_DESIGNS[0];

  const handleNudge = (dx: number, dy: number) => {
    const nextX = localOffset.x + dx;
    const nextY = localOffset.y + dy;
    setLocalOffset({ x: nextX, y: nextY });
    if (onUpdateOffset) {
      onUpdateOffset(nextX, nextY);
    }
  };

  const handleResetCenter = () => {
    setLocalOffset({ x: 0, y: 0 });
    if (onUpdateOffset) {
      onUpdateOffset(0, 0);
    }
  };

  // If not enabled or not activated to emulator, do not show
  if (!config.isEnabled || !config.isActivatedToEmulator) {
    return null;
  }

  return (
    <div
      id="screen-crosshair-overlay-root"
      className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center select-none"
    >
      {/* Centered Crosshair Container with Calibrated Offsets */}
      <div
        style={{
          transform: `translate(${localOffset.x}px, ${localOffset.y}px)`,
        }}
        className="relative flex items-center justify-center pointer-events-auto"
      >
        <CrosshairRenderer
          design={activeDesign}
          customSettings={{
            ...config.customSettings,
            offsetX: localOffset.x,
            offsetY: localOffset.y,
          }}
          showGlow={true}
        />

        {/* Small Calibrate Trigger Badge (Visible on hover or when calibrating) */}
        <button
          onClick={() => setIsCalibrating((prev) => !prev)}
          className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center space-x-1 transition-all cursor-pointer shadow-lg border ${
            isCalibrating
              ? 'bg-[#162b16] text-[#39ff14] border-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.5)]'
              : 'bg-black/80 text-[#8892b0] hover:text-[#39ff14] border-[#222538] hover:border-[#39ff14]/50 opacity-20 hover:opacity-100'
          }`}
          title="ম্যানুয়াল এইম অফসেট এডজাস্টমেন্ট (Manual Aim Nudge/Calibration)"
        >
          <Sliders className="w-2.5 h-2.5" />
          <span>{isCalibrating ? 'CALIBRATING' : `OFFSET: (${localOffset.x > 0 ? `+${localOffset.x}` : localOffset.x}, ${localOffset.y > 0 ? `+${localOffset.y}` : localOffset.y})`}</span>
        </button>

        {/* Floating Micro-Nudge HUD Control Box */}
        {isCalibrating && (
          <div
            className="absolute top-10 left-1/2 -translate-x-1/2 p-3 rounded-2xl bg-[#0c0d14]/95 backdrop-blur-md border border-[#39ff14]/70 shadow-[0_0_25px_rgba(0,0,0,0.8)] text-white w-56 flex flex-col items-center space-y-2.5 animate-in fade-in zoom-in duration-150 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between border-b border-[#1e2235] pb-1.5">
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-[#39ff14]">
                <Target className="w-3 h-3" />
                <span>ম্যানুয়াল এইম এডজাস্টার</span>
              </div>
              <button
                onClick={() => setIsCalibrating(false)}
                className="text-[#8892b0] hover:text-white p-0.5 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Current Offset Coordinates Display */}
            <div className="flex items-center justify-between w-full px-2 py-1 rounded-lg bg-[#141624] border border-[#23273c] text-[11px] font-mono font-bold">
              <span className="text-[#8892b0]">X: <span className="text-[#39ff14]">{localOffset.x > 0 ? `+${localOffset.x}` : localOffset.x}px</span></span>
              <span className="text-[#8892b0]">Y: <span className="text-[#00e5ff]">{localOffset.y > 0 ? `+${localOffset.y}` : localOffset.y}px</span></span>
            </div>

            {/* Step Size Selector (1px vs 5px) */}
            <div className="flex items-center space-x-1 w-full justify-center">
              <span className="text-[9px] text-[#8892b0] mr-1">স্টেপ:</span>
              {[1, 5, 10].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setStepSize(sz)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    stepSize === sz
                      ? 'bg-[#39ff14] text-black shadow-[0_0_8px_rgba(57,255,20,0.4)]'
                      : 'bg-[#181a28] text-[#8892b0] hover:text-white border border-[#25283e]'
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>

            {/* 4-Directional D-Pad Micro Nudge Buttons */}
            <div className="grid grid-cols-3 gap-1 w-28 my-1">
              <div></div>
              <button
                id="btn-crosshair-nudge-up"
                onClick={() => handleNudge(0, -stepSize)}
                className="h-8 rounded-lg bg-[#1a1c2c] hover:bg-[#252840] text-[#39ff14] border border-[#39ff14]/40 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-[0_0_6px_rgba(57,255,20,0.15)]"
                title={`Up ${stepSize}px`}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <div></div>

              <button
                id="btn-crosshair-nudge-left"
                onClick={() => handleNudge(-stepSize, 0)}
                className="h-8 rounded-lg bg-[#1a1c2c] hover:bg-[#252840] text-[#39ff14] border border-[#39ff14]/40 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-[0_0_6px_rgba(57,255,20,0.15)]"
                title={`Left ${stepSize}px`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                id="btn-crosshair-center-reset"
                onClick={handleResetCenter}
                className="h-8 rounded-lg bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] flex items-center justify-center text-[9px] font-mono font-black transition-all cursor-pointer"
                title="Reset to Perfect Center (0, 0)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              <button
                id="btn-crosshair-nudge-right"
                onClick={() => handleNudge(stepSize, 0)}
                className="h-8 rounded-lg bg-[#1a1c2c] hover:bg-[#252840] text-[#39ff14] border border-[#39ff14]/40 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-[0_0_6px_rgba(57,255,20,0.15)]"
                title={`Right ${stepSize}px`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div></div>
              <button
                id="btn-crosshair-nudge-down"
                onClick={() => handleNudge(0, stepSize)}
                className="h-8 rounded-lg bg-[#1a1c2c] hover:bg-[#252840] text-[#39ff14] border border-[#39ff14]/40 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-[0_0_6px_rgba(57,255,20,0.15)]"
                title={`Down ${stepSize}px`}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <div></div>
            </div>

            {/* Quick Auto-Center Reset Button */}
            <button
              onClick={handleResetCenter}
              className="w-full h-7 rounded-lg bg-[#141926] hover:bg-[#1e2538] text-[#00e5ff] border border-[#00e5ff]/40 text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>অটো-সেন্টার রিসেট (০, ০)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

