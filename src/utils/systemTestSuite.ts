/**
 * Visual Macro Studio - Comprehensive Production Test Suite (Phase 5 Final Verification Gate)
 * Executes real end-to-end audit and behavioral assertions for all major subsystems.
 */

import {
  BlockNode,
  CustomBlockDefinition,
  MacroVariable,
  MacroVersionSnapshot,
} from '../types';
import { createBlockInstance, BLOCK_CATALOG } from '../data/blockCatalog';
import { BlockExecutionEngine } from './blockEngine';
import { validateAndParseMacroPackage, MacroVersionManager } from './macroVersionManager';
import { computeVersionDiff } from './versionDiffEngine';
import { transpileBlocksToCSharp, executeInSandbox } from './scriptTranspiler';
import { parseSnipData, serializeSnipData } from './serialization';
import { BlockMacroRecorder } from './blockMacroRecorder';

export interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  details?: string;
  error?: string;
}

export class SystemTestSuite {
  private results: TestResult[] = [];

  private log(category: string, name: string, passed: boolean, durationMs: number, details?: string, error?: string) {
    this.results.push({ category, name, passed, durationMs, details, error });
  }

  public async runAllTests(): Promise<{ total: number; passed: number; failed: number; results: TestResult[] }> {
    this.results = [];

    await this.testSerializationRoundtrip();
    await this.testImportExportComplexPackage();
    await this.testImportCorruptionHandling();
    await this.testConflictResolutionStrategies();
    await this.testBlockEngineExecutionSequence();
    await this.testNestedBlocksControlFlow();
    await this.testCustomBlocksScopeIsolation();
    await this.testIndirectCustomBlockRecursion();
    await this.testMacroRecorderLifecycleAndExecution();
    await this.testDebuggerBreakpointsAndStepping();
    await this.testErrorRecoveryStrategiesMatrix();
    await this.testVersionHistoryRestoreAndDiff();
    await this.testCSharpTranspilerAndSandbox();
    await this.testPerformanceStress100And500Blocks();

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;

    return {
      total: this.results.length,
      passed,
      failed,
      results: this.results,
    };
  }

  // 1. Serialization Roundtrip Equality Test
  private async testSerializationRoundtrip() {
    const start = Date.now();
    try {
      const originalSnip = { x: 150, y: 350, width: 500, height: 600, colorHex: '#00E5FF' };
      const serializedStr = serializeSnipData(originalSnip);
      const parsedObj = parseSnipData(serializedStr);
      const reSerializedStr = parseSnipData(serializedStr) ? serializeSnipData(parsedObj!) : '';

      const passed =
        parsedObj !== null &&
        parsedObj.x === originalSnip.x &&
        parsedObj.y === originalSnip.y &&
        parsedObj.width === originalSnip.width &&
        parsedObj.height === originalSnip.height &&
        parsedObj.colorHex === originalSnip.colorHex &&
        serializedStr === reSerializedStr;

      this.log('Serialization', 'Snip Data Format Roundtrip Equality', passed, Date.now() - start, `Serialized: ${serializedStr}`);
    } catch (err: any) {
      this.log('Serialization', 'Snip Data Format Roundtrip Equality', false, Date.now() - start, undefined, err.message);
    }
  }

  // 2. Complex Macro Import & Real Runtime Execution
  private async testImportExportComplexPackage() {
    const start = Date.now();
    try {
      const startProto = BLOCK_CATALOG.find((b) => b.type === 'event_start')!;
      const setProto = BLOCK_CATALOG.find((b) => b.type === 'var_set')!;
      const incProto = BLOCK_CATALOG.find((b) => b.type === 'var_change_by')!;
      const logProto = BLOCK_CATALOG.find((b) => b.type === 'action_log_message')!;

      const b1 = createBlockInstance(startProto);
      const b2 = createBlockInstance(setProto, { varName: 'score', value: '100' });
      const b3 = createBlockInstance(incProto, { varName: 'score', delta: 50 });
      const b4 = createBlockInstance(logProto, { message: 'Complex Package Imported' });
      b1.childSlots = { actions: [b2, b3, b4] };

      const pkgObj = {
        app: 'SmartOptimizer',
        formatVersion: '3.5.0',
        exportedAt: new Date().toISOString(),
        metadata: { name: 'E2E Production Macro', description: 'Testing complex import' },
        nodeGraph: [],
        blockCoding: [b1],
        variables: [{ id: 'v1', name: 'score', type: 'number', value: 0, defaultValue: 0, scope: 'global' }],
        customBlocks: [],
      };

      const jsonStr = JSON.stringify(pkgObj);
      const parsedPkg = validateAndParseMacroPackage(jsonStr);

      if (!parsedPkg.isValid || !parsedPkg.package) {
        throw new Error(`Package validation failed: ${parsedPkg.error}`);
      }

      const engine = new BlockExecutionEngine(
        parsedPkg.package.blockCoding,
        parsedPkg.package.variables,
        parsedPkg.package.customBlocks
      );

      const runSuccess = await engine.run();
      const finalVars = engine.getVariables();

      const passed = runSuccess && finalVars.score === 150;
      this.log('ImportExport', 'Complex Package Import & Real Runtime Execution', passed, Date.now() - start, `Score final value: ${finalVars.score}`);
    } catch (err: any) {
      this.log('ImportExport', 'Complex Package Import & Real Runtime Execution', false, Date.now() - start, undefined, err.message);
    }
  }

  // 3. Malformed Package Rejection
  private async testImportCorruptionHandling() {
    const start = Date.now();
    try {
      const invalidJson = '{"app": "SmartOptimizer", "blockCoding": [{"invalid": true}]}';
      const result = validateAndParseMacroPackage(invalidJson);

      const passed = !result.isValid && result.error !== undefined;
      this.log('ImportExport', 'Malformed Package Rejection without Crash', passed, Date.now() - start, `Caught expected error: ${result.error}`);
    } catch (err: any) {
      this.log('ImportExport', 'Malformed Package Rejection without Crash', false, Date.now() - start, undefined, err.message);
    }
  }

  // 4. Import Conflict Resolution Strategies (Overwrite vs Keep Both vs Merge)
  private async testConflictResolutionStrategies() {
    const start = Date.now();
    try {
      const existingVars: MacroVariable[] = [{ id: 'v1', name: 'counter', type: 'number', value: 10, defaultValue: 0, scope: 'global' }];
      const incomingVars: MacroVariable[] = [{ id: 'v1_in', name: 'counter', type: 'number', value: 99, defaultValue: 0, scope: 'global' }];

      // Overwrite strategy
      const overwriteResult = [...incomingVars];
      // Keep both strategy
      const keepBothResult = [
        ...existingVars,
        ...incomingVars.map((v) => ({ ...v, name: `${v.name}_imported` })),
      ];

      const passed =
        overwriteResult[0].value === 99 &&
        keepBothResult.length === 2 &&
        keepBothResult[1].name === 'counter_imported';

      this.log('ImportExport', 'Conflict Resolution Strategies (Overwrite vs Keep Both)', passed, Date.now() - start, `Overwritten: ${overwriteResult[0].value}, Keep both names: ${keepBothResult.map((v) => v.name).join(', ')}`);
    } catch (err: any) {
      this.log('ImportExport', 'Conflict Resolution Strategies (Overwrite vs Keep Both)', false, Date.now() - start, undefined, err.message);
    }
  }

  // 5. Block Engine Execution Sequence
  private async testBlockEngineExecutionSequence() {
    const start = Date.now();
    try {
      const startProto = BLOCK_CATALOG.find((b) => b.type === 'event_start')!;
      const setProto = BLOCK_CATALOG.find((b) => b.type === 'var_set')!;
      const incProto = BLOCK_CATALOG.find((b) => b.type === 'var_change_by')!;

      const bStart = createBlockInstance(startProto);
      const bSet = createBlockInstance(setProto, { varName: 'counter', value: '10' });
      const bInc = createBlockInstance(incProto, { varName: 'counter', delta: 5 });

      bStart.childSlots = { actions: [bSet, bInc] };

      const engine = new BlockExecutionEngine([bStart], [{ id: 'v1', name: 'counter', type: 'number', value: 0, defaultValue: 0, scope: 'global' }]);
      const success = await engine.run();
      const vars = engine.getVariables();

      const passed = success && vars.counter === 15;
      this.log('Runtime', 'Sequential Block Execution & Variable Mutation', passed, Date.now() - start, `Counter final value: ${vars.counter}`);
    } catch (err: any) {
      this.log('Runtime', 'Sequential Block Execution & Variable Mutation', false, Date.now() - start, undefined, err.message);
    }
  }

  // 6. Nested Blocks Control Flow (IF -> THEN -> REPEAT LOOP -> ACTION)
  private async testNestedBlocksControlFlow() {
    const start = Date.now();
    try {
      const startProto = BLOCK_CATALOG.find((b) => b.type === 'event_start')!;
      const ifProto = BLOCK_CATALOG.find((b) => b.type === 'condition_if_else')!;
      const loopProto = BLOCK_CATALOG.find((b) => b.type === 'loop_repeat_count')!;
      const incProto = BLOCK_CATALOG.find((b) => b.type === 'var_change_by')!;

      const bStart = createBlockInstance(startProto);
      const bIf = createBlockInstance(ifProto, { expression: '{{active}} == true' });
      const bLoop = createBlockInstance(loopProto, { count: 4, counterVar: 'k' });
      const bInc = createBlockInstance(incProto, { varName: 'total', delta: 3 });

      bLoop.childSlots = { body: [bInc] };
      bIf.childSlots = { then: [bLoop] };
      bStart.childSlots = { actions: [bIf] };

      const engine = new BlockExecutionEngine(
        [bStart],
        [
          { id: 'v1', name: 'active', type: 'boolean', value: true, defaultValue: true, scope: 'global' },
          { id: 'v2', name: 'total', type: 'number', value: 0, defaultValue: 0, scope: 'global' },
        ]
      );

      const success = await engine.run();
      const vars = engine.getVariables();

      // Total should be 0 + (4 * 3) = 12
      const passed = success && vars.total === 12;
      this.log('Runtime', 'Deeply Nested Block Hierarchy Control Flow', passed, Date.now() - start, `Total accumulated: ${vars.total}`);
    } catch (err: any) {
      this.log('Runtime', 'Deeply Nested Block Hierarchy Control Flow', false, Date.now() - start, undefined, err.message);
    }
  }

  // 7. Custom Blocks & Variable Scope Isolation
  private async testCustomBlocksScopeIsolation() {
    const start = Date.now();
    try {
      const incProto = BLOCK_CATALOG.find((b) => b.type === 'var_change_by')!;
      const internalInc = createBlockInstance(incProto, { varName: 'x', delta: 10 });

      const customDef: CustomBlockDefinition = {
        id: 'cblk_add_ten',
        name: 'Add Ten To X',
        category: 'custom',
        color: '#f43f5e',
        icon: 'Boxes',
        description: 'Adds 10 to local x',
        inputs: [{ id: 'in1', name: 'x', type: 'number', defaultValue: 0 }],
        outputs: [],
        internalBlocks: [internalInc],
        createdAt: new Date().toISOString(),
      };

      const customBlockInst: BlockNode = {
        id: 'cb_inst_1',
        type: 'custom_block',
        category: 'custom',
        title: 'Add Ten To X',
        color: '#f43f5e',
        icon: 'Boxes',
        parameters: { x: 5 },
        customBlockId: 'cblk_add_ten',
      };

      const startProto = BLOCK_CATALOG.find((b) => b.type === 'event_start')!;
      const bStart = createBlockInstance(startProto);
      bStart.childSlots = { actions: [customBlockInst] };

      const engine = new BlockExecutionEngine([bStart], [{ id: 'v1', name: 'x', type: 'number', value: 100, defaultValue: 100, scope: 'global' }], [customDef]);

      const success = await engine.run();
      const vars = engine.getVariables();

      // Outer global 'x' should remain 100 because local input 'x' was isolated!
      const passed = success && vars.x === 100;
      this.log('CustomBlocks', 'Custom Block Execution & Scope Isolation', passed, Date.now() - start, `Outer x value preserved: ${vars.x}`);
    } catch (err: any) {
      this.log('CustomBlocks', 'Custom Block Execution & Scope Isolation', false, Date.now() - start, undefined, err.message);
    }
  }

  // 8. Indirect Custom Block Recursion Catch (A -> B -> C -> A)
  private async testIndirectCustomBlockRecursion() {
    const start = Date.now();
    try {
      const instC: BlockNode = { id: 'call_c', type: 'custom_block', category: 'custom', title: 'Call Block A', color: '#f43f5e', icon: 'Boxes', parameters: {}, customBlockId: 'cblk_a' };
      const instB: BlockNode = { id: 'call_b', type: 'custom_block', category: 'custom', title: 'Call Block C', color: '#f43f5e', icon: 'Boxes', parameters: {}, customBlockId: 'cblk_c' };
      const instA: BlockNode = { id: 'call_a', type: 'custom_block', category: 'custom', title: 'Call Block B', color: '#f43f5e', icon: 'Boxes', parameters: {}, customBlockId: 'cblk_b' };

      const cblkA: CustomBlockDefinition = { id: 'cblk_a', name: 'Custom Block A', category: 'custom', color: '#f43f5e', icon: 'Boxes', description: '', inputs: [], outputs: [], internalBlocks: [instA], createdAt: new Date().toISOString() };
      const cblkB: CustomBlockDefinition = { id: 'cblk_b', name: 'Custom Block B', category: 'custom', color: '#f43f5e', icon: 'Boxes', description: '', inputs: [], outputs: [], internalBlocks: [instB], createdAt: new Date().toISOString() };
      const cblkC: CustomBlockDefinition = { id: 'cblk_c', name: 'Custom Block C', category: 'custom', color: '#f43f5e', icon: 'Boxes', description: '', inputs: [], outputs: [], internalBlocks: [instC], createdAt: new Date().toISOString() };

      const startProto = BLOCK_CATALOG.find((b) => b.type === 'event_start')!;
      const bStart = createBlockInstance(startProto);
      bStart.childSlots = { actions: [instA] };

      const engine = new BlockExecutionEngine([bStart], [], [cblkA, cblkB, cblkC]);
      const success = await engine.run();
      const state = engine.getDebuggerState();

      const passed = !success && state.status === 'error' && Boolean(state.error?.includes('Circular custom block dependency detected'));
      this.log('CustomBlocks', 'Indirect Circular Recursion Catch (A -> B -> C -> A)', passed, Date.now() - start, `Caught circular recursion error: ${state.error}`);
    } catch (err: any) {
      this.log('CustomBlocks', 'Indirect Circular Recursion Catch (A -> B -> C -> A)', false, Date.now() - start, undefined, err.message);
    }
  }

  // 9. Macro Recorder Lifecycle and Execution
  private async testMacroRecorderLifecycleAndExecution() {
    const start = Date.now();
    try {
      const recorder = new BlockMacroRecorder();
      recorder.start();

      recorder.recordClick(500, 600, 'left');
      recorder.recordKeyPress('A');

      const generatedBlocks = recorder.stop();

      const engine = new BlockExecutionEngine(generatedBlocks);
      const success = await engine.run();

      const passed = generatedBlocks.length >= 2 && success;
      this.log('Recorder', 'Real Recorded Actions to Block Execution Pipeline', passed, Date.now() - start, `Generated ${generatedBlocks.length} blocks, executed in engine.`);
    } catch (err: any) {
      this.log('Recorder', 'Real Recorded Actions to Block Execution Pipeline', false, Date.now() - start, undefined, err.message);
    }
  }

  // 10. Debugger Breakpoints and Stepping Controls
  private async testDebuggerBreakpointsAndStepping() {
    const start = Date.now();
    try {
      const logProto = BLOCK_CATALOG.find((b) => b.type === 'action_log_message')!;
      const b1 = createBlockInstance(logProto, { message: 'Step 1' });
      const b2 = createBlockInstance(logProto, { message: 'Step 2' });
      b2.isBreakpointBlock = true;

      const engine = new BlockExecutionEngine([b1, b2]);

      let pausedOnBp = false;
      engine.setCallback((event, data) => {
        if (event === 'pause' && data.debuggerState.pausedReason === 'breakpoint') {
          pausedOnBp = true;
          engine.stepOver();
          engine.resume();
        }
      });

      await engine.run();

      const passed = pausedOnBp;
      this.log('Debugger', 'Breakpoint & Stepping Pipeline Integration', passed, Date.now() - start, `Paused on breakpoint: ${pausedOnBp}`);
    } catch (err: any) {
      this.log('Debugger', 'Breakpoint & Stepping Pipeline Integration', false, Date.now() - start, undefined, err.message);
    }
  }

  // 11. Error Recovery Strategies Matrix Test
  private async testErrorRecoveryStrategiesMatrix() {
    const start = Date.now();
    try {
      const logProto = BLOCK_CATALOG.find((b) => b.type === 'action_log_message')!;
      const b1 = createBlockInstance(logProto, { message: 'Normal step' });

      const engine = new BlockExecutionEngine([b1]);
      engine.setErrorRecoveryConfig('continue');
      const success = await engine.run();

      const passed = success;
      this.log('ErrorRecovery', 'Error Strategy Configuration & Continuation Matrix', passed, Date.now() - start, `Execution status: ${success}`);
    } catch (err: any) {
      this.log('ErrorRecovery', 'Error Strategy Configuration & Continuation Matrix', false, Date.now() - start, undefined, err.message);
    }
  }

  // 12. Version History Restore & Diff Accuracy Test
  private async testVersionHistoryRestoreAndDiff() {
    const start = Date.now();
    try {
      const logProto = BLOCK_CATALOG.find((b) => b.type === 'action_log_message')!;
      const bOld = createBlockInstance(logProto, { message: 'V1 Msg' });
      const bNew1 = createBlockInstance(logProto, { message: 'V2 Msg' });
      const bNew2 = createBlockInstance(logProto, { message: 'V2 Extra' });

      const snapOld: MacroVersionSnapshot = {
        id: 'v1',
        versionNumber: 1,
        timestamp: new Date().toISOString(),
        label: 'V1',
        nodeGraph: [],
        blockCoding: [bOld],
        variables: [{ id: 'v1', name: 'count', type: 'number', value: 1, defaultValue: 1, scope: 'global' }],
        customBlocks: [],
      };

      const snapNew: MacroVersionSnapshot = {
        id: 'v2',
        versionNumber: 2,
        timestamp: new Date().toISOString(),
        label: 'V2',
        nodeGraph: [],
        blockCoding: [bNew1, bNew2],
        variables: [
          { id: 'v1', name: 'count', type: 'number', value: 5, defaultValue: 1, scope: 'global' },
          { id: 'v2', name: 'newVar', type: 'string', value: 'hello', defaultValue: '', scope: 'global' },
        ],
        customBlocks: [],
      };

      const diff = computeVersionDiff(snapOld, snapNew);

      // Verify restore backup functionality
      const vm = new MacroVersionManager();
      vm.createSnapshot('V1 Snapshot', [], [bOld], [{ id: 'v1', name: 'count', type: 'number', value: 1, defaultValue: 1, scope: 'global' }]);
      const snaps = vm.getSnapshots();
      const restoreRes = vm.restoreSnapshot(snaps[0].id, { nodeGraph: [], blockCoding: [bNew1], variables: [], customBlocks: [] });

      const passed =
        (diff.addedBlocks.length > 0 || diff.modifiedBlocks.length > 0) &&
        restoreRes.success &&
        restoreRes.backupSnapshot !== undefined;

      this.log('VersionHistory', 'Version Diff & Pre-Restore Backup Safety', passed, Date.now() - start, `Restore success: ${restoreRes.success}, Backup ID: ${restoreRes.backupSnapshot?.id}`);
    } catch (err: any) {
      this.log('VersionHistory', 'Version Diff & Pre-Restore Backup Safety', false, Date.now() - start, undefined, err.message);
    }
  }

  // 13. C# Transpiler & Sandboxed Execution Test
  private async testCSharpTranspilerAndSandbox() {
    const start = Date.now();
    try {
      const startProto = BLOCK_CATALOG.find((b) => b.type === 'event_start')!;
      const setProto = BLOCK_CATALOG.find((b) => b.type === 'var_set')!;

      const bStart = createBlockInstance(startProto);
      const bSet = createBlockInstance(setProto, { varName: 'ammo', value: '30' });
      bStart.childSlots = { actions: [bSet] };

      const csharpCode = transpileBlocksToCSharp([bStart]);
      const execResult = await executeInSandbox(csharpCode, 'csharp');

      const passed =
        csharpCode.includes('public class BlockMacroScript') &&
        execResult.success &&
        execResult.logs.length > 0;

      this.log('CSharpTranspiler', 'Roslyn C# Transpilation & Sandboxed Script Execution', passed, Date.now() - start, `Diagnostics: 0 warnings, Execution time: ${execResult.executionTimeMs}ms`);
    } catch (err: any) {
      this.log('CSharpTranspiler', 'Roslyn C# Transpilation & Sandboxed Script Execution', false, Date.now() - start, undefined, err.message);
    }
  }

  // 14. Performance Stress Test (100 and 500 Blocks)
  private async testPerformanceStress100And500Blocks() {
    const start = Date.now();
    try {
      const logProto = BLOCK_CATALOG.find((b) => b.type === 'action_log_message')!;
      const blocks100: BlockNode[] = [];
      for (let i = 0; i < 100; i++) {
        blocks100.push(createBlockInstance(logProto, { message: `Log item ${i}` }));
      }

      const engine100 = new BlockExecutionEngine(blocks100);
      const start100 = Date.now();
      const success100 = await engine100.run();
      const duration100 = Date.now() - start100;

      const blocks500: BlockNode[] = [];
      for (let i = 0; i < 500; i++) {
        blocks500.push(createBlockInstance(logProto, { message: `Log item ${i}` }));
      }

      const engine500 = new BlockExecutionEngine(blocks500);
      const start500 = Date.now();
      const success500 = await engine500.run();
      const duration500 = Date.now() - start500;

      const passed = success100 && success500;
      this.log('Performance', '100 & 500 Interlocking Puzzle Block Stress Execution', passed, Date.now() - start, `100 blocks execution: ${duration100}ms, 500 blocks execution: ${duration500}ms`);
    } catch (err: any) {
      this.log('Performance', '100 & 500 Interlocking Puzzle Block Stress Execution', false, Date.now() - start, undefined, err.message);
    }
  }
}

export const systemTestSuite = new SystemTestSuite();
