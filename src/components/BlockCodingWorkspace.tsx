import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Boxes,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Upload,
  History,
  Code,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Layers,
  Terminal,
  Grid,
  Trash2,
  Copy,
  FolderOpen,
  Save,
  Check,
  AlertCircle,
  FileCode,
  Sliders,
  Move,
  Eye,
  Bot,
  Disc,
  GitCompare,
  Command,
  Search,
} from 'lucide-react';
import {
  BlockCategory,
  BlockNode,
  CustomBlockDefinition,
  DebuggerState,
  ExecutionHistoryItem,
  MacroNode,
  MacroVariable,
  MacroVersionSnapshot,
} from '../types';
import { BLOCK_CATALOG, createBlockInstance } from '../data/blockCatalog';
import { BlockExecutionEngine } from '../utils/blockEngine';
import { autoArrangeBlockHierarchy } from '../utils/blockAutoArranger';
import { transpileBlocksToCSharp } from '../utils/scriptTranspiler';
import { MacroExportPackage, validateAndParseMacroPackage } from '../utils/macroVersionManager';
import { PuzzlePieceBlock } from './blockcoding/PuzzlePieceBlock';
import { BlockCodingPalette } from './blockcoding/BlockCodingPalette';
import { BlockDebuggerPanel } from './blockcoding/BlockDebuggerPanel';
import { CustomBlockBuilderModal } from './blockcoding/CustomBlockBuilderModal';
import { VersionHistoryModal } from './blockcoding/VersionHistoryModal';
import { BlockTemplatesModal } from './blockcoding/BlockTemplatesModal';
import { AiBlockAssistantModal } from './blockcoding/AiBlockAssistantModal';
import { MacroRecorderModal } from './blockcoding/MacroRecorderModal';
import { VersionComparisonModal } from './blockcoding/VersionComparisonModal';
import { ImportConflictModal } from './blockcoding/ImportConflictModal';
import { BlockCommandPalette } from './blockcoding/BlockCommandPalette';
import { BlockContextMenu } from './blockcoding/BlockContextMenu';
import { CreateVariableModal } from './blockcoding/CreateVariableModal';

interface BlockCodingWorkspaceProps {
  blocks: BlockNode[];
  onUpdateBlocks: (blocks: BlockNode[]) => void;
  variables: MacroVariable[];
  onUpdateVariables: (variables: MacroVariable[]) => void;
  customBlocks: CustomBlockDefinition[];
  onUpdateCustomBlocks: (customBlocks: CustomBlockDefinition[]) => void;
  snapshots: MacroVersionSnapshot[];
  onCreateSnapshot: (label: string, description?: string) => void;
  onRestoreSnapshot: (snapshotId: string) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
  onAutoSaveTrigger?: () => void;
}

export const BlockCodingWorkspace: React.FC<BlockCodingWorkspaceProps> = ({
  blocks,
  onUpdateBlocks,
  variables,
  onUpdateVariables,
  customBlocks,
  onUpdateCustomBlocks,
  snapshots,
  onCreateSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  onAutoSaveTrigger,
}) => {
  // Engine Ref
  const engineRef = useRef<BlockExecutionEngine | null>(null);

  // Canvas Viewport Transformation
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selection & Active Block Tracking
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeExecutingBlockId, setActiveExecutingBlockId] = useState<string | null>(null);

  // Breakpoints
  const [breakpoints, setBreakpoints] = useState<string[]>([]);

  // Debugger State & Runtime Variables
  const [debuggerState, setDebuggerState] = useState<DebuggerState>({
    status: 'idle',
    activeBlockId: null,
    stepCount: 0,
    executionTimeMs: 0,
  });
  const [runtimeVariables, setRuntimeVariables] = useState<Record<string, any>>({});
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistoryItem[]>([]);

  // Modals & Panels
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(true);
  const [isDebuggerOpen, setIsDebuggerOpen] = useState<boolean>(true);
  const [isCustomBlockModalOpen, setIsCustomBlockModalOpen] = useState<boolean>(false);
  const [isCreateVariableModalOpen, setIsCreateVariableModalOpen] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    targetBlock: BlockNode | null;
  } | null>(null);
  const [clipboardBlock, setClipboardBlock] = useState<BlockNode | null>(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [isCSharpDrawerOpen, setIsCSharpDrawerOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isRecorderModalOpen, setIsRecorderModalOpen] = useState<boolean>(false);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [diffBaseSnapshotId, setDiffBaseSnapshotId] = useState<string | undefined>(undefined);
  const [diffTargetSnapshotId, setDiffTargetSnapshotId] = useState<string | undefined>(undefined);

  // Import Conflict Modal
  const [conflictPackage, setConflictPackage] = useState<MacroExportPackage | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState<boolean>(false);

  const [csharpCode, setCsharpCode] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize & Sync Runtime Variables from definitions
  useEffect(() => {
    const initVars: Record<string, any> = {};
    for (const v of variables) {
      initVars[v.name] = v.value ?? v.defaultValue ?? 0;
    }
    setRuntimeVariables((prev) => ({ ...initVars, ...prev }));
  }, [variables]);

  // Initialize Engine
  useEffect(() => {
    const engine = new BlockExecutionEngine(
      blocks,
      variables,
      customBlocks,
      []
    );

    engine.setCallback((event, data) => {
      setDebuggerState(data.debuggerState);
      setActiveExecutingBlockId(data.debuggerState.currentBlockId || data.debuggerState.activeBlockId || null);
      if (data.variables) {
        setRuntimeVariables({ ...data.variables });
      }
      if (data.historyItem) {
        setExecutionHistory((prev) => [data.historyItem!, ...prev.slice(0, 49)]);
      }
    });

    engineRef.current = engine;
  }, []);

  // Sync Breakpoints to Engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setBreakpoints(breakpoints);
    }
  }, [breakpoints]);

  // Keep C# script in sync when drawer is open
  useEffect(() => {
    if (isCSharpDrawerOpen) {
      setCsharpCode(transpileBlocksToCSharp(blocks));
    }
  }, [blocks, isCSharpDrawerOpen]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      // Command Palette: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // AI Studio: Ctrl+Shift+A or Cmd+Shift+A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAiModalOpen((prev) => !prev);
        return;
      }

      // Macro Recorder: Ctrl+Shift+R or Cmd+Shift+R
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIsRecorderModalOpen((prev) => !prev);
        return;
      }

      // Quick Run: F5 or Ctrl+Enter
      if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
        e.preventDefault();
        handleRun();
        return;
      }

      // Step Over: F10
      if (e.key === 'F10') {
        e.preventDefault();
        handleStepOver();
        return;
      }

      // Step Into: F11
      if (e.key === 'F11') {
        e.preventDefault();
        handleStepInto();
        return;
      }

      // Step Out: Shift+F11
      if (e.shiftKey && e.key === 'F11') {
        e.preventDefault();
        handleStepOut();
        return;
      }

      // Space to Pause/Resume if not inside input
      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        if (debuggerState.status === 'running') {
          handlePause();
        } else if (debuggerState.status === 'paused') {
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debuggerState.status, blocks, runtimeVariables, customBlocks]);

  // --- Block Manipulation Helpers ---
  const handleAddBlock = (newBlock: BlockNode) => {
    onUpdateBlocks([...blocks, newBlock]);
    onAutoSaveTrigger?.();
  };

  const handleUpdateBlock = (updated: BlockNode) => {
    function updateRecursive(list: BlockNode[]): BlockNode[] {
      return list.map((b) => {
        if (b.id === updated.id) {
          return updated;
        }
        if (b.childSlots) {
          const newSlots: Record<string, BlockNode[]> = {};
          for (const [slot, children] of Object.entries(b.childSlots)) {
            newSlots[slot] = updateRecursive(children || []);
          }
          return { ...b, childSlots: newSlots };
        }
        return b;
      });
    }

    onUpdateBlocks(updateRecursive(blocks));
    onAutoSaveTrigger?.();
  };

  const handleDeleteBlock = (id: string) => {
    function deleteRecursive(list: BlockNode[]): BlockNode[] {
      return list
        .filter((b) => b.id !== id)
        .map((b) => {
          if (b.childSlots) {
            const newSlots: Record<string, BlockNode[]> = {};
            for (const [slot, children] of Object.entries(b.childSlots)) {
              newSlots[slot] = deleteRecursive(children || []);
            }
            return { ...b, childSlots: newSlots };
          }
          return b;
        });
    }

    onUpdateBlocks(deleteRecursive(blocks));
    onAutoSaveTrigger?.();
  };

  const handleDuplicateBlock = (block: BlockNode) => {
    const clone = JSON.parse(JSON.stringify(block)) as BlockNode;
    clone.id = `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    clone.title = `${block.title} (Copy)`;
    onUpdateBlocks([...blocks, clone]);
    onAutoSaveTrigger?.();
  };

  const handleAddChildBlock = (parentId: string, slotName: string, prototypeType: string) => {
    const proto = BLOCK_CATALOG.find((b) => b.type === prototypeType) || BLOCK_CATALOG[0];
    const newChild = createBlockInstance(proto);

    function addChildRecursive(list: BlockNode[]): BlockNode[] {
      return list.map((b) => {
        if (b.id === parentId) {
          const currentSlots = b.childSlots || {};
          const currentList = currentSlots[slotName] || [];
          return {
            ...b,
            childSlots: {
              ...currentSlots,
              [slotName]: [...currentList, newChild],
            },
          };
        }
        if (b.childSlots) {
          const newSlots: Record<string, BlockNode[]> = {};
          for (const [sName, children] of Object.entries(b.childSlots)) {
            newSlots[sName] = addChildRecursive(children || []);
          }
          return { ...b, childSlots: newSlots };
        }
        return b;
      });
    }

    onUpdateBlocks(addChildRecursive(blocks));
    onAutoSaveTrigger?.();
  };

  const handleDeleteChildBlock = (parentId: string, slotName: string, childId: string) => {
    function removeChildRecursive(list: BlockNode[]): BlockNode[] {
      return list.map((b) => {
        if (b.id === parentId && b.childSlots && b.childSlots[slotName]) {
          return {
            ...b,
            childSlots: {
              ...b.childSlots,
              [slotName]: b.childSlots[slotName].filter((c) => c.id !== childId),
            },
          };
        }
        if (b.childSlots) {
          const newSlots: Record<string, BlockNode[]> = {};
          for (const [sName, children] of Object.entries(b.childSlots)) {
            newSlots[sName] = removeChildRecursive(children || []);
          }
          return { ...b, childSlots: newSlots };
        }
        return b;
      });
    }

    onUpdateBlocks(removeChildRecursive(blocks));
    onAutoSaveTrigger?.();
  };

  const handleUpdateChildBlock = (parentId: string, slotName: string, updatedChild: BlockNode) => {
    function updateChildRecursive(list: BlockNode[]): BlockNode[] {
      return list.map((b) => {
        if (b.id === parentId && b.childSlots && b.childSlots[slotName]) {
          return {
            ...b,
            childSlots: {
              ...b.childSlots,
              [slotName]: b.childSlots[slotName].map((c) => (c.id === updatedChild.id ? updatedChild : c)),
            },
          };
        }
        if (b.childSlots) {
          const newSlots: Record<string, BlockNode[]> = {};
          for (const [sName, children] of Object.entries(b.childSlots)) {
            newSlots[sName] = updateChildRecursive(children || []);
          }
          return { ...b, childSlots: newSlots };
        }
        return b;
      });
    }

    onUpdateBlocks(updateChildRecursive(blocks));
    onAutoSaveTrigger?.();
  };

  // --- Auto-Arrange Stack ---
  const handleAutoArrange = () => {
    const result = autoArrangeBlockHierarchy(blocks, 60, 60);
    onUpdateBlocks(result.blocks);
  };

  // --- Breakpoint Toggle ---
  const handleToggleBreakpoint = (blockId: string) => {
    setBreakpoints((prev) => {
      const next = prev.includes(blockId) ? prev.filter((id) => id !== blockId) : [...prev, blockId];
      return next;
    });
  };

  // --- Execution Engine Controls ---
  const handleRun = async () => {
    if (!engineRef.current) return;
    engineRef.current.setBlocks(blocks);
    engineRef.current.setVariables(runtimeVariables);
    engineRef.current.setCustomBlocks(customBlocks);
    await engineRef.current.run();
  };

  const handlePause = () => {
    engineRef.current?.pause();
  };

  const handleResume = () => {
    engineRef.current?.resume();
  };

  const handleStepOver = () => {
    engineRef.current?.stepOver();
  };

  const handleStepInto = () => {
    engineRef.current?.stepInto();
  };

  const handleStepOut = () => {
    engineRef.current?.stepOut();
  };

  const handleStop = () => {
    engineRef.current?.stop();
    setActiveExecutingBlockId(null);
  };

  // --- Import / Export Packages ---
  const handleExportMacroPackage = () => {
    const pkg: MacroExportPackage = {
      app: 'SmartOptimizer',
      formatVersion: '3.5.0',
      exportedAt: new Date().toISOString(),
      metadata: {
        name: 'Block Macro Stack',
        description: 'Exported Visual Block Macro Workflow',
      },
      nodeGraph: [],
      blockCoding: blocks,
      variables,
      customBlocks,
      versionSnapshots: snapshots,
    };

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartOptimizer_BlockMacro_${Date.now()}.macro.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateAndParseMacroPackage(content);
      if (validation.isValid && validation.package) {
        // Check if there are collisions with existing variables/custom blocks
        const existingVarNames = new Set(variables.map((v) => v.name));
        const hasVarCollision = (validation.package.variables || []).some((v) => existingVarNames.has(v.name));

        const existingCustomBlockNames = new Set(customBlocks.map((c) => c.name));
        const hasCustomBlockCollision = (validation.package.customBlocks || []).some((c) =>
          existingCustomBlockNames.has(c.name)
        );

        if ((hasVarCollision || hasCustomBlockCollision) && blocks.length > 0) {
          setConflictPackage(validation.package);
          setIsConflictModalOpen(true);
        } else {
          applyImportedPackage(validation.package, 'replace');
        }
      } else {
        alert(validation.error || 'Failed to import macro file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const applyImportedPackage = (pkg: MacroExportPackage, strategy: 'replace' | 'merge' | 'rename') => {
    if (strategy === 'replace') {
      if (pkg.blockCoding && pkg.blockCoding.length > 0) onUpdateBlocks(pkg.blockCoding);
      if (pkg.variables && pkg.variables.length > 0) onUpdateVariables(pkg.variables);
      if (pkg.customBlocks && pkg.customBlocks.length > 0) onUpdateCustomBlocks(pkg.customBlocks);
    } else if (strategy === 'merge') {
      const mergedBlocks = [...blocks, ...(pkg.blockCoding || [])];
      const mergedVars = [...variables];
      for (const v of pkg.variables || []) {
        if (!mergedVars.some((ev) => ev.name === v.name)) mergedVars.push(v);
      }
      const mergedCustom = [...customBlocks];
      for (const c of pkg.customBlocks || []) {
        if (!mergedCustom.some((ec) => ec.name === c.name)) mergedCustom.push(c);
      }
      onUpdateBlocks(mergedBlocks);
      onUpdateVariables(mergedVars);
      onUpdateCustomBlocks(mergedCustom);
    } else if (strategy === 'rename') {
      const ts = Date.now().toString().slice(-4);
      const renamedBlocks = (pkg.blockCoding || []).map((b) => ({ ...b, id: `${b.id}_${ts}` }));
      const renamedVars = (pkg.variables || []).map((v) => ({ ...v, name: `${v.name}_${ts}` }));
      const renamedCustom = (pkg.customBlocks || []).map((c) => ({ ...c, name: `${c.name} (${ts})` }));
      onUpdateBlocks([...blocks, ...renamedBlocks]);
      onUpdateVariables([...variables, ...renamedVars]);
      onUpdateCustomBlocks([...customBlocks, ...renamedCustom]);
    }
    onCreateSnapshot(`Imported Package (${strategy})`);
    onAutoSaveTrigger?.();
  };

  // Canvas Drag & Drop and Context Menu Handlers
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;
    try {
      const droppedBlock = JSON.parse(rawData) as BlockNode;
      droppedBlock.id = `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const dropX = (e.clientX - canvasRect.left - pan.x) / zoom;
        const dropY = (e.clientY - canvasRect.top - pan.y) / zoom;
        droppedBlock.positionX = Math.max(20, Math.round(dropX));
        droppedBlock.positionY = Math.max(20, Math.round(dropY));
      }

      onUpdateBlocks([...blocks, droppedBlock]);
      onAutoSaveTrigger?.();
    } catch (err) {
      console.error('Failed to drop block:', err);
    }
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      targetBlock: null,
    });
  };

  const handleBlockContextMenu = (e: React.MouseEvent, block: BlockNode) => {
    e.preventDefault();
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      targetBlock: block,
    });
  };

  const handleCopyBlock = (block: BlockNode) => {
    setClipboardBlock(block);
  };

  const handlePasteBlock = () => {
    if (!clipboardBlock) return;
    const copy = JSON.parse(JSON.stringify(clipboardBlock)) as BlockNode;
    copy.id = `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    copy.title = `${clipboardBlock.title} (Copy)`;
    if (copy.positionX !== undefined && copy.positionY !== undefined) {
      copy.positionX += 30;
      copy.positionY += 30;
    }
    onUpdateBlocks([...blocks, copy]);
    onAutoSaveTrigger?.();
  };

  const handleDisconnectBlock = (blockId: string) => {
    // Finds block inside any parent container slot and moves it to top level canvas
    let extractedBlock: BlockNode | null = null;

    function extractRecursive(list: BlockNode[]): BlockNode[] {
      const result: BlockNode[] = [];
      for (const b of list) {
        if (b.id === blockId) {
          extractedBlock = { ...b, positionX: 100, positionY: 100 };
          continue;
        }
        if (b.childSlots) {
          const newSlots: Record<string, BlockNode[]> = {};
          for (const [slot, children] of Object.entries(b.childSlots)) {
            newSlots[slot] = extractRecursive(children || []);
          }
          result.push({ ...b, childSlots: newSlots });
        } else {
          result.push(b);
        }
      }
      return result;
    }

    const updatedTree = extractRecursive(blocks);
    if (extractedBlock) {
      onUpdateBlocks([...updatedTree, extractedBlock]);
      onAutoSaveTrigger?.();
    }
  };

  // Canvas Mouse Pan Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.altKey)) {
      e.preventDefault();
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 2.0));
    }
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-[#06080e] overflow-hidden select-none font-sans">
      {/* Top Workspace Header & Control Ribbon */}
      <div className="h-14 bg-[#0a0d16] border-b border-[#1b2338] px-4 flex items-center justify-between z-30 shadow-md flex-shrink-0">
        {/* Left Branding & Mode Indicator */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00e5ff] to-[#39ff14] flex items-center justify-center shadow-lg">
            <Boxes className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-black text-white tracking-wide">
                Block Coding Workspace
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/30">
                Puzzle Engine v3.5
              </span>
            </div>
            <p className="text-[10px] text-[#8892b0]">
              Visual interlocking puzzle blocks • AI assistant • Macro recorder • Time Machine diff
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          {/* Quick Command Palette Button (Ctrl+K) */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#0e1322] hover:bg-[#182138] border border-[#1e2942] text-xs font-bold text-[#8892b0] hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Command Palette (Ctrl+K)"
          >
            <Command className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span className="hidden md:inline">Palette</span>
            <kbd className="hidden lg:inline text-[9px] font-mono px-1 py-0.5 bg-[#06080e] border border-[#232f48] rounded text-[#8892b0]">
              ^K
            </kbd>
          </button>

          {/* AI Block Assistant Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00e5ff]/20 to-[#39ff14]/20 hover:from-[#00e5ff]/30 hover:to-[#39ff14]/30 border border-[#00e5ff]/40 text-xs font-black text-white flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            title="AI Macro Block Assistant (Gemini Studio)"
          >
            <Bot className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>AI Studio</span>
          </button>

          {/* Macro Event Recorder */}
          <button
            onClick={() => setIsRecorderModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Record User Inputs & Convert to Blocks"
          >
            <Disc className="w-3.5 h-3.5 text-rose-400" />
            <span>Record</span>
          </button>

          {/* Starter Templates */}
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Load macro templates"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          {/* Version Diff / Compare */}
          <button
            onClick={() => setIsDiffModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Compare versions & visual diffs"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Diff</span>
          </button>

          {/* Version History & Snapshots */}
          <button
            onClick={() => setIsVersionModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-bold text-purple-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Time Machine version snapshots & safe rollback"
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({snapshots.length})</span>
          </button>

          {/* Auto-Arrange Stack */}
          <button
            onClick={handleAutoArrange}
            className="px-2.5 py-1.5 rounded-xl bg-[#0e1322] hover:bg-[#182138] border border-[#1e2942] text-xs font-bold text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Auto-arrange interlocking blocks vertically"
          >
            <Grid className="w-3.5 h-3.5 text-[#39ff14]" />
            <span className="hidden sm:inline">Arrange</span>
          </button>

          {/* Transpile C# Preview */}
          <button
            onClick={() => setIsCSharpDrawerOpen((prev) => !prev)}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold text-cyan-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="View generated C# Roslyn code"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">C#</span>
          </button>

          {/* Zoom In/Out */}
          <div className="hidden lg:flex items-center bg-[#0e1322] rounded-xl border border-[#1e2942] p-1 space-x-1">
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
              className="p-1 rounded-lg text-[#8892b0] hover:text-white hover:bg-[#19233a] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-[#00e5ff] px-1 font-bold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.15, 2.0))}
              className="p-1 rounded-lg text-[#8892b0] hover:text-white hover:bg-[#19233a] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 40, y: 40 });
              }}
              className="p-1 rounded-lg text-[#8892b0] hover:text-white hover:bg-[#19233a] transition-colors"
              title="Reset Viewport"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export / Import Package */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleExportMacroPackage}
              className="p-1.5 rounded-xl bg-[#0e1322] hover:bg-[#182138] border border-[#1e2942] text-[#8892b0] hover:text-white transition-colors cursor-pointer"
              title="Export .macro.json file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-xl bg-[#0e1322] hover:bg-[#182138] border border-[#1e2942] text-[#8892b0] hover:text-white transition-colors cursor-pointer"
              title="Import .macro.json file"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.macro.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </div>
      </div>

      {/* Main Workspace Workspace Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side Palette Drawer */}
        <div className="flex-shrink-0 transition-all duration-300 p-2 z-20 h-full">
          <BlockCodingPalette
            onAddBlock={handleAddBlock}
            variables={variables}
            onOpenCreateVariable={() => setIsCreateVariableModalOpen(true)}
            customBlocks={customBlocks}
            onOpenCustomBlockBuilder={() => setIsCustomBlockModalOpen(true)}
            isCollapsed={!isPaletteOpen}
            onToggleCollapse={() => setIsPaletteOpen((prev) => !prev)}
          />
        </div>

        {/* Central Pan & Zoom Block Canvas */}
        <div
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          onContextMenu={handleCanvasContextMenu}
          className="flex-1 relative overflow-hidden bg-[#070911] cursor-grab active:cursor-grabbing"
          style={{
            backgroundImage: `radial-gradient(#172138 1px, transparent 1px)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        >
          {/* Pan & Zoom Target Stage */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
            className="absolute top-0 left-0 transition-transform duration-75"
          >
            {/* Render Puzzle Block Stack */}
            <div className="w-[460px] space-y-3.5 pb-32">
              {blocks.map((block) => (
                <PuzzlePieceBlock
                  key={block.id}
                  block={block}
                  isExecuting={activeExecutingBlockId === block.id}
                  onUpdateBlock={handleUpdateBlock}
                  onDeleteBlock={handleDeleteBlock}
                  onDuplicateBlock={handleDuplicateBlock}
                  onToggleBreakpoint={handleToggleBreakpoint}
                  hasBreakpoint={breakpoints.includes(block.id)}
                  onAddChildBlock={handleAddChildBlock}
                  onDeleteChildBlock={handleDeleteChildBlock}
                  onUpdateChildBlock={handleUpdateChildBlock}
                  onSelectBlock={(b) => setSelectedBlockId(b.id)}
                  onContextMenuBlock={handleBlockContextMenu}
                  isSelected={selectedBlockId === block.id}
                />
              ))}

              {blocks.length === 0 && (
                <div className="p-12 text-center rounded-3xl border-2 border-dashed border-[#1b2538] bg-[#0c101c]/60 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] flex items-center justify-center mx-auto">
                    <Boxes className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Stack is Empty</h3>
                    <p className="text-xs text-[#8892b0] max-w-xs mx-auto mt-1">
                      Drag blocks from the palette on the left, load a template, or generate a macro sequence using the AI Studio.
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <button
                      onClick={() => setIsTemplatesModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#39ff14] text-black font-black text-xs shadow-lg cursor-pointer"
                    >
                      Browse Templates
                    </button>
                    <button
                      onClick={() => setIsAiModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-[#141d33] hover:bg-[#1e2a4a] text-[#00e5ff] border border-[#00e5ff]/40 font-bold text-xs cursor-pointer"
                    >
                      Generate with AI
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Minimap */}
          <div className="absolute right-4 bottom-4 w-44 h-32 rounded-2xl bg-[#0b0e18]/90 border border-[#1b2538] shadow-2xl p-2 z-10 backdrop-blur-md hidden sm:block">
            <div className="text-[9px] font-black text-[#8892b0] uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Stack Minimap</span>
              <span className="text-[#00e5ff]">{blocks.length} blocks</span>
            </div>
            <div className="w-full h-20 bg-[#06080d] rounded-lg border border-[#182136] relative overflow-hidden flex flex-col items-center py-1 space-y-0.5">
              {blocks.slice(0, 10).map((b, i) => (
                <div
                  key={b.id}
                  className="w-16 h-1 rounded-sm"
                  style={{
                    backgroundColor:
                      activeExecutingBlockId === b.id ? '#39ff14' : b.color || '#2979ff',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side Debugger Drawer */}
        <div className="flex-shrink-0 transition-all duration-300 p-2 z-20 h-full">
          <BlockDebuggerPanel
            debuggerState={debuggerState}
            variables={runtimeVariables}
            onUpdateVariable={(name, val) => {
              setRuntimeVariables((prev) => ({ ...prev, [name]: val }));
              engineRef.current?.setVariable(name, val);
            }}
            onAddVariable={(newVar) => {
              onUpdateVariables([...variables, newVar]);
              setRuntimeVariables((prev) => ({ ...prev, [newVar.name]: newVar.value }));
            }}
            history={executionHistory}
            onClearHistory={() => setExecutionHistory([])}
            breakpoints={breakpoints}
            onToggleBreakpoint={handleToggleBreakpoint}
            onClearAllBreakpoints={() => setBreakpoints([])}
            onRun={handleRun}
            onPause={handlePause}
            onResume={handleResume}
            onStepOver={handleStepOver}
            onStepInto={handleStepInto}
            onStepOut={handleStepOut}
            onStop={handleStop}
            isCollapsed={!isDebuggerOpen}
            onToggleCollapse={() => setIsDebuggerOpen((prev) => !prev)}
          />
        </div>
      </div>

      {/* C# Transpiled Code Drawer Modal */}
      {isCSharpDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0b0e17] rounded-3xl border-2 border-cyan-500/50 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1b2538] flex items-center justify-between bg-[#0e121e]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <span>Generated C# Roslyn Script</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      .NET 8.0 WPF
                    </span>
                  </h2>
                  <p className="text-xs text-[#8892b0]">
                    Direct Roslyn-compilable C# code generated from visual block coding puzzle blocks.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(csharpCode);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#141b2c] hover:bg-[#1f2b45] text-xs font-bold text-[#00e5ff] border border-[#00e5ff]/30 flex items-center space-x-1.5 cursor-pointer"
                >
                  {copySuccess ? <Check className="w-3.5 h-3.5 text-[#39ff14]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copySuccess ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={() => setIsCSharpDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-[#8892b0] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#070910]">
              <pre className="text-xs font-mono text-cyan-200 bg-[#04060a] p-4 rounded-2xl border border-[#1b2538] leading-relaxed overflow-x-auto">
                <code>{csharpCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* AI Block Assistant Modal */}
      <AiBlockAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentBlocks={blocks}
        currentVariables={variables}
        onInsertGeneratedBlocks={(genBlocks, genVars) => {
          onUpdateBlocks([...blocks, ...genBlocks]);
          if (genVars && genVars.length > 0) {
            const mergedVars = [...variables];
            for (const gv of genVars) {
              if (!mergedVars.some((v) => v.name === gv.name)) {
                mergedVars.push(gv);
              }
            }
            onUpdateVariables(mergedVars);
          }
          onCreateSnapshot('AI Generated Macro Blocks');
          onAutoSaveTrigger?.();
        }}
      />

      {/* Macro Input Event Live Recorder Modal */}
      <MacroRecorderModal
        isOpen={isRecorderModalOpen}
        onClose={() => setIsRecorderModalOpen(false)}
        onInsertRecordedBlocks={(recBlocks) => {
          onUpdateBlocks([...blocks, ...recBlocks]);
          onCreateSnapshot(`Recorded ${recBlocks.length} Input Actions`);
          onAutoSaveTrigger?.();
        }}
      />

      {/* Version Diff & Comparison Modal */}
      <VersionComparisonModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        snapshots={snapshots}
        onRestoreSnapshot={(snapId) => {
          onRestoreSnapshot(snapId);
          setIsDiffModalOpen(false);
        }}
      />

      {/* Command Palette (Ctrl+K) */}
      <BlockCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onAddBlock={handleAddBlock}
        customBlocks={customBlocks}
        onTriggerRun={handleRun}
        onTriggerPause={handlePause}
        onTriggerAutoArrange={handleAutoArrange}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onOpenRecorder={() => setIsRecorderModalOpen(true)}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onOpenVersionHistory={() => setIsVersionModalOpen(true)}
      />

      {/* Import Conflict Modal */}
      {isConflictModalOpen && conflictPackage && (
        <ImportConflictModal
          isOpen={isConflictModalOpen}
          onClose={() => setIsConflictModalOpen(false)}
          conflictDetails={{
            conflictingCustomBlocks: (conflictPackage.customBlocks || [])
              .filter((c) => customBlocks.some((ec) => ec.name === c.name))
              .map((c) => c.name),
            conflictingVariables: (conflictPackage.variables || [])
              .filter((v) => variables.some((ev) => ev.name === v.name))
              .map((v) => v.name),
          }}
          onResolve={(strategy) => {
            const mappedStrategy =
              strategy === 'keep_both' ? 'merge' : strategy === 'rename_imported' ? 'rename' : 'replace';
            applyImportedPackage(conflictPackage, mappedStrategy);
            setIsConflictModalOpen(false);
          }}
        />
      )}

      {/* Custom Block Builder Modal */}
      <CustomBlockBuilderModal
        isOpen={isCustomBlockModalOpen}
        onClose={() => setIsCustomBlockModalOpen(false)}
        onSaveCustomBlock={(cBlock) => {
          onUpdateCustomBlocks([...customBlocks, cBlock]);
          
          // Spawn DEFINE script block on canvas
          const defineBlock: BlockNode = {
            id: `blk_def_${cBlock.id}`,
            type: 'custom_block_definition',
            category: 'custom',
            title: `DEFINE ${cBlock.name}`,
            color: cBlock.color || '#00B5AD',
            icon: 'Boxes',
            description: cBlock.description,
            parameters: {},
            hasContainerSlot: true,
            statementSlots: ['body'],
            childSlots: { body: [] },
          };
          
          onUpdateBlocks([...blocks, defineBlock]);
          onAutoSaveTrigger?.();
        }}
      />

      {/* Create Variable Modal */}
      <CreateVariableModal
        isOpen={isCreateVariableModalOpen}
        onClose={() => setIsCreateVariableModalOpen(false)}
        onCreateVariable={(newVar) => {
          onUpdateVariables([...variables, newVar]);
          onAutoSaveTrigger?.();
        }}
      />

      {/* Right Click Context Menu */}
      {contextMenu && (
        <BlockContextMenu
          position={contextMenu.position}
          targetBlock={contextMenu.targetBlock}
          onClose={() => setContextMenu(null)}
          onDuplicate={handleDuplicateBlock}
          onCopy={handleCopyBlock}
          onPaste={handlePasteBlock}
          onDelete={handleDeleteBlock}
          onDisconnect={handleDisconnectBlock}
          onToggleDisabled={handleUpdateBlock}
          onToggleBreakpoint={handleToggleBreakpoint}
          onAddComment={(blk) => handleUpdateBlock({ ...blk, comment: blk.comment || 'Block note' })}
          canPaste={Boolean(clipboardBlock)}
        />
      )}

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        snapshots={snapshots}
        onCreateSnapshot={(label, desc) => onCreateSnapshot(label, desc)}
        onRestoreSnapshot={(id) => onRestoreSnapshot(id)}
        onDeleteSnapshot={(id) => onDeleteSnapshot(id)}
        onCompareSnapshots={(baseId, targetId) => {
          setDiffBaseSnapshotId(baseId);
          setDiffTargetSnapshotId(targetId);
          setIsVersionModalOpen(false);
          setIsDiffModalOpen(true);
        }}
      />

      {/* Starter Templates Modal */}
      <BlockTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={(templateBlocks, name) => {
          onUpdateBlocks(templateBlocks);
          onCreateSnapshot(`Loaded Template: ${name}`);
          onAutoSaveTrigger?.();
        }}
      />
    </div>
  );
};

