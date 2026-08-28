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
  const size = overrideSize || customSettings?.size || design?.size || 30;
  const thickness = customSettings?.thickness ?? design?.thickness ?? 2;
  const gap = customSettings?.gap ?? design?.gap ?? 4;
  const dotSize = customSettings?.dotSize ?? design?.dotSize ?? 2.5;
  const showDot = customSettings?.showDot ?? design?.showDot ?? true;
  const hasOutline = customSettings?.hasOutline ?? design?.hasOutline ?? true;
  const outlineColor = customSettings?.outlineColor || design?.outlineColor || '#000000';
  const opacity = customSettings?.opacity ?? design?.opacity ?? 1.0;
  const rotation = (customSettings?.rotation ?? 0) + (design?.rotation ?? 0);
  const pulse = customSettings?.pulseAnimation ?? false;
  const shapeType = design?.shapeType || 'morph_geo_shifter';
  const isAnimated = design?.isAnimated !== false;

  // SVG dimensions
  const svgSize = Math.max(size * 2 + 24, 64);
  const center = svgSize / 2;

  // Filter ID for glowing shadow
  const filterId = `glow-${color.replace('#', '')}-${Math.floor(size)}`;

  // SVG Elements renderer based on shapeType
  const renderShape = () => {
    switch (shapeType) {
      // =====================================================================
      // 1. MORPHING & MULTI-STAGE TRANSITION LOOPS
      // =====================================================================

      case 'morph_geo_shifter': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            {/* Morphing Outer Frame: Circle -> Diamond -> Hexagon -> Shuriken */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${center} ${center}`}
                to={`360 ${center} ${center}`}
                dur="6s"
                repeatCount="indefinite"
              />
              {/* Pulsing & Morphing Shape Layer */}
              <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={thickness} opacity="0.8">
                <animate attributeName="r" values={`${r};${r * 0.75};${r * 1.15};${r * 0.85};${r}`} dur="5s" repeatCount="indefinite" />
                <animate attributeName="stroke-dasharray" values="100 0; 20 10; 4 4; 30 5; 100 0" dur="5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0.5;0.95;0.6;0.9" dur="5s" repeatCount="indefinite" />
              </circle>
              {/* Inner Diamond / Shuriken Points */}
              <polygon
                points={`${center},${center - r * 0.85} ${center + r * 0.85},${center} ${center},${center + r * 0.85} ${center - r * 0.85},${center}`}
                fill="none"
                stroke="#00e5ff"
                strokeWidth={1.5}
                opacity="0.8"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${center} ${center}`}
                  to={`-360 ${center} ${center}`}
                  dur="4s"
                  repeatCount="indefinite"
                />
                <animate attributeName="stroke" values={`${color};#ffffff;#00e5ff;${color}`} dur="5s" repeatCount="indefinite" />
              </polygon>
            </g>

            {/* Stable Precision Center Dot & Ticks */}
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - 4} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + 4} stroke={color} strokeWidth={thickness} />
            <line x1={center - gap} y1={center} x2={center - gap - 4} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + 4} y2={center} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'morph_tactical_cycle': {
        const s = Math.max(6, size * 0.5);
        return (
          <g>
            {/* Morphing Box to Cross to Diamond */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${center} ${center}`}
                to={`360 ${center} ${center}`}
                dur="8s"
                repeatCount="indefinite"
              />
              <rect
                x={center - s}
                y={center - s}
                width={s * 2}
                height={s * 2}
                rx="2"
                fill="none"
                stroke={color}
                strokeWidth={thickness}
              >
                <animate attributeName="width" values={`${s * 2};${s * 1.2};${s * 2.4};${s * 2}`} dur="4s" repeatCount="indefinite" />
                <animate attributeName="height" values={`${s * 2};${s * 2.4};${s * 1.2};${s * 2}`} dur="4s" repeatCount="indefinite" />
                <animate attributeName="rx" values="2;12;0;2" dur="4s" repeatCount="indefinite" />
                <animate attributeName="x" values={`${center - s};${center - s * 0.6};${center - s * 1.2};${center - s}`} dur="4s" repeatCount="indefinite" />
                <animate attributeName="y" values={`${center - s};${center - s * 1.2};${center - s * 0.6};${center - s}`} dur="4s" repeatCount="indefinite" />
              </rect>
            </g>
            {/* Steady Aim Cross Bars */}
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - 5} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + 5} stroke={color} strokeWidth={thickness} />
            <line x1={center - gap} y1={center} x2={center - gap - 5} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + 5} y2={center} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'morph_elemental_core': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4s" repeatCount="indefinite" />
              <polygon
                points={`${center},${center - r} ${center + r * 0.866},${center + r * 0.5} ${center - r * 0.866},${center + r * 0.5}`}
                fill="none"
                stroke={color}
                strokeWidth={thickness}
              >
                <animate attributeName="stroke" values="#ff007f;#00e5ff;#ffd600;#ff007f" dur="4s" repeatCount="indefinite" />
                <animate attributeName="stroke-width" values={`${thickness};${thickness + 1.5};${thickness}`} dur="2s" repeatCount="indefinite" />
              </polygon>
            </g>
            <circle cx={center} cy={center} r={r * 0.5} fill="none" stroke="#ffffff" strokeWidth={1} strokeDasharray="4 3">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`-360 ${center} ${center}`} dur="3s" repeatCount="indefinite" />
            </circle>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'morph_celestial_seal': {
        const r = Math.max(9, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="7s" repeatCount="indefinite" />
              <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="8 4" />
              {/* Star Morph Points */}
              <polygon
                points={`${center},${center - r * 0.8} ${center + r * 0.25},${center - r * 0.25} ${center + r * 0.8},${center} ${center + r * 0.25},${center + r * 0.25} ${center},${center + r * 0.8} ${center - r * 0.25},${center + r * 0.25} ${center - r * 0.8},${center} ${center - r * 0.25},${center - r * 0.25}`}
                fill="none"
                stroke="#ffee00"
                strokeWidth={1.8}
              >
                <animate attributeName="stroke-width" values="1.2;2.4;1.2" dur="2s" repeatCount="indefinite" />
              </polygon>
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize + 0.5} fill="#ffffff" stroke="#ffd600" strokeWidth={1.5} />}
          </g>
        );
      }

      case 'morph_cyber_matrix': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`-360 ${center} ${center}`} dur="6s" repeatCount="indefinite" />
              {[0, 60, 120, 180, 240, 300].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <circle
                    key={deg}
                    cx={center + Math.cos(rad) * r}
                    cy={center + Math.sin(rad) * r}
                    r={1.8}
                    fill={color}
                  >
                    <animate attributeName="r" values="1.5;3;1.5" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                );
              })}
            </g>
            <line x1={center - r * 0.8} y1={center} x2={center + r * 0.8} y2={center} stroke={color} strokeWidth={thickness} strokeDasharray="3 2" />
            <line x1={center} y1={center - r * 0.8} x2={center} y2={center + r * 0.8} stroke={color} strokeWidth={thickness} strokeDasharray="3 2" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'morph_valkyrie_wings': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            {/* Left Arc Wing */}
            <path
              d={`M ${center - gap} ${center} Q ${center - r * 0.8} ${center - r} ${center - r} ${center + r * 0.3}`}
              fill="none"
              stroke={color}
              strokeWidth={thickness + 0.5}
              strokeLinecap="round"
            >
              <animate attributeName="stroke" values={`${color};#ffffff;${color}`} dur="2s" repeatCount="indefinite" />
            </path>
            {/* Right Arc Wing */}
            <path
              d={`M ${center + gap} ${center} Q ${center + r * 0.8} ${center - r} ${center + r} ${center + r * 0.3}`}
              fill="none"
              stroke={color}
              strokeWidth={thickness + 0.5}
              strokeLinecap="round"
            >
              <animate attributeName="stroke" values={`${color};#ffffff;${color}`} dur="2s" repeatCount="indefinite" />
            </path>
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + 6} stroke={color} strokeWidth={thickness} strokeLinecap="round" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'morph_quantum_loop': {
        const r = Math.max(7, size * 0.6);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4s" repeatCount="indefinite" />
              <ellipse cx={center} cy={center} rx={r} ry={r * 0.45} fill="none" stroke={color} strokeWidth={1.8} />
              <ellipse cx={center} cy={center} rx={r * 0.45} ry={r} fill="none" stroke="#ffffff" strokeWidth={1.2} opacity="0.8" />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#00e5ff" stroke="#ffffff" strokeWidth={1} />}
          </g>
        );
      }

      case 'morph_inferno_flare': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke="#ff3b00" strokeWidth={2}>
              <animate attributeName="r" values={`${r * 0.7};${r * 1.1};${r * 0.7}`} dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="stroke" values="#ff3b00;#ffee00;#ff3b00" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - 5} stroke="#ff5500" strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + 5} stroke="#ff5500" strokeWidth={thickness} />
            <line x1={center - gap} y1={center} x2={center - gap - 5} y2={center} stroke="#ff5500" strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + 5} y2={center} stroke="#ff5500" strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffee00" stroke="#ff0000" strokeWidth={1} />}
          </g>
        );
      }

      case 'morph_ninja_shuriken': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="2.5s" repeatCount="indefinite" />
              {[0, 90, 180, 270].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const x = center + Math.cos(rad) * r;
                const y = center + Math.sin(rad) * r;
                return (
                  <path
                    key={deg}
                    d={`M ${center} ${center} Q ${center + Math.cos(rad + 0.4) * (r * 0.6)} ${center + Math.sin(rad + 0.4) * (r * 0.6)} ${x} ${y}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={thickness + 0.5}
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'morph_bio_hazard': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="5s" repeatCount="indefinite" />
              {[0, 120, 240].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const cx = center + Math.cos(rad) * (r * 0.65);
                const cy = center + Math.sin(rad) * (r * 0.65);
                return <circle key={deg} cx={cx} cy={cy} r={r * 0.4} fill="none" stroke={color} strokeWidth={1.8} />;
              })}
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'morph_chrono_dial': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4 4" />
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="3s" repeatCount="indefinite" />
              <line x1={center} y1={center} x2={center} y2={center - r + 2} stroke="#ffffff" strokeWidth={2} strokeLinecap="round" />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'morph_radar_sweep_box': {
        const s = Math.max(7, size * 0.55);
        return (
          <g>
            <rect x={center - s} y={center - s} width={s * 2} height={s * 2} fill="none" stroke={color} strokeWidth={1.8}>
              <animate attributeName="stroke-dasharray" values="20 5; 5 20; 20 5" dur="2s" repeatCount="indefinite" />
            </rect>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="3s" repeatCount="indefinite" />
              <line x1={center} y1={center} x2={center + s} y2={center} stroke="#ffffff" strokeWidth={1.5} />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ff0000" stroke="#ffffff" strokeWidth={1} />}
          </g>
        );
      }

      case 'morph_neon_prism': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4s" repeatCount="indefinite" />
              <polygon
                points={`${center},${center - r} ${center + r * 0.866},${center + r * 0.5} ${center - r * 0.866},${center + r * 0.5}`}
                fill="none"
                stroke="#ec4899"
                strokeWidth={2}
              >
                <animate attributeName="stroke" values="#ec4899;#38bdf8;#facc15;#ec4899" dur="3s" repeatCount="indefinite" />
              </polygon>
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'morph_void_portal': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={2}>
              <animate attributeName="r" values={`${r};${r * 0.3};${r}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={center} cy={center} r={r * 0.5} fill="none" stroke="#ffffff" strokeWidth={1.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#c084fc" stroke="#ffffff" strokeWidth={1} />}
          </g>
        );
      }

      case 'morph_assassin_cross': {
        const len = Math.max(5, size * 0.45);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="6s" repeatCount="indefinite" />
              <line x1={center - len} y1={center - len} x2={center - gap * 0.7} y2={center - gap * 0.7} stroke={color} strokeWidth={thickness} />
              <line x1={center + gap * 0.7} y1={center + gap * 0.7} x2={center + len} y2={center + len} stroke={color} strokeWidth={thickness} />
              <line x1={center + len} y1={center - len} x2={center + gap * 0.7} y2={center - gap * 0.7} stroke={color} strokeWidth={thickness} />
              <line x1={center - gap * 0.7} y1={center + gap * 0.7} x2={center - len} y2={center + len} stroke={color} strokeWidth={thickness} />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      // =====================================================================
      // 2. CYBERPUNK & QUANTUM SCI-FI
      // =====================================================================

      case 'cyber_pulsar_ring': {
        const r = Math.max(7, size * 0.65);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={thickness} opacity="0.4">
              <animate attributeName="r" values={`${r * 0.8};${r * 1.15};${r * 0.8}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={center} cy={center} r={r * 0.6} fill="none" stroke={color} strokeWidth={1.5} />
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
            <line x1={center - len} y1={center - 1} x2={center + len} y2={center - 1} stroke="#00e5ff" strokeWidth={1} opacity="0.7">
              <animate attributeName="x1" values={`${center - len};${center - len - 3};${center - len}`} dur="0.8s" repeatCount="indefinite" />
            </line>
            <line x1={center + 1} y1={center - len} x2={center + 1} y2={center + len} stroke="#ff0055" strokeWidth={1} opacity="0.7">
              <animate attributeName="y1" values={`${center - len};${center - len + 3};${center - len}`} dur="0.6s" repeatCount="indefinite" />
            </line>
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - len} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke={color} strokeWidth={thickness} />
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'matrix_stream_reticle': {
        const len = Math.max(6, size * 0.5);
        return (
          <g>
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - len} stroke={color} strokeWidth={thickness} strokeDasharray="3 2">
              <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite" />
            </line>
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke={color} strokeWidth={thickness} strokeDasharray="3 2">
              <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" repeatCount="indefinite" />
            </line>
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke={color} strokeWidth={thickness} strokeDasharray="3 2" />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke={color} strokeWidth={thickness} strokeDasharray="3 2" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#39ff14" stroke="#ffffff" strokeWidth={0.8} />}
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

      case 'cyber_valkyrie_cross': {
        const s = Math.max(7, size * 0.6);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="8s" repeatCount="indefinite" />
              <path d={`M ${center - s} ${center - s + 5} L ${center - s} ${center - s} L ${center - s + 5} ${center - s}`} fill="none" stroke={color} strokeWidth={thickness} />
              <path d={`M ${center + s - 5} ${center - s} L ${center + s} ${center - s} L ${center + s} ${center - s + 5}`} fill="none" stroke={color} strokeWidth={thickness} />
              <path d={`M ${center - s} ${center + s - 5} L ${center - s} ${center + s} L ${center - s + 5} ${center + s}`} fill="none" stroke={color} strokeWidth={thickness} />
              <path d={`M ${center + s - 5} ${center + s} L ${center + s} ${center + s} L ${center + s} ${center + s - 5}`} fill="none" stroke={color} strokeWidth={thickness} />
            </g>
            <circle cx={center} cy={center} r={dotSize + 2} fill="none" stroke="#00e5ff" strokeWidth={1} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
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
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="6s" repeatCount="indefinite" />
              <polygon points={points} fill="none" stroke={color} strokeWidth={1.8} strokeDasharray="8 4" />
            </g>
            <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />
          </g>
        );
      }

      case 'holo_matrix_grid': {
        const s = Math.max(6, size * 0.5);
        return (
          <g>
            <circle cx={center} cy={center} r={s * 1.3} fill="none" stroke="#00e5ff" strokeWidth={1.5} opacity="0.6">
              <animate attributeName="r" values={`${s * 1.1};${s * 1.4};${s * 1.1}`} dur="2s" repeatCount="indefinite" />
            </circle>
            <rect x={center - s} y={center - s} width={s * 2} height={s * 2} fill="none" stroke={color} strokeWidth={1} strokeDasharray="2 2" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'cyber_katana_cross': {
        const len = Math.max(6, size * 0.55);
        return (
          <g>
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - len} stroke={color} strokeWidth={2.5} strokeLinecap="round">
              <animate attributeName="stroke" values={`${color};#ffffff;${color}`} dur="1.5s" repeatCount="indefinite" />
            </line>
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'tachyon_beam_core': {
        const r = Math.max(7, size * 0.55);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="1.5s" repeatCount="indefinite" />
              <circle cx={center} cy={center - r} r={1.8} fill={color} />
              <circle cx={center} cy={center + r} r={1.8} fill={color} />
              <circle cx={center - r} cy={center} r={1.8} fill={color} />
              <circle cx={center + r} cy={center} r={1.8} fill={color} />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize + 0.5} fill="#ffffff" stroke="#facc15" strokeWidth={1.5} />}
          </g>
        );
      }

      case 'neon_circuit_cross': {
        const len = Math.max(6, size * 0.5);
        return (
          <g>
            <path d={`M ${center} ${center - gap} L ${center} ${center - gap - len} L ${center + 4} ${center - gap - len}`} fill="none" stroke={color} strokeWidth={2} />
            <path d={`M ${center} ${center + gap} L ${center} ${center + gap + len} L ${center - 4} ${center + gap + len}`} fill="none" stroke={color} strokeWidth={2} />
            <path d={`M ${center - gap} ${center} L ${center - gap - len} ${center} L ${center - gap - len} ${center + 4}`} fill="none" stroke={color} strokeWidth={2} />
            <path d={`M ${center + gap} ${center} L ${center + gap + len} ${center} L ${center + gap + len} ${center - 4}`} fill="none" stroke={color} strokeWidth={2} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'cyber_optic_visor': {
        const w = Math.max(10, size * 0.8);
        return (
          <g>
            <line x1={center - w} y1={center} x2={center + w} y2={center} stroke={color} strokeWidth={1.5} opacity="0.6" />
            <line x1={center - 8} y1={center - 6} x2={center + 8} y2={center - 6} stroke={color} strokeWidth={2} />
            <line x1={center - 8} y1={center + 6} x2={center + 8} y2={center + 6} stroke={color} strokeWidth={2} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'nano_swarm_sensor': {
        const r = Math.max(6, size * 0.5);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="2s" repeatCount="indefinite" />
              <circle cx={center + r} cy={center} r={1.6} fill={color} />
              <circle cx={center - r} cy={center} r={1.6} fill={color} />
              <circle cx={center} cy={center + r} r={1.6} fill={color} />
              <circle cx={center} cy={center - r} r={1.6} fill={color} />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'cyber_glitch_v2': {
        const s = Math.max(5, size * 0.4);
        return (
          <g>
            <rect x={center - s - 1} y={center - s - 1} width={s * 2} height={s * 2} fill="none" stroke="#00e5ff" strokeWidth={1}>
              <animate attributeName="x" values={`${center - s - 1};${center - s + 2};${center - s - 1}`} dur="0.4s" repeatCount="indefinite" />
            </rect>
            <rect x={center - s} y={center - s} width={s * 2} height={s * 2} fill="none" stroke="#ff007f" strokeWidth={1.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'cyber_laser_quad': {
        const len = Math.max(6, size * 0.5);
        return (
          <g>
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - len} stroke={color} strokeWidth={thickness} strokeDasharray="3 2" />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke={color} strokeWidth={thickness} strokeDasharray="3 2" />
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke={color} strokeWidth={thickness} strokeDasharray="3 2" />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke={color} strokeWidth={thickness} strokeDasharray="3 2" />
            <circle cx={center} cy={center} r={dotSize + 2} fill="none" stroke="#ffffff" strokeWidth={1} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'synthwave_grid_cross': {
        const s = Math.max(8, size * 0.65);
        return (
          <g>
            <line x1={center - s} y1={center + 4} x2={center + s} y2={center + 4} stroke="#f43f5e" strokeWidth={1.5} />
            <line x1={center - s * 0.7} y1={center + 8} x2={center + s * 0.7} y2={center + 8} stroke="#f43f5e" strokeWidth={1.2} opacity="0.6" />
            <line x1={center} y1={center - s} x2={center} y2={center + s} stroke="#38bdf8" strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#facc15" stroke="#ffffff" strokeWidth={1} />}
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

      case 'apex_overcharge_optic': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1.8} strokeDasharray="12 6">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4s" repeatCount="indefinite" />
            </circle>
            <path d={`M ${center - 4} ${center - gap} L ${center} ${center - gap - 6} L ${center + 4} ${center - gap}`} fill="none" stroke="#ffffff" strokeWidth={2} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'thunder_bolt_core': {
        const len = Math.max(6, size * 0.45);
        return (
          <g>
            <path d={`M ${center - len} ${center - len} L ${center - gap} ${center - gap}`} fill="none" stroke="#ffd600" strokeWidth={thickness} />
            <path d={`M ${center + len} ${center - len} L ${center + gap} ${center - gap}`} fill="none" stroke="#ffd600" strokeWidth={thickness} />
            <path d={`M ${center - len} ${center + len} L ${center - gap} ${center + gap}`} fill="none" stroke="#ffd600" strokeWidth={thickness} />
            <path d={`M ${center + len} ${center + len} L ${center + gap} ${center + gap}`} fill="none" stroke="#ffd600" strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#ffd600" strokeWidth={1} />}
          </g>
        );
      }

      // =====================================================================
      // 3. MAGICAL & ANIME MYSTIC GLYPHS
      // =====================================================================

      case 'fire_dragon_vortex': {
        const r = Math.max(9, size * 0.75);
        return (
          <g>
            {/* Outer Magical Rotating Fire Ring */}
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="2.5s" repeatCount="indefinite" />
              <circle cx={center} cy={center} r={r} fill="none" stroke="#ff5500" strokeWidth={2} strokeDasharray="14 8" opacity="0.9" />
              <circle cx={center} cy={center} r={r * 0.75} fill="none" stroke="#ffee00" strokeWidth={1.5} strokeDasharray="6 10" opacity="0.9" />
            </g>
            {/* Outer perimeter ember orb */}
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="1.8s" repeatCount="indefinite" />
              <circle cx={center + r} cy={center} r={2.2} fill="#ffee00" stroke="#ff5500" strokeWidth={1} />
            </g>
            {/* Crosshair ticks */}
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - 5} stroke="#ffea00" strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + 5} stroke="#ffea00" strokeWidth={thickness} />
            <line x1={center - gap} y1={center} x2={center - gap - 5} y2={center} stroke="#ffea00" strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + 5} y2={center} stroke="#ffea00" strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={Math.max(2, dotSize)} fill="#ffffff" stroke="#ff4400" strokeWidth={1.5} />}
          </g>
        );
      }

      case 'sharingan_3tomoe_spin': {
        const r = Math.max(9, size * 0.75);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="#dc2626" opacity="0.3" />
            <circle cx={center} cy={center} r={r} fill="none" stroke="#000000" strokeWidth={2} />
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="2s" repeatCount="indefinite" />
              {[0, 120, 240].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const tx = center + Math.cos(rad) * (r * 0.6);
                const ty = center + Math.sin(rad) * (r * 0.6);
                return (
                  <g key={deg}>
                    <circle cx={tx} cy={ty} r={2.2} fill="#000000" />
                    <path d={`M ${tx} ${ty} Q ${tx + Math.cos(rad + 0.6) * 4} ${ty + Math.sin(rad + 0.6) * 4} ${tx + Math.cos(rad + 1.2) * 5} ${ty + Math.sin(rad + 1.2) * 5}`} fill="none" stroke="#000000" strokeWidth={1.5} />
                  </g>
                );
              })}
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#000000" stroke="#ff0000" strokeWidth={1} />}
          </g>
        );
      }

      case 'rinnegan_graviton_waves': {
        const r = Math.max(9, size * 0.75);
        return (
          <g>
            {[1, 0.75, 0.5, 0.25].map((scale, i) => (
              <circle key={i} cx={center} cy={center} r={r * scale} fill="none" stroke="#9333ea" strokeWidth={1.5} opacity={0.4 + i * 0.2}>
                <animate attributeName="r" values={`${r * scale * 0.8};${r * scale * 1.1};${r * scale * 0.8}`} dur="2.5s" repeatCount="indefinite" />
              </circle>
            ))}
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#9333ea" strokeWidth={1} />}
          </g>
        );
      }

      case 'dr_strange_magic_seal': {
        const r = Math.max(9, size * 0.75);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4s" repeatCount="indefinite" />
              <rect x={center - r * 0.6} y={center - r * 0.6} width={r * 1.2} height={r * 1.2} fill="none" stroke="#f97316" strokeWidth={1.5} />
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`-360 ${center} ${center}`} dur="4s" repeatCount="indefinite" />
              <rect x={center - r * 0.6} y={center - r * 0.6} width={r * 1.2} height={r * 1.2} fill="none" stroke="#ffd600" strokeWidth={1.5} />
            </g>
            <circle cx={center} cy={center} r={r} fill="none" stroke="#f97316" strokeWidth={1.5} strokeDasharray="6 3" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#f97316" strokeWidth={1} />}
          </g>
        );
      }

      case 'alchemy_transmute_circle': {
        const r = Math.max(9, size * 0.75);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1.8} />
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="6s" repeatCount="indefinite" />
              <polygon points={`${center},${center - r} ${center + r * 0.866},${center + r * 0.5} ${center - r * 0.866},${center + r * 0.5}`} fill="none" stroke={color} strokeWidth={1.2} />
              <polygon points={`${center},${center + r} ${center + r * 0.866},${center - r * 0.5} ${center - r * 0.866},${center - r * 0.5}`} fill="none" stroke={color} strokeWidth={1.2} />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'celestial_lotus_mandala': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="8s" repeatCount="indefinite" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <circle
                    key={deg}
                    cx={center + Math.cos(rad) * (r * 0.6)}
                    cy={center + Math.sin(rad) * (r * 0.6)}
                    r={r * 0.35}
                    fill="none"
                    stroke={color}
                    strokeWidth={1.2}
                  />
                );
              })}
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'phoenix_wing': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <path d={`M ${center - gap} ${center} Q ${center - r} ${center - r * 0.6} ${center - r} ${center + r * 0.4}`} fill="none" stroke="#ff2a00" strokeWidth={thickness + 0.5} strokeLinecap="round" />
            <path d={`M ${center + gap} ${center} Q ${center + r} ${center - r * 0.6} ${center + r} ${center + r * 0.4}`} fill="none" stroke="#ff2a00" strokeWidth={thickness + 0.5} strokeLinecap="round" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffee00" stroke="#ff0000" strokeWidth={1} />}
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

      case 'astral_nebula_dot': {
        return (
          <g>
            <circle cx={center} cy={center} r={dotSize + 4} fill="none" stroke="#00e5ff" strokeWidth={1} opacity="0.6">
              <animate attributeName="r" values={`${dotSize + 2};${dotSize + 6};${dotSize + 2}`} dur="2s" repeatCount="indefinite" />
            </circle>
            <polygon points={`${center},${center - dotSize - 2} ${center + dotSize + 2},${center} ${center},${center + dotSize + 2} ${center - dotSize - 2},${center}`} fill={color} />
          </g>
        );
      }

      case 'raijin_thunder_seal': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="3s" repeatCount="indefinite" />
              {[0, 120, 240].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return <circle key={deg} cx={center + Math.cos(rad) * (r * 0.7)} cy={center + Math.sin(rad) * (r * 0.7)} r={2.5} fill="#eab308" stroke="#000000" strokeWidth={1} />;
              })}
            </g>
            <circle cx={center} cy={center} r={r} fill="none" stroke="#eab308" strokeWidth={1.5} strokeDasharray="3 3" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#eab308" strokeWidth={1} />}
          </g>
        );
      }

      case 'demonic_blood_seal': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <polygon points={`${center},${center - r} ${center + r * 0.866},${center + r * 0.5} ${center - r * 0.866},${center + r * 0.5}`} fill="none" stroke="#b91c1c" strokeWidth={2} />
            <polygon points={`${center},${center + r} ${center + r * 0.866},${center - r * 0.5} ${center - r * 0.866},${center - r * 0.5}`} fill="none" stroke="#dc2626" strokeWidth={1.5} opacity="0.7" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#b91c1c" strokeWidth={1} />}
          </g>
        );
      }

      case 'valkyrie_holy_crest': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <path d={`M ${center - r} ${center - 2} Q ${center} ${center + r} ${center + r} ${center - 2}`} fill="none" stroke="#facc15" strokeWidth={2} />
            <line x1={center} y1={center - r} x2={center} y2={center + 2} stroke="#facc15" strokeWidth={2} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
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

      case 'rune_elder_futhark': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="10s" repeatCount="indefinite" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <line
                    key={deg}
                    x1={center + Math.cos(rad) * gap}
                    y1={center + Math.sin(rad) * gap}
                    x2={center + Math.cos(rad) * r}
                    y2={center + Math.sin(rad) * r}
                    stroke={color}
                    strokeWidth={1.5}
                  />
                );
              })}
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'moon_crescent_artemis': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <path d={`M ${center - r * 0.7} ${center - r * 0.7} A ${r} ${r} 0 0 0 ${center - r * 0.7} ${center + r * 0.7} A ${r * 0.8} ${r * 0.8} 0 0 1 ${center - r * 0.7} ${center - r * 0.7}`} fill="none" stroke="#e2e8f0" strokeWidth={2} />
            <line x1={center - gap} y1={center} x2={center + r} y2={center} stroke="#ffffff" strokeWidth={1.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#38bdf8" />}
          </g>
        );
      }

      case 'fox_spirit_nine_tails': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="3s" repeatCount="indefinite" />
              {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return <circle key={deg} cx={center + Math.cos(rad) * r} cy={center + Math.sin(rad) * r} r={1.5} fill="#f97316" />;
              })}
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#ea580c" strokeWidth={1} />}
          </g>
        );
      }

      case 'eye_of_horus_divine': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <path d={`M ${center - r} ${center} Q ${center} ${center - r * 0.7} ${center + r} ${center}`} fill="none" stroke="#eab308" strokeWidth={2} />
            <path d={`M ${center - r} ${center} Q ${center} ${center + r * 0.7} ${center + r} ${center}`} fill="none" stroke="#eab308" strokeWidth={2} />
            <circle cx={center} cy={center} r={r * 0.35} fill="#eab308" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'frost_crystal_glaze': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="8s" repeatCount="indefinite" />
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
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#70d6ff" strokeWidth={1} />}
          </g>
        );
      }

      // =====================================================================
      // 4. ORBITAL & VORTEX DYNAMICS
      // =====================================================================

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

      case 'planetary_saturn_rings': {
        const r = Math.max(9, size * 0.75);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`-25 ${center} ${center}`} to={`-25 ${center} ${center}`} />
              <ellipse cx={center} cy={center} rx={r} ry={r * 0.35} fill="none" stroke={color} strokeWidth={1.8} />
              <g>
                <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="3s" repeatCount="indefinite" />
                <circle cx={center + r} cy={center} r={2} fill="#ffffff" />
              </g>
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'atomic_electron_shell': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="5s" repeatCount="indefinite" />
              <ellipse cx={center} cy={center} rx={r} ry={r * 0.35} fill="none" stroke={color} strokeWidth={1.2} />
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`60 ${center} ${center}`} to={`420 ${center} ${center}`} dur="5s" repeatCount="indefinite" />
              <ellipse cx={center} cy={center} rx={r} ry={r * 0.35} fill="none" stroke="#00e5ff" strokeWidth={1.2} />
            </g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`120 ${center} ${center}`} to={`480 ${center} ${center}`} dur="5s" repeatCount="indefinite" />
              <ellipse cx={center} cy={center} rx={r} ry={r * 0.35} fill="none" stroke="#ff007f" strokeWidth={1.2} />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'hyper_recoil_gyro': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="6 3">
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="5s" repeatCount="indefinite" />
            </circle>
            <line x1={center - r - 4} y1={center} x2={center - r + 3} y2={center} stroke="#ffffff" strokeWidth={2} />
            <line x1={center + r - 3} y1={center} x2={center + r + 4} y2={center} stroke="#ffffff" strokeWidth={2} />
            <line x1={center} y1={center - r - 4} x2={center} y2={center - r + 3} stroke="#ffffff" strokeWidth={2} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'triple_satellite_lock': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1} opacity="0.4" />
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="2s" repeatCount="indefinite" />
              <circle cx={center + r} cy={center} r={2} fill="#ffffff" />
              <circle cx={center - r * 0.5} cy={center + r * 0.866} r={2} fill="#ffffff" />
              <circle cx={center - r * 0.5} cy={center - r * 0.866} r={2} fill="#ffffff" />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'cyclone_razor_turbine': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="1.8s" repeatCount="indefinite" />
              {[0, 60, 120, 180, 240, 300].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <line
                    key={deg}
                    x1={center + Math.cos(rad) * (r * 0.3)}
                    y1={center + Math.sin(rad) * (r * 0.3)}
                    x2={center + Math.cos(rad + 0.3) * r}
                    y2={center + Math.sin(rad + 0.3) * r}
                    stroke={color}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
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

      case 'blackhole_graviton_lens': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="5s" repeatCount="indefinite" />
              <path d={`M ${center - r} ${center} A ${r} ${r} 0 0 1 ${center + r} ${center}`} fill="none" stroke="#8b5cf6" strokeWidth={2.5} strokeLinecap="round" />
              <path d={`M ${center + r} ${center} A ${r} ${r} 0 0 1 ${center - r} ${center}`} fill="none" stroke="#d946ef" strokeWidth={2.5} strokeLinecap="round" />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'infinity_loop_orbital': {
        const s = Math.max(6, size * 0.5);
        return (
          <g>
            <circle cx={center - s * 0.5} cy={center} r={s * 0.6} fill="none" stroke={color} strokeWidth={1.8} />
            <circle cx={center + s * 0.5} cy={center} r={s * 0.6} fill="none" stroke={color} strokeWidth={1.8} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'galaxy_spiral_andromeda': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4s" repeatCount="indefinite" />
              <path d={`M ${center} ${center} Q ${center + r * 0.5} ${center - r * 0.5} ${center + r} ${center}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
              <path d={`M ${center} ${center} Q ${center - r * 0.5} ${center + r * 0.5} ${center - r} ${center}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'tri_blade_shuriken_spin': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="1.5s" repeatCount="indefinite" />
              {[0, 120, 240].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <path
                    key={deg}
                    d={`M ${center} ${center} L ${center + Math.cos(rad) * r} ${center + Math.sin(rad) * r} L ${center + Math.cos(rad + 0.3) * (r * 0.6)} ${center + Math.sin(rad + 0.3) * (r * 0.6)} Z`}
                    fill={color}
                  />
                );
              })}
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'supernova_shockwave_ring': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={2}>
              <animate attributeName="r" values={`${gap};${r};${gap}`} dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.1;1" dur="1.8s" repeatCount="indefinite" />
            </circle>
            {showDot && <circle cx={center} cy={center} r={dotSize + 0.5} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'radar_sweep_sonar': {
        const r = Math.max(8, size * 0.75);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1.5} opacity="0.6" />
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="2s" repeatCount="indefinite" />
              <line x1={center} y1={center} x2={center + r} y2={center} stroke={color} strokeWidth={2} />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'gyro_compass_navigator': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1.5} />
            <polygon points={`${center},${center - r - 3} ${center + 3},${center - r + 3} ${center - 3},${center - r + 3}`} fill="#ff0000" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'plasma_gear_rotator': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="5s" repeatCount="indefinite" />
              <circle cx={center} cy={center} r={r * 0.7} fill="none" stroke={color} strokeWidth={2} />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
                const rad = (a * Math.PI) / 180;
                return (
                  <line
                    key={a}
                    x1={center + Math.cos(rad) * (r * 0.7)}
                    y1={center + Math.sin(rad) * (r * 0.7)}
                    x2={center + Math.cos(rad) * r}
                    y2={center + Math.sin(rad) * r}
                    stroke={color}
                    strokeWidth={2}
                  />
                );
              })}
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'pulsar_beacon_star': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="1.2s" repeatCount="indefinite" />
              <line x1={center - r} y1={center} x2={center + r} y2={center} stroke="#ffffff" strokeWidth={2} />
            </g>
            <circle cx={center} cy={center} r={r * 0.4} fill={color} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'vortex_funnel_cross': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <path d={`M ${center - r} ${center - r} Q ${center} ${center - r * 0.5} ${center} ${center}`} fill="none" stroke={color} strokeWidth={2} />
            <path d={`M ${center + r} ${center - r} Q ${center + r * 0.5} ${center} ${center} ${center}`} fill="none" stroke={color} strokeWidth={2} />
            <path d={`M ${center + r} ${center + r} Q ${center} ${center + r * 0.5} ${center} ${center}`} fill="none" stroke={color} strokeWidth={2} />
            <path d={`M ${center - r} ${center + r} Q ${center - r * 0.5} ${center} ${center} ${center}`} fill="none" stroke={color} strokeWidth={2} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'orbit_cross_beads': {
        const len = Math.max(6, size * 0.55);
        return (
          <g>
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - len} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke={color} strokeWidth={thickness} />
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke={color} strokeWidth={thickness} />
            {/* Pulsing beads on 4 bars */}
            <circle cx={center} cy={center - gap - len * 0.5} r={2} fill="#ffffff">
              <animate attributeName="cy" values={`${center - gap};${center - gap - len};${center - gap}`} dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={center} cy={center + gap + len * 0.5} r={2} fill="#ffffff">
              <animate attributeName="cy" values={`${center + gap};${center + gap + len};${center + gap}`} dur="1.5s" repeatCount="indefinite" />
            </circle>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      // =====================================================================
      // 5. TACTICAL COMBAT HUD
      // =====================================================================

      case 'sniper_predator_lock': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`-360 ${center} ${center}`} dur="6s" repeatCount="indefinite" />
              <circle cx={center} cy={center - r} r={2} fill="#ff0033" />
              <circle cx={center - r * 0.866} cy={center + r * 0.5} r={2} fill="#ff0033" />
              <circle cx={center + r * 0.866} cy={center + r * 0.5} r={2} fill="#ff0033" />
              <line x1={center} y1={center - r} x2={center} y2={center - gap} stroke="#ff0033" strokeWidth={1} strokeDasharray="2 3" />
              <line x1={center - r * 0.866} y1={center + r * 0.5} x2={center - gap * 0.866} y2={center + gap * 0.5} stroke="#ff0033" strokeWidth={1} strokeDasharray="2 3" />
              <line x1={center + r * 0.866} y1={center + r * 0.5} x2={center + gap * 0.866} y2={center + gap * 0.5} stroke="#ff0033" strokeWidth={1} strokeDasharray="2 3" />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ff0033" stroke="#ffffff" strokeWidth={1} />}
          </g>
        );
      }

      case 'f22_raptor_jet_hud': {
        const w = Math.max(12, size * 0.8);
        return (
          <g>
            <line x1={center - w} y1={center} x2={center - gap} y2={center} stroke={color} strokeWidth={2} />
            <line x1={center + gap} y1={center} x2={center + w} y2={center} stroke={color} strokeWidth={2} />
            <line x1={center - w * 0.5} y1={center - 8} x2={center + w * 0.5} y2={center - 8} stroke={color} strokeWidth={1.5} />
            <line x1={center - w * 0.3} y1={center + 8} x2={center + w * 0.3} y2={center + 8} stroke={color} strokeWidth={1.5} />
            <circle cx={center} cy={center} r={gap + 3} fill="none" stroke={color} strokeWidth={1.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'ac130_gunship_reticle': {
        const s = Math.max(8, size * 0.65);
        return (
          <g>
            <rect x={center - s} y={center - s} width={s * 2} height={s * 2} fill="none" stroke={color} strokeWidth={1.8} strokeDasharray="6 4" />
            <line x1={center - s - 6} y1={center} x2={center + s + 6} y2={center} stroke={color} strokeWidth={1.5} />
            <line x1={center} y1={center - s - 6} x2={center} y2={center + s + 6} stroke={color} strokeWidth={1.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'lockon_missile_tracker': {
        const s = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="scale" values="1; 0.85; 1" dur="1s" repeatCount="indefinite" />
              <path d={`M ${center - s} ${center - s + 6} L ${center - s} ${center - s} L ${center - s + 6} ${center - s}`} fill="none" stroke="#ef4444" strokeWidth={2.2} />
              <path d={`M ${center + s - 6} ${center - s} L ${center + s} ${center - s} L ${center + s} ${center - s + 6}`} fill="none" stroke="#ef4444" strokeWidth={2.2} />
              <path d={`M ${center - s} ${center + s - 6} L ${center - s} ${center + s} L ${center - s + 6} ${center + s}`} fill="none" stroke="#ef4444" strokeWidth={2.2} />
              <path d={`M ${center + s - 6} ${center + s} L ${center + s} ${center + s} L ${center + s} ${center + s - 6}`} fill="none" stroke="#ef4444" strokeWidth={2.2} />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#ef4444" strokeWidth={1} />}
          </g>
        );
      }

      case 'apache_heli_targeter': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1.5} />
            <line x1={center - r - 4} y1={center} x2={center + r + 4} y2={center} stroke={color} strokeWidth={1.5} />
            <line x1={center} y1={center - r - 4} x2={center} y2={center + r + 4} stroke={color} strokeWidth={1.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'drag_headshot_master': {
        const len = Math.max(6, size * 0.5);
        return (
          <g>
            <path d={`M ${center} ${center - gap - len} L ${center - len * 0.7} ${center - gap} L ${center + len * 0.7} ${center - gap} Z`} fill="none" stroke="#ff0055" strokeWidth={thickness} />
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke="#ffffff" strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke="#ffffff" strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke="#ffffff" strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ff0055" stroke="#ffffff" strokeWidth={1} />}
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

      case 'night_vision_thermal': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke="#00ff66" strokeWidth={2} />
            <circle cx={center} cy={center} r={r * 0.5} fill="#00ff66" opacity="0.2">
              <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <line x1={center - r} y1={center} x2={center + r} y2={center} stroke="#ffffff" strokeWidth={1.5} />
            <line x1={center} y1={center - r} x2={center} y2={center + r} stroke="#ffffff" strokeWidth={1.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'drone_recon_hud': {
        const s = Math.max(8, size * 0.65);
        return (
          <g>
            <rect x={center - s} y={center - s} width={s * 2} height={s * 2} fill="none" stroke={color} strokeWidth={1} opacity="0.4" />
            <line x1={center - 5} y1={center} x2={center + 5} y2={center} stroke={color} strokeWidth={2} />
            <line x1={center} y1={center - 5} x2={center} y2={center + 5} stroke={color} strokeWidth={2} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'swat_breach_reticle': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={2.2} />
            {showDot && <circle cx={center} cy={center} r={dotSize + 1} fill="#e11d48" stroke="#ffffff" strokeWidth={1.2} />}
          </g>
        );
      }

      case 'ballistic_drop_mildot': {
        const len = Math.max(8, size * 0.65);
        return (
          <g>
            <line x1={center - len} y1={center} x2={center + len} y2={center} stroke={color} strokeWidth={thickness} />
            <line x1={center} y1={center - len * 0.5} x2={center} y2={center + len} stroke={color} strokeWidth={thickness} />
            <circle cx={center} cy={center + 4} r={1.5} fill="#ffffff" />
            <circle cx={center} cy={center + 8} r={1.5} fill="#ffffff" />
            <circle cx={center} cy={center + 12} r={1.5} fill="#ffffff" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'exosuit_targeting_matrix': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <polygon
              points={`${center},${center - r} ${center + r * 0.866},${center - r * 0.5} ${center + r * 0.866},${center + r * 0.5} ${center},${center + r} ${center - r * 0.866},${center + r * 0.5} ${center - r * 0.866},${center - r * 0.5}`}
              fill="none"
              stroke={color}
              strokeWidth={2}
            />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'ghost_recon_cross': {
        const len = Math.max(5, size * 0.4);
        return (
          <g opacity="0.9">
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke="#ffffff" strokeWidth={thickness} />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke="#ffffff" strokeWidth={thickness} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke="#ffffff" strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#39ff14" />}
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

      case 'laser_rangefinder_optic': {
        const len = Math.max(8, size * 0.65);
        return (
          <g>
            <line x1={center - len} y1={center} x2={center + len} y2={center} stroke={color} strokeWidth={1.5} />
            <line x1={center} y1={center - len} x2={center} y2={center + len} stroke={color} strokeWidth={1.5} />
            <line x1={center - 8} y1={center - 3} x2={center - 8} y2={center + 3} stroke={color} strokeWidth={1} />
            <line x1={center + 8} y1={center - 3} x2={center + 8} y2={center + 3} stroke={color} strokeWidth={1} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'cyber_sniper_mil': {
        const r = Math.max(9, size * 0.75);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1.8} />
            <line x1={center - r} y1={center} x2={center + r} y2={center} stroke={color} strokeWidth={1} />
            <line x1={center} y1={center - r} x2={center} y2={center + r} stroke={color} strokeWidth={1} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#00e5ff" />}
          </g>
        );
      }

      case 'tactical_chevron_stack': {
        return (
          <g>
            <path d={`M ${center - 5} ${center - 4} L ${center} ${center - 8} L ${center + 5} ${center - 4}`} fill="none" stroke={color} strokeWidth={2} />
            <path d={`M ${center - 5} ${center + 1} L ${center} ${center - 3} L ${center + 5} ${center + 1}`} fill="none" stroke={color} strokeWidth={2} />
            {showDot && <circle cx={center} cy={center + 6} r={dotSize} fill="#ffffff" stroke={color} strokeWidth={1} />}
          </g>
        );
      }

      case 'recoil_gyro_leveler': {
        const w = Math.max(10, size * 0.75);
        return (
          <g>
            <line x1={center - w} y1={center} x2={center + w} y2={center} stroke={color} strokeWidth={2} />
            <circle cx={center} cy={center} r={gap + 3} fill="none" stroke={color} strokeWidth={1.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      // =====================================================================
      // 6. PLASMA & ENERGY REACTORS
      // =====================================================================

      case 'plasma_core': {
        const r = Math.max(7, size * 0.65);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="3s" repeatCount="indefinite" />
              <path d={`M ${center - r} ${center} A ${r} ${r} 0 0 1 ${center + r} ${center}`} fill="none" stroke={color} strokeWidth={thickness} strokeDasharray="14 10" />
              <path d={`M ${center + r} ${center} A ${r} ${r} 0 0 1 ${center - r} ${center}`} fill="none" stroke="#00e5ff" strokeWidth={thickness} strokeDasharray="14 10" />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize + 0.5} fill="#ffffff" stroke="#9d00ff" strokeWidth={1.5} />}
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

      case 'arc_reactor_iron': {
        const r = Math.max(9, size * 0.75);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke="#00e5ff" strokeWidth={2} />
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="6s" repeatCount="indefinite" />
              {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <rect
                    key={deg}
                    x={center + Math.cos(rad) * (r * 0.8) - 1.5}
                    y={center + Math.sin(rad) * (r * 0.8) - 1.5}
                    width={3}
                    height={3}
                    fill="#ffffff"
                  />
                );
              })}
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize + 1} fill="#ffffff" stroke="#00e5ff" strokeWidth={1.5} />}
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

      case 'biohazard_radiation_core': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="4s" repeatCount="indefinite" />
              <path d={`M ${center - r * 0.8} ${center - r * 0.4} A ${r * 0.7} ${r * 0.7} 0 0 1 ${center + r * 0.8} ${center - r * 0.4}`} fill="none" stroke="#84cc16" strokeWidth={2.5} />
              <path d={`M ${center + r * 0.6} ${center + r * 0.6} A ${r * 0.7} ${r * 0.7} 0 0 1 ${center - r * 0.6} ${center + r * 0.6}`} fill="none" stroke="#84cc16" strokeWidth={2.5} />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#84cc16" strokeWidth={1} />}
          </g>
        );
      }

      case 'tesla_lightning_cage': {
        const s = Math.max(7, size * 0.55);
        return (
          <g>
            <path d={`M ${center - s} ${center - s} L ${center - s * 0.5} ${center} L ${center - s} ${center} L ${center} ${center + s}`} fill="none" stroke="#eab308" strokeWidth={thickness} />
            <path d={`M ${center + s} ${center - s} L ${center + s * 0.5} ${center} L ${center + s} ${center} L ${center} ${center + s}`} fill="none" stroke="#eab308" strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" stroke="#eab308" strokeWidth={1} />}
          </g>
        );
      }

      case 'cryo_frost_reactor': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke="#38bdf8" strokeWidth={1.8} />
            <line x1={center - r - 3} y1={center} x2={center + r + 3} y2={center} stroke="#ffffff" strokeWidth={1.5} />
            <line x1={center} y1={center - r - 3} x2={center} y2={center + r + 3} stroke="#ffffff" strokeWidth={1.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#38bdf8" />}
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

      case 'magma_core_eruption': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke="#ea580c" strokeWidth={2}>
              <animate attributeName="stroke" values="#ea580c;#facc15;#ea580c" dur="1.2s" repeatCount="indefinite" />
            </circle>
            {showDot && <circle cx={center} cy={center} r={dotSize + 1} fill="#facc15" stroke="#ea580c" strokeWidth={1.5} />}
          </g>
        );
      }

      case 'antimatter_singularity': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke="#c084fc" strokeWidth={2} strokeDasharray="8 4" />
            <circle cx={center} cy={center} r={r * 0.4} fill="#c084fc" opacity="0.6" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'fusion_collider_ring': {
        const r = Math.max(8, size * 0.7);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={1.5} />
            <g>
              <animateTransform attributeName="transform" type="rotate" from={`0 ${center} ${center}`} to={`360 ${center} ${center}`} dur="1.2s" repeatCount="indefinite" />
              <circle cx={center + r} cy={center} r={2.2} fill="#ffffff" />
            </g>
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'gamma_ray_burst': {
        const len = Math.max(6, size * 0.55);
        return (
          <g>
            <line x1={center} y1={center - gap} x2={center} y2={center - gap - len} stroke="#10b981" strokeWidth={2.5} />
            <line x1={center} y1={center + gap} x2={center} y2={center + gap + len} stroke="#10b981" strokeWidth={2.5} />
            <line x1={center - gap} y1={center} x2={center - gap - len} y2={center} stroke="#10b981" strokeWidth={2.5} />
            <line x1={center + gap} y1={center} x2={center + gap + len} y2={center} stroke="#10b981" strokeWidth={2.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'supercharged_battery_arc': {
        const s = Math.max(7, size * 0.55);
        return (
          <g>
            <rect x={center - s} y={center - s} width={s * 2} height={s * 2} fill="none" stroke="#eab308" strokeWidth={2} />
            <line x1={center - s - 4} y1={center} x2={center + s + 4} y2={center} stroke="#ffffff" strokeWidth={1.5} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#eab308" />}
          </g>
        );
      }

      case 'neon_pulsar_wave': {
        const len = Math.max(8, size * 0.6);
        return (
          <g>
            <path d={`M ${center - len} ${center} Q ${center - len * 0.5} ${center - 8} ${center} ${center} T ${center + len} ${center}`} fill="none" stroke="#ec4899" strokeWidth={2} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'quantum_waveform_pulse': {
        const len = Math.max(8, size * 0.6);
        return (
          <g>
            <path d={`M ${center - len} ${center} L ${center - 6} ${center} L ${center - 3} ${center - 8} L ${center + 3} ${center + 8} L ${center + 6} ${center} L ${center + len} ${center}`} fill="none" stroke="#39ff14" strokeWidth={2} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'starlight_spark_fusion': {
        const r = Math.max(8, size * 0.65);
        return (
          <g>
            <polygon points={`${center},${center - r} ${center + 3},${center - 3} ${center + r},${center} ${center + 3},${center + 3} ${center},${center + r} ${center - 3},${center + 3} ${center - r},${center} ${center - 3},${center - 3}`} fill="#ffffff" />
          </g>
        );
      }

      case 'toxic_plasma_spore': {
        const r = Math.max(7, size * 0.55);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="#84cc16" opacity="0.3" />
            <circle cx={center - 3} cy={center - 3} r={2} fill="#84cc16" />
            <circle cx={center + 4} cy={center + 3} r={1.5} fill="#84cc16" />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill="#ffffff" />}
          </g>
        );
      }

      case 'laser_cross_beam_v2': {
        const len = Math.max(10, size * 0.75);
        return (
          <g>
            <line x1={center - len} y1={center} x2={center + len} y2={center} stroke="#06b6d4" strokeWidth={2} />
            <line x1={center} y1={center - len} x2={center} y2={center + len} stroke="#06b6d4" strokeWidth={2} />
            {showDot && <circle cx={center} cy={center} r={dotSize + 0.5} fill="#ffffff" stroke="#06b6d4" strokeWidth={1} />}
          </g>
        );
      }

      // =====================================================================
      // 7. CLEAN STATIC PRO ESPORTS (ক্লিন প্রো এসপোর্টস - নো এনিমেশন)
      // =====================================================================

      case 'dot': {
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
      }

      case 'classic_cross':
      case 'cross_gap': {
        const lineLen = Math.max(3, size / 2 - gap / 2);
        return (
          <g>
            {/* Top */}
            <line x1={center} y1={center - gap / 2} x2={center} y2={center - gap / 2 - lineLen} stroke={color} strokeWidth={thickness} strokeLinecap="square" />
            {/* Bottom */}
            <line x1={center} y1={center + gap / 2} x2={center} y2={center + gap / 2 + lineLen} stroke={color} strokeWidth={thickness} strokeLinecap="square" />
            {/* Left */}
            <line x1={center - gap / 2} y1={center} x2={center - gap / 2 - lineLen} y2={center} stroke={color} strokeWidth={thickness} strokeLinecap="square" />
            {/* Right */}
            <line x1={center + gap / 2} y1={center} x2={center + gap / 2 + lineLen} y2={center} stroke={color} strokeWidth={thickness} strokeLinecap="square" />
            {showDot && (
              <circle cx={center} cy={center} r={dotSize} fill={color} stroke={hasOutline ? outlineColor : 'none'} strokeWidth={hasOutline ? 1 : 0} />
            )}
          </g>
        );
      }

      case 'dot_circle': {
        const r = Math.max(5, size / 2.2);
        return (
          <g>
            <circle cx={center} cy={center} r={r} fill="none" stroke={color} strokeWidth={thickness} />
            {showDot && (
              <circle cx={center} cy={center} r={dotSize} fill={color} stroke={hasOutline ? outlineColor : 'none'} strokeWidth={hasOutline ? 1 : 0} />
            )}
          </g>
        );
      }

      case 't_shape': {
        const lineLen = Math.max(3, size / 2 - gap / 2);
        return (
          <g>
            <line x1={center} y1={center + gap / 2} x2={center} y2={center + gap / 2 + lineLen} stroke={color} strokeWidth={thickness} strokeLinecap="square" />
            <line x1={center - gap / 2} y1={center} x2={center - gap / 2 - lineLen} y2={center} stroke={color} strokeWidth={thickness} strokeLinecap="square" />
            <line x1={center + gap / 2} y1={center} x2={center + gap / 2 + lineLen} y2={center} stroke={color} strokeWidth={thickness} strokeLinecap="square" />
            {showDot && (
              <circle cx={center} cy={center} r={dotSize} fill={color} stroke={hasOutline ? outlineColor : 'none'} strokeWidth={hasOutline ? 1 : 0} />
            )}
          </g>
        );
      }

      case 'box_cross': {
        const s = Math.max(4, size / 3);
        return (
          <g>
            <rect x={center - s} y={center - s} width={s * 2} height={s * 2} fill="none" stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'diamond': {
        const s = Math.max(5, size / 2.5);
        return (
          <g>
            <polygon points={`${center},${center - s} ${center + s},${center} ${center},${center + s} ${center - s},${center}`} fill="none" stroke={color} strokeWidth={thickness} />
            {showDot && <circle cx={center} cy={center} r={dotSize} fill={color} />}
          </g>
        );
      }

      case 'chevron': {
        const s = Math.max(4, size / 3);
        return (
          <g>
            <path d={`M ${center - s} ${center + s} L ${center} ${center} L ${center + s} ${center + s}`} fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round" />
            {showDot && <circle cx={center} cy={center - gap} r={dotSize} fill={color} />}
          </g>
        );
      }

      default: {
        return (
          <circle cx={center} cy={center} r={Math.max(2, dotSize)} fill={color} stroke={hasOutline ? outlineColor : 'none'} strokeWidth={hasOutline ? 1 : 0} />
        );
      }
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
          filter: showGlow ? `drop-shadow(0 0 ${customSettings?.glowIntensity ?? 8}px ${color})` : undefined,
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
