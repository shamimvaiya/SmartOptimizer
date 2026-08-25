import {
  BlockNode,
  CustomBlockDefinition,
  DebuggerState,
  ExecutionHistoryItem,
  ExecutionTraceItem,
  MacroVariable,
  PerformanceBlockMetric,
  PerformanceProfileReport,
  RuntimeErrorModel,
  SubMacroDefinition,
} from '../types';
import { generateHumanPath, getHumanClickPoint, randomizeDelay, DEFAULT_HUMANIZER_CONFIG } from './humanizer';

export type BlockExecutionCallback = (
  event: 'block_start' | 'block_end' | 'pause' | 'resume' | 'complete' | 'error' | 'trace' | 'profile',
  data: {
    blockId?: string;
    blockTitle?: string;
    status?: string;
    debuggerState: DebuggerState;
    historyItem?: ExecutionHistoryItem;
    traceItem?: ExecutionTraceItem;
    runtimeError?: RuntimeErrorModel;
    profileReport?: PerformanceProfileReport;
    variables: Record<string, any>;
  }
) => void;

export class BlockExecutionEngine {
  private blocks: BlockNode[] = [];
  private variables: Map<string, any> = new Map();
  private customBlocks: Map<string, CustomBlockDefinition> = new Map();
  private subMacros: Map<string, SubMacroDefinition> = new Map();
  private breakpoints: Set<string> = new Set();
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private isStepping: boolean = false;
  private stepMode: 'over' | 'into' | 'out' = 'over';
  private targetStepDepth: number = 0;
  private currentCallDepth: number = 0;
  private maxCallDepthReached: number = 0;
  private stepResolve: (() => void) | null = null;
  private executionHistory: ExecutionHistoryItem[] = [];
  private executionTraces: ExecutionTraceItem[] = [];
  private perBlockMetrics: Map<string, PerformanceBlockMetric> = new Map();
  private loopCounters: Map<string, number> = new Map();
  private activeCustomBlockStack: string[] = [];
  private recentErrors: RuntimeErrorModel[] = [];
  private defaultErrorRecovery: 'stop' | 'retry' | 'continue' | 'fallback' = 'stop';
  private maxRetryAttempts: number = 2;

  private debuggerState: DebuggerState = {
    status: 'idle',
    currentBlockId: null,
    stepCount: 0,
    executionTimeMs: 0,
    error: null,
    callStack: [],
  };
  private startTime: number = 0;
  private callback?: BlockExecutionCallback;
  private breakEncountered: boolean = false;
  private continueEncountered: boolean = false;

  constructor(
    blocks: BlockNode[] = [],
    variables: MacroVariable[] = [],
    customBlocks: CustomBlockDefinition[] = [],
    subMacros: SubMacroDefinition[] = []
  ) {
    this.setBlocks(blocks);
    this.setVariables(variables);
    this.setCustomBlocks(customBlocks);
    this.setSubMacros(subMacros);
  }

  public setBlocks(blocks: BlockNode[]) {
    this.blocks = JSON.parse(JSON.stringify(blocks));
  }

  public setVariables(vars: MacroVariable[] | Record<string, any>) {
    this.variables.clear();
    if (Array.isArray(vars)) {
      for (const v of vars) {
        this.variables.set(v.name, v.value !== undefined ? v.value : v.defaultValue);
      }
    } else if (typeof vars === 'object' && vars !== null) {
      for (const [k, v] of Object.entries(vars)) {
        this.variables.set(k, v);
      }
    }
    // Standard coordinates if not present
    if (!this.variables.has('mouseX')) this.variables.set('mouseX', 960);
    if (!this.variables.has('mouseY')) this.variables.set('mouseY', 540);
    if (!this.variables.has('targetLocked')) this.variables.set('targetLocked', true);
    if (!this.variables.has('ammoCount')) this.variables.set('ammoCount', 30);
    if (!this.variables.has('health')) this.variables.set('health', 100);
  }

  public setCustomBlocks(defs: CustomBlockDefinition[]) {
    this.customBlocks.clear();
    for (const def of defs) {
      this.customBlocks.set(def.id, def);
    }
  }

  public setSubMacros(subMacros: SubMacroDefinition[]) {
    this.subMacros.clear();
    for (const sub of subMacros) {
      this.subMacros.set(sub.id, sub);
    }
  }

  public setErrorRecoveryConfig(strategy: 'stop' | 'retry' | 'continue' | 'fallback', maxRetries: number = 2) {
    this.defaultErrorRecovery = strategy;
    this.maxRetryAttempts = maxRetries;
  }

  public setBreakpoints(bpList: string[]) {
    this.breakpoints = new Set(bpList);
  }

  public toggleBreakpoint(blockId: string, enabled?: boolean) {
    if (enabled === undefined) {
      if (this.breakpoints.has(blockId)) {
        this.breakpoints.delete(blockId);
      } else {
        this.breakpoints.add(blockId);
      }
    } else if (enabled) {
      this.breakpoints.add(blockId);
    } else {
      this.breakpoints.delete(blockId);
    }
  }

  public hasBreakpoint(blockId: string): boolean {
    return this.breakpoints.has(blockId);
  }

  public getBreakpoints(): string[] {
    return Array.from(this.breakpoints);
  }

  public getVariables(): Record<string, any> {
    const res: Record<string, any> = {};
    this.variables.forEach((v, k) => {
      res[k] = v;
    });
    return res;
  }

  public setVariable(name: string, value: any) {
    this.variables.set(name, value);
    this.notify('pause', {
      blockId: this.debuggerState.currentBlockId || undefined,
      debuggerState: this.debuggerState,
      variables: this.getVariables(),
    });
  }

  public getHistory(): ExecutionHistoryItem[] {
    return [...this.executionHistory];
  }

  public getTraces(): ExecutionTraceItem[] {
    return [...this.executionTraces];
  }

  public clearHistory() {
    this.executionHistory = [];
    this.executionTraces = [];
    this.recentErrors = [];
    this.perBlockMetrics.clear();
    this.loopCounters.clear();
  }

  public getRecentErrors(): RuntimeErrorModel[] {
    return [...this.recentErrors];
  }

  public getPerformanceReport(): PerformanceProfileReport {
    const metrics = Array.from(this.perBlockMetrics.values());
    const slowest = [...metrics].sort((a, b) => b.totalTimeMs - a.totalTimeMs).slice(0, 10);
    const loopObj: Record<string, number> = {};
    this.loopCounters.forEach((v, k) => {
      loopObj[k] = v;
    });

    const perBlockObj: Record<string, PerformanceBlockMetric> = {};
    for (const m of metrics) {
      perBlockObj[m.blockId] = m;
    }

    return {
      totalExecutionTimeMs: this.debuggerState.executionTimeMs,
      totalBlocksExecuted: this.debuggerState.stepCount,
      perBlockMetrics: perBlockObj,
      slowestBlocks: slowest,
      loopCounts: loopObj,
      callDepthMax: this.maxCallDepthReached,
    };
  }

  public getDebuggerState(): DebuggerState {
    return { ...this.debuggerState };
  }

  public setCallback(cb: BlockExecutionCallback) {
    this.callback = cb;
  }

  private notify(
    event: 'block_start' | 'block_end' | 'pause' | 'resume' | 'complete' | 'error' | 'trace' | 'profile',
    data: Partial<Parameters<BlockExecutionCallback>[1]> = {}
  ) {
    if (this.callback) {
      this.callback(event, {
        debuggerState: this.debuggerState,
        variables: this.getVariables(),
        profileReport: this.getPerformanceReport(),
        ...data,
      });
    }
  }

  public async run(fromBlockIndex: number = 0): Promise<boolean> {
    this.isRunning = true;
    this.isPaused = false;
    this.isStepping = false;
    this.currentCallDepth = 0;
    this.maxCallDepthReached = 0;
    this.startTime = Date.now();
    this.breakEncountered = false;
    this.continueEncountered = false;
    this.debuggerState = {
      status: 'running',
      currentBlockId: null,
      stepCount: 0,
      executionTimeMs: 0,
      error: null,
      callStack: [],
    };

    this.notify('resume');

    try {
      for (let i = fromBlockIndex; i < this.blocks.length; i++) {
        if (!this.isRunning) break;
        const block = this.blocks[i];
        if (block.isDisabled) continue;

        await this.executeBlock(block);

        if (this.breakEncountered) {
          this.breakEncountered = false;
          break;
        }
      }

      if (this.debuggerState.status === 'error') {
        this.isRunning = false;
        this.notify('error', {
          status: 'error',
        });
        return false;
      }

      this.debuggerState.status = 'completed';
      this.debuggerState.currentBlockId = null;
      this.debuggerState.executionTimeMs = Date.now() - this.startTime;
      this.isRunning = false;
      this.notify('complete');
      return true;
    } catch (err: any) {
      this.debuggerState.status = 'error';
      this.debuggerState.error = err.message || 'Execution error encountered';
      this.isRunning = false;
      this.notify('error', {
        status: 'error',
      });
      return false;
    }
  }

  public pause() {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;
    this.debuggerState.status = 'paused';
    this.debuggerState.pausedReason = 'manual';
    this.notify('pause');
  }

  public resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.isStepping = false;
    this.debuggerState.status = 'running';
    this.debuggerState.pausedReason = undefined;
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
    this.notify('resume');
  }

  public stepOver() {
    if (!this.isPaused && this.isRunning) return;
    this.isPaused = true;
    this.isStepping = true;
    this.stepMode = 'over';
    this.targetStepDepth = this.currentCallDepth;
    this.debuggerState.status = 'stepping';
    this.debuggerState.stepMode = 'over';
    this.debuggerState.pausedReason = 'step';
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
  }

  public stepInto() {
    if (!this.isPaused && this.isRunning) return;
    this.isPaused = true;
    this.isStepping = true;
    this.stepMode = 'into';
    this.targetStepDepth = this.currentCallDepth + 1;
    this.debuggerState.status = 'stepping';
    this.debuggerState.stepMode = 'into';
    this.debuggerState.pausedReason = 'step';
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
  }

  public stepOut() {
    if (!this.isPaused && this.isRunning) return;
    this.isPaused = true;
    this.isStepping = true;
    this.stepMode = 'out';
    this.targetStepDepth = Math.max(0, this.currentCallDepth - 1);
    this.debuggerState.status = 'stepping';
    this.debuggerState.stepMode = 'out';
    this.debuggerState.pausedReason = 'step';
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.isStepping = false;
    this.debuggerState.status = 'idle';
    this.debuggerState.currentBlockId = null;
    this.debuggerState.callStack = [];
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
    this.notify('complete');
  }

  private async checkPauseOrBreakpoint(block: BlockNode): Promise<void> {
    const isBp = this.breakpoints.has(block.id) || block.isBreakpointBlock;

    let shouldPause = false;

    if (isBp) {
      shouldPause = true;
      this.debuggerState.pausedReason = 'breakpoint';
    } else if (this.isStepping) {
      if (this.stepMode === 'into') {
        shouldPause = true;
      } else if (this.stepMode === 'over' && this.currentCallDepth <= this.targetStepDepth) {
        shouldPause = true;
      } else if (this.stepMode === 'out' && this.currentCallDepth <= this.targetStepDepth) {
        shouldPause = true;
      }
    }

    if (shouldPause) {
      this.isPaused = true;
      this.debuggerState.status = 'paused';
      this.debuggerState.currentBlockId = block.id;
      this.notify('pause', {
        blockId: block.id,
        blockTitle: block.title,
      });

      while (this.isPaused && this.isRunning) {
        await new Promise<void>((resolve) => {
          this.stepResolve = resolve;
        });

        if (this.isStepping) {
          this.isPaused = false;
          break;
        }
      }
    }
  }

  private interpolate(str: string): string {
    if (!str || typeof str !== 'string') return String(str || '');
    return str.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, varName) => {
      const val = this.variables.get(varName);
      return val !== undefined ? String(val) : '';
    });
  }

  private evaluateCondition(expr: string): boolean {
    if (!expr) return true;
    const interpolated = this.interpolate(expr).trim();
    if (!interpolated) return true;

    const match = interpolated.match(/^(.+?)\s*(===|==|!==|!=|>=|<=|>|<|contains)\s*(.+)$/i);
    if (match) {
      const leftRaw = match[1].trim();
      const op = match[2].trim();
      const rightRaw = match[3].trim();

      const parseVal = (s: string) => {
        if (s.toLowerCase() === 'true') return true;
        if (s.toLowerCase() === 'false') return false;
        if (!isNaN(Number(s)) && s !== '') return Number(s);
        return s.replace(/^["']|["']$/g, '');
      };

      const left = parseVal(leftRaw);
      const right = parseVal(rightRaw);

      switch (op) {
        case '==':
        case '===':
          return left == right;
        case '!=':
        case '!==':
          return left != right;
        case '>':
          return Number(left) > Number(right);
        case '<':
          return Number(left) < Number(right);
        case '>=':
          return Number(left) >= Number(right);
        case '<=':
          return Number(left) <= Number(right);
        case 'contains':
          return String(left).toLowerCase().includes(String(right).toLowerCase());
      }
    }

    if (interpolated.toLowerCase() === 'true') return true;
    if (interpolated.toLowerCase() === 'false') return false;
    return Boolean(interpolated);
  }

  private updateMetrics(block: BlockNode, durationMs: number) {
    const existing = this.perBlockMetrics.get(block.id) || {
      blockId: block.id,
      title: block.title,
      category: block.category,
      executionCount: 0,
      totalTimeMs: 0,
      avgTimeMs: 0,
      maxTimeMs: 0,
      minTimeMs: Number.MAX_SAFE_INTEGER,
    };

    existing.executionCount++;
    existing.totalTimeMs += durationMs;
    existing.avgTimeMs = Math.round(existing.totalTimeMs / existing.executionCount);
    existing.maxTimeMs = Math.max(existing.maxTimeMs, durationMs);
    existing.minTimeMs = Math.min(existing.minTimeMs, durationMs);

    this.perBlockMetrics.set(block.id, existing);
  }

  private async executeBlock(block: BlockNode): Promise<void> {
    if (!this.isRunning) return;

    this.debuggerState.currentBlockId = block.id;
    this.debuggerState.stepCount++;
    this.debuggerState.executionTimeMs = Date.now() - this.startTime;

    await this.checkPauseOrBreakpoint(block);
    if (!this.isRunning) return;

    this.notify('block_start', {
      blockId: block.id,
      blockTitle: block.title,
    });

    const blockStart = Date.now();
    let message = `Executed ${block.title}`;
    let status: 'success' | 'failed' | 'paused' | 'skipped' = 'success';
    let errorDetails: string | undefined;

    let attempt = 0;
    let success = false;

    while (!success && attempt <= (this.defaultErrorRecovery === 'retry' ? this.maxRetryAttempts : 0)) {
      attempt++;
      try {
        const params = block.parameters || {};

        switch (block.type) {
          case 'event_start':
          case 'event_key_pressed':
          case 'event_timer_tick': {
            message = `Event triggered: ${block.title}`;
            if (block.childSlots?.actions) {
              await this.executeBlockList(block.childSlots.actions);
            }
            break;
          }

          case 'action_human_click': {
            const btn = params.button || 'left';
            const jitter = Number(params.jitterRadius) || 3;
            const hold = Number(params.holdDurationMs) || 45;
            const currentX = Number(this.variables.get('mouseX') || 960);
            const currentY = Number(this.variables.get('mouseY') || 540);

            const clickPt = getHumanClickPoint(currentX, currentY, jitter);
            this.variables.set('mouseX', clickPt.x);
            this.variables.set('mouseY', clickPt.y);

            await new Promise((r) => setTimeout(r, hold));
            message = `Human clicked ${btn} at (${clickPt.x}, ${clickPt.y}) [held ${hold}ms]`;
            break;
          }

          case 'action_move_mouse': {
            const targetX = Number(this.interpolate(String(params.x ?? 960)));
            const targetY = Number(this.interpolate(String(params.y ?? 540)));
            const smooth = params.smooth !== false;

            const startX = Number(this.variables.get('mouseX') || 960);
            const startY = Number(this.variables.get('mouseY') || 540);

            if (smooth) {
              const path = generateHumanPath(
                { x: startX, y: startY },
                { x: targetX, y: targetY },
                DEFAULT_HUMANIZER_CONFIG
              );
              await new Promise((r) => setTimeout(r, Math.min(60, path.length * 2)));
            }

            this.variables.set('mouseX', targetX);
            this.variables.set('mouseY', targetY);
            message = `Cursor moved to (${targetX}, ${targetY})`;
            break;
          }

          case 'action_press_key': {
            const key = this.interpolate(String(params.key || 'R'));
            const duration = Number(params.durationMs) || 60;
            await new Promise((r) => setTimeout(r, duration));
            message = `Key '${key}' pressed for ${duration}ms`;
            break;
          }

          case 'action_send_text': {
            const text = this.interpolate(String(params.text || ''));
            const delay = Number(params.delayBetweenKeys) || 30;
            await new Promise((r) => setTimeout(r, text.length * Math.min(delay, 20)));
            message = `Typed text: "${text}"`;
            break;
          }

          case 'action_log_message': {
            const logMsg = this.interpolate(String(params.message || ''));
            message = `[Log] ${logMsg}`;
            break;
          }

          case 'action_sound_beep': {
            const freq = Number(params.frequency) || 880;
            const dur = Number(params.durationMs) || 120;
            this.playWebAudioBeep(freq, dur);
            await new Promise((r) => setTimeout(r, dur));
            message = `Sound beep @ ${freq}Hz (${dur}ms)`;
            break;
          }

          case 'condition_if_else': {
            const conditionExpr = String(params.expression || '');
            const isTrue = this.evaluateCondition(conditionExpr);
            message = `Condition '${conditionExpr}' evaluated to: ${isTrue}`;

            if (isTrue) {
              if (block.childSlots?.then) {
                await this.executeBlockList(block.childSlots.then);
              }
            } else {
              if (block.childSlots?.else) {
                await this.executeBlockList(block.childSlots.else);
              }
            }
            break;
          }

          case 'condition_color_found': {
            const targetColor = String(params.color || '#39FF14');
            const found = true;
            this.variables.set('foundColor', targetColor);
            message = `Color search '${targetColor}': ${found ? 'Found' : 'Not Found'}`;

            if (found) {
              if (block.childSlots?.then) {
                await this.executeBlockList(block.childSlots.then);
              }
            } else {
              if (block.childSlots?.else) {
                await this.executeBlockList(block.childSlots.else);
              }
            }
            break;
          }

          case 'condition_compare': {
            const left = this.interpolate(String(params.leftOperand || ''));
            const op = String(params.operator || '==');
            const right = this.interpolate(String(params.rightOperand || ''));
            const isTrue = this.evaluateCondition(`${left} ${op} ${right}`);
            message = `Compare: ${left} ${op} ${right} => ${isTrue}`;

            if (isTrue && block.childSlots?.then) {
              await this.executeBlockList(block.childSlots.then);
            } else if (!isTrue && block.childSlots?.else) {
              await this.executeBlockList(block.childSlots.else);
            }
            break;
          }

          case 'loop_repeat_count': {
            const count = Number(params.count) || 5;
            const counterVar = String(params.counterVar || 'i');
            const bodyBlocks = block.childSlots?.body || [];
            this.loopCounters.set(block.id, (this.loopCounters.get(block.id) || 0) + 1);

            for (let i = 0; i < count; i++) {
              if (!this.isRunning || this.breakEncountered) break;
              this.variables.set(counterVar, i + 1);
              await this.executeBlockList(bodyBlocks);
              if (this.continueEncountered) {
                this.continueEncountered = false;
                continue;
              }
            }
            this.breakEncountered = false;
            message = `Loop repeat completed (${count} iterations)`;
            break;
          }

          case 'loop_while': {
            const cond = String(params.condition || 'false');
            const maxLimit = Number(params.maxIterations) || 500;
            const bodyBlocks = block.childSlots?.body || [];
            let iter = 0;
            this.loopCounters.set(block.id, (this.loopCounters.get(block.id) || 0) + 1);

            while (this.isRunning && this.evaluateCondition(cond) && iter < maxLimit) {
              if (this.breakEncountered) break;
              iter++;
              await this.executeBlockList(bodyBlocks);
              if (this.continueEncountered) {
                this.continueEncountered = false;
                continue;
              }
            }
            this.breakEncountered = false;
            message = `While loop terminated after ${iter} cycles`;
            break;
          }

          case 'loop_break': {
            this.breakEncountered = true;
            message = `Break statement triggered`;
            break;
          }

          case 'loop_continue': {
            this.continueEncountered = true;
            message = `Continue statement triggered`;
            break;
          }

          case 'var_set': {
            const varName = String(params.varName || 'myVar');
            const rawVal = this.interpolate(String(params.value ?? '0'));
            let parsedVal: any = rawVal;
            if (rawVal.toLowerCase() === 'true') parsedVal = true;
            else if (rawVal.toLowerCase() === 'false') parsedVal = false;
            else if (!isNaN(Number(rawVal)) && rawVal !== '') parsedVal = Number(rawVal);

            this.variables.set(varName, parsedVal);
            message = `Set variable '${varName}' = ${JSON.stringify(parsedVal)}`;
            break;
          }

          case 'var_change_by': {
            const varName = String(params.varName || 'myVar');
            const delta = Number(params.delta) || 1;
            const current = Number(this.variables.get(varName) || 0);
            const next = current + delta;
            this.variables.set(varName, next);
            message = `Changed variable '${varName}' (${current} -> ${next})`;
            break;
          }

          case 'math_calc': {
            const outVar = String(params.outputVar || 'calcResult');
            const opA = Number(this.interpolate(String(params.operandA || 0)));
            const opB = Number(this.interpolate(String(params.operandB || 0)));
            const op = String(params.operator || '+');

            let res = 0;
            if (op === '+') res = opA + opB;
            else if (op === '-') res = opA - opB;
            else if (op === '*') res = opA * opB;
            else if (op === '/') res = opB !== 0 ? opA / opB : 0;
            else if (op === '%') res = opB !== 0 ? opA % opB : 0;

            this.variables.set(outVar, res);
            message = `Math: ${opA} ${op} ${opB} = ${res} (saved to ${outVar})`;
            break;
          }

          case 'math_random': {
            const outVar = String(params.outputVar || 'randomVal');
            const min = Number(params.min) || 1;
            const max = Number(params.max) || 100;
            const rand = Math.floor(Math.random() * (max - min + 1)) + min;
            this.variables.set(outVar, rand);
            message = `Generated random value ${rand} in [${min}, ${max}]`;
            break;
          }

          case 'timing_delay': {
            const baseDelay = Number(params.durationMs) || 100;
            const jitter = Number(params.jitterMs) || 10;
            const actualDelay = randomizeDelay(baseDelay, jitter);
            await new Promise((r) => setTimeout(r, actualDelay));
            message = `Delayed for ${actualDelay}ms`;
            break;
          }

          case 'timing_wait_until': {
            const cond = String(params.condition || 'true');
            const timeout = Number(params.timeoutMs) || 5000;
            const startWait = Date.now();

            while (this.isRunning && !this.evaluateCondition(cond)) {
              if (Date.now() - startWait > timeout) {
                message = `Wait until condition timed out (${timeout}ms)`;
                break;
              }
              await new Promise((r) => setTimeout(r, 50));
            }
            message = `Wait until condition fulfilled`;
            break;
          }

          case 'adb_tap': {
            const x = Number(this.interpolate(String(params.x || 960)));
            const y = Number(this.interpolate(String(params.y || 540)));
            await new Promise((r) => setTimeout(r, 35));
            message = `ADB Input Tap dispatched @ (${x}, ${y})`;
            break;
          }

          case 'adb_swipe': {
            const sx = Number(params.startX || 500);
            const sy = Number(params.startY || 800);
            const ex = Number(params.endX || 500);
            const ey = Number(params.endY || 300);
            const dur = Number(params.durationMs) || 250;
            await new Promise((r) => setTimeout(r, dur));
            message = `ADB Swipe (${sx},${sy}) -> (${ex},${ey}) [${dur}ms]`;
            break;
          }

          case 'adb_shell': {
            const cmd = this.interpolate(String(params.command || ''));
            await new Promise((r) => setTimeout(r, 40));
            message = `ADB Shell executed: ${cmd}`;
            break;
          }

          case 'util_breakpoint': {
            const reason = String(params.reason || 'Breakpoint hit');
            message = `Breakpoint pause block: ${reason}`;
            this.isPaused = true;
            this.debuggerState.status = 'paused';
            this.debuggerState.pausedReason = 'breakpoint';
            this.notify('pause', {
              blockId: block.id,
              blockTitle: block.title,
            });
            await this.checkPauseOrBreakpoint(block);
            break;
          }

          case 'util_safe_halt': {
            this.isRunning = false;
            message = `Emergency Safe Halt executed`;
            break;
          }

          case 'custom_block': {
            const customDef = block.customBlockId ? this.customBlocks.get(block.customBlockId) : null;
            if (customDef) {
              if (this.activeCustomBlockStack.includes(customDef.id)) {
                const chain = [...this.activeCustomBlockStack, customDef.id].join(' -> ');
                throw new Error(`Circular custom block dependency detected: ${chain} (infinite recursion loop)`);
              }
              if (this.currentCallDepth > 50) {
                throw new Error(`Maximum call depth (50) exceeded in custom block '${customDef.name}' (possible infinite recursion loop)`);
              }
              message = `Executing custom block '${customDef.name}'`;
              this.activeCustomBlockStack.push(customDef.id);

              // Isolate local variables scope
              const variableBackups = new Map<string, any>();
              for (const input of customDef.inputs) {
                if (this.variables.has(input.name)) {
                  variableBackups.set(input.name, this.variables.get(input.name));
                }
                const paramVal = params[input.name] !== undefined ? params[input.name] : input.defaultValue;
                this.variables.set(input.name, paramVal);
              }

              try {
                await this.executeBlockList(customDef.internalBlocks);
              } finally {
                this.activeCustomBlockStack.pop();
                // Restore outer scope variables
                for (const input of customDef.inputs) {
                  if (variableBackups.has(input.name)) {
                    this.variables.set(input.name, variableBackups.get(input.name));
                  } else {
                    this.variables.delete(input.name);
                  }
                }
              }
            } else {
              message = `Custom block '${block.title}' executed`;
            }
            break;
          }

          case 'macro_call_sub': {
            const subName = String(params.subMacroName || '');
            message = `Called Sub-Macro routine: '${subName}'`;
            const sub = Array.from(this.subMacros.values()).find((s) => s.name === subName);
            if (sub) {
              if (this.currentCallDepth > 50) {
                throw new Error(`Maximum call depth (50) exceeded calling sub-macro '${subName}' (possible infinite recursion loop)`);
              }
              await this.executeBlockList(sub.blocks);
            }
            break;
          }

          default: {
            message = `Executed ${block.title}`;
            break;
          }
        }

        success = true;
      } catch (err: any) {
        errorDetails = err.message || 'Unknown error occurred';
        if (attempt <= (this.defaultErrorRecovery === 'retry' ? this.maxRetryAttempts : 0)) {
          await new Promise((r) => setTimeout(r, 100 * attempt));
        } else {
          status = 'failed';
          message = `Error in ${block.title}: ${errorDetails}`;
        }
      }
    }

    const duration = Date.now() - blockStart;
    this.updateMetrics(block, duration);

    // Create History Item
    const historyItem: ExecutionHistoryItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      blockId: block.id,
      blockTitle: block.title,
      category: block.category,
      status,
      durationMs: duration,
      message,
      variablesSnapshot: this.getVariables(),
    };

    this.executionHistory.unshift(historyItem);
    if (this.executionHistory.length > 300) {
      this.executionHistory.pop();
    }

    // Create Granular Trace Item
    const traceItem: ExecutionTraceItem = {
      id: `trace_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      blockId: block.id,
      blockTitle: block.title,
      category: block.category,
      state: status === 'success' ? 'success' : 'failed',
      inputs: block.parameters,
      durationMs: duration,
      error: errorDetails,
    };

    this.executionTraces.unshift(traceItem);
    if (this.executionTraces.length > 500) {
      this.executionTraces.pop();
    }

    let runtimeError: RuntimeErrorModel | undefined;
    if (status === 'failed') {
      runtimeError = {
        errorId: `err_${Date.now()}`,
        timestamp: Date.now(),
        message: errorDetails || 'Execution failed',
        blockId: block.id,
        blockTitle: block.title,
        severity: 'error',
        recoveryStrategy: this.defaultErrorRecovery,
        retryCount: attempt - 1,
      };
      this.recentErrors.unshift(runtimeError);
      if (this.recentErrors.length > 50) this.recentErrors.pop();

      if (this.defaultErrorRecovery === 'stop') {
        this.isRunning = false;
        this.debuggerState.status = 'error';
        this.debuggerState.error = errorDetails || 'Execution failed';
      }
    }

    this.notify('block_end', {
      blockId: block.id,
      blockTitle: block.title,
      status,
      historyItem,
      traceItem,
      runtimeError,
    });
  }

  private async executeBlockList(list: BlockNode[]): Promise<void> {
    this.currentCallDepth++;
    this.maxCallDepthReached = Math.max(this.maxCallDepthReached, this.currentCallDepth);

    for (const child of list) {
      if (!this.isRunning || this.breakEncountered || this.continueEncountered) break;
      if (child.isDisabled) continue;
      await this.executeBlock(child);
    }

    this.currentCallDepth--;
  }

  private playWebAudioBeep(frequency: number, durationMs: number) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      // Audio context may be restricted
    }
  }
}
