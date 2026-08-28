import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Square,
  Trash2,
  Save,
  Plus,
  Settings2,
  X,
  Sparkles,
  MousePointer,
  Keyboard,
  Clock,
  Smartphone,
  Eye,
  Crosshair,
  HelpCircle,
  Grid,
  Crop,
  Check,
  Palette,
  Layers,
  Code2,
  Zap,
  Boxes,
  MoveDown,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Cpu,
  Sliders,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Hand,
  Repeat,
  RefreshCw,
  Undo2,
  Redo2,
  CopyPlus,
  BookOpen,
  Maximize2,
  GitBranch,
  Variable,
  LayoutGrid,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FolderPlus,
  FolderMinus,
  MessageSquare,
  Power,
  Copy,
  ClipboardPaste,
  AlertTriangle,
  Construction,
} from 'lucide-react';
import { ActionType, MacroNode, SnipData, MacroVariable, MacroGroup, BlockNode, CustomBlockDefinition, MacroVersionSnapshot } from '../types';
import { parseSnipData } from '../utils/serialization';
import { ActionCrafterModal, CustomActionDefinition } from './ActionCrafterModal';
import { RadarMinimap } from './RadarMinimap';
import { ConfirmModal } from './ConfirmModal';
import { MacroTemplatesModal } from './MacroTemplatesModal';
import { TestSimulationConsole } from './TestSimulationConsole';
import { UserManualModal } from './UserManualModal';
import { BlockLibraryDrawer, BlockTemplate } from './BlockLibraryDrawer';
import { NodePropertiesDrawer } from './NodePropertiesDrawer';
import { VariablesModal } from './VariablesModal';
import { BlockCodingWorkspace } from './BlockCodingWorkspace';
import { BlockUnderConstructionModal } from './blockcoding/BlockUnderConstructionModal';
import { MacroVersionManager } from '../utils/macroVersionManager';
import { BLOCK_CATALOG, createBlockInstance } from '../data/blockCatalog';
import { autoArrangeNodes, alignNodes, distributeNodes, calculateZoomToFit } from '../utils/autoArranger';
import { MacroExecutionEngine } from '../utils/macroEngine';
import { Language, translations } from '../i18n/translations';
import { api } from '../services/api';

interface VisualMacroStudioProps {
  initialGraph?: MacroNode[];
  onSaveGraph?: (graph: MacroNode[]) => Promise<void>;
  onRunMacro?: (graph: MacroNode[]) => Promise<void>;
  onStopMacro?: () => Promise<void>;
  isMacroRunning?: boolean;
  onLog?: (msg: string) => void;
  activeSnip?: SnipData | null;
  onOpenSnipper?: () => void;
  onExportToLibrary?: (name: string, content: string) => void;
  lang?: Language;
  isBn?: boolean;
}

export const ACTION_COLORS: Record<
  string,
  { border: string; glow: string; text: string; bg: string; dot: string }
> = {
  'Event (Start)': { border: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', text: '#eab308', bg: '#231d0a', dot: '#eab308' },
  'Event (Key Pressed)': { border: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', text: '#eab308', bg: '#231d0a', dot: '#eab308' },
  'Event (Key Released)': { border: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', text: '#eab308', bg: '#231d0a', dot: '#eab308' },
  'Event (Mouse Event)': { border: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', text: '#eab308', bg: '#231d0a', dot: '#eab308' },
  'Event (Timer Tick)': { border: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', text: '#eab308', bg: '#231d0a', dot: '#eab308' },
  'Search Color': { border: '#39ff14', glow: 'rgba(57, 255, 20, 0.4)', text: '#39ff14', bg: '#142914', dot: '#39ff14' },
  'Multi-Image Search': { border: '#39ff14', glow: 'rgba(57, 255, 20, 0.4)', text: '#39ff14', bg: '#142914', dot: '#39ff14' },
  'Move Mouse': { border: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)', text: '#00e5ff', bg: '#14252e', dot: '#00e5ff' },
  'Human Click': { border: '#2979ff', glow: 'rgba(41, 121, 255, 0.4)', text: '#2979ff', bg: '#151e2e', dot: '#2979ff' },
  'Click Mouse': { border: '#2979ff', glow: 'rgba(41, 121, 255, 0.4)', text: '#2979ff', bg: '#151e2e', dot: '#2979ff' },
  'Press Key': { border: '#d500f9', glow: 'rgba(213, 0, 249, 0.4)', text: '#d500f9', bg: '#25142b', dot: '#d500f9' },
  'Delay': { border: '#ffd600', glow: 'rgba(255, 214, 0, 0.4)', text: '#ffd600', bg: '#292514', dot: '#ffd600' },
  'Condition (If)': { border: '#ff007f', glow: 'rgba(255, 0, 127, 0.4)', text: '#ff007f', bg: '#29101f', dot: '#ff007f' },
  'Compare': { border: '#ff007f', glow: 'rgba(255, 0, 127, 0.4)', text: '#ff007f', bg: '#29101f', dot: '#ff007f' },
  'Set Variable': { border: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', text: '#a855f7', bg: '#221530', dot: '#a855f7' },
  'Get Variable': { border: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', text: '#a855f7', bg: '#221530', dot: '#a855f7' },
  'Math Operation': { border: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', text: '#a855f7', bg: '#221530', dot: '#a855f7' },
  'Repeat Loop': { border: '#ff007f', glow: 'rgba(255, 0, 127, 0.4)', text: '#ff007f', bg: '#29101f', dot: '#ff007f' },
  'While Color Exists': { border: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)', text: '#00e5ff', bg: '#10252e', dot: '#00e5ff' },
  'Loop (While)': { border: '#ff007f', glow: 'rgba(255, 0, 127, 0.4)', text: '#ff007f', bg: '#29101f', dot: '#ff007f' },
  'Loop (For Range)': { border: '#ff007f', glow: 'rgba(255, 0, 127, 0.4)', text: '#ff007f', bg: '#29101f', dot: '#ff007f' },
  'ADB Tap': { border: '#00e676', glow: 'rgba(0, 230, 118, 0.4)', text: '#00e676', bg: '#132b1f', dot: '#00e676' },
  'ADB Swipe': { border: '#00e676', glow: 'rgba(0, 230, 118, 0.4)', text: '#00e676', bg: '#132b1f', dot: '#00e676' },
  'ADB Shell': { border: '#00b4d8', glow: 'rgba(0, 180, 216, 0.4)', text: '#00b4d8', bg: '#142830', dot: '#00b4d8' },
  'Notification': { border: '#39ff14', glow: 'rgba(57, 255, 20, 0.4)', text: '#39ff14', bg: '#142914', dot: '#39ff14' },
  'Sound Beep': { border: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)', text: '#00e5ff', bg: '#14252e', dot: '#00e5ff' },
  'Log Message': { border: '#8892b0', glow: 'rgba(136, 146, 176, 0.4)', text: '#ccd6f6', bg: '#141824', dot: '#ccd6f6' },
  'Script Block': { border: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', text: '#a855f7', bg: '#221530', dot: '#a855f7' },
};

const GRID_SIZE = 20;

export interface SketchwareBlock {
  id: string;
  category: 'Vision' | 'Input' | 'Loops' | 'Logic' | 'ADB' | 'Custom';
  title: string;
  color: string;
  parameters: Record<string, string>;
  hasContainerSlot?: boolean;
  childBlocks?: SketchwareBlock[];
}

export const VisualMacroStudio: React.FC<VisualMacroStudioProps> = ({
  initialGraph = [],
  onSaveGraph = async () => {},
  onRunMacro = async () => {},
  onStopMacro = async () => {},
  isMacroRunning = false,
  onLog = () => {},
  activeSnip = null,
  onOpenSnipper = () => {},
  onExportToLibrary,
  lang = 'bn',
  isBn = true,
}) => {
  const t = translations[lang] || translations.bn;

  // Mode State: Node Graph vs Block Coding
  const [workspaceMode, setWorkspaceMode] = useState<'nodeGraph' | 'blockCoding'>('nodeGraph');

  // EXPORT TO MACRO LIBRARY
  const handleExportToLibrary = () => {
    if (!onExportToLibrary) return;
    const graphData = JSON.stringify({
      macroType: 'visual_graph',
      version: '1.0.0',
      nodes: nodes,
      groups: groups
    }, null, 2);
    onExportToLibrary('Visual Graph Macro', graphData);
  };

  const [nodes, setNodes] = useState<MacroNode[]>(() => initialGraph || []);

  // Variables and Groups
  const [variables, setVariables] = useState<MacroVariable[]>([
    { id: 'var_1', name: 'ammoCount', type: 'number', defaultValue: 30, value: 30, scope: 'global' },
    { id: 'var_2', name: 'targetLocked', type: 'boolean', defaultValue: false, value: false, scope: 'global' },
  ]);
  const [groups, setGroups] = useState<MacroGroup[]>([]);
  const [isVariablesModalOpen, setIsVariablesModalOpen] = useState<boolean>(false);
  const [isBlockLibraryOpen, setIsBlockLibraryOpen] = useState<boolean>(false);

  // Selection and Inspector Drawer
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [inspectingNode, setInspectingNode] = useState<MacroNode | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [connectingBranchType, setConnectingBranchType] = useState<'next' | 'true' | 'false' | 'body' | 'done'>('next');
  const [wireDraft, setWireDraft] = useState<{ x: number; y: number } | null>(null);

  // Feedback & Execution
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([
    '[INIT] Visual Macro Studio Simulation Engine ready.',
  ]);

  const handleRunSimulation = () => {
    onRunMacro(nodes);
    setExecutionLogs((prev) => [
      ...prev,
      `[START] Node graph simulation started at ${new Date().toLocaleTimeString()}`,
    ]);
  };

  const handleStopSimulation = () => {
    onStopMacro();
    setExecutionLogs((prev) => [
      ...prev,
      `[STOP] Node graph simulation stopped at ${new Date().toLocaleTimeString()}`,
    ]);
  };
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [showGridLines, setShowGridLines] = useState<boolean>(true);
  const [inspectorToast, setInspectorToast] = useState<string | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [isManualGuideOpen, setIsManualGuideOpen] = useState<boolean>(false);
  const [isConstructionModalOpen, setIsConstructionModalOpen] = useState<boolean>(false);

  // Undo / Redo History Stacks
  const [history, setHistory] = useState<MacroNode[][]>([]);
  const [future, setFuture] = useState<MacroNode[][]>([]);

  // Clipboard Buffer
  const [clipboardNodes, setClipboardNodes] = useState<MacroNode[]>([]);

  // Hidden File Input Ref for Graph JSON Import
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Action Nodes Horizontal Slider Ref for Isolated Scroll
  const actionNodesScrollRef = useRef<HTMLDivElement | null>(null);

  // Smooth horizontal scroll with mouse wheel for quick actions
  useEffect(() => {
    const el = actionNodesScrollRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Custom Actions Registry (Action Crafter)
  const [customActions, setCustomActions] = useState<CustomActionDefinition[]>([]);
  const [isCrafterOpen, setIsCrafterOpen] = useState<boolean>(false);

  // Dragging & Marquee Selection States
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [marqueeBox, setMarqueeBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Pan & Zoom Canvas Camera States
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isSpacePressed, setIsSpacePressed] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanToolActive, setIsPanToolActive] = useState<boolean>(false);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({
    width: 1000,
    height: 620,
  });

  // Version History Manager Instance
  const versionManagerRef = useRef<MacroVersionManager>(new MacroVersionManager());
  const [versionSnapshots, setVersionSnapshots] = useState<MacroVersionSnapshot[]>(() =>
    versionManagerRef.current.getSnapshots()
  );

  // Custom Blocks Definitions
  const [customBlocks, setCustomBlocks] = useState<CustomBlockDefinition[]>([]);

  // Sketchware Block System State (BlockNode Architecture)
  const [blocks, setBlocks] = useState<BlockNode[]>(() => [
    createBlockInstance('event_start'),
    createBlockInstance('condition_color_found', {
      regionX: 860,
      regionY: 440,
      width: 200,
      height: 200,
      color: '#39FF14',
    }),
    createBlockInstance('action_human_click', {
      button: 'left',
      jitterRadius: 3,
    }),
    createBlockInstance('timing_delay', {
      durationMs: 50,
      jitterMs: 10,
    }),
  ]);

  // Version Management Handlers
  const handleCreateSnapshot = (label: string, description?: string) => {
    const snap = versionManagerRef.current.createSnapshot(
      label,
      nodes,
      blocks,
      variables,
      customBlocks,
      false,
      description
    );
    setVersionSnapshots(versionManagerRef.current.getSnapshots());
    setInspectorToast(`Snapshot "${label}" created (v${snap.versionNumber})`);
    setTimeout(() => setInspectorToast(null), 2000);
  };

  const handleRestoreSnapshot = (snapshotId: string) => {
    const result = versionManagerRef.current.restoreSnapshot(snapshotId, {
      nodeGraph: nodes,
      blockCoding: blocks,
      variables,
      customBlocks,
    });

    if (result.success && result.restored) {
      if (result.restored.nodeGraph) setNodes(result.restored.nodeGraph);
      if (result.restored.blockCoding) setBlocks(result.restored.blockCoding);
      if (result.restored.variables) setVariables(result.restored.variables);
      if (result.restored.customBlocks) setCustomBlocks(result.restored.customBlocks);
      setVersionSnapshots(versionManagerRef.current.getSnapshots());
      setInspectorToast(`Restored to ${result.restored.label} (v${result.restored.versionNumber})`);
      setTimeout(() => setInspectorToast(null), 2000);
    }
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    versionManagerRef.current.deleteSnapshot(snapshotId);
    setVersionSnapshots(versionManagerRef.current.getSnapshots());
  };

  const handleAutoSave = () => {
    versionManagerRef.current.saveAutoSave(nodes, blocks, variables, customBlocks);
  };

  const canvasRef = useRef<HTMLDivElement>(null);

  // Resize observer to update canvas container dimensions for Minimap and Bounds
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setCanvasDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [workspaceMode]);

  // Load persistent custom actions from API
  useEffect(() => {
    api.getCustomActions().then((res) => {
      if (res && res.customActions) {
        setCustomActions(res.customActions);
      }
    }).catch(console.error);
  }, []);

  // Sync graph updates when initialGraph changes
  useEffect(() => {
    setNodes(initialGraph || []);
  }, [initialGraph]);

  // Push to Undo history
  const pushHistory = useCallback((currentNodes: MacroNode[]) => {
    setHistory((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(currentNodes))]);
    setFuture([]);
  }, []);

  // Undo Handler (Ctrl+Z)
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);
    setFuture((prev) => [JSON.parse(JSON.stringify(nodes)), ...prev]);
    setHistory(newHistory);
    setNodes(previousState);
    setSelectedNodeIds(new Set());
    setInspectorToast('Undo performed (Ctrl+Z)');
    onLog('[Macro] Reverted last action (Undo).');
    setTimeout(() => setInspectorToast(null), 1500);
  }, [history, nodes, onLog]);

  // Redo Handler (Ctrl+Y or Ctrl+Shift+Z)
  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const nextState = future[0];
    const newFuture = future.slice(1);
    setHistory((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(nodes))]);
    setFuture(newFuture);
    setNodes(nextState);
    setSelectedNodeIds(new Set());
    setInspectorToast('Redo performed (Ctrl+Y)');
    onLog('[Macro] Restored next action (Redo).');
    setTimeout(() => setInspectorToast(null), 1500);
  }, [future, nodes, onLog]);

  // Copy Selected Nodes (Ctrl+C)
  const handleCopy = useCallback(() => {
    const selected = nodes.filter((n) => selectedNodeIds.has(n.id));
    if (selected.length === 0) return;
    setClipboardNodes(JSON.parse(JSON.stringify(selected)));
    setInspectorToast(`Copied ${selected.length} node(s) to clipboard (Ctrl+C)`);
    setTimeout(() => setInspectorToast(null), 1500);
  }, [nodes, selectedNodeIds]);

  // Paste Nodes from Clipboard (Ctrl+V)
  const handlePaste = useCallback(() => {
    if (clipboardNodes.length === 0) return;
    pushHistory(nodes);

    const timestamp = Date.now();
    const idMap: Record<string, string> = {};

    const pastedNodes: MacroNode[] = clipboardNodes.map((oldNode, idx) => {
      const newId = `node_pasted_${timestamp}_${idx}`;
      idMap[oldNode.id] = newId;
      return {
        ...oldNode,
        id: newId,
        positionX: oldNode.positionX + 50,
        positionY: oldNode.positionY + 50,
        nextNodes: [...oldNode.nextNodes],
      };
    });

    pastedNodes.forEach((node) => {
      node.nextNodes = node.nextNodes.map((targetId) => idMap[targetId] || targetId);
      if (node.conditionBranch?.trueNodeId) {
        node.conditionBranch.trueNodeId = idMap[node.conditionBranch.trueNodeId] || node.conditionBranch.trueNodeId;
      }
      if (node.conditionBranch?.falseNodeId) {
        node.conditionBranch.falseNodeId = idMap[node.conditionBranch.falseNodeId] || node.conditionBranch.falseNodeId;
      }
    });

    setNodes((prev) => [...prev, ...pastedNodes]);
    setSelectedNodeIds(new Set(pastedNodes.map((n) => n.id)));
    setInspectorToast(`Pasted ${pastedNodes.length} node(s) (Ctrl+V)`);
    onLog(`[Macro] Pasted ${pastedNodes.length} node(s) onto canvas.`);
    setTimeout(() => setInspectorToast(null), 1800);
  }, [clipboardNodes, nodes, pushHistory, onLog]);

  // Duplicate Selected Nodes (Ctrl+D)
  const handleDuplicateSelectedNodes = useCallback(() => {
    const nodesToDup = nodes.filter((n) => selectedNodeIds.has(n.id));
    if (nodesToDup.length === 0) return;

    pushHistory(nodes);

    const timestamp = Date.now();
    const idMap: Record<string, string> = {};

    const duplicatedNodes: MacroNode[] = nodesToDup.map((oldNode, idx) => {
      const newId = `node_dup_${timestamp}_${idx}`;
      idMap[oldNode.id] = newId;
      return {
        ...oldNode,
        id: newId,
        positionX: oldNode.positionX + 40,
        positionY: oldNode.positionY + 40,
        nextNodes: [...oldNode.nextNodes],
      };
    });

    duplicatedNodes.forEach((node) => {
      node.nextNodes = node.nextNodes.map((targetId) => idMap[targetId] || targetId);
    });

    setNodes((prev) => [...prev, ...duplicatedNodes]);
    setSelectedNodeIds(new Set(duplicatedNodes.map((n) => n.id)));
    setInspectorToast(`Duplicated ${duplicatedNodes.length} node(s) [Ctrl+D]`);
    onLog(`[Macro] Cloned/Duplicated ${duplicatedNodes.length} node(s).`);
    setTimeout(() => setInspectorToast(null), 2000);
  }, [nodes, selectedNodeIds, pushHistory, onLog]);

  // Auto-Arrange DAG Layout
  const handleAutoArrange = () => {
    pushHistory(nodes);
    const arranged = autoArrangeNodes(nodes);
    setNodes(arranged);
    setInspectorToast('Cleaned & Auto-Arranged DAG Graph Layout!');
    onLog('[Graph] Auto-arranged all nodes into hierarchical DAG structure.');
    setTimeout(() => setInspectorToast(null), 2000);
  };

  // Zoom to Fit All Nodes
  const handleZoomToFit = () => {
    const { panX, panY, zoom } = calculateZoomToFit(
      nodes,
      canvasDimensions.width,
      canvasDimensions.height
    );
    setPanOffset({ x: panX, y: panY });
    setZoomLevel(zoom);
    setInspectorToast(`Fit ${nodes.length} nodes to screen (${(zoom * 100).toFixed(0)}%)`);
    setTimeout(() => setInspectorToast(null), 1500);
  };

  // Alignment actions
  const handleAlign = (alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY') => {
    if (selectedNodeIds.size <= 1) return;
    pushHistory(nodes);
    const aligned = alignNodes(nodes, selectedNodeIds, alignment);
    setNodes(aligned);
    setInspectorToast(`Aligned ${selectedNodeIds.size} nodes to ${alignment}`);
    setTimeout(() => setInspectorToast(null), 1500);
  };

  const handleDistribute = (axis: 'horizontal' | 'vertical') => {
    if (selectedNodeIds.size <= 2) return;
    pushHistory(nodes);
    const distributed = distributeNodes(nodes, selectedNodeIds, axis);
    setNodes(distributed);
    setInspectorToast(`Distributed ${selectedNodeIds.size} nodes ${axis}ly`);
    setTimeout(() => setInspectorToast(null), 1500);
  };

  // Group Selected Nodes
  const handleGroupSelected = () => {
    if (selectedNodeIds.size <= 1) return;
    const selected = nodes.filter((n) => selectedNodeIds.has(n.id));
    const minX = Math.min(...selected.map((n) => n.positionX)) - 20;
    const minY = Math.min(...selected.map((n) => n.positionY)) - 40;
    const maxX = Math.max(...selected.map((n) => n.positionX + 240)) + 20;
    const maxY = Math.max(...selected.map((n) => n.positionY + 120)) + 20;

    const newGroup: MacroGroup = {
      id: `group_${Date.now()}`,
      title: `Group ${groups.length + 1}`,
      color: '#00e5ff',
      nodeIds: Array.from(selectedNodeIds),
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };

    setGroups((prev) => [...prev, newGroup]);
    setInspectorToast(`Grouped ${selectedNodeIds.size} nodes!`);
    setTimeout(() => setInspectorToast(null), 1500);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space' && !isSpacePressed) {
        setIsSpacePressed(true);
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIds.size > 0) {
          e.preventDefault();
          pushHistory(nodes);
          setNodes((prev) =>
            prev
              .filter((n) => !selectedNodeIds.has(n.id))
              .map((n) => ({
                ...n,
                nextNodes: n.nextNodes.filter((tid) => !selectedNodeIds.has(tid)),
              }))
          );
          setSelectedNodeIds(new Set());
          setInspectorToast(`Deleted ${selectedNodeIds.size} node(s)`);
          setTimeout(() => setInspectorToast(null), 1500);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopy();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePaste();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelectedNodes();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedNodeIds, nodes, isSpacePressed, handleCopy, handlePaste, handleDuplicateSelectedNodes, handleUndo, handleRedo, pushHistory]);

  // Mouse Wheel Isolated Listener
  useEffect(() => {
    const canvasEl = canvasRef.current;
    const actionEl = actionNodesScrollRef.current;

    const onCanvasWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey || e.altKey) {
        const rect = canvasEl?.getBoundingClientRect();
        if (rect) {
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
          const newZoom = Math.min(2.5, Math.max(0.3, zoomLevel * zoomFactor));

          // Zoom centered around mouse cursor
          const worldX = (mouseX - panOffset.x) / zoomLevel;
          const worldY = (mouseY - panOffset.y) / zoomLevel;

          setZoomLevel(newZoom);
          setPanOffset({
            x: mouseX - worldX * newZoom,
            y: mouseY - worldY * newZoom,
          });
        }
      } else {
        setPanOffset((prev) => ({
          x: prev.x - e.deltaX * 0.8,
          y: prev.y - e.deltaY * 0.8,
        }));
      }
    };

    const onActionNodesWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (actionEl) {
        actionEl.scrollLeft += e.deltaY * 1.2;
      }
    };

    if (canvasEl) {
      canvasEl.addEventListener('wheel', onCanvasWheel, { passive: false });
    }
    if (actionEl) {
      actionEl.addEventListener('wheel', onActionNodesWheel, { passive: false });
    }

    return () => {
      if (canvasEl) canvasEl.removeEventListener('wheel', onCanvasWheel);
      if (actionEl) actionEl.removeEventListener('wheel', onActionNodesWheel);
    };
  }, [workspaceMode, zoomLevel, panOffset]);

  // Node Drag handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: MacroNode) => {
    if (
      (e.target as HTMLElement).tagName === 'BUTTON' ||
      (e.target as HTMLElement).tagName === 'SELECT' ||
      (e.target as HTMLElement).tagName === 'INPUT' ||
      (e.target as HTMLElement).tagName === 'TEXTAREA' ||
      isPanToolActive ||
      isSpacePressed ||
      e.button === 1
    ) {
      return;
    }

    e.stopPropagation();

    if (e.shiftKey) {
      setSelectedNodeIds((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
    } else {
      if (!selectedNodeIds.has(node.id)) {
        setSelectedNodeIds(new Set([node.id]));
      }
    }

    setDraggingNodeId(node.id);
    setDragOffset({
      x: e.clientX / zoomLevel - node.positionX,
      y: e.clientY / zoomLevel - node.positionY,
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive =
      target.closest('.macro-node-card') ||
      target.closest('.macro-group-box') ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA';

    if (!isInteractive) {
      // Pan mode if space key, pan tool, middle click or right click
      if (isSpacePressed || isPanToolActive || e.button === 1 || e.button === 2 || e.altKey) {
        if (e.button === 2) e.preventDefault();
        setIsPanning(true);
        setPanStart({
          x: e.clientX - panOffset.x,
          y: e.clientY - panOffset.y,
        });
      } else if (e.button === 0) {
        // Left click on empty canvas starts Marquee Box Selection
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const worldStartX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
          const worldStartY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

          setMarqueeBox({
            startX: worldStartX,
            startY: worldStartY,
            currentX: worldStartX,
            currentY: worldStartY,
          });

          if (!e.shiftKey && !e.ctrlKey) {
            setSelectedNodeIds(new Set());
          }
        }
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentWorldX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    const currentWorldY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

    if (connectingSourceId) {
      setWireDraft({ x: currentWorldX, y: currentWorldY });
    }

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (marqueeBox) {
      setMarqueeBox((prev) => (prev ? { ...prev, currentX: currentWorldX, currentY: currentWorldY } : null));

      // Calculate which nodes are inside the marquee box
      const minX = Math.min(marqueeBox.startX, currentWorldX);
      const maxX = Math.max(marqueeBox.startX, currentWorldX);
      const minY = Math.min(marqueeBox.startY, currentWorldY);
      const maxY = Math.max(marqueeBox.startY, currentWorldY);

      const insideIds = new Set<string>();
      nodes.forEach((n) => {
        if (
          n.positionX + 220 >= minX &&
          n.positionX <= maxX &&
          n.positionY + 80 >= minY &&
          n.positionY <= maxY
        ) {
          insideIds.add(n.id);
        }
      });
      setSelectedNodeIds(insideIds);
      return;
    }

    if (draggingNodeId) {
      let rawX = e.clientX / zoomLevel - dragOffset.x;
      let rawY = e.clientY / zoomLevel - dragOffset.y;

      if (snapToGrid) {
        rawX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
        rawY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;
      }

      const draggedNode = nodes.find((n) => n.id === draggingNodeId);
      if (draggedNode) {
        const deltaX = rawX - draggedNode.positionX;
        const deltaY = rawY - draggedNode.positionY;

        // Move all selected nodes together if multiple are selected
        if (selectedNodeIds.has(draggingNodeId) && selectedNodeIds.size > 1) {
          setNodes((prev) =>
            prev.map((n) =>
              selectedNodeIds.has(n.id)
                ? { ...n, positionX: n.positionX + deltaX, positionY: n.positionY + deltaY }
                : n
            )
          );
        } else {
          setNodes((prev) =>
            prev.map((n) => (n.id === draggingNodeId ? { ...n, positionX: rawX, positionY: rawY } : n))
          );
        }
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
    setMarqueeBox(null);
    if (!connectingSourceId) {
      setWireDraft(null);
    }
  };

  const handleAddNodeFromTemplate = (template: BlockTemplate) => {
    pushHistory(nodes);
    const newId = `node_${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];
    let newX = lastNode ? lastNode.positionX + 280 : 80;
    let newY = lastNode ? lastNode.positionY : 100;

    if (snapToGrid) {
      newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
      newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
    }

    const newNode: MacroNode = {
      id: newId,
      actionType: template.actionType as any,
      title: template.title,
      parameters: template.defaultParams,
      positionX: newX > 1400 ? 80 : newX,
      positionY: newX > 1400 ? (lastNode ? lastNode.positionY + 140 : 100) : newY,
      nextNodes: [],
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeIds(new Set([newId]));
    onLog(`[Macro] Added node: ${template.title}`);
  };

  const handleConnectPort = (sourceId: string, branchType: 'next' | 'true' | 'false' | 'body' | 'done', targetId: string) => {
    if (sourceId === targetId) return;
    pushHistory(nodes);

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === sourceId) {
          if (branchType === 'true') {
            return {
              ...n,
              conditionBranch: { ...n.conditionBranch, trueNodeId: targetId },
            };
          } else if (branchType === 'false') {
            return {
              ...n,
              conditionBranch: { ...n.conditionBranch, falseNodeId: targetId },
            };
          } else if (branchType === 'body') {
            return {
              ...n,
              loopBranch: { ...n.loopBranch, bodyNodeId: targetId },
            };
          } else if (branchType === 'done') {
            return {
              ...n,
              loopBranch: { ...n.loopBranch, doneNodeId: targetId },
            };
          } else {
            const exists = n.nextNodes.includes(targetId);
            return {
              ...n,
              nextNodes: exists ? n.nextNodes.filter((id) => id !== targetId) : [...n.nextNodes, targetId],
            };
          }
        }
        return n;
      })
    );

    setConnectingSourceId(null);
    setWireDraft(null);
    onLog(`[Macro Wire] Connected: ${sourceId} (${branchType}) -> ${targetId}`);
  };

  const handleDeleteNode = (id: string) => {
    pushHistory(nodes);
    setNodes((prev) =>
      prev
        .filter((n) => n.id !== id)
        .map((n) => ({
          ...n,
          nextNodes: n.nextNodes.filter((targetId) => targetId !== id),
          conditionBranch: {
            trueNodeId: n.conditionBranch?.trueNodeId === id ? undefined : n.conditionBranch?.trueNodeId,
            falseNodeId: n.conditionBranch?.falseNodeId === id ? undefined : n.conditionBranch?.falseNodeId,
          },
        }))
    );
    setSelectedNodeIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Execution engine run
  const handleRunExecution = async () => {
    if (workspaceMode === 'nodeGraph') {
      const engine = new MacroExecutionEngine(nodes, variables);
      onLog('[MacroEngine] Starting full graph execution with condition branching and variables...');
      await onRunMacro(nodes);
      await engine.execute(
        (activeId, status) => {
          setExecutingNodeId(activeId);
        },
        (msg) => onLog(msg)
      );
    } else {
      await onRunMacro(nodes);
    }
  };

  const handleSave = async () => {
    await onSaveGraph(nodes);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  // Import / Export JSON
  const handleExportGraph = () => {
    try {
      const exportData = {
        app: 'OptiGamer AutoAim Macro Studio',
        version: '3.5',
        exportedAt: new Date().toISOString(),
        nodesCount: nodes.length,
        nodes,
        variables,
        groups,
      };
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AIMOPT_MacroGraph_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setInspectorToast(`Exported ${nodes.length} nodes to JSON file!`);
      onLog(`[Export] Successfully exported ${nodes.length} graph nodes.`);
      setTimeout(() => setInspectorToast(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        let importedNodes: MacroNode[] = [];

        if (Array.isArray(parsed)) {
          importedNodes = parsed;
        } else if (parsed.nodes && Array.isArray(parsed.nodes)) {
          importedNodes = parsed.nodes;
        } else if (parsed.macroGraph && Array.isArray(parsed.macroGraph)) {
          importedNodes = parsed.macroGraph;
        }

        if (importedNodes.length > 0) {
          pushHistory(nodes);
          setNodes(importedNodes);
          if (parsed.variables && Array.isArray(parsed.variables)) {
            setVariables(parsed.variables);
          }
          if (parsed.groups && Array.isArray(parsed.groups)) {
            setGroups(parsed.groups);
          }
          setSelectedNodeIds(new Set());
          setInspectorToast(`Imported ${importedNodes.length} node(s) successfully!`);
          onLog(`[Import] Imported ${importedNodes.length} nodes from '${file.name}'.`);
        }
      } catch {
        setInspectorToast('Invalid JSON file format.');
      }
      setTimeout(() => setInspectorToast(null), 2500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Studio Control Bar */}
      <div className="bg-[#10131d] rounded-2xl p-4 border border-[#1f283d] shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Left Studio Title & Mode Toggle */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-wide flex items-center gap-2">
              <span>{isBn ? 'ভিজ্যুয়াল ম্যাক্রো স্টুডিও' : 'Visual Macro Studio'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#162b16] text-[#39ff14] border border-[#39ff14]/50 font-mono">
                Pro v3.5
              </span>
            </h2>
            <p className="text-xs text-[#8892b0]">
              {isBn
                ? 'নোড গ্রাফ ইঞ্জিন, কন্ডিশন ব্রাঞ্চ, অটো অ্যারেঞ্জার এবং ভ্যারিয়েবল কন্ট্রোল'
                : 'Node Graph Engine with Condition Branches, Typed Sockets, DAG Auto-Arranger & Variables'}
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          {/* Guide Button */}
          <button
            onClick={() => setIsManualGuideOpen(true)}
            className="h-9 px-2.5 rounded-xl bg-[#141824] hover:bg-[#1f283d] text-[#39ff14] border border-[#39ff14]/40 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all shadow-[0_0_8px_rgba(57,255,20,0.15)]"
            title="User Manual & Shortcuts Guide (?)"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="font-mono font-bold">Guide</span>
          </button>

          {/* Templates Library */}
          {workspaceMode === 'nodeGraph' && (
            <button
              onClick={() => setIsTemplatesModalOpen(true)}
              className="h-9 px-3 rounded-xl bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(0,229,255,0.15)]"
              title="Open Preset Macro Templates Library"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.templates}</span>
            </button>
          )}

          {/* Undo Button */}
          {workspaceMode === 'nodeGraph' && (
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="h-9 px-2.5 rounded-xl bg-[#141824] hover:bg-[#1f283d] text-[#ccd6f6] hover:text-white border border-[#1f283d] font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo Last Action (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Redo Button */}
          {workspaceMode === 'nodeGraph' && (
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              className="h-9 px-2.5 rounded-xl bg-[#141824] hover:bg-[#1f283d] text-[#ccd6f6] hover:text-white border border-[#1f283d] font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo Next Action (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Import Graph */}
          {workspaceMode === 'nodeGraph' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-2.5 rounded-xl bg-[#10252e] hover:bg-[#143340] text-[#00e5ff] border border-[#00e5ff]/50 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(0,229,255,0.15)]"
              title="Import Graph from .json file"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Export Graph */}
          {workspaceMode === 'nodeGraph' && (
            <button
              onClick={handleExportGraph}
              disabled={nodes.length === 0}
              className="h-9 px-2.5 rounded-xl bg-[#152a1d] hover:bg-[#1d3d2a] text-[#00e676] border border-[#00e676]/50 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all shadow-[0_0_10px_rgba(0,230,118,0.15)] disabled:opacity-40 disabled:cursor-not-allowed"
              title="Export Graph to .json file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Save Graph */}
          {workspaceMode === 'nodeGraph' && (
            <button
              onClick={handleSave}
              className="h-9 px-3.5 rounded-xl bg-[#102414] hover:bg-[#17381e] text-[#39ff14] border border-[#39ff14] font-black text-xs flex items-center space-x-1.5 cursor-pointer transition-all shadow-[0_0_10px_rgba(57,255,20,0.2)]"
            >
              {savedFeedback ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedFeedback ? (isBn ? 'সেভ হয়েছে!' : 'Saved!') : t.saveGraph}</span>
            </button>
          )}

          {/* Clear Graph */}
          {workspaceMode === 'nodeGraph' && nodes.length > 0 && (
            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="h-9 px-2.5 rounded-xl bg-[#2a1318] hover:bg-[#3d1820] text-[#ff4444] border border-[#ff4444]/40 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all shadow-[0_0_8px_rgba(255,68,68,0.2)]"
              title="Clear All Nodes from Graph"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'ক্লিয়ার করুন' : 'Clear'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Node Graph Secondary Toolbar */}
      {workspaceMode === 'nodeGraph' && (
        <div className="bg-[#0e1017] rounded-2xl p-2.5 border border-[#1f283d] shadow-lg flex items-center justify-between gap-3">
          {/* Left: Add Block & Full-Width Quick Actions Palette */}
          <div className="flex-1 flex items-center space-x-2 min-w-0">
            <button
              onClick={() => setIsBlockLibraryOpen(true)}
              className="h-8 px-3 rounded-xl bg-[#00e5ff] hover:bg-[#33ebff] text-black font-black text-xs flex items-center space-x-1.5 shrink-0 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.3)] hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>{t.actionLibrary}</span>
            </button>

            {/* Scroll Left Button */}
            <button
              onClick={() => {
                if (actionNodesScrollRef.current) {
                  actionNodesScrollRef.current.scrollBy({ left: -220, behavior: 'smooth' });
                }
              }}
              className="p-1 rounded-lg text-[#8892b0] hover:text-[#00e5ff] hover:bg-[#1f283d] transition-all cursor-pointer shrink-0 hidden sm:flex"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Horizontal Scroll Palette (Fills all remaining empty space) */}
            <div
              ref={actionNodesScrollRef}
              className="flex-1 flex items-center space-x-2 overflow-x-auto py-1 px-1 overscroll-contain no-scrollbar scrollbar-none select-none min-w-0 scroll-smooth"
            >
              {[
                { name: 'Search Color', color: '#39ff14', icon: Eye },
                { name: 'Move Mouse', color: '#00e5ff', icon: MousePointer },
                { name: 'Human Click', color: '#2979ff', icon: MousePointer },
                { name: 'Press Key', color: '#d500f9', icon: Keyboard },
                { name: 'Delay', color: '#ffd600', icon: Clock },
                { name: 'Condition (If)', color: '#ff007f', icon: GitBranch },
                { name: 'Set Variable', color: '#a855f7', icon: Variable },
                { name: 'Repeat Loop', color: '#ff007f', icon: Repeat },
                { name: 'ADB Tap', color: '#00e676', icon: Smartphone },
                ...customActions.map((ca) => ({
                  name: ca.name,
                  color: ca.color || '#00e5ff',
                  icon: Zap,
                })),
              ].map((act) => {
                const IconComp = act.icon;
                return (
                  <button
                    key={act.name}
                    onClick={() =>
                      handleAddNodeFromTemplate({
                        actionType: act.name,
                        category: 'action',
                        title: act.name,
                        description: act.name,
                        defaultParams: act.name === 'Search Color' ? '860, 440, 200, 200, #39FF14' : '50',
                        icon: IconComp,
                        color: act.color,
                        bg: '#141824',
                      })
                    }
                    style={{ borderColor: `${act.color}60` }}
                    className="h-8 px-2.5 rounded-xl bg-[#141824] hover:bg-[#1f283d] text-white font-bold text-xs flex items-center space-x-1.5 shrink-0 transition-all border cursor-pointer hover:scale-105 whitespace-nowrap"
                  >
                    <IconComp className="w-3.5 h-3.5" style={{ color: act.color }} />
                    <span>+ {act.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button
              onClick={() => {
                if (actionNodesScrollRef.current) {
                  actionNodesScrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
                }
              }}
              className="p-1 rounded-lg text-[#8892b0] hover:text-[#00e5ff] hover:bg-[#1f283d] transition-all cursor-pointer shrink-0 hidden sm:flex"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Center / Right: DAG Auto-Arrange, Zoom-to-fit, Alignment & View Tools */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Auto Arrange DAG */}
            <button
              onClick={handleAutoArrange}
              className="h-8 px-2.5 rounded-xl bg-[#141824] hover:bg-[#1f283d] text-[#39ff14] border border-[#39ff14]/40 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all"
              title="Auto-Arrange DAG Graph Structure"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Auto Arrange</span>
            </button>

            {/* Zoom to Fit */}
            <button
              onClick={handleZoomToFit}
              className="h-8 px-2.5 rounded-xl bg-[#141824] hover:bg-[#1f283d] text-[#00e5ff] border border-[#00e5ff]/40 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all"
              title="Zoom to Fit All Nodes (Focus View)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Fit All</span>
            </button>

            {/* Multi-Selection Alignment Controls (Only visible when >1 selected) */}
            {selectedNodeIds.size > 1 && (
              <div className="flex items-center space-x-1 bg-[#121520] px-2 py-0.5 rounded-xl border border-[#232d42]">
                <button
                  onClick={() => handleAlign('left')}
                  className="p-1 text-[#8892b0] hover:text-[#00e5ff] cursor-pointer"
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAlign('centerX')}
                  className="p-1 text-[#8892b0] hover:text-[#00e5ff] cursor-pointer"
                  title="Align Center X"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleAlign('right')}
                  className="p-1 text-[#8892b0] hover:text-[#00e5ff] cursor-pointer"
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDistribute('horizontal')}
                  className="p-1 text-[#8892b0] hover:text-[#39ff14] cursor-pointer"
                  title="Distribute Horizontally"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleGroupSelected}
                  className="p-1 text-[#8892b0] hover:text-[#a855f7] cursor-pointer"
                  title="Group Selected Nodes"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Canvas Navigation Tools */}
            <div className="flex items-center space-x-1.5 bg-[#121520] px-2.5 py-1 rounded-xl border border-[#232d42]">
              <button
                onClick={() => setIsPanToolActive((prev) => !prev)}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isPanToolActive || isSpacePressed
                    ? 'bg-[#00e5ff] text-black shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                    : 'text-[#8892b0] hover:text-white'
                }`}
                title="Pan Hand Tool (Hold Space or Drag Background)"
              >
                <Hand className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.15))}
                className="p-1.5 rounded-lg text-[#8892b0] hover:text-[#39ff14] hover:bg-[#1a2333] transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <span className="text-[11px] font-mono font-black text-[#39ff14] min-w-[36px] text-center">
                {(zoomLevel * 100).toFixed(0)}%
              </span>

              <button
                onClick={() => setZoomLevel((prev) => Math.max(0.3, prev - 0.15))}
                className="p-1.5 rounded-lg text-[#8892b0] hover:text-[#39ff14] hover:bg-[#1a2333] transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setPanOffset({ x: 0, y: 0 });
                  setZoomLevel(1.0);
                }}
                className="p-1.5 rounded-lg text-[#8892b0] hover:text-[#00e5ff] hover:bg-[#1a2333] transition-all cursor-pointer"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Render */}
      {workspaceMode === 'nodeGraph' && (
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onContextMenu={(e) => e.preventDefault()}
          className={`relative w-full h-[calc(100vh-230px)] min-h-[520px] max-h-[840px] bg-[#090b10] border-2 border-[#1f283d] rounded-2xl overflow-hidden shadow-2xl select-none overscroll-none ${
            isPanToolActive || isPanning || isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          }`}
          style={{
            backgroundImage: snapToGrid
              ? 'radial-gradient(circle, #1a2336 1.2px, transparent 1.2px)'
              : 'none',
            backgroundSize: `${GRID_SIZE * zoomLevel}px ${GRID_SIZE * zoomLevel}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
          }}
        >
          {/* Toast Notification Banner */}
          {inspectorToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#0a0f1d]/95 border-2 border-[#00e5ff] text-[#00e5ff] font-mono text-xs font-extrabold rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.4)] backdrop-blur-md flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>{inspectorToast}</span>
            </div>
          )}

          {/* Marquee Selection Box Overlay */}
          {marqueeBox && (
            <div
              className="absolute pointer-events-none border-2 border-[#00e5ff] bg-[#00e5ff]/10 z-30"
              style={{
                left: `${Math.min(marqueeBox.startX, marqueeBox.currentX) * zoomLevel + panOffset.x}px`,
                top: `${Math.min(marqueeBox.startY, marqueeBox.currentY) * zoomLevel + panOffset.y}px`,
                width: `${Math.abs(marqueeBox.currentX - marqueeBox.startX) * zoomLevel}px`,
                height: `${Math.abs(marqueeBox.currentY - marqueeBox.startY) * zoomLevel}px`,
              }}
            />
          )}

          {/* Floating Radar Minimap HUD */}
          <RadarMinimap
            nodes={nodes}
            selectedNodeIds={selectedNodeIds}
            executingStepIndex={nodes.findIndex((n) => n.id === executingNodeId)}
            panOffset={panOffset}
            zoomLevel={zoomLevel}
            canvasDimensions={canvasDimensions}
            onNavigateToNode={(n) => {
              const newPanX = canvasDimensions.width / 2 - (n.positionX + 110) * zoomLevel;
              const newPanY = canvasDimensions.height / 2 - (n.positionY + 45) * zoomLevel;
              setPanOffset({ x: newPanX, y: newPanY });
              setSelectedNodeIds(new Set([n.id]));
            }}
            onPanToPosition={(wx, wy) => {
              setPanOffset({
                x: canvasDimensions.width / 2 - wx * zoomLevel,
                y: canvasDimensions.height / 2 - wy * zoomLevel,
              });
            }}
            lang={lang}
          />

          {/* Transform Container for Infinite Pan & Zoom */}
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: '0 0',
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: isPanToolActive || isPanning || isSpacePressed ? 'none' : 'auto',
            }}
          >
            {/* Render Visual Groups */}
            {groups.map((grp) => (
              <div
                key={grp.id}
                style={{
                  left: `${grp.x}px`,
                  top: `${grp.y}px`,
                  width: `${grp.width}px`,
                  height: `${grp.height}px`,
                  borderColor: `${grp.color}40`,
                  backgroundColor: `${grp.color}08`,
                }}
                className="macro-group-box absolute rounded-2xl border-2 border-dashed z-0 pointer-events-auto flex flex-col p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase font-mono" style={{ color: grp.color }}>
                    {grp.title}
                  </span>
                  <button
                    onClick={() => setGroups((prev) => prev.filter((g) => g.id !== grp.id))}
                    className="p-1 text-[#8892b0] hover:text-[#ff4444] cursor-pointer"
                  >
                    <FolderMinus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* SVG Canvas for Smooth Bezier Curves Wire Rendering */}
            <svg className="absolute inset-0 w-[6000px] h-[6000px] pointer-events-none z-0 overflow-visible">
              {/* Render Existing Node Connections */}
              {nodes.map((sourceNode) => {
                const wires: React.ReactNode[] = [];
                const styleConfig = ACTION_COLORS[sourceNode.actionType] || { border: '#00e5ff' };

                // Standard nextNodes wires
                sourceNode.nextNodes.forEach((targetId) => {
                  const targetNode = nodes.find((n) => n.id === targetId);
                  if (!targetNode) return;

                  const x1 = sourceNode.positionX + 220;
                  const y1 = sourceNode.positionY + 36;
                  const x2 = targetNode.positionX;
                  const y2 = targetNode.positionY + 36;

                  const dx = Math.abs(x2 - x1) * 0.5 + 40;
                  const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                  const isActiveWire = executingNodeId === sourceNode.id;

                  wires.push(
                    <g key={`next-${sourceNode.id}-${targetId}`}>
                      <path d={pathD} fill="none" stroke={styleConfig.border} strokeWidth="6" strokeOpacity="0.2" />
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isActiveWire ? '#39ff14' : styleConfig.border}
                        strokeWidth="2.5"
                        strokeDasharray={isActiveWire ? '6 3' : 'none'}
                        className={isActiveWire ? 'animate-pulse' : ''}
                      />
                    </g>
                  );
                });

                // Condition TRUE Branch wire
                if (sourceNode.conditionBranch?.trueNodeId) {
                  const targetNode = nodes.find((n) => n.id === sourceNode.conditionBranch!.trueNodeId);
                  if (targetNode) {
                    const x1 = sourceNode.positionX + 220;
                    const y1 = sourceNode.positionY + 54;
                    const x2 = targetNode.positionX;
                    const y2 = targetNode.positionY + 36;
                    const dx = Math.abs(x2 - x1) * 0.5 + 40;
                    const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                    wires.push(
                      <g key={`true-${sourceNode.id}-${targetNode.id}`}>
                        <path d={pathD} fill="none" stroke="#39ff14" strokeWidth="5" strokeOpacity="0.25" />
                        <path d={pathD} fill="none" stroke="#39ff14" strokeWidth="2.5" />
                      </g>
                    );
                  }
                }

                // Condition FALSE Branch wire
                if (sourceNode.conditionBranch?.falseNodeId) {
                  const targetNode = nodes.find((n) => n.id === sourceNode.conditionBranch!.falseNodeId);
                  if (targetNode) {
                    const x1 = sourceNode.positionX + 220;
                    const y1 = sourceNode.positionY + 72;
                    const x2 = targetNode.positionX;
                    const y2 = targetNode.positionY + 36;
                    const dx = Math.abs(x2 - x1) * 0.5 + 40;
                    const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                    wires.push(
                      <g key={`false-${sourceNode.id}-${targetNode.id}`}>
                        <path d={pathD} fill="none" stroke="#ff4444" strokeWidth="5" strokeOpacity="0.25" />
                        <path d={pathD} fill="none" stroke="#ff4444" strokeWidth="2.5" />
                      </g>
                    );
                  }
                }

                return wires;
              })}

              {/* Live Dragging Wire Draft */}
              {connectingSourceId && wireDraft && (
                <g>
                  {(() => {
                    const src = nodes.find((n) => n.id === connectingSourceId);
                    if (!src) return null;
                    const x1 = src.positionX + 220;
                    const y1 = src.positionY + 36;
                    const x2 = wireDraft.x;
                    const y2 = wireDraft.y;
                    const dx = Math.abs(x2 - x1) * 0.5 + 40;
                    const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
                    return (
                      <>
                        <path d={pathD} fill="none" stroke="#00e5ff" strokeWidth="6" strokeOpacity="0.3" />
                        <path d={pathD} fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeDasharray="5 3" className="animate-pulse" />
                      </>
                    );
                  })()}
                </g>
              )}
            </svg>

            {/* Render Nodes in World Coordinates */}
            {nodes.map((node) => {
              const isSelected = selectedNodeIds.has(node.id);
              const isExecuting = executingNodeId === node.id;
              const isConnecting = connectingSourceId === node.id;
              const styleConfig = ACTION_COLORS[node.actionType] || {
                border: '#00e5ff',
                glow: 'rgba(0,229,255,0.4)',
                text: '#00e5ff',
                bg: '#14252e',
                dot: '#00e5ff',
              };

              const isCondition = node.actionType === 'Condition (If)' || node.actionType === 'Compare';

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  style={{
                    left: `${node.positionX}px`,
                    top: `${node.positionY}px`,
                    borderColor: isExecuting ? '#39ff14' : isSelected ? '#00e5ff' : styleConfig.border,
                    boxShadow: isExecuting
                      ? '0 0 30px rgba(57,255,20,0.8)'
                      : isSelected
                      ? '0 0 20px rgba(0,229,255,0.5)'
                      : `0 0 12px ${styleConfig.glow}`,
                    opacity: node.disabled ? 0.5 : 1,
                  }}
                  className={`macro-node-card absolute w-56 rounded-xl bg-[#0b0e17]/95 border-2 backdrop-blur-md z-10 transition-shadow select-none ${
                    isConnecting ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  {/* Left Incoming Port Socket */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connectingSourceId && connectingSourceId !== node.id) {
                        handleConnectPort(connectingSourceId, connectingBranchType, node.id);
                      }
                    }}
                    className={`absolute -left-2.5 top-9 w-4 h-4 rounded-full border-2 border-[#1f283d] bg-[#090b10] hover:bg-[#00e5ff] hover:scale-125 transition-all cursor-pointer z-20 flex items-center justify-center ${
                      connectingSourceId && connectingSourceId !== node.id ? 'animate-bounce border-[#00e5ff] bg-[#00e5ff]/30' : ''
                    }`}
                    title="Input Port (Connect incoming wire here)"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  {/* Right Outgoing Port Socket (Next) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setConnectingSourceId(isConnecting ? null : node.id);
                      setConnectingBranchType('next');
                    }}
                    className={`absolute -right-2.5 top-9 w-4 h-4 rounded-full border-2 border-[#1f283d] bg-[#090b10] hover:bg-[#00e5ff] hover:scale-125 transition-all cursor-pointer z-20 flex items-center justify-center ${
                      isConnecting && connectingBranchType === 'next' ? 'ring-2 ring-yellow-400 bg-yellow-400' : ''
                    }`}
                    title="Output Port (Drag or click to wire to next node)"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
                  </div>

                  {/* Node Header */}
                  <div
                    className="px-3 py-2 rounded-t-lg flex items-center justify-between border-b border-[#1b2538] cursor-move"
                    style={{ backgroundColor: styleConfig.bg }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: styleConfig.dot }} />
                      <span className="font-extrabold text-xs text-white tracking-wide truncate max-w-[110px]">
                        {node.title || node.actionType}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingNode(node);
                        }}
                        className="p-1 rounded text-[#8892b0] hover:text-[#00e5ff] hover:bg-black/30 transition-colors cursor-pointer"
                        title="Edit Node Settings & Branches"
                      >
                        <Settings2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                        className="p-1 rounded text-[#8892b0] hover:text-[#ff0055] hover:bg-black/30 transition-colors cursor-pointer"
                        title="Delete Node"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Node Parameters Input */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[#8892b0] font-mono">
                      <span>Parameters:</span>
                      {node.comment && (
                        <span title={node.comment} className="text-[#a855f7] cursor-help">
                          <MessageSquare className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={node.parameters}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNodes((prev) => prev.map((n) => (n.id === node.id ? { ...n, parameters: val } : n)));
                      }}
                      className="w-full px-2 py-1 rounded bg-[#05070c] text-[#00e5ff] font-mono text-xs border border-[#1b2538] focus:border-[#00e5ff] outline-none"
                    />

                    {/* Conditional Branch Ports */}
                    {isCondition && (
                      <div className="flex items-center justify-between pt-1 border-t border-[#1b2538] text-[10px] font-bold">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConnectingSourceId(node.id);
                            setConnectingBranchType('true');
                          }}
                          className="px-2 py-0.5 rounded bg-[#142914] text-[#39ff14] border border-[#39ff14]/40 hover:bg-[#1a3d1a] cursor-pointer"
                        >
                          TRUE &rarr;
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConnectingSourceId(node.id);
                            setConnectingBranchType('false');
                          }}
                          className="px-2 py-0.5 rounded bg-[#2a1414] text-[#ff4444] border border-[#ff4444]/40 hover:bg-[#3d1818] cursor-pointer"
                        >
                          FALSE &rarr;
                        </button>
                      </div>
                    )}

                    {/* Incoming Wire Attachment Button if connecting */}
                    {connectingSourceId && connectingSourceId !== node.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnectPort(connectingSourceId, connectingBranchType, node.id);
                        }}
                        className="w-full py-1 rounded bg-[#162b16] hover:bg-[#224422] text-[#39ff14] border border-[#39ff14] font-bold text-[10px] flex items-center justify-center space-x-1 cursor-pointer animate-pulse"
                      >
                        <Check className="w-3 h-3" />
                        <span>Attach ({connectingBranchType})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Block Coding Workspace (Sketchware Architecture) */}
      {workspaceMode === 'blockCoding' && (
        <div className="space-y-2">
          {/* Under Construction Red Alert Warning Banner */}
          <div className="bg-gradient-to-r from-red-950/95 via-red-900/90 to-red-950/95 border-2 border-red-500/80 rounded-2xl p-3 sm:p-4 shadow-[0_0_25px_rgba(239,68,68,0.3)] flex flex-wrap items-center justify-between gap-3 text-white">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-red-200 flex items-center gap-2 flex-wrap">
                  <span>⚠️ সতর্কতা: ব্লক কোডিং এখনো আন্ডার কনস্ট্রাকশনে (Under Construction) রয়েছে!</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/30 text-red-300 font-mono uppercase tracking-wider border border-red-500/50">
                    Experimental
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-red-300/85 mt-0.5">
                  এটি এখনো সম্পূর্ণভাবে প্রস্তুত নয়। ব্যবহার না করার পরামর্শ দেওয়া হচ্ছে অথবা ব্যবহার করলেও কাঙ্ক্ষিত ফলাফল নাও পেতে পারেন।
                </p>
              </div>
            </div>

            <button
              onClick={() => setWorkspaceMode('nodeGraph')}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center space-x-1.5 shadow-[0_0_12px_rgba(239,68,68,0.5)] cursor-pointer transition-all hover:scale-105 shrink-0"
              title="Return to safe Node Graph mode"
            >
              <Grid className="w-4 h-4 text-white" />
              <span>↩️ ফিরে যান Node Graph-এ</span>
            </button>
          </div>

          <div className="w-full h-[calc(100vh-300px)] min-h-[540px] max-h-[820px] rounded-2xl overflow-hidden border-2 border-[#1f283d] shadow-2xl">
            <BlockCodingWorkspace
              blocks={blocks}
              onUpdateBlocks={setBlocks}
              variables={variables}
              onUpdateVariables={setVariables}
              customBlocks={customBlocks}
              onUpdateCustomBlocks={setCustomBlocks}
              snapshots={versionSnapshots}
              onCreateSnapshot={handleCreateSnapshot}
              onRestoreSnapshot={handleRestoreSnapshot}
              onDeleteSnapshot={handleDeleteSnapshot}
              onAutoSaveTrigger={handleAutoSave}
            />
          </div>
        </div>
      )}

      {/* Action Library Drawer */}
      <BlockLibraryDrawer
        isOpen={isBlockLibraryOpen}
        onClose={() => setIsBlockLibraryOpen(false)}
        onSelectBlock={handleAddNodeFromTemplate}
        customActions={customActions}
        onOpenCrafter={() => {
          setIsBlockLibraryOpen(false);
          setIsCrafterOpen(true);
        }}
        lang={lang}
      />

      {/* Node Properties Inspector Drawer */}
      <NodePropertiesDrawer
        isOpen={inspectingNode !== null}
        onClose={() => setInspectingNode(null)}
        node={inspectingNode}
        allNodes={nodes}
        onUpdateNode={(updated) => {
          setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
          setInspectingNode(updated);
        }}
        onDeleteNode={(id) => {
          handleDeleteNode(id);
          setInspectingNode(null);
        }}
        onDuplicateNode={(nodeToDup) => {
          handleDuplicateSelectedNodes();
        }}
        onOpenSnipper={onOpenSnipper}
      />

      {/* Variables Manager Modal */}
      <VariablesModal
        isOpen={isVariablesModalOpen}
        onClose={() => setIsVariablesModalOpen(false)}
        variables={variables}
        onSaveVariables={(updated) => {
          setVariables(updated);
          setInspectorToast('Saved runtime variables.');
          setTimeout(() => setInspectorToast(null), 1500);
        }}
      />

      {/* Action Crafter Studio Modal */}
      <ActionCrafterModal
        isOpen={isCrafterOpen}
        onClose={() => setIsCrafterOpen(false)}
        onSaveAction={async (action) => {
          setCustomActions((prev) => [...prev, action]);
          try {
            await api.saveCustomAction(action);
          } catch (e) {
            console.error(e);
          }
          onLog(`[Crafter] Registered & saved custom action '${action.name}' to /data/custom_actions.json`);
        }}
      />

      {/* Hidden File Input for JSON Graph Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFileSelected}
      />

      {/* INTEGRATED TEST SIMULATION CONSOLE */}
      <TestSimulationConsole
        logs={executionLogs}
        isSimulating={isMacroRunning}
        onStartSimulation={handleRunSimulation}
        onStopSimulation={handleStopSimulation}
        onClearLogs={() => setExecutionLogs([])}
        lang={lang}
      />

      {/* ADD TO MACRO LIBRARY BUTTON */}
      {onExportToLibrary && (
        <div className="mt-3">
          <button
            id="btn-visual-add-to-library"
            onClick={handleExportToLibrary}
            className="w-full h-12 rounded-xl bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border-2 border-[#39ff14] font-black text-xs flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(57,255,20,0.3)] cursor-pointer transition-all hover:scale-[1.01]"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>{isBn ? '➕ ম্যাক্রো লাইব্রেরিতে যুক্ত করুন' : '➕ Add to Macro Library'}</span>
          </button>
        </div>
      )}

      {/* Clear Graph Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearConfirmOpen}
        title={isBn ? 'গ্রাফ সম্পূর্ণ মুছে ফেলতে চান?' : 'Clear All Graph Nodes?'}
        message={
          isBn
            ? 'আপনি কি নিশ্চিত যে ক্যানভাসের সমস্ত নোড মুছে ফেলতে চান? ক্যানভাসটি সম্পূর্ণ পরিষ্কার হয়ে যাবে।'
            : 'Are you sure you want to clear all nodes on canvas? This will make the canvas completely empty.'
        }
        type="danger"
        confirmText={isBn ? 'হ্যাঁ, ক্লিয়ার করুন' : 'Yes, Clear All'}
        cancelText={isBn ? 'বাতিল' : 'Cancel'}
        onConfirm={async () => {
          pushHistory(nodes);
          setNodes([]);
          setSelectedNodeIds(new Set());
          setGroups([]);
          setIsClearConfirmOpen(false);
          await onSaveGraph([]);
          setInspectorToast(isBn ? 'গ্রাফ ক্লিয়ার ও সেভ হয়েছে!' : 'Graph cleared and saved!');
          setTimeout(() => setInspectorToast(null), 2000);
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />

      {/* Preset Macro Templates Library Modal */}
      <MacroTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onApplyTemplate={(templateNodes, mode) => {
          pushHistory(nodes);
          if (mode === 'replace') {
            setNodes(templateNodes);
          } else {
            setNodes((prev) => [...prev, ...templateNodes]);
          }
        }}
        currentGraphNodes={nodes}
        lang={lang}
      />

      {/* User Manual & Shortcuts Cheat-Sheet Modal */}
      <UserManualModal
        isOpen={isManualGuideOpen}
        onClose={() => setIsManualGuideOpen(false)}
        lang={lang}
      />

      {/* Block Coding 3-Step Under Construction Confirmation Modal */}
      <BlockUnderConstructionModal
        isOpen={isConstructionModalOpen}
        onClose={() => {
          setIsConstructionModalOpen(false);
          setWorkspaceMode('nodeGraph');
        }}
        onConfirmAccess={() => {
          setIsConstructionModalOpen(false);
          setWorkspaceMode('blockCoding');
        }}
        lang={lang}
      />
    </div>
  );
};
