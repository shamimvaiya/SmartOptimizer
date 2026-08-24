import React, { useState, useRef, useEffect } from 'react';
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
  ClipboardPaste,
  Crop,
  Check,
  Palette,
  Copy,
  Layers,
  Code2,
  Zap,
  Boxes,
  MoveDown,
  ChevronRight,
  Terminal,
  Cpu,
  Sliders,
} from 'lucide-react';
import { ActionType, MacroNode, SnipData } from '../types';
import { parseSnipData, readFromClipboard } from '../utils/serialization';
import { transpileGraphToCSharp, transpileBlocksToCSharp } from '../utils/scriptTranspiler';
import { ActionCrafterModal, CustomActionDefinition } from './ActionCrafterModal';

interface VisualMacroStudioProps {
  initialGraph: MacroNode[];
  onSaveGraph: (graph: MacroNode[]) => Promise<void>;
  onRunMacro: (graph: MacroNode[]) => Promise<void>;
  onStopMacro: () => Promise<void>;
  isMacroRunning: boolean;
  onLog: (msg: string) => void;
  activeSnip: SnipData | null;
  onOpenSnipper: () => void;
}

const ACTION_COLORS: Record<
  string,
  { border: string; glow: string; text: string; bg: string; dot: string }
> = {
  'Event (Start)': { border: '#eab308', glow: 'rgba(234, 179, 8, 0.4)', text: '#eab308', bg: '#231d0a', dot: '#eab308' },
  'Search Color': { border: '#39ff14', glow: 'rgba(57, 255, 20, 0.4)', text: '#39ff14', bg: '#142914', dot: '#39ff14' },
  'Move Mouse': { border: '#00e5ff', glow: 'rgba(0, 229, 255, 0.4)', text: '#00e5ff', bg: '#14252e', dot: '#00e5ff' },
  'Click Mouse': { border: '#2979ff', glow: 'rgba(41, 121, 255, 0.4)', text: '#2979ff', bg: '#151e2e', dot: '#2979ff' },
  'Press Key': { border: '#d500f9', glow: 'rgba(213, 0, 249, 0.4)', text: '#d500f9', bg: '#25142b', dot: '#d500f9' },
  Delay: { border: '#ffd600', glow: 'rgba(255, 214, 0, 0.4)', text: '#ffd600', bg: '#292514', dot: '#ffd600' },
  'ADB Tap': { border: '#00e676', glow: 'rgba(0, 230, 118, 0.4)', text: '#00e676', bg: '#132b1f', dot: '#00e676' },
  'ADB Shell': { border: '#00b4d8', glow: 'rgba(0, 180, 216, 0.4)', text: '#00b4d8', bg: '#142830', dot: '#00b4d8' },
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
  initialGraph,
  onSaveGraph,
  onRunMacro,
  onStopMacro,
  isMacroRunning,
  onLog,
  activeSnip,
  onOpenSnipper,
}) => {
  // Mode State: Node Graph vs Block Coding vs C# Preview
  const [workspaceMode, setWorkspaceMode] = useState<'nodeGraph' | 'blockCoding' | 'csharpView'>('nodeGraph');

  const [nodes, setNodes] = useState<MacroNode[]>(
    initialGraph.length > 0
      ? initialGraph
      : [
          {
            id: 'node_1',
            actionType: 'Search Color',
            parameters: '860, 440, 200, 200, #39FF14',
            positionX: 80,
            positionY: 80,
            nextNodes: ['node_2'],
          },
          {
            id: 'node_2',
            actionType: 'Move Mouse',
            parameters: '960, 540, true',
            positionX: 360,
            positionY: 80,
            nextNodes: ['node_3'],
          },
          {
            id: 'node_3',
            actionType: 'Click Mouse',
            parameters: 'left',
            positionX: 640,
            positionY: 80,
            nextNodes: ['node_4'],
          },
          {
            id: 'node_4',
            actionType: 'Delay',
            parameters: '50',
            positionX: 920,
            positionY: 80,
            nextNodes: [],
          },
        ]
  );

  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<MacroNode | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [executingStepIndex, setExecutingStepIndex] = useState<number | null>(null);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [inspectorToast, setInspectorToast] = useState<string | null>(null);

  // Custom Actions Registry (Action Crafter)
  const [customActions, setCustomActions] = useState<CustomActionDefinition[]>([]);
  const [isCrafterOpen, setIsCrafterOpen] = useState<boolean>(false);

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sketchware Block System State
  const [blocks, setBlocks] = useState<SketchwareBlock[]>([
    {
      id: 'blk_1',
      category: 'Vision',
      title: 'If Color Found (#39FF14)',
      color: '#39ff14',
      parameters: { x: '860', y: '440', w: '200', h: '200', color: '#39FF14' },
      hasContainerSlot: true,
      childBlocks: [
        {
          id: 'blk_2',
          category: 'Input',
          title: 'Human Click (Left)',
          color: '#2979ff',
          parameters: { button: 'left', jitterPx: '3' },
        },
      ],
    },
    {
      id: 'blk_3',
      category: 'ADB',
      title: 'ADB Tap Coords',
      color: '#00e676',
      parameters: { x: '960', y: '540' },
    },
    {
      id: 'blk_4',
      category: 'Loops',
      title: 'Delay (ms)',
      color: '#ffd600',
      parameters: { delayMs: '50' },
    },
  ]);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync graph updates when initialGraph changes
  useEffect(() => {
    if (initialGraph && initialGraph.length > 0) {
      setNodes(initialGraph);
    }
  }, [initialGraph]);

  // Simulation execution loop
  useEffect(() => {
    let timer: any = null;
    if (isMacroRunning && nodes.length > 0) {
      let currentIdx = 0;
      setExecutingStepIndex(0);

      timer = setInterval(() => {
        currentIdx = (currentIdx + 1) % nodes.length;
        setExecutingStepIndex(currentIdx);
        const node = nodes[currentIdx];
        if (node) {
          onLog(`[Macro Step ${currentIdx + 1}] Executing: ${node.actionType} (${node.parameters})`);
        }
      }, 450);
    } else {
      setExecutingStepIndex(null);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isMacroRunning, nodes, onLog]);

  // Keyboard Shortcuts (Ctrl+C, Ctrl+V)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedNodeIds.size > 0) {
          e.preventDefault();
          handleCopySelectedNodes();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePasteFromClipboard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeIds, nodes]);

  // Copy Selected Nodes to Clipboard with AIMOPT_CLIP| header
  const handleCopySelectedNodes = () => {
    const nodesToCopy = nodes.filter((n) => selectedNodeIds.has(n.id));
    if (nodesToCopy.length === 0) return;

    const payload = {
      version: '3.0',
      nodes: nodesToCopy,
    };
    const serializedString = `AIMOPT_CLIP|${JSON.stringify(payload)}`;
    navigator.clipboard.writeText(serializedString);

    setInspectorToast(`Copied ${nodesToCopy.length} node(s) with AIMOPT_CLIP header!`);
    onLog(`[Clipboard] Serialized & copied ${nodesToCopy.length} node(s) to system clipboard.`);
    setTimeout(() => setInspectorToast(null), 2500);
  };

  // Paste Nodes from Clipboard with AIMOPT_CLIP| header
  const handlePasteFromClipboard = async () => {
    try {
      const rawText = await readFromClipboard();
      if (!rawText || !rawText.startsWith('AIMOPT_CLIP|')) {
        // Fallback: Check if snip data or general JSON
        const snip = parseSnipData(rawText);
        if (snip) {
          const newNode: MacroNode = {
            id: `node_${Date.now()}`,
            actionType: 'Search Color',
            parameters: `${snip.x}, ${snip.y}, ${snip.width}, ${snip.height}, ${snip.colorHex || '#39FF14'}`,
            positionX: 180,
            positionY: 180,
            nextNodes: [],
          };
          setNodes((prev) => [...prev, newNode]);
          onLog(`[Paste] Created Snipped Search Color Node from clipboard.`);
          return;
        }
        setInspectorToast('Clipboard does not contain valid AIMOPT_CLIP| node data');
        setTimeout(() => setInspectorToast(null), 2500);
        return;
      }

      const jsonStr = rawText.replace('AIMOPT_CLIP|', '');
      const parsed = JSON.parse(jsonStr);

      if (!parsed.nodes || !Array.isArray(parsed.nodes)) return;

      const idMap: Record<string, string> = {};
      const newNodes: MacroNode[] = parsed.nodes.map((oldNode: MacroNode, idx: number) => {
        const newId = `node_pasted_${Date.now()}_${idx}`;
        idMap[oldNode.id] = newId;
        return {
          ...oldNode,
          id: newId,
          positionX: oldNode.positionX + 50,
          positionY: oldNode.positionY + 50,
        };
      });

      // Update nextNodes pointers
      newNodes.forEach((node) => {
        node.nextNodes = node.nextNodes.map((oldId) => idMap[oldId] || oldId);
      });

      setNodes((prev) => [...prev, ...newNodes]);
      setSelectedNodeIds(new Set(newNodes.map((n) => n.id)));
      setInspectorToast(`Pasted ${newNodes.length} node(s) successfully!`);
      onLog(`[Paste] Deserialized & pasted ${newNodes.length} node(s) from clipboard.`);
      setTimeout(() => setInspectorToast(null), 2500);
    } catch (err) {
      console.error('Paste error:', err);
      setInspectorToast('Error pasting node graph data');
      setTimeout(() => setInspectorToast(null), 2500);
    }
  };

  // Node Drag handlers with Snap-to-Grid
  const handleNodeMouseDown = (e: React.MouseEvent, node: MacroNode) => {
    if (
      (e.target as HTMLElement).tagName === 'BUTTON' ||
      (e.target as HTMLElement).tagName === 'SELECT' ||
      (e.target as HTMLElement).tagName === 'INPUT'
    ) {
      return;
    }

    if (e.shiftKey) {
      // Toggle multi-select
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
      x: e.clientX - node.positionX,
      y: e.clientY - node.positionY,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      let rawX = Math.max(10, e.clientX - dragOffset.x);
      let rawY = Math.max(10, e.clientY - dragOffset.y);

      if (snapToGrid) {
        rawX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
        rawY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;
      }

      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, positionX: rawX, positionY: rawY } : n))
      );
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNodeId(null);
  };

  const handleAddNode = (actionType: ActionType | string = 'Search Color') => {
    const newId = `node_${Date.now()}`;
    let defaultParam = '860, 440, 200, 200, #39FF14';
    if (actionType === 'Move Mouse') defaultParam = '960, 540, true';
    if (actionType === 'Click Mouse') defaultParam = 'left';
    if (actionType === 'Press Key') defaultParam = 'R';
    if (actionType === 'Delay') defaultParam = '50';
    if (actionType === 'ADB Tap') defaultParam = '960, 540';
    if (actionType === 'ADB Shell') defaultParam = 'input keyevent 4';

    // Check if custom action
    const matchedCustom = customActions.find((c) => c.name === actionType);
    if (matchedCustom) {
      defaultParam = matchedCustom.defaultParameters;
    }

    const lastNode = nodes[nodes.length - 1];
    let newX = lastNode ? lastNode.positionX + 260 : 80;
    let newY = lastNode ? lastNode.positionY : 100;

    if (snapToGrid) {
      newX = Math.round(newX / GRID_SIZE) * GRID_SIZE;
      newY = Math.round(newY / GRID_SIZE) * GRID_SIZE;
    }

    const newNode: MacroNode = {
      id: newId,
      actionType: actionType as any,
      parameters: defaultParam,
      positionX: newX > 1100 ? 80 : newX,
      positionY: newX > 1100 ? (lastNode ? lastNode.positionY + 140 : 100) : newY,
      nextNodes: [],
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeIds(new Set([newId]));
    onLog(`[Macro] Added node: ${actionType}`);
  };

  const handleToggleConnection = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === sourceId) {
          const exists = n.nextNodes.includes(targetId);
          const updatedNext = exists
            ? n.nextNodes.filter((id) => id !== targetId)
            : [...n.nextNodes, targetId];
          return { ...n, nextNodes: updatedNext };
        }
        return n;
      })
    );

    setConnectingSourceId(null);
    onLog(`[Macro Wire] Connected node ${sourceId} -> ${targetId}`);
  };

  const handleDeleteNode = (id: string) => {
    setNodes((prev) =>
      prev
        .filter((n) => n.id !== id)
        .map((n) => ({ ...n, nextNodes: n.nextNodes.filter((targetId) => targetId !== id) }))
    );
    setSelectedNodeIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleUpdateNodeParam = (id: string, newParam: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, parameters: newParam } : n)));
  };

  const handleSave = async () => {
    await onSaveGraph(nodes);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  // Add Block to Sketchware Block System
  const handleAddBlock = (category: 'Vision' | 'Input' | 'Loops' | 'Logic' | 'ADB' | 'Custom') => {
    const newBlock: SketchwareBlock = {
      id: `blk_${Date.now()}`,
      category,
      title: `${category} Block (${Date.now().toString().slice(-4)})`,
      color:
        category === 'Vision'
          ? '#39ff14'
          : category === 'Input'
          ? '#2979ff'
          : category === 'Loops'
          ? '#ffd600'
          : category === 'Logic'
          ? '#a855f7'
          : '#00e676',
      parameters: { target: 'Auto' },
      hasContainerSlot: category === 'Vision' || category === 'Loops' || category === 'Logic',
      childBlocks: [],
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
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
              <span>Visual Macro &amp; Logic Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#162b16] text-[#39ff14] border border-[#39ff14]/50 font-mono">
                AIM/OPT Pro v3.0
              </span>
            </h2>
            <p className="text-xs text-[#8892b0]">
              Full Drag-and-Drop Node Graph, Scratch/Sketchware Block System &amp; Action Crafter
            </p>
          </div>
        </div>

        {/* Center Workspace Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-[#090b10] border border-[#1f283d] space-x-1">
          <button
            onClick={() => setWorkspaceMode('nodeGraph')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              workspaceMode === 'nodeGraph'
                ? 'bg-[#00e5ff] text-black shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'text-[#8892b0] hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Node Graph</span>
          </button>

          <button
            onClick={() => setWorkspaceMode('blockCoding')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              workspaceMode === 'blockCoding'
                ? 'bg-[#39ff14] text-black shadow-[0_0_12px_rgba(57,255,20,0.4)]'
                : 'text-[#8892b0] hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Block Coding (Sketchware)</span>
          </button>

          <button
            onClick={() => setWorkspaceMode('csharpView')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              workspaceMode === 'csharpView'
                ? 'bg-[#a855f7] text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'text-[#8892b0] hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>C# Transpiled Code</span>
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-2">
          {/* Action Crafter Button */}
          <button
            onClick={() => setIsCrafterOpen(true)}
            className="h-9 px-3 rounded-xl bg-[#1d122b] hover:bg-[#2e1c45] text-[#a855f7] border border-[#a855f7]/60 font-black text-xs flex items-center space-x-1.5 cursor-pointer transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)]"
            title="Create Custom Action via Action Crafter Studio"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Action Crafter</span>
          </button>

          {/* Copy Selected Nodes */}
          {workspaceMode === 'nodeGraph' && (
            <button
              onClick={handleCopySelectedNodes}
              disabled={selectedNodeIds.size === 0}
              className="h-9 px-3 rounded-xl bg-[#14232e] hover:bg-[#1a3245] text-[#00e5ff] border border-[#00e5ff]/50 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Copy Selected Nodes to Clipboard with AIMOPT_CLIP| header"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          )}

          {/* Paste Nodes */}
          {workspaceMode === 'nodeGraph' && (
            <button
              onClick={handlePasteFromClipboard}
              className="h-9 px-3 rounded-xl bg-[#142914] hover:bg-[#1e3d1e] text-[#39ff14] border border-[#39ff14]/50 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all"
              title="Paste Nodes from Clipboard (AIMOPT_CLIP| or Snip)"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          )}

          {/* Run / Stop Execution Button */}
          {isMacroRunning ? (
            <button
              onClick={() => onStopMacro()}
              className="h-9 px-4 rounded-xl bg-[#ff0055] hover:bg-[#d60047] text-white font-extrabold text-xs flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(255,0,85,0.4)] transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Execution</span>
            </button>
          ) : (
            <button
              onClick={() => onRunMacro(nodes)}
              className="h-9 px-4 rounded-xl bg-[#39ff14] hover:bg-[#32e012] text-black font-extrabold text-xs flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Macro</span>
            </button>
          )}

          {/* Save Graph */}
          <button
            onClick={handleSave}
            className="h-9 px-3.5 rounded-xl bg-[#102414] hover:bg-[#17381e] text-[#39ff14] border border-[#39ff14] font-black text-xs flex items-center space-x-1.5 cursor-pointer transition-all shadow-[0_0_10px_rgba(57,255,20,0.2)]"
          >
            {savedFeedback ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedFeedback ? 'Saved!' : 'Save Graph'}</span>
          </button>
        </div>
      </div>

      {/* Horizontal Mouse-Wheel Scrollable Action Nodes Palette Bar */}
      <div className="bg-[#0e1017] rounded-2xl p-3 border border-[#1f283d] shadow-lg flex items-center space-x-2">
        <span className="text-[11px] font-extrabold text-[#00e5ff] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          <span>Action Nodes:</span>
        </span>

        {/* Horizontal Mouse Wheel Scroll Container */}
        <div
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
          className="flex items-center space-x-2 overflow-x-auto py-1 px-1 scrollbar-thin scrollbar-thumb-[#1f283d] scrollbar-track-transparent select-none cursor-grab active:cursor-grabbing w-full"
        >
          {[
            { name: 'Search Color', color: '#39ff14', icon: Eye },
            { name: 'Move Mouse', color: '#00e5ff', icon: MousePointer },
            { name: 'Click Mouse', color: '#2979ff', icon: MousePointer },
            { name: 'Press Key', color: '#d500f9', icon: Keyboard },
            { name: 'Delay', color: '#ffd600', icon: Clock },
            { name: 'ADB Tap', color: '#00e676', icon: Smartphone },
            { name: 'ADB Shell', color: '#00b4d8', icon: Terminal },
            { name: 'Script Block', color: '#a855f7', icon: Code2 },
          ].map((act) => {
            const IconComp = act.icon;
            return (
              <button
                key={act.name}
                onClick={() => handleAddNode(act.name)}
                style={{ borderColor: `${act.color}60` }}
                className="h-8 px-3 rounded-xl bg-[#141824] hover:bg-[#1f283d] text-white font-bold text-xs flex items-center space-x-1.5 shrink-0 transition-all border cursor-pointer hover:scale-105"
              >
                <IconComp className="w-3.5 h-3.5" style={{ color: act.color }} />
                <span>+ {act.name}</span>
              </button>
            );
          })}

          {/* Render Custom Actions Created via Crafter */}
          {customActions.map((cust) => (
            <button
              key={cust.id}
              onClick={() => handleAddNode(cust.name)}
              style={{ borderColor: cust.color }}
              className="h-8 px-3 rounded-xl bg-[#1a1428] hover:bg-[#271d3c] text-white font-black text-xs flex items-center space-x-1.5 shrink-0 transition-all border cursor-pointer hover:scale-105 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: cust.color }} />
              <span>+ {cust.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Render */}
      {workspaceMode === 'nodeGraph' && (
        <div
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="relative w-full h-[620px] bg-[#090b10] border-2 border-[#1f283d] rounded-2xl overflow-hidden shadow-2xl select-none"
          style={{
            backgroundImage: snapToGrid
              ? 'radial-gradient(circle, #1a2336 1px, transparent 1px)'
              : 'none',
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          }}
        >
          {/* Toast Notification Banner */}
          {inspectorToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#0a0f1d]/95 border-2 border-[#00e5ff] text-[#00e5ff] font-mono text-xs font-extrabold rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.4)] backdrop-blur-md flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>{inspectorToast}</span>
            </div>
          )}

          {/* SVG Canvas for Smooth Bezier Curves Wire Rendering */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {nodes.map((sourceNode) =>
              sourceNode.nextNodes.map((targetId) => {
                const targetNode = nodes.find((n) => n.id === targetId);
                if (!targetNode) return null;

                const x1 = sourceNode.positionX + 220;
                const y1 = sourceNode.positionY + 42;
                const x2 = targetNode.positionX;
                const y2 = targetNode.positionY + 42;

                const dx = Math.abs(x2 - x1) * 0.5 + 40;
                const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                const styleConfig = ACTION_COLORS[sourceNode.actionType] || {
                  border: '#00e5ff',
                  glow: 'rgba(0,229,255,0.4)',
                };

                return (
                  <g key={`${sourceNode.id}-${targetId}`}>
                    {/* Glowing Wire Backdrop */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={styleConfig.border}
                      strokeWidth="5"
                      strokeOpacity="0.25"
                    />
                    {/* Main Bezier Wire */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={styleConfig.border}
                      strokeWidth="2.5"
                      strokeDasharray={isMacroRunning ? '6 3' : 'none'}
                      className={isMacroRunning ? 'animate-pulse' : ''}
                    />
                  </g>
                );
              })
            )}
          </svg>

          {/* Render Nodes */}
          {nodes.map((node, index) => {
            const isSelected = selectedNodeIds.has(node.id);
            const isExecuting = executingStepIndex === index;
            const isConnecting = connectingSourceId === node.id;
            const styleConfig = ACTION_COLORS[node.actionType] || {
              border: '#00e5ff',
              glow: 'rgba(0,229,255,0.4)',
              text: '#00e5ff',
              bg: '#14252e',
              dot: '#00e5ff',
            };

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                style={{
                  left: `${node.positionX}px`,
                  top: `${node.positionY}px`,
                  borderColor: isExecuting ? '#39ff14' : isSelected ? '#00e5ff' : styleConfig.border,
                  boxShadow: isExecuting
                    ? '0 0 25px rgba(57,255,20,0.6)'
                    : isSelected
                    ? '0 0 20px rgba(0,229,255,0.5)'
                    : `0 0 12px ${styleConfig.glow}`,
                }}
                className={`absolute w-56 rounded-xl bg-[#0b0e17]/95 border-2 backdrop-blur-md z-10 transition-shadow select-none ${
                  isConnecting ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                {/* Node Header */}
                <div
                  className="px-3 py-2 rounded-t-lg flex items-center justify-between border-b border-[#1b2538] cursor-move"
                  style={{ backgroundColor: styleConfig.bg }}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: styleConfig.dot }}
                    />
                    <span className="font-extrabold text-xs text-white tracking-wide truncate max-w-[120px]">
                      {node.actionType}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingSourceId(isConnecting ? null : node.id);
                      }}
                      className={`p-1 rounded hover:bg-black/30 transition-colors cursor-pointer ${
                        isConnecting ? 'text-yellow-400' : 'text-[#8892b0]'
                      }`}
                      title="Wire connector"
                    >
                      <Zap className="w-3 h-3" />
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

                {/* Node Parameters Input Field */}
                <div className="p-3 space-y-2">
                  <label className="text-[10px] text-[#8892b0] font-mono font-bold block">
                    Parameters:
                  </label>
                  <input
                    type="text"
                    value={node.parameters}
                    onChange={(e) => handleUpdateNodeParam(node.id, e.target.value)}
                    className="w-full px-2 py-1 rounded bg-[#05070c] text-[#00e5ff] font-mono text-xs border border-[#1b2538] focus:border-[#00e5ff] outline-none"
                  />

                  {/* Incoming Connection Port Target Button */}
                  {connectingSourceId && connectingSourceId !== node.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleConnection(connectingSourceId, node.id);
                      }}
                      className="w-full py-1 rounded bg-[#162b16] hover:bg-[#224422] text-[#39ff14] border border-[#39ff14] font-bold text-[10px] flex items-center justify-center space-x-1 cursor-pointer animate-pulse"
                    >
                      <Check className="w-3 h-3" />
                      <span>Attach Wire Here</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Block Coding Workspace (Scratch/Sketchware Style) */}
      {workspaceMode === 'blockCoding' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[620px]">
          {/* Block Palette Sidebar */}
          <div className="bg-[#0e1017] rounded-2xl p-4 border border-[#1f283d] shadow-xl space-y-4">
            <h3 className="text-xs font-black text-[#39ff14] uppercase tracking-wider flex items-center gap-2">
              <Boxes className="w-4 h-4" />
              <span>Block Palette</span>
            </h3>

            <div className="space-y-2">
              {(['Vision', 'Input', 'Loops', 'Logic', 'ADB', 'Custom'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleAddBlock(cat)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#141824] hover:bg-[#1f283d] text-left text-xs font-bold text-white flex items-center justify-between border border-[#232d42] transition-all cursor-pointer hover:border-[#39ff14]"
                >
                  <span>+ Add {cat} Block</span>
                  <Plus className="w-3.5 h-3.5 text-[#39ff14]" />
                </button>
              ))}
            </div>
          </div>

          {/* Interlocking Block Drag-and-Drop Workspace */}
          <div className="md:col-span-3 bg-[#090b10] rounded-2xl p-6 border-2 border-[#1f283d] shadow-2xl space-y-3 min-h-[620px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1f283d] pb-3 mb-4">
              <span className="text-xs font-extrabold text-white flex items-center gap-2">
                <span>Interlocking Block Sequence</span>
                <span className="text-[10px] text-[#8892b0] font-mono">({blocks.length} blocks active)</span>
              </span>
              <span className="text-[11px] text-[#39ff14] font-mono font-bold">Vertical Snapping Enabled</span>
            </div>

            {blocks.map((blk, idx) => (
              <div
                key={blk.id}
                style={{ borderColor: blk.color }}
                className="p-4 rounded-2xl bg-[#0e121e] border-2 shadow-lg space-y-3 relative group transition-all"
              >
                {/* Block Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-black"
                      style={{ backgroundColor: blk.color }}
                    >
                      {blk.category}
                    </span>
                    <strong className="text-sm font-black text-white">{blk.title}</strong>
                  </div>
                  <button
                    onClick={() => handleDeleteBlock(blk.id)}
                    className="p-1 text-[#8892b0] hover:text-[#ff0055] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Parameters Bar */}
                <div className="flex items-center space-x-2 text-xs font-mono">
                  {Object.entries(blk.parameters).map(([k, v]) => (
                    <div key={k} className="flex items-center space-x-1 bg-[#06080d] px-2 py-1 rounded border border-[#1b2538]">
                      <span className="text-[#8892b0]">{k}:</span>
                      <span className="text-[#00e5ff] font-bold">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Nested Container Slot if Condition/Loop */}
                {blk.hasContainerSlot && (
                  <div className="mt-2 p-3 rounded-xl bg-[#05070a] border border-dashed border-[#232d42] space-y-2">
                    <span className="text-[10px] font-bold text-[#8892b0] uppercase tracking-wider block">
                      Inside Container Slot (Executes if matched):
                    </span>
                    {blk.childBlocks && blk.childBlocks.length > 0 ? (
                      blk.childBlocks.map((c) => (
                        <div
                          key={c.id}
                          className="p-2.5 rounded-lg bg-[#101422] border border-[#2979ff] text-xs font-bold text-white flex items-center justify-between"
                        >
                          <span>{c.title}</span>
                          <span className="text-[10px] text-[#00e5ff] font-mono">Action Child</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-[#64748b] italic">Drop or snap nested blocks inside here...</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C# Transpiled Code Preview View */}
      {workspaceMode === 'csharpView' && (
        <div className="bg-[#090b10] rounded-2xl p-6 border-2 border-[#1f283d] shadow-2xl space-y-4 font-mono text-xs text-[#ccd6f6]">
          <div className="flex items-center justify-between border-b border-[#1f283d] pb-3">
            <span className="font-extrabold text-[#39ff14] text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>C# Production Script Output (.NET 8 Roslyn Engine)</span>
            </span>
            <span className="text-[11px] text-[#8892b0]">Real-time synchronized from active Node Graph &amp; Block Workspace</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-bold text-[#00e5ff] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5" />
                <span>1. Node Graph Transpiled C# Class:</span>
              </div>
              <pre className="p-4 rounded-xl bg-[#05070c] border border-[#1b2538] leading-relaxed overflow-x-auto text-[#00e5ff]">
                <code>{transpileGraphToCSharp(nodes)}</code>
              </pre>
            </div>

            <div>
              <div className="text-[11px] font-bold text-[#39ff14] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5" />
                <span>2. Interlocking Block Transpiled C# Script:</span>
              </div>
              <pre className="p-4 rounded-xl bg-[#05070c] border border-[#1b2538] leading-relaxed overflow-x-auto text-[#39ff14]">
                <code>{transpileBlocksToCSharp(blocks)}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Action Crafter Studio Modal */}
      <ActionCrafterModal
        isOpen={isCrafterOpen}
        onClose={() => setIsCrafterOpen(false)}
        onSaveAction={(action) => {
          setCustomActions((prev) => [...prev, action]);
          onLog(`[Crafter] Registered custom action '${action.name}'`);
        }}
      />
    </div>
  );
};
