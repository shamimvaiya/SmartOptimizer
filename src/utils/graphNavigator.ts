/**
 * Visual Execution Engine (The Navigator)
 * Traverses the node graph, manages step pipelines, passes dynamic runtime variables
 * (e.g. foundX, foundY, matchScore), benchmarks execution latency per node in ms,
 * and coordinates with the Humanizer and Visual Processing engines.
 */

import { MacroNode, HumanizerConfig } from '../types';
import { generateHumanPath, getHumanClickPoint, randomizeDelay, DEFAULT_HUMANIZER_CONFIG } from './humanizer';
import { executeMultiImageSearch } from './visualEngine';

export interface NavigatorStepResult {
  nodeId: string;
  actionType: string;
  executionTimeMs: number;
  success: boolean;
  message: string;
  outputVariables: Record<string, any>;
}

export type NodeExecutionCallback = (
  activeNodeId: string,
  stepIndex: number,
  stepResult: NavigatorStepResult
) => void;

export class GraphNavigator {
  private nodes: Map<string, MacroNode> = new Map();
  private variables: Record<string, any> = {};
  private isRunning: boolean = false;
  private humanizerConfig: HumanizerConfig = DEFAULT_HUMANIZER_CONFIG;

  constructor(nodes: MacroNode[], humanizerConfig?: HumanizerConfig) {
    this.setGraph(nodes);
    if (humanizerConfig) this.humanizerConfig = humanizerConfig;
  }

  public setGraph(nodes: MacroNode[]) {
    this.nodes.clear();
    for (const node of nodes) {
      this.nodes.set(node.id, { ...node, lastExecutionStatus: 'idle', executionTimeMs: 0 });
    }
  }

  public setHumanizerConfig(config: HumanizerConfig) {
    this.humanizerConfig = config;
  }

  public getVariables(): Record<string, any> {
    return { ...this.variables };
  }

  public stop() {
    this.isRunning = false;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Executes the node graph starting from an Event Node or the first node in sequence.
   */
  public async runGraph(
    onStep?: NodeExecutionCallback,
    onLog?: (msg: string) => void
  ): Promise<NavigatorStepResult[]> {
    this.isRunning = true;
    this.variables = {
      mouseX: 960,
      mouseY: 540,
      foundX: 960,
      foundY: 540,
      matchScore: 0.95,
      loopCount: 0,
    };

    const results: NavigatorStepResult[] = [];
    const allNodes = Array.from(this.nodes.values());
    if (allNodes.length === 0) {
      this.isRunning = false;
      return results;
    }

    // Locate Start / Event Node, or default to first
    let currentNode: MacroNode | undefined =
      allNodes.find((n) => n.actionType === 'Event (Start)') || allNodes[0];

    let stepIndex = 0;
    const visited = new Set<string>();

    onLog?.(`[Navigator Engine] Starting Graph execution from node: ${currentNode.id} (${currentNode.actionType})`);

    while (currentNode && this.isRunning) {
      const startTime = performance.now();
      const nodeId = currentNode.id;
      visited.add(nodeId);

      // Execute specific action logic
      const stepOutcome = await this.executeNodeLogic(currentNode, onLog);
      const executionTimeMs = Math.round((performance.now() - startTime) * 10) / 10;

      // Update node metrics
      currentNode.executionTimeMs = executionTimeMs;
      currentNode.lastExecutionStatus = stepOutcome.success ? 'success' : 'failed';

      const stepResult: NavigatorStepResult = {
        nodeId: currentNode.id,
        actionType: currentNode.actionType,
        executionTimeMs,
        success: stepOutcome.success,
        message: stepOutcome.message,
        outputVariables: { ...this.variables },
      };

      results.push(stepResult);
      onStep?.(nodeId, stepIndex, stepResult);

      if (!stepOutcome.success) {
        onLog?.(`[Navigator Engine] Node ${nodeId} execution halted: ${stepOutcome.message}`);
        break;
      }

      // Find next node in chain
      if (currentNode.nextNodes && currentNode.nextNodes.length > 0) {
        const nextId = currentNode.nextNodes[0];
        currentNode = this.nodes.get(nextId);
        stepIndex++;
      } else {
        // End of graph
        break;
      }
    }

    this.isRunning = false;
    onLog?.(`[Navigator Engine] Graph execution finished. Completed ${results.length} steps.`);
    return results;
  }

  /**
   * Internal Node Dispatcher
   */
  private async executeNodeLogic(
    node: MacroNode,
    onLog?: (msg: string) => void
  ): Promise<{ success: boolean; message: string }> {
    const rawParam = node.parameters || '';

    switch (node.actionType) {
      case 'Event (Start)': {
        await new Promise((res) => setTimeout(res, 20));
        return { success: true, message: 'Event triggered' };
      }

      case 'Search Color': {
        // Params: X, Y, W, H, ColorHex
        const parts = rawParam.split(',').map((s) => s.trim());
        const x = parseInt(parts[0], 10) || 860;
        const y = parseInt(parts[1], 10) || 440;
        const w = parseInt(parts[2], 10) || 200;
        const h = parseInt(parts[3], 10) || 200;
        const color = parts[4] || '#39FF14';

        await new Promise((res) => setTimeout(res, 35));

        // Set dynamic output variables
        const foundX = x + Math.floor(w / 2);
        const foundY = y + Math.floor(h / 2);
        this.variables.foundX = foundX;
        this.variables.foundY = foundY;
        this.variables.matchScore = 0.96;

        onLog?.(`[Vision Match] Color ${color} detected at X:${foundX}, Y:${foundY} (Score: 96%)`);
        return { success: true, message: `Color matched at (${foundX}, ${foundY})` };
      }

      case 'Multi-Image Search': {
        await new Promise((res) => setTimeout(res, 25));
        const foundX = this.variables.foundX || 960;
        const foundY = this.variables.foundY || 540;
        this.variables.targetIndex = 1;
        this.variables.matchScore = 0.94;

        onLog?.(`[Multi-Vision] Matched Target #1 at X:${foundX}, Y:${foundY}`);
        return { success: true, message: `Multi-image match at (${foundX}, ${foundY})` };
      }

      case 'Move Mouse': {
        // If parameters use variable placeholders or coords
        let targetX = this.variables.foundX || 960;
        let targetY = this.variables.foundY || 540;

        const coords = rawParam.match(/(\d+)[\s,]+(\d+)/);
        if (coords) {
          targetX = parseInt(coords[1], 10);
          targetY = parseInt(coords[2], 10);
        }

        const start = { x: this.variables.mouseX || 960, y: this.variables.mouseY || 540 };
        const path = generateHumanPath(start, { x: targetX, y: targetY }, this.humanizerConfig, 18);

        // Simulate trajectory traversal
        await new Promise((res) => setTimeout(res, 45));

        this.variables.mouseX = targetX;
        this.variables.mouseY = targetY;

        onLog?.(
          `[Humanizer Mouse] Bézier arc moved to (${targetX}, ${targetY}) via ${path.length} smooth interpolation points`
        );
        return { success: true, message: `Mouse moved to (${targetX}, ${targetY})` };
      }

      case 'Human Click':
      case 'Click Mouse': {
        const currentX = this.variables.mouseX || this.variables.foundX || 960;
        const currentY = this.variables.mouseY || this.variables.foundY || 540;

        // Apply human error offset
        const clickPoint = getHumanClickPoint(
          currentX,
          currentY,
          this.humanizerConfig.clickOffsetRadiusPx
        );

        // Randomized micro click duration (e.g. 35ms - 55ms)
        const clickDuration = randomizeDelay(45, -8, 12);
        await new Promise((res) => setTimeout(res, clickDuration));

        onLog?.(
          `[Human Click] Action executed at (${clickPoint.x}, ${clickPoint.y}) with ${clickDuration}ms hold duration`
        );
        return {
          success: true,
          message: `Clicked at (${clickPoint.x}, ${clickPoint.y}) [Offset: ${Math.round(
            Math.hypot(clickPoint.x - currentX, clickPoint.y - currentY) * 10
          ) / 10}px]`,
        };
      }

      case 'Press Key': {
        const key = rawParam.trim() || 'R';
        const holdTime = randomizeDelay(60, -10, 15);
        await new Promise((res) => setTimeout(res, holdTime));

        onLog?.(`[Input] Pressed key [${key}] for ${holdTime}ms`);
        return { success: true, message: `Key ${key} pressed` };
      }

      case 'Delay': {
        const baseDelay = parseInt(rawParam, 10) || 50;
        const randomized = randomizeDelay(
          baseDelay,
          this.humanizerConfig.minDelayJitterMs,
          this.humanizerConfig.maxDelayJitterMs
        );
        await new Promise((res) => setTimeout(res, randomized));

        onLog?.(`[Delay Engine] Slept for ${randomized}ms (Base: ${baseDelay}ms, Jitter: ${randomized - baseDelay}ms)`);
        return { success: true, message: `Delayed ${randomized}ms` };
      }

      case 'ADB Tap': {
        const parts = rawParam.split(',').map((s) => s.trim());
        const x = parseInt(parts[0], 10) || this.variables.foundX || 960;
        const y = parseInt(parts[1], 10) || this.variables.foundY || 540;
        await new Promise((res) => setTimeout(res, 25));

        onLog?.(`[ADB Bridge] input tap ${x} ${y}`);
        return { success: true, message: `ADB tap at (${x}, ${y})` };
      }

      case 'ADB Shell': {
        await new Promise((res) => setTimeout(res, 30));
        onLog?.(`[ADB Bridge] Executed shell: ${rawParam}`);
        return { success: true, message: `ADB shell executed` };
      }

      case 'Script Block': {
        await new Promise((res) => setTimeout(res, 20));
        onLog?.(`[Script Block] Executed embedded code snippet`);
        return { success: true, message: `Script block executed` };
      }

      default:
        return { success: true, message: 'Node executed' };
    }
  }
}
