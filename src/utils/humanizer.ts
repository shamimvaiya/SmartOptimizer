/**
 * The 'Humanizer' Anti-Detection & Bézier Mouse Movement Engine
 * Generates natural human-like mouse trajectories, randomized jitter,
 * non-linear velocity easing, and human error click offsets.
 */

import { HumanizerConfig } from '../types';

export interface Point2D {
  x: number;
  y: number;
}

export interface TrajectoryPoint extends Point2D {
  timeMs: number;
  velocity: number;
  jitterX: number;
  jitterY: number;
}

export const DEFAULT_HUMANIZER_CONFIG: HumanizerConfig = {
  enableBezier: true,
  curvatureIntensity: 0.45,
  easingType: 'naturalHuman',
  minDelayJitterMs: -4,
  maxDelayJitterMs: 12,
  clickOffsetRadiusPx: 2.5,
  randomJitterEnabled: true,
};

/**
 * Generates a randomized delay to bypass uniform timing heuristic detections.
 * E.g., 50ms becomes 47ms - 62ms.
 */
export function randomizeDelay(
  baseDelayMs: number,
  minJitter: number = -5,
  maxJitter: number = 14
): number {
  const jitter = Math.floor(Math.random() * (maxJitter - minJitter + 1)) + minJitter;
  return Math.max(1, baseDelayMs + jitter);
}

/**
 * Applies a Gaussian-like randomized offset to target coordinates so clicks do not land
 * on the exact mathematical center every time.
 */
export function getHumanClickPoint(
  targetX: number,
  targetY: number,
  radiusPx: number = 2.5
): Point2D {
  if (radiusPx <= 0) return { x: targetX, y: targetY };

  // Box-Muller transform for normal distribution
  const u1 = Math.max(1e-6, Math.random());
  const u2 = Math.random();
  const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

  const angle = Math.random() * Math.PI * 2;
  const distance = Math.abs(randStdNormal * 0.5) * radiusPx;

  return {
    x: Math.round((targetX + Math.cos(angle) * distance) * 10) / 10,
    y: Math.round((targetY + Math.sin(angle) * distance) * 10) / 10,
  };
}

/**
 * Evaluates a Cubic Bézier point at parameter t in [0, 1]
 */
export function cubicBezier(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  t: number
): Point2D {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
  const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;

  return { x, y };
}

/**
 * Calculates velocity easing multiplier based on selected model
 */
export function calculateEasing(t: number, type: 'naturalHuman' | 'easeOutQuad' | 'easeInOutCubic'): number {
  if (type === 'easeOutQuad') {
    return 1 - (1 - t) * (1 - t);
  }
  if (type === 'easeInOutCubic') {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  // Natural Human: Smooth bell-curve acceleration followed by micro-deceleration brake
  // Similar to Fitts's Law human motor behavior
  return Math.sin((t * Math.PI) / 2) * (0.85 + 0.15 * Math.sin(t * Math.PI));
}

/**
 * Generates an organic Cubic Bézier mouse path from start to end with human-like curvature,
 * micro-corrections, and randomized jitter points.
 */
export function generateHumanPath(
  start: Point2D,
  end: Point2D,
  config: HumanizerConfig = DEFAULT_HUMANIZER_CONFIG,
  steps: number = 30
): TrajectoryPoint[] {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 2 || !config.enableBezier) {
    return [
      { x: start.x, y: start.y, timeMs: 0, velocity: 0, jitterX: 0, jitterY: 0 },
      { x: end.x, y: end.y, timeMs: 15, velocity: 1, jitterX: 0, jitterY: 0 },
    ];
  }

  // Orthogonal vector for natural arching
  const perpX = -dy / distance;
  const perpY = dx / distance;

  // Curvature displacement
  const maxCurvature = distance * 0.25 * config.curvatureIntensity;
  const directionSign = Math.random() > 0.5 ? 1 : -1;
  const curveDisplacement1 = maxCurvature * (0.6 + Math.random() * 0.8) * directionSign;
  const curveDisplacement2 = maxCurvature * (0.3 + Math.random() * 0.6) * directionSign;

  // Control points
  const p1: Point2D = {
    x: start.x + dx * 0.3 + perpX * curveDisplacement1,
    y: start.y + dy * 0.3 + perpY * curveDisplacement1,
  };

  const p2: Point2D = {
    x: start.x + dx * 0.75 + perpX * curveDisplacement2,
    y: start.y + dy * 0.75 + perpY * curveDisplacement2,
  };

  const trajectory: TrajectoryPoint[] = [];
  const totalDurationMs = Math.max(35, Math.min(300, distance * 0.85 + Math.random() * 30));

  for (let i = 0; i <= steps; i++) {
    const rawT = i / steps;
    const easedT = calculateEasing(rawT, config.easingType);
    const clampedT = Math.max(0, Math.min(1, easedT));

    const basePoint = cubicBezier(start, p1, p2, end, clampedT);

    // Micro-jitter adds slight hand tremor along the path (diminishes near end for precision)
    let jX = 0;
    let jY = 0;
    if (config.randomJitterEnabled && i > 0 && i < steps) {
      const tremorFactor = (1 - rawT * 0.7) * 1.2;
      jX = (Math.random() - 0.5) * tremorFactor;
      jY = (Math.random() - 0.5) * tremorFactor;
    }

    const currentX = Math.round((basePoint.x + jX) * 10) / 10;
    const currentY = Math.round((basePoint.y + jY) * 10) / 10;
    const timeMs = Math.round(rawT * totalDurationMs);
    const velocity = Math.abs(Math.sin(rawT * Math.PI));

    trajectory.push({
      x: i === steps ? end.x : currentX,
      y: i === steps ? end.y : currentY,
      timeMs,
      velocity: Math.round(velocity * 100) / 100,
      jitterX: Math.round(jX * 100) / 100,
      jitterY: Math.round(jY * 100) / 100,
    });
  }

  return trajectory;
}
