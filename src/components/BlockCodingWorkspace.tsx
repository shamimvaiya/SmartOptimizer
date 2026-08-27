import React, { useState, useRef, useEffect } from 'react';
import {
  Boxes,
  Play,
  Square,
  Sparkles,
  Download,
  Upload,
  History,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Grid,
  Command,
} from 'lucide-react';
import {
  BlockNode,
  CustomBlockDefinition,
  DebuggerState,
  MacroVariable,
  MacroVersionSnapshot,
} from '../types';
import { BlockExecutionEngine } from '../utils/blockEngine';
import { autoArrangeBlockHierarchy } from '../utils/blockAutoArranger';
import { MacroExportPackage, validateAndParseMacroPackage } from '../utils/macroVersionManager';
import { ScratchPaletteSidebar } from './blockcoding/ScratchPaletteSidebar';
import { SleekPuzzleBlock } from './blockcoding/SleekPuzzleBlock';
import { CustomBlockBuilderModal } from './blockcoding/CustomBlockBuilderModal';
import { CreateVariableModal } from './blockcoding/CreateVariableModal';
import { VersionHistoryModal } from './blockcoding/VersionHistoryModal';
import { BlockTemplatesModal } from './blockcoding/BlockTemplatesModal';
import { BlockContextMenu } from './blockcoding/BlockContextMenu';
import { BlockCommandPalette } from './blockcoding/BlockCommandPalette';
import { TestSimulationConsole } from './TestSimulationConsole';
import { BLOCK_CATALOG, createBlockInstance } from '../data/blockCatalog';

interface BlockCodingWorkspaceProps {
  isBn?: boolean;
  blocks?: BlockNode[];
  onUpdateBlocks?: (blocks: BlockNode[]) => void;
  variables?: MacroVariable[];
  onUpdateVariables?: (variables: MacroVariable[]) => void;
  customBlocks?: CustomBlockDefinition[];
  onUpdateCustomBlocks?: (customBlocks: CustomBlockDefinition[]) => void;
  snapshots?: MacroVersionSnapshot[];
  onCreateSnapshot?: (label: string, description?: string) => void;
  onRestoreSnapshot?: (snapshotId: string) => void;
  onDeleteSnapshot?: (snapshotId: string) => void;
  onAutoSaveTrigger?: () => void;
  onExportToLibrary?: (name: string, content: string) => void;
}

export const BlockCodingWorkspace: React.FC<BlockCodingWorkspaceProps> = ({
  isBn = true,
  blocks: externalBlocks,
  onUpdateBlocks = () => {},
  variables: externalVariables,
  onUpdateVariables = () => {},
  customBlocks: externalCustomBlocks,
  onUpdateCustomBlocks = () => {},
  snapshots = [],
  onCreateSnapshot = () => {},
  onRestoreSnapshot = () => {},
  onDeleteSnapshot = () => {},
  onAutoSaveTrigger = () => {},
  onExportToLibrary,
}) => {
  // Local fallback state when used standalone
  const [internalBlocks, setInternalBlocks] = useState<BlockNode[]>(() => {
    return [
      createBlockInstance('event_on_hotkey', { position: { x: 80, y: 80 }, HOTKEY: 'F8' }),
      createBlockInstance('mouse_bezier_aim', { position: { x: 80, y: 190 }, DELTA_X: 0, DELTA_Y: 8 }),
    ];
  });
  const [internalVars, setInternalVars] = useState<MacroVariable[]>([]);
  const [internalCustomBlocks, setInternalCustomBlocks] = useState<CustomBlockDefinition[]>([]);

  const blocks = externalBlocks || internalBlocks;
  const variables = externalVariables || internalVars;
  const customBlocks = externalCustomBlocks || internalCustomBlocks;

  const handleSetBlocks = (newBlocks: BlockNode[]) => {
    setInternalBlocks(newBlocks);
    if (onUpdateBlocks) onUpdateBlocks(newBlocks);
  };

  // EXPORT TO MACRO LIBRARY
  const handleExportToLibrary = () => {
    if (!onExportToLibrary) return;
    const blockData = JSON.stringify({
      macroType: 'block_coding',
      version: '1.0.0',
      blocks: blocks,
      variables: variables,
      customBlocks: customBlocks
    }, null, 2);
    onExportToLibrary('Block Coding Macro', blockData);
  };

  // Engine Ref
  const engineRef = useRef<BlockExecutionEngine | null>(null);

  // Canvas Viewport Pan / Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 60, y: 60 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging / Moving Block State
  const [movingBlockId, setMovingBlockId] = useState<string | null>(null);
  const [movingBlockOffset, setMovingBlockOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeExecutingBlockId, setActiveExecutingBlockId] = useState<string | null>(null);
  const [breakpoints, setBreakpoints] = useState<string[]>([]);

  // Runtime State
  const [debuggerState, setDebuggerState] = useState<DebuggerState>({
    status: 'idle',
    activeBlockId: null,
    stepCount: 0,
    executionTimeMs: 0,
  });
  const [runtimeVariables, setRuntimeVariables] = useState<Record<string, any>>({});
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    '[INIT] Block Coding Simulation Engine ready.',
  ]);

  // Modals & Popups
  const [isCustomBlockModalOpen, setIsCustomBlockModalOpen] = useState<boolean>(false);
  const [isCreateVariableModalOpen, setIsCreateVariableModalOpen] = useState<boolean>(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    targetBlock: BlockNode | null;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize & Sync Runtime Variables
  useEffect(() => {
    const initVars: Record<string, any> = {};
    for (const v of variables) {
      initVars[v.name] = v.value ?? v.defaultValue ?? 0;
    }
    setRuntimeVariables((prev) => ({ ...initVars, ...prev }));
  }, [variables]);

  // Initialize Engine
  useEffect(() => {
    const engine = new BlockExecutionEngine(blocks, variables, customBlocks, []);
    engine.setCallback((event, data) => {
      setDebuggerState(data.debuggerState);
      setActiveExecutingBlockId(data.debuggerState.currentBlockId || data.debuggerState.activeBlockId || null);
      if (data.variables) {
        setRuntimeVariables({ ...data.variables });
      }
    });
    engineRef.current = engine;
  }, []);

  // Sync Breakpoints
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setBreakpoints(breakpoints);
    }
  }, [breakpoints]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
        e.preventDefault();
        handleRun();
        return;
      }

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

  // --- Block CRUD Operations ---
  const handleAddBlock = (newBlock: BlockNode, posX?: number, posY?: number) => {
    const targetBlock: BlockNode = {
      ...newBlock,
      positionX: posX ?? Math.round((Math.random() * 150 + 60)),
      positionY: posY ?? Math.round((blocks.length * 36 + 40)),
    };
    onUpdateBlocks([...blocks, targetBlock]);
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
    if (clone.positionX !== undefined && clone.positionY !== undefined) {
      clone.positionX += 20;
      clone.positionY += 20;
    }
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

  const handleDetachBlock = (blockId: string) => {
    let detached: BlockNode | null = null;

    function extract(list: BlockNode[]): BlockNode[] {
      const res: BlockNode[] = [];
      for (const b of list) {
        if (b.id === blockId) {
          detached = { ...b, positionX: Math.round(pan.x + 80), positionY: Math.round(pan.y + 80) };
          continue;
        }
        if (b.childSlots) {
          const newSlots: Record<string, BlockNode[]> = {};
          for (const [slot, children] of Object.entries(b.childSlots)) {
            newSlots[slot] = extract(children || []);
          }
          res.push({ ...b, childSlots: newSlots });
        } else {
          res.push(b);
        }
      }
      return res;
    }

    const updated = extract(blocks);
    if (detached) {
      onUpdateBlocks([...updated, detached]);
      onAutoSaveTrigger?.();
    }
  };

  // --- Direct Block Mouse Movement on Canvas ---
  const handleBlockMouseDown = (e: React.MouseEvent, block: BlockNode) => {
    if (e.button !== 0) return; // Only Left Click
    e.stopPropagation();

    setSelectedBlockId(block.id);
    setMovingBlockId(block.id);

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const mouseX = (e.clientX - canvasRect.left - pan.x) / zoom;
      const mouseY = (e.clientY - canvasRect.top - pan.y) / zoom;
      setMovingBlockOffset({
        x: mouseX - (block.positionX || 0),
        y: mouseY - (block.positionY || 0),
      });
    }
  };

  // --- Auto-Arrange Stack ---
  const handleAutoArrange = () => {
    const result = autoArrangeBlockHierarchy(blocks, 60, 60);
    onUpdateBlocks(result.blocks);
  };

  // --- Execution Controls ---
  const handleRun = async () => {
    if (!engineRef.current) return;
    engineRef.current.setBlocks(blocks);
    engineRef.current.setVariables(runtimeVariables);
    engineRef.current.setCustomBlocks(customBlocks);
    await engineRef.current.run();
  };

  const handlePause = () => engineRef.current?.pause();
  const handleResume = () => engineRef.current?.resume();
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
        description: 'Exported Visual Scratch Block Macro Workflow',
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
        const pkg = validation.package;
        if (pkg.blockCoding && pkg.blockCoding.length > 0) onUpdateBlocks(pkg.blockCoding);
        if (pkg.variables && pkg.variables.length > 0) onUpdateVariables(pkg.variables);
        if (pkg.customBlocks && pkg.customBlocks.length > 0) onUpdateCustomBlocks(pkg.customBlocks);
        onCreateSnapshot('Imported Package');
        onAutoSaveTrigger?.();
      } else {
        alert(validation.error || 'Failed to import macro file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Canvas Drag & Drop
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;
    try {
      const parsed = JSON.parse(rawData);
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const dropX = (e.clientX - canvasRect.left - pan.x) / zoom;
      const dropY = (e.clientY - canvasRect.top - pan.y) / zoom;

      if (parsed.type === 'new_block') {
        const droppedBlock = parsed.block as BlockNode;
        droppedBlock.id = `blk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        droppedBlock.positionX = Math.max(20, Math.round(dropX));
        droppedBlock.positionY = Math.max(20, Math.round(dropY));
        onUpdateBlocks([...blocks, droppedBlock]);
        onAutoSaveTrigger?.();
      } else if (parsed.type === 'existing_block') {
        const blk = parsed.block as BlockNode;
        const targetBlock = blocks.find((b) => b.id === blk.id);
        if (targetBlock) {
          handleUpdateBlock({
            ...targetBlock,
            positionX: Math.max(20, Math.round(dropX)),
            positionY: Math.max(20, Math.round(dropY)),
          });
        }
      }
    } catch (err) {
      console.error('Failed to drop block:', err);
    }
  };

  // Canvas Left-Click Panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1 || e.button === 2) {
      // Left or Middle or Right click on canvas background starts panning
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    } else if (movingBlockId) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const mouseX = (e.clientX - canvasRect.left - pan.x) / zoom;
        const mouseY = (e.clientY - canvasRect.top - pan.y) / zoom;
        const newX = Math.max(10, Math.round(mouseX - movingBlockOffset.x));
        const newY = Math.max(10, Math.round(mouseY - movingBlockOffset.y));

        onUpdateBlocks(
          blocks.map((b) => (b.id === movingBlockId ? { ...b, positionX: newX, positionY: newY } : b))
        );
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    if (movingBlockId) {
      setMovingBlockId(null);
      onAutoSaveTrigger?.();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((z) => Math.min(Math.max(z * factor, 0.4), 2.0));
    }
  };

  const isRunning = debuggerState.status === 'running';

  return (
    <div className="relative flex flex-col h-full w-full bg-[#06080e] overflow-hidden select-none font-sans">
      {/* Top Workspace Header & Control Ribbon */}
      <div className="h-11 bg-[#0a0d16] border-b border-[#1b2338] px-3 flex items-center justify-between z-30 shadow-md flex-shrink-0">
        {/* Left Branding */}
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FFBF00] via-[#4C97FF] to-[#39FF14] flex items-center justify-center shadow">
            <Boxes className="w-3.5 h-3.5 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xs font-black text-white tracking-wide">
                Scratch Block Studio
              </h1>
              <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/30">
                v3.5
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center space-x-1.5">
          {/* Quick Command Palette */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="px-2 py-1 rounded-lg bg-[#0e1322] hover:bg-[#182138] border border-[#1e2942] text-[11px] font-bold text-[#8892b0] hover:text-white flex items-center space-x-1 transition-colors cursor-pointer"
            title="Quick Command Palette (Ctrl+K)"
          >
            <Command className="w-3 h-3 text-[#00e5ff]" />
            <span className="hidden md:inline">Palette</span>
          </button>

          {/* Templates */}
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-300 flex items-center space-x-1 transition-colors cursor-pointer"
            title="Pre-built Macro Templates"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Templates</span>
          </button>

          {/* History */}
          <button
            onClick={() => setIsVersionModalOpen(true)}
            className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-[11px] font-bold text-purple-300 flex items-center space-x-1 transition-colors cursor-pointer"
            title="Version History Snapshots"
          >
            <History className="w-3 h-3" />
            <span>History ({snapshots.length})</span>
          </button>

          {/* Auto-Arrange */}
          <button
            onClick={handleAutoArrange}
            className="px-2 py-1 rounded-lg bg-[#0e1322] hover:bg-[#182138] border border-[#1e2942] text-[11px] font-bold text-white flex items-center space-x-1 transition-colors cursor-pointer"
            title="Auto-align puzzle stacks"
          >
            <Grid className="w-3 h-3 text-[#39ff14]" />
            <span className="hidden sm:inline">Arrange</span>
          </button>

          {/* Export / Import Package */}
          <div className="flex items-center space-x-1 border-l border-[#1f283d] pl-1.5 ml-0.5">
            <button
              onClick={handleExportMacroPackage}
              className="p-1 rounded-lg bg-[#0e1322] hover:bg-[#182138] border border-[#1e2942] text-[#8892b0] hover:text-white transition-colors cursor-pointer"
              title="Export Macro JSON"
            >
              <Download className="w-3 h-3" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 rounded-lg bg-[#0e1322] hover:bg-[#182138] border border-[#1e2942] text-[#8892b0] hover:text-white transition-colors cursor-pointer"
              title="Import Macro JSON"
            >
              <Upload className="w-3 h-3" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.macro.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>

          {/* Primary Run / Stop Macro Button */}
          {isRunning ? (
            <button
              onClick={handleStop}
              className="h-7 px-3 rounded-lg bg-[#ff0055] hover:bg-[#d60047] text-white font-black text-xs flex items-center space-x-1 cursor-pointer shadow-[0_0_12px_rgba(255,0,85,0.4)] transition-all ml-1.5"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={handleRun}
              className="h-7 px-3 rounded-lg bg-[#39ff14] hover:bg-[#32e012] text-black font-black text-xs flex items-center space-x-1 cursor-pointer shadow-[0_0_12px_rgba(57,255,20,0.4)] transition-all ml-1.5 hover:scale-105"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Area (Scratch Style: Left Palette + Free Drag Canvas) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Fixed Scratch Palette Sidebar with Drag-To-Delete Trash Target */}
        <ScratchPaletteSidebar
          onAddBlock={handleAddBlock}
          variables={variables}
          onOpenCreateVariable={() => setIsCreateVariableModalOpen(true)}
          customBlocks={customBlocks}
          onOpenCustomBlockBuilder={() => setIsCustomBlockModalOpen(true)}
          onDeleteDraggedBlock={handleDeleteBlock}
        />

        {/* Central Free-Form Draggable Canvas */}
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onWheel={handleWheel}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          className="flex-1 relative overflow-hidden bg-[#070911] cursor-grab active:cursor-grabbing select-none"
          style={{
            backgroundImage: `radial-gradient(#172138 1px, transparent 1px)`,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
          }}
        >
          {/* Zoom & Pan Stage */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
            className="absolute top-0 left-0 transition-transform duration-75 min-w-[3500px] min-h-[3500px]"
          >
            {/* Render Puzzle Blocks */}
            <div className="space-y-1.5 pb-64">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  onMouseDown={(e) => handleBlockMouseDown(e, block)}
                  style={{
                    position: block.positionX !== undefined && block.positionY !== undefined ? 'absolute' : 'relative',
                    left: block.positionX !== undefined ? `${block.positionX}px` : undefined,
                    top: block.positionY !== undefined ? `${block.positionY}px` : undefined,
                  }}
                  className="cursor-move"
                >
                  <SleekPuzzleBlock
                    block={block}
                    isExecuting={activeExecutingBlockId === block.id}
                    onUpdateBlock={handleUpdateBlock}
                    onDeleteBlock={handleDeleteBlock}
                    onDuplicateBlock={handleDuplicateBlock}
                    onToggleBreakpoint={(id) => {
                      setBreakpoints((prev) =>
                        prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
                      );
                    }}
                    hasBreakpoint={breakpoints.includes(block.id)}
                    onAddChildBlock={handleAddChildBlock}
                    onDeleteChildBlock={handleDeleteChildBlock}
                    onUpdateChildBlock={handleUpdateChildBlock}
                    onSelectBlock={(b) => setSelectedBlockId(b.id)}
                    onContextMenuBlock={(e, b) => {
                      setContextMenu({
                        position: { x: e.clientX, y: e.clientY },
                        targetBlock: b,
                      });
                    }}
                    isSelected={selectedBlockId === block.id}
                    onDetachBlock={handleDetachBlock}
                  />
                </div>
              ))}

              {blocks.length === 0 && (
                <div className="absolute left-16 top-16 p-6 text-center rounded-2xl border border-dashed border-[#1b2538] bg-[#0c101c]/80 space-y-2 max-w-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] flex items-center justify-center mx-auto">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Canvas Ready</h3>
                    <p className="text-[10px] text-[#8892b0] mt-0.5">
                      Drag puzzle blocks from the palette to start building.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Floating Bottom Viewport Controls */}
          <div className="absolute left-4 bottom-3 flex items-center space-x-1.5 z-20 bg-[#0c101c]/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-[#1b2538] shadow-2xl">
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
              className="p-1 rounded text-[#8892b0] hover:text-white hover:bg-[#182138] transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono font-bold text-[#00e5ff] min-w-[36px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.15, 2.0))}
              className="p-1 rounded text-[#8892b0] hover:text-white hover:bg-[#182138] transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 60, y: 60 });
              }}
              className="p-1 rounded text-[#8892b0] hover:text-white hover:bg-[#182138] transition-colors cursor-pointer"
              title="Reset View"
            >
              <Maximize2 className="w-3 h-3" />
            </button>

            <div className="w-px h-3.5 bg-[#1f283d] mx-0.5" />

            <button
              onClick={() => onUpdateBlocks([])}
              className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Clear All Blocks"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* INTEGRATED TEST SIMULATION CONSOLE */}
      <TestSimulationConsole
        logs={executionLogs}
        isSimulating={debuggerState.status === 'running'}
        onStartSimulation={() => {
          handleRun();
          setExecutionLogs((prev) => [
            ...prev,
            `[START] Block script simulation started at ${new Date().toLocaleTimeString()}`,
          ]);
        }}
        onStopSimulation={() => {
          handlePause();
          setExecutionLogs((prev) => [
            ...prev,
            `[STOP] Block script simulation stopped at ${new Date().toLocaleTimeString()}`,
          ]);
        }}
        onClearLogs={() => setExecutionLogs([])}
        lang={isBn ? 'bn' : 'en'}
      />

      {/* ADD TO MACRO LIBRARY BUTTON */}
      {onExportToLibrary && (
        <div className="mt-3">
          <button
            id="btn-block-add-to-library"
            onClick={handleExportToLibrary}
            className="w-full h-12 rounded-xl bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border-2 border-[#39ff14] font-black text-xs flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(57,255,20,0.3)] cursor-pointer transition-all hover:scale-[1.01]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{isBn ? '➕ ম্যাক্রো লাইব্রেরিতে যুক্ত করুন' : '➕ Add to Macro Library'}</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <CustomBlockBuilderModal
        isOpen={isCustomBlockModalOpen}
        onClose={() => setIsCustomBlockModalOpen(false)}
        onSaveCustomBlock={(newCustomBlock: CustomBlockDefinition) => {
          onUpdateCustomBlocks([...customBlocks, newCustomBlock]);
          onCreateSnapshot(`Created custom block: ${newCustomBlock.name}`);
        }}
      />

      <CreateVariableModal
        isOpen={isCreateVariableModalOpen}
        onClose={() => setIsCreateVariableModalOpen(false)}
        onCreateVariable={(newVar: MacroVariable) => {
          onUpdateVariables([...variables, newVar]);
          onCreateSnapshot(`Created variable: ${newVar.name}`);
        }}
      />

      <VersionHistoryModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        snapshots={snapshots}
        onCreateSnapshot={onCreateSnapshot}
        onRestoreSnapshot={onRestoreSnapshot}
        onDeleteSnapshot={onDeleteSnapshot}
      />

      <BlockTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={(tplBlocks: BlockNode[], templateName: string) => {
          onUpdateBlocks(tplBlocks);
          onCreateSnapshot(`Loaded template: ${templateName}`);
        }}
      />

      <BlockCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onAddBlock={(block: BlockNode) => handleAddBlock(block)}
        customBlocks={customBlocks}
        onTriggerRun={handleRun}
        onTriggerPause={handlePause}
        onTriggerAutoArrange={handleAutoArrange}
        onOpenAiAssistant={() => {}}
        onOpenRecorder={() => {}}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onOpenVersionHistory={() => setIsVersionModalOpen(true)}
      />

      {contextMenu && (
        <BlockContextMenu
          position={contextMenu.position}
          targetBlock={contextMenu.targetBlock}
          onClose={() => setContextMenu(null)}
          onDuplicate={(b: BlockNode) => handleDuplicateBlock(b)}
          onDelete={(id: string) => handleDeleteBlock(id)}
          onToggleDisabled={(b: BlockNode) => handleUpdateBlock({ ...b, isDisabled: !b.isDisabled })}
          onToggleBreakpoint={(id: string) => {
            setBreakpoints((prev) =>
              prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
            );
          }}
          onCopy={() => {}}
          canPaste={false}
        />
      )}
    </div>
  );
};
