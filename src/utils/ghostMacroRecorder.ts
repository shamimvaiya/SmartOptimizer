/**
 * Ghost Loop Logic-Based Macro Recorder
 * Records relative mouse delta movements, absolute clicks, and keyboard scans.
 * Serializes and deserializes clean JSON-based macro files for re-editing and loop playback.
 */

import { GhostMacroEvent, GhostMacroFile, HumanizerConfig } from '../types';
import { DEFAULT_HUMANIZER_CONFIG, randomizeDelay, getHumanClickPoint } from './humanizer';

export class GhostLoopRecorder {
  private isRecording: boolean = false;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private lastEventTime: number = 0;
  private events: GhostMacroEvent[] = [];
  private lastMouseX: number = 960;
  private lastMouseY: number = 540;

  public startRecording() {
    this.isRecording = true;
    this.isPlaying = false;
    this.events = [];
    this.startTime = performance.now();
    this.lastEventTime = this.startTime;
    this.lastMouseX = 960;
    this.lastMouseY = 540;
  }

  public stopRecording(): GhostMacroFile {
    this.isRecording = false;
    const totalDurationMs = Math.round(performance.now() - this.startTime);

    return {
      id: `macro_${Date.now()}`,
      name: `Ghost_Loop_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}`,
      createdAt: new Date().toISOString(),
      totalDurationMs,
      eventsCount: this.events.length,
      screenResolution: { width: window.innerWidth || 1920, height: window.innerHeight || 1080 },
      events: [...this.events],
    };
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getEvents(): GhostMacroEvent[] {
    return [...this.events];
  }

  /**
   * Captures mouse movement with delta calculations
   */
  public recordMouseMove(x: number, y: number) {
    if (!this.isRecording) return;
    const now = performance.now();
    const timestampMs = Math.round(now - this.startTime);
    const deltaX = x - this.lastMouseX;
    const deltaY = y - this.lastMouseY;

    // Filter tiny micro jitter if within 1px
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return;

    this.events.push({
      id: `ev_${this.events.length + 1}`,
      type: 'mousemove',
      timestampMs,
      x,
      y,
      deltaX,
      deltaY,
    });

    this.lastMouseX = x;
    this.lastMouseY = y;
    this.lastEventTime = now;
  }

  /**
   * Captures mouse button down/up
   */
  public recordMouseButton(type: 'mousedown' | 'mouseup', button: 'left' | 'right' | 'middle', x: number, y: number) {
    if (!this.isRecording) return;
    const now = performance.now();
    const timestampMs = Math.round(now - this.startTime);

    this.events.push({
      id: `ev_${this.events.length + 1}`,
      type,
      timestampMs,
      button,
      x,
      y,
    });

    this.lastMouseX = x;
    this.lastMouseY = y;
    this.lastEventTime = now;
  }

  /**
   * Captures keyboard stroke down/up
   */
  public recordKey(type: 'keydown' | 'keyup', key: string) {
    if (!this.isRecording) return;
    const now = performance.now();
    const timestampMs = Math.round(now - this.startTime);

    this.events.push({
      id: `ev_${this.events.length + 1}`,
      type,
      timestampMs,
      key,
    });

    this.lastEventTime = now;
  }

  /**
   * Plays back recorded Ghost macro with Humanizer anti-detection
   */
  public async playMacro(
    macroFile: GhostMacroFile,
    humanizerConfig: HumanizerConfig = DEFAULT_HUMANIZER_CONFIG,
    speedMultiplier: number = 1.0,
    onProgress?: (progressPercent: number, currentEvent: GhostMacroEvent) => void,
    onLog?: (msg: string) => void
  ): Promise<void> {
    if (!macroFile || macroFile.events.length === 0) return;
    this.isPlaying = true;

    onLog?.(`[Ghost Loop Playback] Starting playback: ${macroFile.name} (${macroFile.events.length} events, Speed: ${speedMultiplier}x)`);

    const events = macroFile.events;
    for (let i = 0; i < events.length; i++) {
      if (!this.isPlaying) break;

      const event = events[i];
      const prevEvent = i > 0 ? events[i - 1] : null;

      // Calculate time gap between events with humanized jitter
      let waitMs = 10;
      if (prevEvent) {
        const rawDelta = (event.timestampMs - prevEvent.timestampMs) / Math.max(0.2, speedMultiplier);
        waitMs = Math.max(2, randomizeDelay(rawDelta, humanizerConfig.minDelayJitterMs, humanizerConfig.maxDelayJitterMs));
      }

      await new Promise((res) => setTimeout(res, Math.min(250, waitMs)));

      // Simulate event execution
      if (event.type === 'mousedown' && event.x !== undefined && event.y !== undefined) {
        const humanClick = getHumanClickPoint(event.x, event.y, humanizerConfig.clickOffsetRadiusPx);
        onLog?.(`[Ghost Click] ${event.button || 'left'} at (${humanClick.x}, ${humanClick.y})`);
      } else if (event.type === 'keydown' && event.key) {
        onLog?.(`[Ghost Key] [${event.key}] pressed`);
      }

      const progress = Math.round(((i + 1) / events.length) * 100);
      onProgress?.(progress, event);
    }

    this.isPlaying = false;
    onLog?.(`[Ghost Loop Playback] Playback finished.`);
  }

  public stopPlayback() {
    this.isPlaying = false;
  }

  /**
   * Exports macro data to formatted JSON string
   */
  public exportToJson(macroFile: GhostMacroFile): string {
    return JSON.stringify(macroFile, null, 2);
  }

  /**
   * Imports macro from JSON string
   */
  public importFromJson(jsonString: string): GhostMacroFile {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.events || !Array.isArray(parsed.events)) {
        throw new Error('Invalid macro file structure: missing events array');
      }
      return parsed as GhostMacroFile;
    } catch (err: any) {
      throw new Error(`Failed to parse macro JSON: ${err.message}`);
    }
  }
}
