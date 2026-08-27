import React from 'react';
import { CrosshairCustomSettings, CrosshairDesign } from '../types';

interface CrosshairRendererProps {
  design?: CrosshairDesign;
  customSettings?: Partial<CrosshairCustomSettings>;
  overrideColor?: string;
  overrideSize?: number;
  showGlow?: boolean;
  className?: string;
}

export const CrosshairRenderer: React.FC<CrosshairRendererProps> = ({
  design,
  customSettings,
  overrideColor,
  overrideSize,
  showGlow = true,
  className = '',
}) => {
  // Merge design properties with custom settings
  const color = overrideColor || customSettings?.color || design?.color || '#39ff14';
  const size = overrideSize || customSettings?.size || design?.size || 24;
  const thickness = customSettings?.thickness ?? design?.thickness ?? 2;
  const gap = customSettings?.gap ?? design?.gap ?? 4;
  const dotSize = customSettings?.dotSize ?? design?.dotSize ?? 2;
  const showDot = customSettings?.showDot ?? design?.showDot ?? true;
  const hasOutline = customSettings?.hasOutline ?? design?.hasOutline ?? true;
  const outlineColor = customSettings?.outlineColor || design?.outlineColor || '#000000';
  const opacity = customSettings?.opacity ?? design?.opacity ?? 1.0;
  const rotation = (customSettings?.rotation ?? 0) + (design?.rotation ?? 0);
  const pulse = customSettings?.pulseAnimation ?? false;
  const shapeType = design?.shapeType || 'classic_cross';

  // SVG dimensions
  const svgSize = Math.max(size * 2 + 16, 48);
  const center = svgSize / 2;

  // Filter ID for glowing shadow
  const filterId = `glow-${color.replace('#', '')}-${Math.floor(size)}`;

  // SVG Elements renderer based on shapeType
  const renderShape = () => {
    switch (shapeType) {
      case 'dot':
        return (
          <circle
            cx={center}
            cy={center}
            r={Math.max(1.5, dotSize)}
            fill={color}
            stroke={hasOutline ? outlineColor : 'none'}
            strokeWidth={hasOutline ? 1 : 0}
          />
        );

      case 'classic_cross':
      case 'cross_gap': {
        const lineLen = Math.max(3, size / 2 - gap / 2);
        return (
          <g>
            {/* Top */}
            <line
              x1={center}
              y1={center - gap / 2}
              x2={center}
              y2={center - gap / 2 - lineLen}
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="square"
            />
            {/* Bottom */}
            <line
              x1={center}
              y1={center + gap / 2}
              x2={center}
              y2={center + gap / 2 + lineLen}
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="square"
            />
            {/* Left */}
            <line
              x1={center - gap / 2}
              y1={center}
              x2={center - gap / 2 - lineLen}
              y2={center}
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="square"
            />
            {/* Right */}
            <line
              x1={center + gap / 2}
              y1={center}
              x2={center + gap / 2 + lineLen}
              y2={center}
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="square"
            />
            {showDot && (
              <circle
                cx={center}
                cy={center}
                r={dotSize}
                fill={color}
                stroke={hasOutline ? outlineColor : 'none'}
                strokeWidth={hasOutline ? 1 : 0}
              />
            )}
          </g>
        );
      }

      case 't_shape': {
        const lineLen = Math.max(3, size / 2 - gap / 2);
        return (
          <g>
            {/* Bottom */}
            <line
              x1={center}
              y1={center + gap / 2}
              x2={center}
              y2={center + gap / 2 + lineLen}
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="square"
            />
            {/* Left */}
            <line
              x1={center - gap / 2}
              y1={center}
              x2={center - gap / 2 - lineLen}
              y2={center}
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="square"
            />
            {/* Right */}
            <line
              x1={center + gap / 2}
              y1={center}
              x2={center + gap / 2 + lineLen}
              y2={center}
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="square"
            />
            {showDot && (
              <circle
                cx={center}
                cy={center}
                r={dotSize}
                fill={color}
                stroke={hasOutline ? outlineColor : 'none'}
                strokeWidth={hasOutline ? 1 : 0}
              />
            )}
          </g>
        );
      }

      case 'dot_circle':
      case 'circle': {
        const radius = Math.max(4, size / 2);
        return (
          <g>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeDasharray={gap > 6 ? `${size / 3} ${gap}` : undefined}
            />
            {showDot && (
              <circle
                cx={center}
                cy={center}
                r={dotSize}
                fill={color}
                stroke={hasOutline ? outlineColor : 'none'}
                strokeWidth={hasOutline ? 1 : 0}
              />
            )}
          </g>
        );
      }

      case 'dual_circle': {
        const r1 = Math.max(3, size / 3);
        const r2 = Math.max(6, size / 1.8);
        return (
          <g>
            <circle cx={center} cy={center} r={r1} fill="none" stroke={color} strokeWidth={thickness} />
            <circle cx={center} cy={center} r={r2} fill="none" stroke={color} strokeWidth={1} strokeDasharray="3 3" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'hologram_ring': {
        const radius = Math.max(6, size / 2);
        const tick = 4;
        return (
          <g>
            <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={thickness} />
            {/* 4 Cardinal Ticks */}
            <line x1={center} y1={center - radius - tick} x2={center} y2={center - radius} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + radius} x2={center} y2={center + radius + tick} stroke={color} strokeWidth={thickness} />
            <line x1={center - radius - tick} y1={center} x2={center - radius} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center + radius} y1={center} x2={center + radius + tick} y2={center} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'shotgun_spread': {
        const r = Math.max(8, size / 2);
        return (
          <g>
            {/* 4 Arc Corners */}
            <path
              d={`M ${center - r * 0.7} ${center - r * 0.7} A ${r} ${r} 0 0 1 ${center + r * 0.7} ${center - r * 0.7}`}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
            />
            <path
              d={`M ${center + r * 0.7} ${center + r * 0.7} A ${r} ${r} 0 0 1 ${center - r * 0.7} ${center + r * 0.7}`}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
            />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'chevron': {
        const arm = Math.max(5, size / 2);
        return (
          <g>
            <path
              d={`M ${center - arm} ${center + arm * 0.6} L ${center} ${center - arm * 0.4} L ${center + arm} ${center + arm * 0.6}`}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {showDot && <circle cx={center} cy={center + gap} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'quad_chevron': {
        const d = Math.max(5, size / 2.2);
        const l = Math.max(3, size / 4);
        return (
          <g>
            {/* Top-Left */}
            <path d={`M ${center - d} ${center - d + l} L ${center - d} ${center - d} L ${center - d + l} ${center - d}`} fill="none" stroke={color} strokeWidth={thickness} />
            {/* Top-Right */}
            <path d={`M ${center + d - l} ${center - d} L ${center + d} ${center - d} L ${center + d} ${center - d + l}`} fill="none" stroke={color} strokeWidth={thickness} />
            {/* Bottom-Left */}
            <path d={`M ${center - d} ${center + d - l} L ${center - d} ${center + d} L ${center - d + l} ${center + d}`} fill="none" stroke={color} strokeWidth={thickness} />
            {/* Bottom-Right */}
            <path d={`M ${center + d - l} ${center + d} L ${center + d} ${center + d} L ${center + d} ${center + d - l}`} fill="none" stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'assault_brackets': {
        const w = Math.max(8, size / 1.8);
        const h = Math.max(4, size / 3);
        return (
          <g>
            {/* Left Bracket */}
            <path d={`M ${center - w + 4} ${center - h} L ${center - w} ${center - h} L ${center - w} ${center + h} L ${center - w + 4} ${center + h}`} fill="none" stroke={color} strokeWidth={thickness} />
            {/* Right Bracket */}
            <path d={`M ${center + w - 4} ${center - h} L ${center + w} ${center - h} L ${center + w} ${center + h} L ${center + w - 4} ${center + h}`} fill="none" stroke={color} strokeWidth={thickness} />
            {/* Center diamond/dot */}
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'diamond': {
        const r = Math.max(4, size / 2.2);
        return (
          <g>
            <polygon
              points={`${center},${center - r} ${center + r},${center} ${center},${center + r} ${center - r},${center}`}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
            />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'tri_vector': {
        const r = Math.max(6, size / 2);
        const angle1 = (0 * Math.PI) / 180;
        const angle2 = (120 * Math.PI) / 180;
        const angle3 = (240 * Math.PI) / 180;
        return (
          <g>
            <line x1={center + Math.cos(angle1) * gap} y1={center + Math.sin(angle1) * gap} x2={center + Math.cos(angle1) * r} y2={center + Math.sin(angle1) * r} stroke={color} strokeWidth={thickness} />
            <line x1={center + Math.cos(angle2) * gap} y1={center + Math.sin(angle2) * gap} x2={center + Math.cos(angle2) * r} y2={center + Math.sin(angle2) * r} stroke={color} strokeWidth={thickness} />
            <line x1={center + Math.cos(angle3) * gap} y1={center + Math.sin(angle3) * gap} x2={center + Math.cos(angle3) * r} y2={center + Math.sin(angle3) * r} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'biohazard': {
        const r = Math.max(6, size / 2);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1} strokeDasharray="6 4" />
            <circle cx={center} cy={center - r / 2} r={r / 3} fill="none" stroke={color} strokeWidth={thickness} />
            <circle cx={center - r / 2.3} cy={center + r / 3} r={r / 3} fill="none" stroke={color} strokeWidth={thickness} />
            <circle cx={center + r / 2.3} cy={center + r / 3} r={r / 3} fill="none" stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'falcon_wing':
      case 'valkyrie': {
        const w = Math.max(6, size / 2);
        return (
          <g>
            {/* Left Swept Wing */}
            <path d={`M ${center - gap} ${center} Q ${center - w * 0.5} ${center - w * 0.4} ${center - w} ${center - w * 0.2}`} fill="none" stroke={color} strokeWidth={thickness} />
            {/* Right Swept Wing */}
            <path d={`M ${center + gap} ${center} Q ${center + w * 0.5} ${center - w * 0.4} ${center + w} ${center - w * 0.2}`} fill="none" stroke={color} strokeWidth={thickness} />
            {/* Bottom pointer */}
            <line x1={center} y1={center + gap} x2={center} y2={center + w * 0.7} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'hexagon': {
        const r = Math.max(5, size / 2);
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * 60 * Math.PI) / 180;
          points.push(`${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`);
        }
        return (
          <g>
            <polygon points={points.join(' ')} fill="none" stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'cyber_reticle': {
        const r = Math.max(7, size / 2);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1} strokeDasharray="8 6" />
            <line x1={center - r - 3} y1={center} x2={center - gap} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + r + 3} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center - r - 3} x2={center} y2={center - gap} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + r + 3} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'target_lock': {
        const r = Math.max(8, size / 2);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={thickness} />
            {/* Box Cross */}
            <line x1={center - r} y1={center} x2={center + r} y2={center} stroke={color} strokeWidth={1} />
            <line x1={center} y1={center - r} x2={center} y2={center + r} stroke={color} strokeWidth={1} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'sniper_mil_dot': {
        const l = Math.max(10, size / 1.5);
        return (
          <g>
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={1} />
            <line x1={center} y1={center - l} x2={center} y2={center + l} stroke={color} strokeWidth={1} />
            {/* Subtended mil dots */}
            <circle cx={center - l * 0.4} cy={center} r={1.5} fill={color} />
            <circle cx={center + l * 0.4} cy={center} r={1.5} fill={color} />
            <circle cx={center} cy={center - l * 0.4} r={1.5} fill={color} />
            <circle cx={center} cy={center + l * 0.4} r={1.5} fill={color} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'heavy_artillery': {
        const r = Math.max(8, size / 2);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + r} x2={center} y2={center + r + 6} stroke={color} strokeWidth={thickness} />
            <line x1={center - 3} y1={center + r + 3} x2={center + 3} y2={center + r + 3} stroke={color} strokeWidth={1.5} />
            <line x1={center - 5} y1={center + r + 6} x2={center + 5} y2={center + r + 6} stroke={color} strokeWidth={1.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'stealth_optic': {
        const w = Math.max(6, size / 2);
        return (
          <g>
            <line x1={center - w} y1={center} x2={center - gap} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + w} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + w} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'box_cross': {
        const box = Math.max(4, size / 3);
        const arm = Math.max(4, size / 3);
        return (
          <g>
            <rect
              x={center - box / 2}
              y={center - box / 2}
              width={box}
              height={box}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
            />
            <line x1={center} y1={center - box / 2} x2={center} y2={center - box / 2 - arm} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + box / 2} x2={center} y2={center + box / 2 + arm} stroke={color} strokeWidth={thickness} />
            <line x1={center - box / 2} y1={center} x2={center - box / 2 - arm} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center + box / 2} y1={center} x2={center + box / 2 + arm} y2={center} stroke={color} strokeWidth={thickness} />
          </g>
        );
      }

      case 'predator_tri': {
        const r = Math.max(5, size / 2.5);
        return (
          <g>
            <circle cx={center} cy={center - r} r={dotSize} fill={color} />
            <circle cx={center - r * 0.86} cy={center + r * 0.5} r={dotSize} fill={color} />
            <circle cx={center + r * 0.86} cy={center + r * 0.5} r={dotSize} fill={color} />
          </g>
        );
      }

      case 'omega_cross': {
        const r = Math.max(6, size / 2);
        return (
          <g>
            <path
              d={`M ${center - r * 0.8} ${center + r * 0.5} A ${r} ${r} 0 1 1 ${center + r * 0.8} ${center + r * 0.5}`}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
            />
            <line x1={center} y1={center + gap} x2={center} y2={center + r} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'laser_cross': {
        const l = Math.max(10, size);
        return (
          <g>
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={1} />
            <line x1={center} y1={center - l} x2={center} y2={center + l} stroke={color} strokeWidth={1} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'matrix_grid': {
        const d = Math.max(6, size / 2);
        return (
          <g>
            <line x1={center - d} y1={center} x2={center + d} y2={center} stroke={color} strokeWidth={1} />
            <line x1={center} y1={center - d} x2={center} y2={center + d} stroke={color} strokeWidth={1} />
            {/* Hash ticks */}
            <line x1={center - d * 0.5} y1={center - 3} x2={center - d * 0.5} y2={center + 3} stroke={color} strokeWidth={1} />
            <line x1={center + d * 0.5} y1={center - 3} x2={center + d * 0.5} y2={center + 3} stroke={color} strokeWidth={1} />
            <line x1={center - 3} y1={center - d * 0.5} x2={center + 3} y2={center - d * 0.5} stroke={color} strokeWidth={1} />
            <line x1={center - 3} y1={center + d * 0.5} x2={center + 3} y2={center + d * 0.5} stroke={color} strokeWidth={1} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'shuriken': {
        const r = Math.max(6, size / 2);
        return (
          <g>
            <polygon
              points={`
                ${center},${center - r} 
                ${center + r * 0.25},${center - r * 0.25} 
                ${center + r},${center} 
                ${center + r * 0.25},${center + r * 0.25} 
                ${center},${center + r} 
                ${center - r * 0.25},${center + r * 0.25} 
                ${center - r},${center} 
                ${center - r * 0.25},${center - r * 0.25}
              `}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
            />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'clutch_reticle': {
        const len = Math.max(4, size / 2.5);
        return (
          <g>
            <line x1={center} y1={center - gap / 2} x2={center} y2={center - gap / 2 - len} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + gap / 2} x2={center} y2={center + gap / 2 + len} stroke={color} strokeWidth={thickness} />
            <line x1={center - gap / 2} y1={center} x2={center - gap / 2 - len} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center + gap / 2} y1={center} x2={center + gap / 2 + len} y2={center} stroke={color} strokeWidth={thickness} />
            {/* High-visibility center bead */}
            <circle cx={center} cy={center} r={dotSize + 1} fill="#ff0055" stroke="#ffffff" strokeWidth={1} />
          </g>
        );
      }

      // === 7. SPECIAL ANIMATED & CYBER CROSSHAIRS ===

      case 'fire_dragon_vortex': {
        const r = Math.max(10, size * 0.85);
        return (
          <g>
            {/* 1. Doctor Strange Style Outer Magical Fire Ring (Fast clockwise rotation 2.5s) */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${center} ${center}`}
                to={`360 ${center} ${center}`}
                dur="2.5s"
                repeatCount="indefinite"
              />
              {/* Outer Glowing Fire Ring Arcs */}
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="#ff4400"
                strokeWidth={2}
                strokeDasharray="6 3 2 3"
                opacity="0.9"
                filter={showGlow ? `url(#${filterId})` : undefined}
              />
              <circle
                cx={center}
                cy={center}
                r={r * 0.85}
                fill="none"
                stroke="#ffee00"
                strokeWidth={1.2}
                strokeDasharray="4 4 1 3"
                opacity="0.85"
              />

              {/* Doctor Strange Fire Sparks / Particles around Ring */}
              <circle cx={center + r} cy={center} r={1.8} fill="#ffffff" />
              <circle cx={center - r} cy={center} r={1.5} fill="#ffee00" />
              <circle cx={center} cy={center - r} r={1.6} fill="#ff7700" />
              <circle cx={center} cy={center + r} r={1.4} fill="#ff3300" />
              <circle cx={center + r * 0.7} cy={center - r * 0.7} r={1.5} fill="#ffee00" />
              <circle cx={center - r * 0.7} cy={center + r * 0.7} r={1.3} fill="#ffaa00" />
            </g>

            {/* 2. Counter-Rotating Inner Fire Ring (1.8s Counter-clockwise) */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`360 ${center} ${center}`}
                to={`0 ${center} ${center}`}
                dur="1.8s"
                repeatCount="indefinite"
              />
              <circle
                cx={center}
                cy={center}
                r={r * 1.12}
                fill="none"
                stroke="#ff2200"
                strokeWidth={1}
                strokeDasharray="1 5 3 4"
                opacity="0.75"
              />
            </g>

            {/* 3. Dynamic Fiery Dragon Silhouette Uncoiling from Center & Looping 360° every 4 Seconds */}
            <g>
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${center} ${center}`}
                  to={`360 ${center} ${center}`}
                  dur="4s"
                  repeatCount="indefinite"
                />
                {/* Spiral Dragon Body Path moving outward and back in */}
                <path
                  d={`M ${center} ${center} Q ${center + r * 0.6} ${center - r * 0.4} ${center + r} ${center} T ${center} ${center + r} T ${center - r * 0.5} ${center} T ${center} ${center}`}
                  fill="none"
                  stroke="url(#dragonFlameGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  opacity="0.95"
                />
                {/* Fiery Dragon Head / Horns at outer orbit */}
                <polygon
                  points={`${center + r},${center - 4} ${center + r + 6},${center} ${center + r},${center + 4} ${center + r - 2},${center}`}
                  fill="#ffee00"
                  stroke="#ff2200"
                  strokeWidth="1"
                />
              </g>

              {/* Linear Gradient Definition for Dragon Fire Trail */}
              <defs>
                <linearGradient id="dragonFlameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffee00" />
                  <stop offset="50%" stopColor="#ff5500" />
                  <stop offset="100%" stopColor="#ff0044" />
                </linearGradient>
              </defs>
            </g>

            {/* 4. Precision Aim Ticks & Core Star Dot */}
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - size * 0.3} stroke="#ffea00" strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + size * 0.3} stroke="#ffea00" strokeWidth={thickness} />
            <line x1={center - gap} y1={center} x2={center - gap - size * 0.3} y2={center} stroke="#ffea00" strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + size * 0.3} y2={center} stroke="#ffea00" strokeWidth={thickness} />

            {/* Glowing Core Sun Dot */}
            <circle
              cx={center}
              cy={center}
              r={Math.max(2, dotSize)}
              fill="#ffffff"
              stroke="#ff4400"
              strokeWidth={1.5}
            />
          </g>
        );
      }

      case 'cyber_pulsar_ring': {
        const r = Math.max(6, size * 0.65);
        return (
          <g>
            {/* Pulsing Concentric Outer Rings */}
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={thickness} opacity="0.4">
              <animate attributeName="r" values={`${r * 0.8};${r * 1.15};${r * 0.8}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={center} cy={center} r={r * 0.6} fill="none" stroke={color} strokeWidth={1.5} />
            {/* 4 Precision Cyber Hash Ticks */}
            <line x1={center} y1={center - r - 4} x2={center} y2={center - r + 3} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + r - 3} x2={center} y2={center + r + 4} stroke={color} strokeWidth={thickness} />
            <line x1={center - r - 4} y1={center} x2={center - r + 3} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center + r - 3} y1={center} x2={center + r + 4} y2={center} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'quantum_glitch': {
        const len = Math.max(4, size * 0.45);
        return (
          <g>
            {/* Subtle Glitch Offset Ghost Lines */}
            <line x1={center - len} y1={center - 1} x2={center + len} y2={center - 1} stroke="#00e5ff" strokeWidth={1} opacity="0.7">
              <animate attributeName="x1" values={`${center - len};${center - len - 3};${center - len}`} dur="0.8s" repeatCount="indefinite" />
            </line>
            <line x1={center + 1} y1={center - len} x2={center + 1} y2={center + len} stroke="#ff0055" strokeWidth={1} opacity="0.7">
              <animate attributeName="y1" values={`${center - len};${center - len + 3};${center - len}`} dur="0.6s" repeatCount="indefinite" />
            </line>
            {/* Main Cyber Cross */}
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - len} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke={color} strokeWidth={thickness} />
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'plasma_core': {
        const r = Math.max(7, size * 0.65);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="3s" repeatCount="indefinite" />
              {/* Dual Spinning Curved Plasma Arcs */}
              <path d={`M ${center - r} ${center} A ${r} ${r} 0 0 1 ${center + r} ${center}`} fill="none" stroke={color} strokeWidth={thickness} strokeDasharray="14 10" />
              <path d={`M ${center + r} ${center} A ${r} ${r} 0 0 1 ${center - r} ${center}`} fill="none" stroke="#00e5ff" strokeWidth={thickness} strokeDasharray="14 10" />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize + 0.5} fill="#ffffff" stroke="#9d00ff" strokeWidth={1.5} />}
          </g>
        );
      }

      case 'sniper_predator_lock': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`-360 ${center} ${center}`} dur="6s" repeatCount="indefinite" />
              {/* 3 Laser Points */}
              <circle cx={center} cy={center - r} r={2} fill="#ff0033" />
              <circle cx={center - r * 0.866} cy={center + r * 0.5} r={2} fill="#ff0033" />
              <circle cx={center + r * 0.866} cy={center + r * 0.5} r={2} fill="#ff0033" />
              {/* Converging Targeting Beams */}
              <line x1={center} y1={center - r} x2={center} y2={center - gap} stroke="#ff0033" strokeWidth={1} strokeDasharray="2 3" />
              <line x1={center - r * 0.866} y1={center + r * 0.5} x2={center - gap * 0.866} y2={center + gap * 0.5} stroke="#ff0033" strokeWidth={1} strokeDasharray="2 3" />
              <line x1={center + r * 0.866} y1={center + r * 0.5} x2={center + gap * 0.866} y2={center + gap * 0.5} stroke="#ff0033" strokeWidth={1} strokeDasharray="2 3" />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ff0033" stroke="#ffffff" strokeWidth={1} />}
          </g>
        );
      }

      case 'neon_vortex': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4s" repeatCount="indefinite" />
              <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={thickness} strokeDasharray="18 8" />
              <circle cx={center} cy={center} r={r * 0.5} fill="none" stroke="#ffffff" strokeWidth={1} strokeDasharray="8 6" />
            </g>
            <path d={`M ${center - 4} ${center + 4} L ${center} ${center - 3} L ${center + 4} ${center + 4}`} fill="none" stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'cyber_rage_tri': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4.5s" repeatCount="indefinite" />
              {[0, 120, 240].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                const x1 = center + Math.cos(rad) * gap;
                const y1 = center + Math.sin(rad) * gap;
                const x2 = center + Math.cos(rad) * r;
                const y2 = center + Math.sin(rad) * r;
                return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={thickness + 1} strokeLinecap="round" />;
              })}
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'void_singularity': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1.5} opacity="0.6">
              <animate attributeName="r" values={`${r};${r * 0.4};${r}`} dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={center} cy={center} r={r * 0.6} fill="none" stroke="#ff0080" strokeWidth={1.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'solar_flare_bloom': {
        const len = Math.max(6, size * 0.5);
        return (
          <g>
            <circle cx={center} cy={center} r={gap + 3} fill="none" stroke={color} strokeWidth={1.5} opacity="0.7">
              <animate attributeName="r" values={`${gap + 2};${gap + 6};${gap + 2}`} dur="1.8s" repeatCount="indefinite" />
            </circle>
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - len} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke={color} strokeWidth={thickness} />
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#ff8800" strokeWidth={1} />}
          </g>
        );
      }

      case 'hyper_recoil_gyro': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="6 3" />
            <line x1={center - r - 4} y1={center} x2={center - r + 3} y2={center} stroke="#ffffff" strokeWidth={2} />
            <line x1={center + r - 3} y1={center} x2={center + r + 4} y2={center} stroke="#ffffff" strokeWidth={2} />
            <line x1={center} y1={center - r - 4} x2={center} y2={center - r + 3} stroke="#ffffff" strokeWidth={2} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'tactical_hud_hex': {
        const r = Math.max(8, size * 0.65);
        const points = [0, 60, 120, 180, 240, 300]
          .map((a) => {
            const rad = (a * Math.PI) / 180;
            return `${center + r * Math.cos(rad)},${center + r * Math.sin(rad)}`;
          })
          .join(' ');
        return (
          <g>
            <polygon points={points} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="8 4" />
            <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />
          </g>
        );
      }

      case 'matrix_stream_reticle': {
        const len = Math.max(6, size * 0.5);
        return (
          <g>
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - len} stroke={color} strokeWidth={thickness} strokeDasharray="3 2" />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke={color} strokeWidth={thickness} strokeDasharray="3 2" />
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke={color} strokeWidth={thickness} strokeDasharray="3 2" />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke={color} strokeWidth={thickness} strokeDasharray="3 2" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#39ff14" stroke="#ffffff" strokeWidth={0.8} />}
          </g>
        );
      }

      case 'phoenix_wing': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            {/* Left Radiant Wing */}
            <path
              d={`M ${center - gap} ${center} Q ${center - r} ${center - r * 0.6} ${center - r} ${center + r * 0.4}`}
              fill="none"
              stroke="#ff2a00"
              strokeWidth={thickness + 0.5}
              strokeLinecap="round"
            />
            {/* Right Radiant Wing */}
            <path
              d={`M ${center + gap} ${center} Q ${center + r} ${center - r * 0.6} ${center + r} ${center + r * 0.4}`}
              fill="none"
              stroke="#ff2a00"
              strokeWidth={thickness + 0.5}
              strokeLinecap="round"
            />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffee00" stroke="#ff0000" strokeWidth={1} />}
          </g>
        );
      }

      case 'astral_nebula_dot': {
        return (
          <g>
            <circle cx={center} cy={center} r={dotSize + 4} fill="none" stroke="#00e5ff" strokeWidth={1} opacity="0.6">
              <animate attributeName="r" values={`${dotSize + 2};${dotSize + 6};${dotSize + 2}`} dur="2s" repeatCount="indefinite" />
            </circle>
            <polygon
              points={`${center},${center - dotSize - 2} ${center + dotSize + 2},${center} ${center},${center + dotSize + 2} ${center - dotSize - 2},${center}`}
              fill={color}
            />
          </g>
        );
      }

      case 'thunder_bolt_core': {
        const len = Math.max(6, size * 0.45);
        return (
          <g>
            <path
              d={`M ${center - len} ${center - len} L ${center - gap} ${center - gap} L ${center - gap} ${center - gap - 3}`}
              fill="none"
              stroke="#ffd600"
              strokeWidth={thickness}
            />
            <path
              d={`M ${center + len} ${center - len} L ${center + gap} ${center - gap} L ${center + gap} ${center - gap - 3}`}
              fill="none"
              stroke="#ffd600"
              strokeWidth={thickness}
            />
            <path
              d={`M ${center - len} ${center + len} L ${center - gap} ${center + gap} L ${center - gap} ${center + gap + 3}`}
              fill="none"
              stroke="#ffd600"
              strokeWidth={thickness}
            />
            <path
              d={`M ${center + len} ${center + len} L ${center + gap} ${center + gap} L ${center + gap} ${center + gap + 3}`}
              fill="none"
              stroke="#ffd600"
              strokeWidth={thickness}
            />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#ffd600" strokeWidth={1} />}
          </g>
        );
      }

      case 'ghost_phantom_pulse': {
        const len = Math.max(5, size * 0.4);
        return (
          <g opacity="0.8">
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - len} stroke="#ffffff" strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke="#ffffff" strokeWidth={thickness} />
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke="#ffffff" strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke="#ffffff" strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#39ff14" />}
          </g>
        );
      }

      case 'chakra_energy_orb': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="6s" repeatCount="indefinite" />
              {[0, 60, 120, 180, 240, 300].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return <circle key={deg} cx={center + Math.cos(rad) * r} cy={center + Math.sin(rad) * r} r={1.8} fill={color} />;
              })}
              <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1} strokeDasharray="4 4" />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'drag_headshot_master': {
        const len = Math.max(6, size * 0.5);
        return (
          <g>
            {/* Apex Upward Headshot Triangle Notch */}
            <path
              d={`M ${center} ${center - gap - len} L ${center - len * 0.7} ${center - gap} L ${center + len * 0.7} ${center - gap} Z`}
              fill="none"
              stroke="#ff0055"
              strokeWidth={thickness}
            />
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke="#ffffff" strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke="#ffffff" strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke="#ffffff" strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ff0055" stroke="#ffffff" strokeWidth={1} />}
          </g>
        );
      }

      case 'chrono_warp_optic': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="7s" repeatCount="indefinite" />
              <circle cx={center} cy={center} r={r} fill="none" stroke="#00bfff" strokeWidth={1.5} strokeDasharray="10 6" />
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`-360 ${center} ${center}`} dur="4s" repeatCount="indefinite" />
              <circle cx={center} cy={center} r={r * 0.6} fill="none" stroke="#ffffff" strokeWidth={1} strokeDasharray="6 4" />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#00e5ff" />}
          </g>
        );
      }

      case 'blaze_inferno_ring': {
        const r = Math.max(7, size * 0.6);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke="#ff3300" strokeWidth={2} strokeDasharray="6 3">
              <animate attributeName="stroke" values="#ff3300;#ffee00;#ff3300" dur="1s" repeatCount="indefinite" />
            </circle>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffee00" stroke="#ff0000" strokeWidth={1} />}
          </g>
        );
      }

      case 'shadow_assassin_x': {
        const len = Math.max(5, size * 0.45);
        return (
          <g>
            <line x1={center - len} y1={center - len} x2={center - gap * 0.7} y2={center - gap * 0.7} stroke={color} strokeWidth={thickness} />
            <line x1={center + gap * 0.7} y1={center + gap * 0.7} x2={center + len} y2={center + len} stroke={color} strokeWidth={thickness} />
            <line x1={center + len} y1={center - len} x2={center + gap * 0.7} y2={center - gap * 0.7} stroke={color} strokeWidth={thickness} />
            <line x1={center - gap * 0.7} y1={center + gap * 0.7} x2={center - len} y2={center + len} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'titan_mech_target': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <path d={`M ${center - r} ${center - r * 0.4} L ${center - r} ${center - r} L ${center - r * 0.4} ${center - r}`} fill="none" stroke="#ffaa00" strokeWidth={2.5} />
            <path d={`M ${center + r} ${center - r * 0.4} L ${center + r} ${center - r} L ${center + r * 0.4} ${center - r}`} fill="none" stroke="#ffaa00" strokeWidth={2.5} />
            <path d={`M ${center - r} ${center + r * 0.4} L ${center - r} ${center + r} L ${center - r * 0.4} ${center + r}`} fill="none" stroke="#ffaa00" strokeWidth={2.5} />
            <path d={`M ${center + r} ${center + r * 0.4} L ${center + r} ${center + r} L ${center + r * 0.4} ${center + r}`} fill="none" stroke="#ffaa00" strokeWidth={2.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffaa00" stroke="#000000" strokeWidth={1} />}
          </g>
        );
      }

      case 'prism_rainbow_laser': {
        const len = Math.max(6, size * 0.5);
        return (
          <g>
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - len} stroke="#00ffea" strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke="#ff00bb" strokeWidth={thickness} />
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke="#ffe600" strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke="#00ff44" strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'frost_crystal_glaze': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            {[0, 60, 120].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <line
                  key={deg}
                  x1={center - Math.cos(rad) * r}
                  y1={center - Math.sin(rad) * r}
                  x2={center + Math.cos(rad) * r}
                  y2={center + Math.sin(rad) * r}
                  stroke="#70d6ff"
                  strokeWidth={thickness}
                />
              );
            })}
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#70d6ff" strokeWidth={1} />}
          </g>
        );
      }

      case 'venom_viper_fang': {
        const r = Math.max(7, size * 0.65);
        return (
          <g>
            <path d={`M ${center - gap - 2} ${center - r} Q ${center - gap} ${center} ${center - gap - 4} ${center + r}`} fill="none" stroke="#39ff14" strokeWidth={2.5} />
            <path d={`M ${center + gap + 2} ${center - r} Q ${center + gap} ${center} ${center + gap + 4} ${center + r}`} fill="none" stroke="#39ff14" strokeWidth={2.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#39ff14" stroke="#ffffff" strokeWidth={1} />}
          </g>
        );
      }

      case 'crown_sight': {
        const w = size / 2;
        return (
          <g>
            <path d={`M ${center - w} ${center} L ${center - w * 0.5} ${center - w * 0.6} L ${center} ${center} L ${center + w * 0.5} ${center - w * 0.6} L ${center + w} ${center}`} fill="none" stroke={color} strokeWidth={thickness} />
            <line x1={center - w} y1={center} x2={center + w} y2={center} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center - gap} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'wraith_cross': {
        const l = size / 2.5;
        return (
          <g>
            <line x1={center - l} y1={center - l} x2={center + l} y2={center + l} stroke={color} strokeWidth={1} opacity="0.5" />
            <line x1={center + l} y1={center - l} x2={center - l} y2={center + l} stroke={color} strokeWidth={1} opacity="0.5" />
            <line x1={center} y1={center - l} x2={center} y2={center + l} stroke={color} strokeWidth={thickness} />
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={thickness} />
          </g>
        );
      }

      case 'shield_grid': {
        const s = size / 2;
        return (
          <g>
            <rect x={center - s} y={center - s} width={s * 2} height={s * 2} fill="none" stroke={color} strokeWidth={1} opacity="0.3" />
            <line x1={center - s} y1={center} x2={center + s} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center - s} y1={center - s / 2} x2={center - s + 5} y2={center - s / 2} stroke={color} strokeWidth={thickness} />
            <line x1={center + s} y1={center - s / 2} x2={center + s - 5} y2={center - s / 2} stroke={color} strokeWidth={thickness} />
          </g>
        );
      }

      case 'eye_iris': {
        const r = size / 2.2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={thickness} />
            <circle cx={center} cy={center} r={r * 0.4} fill={color} />
            <path d={`M ${center - r * 1.2} ${center} Q ${center} ${center - r * 0.8} ${center + r * 1.2} ${center}`} fill="none" stroke={color} strokeWidth={1} />
            <path d={`M ${center - r * 1.2} ${center} Q ${center} ${center + r * 0.8} ${center + r * 1.2} ${center}`} fill="none" stroke={color} strokeWidth={1} />
          </g>
        );
      }

      case 'binary_cross': {
        const l = size / 2;
        return (
          <g>
            <text x={center - 10} y={center - l} fill={color} fontSize="8" fontFamily="monospace">101</text>
            <text x={center + 2} y={center + l} fill={color} fontSize="8" fontFamily="monospace">010</text>
            <line x1={center} y1={center - l + 10} x2={center} y2={center + l - 10} stroke={color} strokeWidth={thickness} />
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={thickness} />
          </g>
        );
      }

      case 'thunder_core': {
        const r = size / 2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1} strokeDasharray="2 2" />
            <path d={`M ${center} ${center - r} L ${center - 3} ${center - r / 2} L ${center + 3} ${center - r / 2} L ${center} ${center}`} fill={color} />
            <path d={`M ${center} ${center + r} L ${center + 3} ${center + r / 2} L ${center - 3} ${center + r / 2} L ${center} ${center}`} fill={color} />
          </g>
        );
      }

      case 'oni_mask': {
        const s = size / 2;
        return (
          <g>
            <path d={`M ${center - s} ${center - s} L ${center - s * 0.5} ${center} L ${center} ${center + s} L ${center + s * 0.5} ${center} L ${center + s} ${center - s}`} fill="none" stroke={color} strokeWidth={thickness} />
            <circle cx={center - s * 0.4} cy={center - s * 0.2} r="2" fill={color} />
            <circle cx={center + s * 0.4} cy={center - s * 0.2} r="2" fill={color} />
          </g>
        );
      }

      case 'blackhole': {
        const r = size / 2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1} opacity="0.2" />
            <circle cx={center} cy={center} r={r * 0.7} fill="none" stroke={color} strokeWidth={2} opacity="0.5" />
            <circle cx={center} cy={center} r={r * 0.3} fill={color} />
          </g>
        );
      }

      case 'needle_cross': {
        const l = size / 2;
        return (
          <g>
            <line x1={center} y1={center - l} x2={center} y2={center + l} stroke={color} strokeWidth={0.5} />
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={0.5} />
            <circle cx={center} cy={center} r="1" fill={color} />
          </g>
        );
      }

      case 'cyber_grid': {
        const s = size / 2;
        return (
          <g>
            <line x1={center - s} y1={center - s} x2={center + s} y2={center - s} stroke={color} strokeWidth={1} strokeDasharray="2 2" />
            <line x1={center - s} y1={center + s} x2={center + s} y2={center + s} stroke={color} strokeWidth={1} strokeDasharray="2 2" />
            <line x1={center} y1={center - s} x2={center} y2={center + s} stroke={color} strokeWidth={thickness} />
          </g>
        );
      }

      case 'bamboo_frame': {
        const s = size / 2;
        return (
          <g>
            <line x1={center - s} y1={center - s} x2={center - s} y2={center + s} stroke={color} strokeWidth={3} strokeLinecap="round" />
            <line x1={center + s} y1={center - s} x2={center + s} y2={center + s} stroke={color} strokeWidth={3} strokeLinecap="round" />
            <line x1={center - s} y1={center} x2={center + s} y2={center} stroke={color} strokeWidth={1} />
          </g>
        );
      }

      case 'scout_mil': {
        const l = size / 2;
        return (
          <g>
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={1} />
            <line x1={center} y1={center - l} x2={center} y2={center + l} stroke={color} strokeWidth={1} />
            <line x1={center - 10} y1={center - 3} x2={center - 10} y2={center + 3} stroke={color} strokeWidth={1} />
            <line x1={center + 10} y1={center - 3} x2={center + 10} y2={center + 3} stroke={color} strokeWidth={1} />
          </g>
        );
      }

      case 'pixel_star': {
        const s = size / 4;
        return (
          <g>
            <rect x={center - s} y={center - s * 3} width={s * 2} height={s * 2} fill={color} />
            <rect x={center - s} y={center + s} width={s * 2} height={s * 2} fill={color} />
            <rect x={center - s * 3} y={center - s} width={s * 2} height={s * 2} fill={color} />
            <rect x={center + s} y={center - s} width={s * 2} height={s * 2} fill={color} />
          </g>
        );
      }

      case 'organic_hive': {
        const r = size / 2.5;
        return (
          <g>
            <path d={`M ${center} ${center - r} L ${center + r * 0.86} ${center - r * 0.5} L ${center + r * 0.86} ${center + r * 0.5} L ${center} ${center + r} L ${center - r * 0.86} ${center + r * 0.5} L ${center - r * 0.86} ${center - r * 0.5} Z`} fill="none" stroke={color} strokeWidth={thickness} />
            <circle cx={center} cy={center} r={r * 0.4} fill="none" stroke={color} strokeWidth={1} />
          </g>
        );
      }

      case 'laser_beam': {
        const l = size;
        return (
          <g>
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={6} opacity="0.2" />
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={2} />
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke="#ffffff" strokeWidth={0.5} />
          </g>
        );
      }

      case 'gear_aim': {
        const r = size / 2;
        return (
          <g>
            <circle cx={center} cy={center} r={r * 0.7} fill="none" stroke={color} strokeWidth={thickness} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
              const rad = (a * Math.PI) / 180;
              return <line key={a} x1={center + Math.cos(rad) * (r * 0.7)} y1={center + Math.sin(rad) * (r * 0.7)} x2={center + Math.cos(rad) * r} y2={center + Math.sin(rad) * r} stroke={color} strokeWidth={thickness} />;
            })}
          </g>
        );
      }

      case 'fractal_v1': {
        const s = size / 2;
        return (
          <g>
            <rect x={center - s} y={center - s} width={s * 2} height={s * 2} fill="none" stroke={color} strokeWidth={1} transform={`rotate(45 ${center} ${center})`} />
            <rect x={center - s * 0.7} y={center - s * 0.7} width={s * 1.4} height={s * 1.4} fill="none" stroke={color} strokeWidth={1} />
            <rect x={center - s * 0.5} y={center - s * 0.5} width={s} height={s} fill="none" stroke={color} strokeWidth={1} transform={`rotate(45 ${center} ${center})`} />
          </g>
        );
      }

      case 'shatter_prism': {
        const r = size / 2;
        return (
          <g>
            <line x1={center - r} y1={center - r * 0.2} x2={center + r} y2={center + r * 0.3} stroke={color} strokeWidth={1} />
            <line x1={center - r * 0.4} y1={center - r} x2={center + r * 0.2} y2={center + r} stroke={color} strokeWidth={1} />
            <polygon points={`${center-5},${center-5} ${center+5},${center} ${center},${center+5}`} fill={color} opacity="0.6" />
          </g>
        );
      }

      case 'delta_wing': {
        const s = size / 2;
        return (
          <g>
            <path d={`M ${center} ${center - s} L ${center - s} ${center + s * 0.5} L ${center + s} ${center + s * 0.5} Z`} fill="none" stroke={color} strokeWidth={thickness} />
            <line x1={center - s} y1={center} x2={center - s - 10} y2={center} stroke={color} strokeWidth={1} />
            <line x1={center + s} y1={center} x2={center + s + 10} y2={center} stroke={color} strokeWidth={1} />
          </g>
        );
      }

      case 'serpent_coil': {
        const r = size / 2.2;
        return (
          <g>
            <path d={`M ${center-r} ${center} Q ${center} ${center-r*1.5} ${center+r} ${center} T ${center-r} ${center}`} fill="none" stroke={color} strokeWidth={thickness} />
            <circle cx={center} cy={center} r="2" fill={color} />
          </g>
        );
      }

      case 'nebula_cloud': {
        const r = size / 2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill={color} opacity="0.1" />
            <circle cx={center} cy={center} r={r * 0.6} fill={color} opacity="0.2" />
            <circle cx={center} cy={center} r={2} fill="#ffffff" />
          </g>
        );
      }

      case 'tactical_overlay': {
        const l = size / 2;
        return (
          <g>
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={1} />
            <path d={`M ${center - 20} ${center - 10} L ${center - 20} ${center + 10}`} fill="none" stroke={color} strokeWidth={2} />
            <path d={`M ${center + 20} ${center - 10} L ${center + 20} ${center + 10}`} fill="none" stroke={color} strokeWidth={2} />
            <text x={center + 25} y={center - 5} fill={color} fontSize="6">ANG: 0.0</text>
          </g>
        );
      }

      case 'holo_sight': {
        const r = size / 2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1} strokeDasharray="4 2" />
            <circle cx={center} cy={center} r={2} fill={color} />
            <line x1={center} y1={center - r} x2={center} y2={center - r + 5} stroke={color} strokeWidth={2} />
          </g>
        );
      }

      case 'rune_circle': {
        const r = size / 2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={2} />
            <text x={center - 3} y={center - r + 8} fill={color} fontSize="8">ᚠ</text>
            <text x={center - 3} y={center + r - 2} fill={color} fontSize="8">ᚢ</text>
          </g>
        );
      }

      case 'cross_slash': {
        const l = size / 2;
        return (
          <g>
            <line x1={center - l} y1={center - 2} x2={center + l} y2={center + 2} stroke={color} strokeWidth={thickness} strokeLinecap="round" />
            <line x1={center + 2} y1={center - l} x2={center - 2} y2={center + l} stroke={color} strokeWidth={thickness} strokeLinecap="round" />
          </g>
        );
      }

      case 'compass_reticle': {
        const r = size / 2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1} />
            <text x={center - 5} y={center - r - 2} fill={color} fontSize="8" fontWeight="bold">N</text>
            <line x1={center} y1={center - r} x2={center} y2={center - r + 5} stroke={color} strokeWidth={2} />
          </g>
        );
      }

      case 'thermal_scope': {
        const r = size / 2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke="#ffaa00" strokeWidth={thickness} />
            <circle cx={center} cy={center} r={r * 0.5} fill="#ff4400" opacity="0.3" />
            <line x1={center - r} y1={center} x2={center + r} y2={center} stroke="#ffffff" strokeWidth={1} />
          </g>
        );
      }

      case 'eagle_eye': {
        const r = size / 2;
        return (
          <g>
            <path d={`M ${center - r} ${center - 5} Q ${center} ${center - r} ${center + r} ${center - 5}`} fill="none" stroke={color} strokeWidth={thickness} />
            <circle cx={center} cy={center} r="3" fill={color} />
          </g>
        );
      }

      case 'recoil_stabilizer': {
        const l = size / 2;
        return (
          <g>
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center - l} y1={center + 5} x2={center + l} y2={center + 5} stroke={color} strokeWidth={1} opacity="0.6" />
            <line x1={center - l} y1={center + 10} x2={center + l} y2={center + 10} stroke={color} strokeWidth={1} opacity="0.3" />
          </g>
        );
      }

      case 'dot_bracket': {
        const s = size / 2;
        return (
          <g>
            <path d={`M ${center - s} ${center - s + 5} L ${center - s} ${center - s} L ${center - s + 5} ${center - s}`} fill="none" stroke={color} strokeWidth={thickness} />
            <path d={`M ${center + s - 5} ${center - s} L ${center + s} ${center - s} L ${center + s} ${center - s + 5}`} fill="none" stroke={color} strokeWidth={thickness} />
            <path d={`M ${center - s} ${center + s - 5} L ${center - s} ${center + s} L ${center - s + 5} ${center + s}`} fill="none" stroke={color} strokeWidth={thickness} />
            <path d={`M ${center + s - 5} ${center + s} L ${center + s} ${center + s} L ${center + s} ${center + s - 5}`} fill="none" stroke={color} strokeWidth={thickness} />
            <circle cx={center} cy={center} r={dotSize} fill={color} />
          </g>
        );
      }

      case 'tank_scope': {
        const l = size / 2;
        return (
          <g>
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center - l} x2={center} y2={center + l} stroke={color} strokeWidth={thickness} />
            <rect x={center - 2} y={center - 2} width="4" height="4" fill={color} />
          </g>
        );
      }

      case 'complex_grid': {
        const s = size / 2;
        return (
          <g>
            <rect x={center - s} y={center - s} width={s * 2} height={s * 2} fill="none" stroke={color} strokeWidth={0.5} opacity="0.2" />
            <line x1={center - s} y1={center} x2={center + s} y2={center} stroke={color} strokeWidth={1} />
            <line x1={center} y1={center - s} x2={center} y2={center + s} stroke={color} strokeWidth={1} />
            <circle cx={center} cy={center} r={s * 0.5} fill="none" stroke={color} strokeWidth={0.5} opacity="0.4" />
          </g>
        );
      }

      case 'eclipse': {
        const r = size / 2.2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="#ffaa00" />
            <circle cx={center - 2} cy={center} r={r} fill="#000000" />
          </g>
        );
      }

      case 'lightning_bolts': {
        const s = size / 2;
        return (
          <g>
            <path d={`M ${center - s} ${center - s} L ${center - s * 0.5} ${center} L ${center - s} ${center} L ${center} ${center + s}`} fill="none" stroke={color} strokeWidth={thickness} />
            <path d={`M ${center + s} ${center - s} L ${center + s * 0.5} ${center} L ${center + s} ${center} L ${center} ${center + s}`} fill="none" stroke={color} strokeWidth={thickness} />
          </g>
        );
      }

      case 'toxic_cross': {
        const l = size / 2;
        return (
          <g>
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={thickness} />
            <circle cx={center - 10} cy={center + 5} r="1.5" fill={color} />
            <circle cx={center + 8} cy={center + 7} r="2" fill={color} />
          </g>
        );
      }

      case 'heartbeat_aim': {
        const l = size / 2;
        return (
          <g>
            <path d={`M ${center - l} ${center} L ${center - 10} ${center} L ${center - 5} ${center - 10} L ${center} ${center + 10} L ${center + 5} ${center} L ${center + l} ${center}`} fill="none" stroke={color} strokeWidth={thickness} />
          </g>
        );
      }

      case 'arrow_heads': {
        const gap_s = gap + 5;
        const s = 5;
        return (
          <g>
            <path d={`M ${center} ${center - gap_s} L ${center - s} ${center - gap_s - s} L ${center + s} ${center - gap_s - s} Z`} fill={color} />
            <path d={`M ${center} ${center + gap_s} L ${center - s} ${center + gap_s + s} L ${center + s} ${center + gap_s + s} Z`} fill={color} />
            <path d={`M ${center - gap_s} ${center} L ${center - gap_s - s} ${center - s} L ${center - gap_s - s} ${center + s} Z`} fill={color} />
            <path d={`M ${center + gap_s} ${center} L ${center + gap_s + s} ${center - s} L ${center + gap_s + s} ${center + s} Z`} fill={color} />
          </g>
        );
      }

      case 'portal_circle': {
        const r = size / 2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={thickness} strokeDasharray="10 5" />
            <circle cx={center} cy={center} r={r * 0.7} fill="none" stroke={color} strokeWidth={1} strokeDasharray="5 10" />
            <circle cx={center} cy={center} r={2} fill={color} />
          </g>
        );
      }

      case 'dragon_claws': {
        const r = size / 2;
        return (
          <g>
            <path d={`M ${center-r} ${center-r} Q ${center-r+5} ${center-r+10} ${center-gap} ${center-gap}`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
            <path d={`M ${center+r} ${center-r} Q ${center+r-5} ${center-r+10} ${center+gap} ${center-gap}`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
            <path d={`M ${center-r} ${center+r} Q ${center-r+5} ${center+r-10} ${center-gap} ${center+gap}`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
            <path d={`M ${center+r} ${center+r} Q ${center+r-5} ${center+r-10} ${center+gap} ${center+gap}`} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      }

      case 'scanner_reticle': {
        const l = size / 2;
        return (
          <g>
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={1} />
            <rect x={center - l} y={center - 15} width={l * 2} height="30" fill="none" stroke={color} strokeWidth={0.5} opacity="0.2" />
            <line x1={center - l} y1={center - 5} x2={center + l} y2={center - 5} stroke={color} strokeWidth={1} strokeDasharray="2 2" />
          </g>
        );
      }

      case 'plus_in_circle': {
        const r = size / 2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1} />
            <line x1={center - 6} y1={center} x2={center + 6} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center - 6} x2={center} y2={center + 6} stroke={color} strokeWidth={thickness} />
          </g>
        );
      }

      case 'star_gazer': {
        const r = size / 2;
        return (
          <g>
            <path d={`M ${center} ${center - r} L ${center + 2} ${center - 2} L ${center + r} ${center} L ${center + 2} ${center + 2} L ${center} ${center + r} L ${center - 2} ${center + 2} L ${center - r} ${center} L ${center - 2} ${center - 2} Z`} fill={color} />
            <circle cx={center - 10} cy={center - 10} r="0.5" fill="#ffffff" />
            <circle cx={center + 12} cy={center + 8} r="0.5" fill="#ffffff" />
          </g>
        );
      }

      case 'square_frame': {
        const s = size / 2.5;
        return (
          <g>
            <rect x={center - s} y={center - s} width={s * 2} height={s * 2} fill="none" stroke={color} strokeWidth={thickness} />
          </g>
        );
      }

      case 'cross_x': {
        const l = size / 2.5;
        return (
          <g>
            <line x1={center - l} y1={center - l} x2={center + l} y2={center + l} stroke={color} strokeWidth={thickness} strokeLinecap="round" />
            <line x1={center + l} y1={center - l} x2={center - l} y2={center + l} stroke={color} strokeWidth={thickness} strokeLinecap="round" />
          </g>
        );
      }

      case 'aim_assist': {
        const r = size / 2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1} strokeDasharray="1 3" />
            <line x1={center - 4} y1={center} x2={center + 4} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center - 4} x2={center} y2={center + 4} stroke={color} strokeWidth={thickness} />
          </g>
        );
      }

      case 'slime_dot': {
        return (
          <g>
            <circle cx={center} cy={center} r={dotSize + 2} fill={color} />
            <path d={`M ${center - 2} ${center + 3} Q ${center} ${center + 10} ${center + 2} ${center + 3}`} fill={color} />
          </g>
        );
      }

      case 'heavy_sniper': {
        const l = size / 2;
        return (
          <g>
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center - l} x2={center} y2={center + l} stroke={color} strokeWidth={thickness} />
          </g>
        );
      }

      case 'radar_reticle': {
        const r = size / 2;
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1} />
            <line x1={center} y1={center} x2={center + r} y2={center} stroke={color} strokeWidth={2} />
          </g>
        );
      }

      case 'marksman_scope': {
        const l = size / 2;
        return (
          <g>
            <line x1={center - l} y1={center} x2={center + l} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center - l} x2={center} y2={center + l} stroke={color} strokeWidth={1} />
            <path d={`M ${center - 10} ${center + 5} L ${center} ${center} L ${center + 10} ${center + 5}`} fill="none" stroke={color} strokeWidth={2} />
          </g>
        );
      }

      case 'pixel_grid': {
        const s = 2;
        return (
          <g>
            <rect x={center - gap - s} y={center - gap - s} width={s} height={s} fill={color} />
            <rect x={center + gap} y={center - gap - s} width={s} height={s} fill={color} />
            <rect x={center - gap - s} y={center + gap} width={s} height={s} fill={color} />
            <rect x={center + gap} y={center + gap} width={s} height={s} fill={color} />
          </g>
        );
      }

      default:
        return (
          <circle cx={center} cy={center} r={dotSize || 3} fill={color} />
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center select-none pointer-events-none ${className} ${
        pulse ? 'animate-pulse' : ''
      }`}
      style={{
        opacity,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
      }}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="overflow-visible"
        style={{
          filter: showGlow ? `drop-shadow(0 0 6px ${color})` : undefined,
        }}
      >
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={color} floodOpacity="0.8" />
          </filter>
        </defs>

        {renderShape()}
      </svg>
    </div>
  );
};
