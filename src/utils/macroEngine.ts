import { MacroNode, HumanizerConfig, MacroVariable } from '../types';
import { generateHumanPath, getHumanClickPoint, randomizeDelay, DEFAULT_HUMANIZER_CONFIG } from './humanizer';
import { executeMultiImageSearch, searchColorInRegion } from './visualEngine';

export interface StepLogEntry {
  timestamp: number;
  nodeId: string;
  actionType: string;
  status: 'running' | 'success' | 'failed' | 'skipped';
  durationMs: number;
  message: string;
  outputVariables?: Record<string, any>;
}

export type ExecutionStatusCallback = (
  activeNodeId: string | null,
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error',
  logEntry?: StepLogEntry
) => void;

export class MacroExecutionEngine {
  private nodes: Map<string, MacroNode> = new Map();
  private variables: Map<string, any> = new Map();
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private humanizerConfig: HumanizerConfig = DEFAULT_HUMANIZER_CONFIG;
  private loopCounters: Map<string, number> = new Map();
  private maxStepLimit: number = 2000;

  constructor(nodes: MacroNode[] = [], initialVariables: MacroVariable[] = [], humanizerConfig?: HumanizerConfig) {
    this.setGraph(nodes);
    this.setVariables(initialVariables);
    if (humanizerConfig) this.humanizerConfig = humanizerConfig;
  }

  public setGraph(nodes: MacroNode[]) {
    this.nodes.clear();
    for (const node of nodes) {
      this.nodes.set(node.id, { ...node });
    }
  }

  public setVariables(vars: MacroVariable[]) {
    this.variables.clear();
    for (const v of vars) {
      this.variables.set(v.name, v.value !== undefined ? v.value : v.defaultValue);
    }
    // Preset default runtime variables if not present
    if (!this.variables.has('mouseX')) this.variables.set('mouseX', 960);
    if (!this.variables.has('mouseY')) this.variables.set('mouseY', 540);
    if (!this.variables.has('foundX')) this.variables.set('foundX', 960);
    if (!this.variables.has('foundY')) this.variables.set('foundY', 540);
    if (!this.variables.has('matchScore')) this.variables.set('matchScore', 0.95);
    if (!this.variables.has('lastResult')) this.variables.set('lastResult', true);
  }

  public getVariable(name: string): any {
    return this.variables.get(name);
  }

  public setVariable(name: string, value: any) {
    this.variables.set(name, value);
  }

  public getAllVariables(): Record<string, any> {
    const res: Record<string, any> = {};
    this.variables.forEach((v, k) => {
      res[k] = v;
    });
    return res;
  }

  public stop() {
    this.isRunning = false;
    this.isPaused = false;
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Helper to interpolate variable names within parameters (e.g. "Move to {{foundX}}, {{foundY}}")
   */
  private interpolateParams(raw: string): string {
    if (!raw) return '';
    return raw.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, varName) => {
      const val = this.variables.get(varName);
      return val !== undefined ? String(val) : '';
    });
  }

  /**
   * Evaluates comparison expressions
   */
  private evaluateCondition(param: string): boolean {
    try {
      const interpolated = this.interpolateParams(param).trim();
      if (!interpolated) return true;

      // Handle direct comparisons: "A == B", "A > B", "A < B", "A != B", "A >= B", "A <= B"
      const match = interpolated.match(/^(.+?)\s*(===|==|!==|!=|>=|<=|>|<|contains)\s*(.+)$/i);
      if (match) {
        const leftRaw = match[1].trim();
        const op = match[2].trim();
        const rightRaw = match[3].trim();

        const parseVal = (str: string) => {
          if (str.toLowerCase() === 'true') return true;
          if (str.toLowerCase() === 'false') return false;
          if (!isNaN(Number(str)) && str !== '') return Number(str);
          return str.replace(/^["']|["']$/g, '');
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
          default:
            return true;
        }
      }

      // Check single variable boolean
      if (this.variables.has(interpolated)) {
        return Boolean(this.variables.get(interpolated));
      }

      return Boolean(eval(interpolated));
    } catch {
      return true;
    }
  }

  /**
   * Main Execution Engine Loop with branching and loop support
   */
  public async execute(
    onStatusChange?: ExecutionStatusCallback,
    onLog?: (msg: string) => void
  ): Promise<StepLogEntry[]> {
    this.isRunning = true;
    this.isPaused = false;
    this.loopCounters.clear();

    const logs: StepLogEntry[] = [];
    const allNodes = Array.from(this.nodes.values());

    if (allNodes.length === 0) {
      this.isRunning = false;
      onStatusChange?.(null, 'completed');
      return logs;
    }

    // Locate Start Node
    let currentNode: MacroNode | undefined =
      allNodes.find((n) => n.actionType === 'Event (Start)' && !n.disabled) ||
      allNodes.find((n) => !n.disabled);

    let stepCount = 0;

    onLog?.(`[Engine] Initializing execution pipeline. Starting at node: ${currentNode?.id || 'none'}`);
    onStatusChange?.(currentNode?.id || null, 'running');

    while (currentNode && this.isRunning) {
      while (this.isPaused && this.isRunning) {
        await new Promise((res) => setTimeout(res, 100));
      }
      if (!this.isRunning) break;

      if (stepCount++ > this.maxStepLimit) {
        onLog?.(`[Engine Safety] Maximum step limit (${this.maxStepLimit}) reached. Halting loop to prevent lockup.`);
        break;
      }

      const activeId = currentNode.id;
      const startTime = performance.now();

      onStatusChange?.(activeId, 'running');

      let nextNodeId: string | null = null;
      let stepMessage = '';
      let isSuccess = true;

      try {
        const param = this.interpolateParams(currentNode.parameters || '');

        switch (currentNode.actionType) {
          case 'Event (Start)':
          case 'Event (Key Pressed)':
          case 'Event (Key Released)':
          case 'Event (Mouse Event)':
          case 'Event (Timer Tick)': {
            stepMessage = `Triggered: ${currentNode.actionType}`;
            await new Promise((res) => setTimeout(res, 20));
            break;
          }

          case 'Search Color': {
            const parts = param.split(',').map((s) => s.trim());
            const x = parseInt(parts[0] || '860', 10);
            const y = parseInt(parts[1] || '440', 10);
            const w = parseInt(parts[2] || '200', 10);
            const h = parseInt(parts[3] || '200', 10);
            const color = parts[4] || '#39FF14';

            const result = await searchColorInRegion(x, y, w, h, color);
            this.variables.set('foundX', result.x);
            this.variables.set('foundY', result.y);
            this.variables.set('lastResult', result.found);
            stepMessage = result.found
              ? `Color '${color}' detected at (${result.x}, ${result.y})`
              : `Color '${color}' not found in region [${x}, ${y}, ${w}, ${h}]`;
            break;
          }

          case 'Multi-Image Search': {
            const result = await executeMultiImageSearch(
              [
                { id: 'target_1', name: 'target_marker.png', confidence: 0.85, priority: 1 },
                { id: 'target_2', name: 'head_crosshair.png', confidence: 0.88, priority: 2 },
              ],
              {
                captureRegionX: 800,
                captureRegionY: 400,
                captureRegionWidth: 320,
                captureRegionHeight: 280,
                colorTolerance: 15,
                captureIntervalMs: 50,
              }
            );
            this.variables.set('foundX', result.x);
            this.variables.set('foundY', result.y);
            this.variables.set('matchScore', result.confidence);
            this.variables.set('lastResult', result.matched);
            stepMessage = result.matched
              ? `Image matched '${result.targetName || 'target'}' at (${result.x}, ${result.y}) [Score: ${(result.confidence * 100).toFixed(0)}%]`
              : 'Multi-image search found no matches above confidence threshold';
            break;
          }

          case 'Move Mouse': {
            const coords = param.match(/(\d+)[\s,]+(\d+)/);
            const targetX = coords ? parseInt(coords[1], 10) : Number(this.variables.get('foundX') || 960);
            const targetY = coords ? parseInt(coords[2], 10) : Number(this.variables.get('foundY') || 540);
            const currentX = Number(this.variables.get('mouseX') || 960);
            const currentY = Number(this.variables.get('mouseY') || 540);

            const path = generateHumanPath({ x: currentX, y: currentY }, { x: targetX, y: targetY }, this.humanizerConfig);
            this.variables.set('mouseX', targetX);
            this.variables.set('mouseY', targetY);
            await new Promise((res) => setTimeout(res, 30));
            stepMessage = `Smooth Bézier mouse move (${currentX}, ${currentY}) -> (${targetX}, ${targetY}) via ${path.length} control points`;
            break;
          }

          case 'Human Click':
          case 'Click Mouse': {
            const curX = Number(this.variables.get('mouseX') || 960);
            const curY = Number(this.variables.get('mouseY') || 540);
            const click = getHumanClickPoint(curX, curY, this.humanizerConfig.clickOffsetRadiusPx);
            const hold = randomizeDelay(45, -6, 12);
            await new Promise((res) => setTimeout(res, hold));
            stepMessage = `Dispatched Human Click at (${click.x}, ${click.y}) [Hold: ${hold}ms]`;
            break;
          }

          case 'Press Key': {
            const key = param.trim() || 'R';
            const delay = randomizeDelay(50, -8, 15);
            await new Promise((res) => setTimeout(res, delay));
            stepMessage = `Dispatched key press '${key}' [Duration: ${delay}ms]`;
            break;
          }

          case 'Delay': {
            const ms = parseInt(param, 10) || 50;
            const jittered = randomizeDelay(ms, this.humanizerConfig.minDelayJitterMs, this.humanizerConfig.maxDelayJitterMs);
            await new Promise((res) => setTimeout(res, jittered));
            stepMessage = `Executed Delay ${jittered}ms (base: ${ms}ms)`;
            break;
          }

          case 'Condition (If)':
          case 'Compare': {
            const conditionMet = this.evaluateCondition(param);
            this.variables.set('lastResult', conditionMet);
            stepMessage = `Evaluated condition: '${param}' => ${conditionMet ? 'TRUE' : 'FALSE'}`;

            if (currentNode.conditionBranch) {
              nextNodeId = conditionMet
                ? currentNode.conditionBranch.trueNodeId || null
                : currentNode.conditionBranch.falseNodeId || null;
            }
            break;
          }

          case 'Set Variable': {
            // e.g. "score = 100" or "targetLocked = true"
            const parts = param.split('=').map((s) => s.trim());
            if (parts.length >= 2) {
              const varName = parts[0];
              const rawVal = parts[1];
              let parsedVal: any = rawVal;
              if (rawVal.toLowerCase() === 'true') parsedVal = true;
              else if (rawVal.toLowerCase() === 'false') parsedVal = false;
              else if (!isNaN(Number(rawVal)) && rawVal !== '') parsedVal = Number(rawVal);

              this.variables.set(varName, parsedVal);
              stepMessage = `Variable set: ${varName} = ${parsedVal}`;
            } else {
              stepMessage = `Set Variable param invalid: '${param}'`;
            }
            break;
          }

          case 'Math Operation': {
            // e.g. "counter = counter + 1"
            const match = param.match(/^([a-zA-Z0-9_]+)\s*=\s*(.+)$/);
            if (match) {
              const targetVar = match[1];
              const expr = match[2];
              try {
                const interpolatedExpr = this.interpolateParams(expr);
                const computed = eval(interpolatedExpr);
                this.variables.set(targetVar, computed);
                stepMessage = `Computed Math: ${targetVar} = ${computed}`;
              } catch {
                stepMessage = `Failed to evaluate math expression: '${expr}'`;
              }
            }
            break;
          }

          case 'Repeat Loop':
          case 'Loop (While)':
          case 'While Color Exists': {
            const count = parseInt(param, 10) || 5;
            const currentCount = this.loopCounters.get(activeId) || 0;

            if (currentCount < count) {
              this.loopCounters.set(activeId, currentCount + 1);
              stepMessage = `Loop iteration ${currentCount + 1} of ${count}`;
              if (currentNode.loopBranch?.bodyNodeId) {
                nextNodeId = currentNode.loopBranch.bodyNodeId;
              }
            } else {
              this.loopCounters.set(activeId, 0);
              stepMessage = `Loop completed all ${count} iterations`;
              if (currentNode.loopBranch?.doneNodeId) {
                nextNodeId = currentNode.loopBranch.doneNodeId;
              }
            }
            break;
          }

          case 'ADB Tap': {
            const parts = param.split(',').map((s) => s.trim());
            const x = parts[0] || this.variables.get('foundX') || '960';
            const y = parts[1] || this.variables.get('foundY') || '540';
            await new Promise((res) => setTimeout(res, 25));
            stepMessage = `Dispatched ADB Tap coords: (${x}, ${y})`;
            break;
          }

          case 'ADB Swipe': {
            const parts = param.split(',').map((s) => s.trim());
            const x1 = parts[0] || '500';
            const y1 = parts[1] || '1000';
            const x2 = parts[2] || '500';
            const y2 = parts[3] || '300';
            const dur = parts[4] || '300';
            await new Promise((res) => setTimeout(res, 40));
            stepMessage = `Dispatched ADB Swipe: (${x1}, ${y1}) -> (${x2}, ${y2}) [${dur}ms]`;
            break;
          }

          case 'ADB Shell': {
            await new Promise((res) => setTimeout(res, 30));
            stepMessage = `Executed ADB Shell command: '${param}'`;
            break;
          }

          case 'Notification':
          case 'Sound Beep':
          case 'Log Message': {
            stepMessage = `[Studio] ${param || 'Notification ping'}`;
            break;
          }

          case 'Script Block': {
            await new Promise((res) => setTimeout(res, 35));
            stepMessage = `Evaluated custom script block`;
            break;
          }

          default: {
            await new Promise((res) => setTimeout(res, 20));
            stepMessage = `Executed Custom Action: ${currentNode.actionType} (${param})`;
            break;
          }
        }
      } catch (err: any) {
        isSuccess = false;
        stepMessage = `Execution Exception: ${err?.message || String(err)}`;
      }

      const durationMs = Math.round((performance.now() - startTime) * 10) / 10;
      const logEntry: StepLogEntry = {
        timestamp: Date.now(),
        nodeId: activeId,
        actionType: currentNode.actionType,
        status: isSuccess ? 'success' : 'failed',
        durationMs,
        message: stepMessage,
        outputVariables: this.getAllVariables(),
      };

      logs.push(logEntry);
      onLog?.(`[Step ${logs.length}] ${currentNode.actionType}: ${stepMessage} (${durationMs}ms)`);
      onStatusChange?.(activeId, isSuccess ? 'running' : 'error', logEntry);

      // Determine next node
      if (!nextNodeId) {
        if (currentNode.nextNodes && currentNode.nextNodes.length > 0) {
          nextNodeId = currentNode.nextNodes[0];
        }
      }

      if (nextNodeId && this.nodes.has(nextNodeId)) {
        currentNode = this.nodes.get(nextNodeId);
      } else {
        currentNode = undefined;
      }
    }

    this.isRunning = false;
    onStatusChange?.(null, 'completed');
    onLog?.(`[Engine] Macro pipeline finished. Total steps executed: ${logs.length}`);
    return logs;
  }
}
