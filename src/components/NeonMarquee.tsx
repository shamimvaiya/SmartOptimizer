import React, { useRef, useState, useEffect } from 'react';

export interface NeonMarqueeProps {
  text: string;
  className?: string;
  styleMode?: 'cyberNeon' | 'laserPulse' | 'matrixSmooth' | 'amberClassic' | 'gradientWave';
  speedSec?: number;
  icon?: React.ReactNode;
  alwaysMarquee?: boolean;
}

export const NeonMarquee: React.FC<NeonMarqueeProps> = ({
  text,
  className = '',
  styleMode = 'cyberNeon',
  speedSec = 12,
  icon,
  alwaysMarquee = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        setIsOverflowing(textWidth > containerWidth || alwaysMarquee);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text, alwaysMarquee]);

  // Color Styles based on animation preset
  const getStyleClasses = () => {
    switch (styleMode) {
      case 'laserPulse':
        return 'text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] animate-pulse';
      case 'matrixSmooth':
        return 'text-[#39ff14] drop-shadow-[0_0_10px_rgba(57,255,20,0.7)] font-mono';
      case 'amberClassic':
        return 'text-[#ffb300] drop-shadow-[0_0_8px_rgba(255,179,0,0.7)]';
      case 'gradientWave':
        return 'text-transparent bg-clip-text bg-gradient-to-r from-[#39ff14] via-[#00e5ff] to-[#d500f9] drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]';
      case 'cyberNeon':
      default:
        return 'text-[#39ff14] drop-shadow-[0_0_10px_rgba(57,255,20,0.6)]';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden whitespace-nowrap flex items-center select-none ${className}`}
      title={text}
    >
      {icon && <span className="mr-2 shrink-0">{icon}</span>}

      {isOverflowing ? (
        <div
          className="flex w-max will-change-transform"
          style={{
            animation: `marqueeScroll ${speedSec}s linear infinite`,
          }}
        >
          <div className="flex shrink-0 items-center pr-12">
            <span className={`font-extrabold ${getStyleClasses()}`}>
              {text}
            </span>
          </div>
          <div className="flex shrink-0 items-center pr-12">
            <span className={`font-extrabold ${getStyleClasses()}`}>
              {text}
            </span>
          </div>
        </div>
      ) : (
        <span ref={textRef} className={`font-extrabold truncate ${getStyleClasses()}`}>
          {text}
        </span>
      )}
    </div>
  );
};
