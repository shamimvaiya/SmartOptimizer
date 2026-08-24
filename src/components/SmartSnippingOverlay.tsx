import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  Copy,
  Check,
  X,
  ChevronDown,
  Sparkles,
  Maximize2,
  FileText,
  Layers,
  Palette,
  Crosshair,
} from 'lucide-react';
import { SnipData } from '../types';
import { serializeSnipData, copyToClipboard } from '../utils/serialization';

interface SmartSnippingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (snip: SnipData) => void;
  onLog?: (msg: string) => void;
}

export const SmartSnippingOverlay: React.FC<SmartSnippingOverlayProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onLog,
}) => {
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showCopyDropdown, setShowCopyDropdown] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [hoveredColor, setHoveredColor] = useState<string>('#39FF14');

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate synthetic high-tech mock desktop/game canvas backdrop so snipping yields realistic cropped graphics
  const drawBackdrop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    // Dark grid background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    // Draw cyber grid
    ctx.strokeStyle = '#151824';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw simulated emulator game view in center
    const emuX = Math.max(40, Math.floor(w / 2 - 480));
    const emuY = Math.max(40, Math.floor(h / 2 - 270));
    const emuW = 960;
    const emuH = 540;

    // Emulator frame
    ctx.fillStyle = '#0f111a';
    ctx.fillRect(emuX, emuY, emuW, emuH);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(emuX, emuY, emuW, emuH);

    // Game landscape gradient
    const grad = ctx.createLinearGradient(emuX, emuY, emuX, emuY + emuH);
    grad.addColorStop(0, '#101c38');
    grad.addColorStop(0.5, '#1e1136');
    grad.addColorStop(1, '#081a18');
    ctx.fillStyle = grad;
    ctx.fillRect(emuX, emuY, emuW, emuH);

    // Target crosshair in center
    const centerX = emuX + emuW / 2;
    const centerY = emuY + emuH / 2;
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - 48, centerY);
    ctx.lineTo(centerX + 48, centerY);
    ctx.moveTo(centerX, centerY - 48);
    ctx.lineTo(centerX, centerY + 48);
    ctx.stroke();

    // HP Bar
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(emuX + 40, emuY + emuH - 60, 220, 16);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(emuX + 40, emuY + emuH - 60, 220, 16);

    // Game HUD text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('HP: 100/100 | AMMO: 30/120', emuX + 42, emuY + emuH - 68);
    ctx.fillStyle = '#39ff14';
    ctx.fillText('FREE FIRE MAX [HD-PLAYER 144 FPS]', emuX + 30, emuY + 40);

    // Simulated loot box
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(centerX + 120, centerY + 60, 80, 50);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('LOOT CRATE', centerX + 126, centerY + 90);
  }, []);

  useEffect(() => {
    if (isOpen) {
      drawBackdrop();
      setCurrentRect(null);
      setIsSelecting(false);
      setShowCopyDropdown(false);
    }
  }, [isOpen, drawBackdrop]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Generate cropped base64 snapshot from the selected rect
  const captureCroppedImage = useCallback(
    (rect: { x: number; y: number; width: number; height: number }): string => {
      if (!canvasRef.current || rect.width <= 0 || rect.height <= 0) return '';
      const sourceCanvas = canvasRef.current;
      const offCanvas = document.createElement('canvas');
      offCanvas.width = rect.width;
      offCanvas.height = rect.height;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return '';

      offCtx.drawImage(
        sourceCanvas,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        0,
        0,
        rect.width,
        rect.height
      );

      return offCanvas.toDataURL('image/png');
    },
    []
  );

  // Mouse Handlers for Drag Selection
  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking on toolbar or buttons, do not restart drag
    if ((e.target as HTMLElement).closest('#snipping-interactive-toolbar')) {
      return;
    }
    setShowCopyDropdown(false);
    setIsSelecting(true);
    const x = e.clientX;
    const y = e.clientY;
    setStartPoint({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const currentX = e.clientX;
    const currentY = e.clientY;
    setMousePos({ x: currentX, y: currentY });

    if (isSelecting && startPoint) {
      const x = Math.min(startPoint.x, currentX);
      const y = Math.min(startPoint.y, currentY);
      const width = Math.abs(currentX - startPoint.x);
      const height = Math.abs(currentY - startPoint.y);

      setCurrentRect({ x, y, width, height });
    }
  };

  const handleMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
      if (currentRect && (currentRect.width < 10 || currentRect.height < 10)) {
        // Too small, reset
        setCurrentRect(null);
      } else if (currentRect) {
        onLog?.(`[Snipper] Area selected: X=${currentRect.x}, Y=${currentRect.y}, W=${currentRect.width}, H=${currentRect.height}`);
      }
    }
  };

  // Actions
  const handleCopyCoords = async () => {
    if (!currentRect) return;
    const text = `X:${Math.round(currentRect.x)}, Y:${Math.round(currentRect.y)}, W:${Math.round(
      currentRect.width
    )}, H:${Math.round(currentRect.height)}`;
    await copyToClipboard(text);
    showToast('Coordinates copied to clipboard!');
    setShowCopyDropdown(false);
    onLog?.(`[Clipboard] Copied raw coords: ${text}`);
  };

  const handleCopyAll = async () => {
    if (!currentRect) return;
    const base64 = captureCroppedImage(currentRect);
    const snip: SnipData = {
      x: currentRect.x,
      y: currentRect.y,
      width: currentRect.width,
      height: currentRect.height,
      imageBase64: base64,
      colorHex: hoveredColor,
    };
    const serialized = serializeSnipData(snip);
    await copyToClipboard(serialized);
    showToast('Copied full SO_DATA + Image to clipboard!');
    setShowCopyDropdown(false);
    onLog?.(`[Clipboard] Copied serialized SO_DATA (${serialized.length} chars)`);
  };

  const handleConfirm = () => {
    if (!currentRect) return;
    const base64 = captureCroppedImage(currentRect);
    const snip: SnipData = {
      x: Math.round(currentRect.x),
      y: Math.round(currentRect.y),
      width: Math.round(currentRect.width),
      height: Math.round(currentRect.height),
      imageBase64: base64,
      colorHex: hoveredColor,
      timestamp: new Date().toISOString(),
    };
    onConfirm(snip);
    onLog?.(`[Snipper] Confirmed snip: X=${snip.x} Y=${snip.y} W=${snip.width} H=${snip.height}`);
    onClose();
  };

  if (!isOpen) return null;

  const rect = currentRect;

  return (
    <div
      ref={containerRef}
      id="smart-snipping-fullscreen-overlay"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="fixed inset-0 z-[100] cursor-crosshair select-none overflow-hidden bg-black/60 backdrop-blur-[2px]"
      style={{ userSelect: 'none' }}
    >
      {/* Background Canvas (Capturable frame) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />

      {/* Dimmed backdrop with cutout for selected rectangle */}
      {rect && rect.width > 0 && rect.height > 0 ? (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="snip-mask">
              {/* White fills everything (opaque mask) */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black cutout makes selection clear */}
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                fill="black"
              />
            </mask>
          </defs>
          {/* Semi-transparent dark overlay through mask */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.65)"
            mask="url(#snip-mask)"
          />
        </svg>
      ) : (
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      )}

      {/* Top Banner Guide */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl bg-[#0e0e14]/90 border border-[#39ff14]/70 shadow-[0_0_20px_rgba(57,255,20,0.3)] flex items-center space-x-3 pointer-events-none z-10 backdrop-blur-md">
        <Crop className="w-4 h-4 text-[#39ff14] animate-spin" />
        <span className="text-xs font-black text-white tracking-wide">
          SMART SNIPPER: Drag mouse to capture emulator / screen area
        </span>
        <span className="text-[11px] font-mono text-[#8892b0] bg-[#1a1a24] px-2 py-0.5 rounded border border-[#252733]">
          [ESC to Exit]
        </span>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-[#162b16] border-2 border-[#39ff14] text-[#39ff14] text-xs font-black flex items-center space-x-2 shadow-[0_0_20px_rgba(57,255,20,0.5)] z-50 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Selected Box Border & Handles */}
      {rect && rect.width > 0 && rect.height > 0 && (
        <div
          id="snipping-selected-region-box"
          style={{
            left: `${rect.x}px`,
            top: `${rect.y}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          }}
          className="absolute border-2 border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.6),inset_0_0_10px_rgba(57,255,20,0.2)] pointer-events-none"
        >
          {/* Corner Resizing Handles */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#39ff14] rounded-xs shadow-[0_0_6px_#39ff14]" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#39ff14] rounded-xs shadow-[0_0_6px_#39ff14]" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#39ff14] rounded-xs shadow-[0_0_6px_#39ff14]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#39ff14] rounded-xs shadow-[0_0_6px_#39ff14]" />

          {/* Real-time Neon Statistics Badge attached to box with Boundary-Aware positioning */}
          {(() => {
            const screenW = typeof window !== 'undefined' ? window.innerWidth : 1920;
            const screenH = typeof window !== 'undefined' ? window.innerHeight : 1080;
            const badgeHeight = 32;
            const badgeWidth = 220;

            // Vertical position calculation: move below if top edge would clip, or inside if bottom clips
            let badgeTop = -36;
            if (rect.y < 40) {
              badgeTop = rect.height + 8;
            }
            if (rect.y + badgeTop + badgeHeight > screenH) {
              badgeTop = Math.max(8, rect.height - 40);
            }

            // Horizontal shift calculation
            let badgeLeft = 0;
            if (rect.x + badgeWidth > screenW - 10) {
              badgeLeft = Math.max(-rect.x + 10, screenW - rect.x - badgeWidth - 10);
            }

            return (
              <div
                className="absolute px-2.5 py-1 rounded-md bg-[#0a0a0f]/95 border border-[#39ff14] text-[#39ff14] font-mono text-[11px] font-black tracking-wider flex items-center space-x-2 shadow-[0_0_10px_rgba(57,255,20,0.4)] whitespace-nowrap z-50 pointer-events-auto"
                style={{
                  top: `${badgeTop}px`,
                  left: `${badgeLeft}px`,
                }}
              >
                <span>X: {Math.round(rect.x)}</span>
                <span className="text-[#64748b]">|</span>
                <span>Y: {Math.round(rect.y)}</span>
                <span className="text-[#64748b]">|</span>
                <span>W: {Math.round(rect.width)}</span>
                <span className="text-[#64748b]">|</span>
                <span>H: {Math.round(rect.height)}</span>
              </div>
            );
          })()}
        </div>
      )}

      {/* Floating Interactive Toolbar attached with Boundary-Aware Positioning */}
      {rect && rect.width >= 20 && rect.height >= 20 && !isSelecting && (
        {...(() => {
          const screenW = typeof window !== 'undefined' ? window.innerWidth : 1920;
          const screenH = typeof window !== 'undefined' ? window.innerHeight : 1080;
          const toolbarWidth = 290;
          const toolbarHeight = 52;

          // Vertical boundary check: if bottom edge pushes toolbar off-screen, render above selection
          let targetTop = rect.y + rect.height + 10;
          if (targetTop + toolbarHeight > screenH - 10) {
            targetTop = rect.y - toolbarHeight - 10;
          }
          // If top also goes off-screen, clamp within visible screen
          targetTop = Math.max(10, Math.min(screenH - toolbarHeight - 10, targetTop));

          // Horizontal boundary check: if right edge pushes toolbar off-screen, align to left side of selection
          let targetLeft = rect.x + rect.width - 240;
          if (targetLeft + toolbarWidth > screenW - 10) {
            targetLeft = rect.x; // Align to left side of selection
          }
          // Clamp left position safely within viewport
          targetLeft = Math.max(10, Math.min(screenW - toolbarWidth - 10, targetLeft));

          return (
            <div
              id="snipping-interactive-toolbar"
              style={{
                left: `${targetLeft}px`,
                top: `${targetTop}px`,
              }}
              className="absolute z-50 flex items-center space-x-1.5 p-1.5 bg-[#0f1017]/95 border-2 border-[#39ff14] rounded-xl shadow-[0_0_25px_rgba(57,255,20,0.4)] backdrop-blur-md"
            >
          {/* Copy Dropdown Button */}
          <div className="relative">
            <button
              id="btn-snip-copy-menu"
              onClick={(e) => {
                e.stopPropagation();
                setShowCopyDropdown((prev) => !prev);
              }}
              className="h-8 px-2.5 rounded-lg bg-[#162b16] hover:bg-[#203f20] text-[#39ff14] border border-[#39ff14]/70 text-xs font-black flex items-center space-x-1 cursor-pointer transition-all shadow-[0_0_8px_rgba(57,255,20,0.2)]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {/* Dropdown Options */}
            {showCopyDropdown && (
              <div className="absolute bottom-10 left-0 w-44 bg-[#14141c] border border-[#39ff14] rounded-xl shadow-2xl p-1.5 space-y-1 z-50">
                <button
                  id="btn-snip-copy-coords"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCoords();
                  }}
                  className="w-full h-8 px-2.5 rounded-lg hover:bg-[#1f202b] text-left text-xs font-bold text-[#00e5ff] flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Copy Coords Only</span>
                </button>
                <button
                  id="btn-snip-copy-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyAll();
                  }}
                  className="w-full h-8 px-2.5 rounded-lg hover:bg-[#162b16] text-left text-xs font-black text-[#39ff14] flex items-center space-x-2 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Copy All (SO_DATA + Img)</span>
                </button>
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <button
            id="btn-snip-confirm"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm();
            }}
            className="h-8 px-3.5 rounded-lg bg-[#39ff14] hover:bg-[#32e012] text-black font-black text-xs flex items-center space-x-1.5 cursor-pointer shadow-[0_0_12px_rgba(57,255,20,0.6)] transition-all hover:scale-105"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Confirm</span>
          </button>

          {/* Cancel Button */}
          <button
            id="btn-snip-cancel"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="h-8 px-2.5 rounded-lg bg-[#241416] hover:bg-[#34181b] text-[#ff4444] border border-[#ff4444]/60 text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
          );
        })()}
      )}
    </div>
  );
};
