/**
 * Real Block Macro Recorder Engine
 * Captures real browser click, movement, keypress, and delay events,
 * and serializes them into editable BlockNode[] representations.
 */

import { BlockNode } from '../types';

export interface RecordedActionRaw {
  id: string;
  type: 'click' | 'move' | 'key' | 'delay';
  timestamp: number;
  data: Record<string, any>;
}

export class BlockMacroRecorder {
  private isRecording: boolean = false;
  private startTime: number = 0;
  private lastActionTime: number = 0;
  private actions: RecordedActionRaw[] = [];
  private onActionCaptured?: (action: RecordedActionRaw, count: number) => void;

  public start(onCapture?: (action: RecordedActionRaw, count: number) => void) {
    this.isRecording = true;
    this.startTime = Date.now();
    this.lastActionTime = this.startTime;
    this.actions = [];
    this.onActionCaptured = onCapture;
  }

  public stop(): BlockNode[] {
    this.isRecording = false;
    return this.convertActionsToBlocks(this.actions);
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public getActions(): RecordedActionRaw[] {
    return [...this.actions];
  }

  public recordClick(x: number, y: number, button: 'left' | 'right' | 'middle' = 'left') {
    if (!this.isRecording) return;
    this.captureDelayIfSignificant();

    const action: RecordedActionRaw = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'click',
      timestamp: Date.now(),
      data: { x: Math.round(x), y: Math.round(y), button },
    };

    this.actions.push(action);
    this.lastActionTime = Date.now();
    this.onActionCaptured?.(action, this.actions.length);
  }

  public recordMove(x: number, y: number) {
    if (!this.isRecording) return;

    // Filter excessive micro moves within 50ms
    const now = Date.now();
    if (now - this.lastActionTime < 40) return;
    this.captureDelayIfSignificant();

    const action: RecordedActionRaw = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'move',
      timestamp: now,
      data: { x: Math.round(x), y: Math.round(y) },
    };

    this.actions.push(action);
    this.lastActionTime = now;
    this.onActionCaptured?.(action, this.actions.length);
  }

  public recordKeyPress(key: string) {
    if (!this.isRecording) return;
    this.captureDelayIfSignificant();

    const action: RecordedActionRaw = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'key',
      timestamp: Date.now(),
      data: { key },
    };

    this.actions.push(action);
    this.lastActionTime = Date.now();
    this.onActionCaptured?.(action, this.actions.length);
  }

  private captureDelayIfSignificant() {
    const now = Date.now();
    const gap = now - this.lastActionTime;
    if (gap >= 120 && this.actions.length > 0) {
      const delayAct: RecordedActionRaw = {
        id: `act_${now}_delay`,
        type: 'delay',
        timestamp: now,
        data: { durationMs: Math.min(gap, 5000) },
      };
      this.actions.push(delayAct);
    }
  }

  /**
   * Converts raw action stream into visual block coding puzzle blocks
   */
  public convertActionsToBlocks(actions: RecordedActionRaw[]): BlockNode[] {
    const blocks: BlockNode[] = [];

    // Always start with Start Event if starting a new macro sequence
    blocks.push({
      id: `blk_start_${Date.now()}`,
      type: 'event_start',
      category: 'events',
      title: 'When Macro Starts (Recorded)',
      color: '#39FF14',
      icon: 'Play',
      description: 'Recorded Action Macro Entry Point',
      parameters: {},
    });

    for (let i = 0; i < actions.length; i++) {
      const act = actions[i];
      const uniqueId = `blk_rec_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`;

      switch (act.type) {
        case 'click': {
          blocks.push({
            id: uniqueId,
            type: 'action_human_click',
            category: 'mouse',
            title: `Click Mouse (${act.data.button})`,
            color: '#2979FF',
            icon: 'MousePointer',
            description: `Click ${act.data.button} button at (${act.data.x}, ${act.data.y}) with humanizer`,
            parameters: {
              button: act.data.button || 'left',
              jitterRadius: 3,
              holdDurationMs: 50,
            },
          });
          break;
        }

        case 'move': {
          blocks.push({
            id: uniqueId,
            type: 'action_move_mouse',
            category: 'mouse',
            title: `Move Mouse to (${act.data.x}, ${act.data.y})`,
            color: '#2979FF',
            icon: 'Move',
            description: 'Move mouse cursor smoothly to target coordinates',
            parameters: {
              x: act.data.x,
              y: act.data.y,
              smooth: true,
            },
          });
          break;
        }

        case 'key': {
          blocks.push({
            id: uniqueId,
            type: 'action_press_key',
            category: 'keyboard',
            title: `Press Key [${act.data.key}]`,
            color: '#00E5FF',
            icon: 'Keyboard',
            description: `Press and release keyboard key ${act.data.key}`,
            parameters: {
              key: act.data.key,
              durationMs: 60,
            },
          });
          break;
        }

        case 'delay': {
          blocks.push({
            id: uniqueId,
            type: 'timing_delay',
            category: 'timing',
            title: `Delay (${act.data.durationMs}ms)`,
            color: '#FF6D00',
            icon: 'Clock',
            description: `Pause execution for ${act.data.durationMs}ms`,
            parameters: {
              durationMs: act.data.durationMs,
              jitterMs: 15,
            },
          });
          break;
        }
      }
    }

    return blocks;
  }
}
