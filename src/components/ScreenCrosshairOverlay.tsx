import React, { useState, useEffect, useRef } from 'react';
import { CrosshairConfig } from '../types';
import { CROSSHAIR_DESIGNS } from '../data/crosshairCatalog';
import { CrosshairRenderer } from './CrosshairRenderer';
import {
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Target,
  GripHorizontal,
} from 'lucide-react';

interface ScreenCrosshairOverlayProps {
  config: CrosshairConfig;
  onUpdateOffset?: (offsetX: number, offsetY: number) => void;
  isEmulatorRunning?: boolean;
}

export const ScreenCrosshairOverlay: React.FC<ScreenCrosshairOverlayProps> = ({
  config,
  onUpdateOffset,
}) => {
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [stepSize, setStepSize] = useState<number>(1); // 1px or 5px increments
  const [localOffset, setLocalOffset] = useState<{ x: number; y: number }>({
    x: config.customSettings.offsetX || 0,
    y: config.customSettings.offsetY || 0,
  });

  // Draggable position for the calibration popup window (independent of crosshair offset)
  const [hudPos, setHudPos] = useState<{ x: number; y: number }>({ x: 0, y: 70 });
  const isDraggingHudRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; hudX: number; hudY: number }>({
    mouseX: 0,
    mouseY: 0,
    hudX: 0,
    hudY: 70,
  });

  // Rapid click detection to toggle calibration HUD (2-3 clicks)
  const clickTimestampsRef = useRef<number[]>([]);

  useEffect(() => {
    setLocalOffset({
      x: config.customSettings.offsetX || 0,
      y: config.customSettings.offsetY || 0,
    });
  }, [config.customSettings.offsetX, config.customSettings.offsetY]);

  // Close calibration on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCalibrating) {
        setIsCalibrating(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCalibrating]);

  // Window drag listeners (global mouse move/up)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingHudRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setHudPos({
        x: dragStartRef.current.hudX + dx,
        y: dragStartRef.current.hudY + dy,
      });
    };

    const handleMouseUp = () => {
      isDraggingHudRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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

  // Crosshair Rapid Click Handler (2-3 fast clicks activates calibration HUD)
  const handleCrosshairClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If already calibrating, do not re-accumulate
    if (isCalibrating) return;

    const now = Date.now();
    // Keep clicks occurring within the last 1200ms
    const recent = clickTimestampsRef.current.filter((t) => now - t < 1200);
    recent.push(now);
    clickTimestampsRef.current = recent;

    // Trigger on 2 or 3 rapid clicks
    if (recent.length >= 2) {
      setIsCalibrating(true);
      clickTimestampsRef.current = [];
    }
  };

  // Start dragging the Calibration Window
  const handleStartDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingHudRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      hudX: hudPos.x,
      hudY: hudPos.y,
    };
  };

  // If not enabled or not activated to emulator, do not show
  if (!config.isEnabled || !config.isActivatedToEmulator) {
    return null;
  }

  const crosshairSize = config.customSettings.size || activeDesign.size || 32;
  const clickAreaSize = Math.max(crosshairSize + 16, 44);

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
        {/* Clickable Hitbox surrounding the Crosshair (Clean default cursor without browser hover tooltip) */}
        <div
          onClick={handleCrosshairClick}
          style={{ width: `${clickAreaSize}px`, height: `${clickAreaSize}px` }}
          className="relative flex items-center justify-center cursor-default rounded-full"
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
        </div>
      </div>

      {/* Floating Draggable Micro-Nudge HUD Control Window (Independent coordinate layer) */}
      {isCalibrating && (
        <div
          style={{
            transform: `translate(${hudPos.x}px, ${hudPos.y}px)`,
          }}
          className="fixed p-3.5 rounded-2xl bg-[#0c0d14]/98 backdrop-blur-xl border-2 border-[#39ff14] shadow-[0_0_35px_rgba(57,255,20,0.35)] text-white w-64 flex flex-col items-center space-y-3 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto z-50 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Draggable Header with Title & Close (X) Button */}
          <div
            onMouseDown={handleStartDrag}
            className="w-full flex items-center justify-between border-b border-[#23273c] pb-2 cursor-grab active:cursor-grabbing hover:bg-white/[0.02] -mx-1 px-1 rounded-t-xl transition-colors"
            title="ড্র্যাগ করে উইন্ডোটি যেকোনো জায়গায় সরান (Drag to move window)"
          >
            <div className="flex items-center space-x-1.5 text-xs font-black text-[#39ff14] font-mono">
              <GripHorizontal className="w-3.5 h-3.5 text-[#8892b0]" />
              <Target className="w-3.5 h-3.5" />
              <span>ম্যানুয়াল এইম এডজাস্টার</span>
            </div>
            <button
              id="btn-close-aim-calibrator"
              onClick={() => setIsCalibrating(false)}
              className="w-6 h-6 rounded-lg bg-[#181a28] hover:bg-[#ff3b30]/20 text-[#8892b0] hover:text-[#ff3b30] border border-[#2d3148] hover:border-[#ff3b30]/60 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Offset Coordinates Display */}
          <div className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-xl bg-[#141624] border border-[#23273c] text-xs font-mono font-bold">
            <div className="flex items-center space-x-1">
              <span className="text-[#8892b0]">X:</span>
              <span className="text-[#39ff14]">
                {localOffset.x > 0 ? `+${localOffset.x}` : localOffset.x}px
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-[#8892b0]">Y:</span>
              <span className="text-[#00e5ff]">
                {localOffset.y > 0 ? `+${localOffset.y}` : localOffset.y}px
              </span>
            </div>
          </div>

          {/* Step Size Selector (1px, 5px, 10px) */}
          <div className="flex items-center space-x-1.5 w-full justify-between px-1">
            <span className="text-[10px] text-[#8892b0] font-mono">স্টেপ সাইজ:</span>
            <div className="flex items-center space-x-1">
              {[1, 5, 10].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setStepSize(sz)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    stepSize === sz
                      ? 'bg-[#39ff14] text-black shadow-[0_0_10px_rgba(57,255,20,0.4)]'
                      : 'bg-[#181a28] text-[#8892b0] hover:text-white border border-[#25283e]'
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>
          </div>

          {/* 4-Directional D-Pad Micro Nudge Buttons */}
          <div className="grid grid-cols-3 gap-1.5 w-32 my-1">
            <div></div>
            <button
              id="btn-crosshair-nudge-up"
              onClick={() => handleNudge(0, -stepSize)}
              className="h-8 rounded-lg bg-[#1a1c2c] hover:bg-[#252840] text-[#39ff14] border border-[#39ff14]/40 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-[0_0_6px_rgba(57,255,20,0.15)]"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <div></div>

            <button
              id="btn-crosshair-nudge-left"
              onClick={() => handleNudge(-stepSize, 0)}
              className="h-8 rounded-lg bg-[#1a1c2c] hover:bg-[#252840] text-[#39ff14] border border-[#39ff14]/40 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-[0_0_6px_rgba(57,255,20,0.15)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              id="btn-crosshair-center-reset"
              onClick={handleResetCenter}
              className="h-8 rounded-lg bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] flex items-center justify-center text-[9px] font-mono font-black transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-crosshair-nudge-right"
              onClick={() => handleNudge(stepSize, 0)}
              className="h-8 rounded-lg bg-[#1a1c2c] hover:bg-[#252840] text-[#39ff14] border border-[#39ff14]/40 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-[0_0_6px_rgba(57,255,20,0.15)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div></div>
            <button
              id="btn-crosshair-nudge-down"
              onClick={() => handleNudge(0, stepSize)}
              className="h-8 rounded-lg bg-[#1a1c2c] hover:bg-[#252840] text-[#39ff14] border border-[#39ff14]/40 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-[0_0_6px_rgba(57,255,20,0.15)]"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <div></div>
          </div>

          {/* Bottom Actions */}
          <div className="w-full flex items-center space-x-2 pt-1">
            <button
              onClick={handleResetCenter}
              className="flex-1 h-8 rounded-xl bg-[#141926] hover:bg-[#1e2538] text-[#00e5ff] border border-[#00e5ff]/40 text-[10px] font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
              <span>সেন্টার রিসেট (০,০)</span>
            </button>

            <button
              onClick={() => setIsCalibrating(false)}
              className="px-3 h-8 rounded-xl bg-[#162b16] hover:bg-[#1e3c1e] text-[#39ff14] border border-[#39ff14]/60 text-[10px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all active:scale-95"
            >
              <span>ডান (Done)</span>
            </button>
          </div>

          {/* Drag & Hide Tip */}
          <p className="text-[9px] text-[#8892b0] text-center font-mono">
            হেডার ধরে ড্র্যাগ করে যেকোনো জায়গায় সরান
          </p>
        </div>
      )}
    </div>
  );
};



