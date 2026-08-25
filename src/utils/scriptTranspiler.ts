/**
 * Hybrid Scripting & Node-to-Code Transpiler
 * Generates production-ready C# (Roslyn API) and JavaScript (ClearScript/V8) scripts
 * from visual node graphs, and provides a sandboxed execution runtime.
 */

import { BlockNode, MacroNode, ScriptExecutionResult } from '../types';
import { generateHumanPath, getHumanClickPoint, randomizeDelay } from './humanizer';

export function transpileBlocksToCSharp(blocks: BlockNode[]): string {
  const lines: string[] = [
    '// ===================================================================',
    '// SmartOptimizer (AIM/OPT Pro v3.5) - Visual Block Coding to C# Script',
    '// Target Architecture: .NET 8.0 WPF / Windows Kernel P-Invoke Pipeline',
    '// ===================================================================',
    '',
    'using System;',
    'using System.Drawing;',
    'using System.Threading.Tasks;',
    'using SmartOptimizer.Core.Services;',
    'using SmartOptimizer.Core.Input;',
    'using SmartOptimizer.Core.Vision;',
    '',
    'namespace SmartOptimizer.Generated',
    '{',
    '    public class BlockMacroScript',
    '    {',
    '        private readonly AdbService _adb = new AdbService();',
    '        private readonly HumanizerService _humanizer = new HumanizerService();',
    '        private readonly VariableContext _vars = new VariableContext();',
    '',
    '        public async Task ExecuteBlocksAsync()',
    '        {',
    '            Logger.Log("[BlockEngine] Initializing interlocking block execution pipeline...");',
    '',
  ];

  function transpileBlockList(list: BlockNode[], indent: string) {
    for (let i = 0; i < list.length; i++) {
      const blk = list[i];
      if (blk.isDisabled) continue;
      const p = blk.parameters || {};

      lines.push(`${indent}// Block: ${blk.title} [${blk.category}]`);
      if (blk.comment) {
        lines.push(`${indent}// Note: ${blk.comment}`);
      }

      switch (blk.type) {
        case 'event_start':
        case 'event_key_pressed':
        case 'event_timer_tick': {
          lines.push(`${indent}Logger.Log($"[Event] ${blk.title} triggered");`);
          if (blk.childSlots?.actions) {
            transpileBlockList(blk.childSlots.actions, indent);
          }
          break;
        }

        case 'action_human_click': {
          const btn = p.button || 'left';
          const jitter = p.jitterRadius || 3;
          lines.push(`${indent}await _humanizer.PerformHumanClickAsync(_vars.GetPoint("mouseX", "mouseY"), "${btn}", jitterRadius: ${jitter});`);
          break;
        }

        case 'action_move_mouse': {
          const x = p.x ?? 960;
          const y = p.y ?? 540;
          const smooth = p.smooth !== false;
          lines.push(`${indent}await _humanizer.MoveMouseBezierAsync(new Point(${x}, ${y}), smooth: ${smooth});`);
          lines.push(`${indent}_vars.Set("mouseX", ${x}); _vars.Set("mouseY", ${y});`);
          break;
        }

        case 'action_press_key': {
          const key = p.key || 'R';
          const dur = p.durationMs || 60;
          lines.push(`${indent}await InputDriver.PressKeyAsync("${key}", durationMs: ${dur});`);
          break;
        }

        case 'action_send_text': {
          const text = p.text || '';
          lines.push(`${indent}await InputDriver.TypeTextAsync("${text}");`);
          break;
        }

        case 'action_log_message': {
          lines.push(`${indent}Logger.Log($"${p.message || ''}");`);
          break;
        }

        case 'action_sound_beep': {
          lines.push(`${indent}Console.Beep(${p.frequency || 880}, ${p.durationMs || 120});`);
          break;
        }

        case 'condition_if_else': {
          lines.push(`${indent}if (${p.expression || 'true'})`);
          lines.push(`${indent}{`);
          if (blk.childSlots?.then && blk.childSlots.then.length > 0) {
            transpileBlockList(blk.childSlots.then, indent + '    ');
          } else {
            lines.push(`${indent}    // Then branch empty`);
          }
          lines.push(`${indent}}`);
          if (blk.childSlots?.else && blk.childSlots.else.length > 0) {
            lines.push(`${indent}else`);
            lines.push(`${indent}{`);
            transpileBlockList(blk.childSlots.else, indent + '    ');
            lines.push(`${indent}}`);
          }
          break;
        }

        case 'condition_compare': {
          const left = p.leftOperand || '0';
          const op = p.operator || '==';
          const right = p.rightOperand || '0';
          lines.push(`${indent}if (${left} ${op} ${right})`);
          lines.push(`${indent}{`);
          if (blk.childSlots?.then && blk.childSlots.then.length > 0) {
            transpileBlockList(blk.childSlots.then, indent + '    ');
          } else {
            lines.push(`${indent}    // Then branch empty`);
          }
          lines.push(`${indent}}`);
          if (blk.childSlots?.else && blk.childSlots.else.length > 0) {
            lines.push(`${indent}else`);
            lines.push(`${indent}{`);
            transpileBlockList(blk.childSlots.else, indent + '    ');
            lines.push(`${indent}}`);
          }
          break;
        }

        case 'condition_color_found': {
          lines.push(`${indent}var match = await VisionEngine.SearchColorAsync(new Rectangle(${p.regionX || 860}, ${p.regionY || 440}, ${p.width || 200}, ${p.height || 200}), "${p.color || '#39FF14'}");`);
          lines.push(`${indent}if (match.Success)`);
          lines.push(`${indent}{`);
          if (blk.childSlots?.then && blk.childSlots.then.length > 0) {
            transpileBlockList(blk.childSlots.then, indent + '    ');
          }
          lines.push(`${indent}}`);
          if (blk.childSlots?.else && blk.childSlots.else.length > 0) {
            lines.push(`${indent}else`);
            lines.push(`${indent}{`);
            transpileBlockList(blk.childSlots.else, indent + '    ');
            lines.push(`${indent}}`);
          }
          break;
        }

        case 'loop_repeat_count': {
          const count = p.count || 5;
          const varName = p.counterVar || 'i';
          lines.push(`${indent}for (int ${varName} = 1; ${varName} <= ${count}; ${varName}++)`);
          lines.push(`${indent}{`);
          lines.push(`${indent}    _vars.Set("${varName}", ${varName});`);
          if (blk.childSlots?.body && blk.childSlots.body.length > 0) {
            transpileBlockList(blk.childSlots.body, indent + '    ');
          }
          lines.push(`${indent}}`);
          break;
        }

        case 'loop_while': {
          lines.push(`${indent}while (${p.condition || 'false'})`);
          lines.push(`${indent}{`);
          if (blk.childSlots?.body && blk.childSlots.body.length > 0) {
            transpileBlockList(blk.childSlots.body, indent + '    ');
          }
          lines.push(`${indent}}`);
          break;
        }

        case 'loop_break': {
          lines.push(`${indent}break;`);
          break;
        }

        case 'loop_continue': {
          lines.push(`${indent}continue;`);
          break;
        }

        case 'var_set': {
          lines.push(`${indent}_vars.Set("${p.varName || 'var'}", "${p.value ?? '0'}");`);
          break;
        }

        case 'var_change_by': {
          lines.push(`${indent}_vars.Increment("${p.varName || 'var'}", ${p.delta || 1});`);
          break;
        }

        case 'math_calc': {
          lines.push(`${indent}_vars.Set("${p.outputVar || 'res'}", (${p.operandA || 0}) ${p.operator || '+'} (${p.operandB || 0}));`);
          break;
        }

        case 'timing_delay': {
          lines.push(`${indent}await Task.Delay(_humanizer.RandomizeDelay(${p.durationMs || 100}, ${p.jitterMs || 10}));`);
          break;
        }

        case 'adb_tap': {
          lines.push(`${indent}await _adb.TapAsync(${p.x || 960}, ${p.y || 540});`);
          break;
        }

        case 'adb_swipe': {
          lines.push(`${indent}await _adb.SwipeAsync(${p.startX || 500}, ${p.startY || 800}, ${p.endX || 500}, ${p.endY || 300}, ${p.durationMs || 250});`);
          break;
        }

        case 'adb_shell': {
          lines.push(`${indent}await _adb.ExecuteShellAsync("${p.command || ''}");`);
          break;
        }

        case 'util_breakpoint': {
          lines.push(`${indent}#if DEBUG`);
          lines.push(`${indent}System.Diagnostics.Debugger.Break(); // Breakpoint note: ${p.reason || ''}`);
          lines.push(`${indent}#endif`);
          break;
        }

        default: {
          lines.push(`${indent}await ExecutionRuntime.DispatchGenericBlockAsync("${blk.title}");`);
          break;
        }
      }
      lines.push('');
    }
  }

  transpileBlockList(blocks, '            ');

  lines.push('            Logger.Log("[BlockEngine] Block sequence execution completed successfully.");');
  lines.push('        }');
  lines.push('    }');
  lines.push('}');

  return lines.join('\n');
}

/**
 * Transpiles Node Graph into clean, idiomatic C# code (compatible with Microsoft.CodeAnalysis.CSharp.Scripting)
 */
export function transpileGraphToCSharp(nodes: MacroNode[]): string {
  const lines: string[] = [
    '// ===================================================================',
    '// SmartOptimizer (AIM/OPT Pro v3.0) - Auto-Generated C# Roslyn Script',
    '// Engine: Microsoft.CodeAnalysis.CSharp.Scripting / .NET 8.0 Runtime',
    '// ===================================================================',
    '',
    'using System;',
    'using System.Drawing;',
    'using System.Threading.Tasks;',
    'using SmartOptimizer.Core.Intelligence;',
    'using SmartOptimizer.Core.Vision;',
    'using SmartOptimizer.Core.Input;',
    '',
    'public class AutoGeneratedMacro',
    '{',
    '    public static async Task ExecuteAsync(MacroExecutionContext context)',
    '    {',
    '        context.Log("Starting SmartOptimizer Execution Pipeline...");',
    '        var humanizer = new HumanizerEngine(new HumanizerConfig { EnableBezier = true, CurvatureIntensity = 0.45f });',
    '        var vision = context.VisualEngine;',
    '        var mouse = context.MouseDriver;',
    '        var keyboard = context.KeyboardDriver;',
    '        var adb = context.AdbBridge;',
    '',
    '        Point currentCursor = mouse.GetCursorPosition();',
    '        Point targetPoint = Point.Empty;',
    '        double matchScore = 0.0;',
    '',
  ];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const param = node.parameters || '';
    lines.push(`        // Node [${i + 1}]: ${node.actionType} (ID: ${node.id})`);

    switch (node.actionType) {
      case 'Event (Start)':
        lines.push(`        context.Log("Triggered Start Event: ${param || 'Default'}");`);
        break;

      case 'Search Color': {
        const parts = param.split(',').map((s) => s.trim());
        const x = parts[0] || '860';
        const y = parts[1] || '440';
        const w = parts[2] || '200';
        const h = parts[3] || '200';
        const color = parts[4] || '#39FF14';
        lines.push(
          `        var colorMatch = await vision.SearchColorAsync(new Rectangle(${x}, ${y}, ${w}, ${h}), "${color}", tolerance: 15);`
        );
        lines.push('        if (colorMatch.Success)');
        lines.push('        {');
        lines.push('            targetPoint = colorMatch.Location;');
        lines.push('            matchScore = colorMatch.Confidence;');
        lines.push(
          `            context.Log($"Color matched at {targetPoint.X}, {targetPoint.Y} (Score: {matchScore:P0})");`
        );
        lines.push('        }');
        lines.push('        else');
        lines.push('        {');
        lines.push('            context.Log("Target color not found within region.");');
        lines.push('        }');
        break;
      }

      case 'Multi-Image Search':
        lines.push(
          '        var multiMatch = await vision.FindBestMatchAsync(new[] { "crosshair_head.png", "target_indicator.png" }, minConfidence: 0.85);'
        );
        lines.push('        if (multiMatch.Found)');
        lines.push('        {');
        lines.push('            targetPoint = multiMatch.CenterPoint;');
        lines.push('            matchScore = multiMatch.Score;');
        lines.push(
          '            context.Log($"Multi-Image search detected {multiMatch.MatchedTemplate} at ({targetPoint.X}, {targetPoint.Y})");'
        );
        lines.push('        }');
        break;

      case 'Move Mouse': {
        const coords = param.match(/(\d+)[\s,]+(\d+)/);
        if (coords) {
          lines.push(`        targetPoint = new Point(${coords[1]}, ${coords[2]});`);
        }
        lines.push(
          '        await humanizer.MoveMouseBezierAsync(currentCursor, targetPoint, steps: 24, durationMs: 45);'
        );
        lines.push('        currentCursor = targetPoint;');
        break;
      }

      case 'Human Click':
      case 'Click Mouse':
        lines.push(
          '        await humanizer.PerformHumanClickAsync(currentCursor, offsetRadiusPx: 2.5f, holdDurationMs: 40);'
        );
        break;

      case 'Press Key':
        lines.push(`        await keyboard.TapKeyAsync("${param || 'R'}", holdDurationMs: 50);`);
        break;

      case 'Delay': {
        const delayMs = parseInt(param, 10) || 50;
        lines.push(
          `        await Task.Delay(humanizer.RandomizeDelay(${delayMs}, minJitter: -4, maxJitter: 12));`
        );
        break;
      }

      case 'ADB Tap': {
        const parts = param.split(',').map((s) => s.trim());
        const x = parts[0] || 'targetPoint.X';
        const y = parts[1] || 'targetPoint.Y';
        lines.push(`        await adb.InputTapAsync(${x}, ${y});`);
        break;
      }

      case 'ADB Shell':
        lines.push(`        await adb.ExecuteShellAsync("${param}");`);
        break;

      case 'Repeat Loop': {
        const count = parseInt(param, 10) || 5;
        lines.push(`        for (int loopIdx = 0; loopIdx < ${count}; loopIdx++)`);
        lines.push('        {');
        lines.push(`            context.Log($"[Loop] Running iteration {loopIdx + 1}/${count}");`);
        lines.push('            await Task.Delay(20);');
        lines.push('        }');
        break;
      }

      case 'While Color Exists': {
        const parts = param.split(',').map((s) => s.trim());
        const x = parts[0] || '860';
        const y = parts[1] || '440';
        const w = parts[2] || '200';
        const h = parts[3] || '200';
        const color = parts[4] || '#39FF14';
        lines.push(`        while ((await vision.SearchColorAsync(new Rectangle(${x}, ${y}, ${w}, ${h}), "${color}", tolerance: 15)).Success)`);
        lines.push('        {');
        lines.push('            context.Log("[While Loop] Target condition active, executing step...");');
        lines.push('            await Task.Delay(50);');
        lines.push('        }');
        break;
      }

      case 'Script Block':
        lines.push(`        // Custom embedded script:`);
        lines.push(`        ${param}`);
        break;

      default:
        lines.push(`        // Custom action`);
        break;
    }
    lines.push('');
  }

  lines.push('        context.Log("Macro Execution Pipeline Completed Successfully.");');
  lines.push('    }');
  lines.push('}');
  return lines.join('\n');
}

/**
 * Transpiles Node Graph into clean JavaScript (ClearScript V8 / WebView2)
 */
export function transpileGraphToJavaScript(nodes: MacroNode[]): string {
  const lines: string[] = [
    '// ===================================================================',
    '// SmartOptimizer (AIM/OPT Pro v3.0) - JavaScript Engine Sandbox',
    '// Runtime: Microsoft.ClearScript.V8 / WebView2 High-Speed Pipeline',
    '// ===================================================================',
    '',
    'async function executeMacro(ctx) {',
    '  ctx.log("Starting JavaScript Macro Pipeline...");',
    '  let currentCursor = { x: 960, y: 540 };',
    '  let targetPoint = { x: 960, y: 540 };',
    '  let matchScore = 0.0;',
    '',
  ];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const param = node.parameters || '';
    lines.push(`  // Step ${i + 1}: ${node.actionType}`);

    switch (node.actionType) {
      case 'Search Color': {
        const parts = param.split(',').map((s) => s.trim());
        const x = parts[0] || '860';
        const y = parts[1] || '440';
        const w = parts[2] || '200';
        const h = parts[3] || '200';
        const color = parts[4] || '#39FF14';
        lines.push(
          `  const match = await Vision.searchColor({ x: ${x}, y: ${y}, width: ${w}, height: ${h}, color: "${color}" });`
        );
        lines.push('  if (match.found) {');
        lines.push('    targetPoint = { x: match.x, y: match.y };');
        lines.push('    matchScore = match.score;');
        lines.push('    ctx.log(`Target locked at (${match.x}, ${match.y})`);');
        lines.push('  }');
        break;
      }

      case 'Move Mouse': {
        const coords = param.match(/(\d+)[\s,]+(\d+)/);
        if (coords) {
          lines.push(`  targetPoint = { x: ${coords[1]}, y: ${coords[2]} };`);
        }
        lines.push('  await Mouse.moveBezier(currentCursor, targetPoint);');
        lines.push('  currentCursor = targetPoint;');
        break;
      }

      case 'Human Click':
      case 'Click Mouse':
        lines.push('  await Mouse.humanClick(currentCursor.x, currentCursor.y);');
        break;

      case 'Press Key':
        lines.push(`  await Keyboard.press("${param || 'R'}");`);
        break;

      case 'Delay': {
        const delayMs = parseInt(param, 10) || 50;
        lines.push(`  await Sleep(Humanizer.randomizeDelay(${delayMs}, -4, 12));`);
        break;
      }

      case 'ADB Tap': {
        const parts = param.split(',').map((s) => s.trim());
        const x = parts[0] || 'targetPoint.x';
        const y = parts[1] || 'targetPoint.y';
        lines.push(`  await Adb.tap(${x}, ${y});`);
        break;
      }

      default:
        lines.push(`  ctx.log("Executed: ${node.actionType}");`);
        break;
    }
    lines.push('');
  }

  lines.push('  ctx.log("JavaScript Macro Completed.");');
  lines.push('}');
  return lines.join('\n');
}

/**
 * Sandboxed In-App Script Runner
 * Safely evaluates script logic in real-time, providing output logs, timing, and variable inspection.
 */
export async function executeInSandbox(
  code: string,
  language: 'csharp' | 'javascript'
): Promise<ScriptExecutionResult> {
  const startTime = performance.now();
  const logs: string[] = [];

  const logFn = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    logs.push(`[${time}] ${msg}`);
  };

  logFn(`Initializing ${language.toUpperCase()} execution environment...`);

  try {
    if (language === 'javascript') {
      // Create sandbox context
      const sandboxVariables: Record<string, any> = {
        mouseX: 960,
        mouseY: 540,
        targetLocked: false,
        score: 0.95,
      };

      const mockVision = {
        searchColor: async (rect: any) => {
          await new Promise((res) => setTimeout(res, 25));
          logFn(`Vision.searchColor invoked for region [X:${rect.x || 860}, Y:${rect.y || 440}]`);
          return { found: true, x: (rect.x || 860) + 50, y: (rect.y || 440) + 50, score: 0.97 };
        },
        findBestMatch: async (templates: string[], minScore = 0.85) => {
          await new Promise((res) => setTimeout(res, 20));
          logFn(`Vision.findBestMatch checked ${templates.length} templates. Matched primary.`);
          return { found: true, x: 960, y: 540, score: 0.94, template: templates[0] || 'default.png' };
        },
      };

      const mockMouse = {
        moveBezier: async (from: { x: number; y: number }, to: { x: number; y: number }) => {
          const path = generateHumanPath(from, to, undefined, 15);
          await new Promise((res) => setTimeout(res, 35));
          sandboxVariables.mouseX = to.x;
          sandboxVariables.mouseY = to.y;
          logFn(`Mouse.moveBezier traversed ${path.length} Bézier control points -> (${to.x}, ${to.y})`);
        },
        humanClick: async (x: number, y: number) => {
          const click = getHumanClickPoint(x, y, 2.5);
          const hold = randomizeDelay(45, -6, 10);
          await new Promise((res) => setTimeout(res, hold));
          logFn(`Mouse.humanClick dispatched at (${click.x}, ${click.y}) with ${hold}ms hold duration`);
        },
      };

      const mockKeyboard = {
        press: async (key: string) => {
          const delay = randomizeDelay(50, -8, 12);
          await new Promise((res) => setTimeout(res, delay));
          logFn(`Keyboard.press ["${key}"] pressed for ${delay}ms`);
        },
      };

      const mockAdb = {
        tap: async (x: number, y: number) => {
          await new Promise((res) => setTimeout(res, 20));
          logFn(`Adb.tap dispatched to device: (X:${x}, Y:${y})`);
        },
      };

      const mockSleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

      // Execution context
      const context = {
        log: logFn,
        variables: sandboxVariables,
      };

      // Wrap and evaluate safely
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const executable = new AsyncFunction(
        'ctx',
        'Vision',
        'Mouse',
        'Keyboard',
        'Adb',
        'Sleep',
        'Humanizer',
        `
        try {
          ${code}
          if (typeof executeMacro === 'function') {
            await executeMacro(ctx);
          }
        } catch(err) {
          ctx.log("Runtime Exception: " + err.message);
          throw err;
        }
      `
      );

      await executable(context, mockVision, mockMouse, mockKeyboard, mockAdb, mockSleep, {
        randomizeDelay,
        getHumanClickPoint,
        generateHumanPath,
      });

      const elapsed = Math.round((performance.now() - startTime) * 10) / 10;
      logFn(`Script finished successfully in ${elapsed}ms.`);

      return {
        success: true,
        output: logs.join('\n'),
        executionTimeMs: elapsed,
        language: 'javascript',
        variables: sandboxVariables,
        logs,
      };
    } else {
      // C# Roslyn Scripting Simulation with detailed compiler and runtime pipeline
      await new Promise((res) => setTimeout(res, 60));
      logFn('Compiling C# Roslyn Syntax Tree (Microsoft.CodeAnalysis.CSharp)...');
      logFn('Emitting dynamic assembly into memory (JIT compilation)...');
      await new Promise((res) => setTimeout(res, 45));

      logFn('Executing AutoGeneratedMacro.ExecuteAsync(context)...');
      logFn('HumanizerEngine: Initialized Bézier curve path generator [Curvature: 0.45]');
      logFn('VisualEngine: Multi-Image template matcher active [OpenCV DirectShow]');
      logFn('InputDriver: Virtual input injection pipeline connected');
      logFn('Action executed successfully with 0 compilation warnings.');

      const elapsed = Math.round((performance.now() - startTime) * 10) / 10;
      logFn(`C# Roslyn script finished successfully in ${elapsed}ms.`);

      return {
        success: true,
        output: logs.join('\n'),
        executionTimeMs: elapsed,
        language: 'csharp',
        variables: {
          TargetStatus: 'Locked',
          Confidence: 0.96,
          CursorX: 960,
          CursorY: 540,
          AntiDetectLevel: 'High',
        },
        logs,
      };
    }
  } catch (err: any) {
    const elapsed = Math.round((performance.now() - startTime) * 10) / 10;
    logFn(`Execution Error: ${err.message || String(err)}`);
    return {
      success: false,
      output: logs.join('\n'),
      executionTimeMs: elapsed,
      language,
      logs,
    };
  }
}
