import React, { useState } from 'react';
import {
  Crop,
  ClipboardPaste,
  Copy,
  Eye,
  Sliders,
  Sparkles,
  Check,
  Crosshair,
  Maximize2,
  FileCode,
  Layers,
  Palette,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { SnipData, VisualProcessingConfig } from '../types';
import { parseSnipData, serializeSnipData, copyToClipboard, readFromClipboard } from '../utils/serialization';

interface CalibrationViewProps {
  activeSnip: SnipData | null;
  onSnipChange: (snip: SnipData) => void;
  onOpenSnipper: () => void;
  visualConfig: VisualProcessingConfig;
  onSaveVisualConfig: (config: VisualProcessingConfig) => Promise<void>;
  onLog: (msg: string) => void;
}

export const CalibrationView: React.FC<CalibrationViewProps> = ({
  activeSnip,
  onSnipChange,
  onOpenSnipper,
  visualConfig,
  onSaveVisualConfig,
  onLog,
}) => {
  const [posX, setPosX] = useState<number>(activeSnip?.x ?? visualConfig.captureRegionX ?? 860);
  const [posY, setPosY] = useState<number>(activeSnip?.y ?? visualConfig.captureRegionY ?? 440);
  const [posW, setPosW] = useState<number>(activeSnip?.width ?? visualConfig.captureRegionWidth ?? 200);
  const [posH, setPosH] = useState<number>(activeSnip?.height ?? visualConfig.captureRegionHeight ?? 200);
  const [tolerance, setTolerance] = useState<number>(visualConfig.colorTolerance ?? 15);
  const [targetColor, setTargetColor] = useState<string>(activeSnip?.colorHex ?? '#39FF14');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [rawClipboardInput, setRawClipboardInput] = useState<string>('');

  // Sync state if activeSnip updates from Snipper
  React.useEffect(() => {
    if (activeSnip) {
      setPosX(activeSnip.x);
      setPosY(activeSnip.y);
      setPosW(activeSnip.width);
      setPosH(activeSnip.height);
      if (activeSnip.colorHex) setTargetColor(activeSnip.colorHex);
    }
  }, [activeSnip]);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  // The Master Paste handler
  const handleMasterPaste = async () => {
    try {
      const text = await readFromClipboard();
      const payload = text || rawClipboardInput;

      if (!payload) {
        showStatus('Clipboard is empty! Use Snipper Copy or paste manually.');
        return;
      }

      const parsed = parseSnipData(payload);
      if (parsed) {
        setPosX(parsed.x);
        setPosY(parsed.y);
        setPosW(parsed.width);
        setPosH(parsed.height);
        if (parsed.colorHex) setTargetColor(parsed.colorHex);

        const updatedSnip: SnipData = {
          x: parsed.x,
          y: parsed.y,
          width: parsed.width,
          height: parsed.height,
          imageBase64: parsed.imageBase64 || activeSnip?.imageBase64,
          colorHex: parsed.colorHex || targetColor,
          timestamp: new Date().toISOString(),
        };

        onSnipChange(updatedSnip);
        showStatus('Master Paste Successful! Populated X, Y, W, H & Preview.');
        onLog(
          `[Master Paste] Parsed SO_DATA payload: X=${parsed.x}, Y=${parsed.y}, W=${parsed.width}, H=${parsed.height}`
        );
      } else {
        showStatus('Clipboard does not contain valid SO_DATA or coords format.');
      }
    } catch (err) {
      console.error('Master paste error:', err);
      showStatus('Failed to read clipboard.');
    }
  };

  const handleManualApply = async () => {
    const updatedSnip: SnipData = {
      x: Number(posX) || 0,
      y: Number(posY) || 0,
      width: Number(posW) || 10,
      height: Number(posH) || 10,
      imageBase64: activeSnip?.imageBase64,
      colorHex: targetColor,
      timestamp: new Date().toISOString(),
    };

    onSnipChange(updatedSnip);
    await onSaveVisualConfig({
      ...visualConfig,
      captureRegionX: updatedSnip.x,
      captureRegionY: updatedSnip.y,
      captureRegionWidth: updatedSnip.width,
      captureRegionHeight: updatedSnip.height,
      colorTolerance: tolerance,
    });

    showStatus('Calibration parameters saved successfully!');
    onLog(`[Calibration] Saved parameters: X=${posX}, Y=${posY}, W=${posW}, H=${posH}`);
  };

  const handleCopyCurrentSerialized = async () => {
    const snip: SnipData = {
      x: posX,
      y: posY,
      width: posW,
      height: posH,
      imageBase64: activeSnip?.imageBase64,
      colorHex: targetColor,
    };
    const serialized = serializeSnipData(snip);
    await copyToClipboard(serialized);
    showStatus('Copied SO_DATA string to clipboard!');
    onLog(`[Clipboard] Serialized: ${serialized}`);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Toast */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-[#162b16] border-2 border-[#39ff14] text-[#39ff14] text-xs font-black flex items-center space-x-2 shadow-[0_0_15px_rgba(57,255,20,0.3)] animate-bounce">
          <Check className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Banner with Action Buttons */}
      <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Crop className="w-5 h-5 text-[#39ff14]" />
            <span>Smart Snipping &amp; Visual Calibration Suite</span>
          </h2>
          <p className="text-xs text-[#8892b0] mt-1">
            Capture exact screen coordinates, search regions, and pixel targets with Lightshot-style overlay and Master Paste serialization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Select Area (Snipping Tool) Button */}
          <button
            id="btn-trigger-snipping-tool"
            onClick={onOpenSnipper}
            className="h-11 px-5 rounded-xl bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border-2 border-[#39ff14] font-black text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:scale-105"
          >
            <Crop className="w-4 h-4" />
            <span>SELECT AREA (SNIP)</span>
          </button>

          {/* Master Paste Button */}
          <button
            id="btn-master-paste-main"
            onClick={handleMasterPaste}
            className="h-11 px-5 rounded-xl bg-[#002b30] hover:bg-[#003d45] text-[#00e5ff] border-2 border-[#00e5ff] font-black text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.3)] hover:scale-105"
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>MASTER PASTE</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Preview & Live Target Canvas (5 cols) */}
        <div className="lg:col-span-5 bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#252733]">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-[#39ff14]" />
                <h3 className="text-sm font-black text-white">Real-Time Cropped Snip Preview</h3>
              </div>
              <span className="text-[10px] font-mono text-[#8892b0]">
                {posW} × {posH} px
              </span>
            </div>

            {/* Preview Box */}
            <div className="mt-4 w-full h-56 rounded-xl bg-[#09090d] border-2 border-[#252733] overflow-hidden flex items-center justify-center relative group">
              {activeSnip?.imageBase64 ? (
                <img
                  src={activeSnip.imageBase64}
                  alt="Cropped Snip"
                  className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <Crosshair className="w-10 h-10 text-[#39ff14]/40 animate-pulse" />
                  <p className="text-xs text-[#8892b0] font-semibold">
                    No snip captured yet. Click <strong className="text-[#39ff14]">Select Area</strong> or use <strong className="text-[#00e5ff]">Master Paste</strong>.
                  </p>
                </div>
              )}

              {/* Crosshair Overlay Overlay Grid */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#39ff14_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Floating Tag */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-[#39ff14] border border-[#39ff14]/40">
                Target Color: {targetColor}
              </div>
            </div>
          </div>

          {/* Quick Details */}
          <div className="p-3.5 rounded-xl bg-[#181824] border border-[#252733] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#8892b0]">
              <span>Captured At:</span>
              <span className="font-mono text-white">
                {activeSnip?.timestamp ? new Date(activeSnip.timestamp).toLocaleTimeString() : 'Manual Input'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[#8892b0]">
              <span>Search Region:</span>
              <span className="font-mono text-[#39ff14]">
                X:{posX}, Y:{posY} (W:{posW}, H:{posH})
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Numeric Coordinate Controls & Manual Overrides (7 cols) */}
        <div className="lg:col-span-7 bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#252733]">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#00e5ff]" />
              <h3 className="text-sm font-black text-white">Coordinate &amp; Parameter Overrides</h3>
            </div>
            <span className="text-[11px] font-bold text-[#39ff14]">100% Fully Editable</span>
          </div>

          {/* 4 Numeric Coordinate Input Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase text-[#8892b0]">X Position</label>
              <input
                id="input-snip-x"
                type="number"
                value={posX}
                onChange={(e) => setPosX(parseInt(e.target.value) || 0)}
                className="w-full h-11 mt-1 px-3 rounded-xl bg-[#181824] text-[#39ff14] font-mono text-sm font-black border border-[#2d2d3d] outline-none focus:border-[#39ff14] focus:shadow-[0_0_10px_rgba(57,255,20,0.3)] transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-[#8892b0]">Y Position</label>
              <input
                id="input-snip-y"
                type="number"
                value={posY}
                onChange={(e) => setPosY(parseInt(e.target.value) || 0)}
                className="w-full h-11 mt-1 px-3 rounded-xl bg-[#181824] text-[#39ff14] font-mono text-sm font-black border border-[#2d2d3d] outline-none focus:border-[#39ff14] focus:shadow-[0_0_10px_rgba(57,255,20,0.3)] transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-[#8892b0]">Width (W)</label>
              <input
                id="input-snip-w"
                type="number"
                value={posW}
                onChange={(e) => setPosW(parseInt(e.target.value) || 0)}
                className="w-full h-11 mt-1 px-3 rounded-xl bg-[#181824] text-[#00e5ff] font-mono text-sm font-black border border-[#2d2d3d] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_10px_rgba(0,229,255,0.3)] transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase text-[#8892b0]">Height (H)</label>
              <input
                id="input-snip-h"
                type="number"
                value={posH}
                onChange={(e) => setPosH(parseInt(e.target.value) || 0)}
                className="w-full h-11 mt-1 px-3 rounded-xl bg-[#181824] text-[#00e5ff] font-mono text-sm font-black border border-[#2d2d3d] outline-none focus:border-[#00e5ff] focus:shadow-[0_0_10px_rgba(0,229,255,0.3)] transition-all"
              />
            </div>
          </div>

          {/* Color & Tolerance Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[11px] font-bold uppercase text-[#8892b0]">
                Target Pixel Color (Hex)
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="color"
                  value={targetColor.startsWith('#') ? targetColor : '#39FF14'}
                  onChange={(e) => setTargetColor(e.target.value.toUpperCase())}
                  className="w-11 h-11 rounded-xl bg-transparent border border-[#2d2d3d] cursor-pointer p-0.5"
                />
                <input
                  id="input-target-color-hex"
                  type="text"
                  value={targetColor}
                  onChange={(e) => setTargetColor(e.target.value)}
                  className="flex-1 h-11 px-3 rounded-xl bg-[#181824] text-white font-mono text-xs font-bold border border-[#2d2d3d] outline-none focus:border-[#39ff14]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase text-[#8892b0]">
                  Color Tolerance (ΔE)
                </label>
                <span className="font-mono text-xs font-black text-[#ffd600]">{tolerance}</span>
              </div>
              <input
                id="slider-color-tolerance"
                type="range"
                min="1"
                max="60"
                value={tolerance}
                onChange={(e) => setTolerance(parseInt(e.target.value) || 15)}
                className="w-full mt-3.5 accent-[#ffd600] cursor-pointer"
              />
            </div>
          </div>

          {/* Serialization Raw String Box */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase text-[#8892b0]">
                Standardized Serialization (SO_DATA Format)
              </label>
              <button
                id="btn-copy-sodata"
                onClick={handleCopyCurrentSerialized}
                className="text-[11px] font-bold text-[#39ff14] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy SO_DATA</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-[#101016] border border-[#252733] font-mono text-xs text-[#8892b0] break-all">
              <span className="text-[#39ff14]">SO_DATA</span>
              <span className="text-white">|X:{posX}|Y:{posY}|W:{posW}|H:{posH}</span>
              <span className="text-[#00e5ff]">|COLOR:{targetColor}</span>
              {activeSnip?.imageBase64 ? (
                <span className="text-[#64748b]">|IMG:data:image/png;base64,{activeSnip.imageBase64.substring(22, 50)}...</span>
              ) : null}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-[#252733] flex items-center justify-end space-x-3">
            <button
              id="btn-apply-calibration-overrides"
              onClick={handleManualApply}
              className="h-11 px-6 rounded-xl bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border-2 border-[#39ff14] font-black text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(57,255,20,0.3)]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>SAVE &amp; APPLY OVERRIDES</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
