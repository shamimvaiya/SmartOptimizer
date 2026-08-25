import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2, Navigation } from 'lucide-react';
import { MacroNode } from '../types';
import { Language } from '../i18n/translations';

interface RadarMinimapProps {
  nodes: MacroNode[];
  selectedNodeIds: Set<string>;
  executingStepIndex: number | null;
  panOffset: { x: number; y: number };
  zoomLevel: number;
  canvasDimensions: { width: number; height: number };
  onNavigateToNode: (node: MacroNode) => void;
  onPanToPosition: (worldX: number, worldY: number) => void;
  lang?: Language;
}

export const RadarMinimap: React.FC<RadarMinimapProps> = ({
  nodes,
  selectedNodeIds,
  executingStepIndex,
  panOffset,
  zoomLevel,
  canvasDimensions,
  onNavigateToNode,
  onPanToPosition,
  lang = 'bn',
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDraggingWidget, setIsDraggingWidget] = useState<boolean>(false);
  const [isDraggingRadar, setIsDraggingRadar] = useState<boolean>(false);
  const [widgetPos, setWidgetPos] = useState<{ right: number; bottom: number }>({ right: 20, bottom: 20 });

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startRight: number; startBottom: number }>({
    mouseX: 0,
    mouseY: 0,
    startRight: 20,
    startBottom: 20,
  });

  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);

  const miniW = isExpanded ? 300 : 170;
  const miniH = isExpanded ? 200 : 120;

  // Toggle expanded size on double click or button
  const handleDoubleClick = () => {
    setIsExpanded((prev) => !prev);
  };

  // Dragging the Minimap Floating HUD Window
  const handleMouseDownHeader = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingWidget(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startRight: widgetPos.right,
      startBottom: widgetPos.bottom,
    };
  };

  // Clamp Widget Position within Canvas Dimensions so it never overflows
  useEffect(() => {
    const maxRight = Math.max(10, canvasDimensions.width - miniW - 10);
    const maxBottom = Math.max(10, canvasDimensions.height - miniH - 10);

    setWidgetPos((prev) => ({
      right: Math.max(10, Math.min(maxRight, prev.right)),
      bottom: Math.max(10, Math.min(maxBottom, prev.bottom)),
    }));
  }, [isExpanded, canvasDimensions, miniW, miniH]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingWidget) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      const maxRight = Math.max(10, canvasDimensions.width - miniW - 10);
      const maxBottom = Math.max(10, canvasDimensions.height - miniH - 10);

      setWidgetPos({
        right: Math.max(10, Math.min(maxRight, dragStartRef.current.startRight - dx)),
        bottom: Math.max(10, Math.min(maxBottom, dragStartRef.current.startBottom - dy)),
      });
    };

    const handleMouseUp = () => {
      if (isDraggingWidget) setIsDraggingWidget(false);
    };

    if (isDraggingWidget) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingWidget, miniW, miniH, canvasDimensions]);

  // World Bounding Box for Minimap Mapping
  const getBounds = useCallback(() => {
    if (nodes.length === 0) {
      return { minX: -200, maxX: 1600, minY: -200, maxY: 1200, width: 1800, height: 1400 };
    }
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    nodes.forEach((n) => {
      if (n.positionX < minX) minX = n.positionX;
      if (n.positionX + 220 > maxX) maxX = n.positionX + 220;
      if (n.positionY < minY) minY = n.positionY;
      if (n.positionY + 90 > maxY) maxY = n.positionY + 90;
    });

    const pad = 250;
    minX -= pad;
    maxX += pad;
    minY -= pad;
    maxY += pad;
    const width = Math.max(1200, maxX - minX);
    const height = Math.max(800, maxY - minY);
    return { minX, maxX, minY, maxY, width, height };
  }, [nodes]);

  const bounds = getBounds();

  // Convert minimap mouse coordinates to world coordinates & pan main canvas
  const updatePanFromMinimap = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = minimapCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(miniW, clientX - rect.left));
      const clickY = Math.max(0, Math.min(miniH, clientY - rect.top));

      const scaleX = bounds.width / miniW;
      const scaleY = bounds.height / miniH;

      const worldX = bounds.minX + clickX * scaleX;
      const worldY = bounds.minY + clickY * scaleY;

      onPanToPosition(worldX, worldY);
    },
    [bounds, miniW, miniH, onPanToPosition]
  );

  // Radar Canvas Mouse Down (starts drag & immediately jumps)
  const handleRadarMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingRadar(true);
    updatePanFromMinimap(e.clientX, e.clientY);
  };

  // Window listeners for smooth Radar Dragging
  useEffect(() => {
    const handleRadarMouseMove = (e: MouseEvent) => {
      if (!isDraggingRadar) return;
      e.preventDefault();
      updatePanFromMinimap(e.clientX, e.clientY);
    };

    const handleRadarMouseUp = () => {
      if (isDraggingRadar) setIsDraggingRadar(false);
    };

    if (isDraggingRadar) {
      window.addEventListener('mousemove', handleRadarMouseMove);
      window.addEventListener('mouseup', handleRadarMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleRadarMouseMove);
      window.removeEventListener('mouseup', handleRadarMouseUp);
    };
  }, [isDraggingRadar, updatePanFromMinimap]);

  // Render Radar Canvas
  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = miniW;
    canvas.height = miniH;

    // Dark radar background
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, miniW, miniH);

    // Radar grid lines
    ctx.strokeStyle = '#16233b';
    ctx.lineWidth = 1;
    for (let x = 0; x < miniW; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, miniH);
      ctx.stroke();
    }
    for (let y = 0; y < miniH; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(miniW, y);
      ctx.stroke();
    }

    const scaleX = miniW / bounds.width;
    const scaleY = miniH / bounds.height;

    // Draw wires between nodes
    ctx.lineWidth = isExpanded ? 2 : 1;
    nodes.forEach((src) => {
      (src.nextNodes || []).forEach((tgtId) => {
        const tgt = nodes.find((n) => n.id === tgtId);
        if (!tgt) return;
        const x1 = (src.positionX + 110 - bounds.minX) * scaleX;
        const y1 = (src.positionY + 45 - bounds.minY) * scaleY;
        const x2 = (tgt.positionX + 110 - bounds.minX) * scaleX;
        const y2 = (tgt.positionY + 45 - bounds.minY) * scaleY;

        ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
    });

    // Draw node dots
    nodes.forEach((node, idx) => {
      const nx = (node.positionX - bounds.minX) * scaleX;
      const ny = (node.positionY - bounds.minY) * scaleY;
      const nw = Math.max(6, 220 * scaleX);
      const nh = Math.max(4, 90 * scaleY);

      const isExecuting = executingStepIndex === idx;
      const isSelected = selectedNodeIds.has(node.id);

      if (isExecuting) {
        ctx.fillStyle = '#39ff14';
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur = 8;
      } else if (isSelected) {
        ctx.fillStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = '#d500f9';
        ctx.shadowBlur = 0;
      }

      ctx.fillRect(nx, ny, nw, nh);
      ctx.shadowBlur = 0;
    });

    // Draw current viewport rectangle (camera cone)
    const viewWorldLeft = -panOffset.x / zoomLevel;
    const viewWorldTop = -panOffset.y / zoomLevel;
    const viewWorldWidth = canvasDimensions.width / zoomLevel;
    const viewWorldHeight = canvasDimensions.height / zoomLevel;

    const vx = (viewWorldLeft - bounds.minX) * scaleX;
    const vy = (viewWorldTop - bounds.minY) * scaleY;
    const vw = viewWorldWidth * scaleX;
    const vh = viewWorldHeight * scaleY;

    // Viewport box glow
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = isDraggingRadar ? 2.5 : 1.5;
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = isDraggingRadar ? 10 : 4;
    ctx.strokeRect(vx, vy, vw, vh);

    ctx.fillStyle = isDraggingRadar ? 'rgba(57, 255, 20, 0.22)' : 'rgba(57, 255, 20, 0.1)';
    ctx.fillRect(vx, vy, vw, vh);
    ctx.shadowBlur = 0;

    // Radar scan sweep line animation
    const time = Date.now() / 1500;
    const sweepX = (Math.sin(time) * 0.5 + 0.5) * miniW;
    const sweepGrad = ctx.createLinearGradient(sweepX - 20, 0, sweepX + 20, 0);
    sweepGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
    sweepGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.25)');
    sweepGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(sweepX - 20, 0, 40, miniH);
  }, [
    nodes,
    selectedNodeIds,
    executingStepIndex,
    panOffset,
    zoomLevel,
    canvasDimensions,
    isExpanded,
    bounds,
    miniW,
    miniH,
    isDraggingRadar,
  ]);

  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        right: `${widgetPos.right}px`,
        bottom: `${widgetPos.bottom}px`,
        width: `${miniW}px`,
      }}
      className="absolute z-40 rounded-2xl bg-[#0d1017]/95 border-2 border-[#00e5ff] shadow-[0_0_25px_rgba(0,229,255,0.25)] backdrop-blur-md overflow-hidden select-none transition-all duration-150"
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDownHeader}
        className="px-2.5 py-1.5 bg-[#121c2e] border-b border-[#1b2b48] flex items-center justify-between cursor-grab active:cursor-grabbing text-xs"
      >
        <div className="flex items-center space-x-1.5 text-[#00e5ff] font-mono font-black text-[10px] tracking-wider">
          <Navigation className="w-3 h-3 text-[#39ff14] animate-spin" />
          <span>RADAR HUD {isExpanded ? '(EXPANDED)' : ''}</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 rounded text-[#8892b0] hover:text-[#00e5ff] cursor-pointer"
            title={isExpanded ? 'Minimize HUD' : 'Expand HUD'}
          >
            {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Interactive Radar Canvas (Click or Drag anywhere to pan) */}
      <div className="relative">
        <canvas
          ref={minimapCanvasRef}
          onMouseDown={handleRadarMouseDown}
          className="cursor-crosshair block w-full"
        />

        <div className="absolute bottom-1 right-2 pointer-events-none text-[9px] font-mono text-[#39ff14]/90 font-bold bg-black/50 px-1 rounded">
          {nodes.length} NODES | {(zoomLevel * 100).toFixed(0)}%
        </div>
      </div>

      {isExpanded && (
        <div className="p-2 bg-[#090b10] border-t border-[#1b2b48] flex items-center justify-between text-[10px] text-[#8892b0]">
          <span>{lang === 'bn' ? 'টেনে ক্যামেরা সরান' : 'Drag radar to pan'}</span>
          <span className="text-[#39ff14] font-mono font-bold">{lang === 'bn' ? 'লাইভ রাডার' : 'LIVE'}</span>
        </div>
      )}
    </div>
  );
};
