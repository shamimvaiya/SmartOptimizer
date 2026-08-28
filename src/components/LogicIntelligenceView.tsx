import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  RefreshCw,
  Code2,
  Eye,
  Sliders,
  Disc,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Upload,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Target,
  Clock,
  Terminal,
  Activity,
  Maximize2,
  ShieldCheck,
  Shield,
  MousePointer2,
  Save,
  FolderOpen,
  Trash2,
  FileDown,
  FileUp,
  Repeat,
  FileJson,
  Search,
  Tag,
  Filter,
  Check,
  FileText,
  Bookmark,
  RotateCcw,
  Scissors,
  HelpCircle,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  PresetProfile,
  MacroNode,
  VisualProcessingConfig,
  HumanizerConfig,
  MultiImageTarget,
  GhostMacroFile,
  GhostMacroEvent,
  ScriptExecutionResult,
} from '../types';
import { GraphNavigator, NavigatorStepResult } from '../utils/graphNavigator';
import {
  DEFAULT_HUMANIZER_CONFIG,
  generateHumanPath,
  getHumanClickPoint,
  randomizeDelay,
  TrajectoryPoint,
} from '../utils/humanizer';
import { executeMultiImageSearch, scaleRegionCoordinates } from '../utils/visualEngine';
import {
  transpileGraphToCSharp,
  transpileGraphToJavaScript,
  executeInSandbox,
} from '../utils/scriptTranspiler';
import { GhostLoopRecorder } from '../utils/ghostMacroRecorder';

const DEFAULT_SAMPLE_MACROS: GhostMacroFile[] = [
  {
    id: 'macro_sample_1',
    name: '⚡ Auto Fast Crouch-Shoot Loop',
    description: 'Rapid crouch spam sequence synced with left click burst fires.',
    tags: ['FPS', 'Combat', 'Anti-Recoil'],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    totalDurationMs: 840,
    eventsCount: 14,
    screenResolution: { width: 1920, height: 1080 },
    events: [
      { id: 'e1', type: 'keydown', timestampMs: 0, key: 'c' },
      { id: 'e2', type: 'mousedown', timestampMs: 45, button: 'left', x: 960, y: 540 },
      { id: 'e3', type: 'mouseup', timestampMs: 120, button: 'left', x: 960, y: 540 },
      { id: 'e4', type: 'keyup', timestampMs: 160, key: 'c' },
      { id: 'e5', type: 'mousemove', timestampMs: 220, x: 960, y: 544, deltaX: 0, deltaY: 4 },
      { id: 'e6', type: 'keydown', timestampMs: 290, key: 'c' },
      { id: 'e7', type: 'mousedown', timestampMs: 340, button: 'left', x: 960, y: 544 },
      { id: 'e8', type: 'mouseup', timestampMs: 410, button: 'left', x: 960, y: 544 },
      { id: 'e9', type: 'keyup', timestampMs: 460, key: 'c' },
      { id: 'e10', type: 'mousemove', timestampMs: 530, x: 960, y: 548, deltaX: 0, deltaY: 4 },
      { id: 'e11', type: 'keydown', timestampMs: 600, key: 'c' },
      { id: 'e12', type: 'mousedown', timestampMs: 650, button: 'left', x: 960, y: 548 },
      { id: 'e13', type: 'mouseup', timestampMs: 730, button: 'left', x: 960, y: 548 },
      { id: 'e14', type: 'keyup', timestampMs: 840, key: 'c' },
    ],
  },
  {
    id: 'macro_sample_2',
    name: '🎯 180° Snap-Turn & Jump Flick',
    description: 'Instant 180-degree quick turn with jump cancel for defensive evasions.',
    tags: ['Movement', 'Flick', 'Evasion'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    totalDurationMs: 620,
    eventsCount: 11,
    screenResolution: { width: 1920, height: 1080 },
    events: [
      { id: 'e1', type: 'keydown', timestampMs: 0, key: ' ' },
      { id: 'e2', type: 'mousemove', timestampMs: 30, x: 1020, y: 540, deltaX: 60, deltaY: 0 },
      { id: 'e3', type: 'mousemove', timestampMs: 70, x: 1120, y: 540, deltaX: 100, deltaY: 0 },
      { id: 'e4', type: 'mousemove', timestampMs: 120, x: 1260, y: 540, deltaX: 140, deltaY: 0 },
      { id: 'e5', type: 'mousemove', timestampMs: 180, x: 1420, y: 540, deltaX: 160, deltaY: 0 },
      { id: 'e6', type: 'mousemove', timestampMs: 240, x: 1540, y: 540, deltaX: 120, deltaY: 0 },
      { id: 'e7', type: 'keyup', timestampMs: 300, key: ' ' },
      { id: 'e8', type: 'mousedown', timestampMs: 380, button: 'right', x: 1540, y: 540 },
      { id: 'e9', type: 'mousedown', timestampMs: 440, button: 'left', x: 1540, y: 540 },
      { id: 'e10', type: 'mouseup', timestampMs: 510, button: 'left', x: 1540, y: 540 },
      { id: 'e11', type: 'mouseup', timestampMs: 560, button: 'right', x: 1540, y: 540 },
    ],
  },
  {
    id: 'macro_sample_3',
    name: '🎒 Rapid Quad-Loot Tap Routine',
    description: 'Instantaneous 4-slot loot pickup sequence with micro randomized delay.',
    tags: ['Looting', 'Inventory', 'Fast-Tap'],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    totalDurationMs: 480,
    eventsCount: 8,
    screenResolution: { width: 1920, height: 1080 },
    events: [
      { id: 'e1', type: 'keydown', timestampMs: 0, key: 'f' },
      { id: 'e2', type: 'keyup', timestampMs: 40, key: 'f' },
      { id: 'e3', type: 'keydown', timestampMs: 120, key: 'f' },
      { id: 'e4', type: 'keyup', timestampMs: 160, key: 'f' },
      { id: 'e5', type: 'keydown', timestampMs: 240, key: 'f' },
      { id: 'e6', type: 'keyup', timestampMs: 280, key: 'f' },
      { id: 'e7', type: 'keydown', timestampMs: 360, key: 'f' },
      { id: 'e8', type: 'keyup', timestampMs: 400, key: 'f' },
    ],
  },
];

interface LogicIntelligenceViewProps {
  activePreset: PresetProfile;
  onSavePreset: (preset: PresetProfile) => Promise<void>;
  onLog: (message: string, level?: 'info' | 'success' | 'warning' | 'error' | 'macro') => void;
}

export const LogicIntelligenceView: React.FC<LogicIntelligenceViewProps> = ({
  activePreset,
  onSavePreset,
  onLog,
}) => {
  const [activeTab, setActiveTab] = useState<
    'navigator' | 'scripting' | 'vision' | 'humanizer' | 'ghost'
  >('navigator');

  // Humanizer Config State
  const [humanizerConfig, setHumanizerConfig] = useState<HumanizerConfig>(DEFAULT_HUMANIZER_CONFIG);

  // Navigator Engine State
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [navigatorRunning, setNavigatorRunning] = useState<boolean>(false);
  const [stepLatencyMap, setStepLatencyMap] = useState<Record<string, number>>({});
  const [liveVariables, setLiveVariables] = useState<Record<string, any>>({
    mouseX: 960,
    mouseY: 540,
    foundX: 960,
    foundY: 540,
    matchScore: 0.95,
  });
  const navigatorRef = useRef<GraphNavigator | null>(null);

  // Scripting System State
  const [scriptLanguage, setScriptLanguage] = useState<'csharp' | 'javascript'>('csharp');
  const [scriptCode, setScriptCode] = useState<string>('');
  const [scriptExecuting, setScriptExecuting] = useState<boolean>(false);
  const [scriptResult, setScriptResult] = useState<ScriptExecutionResult | null>(null);

  // Visual Processing State
  const [visualConfig, setVisualConfig] = useState<VisualProcessingConfig>(
    activePreset.visualProcessing || {
      captureRegionX: 860,
      captureRegionY: 440,
      captureRegionWidth: 200,
      captureRegionHeight: 200,
      colorTolerance: 15,
      sensitivity: 88,
      enableGrayscale: false,
      enableMultiImageSearch: true,
      multiImageTargets: [
        { id: 't1', name: 'Crosshair Center', confidence: 0.92, priority: 1 },
        { id: 't2', name: 'Enemy Red Silhouette', confidence: 0.85, priority: 2 },
        { id: 't3', name: 'Loot Marker Icon', confidence: 0.88, priority: 3 },
      ],
      baseResolution: { width: 1920, height: 1080 },
      currentResolution: { width: 2560, height: 1440 },
      autoScaleCoords: true,
      captureIntervalMs: 16,
    }
  );
  const [visionTestResult, setVisionTestResult] = useState<any>(null);
  const [isSearchingVision, setIsSearchingVision] = useState<boolean>(false);

  // Humanizer Canvas Test State
  const [trajectoryStart, setTrajectoryStart] = useState({ x: 150, y: 320 });
  const [trajectoryEnd, setTrajectoryEnd] = useState({ x: 650, y: 120 });
  const [testTrajectory, setTestTrajectory] = useState<TrajectoryPoint[]>([]);
  const trajectoryCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ghost Loop Recorder State
  const [ghostRecorder] = useState<GhostLoopRecorder>(() => new GhostLoopRecorder());
  const [isRecordingGhost, setIsRecordingGhost] = useState<boolean>(false);
  const [isPlayingGhost, setIsPlayingGhost] = useState<boolean>(false);
  const [recordedMacro, setRecordedMacro] = useState<GhostMacroFile | null>(() => DEFAULT_SAMPLE_MACROS[0]);
  const [liveEventStream, setLiveEventStream] = useState<GhostMacroEvent[]>(() => DEFAULT_SAMPLE_MACROS[0].events);
  const [ghostSpeed, setGhostSpeed] = useState<number>(1.0);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [jsonModalContent, setJsonModalContent] = useState<string>('');

  // Ghost Loop Library, File Upload & Save State
  const [savedMacros, setSavedMacros] = useState<GhostMacroFile[]>(() => {
    try {
      const stored = localStorage.getItem('aimopt_saved_ghost_macros');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_SAMPLE_MACROS;
    } catch (e) {
      return DEFAULT_SAMPLE_MACROS;
    }
  });
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveMacroName, setSaveMacroName] = useState<string>('');
  const [saveMacroDescription, setSaveMacroDescription] = useState<string>('');
  const [saveMacroTags, setSaveMacroTags] = useState<string>('Custom, FPS');
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [macroSearchQuery, setMacroSearchQuery] = useState<string>('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('All');
  const [ghostSubTab, setGhostSubTab] = useState<'recorder' | 'library'>('recorder');
  const [loopCountSetting, setLoopCountSetting] = useState<number>(1); // 1, 3, 5, 10, -1 for Infinity
  const [currentLoopIteration, setCurrentLoopIteration] = useState<number>(1);
  const [loopDelayMs, setLoopDelayMs] = useState<number>(200);
  const [playbackStatusText, setPlaybackStatusText] = useState<string>('IDLE');

  const ghostFileInputRef = useRef<HTMLInputElement | null>(null);
  const ghostCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPlayingGhostRef = useRef<boolean>(false);

  // Sync saved macros to localStorage
  const saveMacrosToStorage = (macros: GhostMacroFile[]) => {
    setSavedMacros(macros);
    try {
      localStorage.setItem('aimopt_saved_ghost_macros', JSON.stringify(macros));
    } catch (e) {
      console.error('Failed to save macros to localStorage', e);
    }
  };

  // Synchronize script code when nodes change
  useEffect(() => {
    if (activePreset.macroGraph) {
      if (scriptLanguage === 'csharp') {
        setScriptCode(transpileGraphToCSharp(activePreset.macroGraph));
      } else {
        setScriptCode(transpileGraphToJavaScript(activePreset.macroGraph));
      }
    }
  }, [activePreset.macroGraph, scriptLanguage]);

  // Update Bézier test trajectory whenever config or endpoints change
  useEffect(() => {
    const path = generateHumanPath(trajectoryStart, trajectoryEnd, humanizerConfig, 36);
    setTestTrajectory(path);
  }, [trajectoryStart, trajectoryEnd, humanizerConfig]);

  // Render Bézier curve visualizer on canvas
  useEffect(() => {
    const canvas = trajectoryCanvasRef.current;
    if (!canvas || testTrajectory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw straight baseline (linear robotic path for contrast)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(trajectoryStart.x, trajectoryStart.y);
    ctx.lineTo(trajectoryEnd.x, trajectoryEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Humanized Bézier Curve with gradient
    const gradient = ctx.createLinearGradient(
      trajectoryStart.x,
      trajectoryStart.y,
      trajectoryEnd.x,
      trajectoryEnd.y
    );
    gradient.addColorStop(0, '#39FF14');
    gradient.addColorStop(0.5, '#00E5FF');
    gradient.addColorStop(1, '#FF0055');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(testTrajectory[0].x, testTrajectory[0].y);
    for (let i = 1; i < testTrajectory.length; i++) {
      ctx.lineTo(testTrajectory[i].x, testTrajectory[i].y);
    }
    ctx.stroke();

    // Draw micro-jitter points & velocity dots
    testTrajectory.forEach((pt, idx) => {
      if (idx === 0 || idx === testTrajectory.length - 1) return;
      ctx.fillStyle = idx % 3 === 0 ? '#00E5FF' : 'rgba(57, 255, 20, 0.7)';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2 + pt.velocity * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Start anchor
    ctx.fillStyle = '#39FF14';
    ctx.beginPath();
    ctx.arc(trajectoryStart.x, trajectoryStart.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(trajectoryStart.x, trajectoryStart.y, 2, 0, Math.PI * 2);
    ctx.fill();

    // End anchor & target ring
    ctx.fillStyle = '#FF0055';
    ctx.beginPath();
    ctx.arc(trajectoryEnd.x, trajectoryEnd.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FF0055';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(trajectoryEnd.x, trajectoryEnd.y, 14, 0, Math.PI * 2);
    ctx.stroke();
  }, [testTrajectory, trajectoryStart, trajectoryEnd]);

  // Handle Graph Navigator Execution
  const handleRunGraph = async () => {
    if (navigatorRunning) {
      navigatorRef.current?.stop();
      setNavigatorRunning(false);
      return;
    }

    setNavigatorRunning(true);
    setActiveNodeId(null);
    setStepLatencyMap({});

    const navigator = new GraphNavigator(activePreset.macroGraph || [], humanizerConfig);
    navigatorRef.current = navigator;

    onLog('[Logic Engine] Initializing Visual Execution Graph Navigator...', 'macro');

    await navigator.runGraph(
      (nodeId, stepIndex, stepResult) => {
        setActiveNodeId(nodeId);
        setStepLatencyMap((prev) => ({
          ...prev,
          [nodeId]: stepResult.executionTimeMs,
        }));
        setLiveVariables(stepResult.outputVariables);
      },
      (msg) => onLog(msg, 'macro')
    );

    setNavigatorRunning(false);
    setActiveNodeId(null);
  };

  // Handle Script Execution
  const handleRunScript = async () => {
    setScriptExecuting(true);
    onLog(`[Script Runtime] Compiling and executing ${scriptLanguage.toUpperCase()} code...`, 'info');

    const result = await executeInSandbox(scriptCode, scriptLanguage);
    setScriptResult(result);
    setScriptExecuting(false);

    if (result.success) {
      onLog(
        `[Script Runtime] Execution succeeded in ${result.executionTimeMs}ms`,
        'success'
      );
    } else {
      onLog(`[Script Runtime] Execution error occurred`, 'error');
    }
  };

  // Handle Multi-Image Search Test
  const handleTestVisionSearch = async () => {
    setIsSearchingVision(true);
    const result = await executeMultiImageSearch(
      visualConfig.multiImageTargets || [],
      visualConfig
    );
    setVisionTestResult(result);
    setIsSearchingVision(false);

    if (result.matched) {
      onLog(
        `[Vision Search] Matched target '${result.targetName}' at (${result.x}, ${result.y}) [Confidence: ${Math.round(result.confidence * 100)}%, Latency: ${result.executionTimeMs}ms]`,
        'success'
      );
    } else {
      onLog('[Vision Search] No matching target detected within confidence threshold', 'warning');
    }
  };

  // Render Ghost Path on Canvas
  useEffect(() => {
    const canvas = ghostCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Cyber Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const events = recordedMacro?.events || liveEventStream;
    if (!events || events.length === 0) return;

    // Filter points with coordinates
    const points = events.filter((ev) => ev.x !== undefined && ev.y !== undefined);

    if (points.length > 1) {
      const getX = (p: GhostMacroEvent) => {
        const rawX = p.x || 0;
        return rawX > canvas.width ? (rawX / 1920) * canvas.width : rawX;
      };
      const getY = (p: GhostMacroEvent) => {
        const rawY = p.y || 0;
        return rawY > canvas.height ? (rawY / 1080) * canvas.height : rawY;
      };

      // Draw Gradient Path Line
      ctx.beginPath();
      ctx.moveTo(getX(points[0]), getY(points[0]));
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(getX(points[i]), getY(points[i]));
      }
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw trajectory dots and click markers
      points.forEach((p, idx) => {
        const px = getX(p);
        const py = getY(p);
        if (p.type === 'mousemove') {
          ctx.fillStyle = idx % 4 === 0 ? '#39FF14' : 'rgba(0, 229, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'mousedown') {
          ctx.fillStyle = '#FF0055';
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FF0055';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, 11, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '10px monospace';
          ctx.fillText(p.button === 'right' ? 'R-CLICK' : 'L-CLICK', px + 12, py + 3);
        }
      });

      // Start Marker
      ctx.fillStyle = '#39FF14';
      ctx.beginPath();
      ctx.arc(getX(points[0]), getY(points[0]), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // End Marker
      const last = points[points.length - 1];
      ctx.fillStyle = '#FF0055';
      ctx.beginPath();
      ctx.arc(getX(last), getY(last), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FF0055';
      ctx.beginPath();
      ctx.arc(getX(last), getY(last), 12, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [recordedMacro, liveEventStream]);

  // Handle Ghost Loop Recording
  const handleStartGhostRecording = () => {
    ghostRecorder.startRecording();
    setIsRecordingGhost(true);
    setRecordedMacro(null);
    setLiveEventStream([]);
    setPlaybackStatusText('REC (RECORDING)');
    onLog('[Ghost Loop] 🔴 Recording started. Move mouse and press keys on the capture pad...', 'macro');
  };

  const handleStopGhostRecording = () => {
    const macroFile = ghostRecorder.stopRecording();
    setIsRecordingGhost(false);
    setRecordedMacro(macroFile);
    setLiveEventStream(macroFile.events);
    setPlaybackStatusText('IDLE (READY)');
    onLog(
      `[Ghost Loop] ⏹️ Recording stopped. Captured ${macroFile.eventsCount} events (${macroFile.totalDurationMs}ms).`,
      'success'
    );
  };

  // Process and parse imported macro file (drag & drop or file picker)
  const processMacroFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const imported = ghostRecorder.importFromJson(text);
        if (!imported.events || !Array.isArray(imported.events)) {
          throw new Error('Invalid macro structure: missing events');
        }
        setRecordedMacro(imported);
        setLiveEventStream(imported.events);
        onLog(
          `[Ghost Loop] 📥 File loaded successfully: '${file.name}' (${imported.events.length} events, ${imported.totalDurationMs}ms)`,
          'success'
        );
      } catch (err: any) {
        onLog(`[Ghost Loop] ❌ Failed to parse file '${file.name}': ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  // Direct file download (.aimmacro or .json)
  const handleDirectDownload = (macro: GhostMacroFile, ext: 'aimmacro' | 'json' = 'aimmacro') => {
    try {
      const jsonStr = JSON.stringify(macro, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = (macro.name || 'ghost_macro')
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_');
      a.href = url;
      a.download = `${safeName}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onLog(`[Ghost Loop] 💾 Exported & downloaded '${a.download}'`, 'success');
    } catch (e: any) {
      onLog(`[Ghost Loop] ❌ Export error: ${e.message}`, 'error');
    }
  };

  // Save current macro to library
  const handleOpenSaveModal = () => {
    if (!recordedMacro && liveEventStream.length === 0) {
      onLog('[Ghost Loop] ⚠️ No macro recorded or loaded to save', 'warning');
      return;
    }
    setSaveMacroName(recordedMacro?.name || `Ghost_Loop_${new Date().toLocaleTimeString().replace(/:/g, '-')}`);
    setSaveMacroDescription(recordedMacro?.description || 'Custom recorded macro loop sequence.');
    setSaveMacroTags(recordedMacro?.tags?.join(', ') || 'Custom, FPS');
    setShowSaveModal(true);
  };

  const handleConfirmSaveMacro = () => {
    if (!saveMacroName.trim()) {
      onLog('[Ghost Loop] ⚠️ Please provide a macro name', 'warning');
      return;
    }

    const eventsToSave = recordedMacro?.events || liveEventStream;
    const totalDuration = recordedMacro?.totalDurationMs || 
      (eventsToSave.length > 0 ? eventsToSave[eventsToSave.length - 1].timestampMs : 0);

    const tagsArray = saveMacroTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newMacro: GhostMacroFile = {
      id: recordedMacro?.id || `macro_${Date.now()}`,
      name: saveMacroName.trim(),
      description: saveMacroDescription.trim(),
      tags: tagsArray.length > 0 ? tagsArray : ['Custom'],
      createdAt: new Date().toISOString(),
      totalDurationMs: totalDuration,
      eventsCount: eventsToSave.length,
      screenResolution: recordedMacro?.screenResolution || { width: 1920, height: 1080 },
      events: [...eventsToSave],
    };

    const existingIdx = savedMacros.findIndex((m) => m.id === newMacro.id);
    let updatedList: GhostMacroFile[];
    if (existingIdx >= 0) {
      updatedList = [...savedMacros];
      updatedList[existingIdx] = newMacro;
    } else {
      updatedList = [newMacro, ...savedMacros];
    }

    saveMacrosToStorage(updatedList);
    setRecordedMacro(newMacro);
    setShowSaveModal(false);
    onLog(`[Ghost Loop] 💾 Macro '${newMacro.name}' saved to Local Library!`, 'success');
  };

  // Load a saved macro from library
  const handleLoadSavedMacro = (macro: GhostMacroFile) => {
    setRecordedMacro(macro);
    setLiveEventStream(macro.events);
    setGhostSubTab('recorder');
    onLog(`[Ghost Loop] 📂 Loaded macro '${macro.name}' (${macro.eventsCount} events, ${macro.totalDurationMs}ms)`, 'info');
  };

  // Delete a saved macro from library
  const handleDeleteSavedMacro = (id: string) => {
    const macroToDelete = savedMacros.find((m) => m.id === id);
    const updated = savedMacros.filter((m) => m.id !== id);
    saveMacrosToStorage(updated);
    onLog(`[Ghost Loop] 🗑️ Deleted macro '${macroToDelete?.name || id}'`, 'info');
  };

  // Optimize & trim long idle pauses from recording
  const handleTrimPauses = () => {
    if (!recordedMacro || recordedMacro.events.length === 0) return;
    const events = [...recordedMacro.events];
    let offset = 0;
    const optimizedEvents: GhostMacroEvent[] = [];

    for (let i = 0; i < events.length; i++) {
      const current = { ...events[i] };
      if (i > 0) {
        const prevOriginal = events[i - 1];
        const gap = current.timestampMs - prevOriginal.timestampMs;
        if (gap > 350) {
          const cut = gap - 80;
          offset += cut;
        }
      }
      current.timestampMs = Math.max(0, current.timestampMs - offset);
      optimizedEvents.push(current);
    }

    const trimmedDuration = optimizedEvents[optimizedEvents.length - 1]?.timestampMs || 0;
    const updated: GhostMacroFile = {
      ...recordedMacro,
      totalDurationMs: trimmedDuration,
      events: optimizedEvents,
    };
    setRecordedMacro(updated);
    setLiveEventStream(optimizedEvents);
    onLog(
      `[Ghost Loop] ✂️ Optimized & trimmed idle pauses. Duration reduced to ${trimmedDuration}ms`,
      'success'
    );
  };

  // Playback with multi-loop support
  const handlePlayGhostMacro = async () => {
    if (!recordedMacro || recordedMacro.events.length === 0) return;

    if (isPlayingGhost) {
      isPlayingGhostRef.current = false;
      ghostRecorder.stopPlayback();
      setIsPlayingGhost(false);
      setPlaybackStatusText('IDLE');
      return;
    }

    setIsPlayingGhost(true);
    isPlayingGhostRef.current = true;
    setPlaybackProgress(0);

    const totalLoops = loopCountSetting === -1 ? 999999 : loopCountSetting;
    onLog(
      `[Ghost Loop Playback] ▶️ Starting loop run (Mode: ${
        loopCountSetting === -1 ? 'Infinite (∞)' : `${loopCountSetting}x`
      }, Speed: ${ghostSpeed}x)...`,
      'macro'
    );

    for (let iter = 1; iter <= totalLoops; iter++) {
      if (!isPlayingGhostRef.current) break;
      setCurrentLoopIteration(iter);
      setPlaybackStatusText(
        loopCountSetting === -1
          ? `PLAYING (LOOP ∞ - Cycle ${iter})`
          : `PLAYING (LOOP ${iter}/${loopCountSetting})`
      );

      await ghostRecorder.playMacro(
        recordedMacro,
        humanizerConfig,
        ghostSpeed,
        (progress) => {
          if (isPlayingGhostRef.current) {
            setPlaybackProgress(progress);
          }
        },
        (msg) => onLog(msg, 'macro')
      );

      if (iter < totalLoops && isPlayingGhostRef.current) {
        await new Promise((r) => setTimeout(r, loopDelayMs));
      }
    }

    setIsPlayingGhost(false);
    isPlayingGhostRef.current = false;
    setPlaybackProgress(100);
    setPlaybackStatusText('IDLE (FINISHED)');
    onLog(`[Ghost Loop Playback] 🏁 Playback sequence complete.`, 'success');
  };

  return (
    <div id="logic-intelligence-view" className="space-y-6">
      {/* Sub-Header Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="tab-navigator"
            onClick={() => setActiveTab('navigator')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'navigator'
                ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                : 'text-gray-400 hover:text-white hover:bg-dark-300 border border-transparent'
            }`}
          >
            <Activity className="h-4 w-4" />
            1. Execution Engine (Navigator)
          </button>

          <button
            id="tab-scripting"
            onClick={() => setActiveTab('scripting')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'scripting'
                ? 'bg-cyber-purple/15 text-purple-400 border border-cyber-purple/40 shadow-[0_0_15px_rgba(176,38,255,0.2)]'
                : 'text-gray-400 hover:text-white hover:bg-dark-300 border border-transparent'
            }`}
          >
            <Code2 className="h-4 w-4" />
            2. Hybrid Scripting (C# & JS)
          </button>

          <button
            id="tab-vision"
            onClick={() => setActiveTab('vision')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'vision'
                ? 'bg-cyber-green/15 text-cyber-green border border-cyber-green/40 shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                : 'text-gray-400 hover:text-white hover:bg-dark-300 border border-transparent'
            }`}
          >
            <Eye className="h-4 w-4" />
            3. Intelligent Vision (OpenCV)
          </button>

          <button
            id="tab-humanizer"
            onClick={() => setActiveTab('humanizer')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'humanizer'
                ? 'bg-cyber-yellow/15 text-cyber-yellow border border-cyber-yellow/40 shadow-[0_0_15px_rgba(255,230,0,0.2)]'
                : 'text-gray-400 hover:text-white hover:bg-dark-300 border border-transparent'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            4. 'Humanizer' Anti-Detect
          </button>

          <button
            id="tab-ghost"
            onClick={() => setActiveTab('ghost')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'ghost'
                ? 'bg-cyber-pink/15 text-cyber-pink border border-cyber-pink/40 shadow-[0_0_15px_rgba(255,0,85,0.2)]'
                : 'text-gray-400 hover:text-white hover:bg-dark-300 border border-transparent'
            }`}
          >
            <Disc className="h-4 w-4" />
            5. Ghost Loop Macro Recorder
          </button>
        </div>

        {/* Global Quick Badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-cyber-green/40 bg-cyber-green/10 px-3 py-1 text-xs font-mono text-cyber-green">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse"></span>
            ENGINE V3.0 READY
          </span>
        </div>
      </div>

      {/* TAB 1: VISUAL EXECUTION ENGINE (THE NAVIGATOR) */}
      {activeTab === 'navigator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Execution Controls & Pipeline */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-dark-200 p-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-cyber-cyan" />
                    GraphNavigator Pipeline
                  </h3>
                  <p className="text-xs text-gray-400">
                    Traverse Node Graph, pass variables, and benchmark per-node latency in real-time.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    id="btn-run-navigator"
                    onClick={handleRunGraph}
                    className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all shadow-lg ${
                      navigatorRunning
                        ? 'bg-cyber-pink text-white hover:bg-cyber-pink/80 shadow-[0_0_20px_rgba(255,0,85,0.4)]'
                        : 'bg-cyber-cyan text-dark-400 hover:bg-cyber-cyan/90 shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                    }`}
                  >
                    {navigatorRunning ? (
                      <>
                        <Square className="h-4 w-4 fill-current" />
                        Halt Engine
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" />
                        Run Sequence
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Node Sequence List with Real-time Glow & Latency */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Active Nodes Chain ({activePreset.macroGraph?.length || 0})
                  </span>
                  <span className="text-xs font-mono text-gray-500">
                    Execution Mode: Sequential Bézier Wire
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {activePreset.macroGraph?.map((node, index) => {
                    const isActive = activeNodeId === node.id;
                    const latency = stepLatencyMap[node.id];

                    return (
                      <div
                        key={node.id}
                        id={`node-card-${node.id}`}
                        className={`relative rounded-xl border p-4 transition-all duration-200 ${
                          isActive
                            ? 'border-cyber-green bg-cyber-green/10 shadow-[0_0_25px_rgba(57,255,20,0.35)] scale-[1.01]'
                            : latency !== undefined
                            ? 'border-gray-700 bg-dark-200/80'
                            : 'border-gray-800 bg-dark-200/40 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                                isActive
                                  ? 'bg-cyber-green text-dark-400'
                                  : 'bg-dark-300 text-gray-300'
                              }`}
                            >
                              {index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-sm">
                                  {node.actionType}
                                </span>
                                <span className="rounded bg-dark-300 px-1.5 py-0.5 font-mono text-[10px] text-gray-400">
                                  ID: {node.id}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">
                                {node.parameters || 'No parameters configured'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {latency !== undefined && (
                              <div className="flex items-center gap-1 rounded bg-dark-300/80 px-2 py-1 font-mono text-xs text-cyber-cyan border border-cyber-cyan/30">
                                <Clock className="h-3 w-3" />
                                {latency} ms
                              </div>
                            )}
                            {isActive ? (
                              <span className="flex items-center gap-1 text-xs font-mono text-cyber-green font-bold animate-pulse">
                                <Activity className="h-3.5 w-3.5" />
                                EXECUTING
                              </span>
                            ) : latency !== undefined ? (
                              <span className="flex items-center gap-1 text-xs font-mono text-green-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                DONE
                              </span>
                            ) : (
                              <span className="text-xs font-mono text-gray-600">QUEUED</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Real-time Runtime Variables & Graph State */}
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-800 bg-dark-200 p-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <Cpu className="h-4 w-4 text-cyber-cyan" />
                  Dynamic Variable Registry
                </h4>
                <p className="text-xs text-gray-400 mb-4">
                  Variables propagated down the Bézier execution chain from node to node.
                </p>

                <div className="space-y-2 font-mono text-xs">
                  {Object.entries(liveVariables).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-lg bg-dark-300 p-2.5 border border-gray-800"
                    >
                      <span className="text-cyber-cyan font-semibold">${key}</span>
                      <span className="text-cyber-green font-bold">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Latency Telemetry */}
              <div className="rounded-xl border border-gray-800 bg-dark-200 p-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-cyber-yellow" />
                  Execution Latency Benchmark
                </h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-dark-300 p-3 border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase">Total Steps</span>
                    <p className="text-lg font-bold font-mono text-white">
                      {activePreset.macroGraph?.length || 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-dark-300 p-3 border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase">Avg Latency / Node</span>
                    <p className="text-lg font-bold font-mono text-cyber-green">14.2 ms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HYBRID SCRIPTING SYSTEM (C# & JS) */}
      {activeTab === 'scripting' && (
        <div className="space-y-4">
          {/* Scripting Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-800 bg-dark-200 p-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Runtime Engine:
              </span>
              <div className="flex items-center rounded-lg bg-dark-300 p-1 border border-gray-700">
                <button
                  id="btn-lang-csharp"
                  onClick={() => setScriptLanguage('csharp')}
                  className={`rounded px-3 py-1 text-xs font-mono font-bold transition-all ${
                    scriptLanguage === 'csharp'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  C# (Roslyn Scripting)
                </button>
                <button
                  id="btn-lang-js"
                  onClick={() => setScriptLanguage('javascript')}
                  className={`rounded px-3 py-1 text-xs font-mono font-bold transition-all ${
                    scriptLanguage === 'javascript'
                      ? 'bg-cyber-yellow text-dark-400 shadow-md font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  JavaScript (ClearScript V8)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="btn-transpile-graph"
                onClick={() => {
                  if (scriptLanguage === 'csharp') {
                    setScriptCode(transpileGraphToCSharp(activePreset.macroGraph || []));
                  } else {
                    setScriptCode(transpileGraphToJavaScript(activePreset.macroGraph || []));
                  }
                  onLog(`[Transpiler] Generated fresh code from Node Graph`, 'info');
                }}
                className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-dark-300 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-dark-100 hover:text-white transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5 text-cyber-cyan" />
                Transpile Node Graph
              </button>

              <button
                id="btn-run-script"
                onClick={handleRunScript}
                disabled={scriptExecuting}
                className="flex items-center gap-2 rounded-lg bg-cyber-green px-5 py-2 text-xs font-bold text-dark-400 hover:bg-cyber-green/90 transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)] disabled:opacity-50"
              >
                {scriptExecuting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Execute Script
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Script Editor & Terminal Console Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Editor Area */}
            <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-dark-200 overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 bg-dark-300/60 px-4 py-2 text-xs font-mono text-gray-400">
                <span>{scriptLanguage === 'csharp' ? 'MacroScript.cs' : 'MacroScript.js'}</span>
                <span className="text-gray-500">Roslyn / ClearScript V8 Sandbox</span>
              </div>
              <textarea
                id="script-editor-textarea"
                value={scriptCode}
                onChange={(e) => setScriptCode(e.target.value)}
                rows={18}
                className="w-full bg-[#0d1117] p-4 font-mono text-xs text-gray-200 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Execution Console & Logs */}
            <div className="rounded-xl border border-gray-800 bg-dark-200 flex flex-col h-[460px]">
              <div className="flex items-center justify-between border-b border-gray-800 bg-dark-300/60 px-4 py-2 text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-cyber-green" />
                  Live Output Console
                </span>
                {scriptResult && (
                  <span
                    className={`font-bold ${
                      scriptResult.success ? 'text-cyber-green' : 'text-cyber-pink'
                    }`}
                  >
                    {scriptResult.executionTimeMs} ms
                  </span>
                )}
              </div>
              <div className="flex-1 bg-black/70 p-4 font-mono text-xs text-gray-300 overflow-y-auto space-y-1">
                {scriptResult ? (
                  scriptResult.logs.map((log, i) => (
                    <div
                      key={i}
                      className={
                        log.includes('Error')
                          ? 'text-cyber-pink'
                          : log.includes('Success') || log.includes('finished')
                          ? 'text-cyber-green'
                          : 'text-gray-300'
                      }
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-600 italic">
                    Press "Execute Script" to evaluate {scriptLanguage.toUpperCase()} logic in real-time...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTELLIGENT VISUAL PROCESSING (OPENCV) */}
      {activeTab === 'vision' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Multi-Image Target Management */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-gray-800 bg-dark-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-cyber-green" />
                      Multi-Image Search Matrix (Up to 5 Targets)
                    </h3>
                    <p className="text-xs text-gray-400">
                      Evaluates multiple templates simultaneously and locks onto the first match meeting confidence threshold.
                    </p>
                  </div>
                  <button
                    id="btn-test-vision"
                    onClick={handleTestVisionSearch}
                    disabled={isSearchingVision}
                    className="flex items-center gap-2 rounded-lg bg-cyber-green px-4 py-2 text-xs font-bold text-dark-400 hover:bg-cyber-green/90 transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)] disabled:opacity-50"
                  >
                    {isSearchingVision ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        Test Multi-Search
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  {(visualConfig.multiImageTargets || []).map((target, idx) => (
                    <div
                      key={target.id}
                      className="flex items-center justify-between rounded-lg border border-gray-800 bg-dark-300 p-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-dark-100 font-mono text-xs font-bold text-cyber-green">
                          #{target.priority}
                        </span>
                        <div>
                          <span className="font-semibold text-sm text-white">{target.name}</span>
                          <p className="text-[11px] font-mono text-gray-400">
                            Min Confidence: {Math.round(target.confidence * 100)}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-cyber-green/10 border border-cyber-green/30 px-2 py-0.5 text-[10px] font-mono text-cyber-green">
                          OpenCV Ready
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {visionTestResult && (
                  <div
                    className={`rounded-lg border p-4 font-mono text-xs ${
                      visionTestResult.matched
                        ? 'border-cyber-green/40 bg-cyber-green/10 text-cyber-green'
                        : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
                    }`}
                  >
                    <div className="font-bold mb-1">
                      {visionTestResult.matched
                        ? `Target Match: ${visionTestResult.targetName}`
                        : 'No Target Matched'}
                    </div>
                    <div>
                      Coords: ({visionTestResult.x}, {visionTestResult.y}) | Confidence:{' '}
                      {Math.round(visionTestResult.confidence * 100)}% | Latency:{' '}
                      {visionTestResult.executionTimeMs}ms
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Resolution Auto-Scaling Suite */}
              <div className="rounded-xl border border-gray-800 bg-dark-200 p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Maximize2 className="h-4 w-4 text-cyber-cyan" />
                  Dynamic Resolution Scaling Engine
                </h4>
                <p className="text-xs text-gray-400">
                  Auto-scales $(X, Y, W, H)$ if emulator window resolution or aspect ratio changes.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-dark-300 p-3 border border-gray-800">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">
                      Base Reference Resolution
                    </span>
                    <p className="text-sm font-mono text-white mt-1">1920 x 1080 (16:9)</p>
                  </div>
                  <div className="rounded-lg bg-dark-300 p-3 border border-gray-800">
                    <span className="text-[10px] text-cyber-cyan uppercase font-bold">
                      Current Emulator Window
                    </span>
                    <p className="text-sm font-mono text-cyber-cyan mt-1">2560 x 1440 (1.33x Scale)</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-dark-300/50 p-3 border border-gray-800 text-xs">
                  <span className="text-gray-300">Base Coords: [860, 440, 200, 200]</span>
                  <span className="font-mono font-bold text-cyber-green">
                    Scaled Output: [
                    {
                      scaleRegionCoordinates(
                        860,
                        440,
                        200,
                        200,
                        { width: 1920, height: 1080 },
                        { width: 2560, height: 1440 }
                      ).x
                    }
                    ,{' '}
                    {
                      scaleRegionCoordinates(
                        860,
                        440,
                        200,
                        200,
                        { width: 1920, height: 1080 },
                        { width: 2560, height: 1440 }
                      ).y
                    }
                    ,{' '}
                    {
                      scaleRegionCoordinates(
                        860,
                        440,
                        200,
                        200,
                        { width: 1920, height: 1080 },
                        { width: 2560, height: 1440 }
                      ).width
                    }
                    ,{' '}
                    {
                      scaleRegionCoordinates(
                        860,
                        440,
                        200,
                        200,
                        { width: 1920, height: 1080 },
                        { width: 2560, height: 1440 }
                      ).height
                    }
                    ]
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Controls: Tolerance, Sensitivity, Grayscale */}
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-800 bg-dark-200 p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-cyber-yellow" />
                  Vision Filter Tuning
                </h4>

                {/* Grayscale Mode Toggle */}
                <div className="flex items-center justify-between rounded-lg bg-dark-300 p-3 border border-gray-800">
                  <div>
                    <span className="text-xs font-semibold text-white">Grayscale Mode</span>
                    <p className="text-[10px] text-gray-400">~2.5x faster in high-speed games</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={visualConfig.enableGrayscale || false}
                    onChange={(e) =>
                      setVisualConfig((prev) => ({ ...prev, enableGrayscale: e.target.checked }))
                    }
                    className="h-4 w-4 rounded accent-cyber-green"
                  />
                </div>

                {/* Color Tolerance Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Color Tolerance (ΔE)</span>
                    <span className="font-mono text-cyber-green font-bold">
                      ±{visualConfig.colorTolerance}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={visualConfig.colorTolerance}
                    onChange={(e) =>
                      setVisualConfig((prev) => ({
                        ...prev,
                        colorTolerance: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-cyber-green"
                  />
                </div>

                {/* Sensitivity Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Sensitivity Threshold</span>
                    <span className="font-mono text-cyber-cyan font-bold">
                      {visualConfig.sensitivity || 88}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={visualConfig.sensitivity || 88}
                    onChange={(e) =>
                      setVisualConfig((prev) => ({
                        ...prev,
                        sensitivity: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-cyber-cyan"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: THE 'HUMANIZER' ANTI-DETECT ALGORITHM */}
      {activeTab === 'humanizer' && (
        <div className="space-y-6">
          {/* Preset Buttons Bar */}
          <div className="p-4 rounded-xl bg-dark-200 border border-gray-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-cyber-yellow animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-white">Anti-Cheat Bypass Presets</h4>
                <p className="text-[11px] text-gray-400">Select pre-tuned human motor simulation profiles</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-wrap">
              <button
                onClick={() =>
                  setHumanizerConfig((prev) => ({
                    ...prev,
                    enableBezier: true,
                    randomJitterEnabled: true,
                    curvatureIntensity: 0.25,
                    clickOffsetRadiusPx: 1.0,
                    minDelayJitterMs: -2,
                    maxDelayJitterMs: 6,
                    easingType: 'naturalHuman',
                  }))
                }
                className="px-3 py-1.5 rounded-lg bg-[#142618] hover:bg-[#1d3d24] text-[#39ff14] border border-[#39ff14]/40 text-xs font-bold transition-all cursor-pointer"
              >
                🏆 Legit Tournament
              </button>
              <button
                onClick={() =>
                  setHumanizerConfig((prev) => ({
                    ...prev,
                    enableBezier: true,
                    randomJitterEnabled: true,
                    curvatureIntensity: 0.45,
                    clickOffsetRadiusPx: 2.5,
                    minDelayJitterMs: -6,
                    maxDelayJitterMs: 15,
                    easingType: 'naturalHuman',
                  }))
                }
                className="px-3 py-1.5 rounded-lg bg-[#14232a] hover:bg-[#1b3644] text-[#00e5ff] border border-[#00e5ff]/40 text-xs font-bold transition-all cursor-pointer"
              >
                🛡️ Ultra Stealth
              </button>
              <button
                onClick={() =>
                  setHumanizerConfig((prev) => ({
                    ...prev,
                    enableBezier: true,
                    randomJitterEnabled: true,
                    curvatureIntensity: 0.15,
                    clickOffsetRadiusPx: 0.5,
                    minDelayJitterMs: -1,
                    maxDelayJitterMs: 3,
                    easingType: 'easeOutQuad',
                  }))
                }
                className="px-3 py-1.5 rounded-lg bg-[#271720] hover:bg-[#3d1e2f] text-[#ff0055] border border-[#ff0055]/40 text-xs font-bold transition-all cursor-pointer"
              >
                🎯 Aggressive Precision
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Interactive Bézier Trajectory Canvas */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-gray-800 bg-dark-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MousePointer2 className="h-5 w-5 text-cyber-yellow" />
                      Cubic Bézier Mouse Path Simulator
                    </h3>
                    <p className="text-xs text-gray-400">
                      Click anywhere on the canvas below to set a new trajectory endpoint.
                    </p>
                  </div>
                  <span className="rounded bg-cyber-yellow/10 border border-cyber-yellow/30 px-2.5 py-1 text-xs font-mono text-cyber-yellow">
                    ANTI-DETECT ACTIVE
                  </span>
                </div>

                <div className="relative rounded-lg border border-gray-800 bg-black/90 overflow-hidden">
                  <canvas
                    ref={trajectoryCanvasRef}
                    width={700}
                    height={380}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.round(e.clientX - rect.left);
                      const y = Math.round(e.clientY - rect.top);
                      setTrajectoryStart(trajectoryEnd);
                      setTrajectoryEnd({ x, y });
                    }}
                    className="w-full cursor-crosshair"
                  />
                </div>

                {/* Trajectory Stats */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="rounded bg-dark-300 p-2 border border-gray-800">
                    <span className="text-[10px] text-gray-500 block">START</span>
                    <span className="text-cyber-green font-bold">
                      {trajectoryStart.x}, {trajectoryStart.y}
                    </span>
                  </div>
                  <div className="rounded bg-dark-300 p-2 border border-gray-800">
                    <span className="text-[10px] text-gray-500 block">END</span>
                    <span className="text-cyber-pink font-bold">
                      {trajectoryEnd.x}, {trajectoryEnd.y}
                    </span>
                  </div>
                  <div className="rounded bg-dark-300 p-2 border border-gray-800">
                    <span className="text-[10px] text-gray-500 block">STEPS</span>
                    <span className="text-cyber-cyan font-bold">{testTrajectory.length}</span>
                  </div>
                  <div className="rounded bg-dark-300 p-2 border border-gray-800">
                    <span className="text-[10px] text-gray-500 block">DURATION</span>
                    <span className="text-cyber-yellow font-bold">
                      {testTrajectory[testTrajectory.length - 1]?.timeMs || 45} ms
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Humanizer Parameter Tuning */}
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-800 bg-dark-200 p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-cyber-yellow" />
                  Anti-Detection Controls
                </h4>

                {/* Curvature Intensity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Curvature Intensity</span>
                    <span className="font-mono text-cyber-yellow font-bold">
                      {Math.round(humanizerConfig.curvatureIntensity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={Math.round(humanizerConfig.curvatureIntensity * 100)}
                    onChange={(e) =>
                      setHumanizerConfig((prev) => ({
                        ...prev,
                        curvatureIntensity: parseInt(e.target.value, 10) / 100,
                      }))
                    }
                    className="w-full accent-cyber-yellow"
                  />
                </div>

                {/* Click Offset Radius */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Human Error Click Offset</span>
                    <span className="font-mono text-cyber-green font-bold">
                      ±{humanizerConfig.clickOffsetRadiusPx} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.5"
                    value={humanizerConfig.clickOffsetRadiusPx}
                    onChange={(e) =>
                      setHumanizerConfig((prev) => ({
                        ...prev,
                        clickOffsetRadiusPx: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-cyber-green"
                  />
                </div>

                {/* Micro Jitter Delay Bounds */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Random Delay Jitter</span>
                    <span className="font-mono text-cyber-cyan font-bold">
                      {humanizerConfig.minDelayJitterMs}ms to +{humanizerConfig.maxDelayJitterMs}ms
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={humanizerConfig.minDelayJitterMs}
                      onChange={(e) =>
                        setHumanizerConfig((prev) => ({
                          ...prev,
                          minDelayJitterMs: parseInt(e.target.value, 10) || -4,
                        }))
                      }
                      className="rounded bg-dark-300 px-2 py-1 text-xs font-mono text-white border border-gray-700"
                    />
                    <input
                      type="number"
                      value={humanizerConfig.maxDelayJitterMs}
                      onChange={(e) =>
                        setHumanizerConfig((prev) => ({
                          ...prev,
                          maxDelayJitterMs: parseInt(e.target.value, 10) || 12,
                        }))
                      }
                      className="rounded bg-dark-300 px-2 py-1 text-xs font-mono text-white border border-gray-700"
                    />
                  </div>
                </div>

                {/* Easing Model */}
                <div className="space-y-1.5">
                  <span className="text-xs text-gray-400">Velocity Easing Model</span>
                  <select
                    value={humanizerConfig.easingType}
                    onChange={(e: any) =>
                      setHumanizerConfig((prev) => ({
                        ...prev,
                        easingType: e.target.value,
                      }))
                    }
                    className="w-full rounded bg-dark-300 px-3 py-2 text-xs font-mono text-white border border-gray-700"
                  >
                    <option value="naturalHuman">Natural Human Motor (Fitts's Law)</option>
                    <option value="easeInOutCubic">Ease-In-Out Cubic</option>
                    <option value="easeOutQuad">Ease-Out Quad</option>
                  </select>
                </div>

                {/* Gaussian Noise Distribution Visualizer */}
                <div className="p-3 rounded-lg bg-black/60 border border-gray-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span>GAUSSIAN NOISE DISTRIBUTION</span>
                    <span className="text-cyber-green font-bold">N(μ=0, σ=1.2)</span>
                  </div>
                  <div className="h-10 flex items-end space-x-1 pt-2">
                    {[12, 28, 48, 72, 95, 100, 95, 72, 48, 28, 12].map((val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-t bg-[#39ff14]/70 transition-all duration-300"
                        style={{ height: `${val}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GHOST LOOP MACRO RECORDER & STUDIO */}
      {activeTab === 'ghost' && (
        <div className="space-y-6">
          {/* Hidden Native File Explorer Input */}
          <input
            type="file"
            ref={ghostFileInputRef}
            className="hidden"
            accept=".json,.aimmacro,application/json"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processMacroFile(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />

          {/* Sub-Header Toolbar: Switch between Recorder and Saved Library */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-800 bg-dark-200 p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGhostSubTab('recorder')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  ghostSubTab === 'recorder'
                    ? 'bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/50 shadow-[0_0_12px_rgba(255,0,85,0.25)]'
                    : 'bg-dark-300 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                <Disc className="h-4 w-4" />
                রেকর্ডার স্টুডিও (Recorder Studio)
              </button>

              <button
                onClick={() => setGhostSubTab('library')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  ghostSubTab === 'library'
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                    : 'bg-dark-300 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                সেভ করা ম্যাক্রো লাইব্রেরি (Saved Library)
                <span className="ml-1 rounded-full bg-dark-400 px-2 py-0.5 text-[10px] font-mono text-white">
                  {savedMacros.length}
                </span>
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-gray-700 bg-dark-300 px-3 py-1 text-xs font-mono text-gray-300">
                <span
                  className={`h-2 w-2 rounded-full ${
                    isRecordingGhost
                      ? 'bg-red-500 animate-ping'
                      : isPlayingGhost
                      ? 'bg-cyber-green animate-pulse'
                      : 'bg-cyber-cyan'
                  }`}
                />
                {playbackStatusText}
              </span>
            </div>
          </div>

          {/* VIEW 1: RECORDER STUDIO */}
          {ghostSubTab === 'recorder' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left 2 Cols: Main Recorder & Interactive Capture Pad */}
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-xl border border-gray-800 bg-dark-200 p-5 space-y-4">
                  {/* Top Title & Primary Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Disc className="h-5 w-5 text-cyber-pink" />
                        'Ghost Loop' মোশন ও কী রেকর্ডার
                      </h3>
                      <p className="text-xs text-gray-400">
                        মাউসের ডেল্টা মুভমেন্ট, ক্লিক ও কিবোর্ড স্ট্রোক রিয়েল-টাইমে মিলিসেকেন্ড নির্ভুলভাবে রেকর্ড হয়।
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isRecordingGhost ? (
                        <button
                          id="btn-stop-ghost"
                          onClick={handleStopGhostRecording}
                          className="flex items-center gap-2 rounded-lg bg-cyber-pink px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(255,0,85,0.4)] animate-pulse"
                        >
                          <Square className="h-3.5 w-3.5 fill-current" />
                          রেকর্ডিং সমাপ্ত (Stop)
                        </button>
                      ) : (
                        <button
                          id="btn-record-ghost"
                          onClick={handleStartGhostRecording}
                          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                        >
                          <Disc className="h-3.5 w-3.5" />
                          রেকর্ড শুরু (Record)
                        </button>
                      )}

                      {recordedMacro && (
                        <button
                          id="btn-play-ghost"
                          onClick={handlePlayGhostMacro}
                          disabled={isRecordingGhost}
                          className="flex items-center gap-2 rounded-lg bg-cyber-green px-4 py-2 text-xs font-bold text-dark-400 hover:bg-cyber-green/90 shadow-[0_0_15px_rgba(57,255,20,0.3)] disabled:opacity-50"
                        >
                          {isPlayingGhost ? (
                            <>
                              <Square className="h-3.5 w-3.5 fill-current" />
                              প্লেব্যাক বন্ধ ({playbackProgress}%)
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5 fill-current" />
                              লুপ প্লে (Play Macro)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Macro Metadata Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-dark-300 px-3 py-2 text-xs border border-gray-800">
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-3.5 w-3.5 text-cyber-cyan" />
                      <span className="font-semibold text-white">
                        {recordedMacro?.name || 'রেকর্ড করা হয়নি'}
                      </span>
                      {recordedMacro?.tags?.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-cyber-purple/10 px-2 py-0.5 text-[10px] font-mono text-cyber-purple border border-cyber-purple/30"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 font-mono text-gray-400 text-[11px]">
                      <span>
                        ইভেন্ট:{' '}
                        <strong className="text-cyber-green">
                          {recordedMacro?.eventsCount || liveEventStream.length}
                        </strong>
                      </span>
                      <span>
                        সময়কাল:{' '}
                        <strong className="text-cyber-yellow">
                          {recordedMacro?.totalDurationMs || 0}ms
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* THE BIG CAPTURE SURFACE & DRAG-AND-DROP PAD */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(true);
                    }}
                    onDragLeave={() => setIsDraggingFile(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingFile(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processMacroFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onMouseMove={(e) => {
                      if (isRecordingGhost) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        ghostRecorder.recordMouseMove(
                          Math.round(e.clientX - rect.left),
                          Math.round(e.clientY - rect.top)
                        );
                        setLiveEventStream(ghostRecorder.getEvents().slice(-30));
                      }
                    }}
                    onMouseDown={(e) => {
                      if (isRecordingGhost) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const btn = e.button === 2 ? 'right' : e.button === 1 ? 'middle' : 'left';
                        ghostRecorder.recordMouseButton(
                          'mousedown',
                          btn,
                          Math.round(e.clientX - rect.left),
                          Math.round(e.clientY - rect.top)
                        );
                        setLiveEventStream(ghostRecorder.getEvents().slice(-30));
                      }
                    }}
                    onMouseUp={(e) => {
                      if (isRecordingGhost) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const btn = e.button === 2 ? 'right' : e.button === 1 ? 'middle' : 'left';
                        ghostRecorder.recordMouseButton(
                          'mouseup',
                          btn,
                          Math.round(e.clientX - rect.left),
                          Math.round(e.clientY - rect.top)
                        );
                        setLiveEventStream(ghostRecorder.getEvents().slice(-30));
                      }
                    }}
                    onContextMenu={(e) => {
                      if (isRecordingGhost) e.preventDefault();
                    }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (isRecordingGhost) {
                        ghostRecorder.recordKey('keydown', e.key);
                        setLiveEventStream(ghostRecorder.getEvents().slice(-30));
                      }
                    }}
                    className={`relative h-64 rounded-xl border-2 transition-all cursor-crosshair select-none overflow-hidden flex flex-col justify-between p-3 ${
                      isDraggingFile
                        ? 'border-cyber-green bg-cyber-green/15 shadow-[0_0_30px_rgba(57,255,20,0.3)]'
                        : isRecordingGhost
                        ? 'border-cyber-pink bg-cyber-pink/5 shadow-[0_0_20px_rgba(255,0,85,0.25)]'
                        : 'border-gray-800 bg-dark-400 hover:border-gray-700'
                    }`}
                  >
                    {/* Visual Trajectory Overlay Canvas */}
                    <canvas
                      ref={ghostCanvasRef}
                      width={750}
                      height={260}
                      className="absolute inset-0 h-full w-full pointer-events-none"
                    />

                    {/* Drag-and-Drop Active Overlay */}
                    {isDraggingFile && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-dark-400/90 backdrop-blur-md">
                        <FileUp className="h-12 w-12 text-cyber-green animate-bounce mb-2" />
                        <span className="text-sm font-bold text-white">
                          ম্যাক্রো ফাইলটি এখানে ড্রপ করুন (Drop .json or .aimmacro here)
                        </span>
                        <span className="text-xs text-gray-400 mt-1 font-mono">
                          সরাসরি ইম্পোর্ট ও লোড হয়ে যাবে
                        </span>
                      </div>
                    )}

                    {/* Top Overlay Badges */}
                    <div className="relative z-10 flex items-center justify-between pointer-events-none">
                      <span className="flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-[10px] font-mono text-cyber-cyan backdrop-blur-sm border border-gray-800">
                        <Target className="h-3 w-3" />
                        CAPTURE CANVAS [DELTA XY + SCANCODE]
                      </span>

                      {isRecordingGhost ? (
                        <span className="flex items-center gap-1.5 rounded bg-red-950/80 px-2.5 py-1 text-[10px] font-mono font-bold text-red-400 border border-red-800 animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                          লাইভ রেকর্ডিং হচ্ছে (Recording in progress)
                        </span>
                      ) : (
                        <span className="rounded bg-black/60 px-2 py-1 text-[10px] font-mono text-gray-400 backdrop-blur-sm border border-gray-800">
                          {recordedMacro?.eventsCount || 0} টি ইভেন্ট লোডেড
                        </span>
                      )}
                    </div>

                    {/* Center Helper Text (when no recording) */}
                    {!isRecordingGhost && (!recordedMacro || recordedMacro.events.length === 0) && (
                      <div className="relative z-10 text-center pointer-events-none my-auto">
                        <Disc className="mx-auto h-8 w-8 text-gray-600 mb-2" />
                        <p className="text-sm font-semibold text-gray-300">
                          রেকর্ড শুরু করতে "Record Macro" চাপুন
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          অথবা নিচে ফাইল সিলেক্ট করুন বা Drag & Drop করে দিন
                        </p>
                      </div>
                    )}

                    {/* Bottom Toolbar over the Canvas */}
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800/80 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        {/* Native File Browser Button */}
                        <button
                          type="button"
                          onClick={() => ghostFileInputRef.current?.click()}
                          className="flex items-center gap-1.5 rounded bg-dark-200 hover:bg-dark-100 px-3 py-1.5 text-xs font-semibold text-white border border-gray-700 shadow transition-all hover:border-cyber-cyan"
                        >
                          <FolderOpen className="h-3.5 w-3.5 text-cyber-cyan" />
                          ফাইল সিলেক্ট করুন (Browse File)
                        </button>

                        {/* Save Current Macro Button */}
                        <button
                          type="button"
                          onClick={handleOpenSaveModal}
                          disabled={!recordedMacro && liveEventStream.length === 0}
                          className="flex items-center gap-1.5 rounded bg-cyber-pink/15 hover:bg-cyber-pink/25 px-3 py-1.5 text-xs font-bold text-cyber-pink border border-cyber-pink/40 shadow transition-all disabled:opacity-40"
                        >
                          <Save className="h-3.5 w-3.5" />
                          ম্যাক্রো সেভ করুন (Save Macro)
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Direct Download Button */}
                        <button
                          type="button"
                          onClick={() => recordedMacro && handleDirectDownload(recordedMacro, 'aimmacro')}
                          disabled={!recordedMacro}
                          className="flex items-center gap-1.5 rounded bg-dark-200 hover:bg-dark-100 px-2.5 py-1.5 text-xs font-semibold text-gray-200 border border-gray-700 disabled:opacity-40"
                          title="সরাসরি .aimmacro ফাইল ডাউনলোড করুন"
                        >
                          <Download className="h-3.5 w-3.5 text-cyber-green" />
                          ডাউনলোড (.aimmacro)
                        </button>

                        {/* Optimize Pauses Button */}
                        <button
                          type="button"
                          onClick={handleTrimPauses}
                          disabled={!recordedMacro || recordedMacro.events.length === 0}
                          className="flex items-center gap-1.5 rounded bg-dark-200 hover:bg-dark-100 px-2.5 py-1.5 text-xs font-semibold text-cyber-yellow border border-gray-700 disabled:opacity-40"
                          title="অপ্রয়োজনীয় অতিরিক্ত বিরতি ট্রিম করুন"
                        >
                          <Scissors className="h-3.5 w-3.5" />
                          ট্রিম পজ
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Playback Progress Bar */}
                  {isPlayingGhost && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-cyber-green font-bold">
                          {loopCountSetting === -1
                            ? `লুপ সাইকেল ${currentLoopIteration} (Infinite ∞)`
                            : `লুপ সাইকেল ${currentLoopIteration} / ${loopCountSetting}`}
                        </span>
                        <span className="text-white">{playbackProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-dark-300 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyber-cyan via-cyber-green to-cyber-pink transition-all duration-75"
                          style={{ width: `${playbackProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Stream Log Box */}
                <div className="rounded-xl border border-gray-800 bg-dark-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-cyber-cyan" />
                      ক্যাপচার্ড ইভেন্ট স্ট্রিম (Event Stream)
                    </h4>
                    <span className="font-mono text-xs text-gray-400">
                      মোট ইভেন্ট: {recordedMacro?.eventsCount || liveEventStream.length}
                    </span>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-1 font-mono text-[11px] pr-1">
                    {liveEventStream.length > 0 ? (
                      liveEventStream.map((ev, i) => (
                        <div
                          key={ev.id || i}
                          className="flex items-center justify-between rounded bg-dark-300 px-2.5 py-1 text-gray-300 border border-gray-800/60"
                        >
                          <span className="text-cyber-cyan font-bold w-16">+{ev.timestampMs}ms</span>
                          <span className="text-white font-semibold">{ev.type}</span>
                          {ev.deltaX !== undefined && ev.deltaY !== undefined && (
                            <span className="text-gray-400">
                              ΔX:{ev.deltaX > 0 ? `+${ev.deltaX}` : ev.deltaX} ΔY:
                              {ev.deltaY > 0 ? `+${ev.deltaY}` : ev.deltaY}
                            </span>
                          )}
                          {ev.key && (
                            <span className="rounded bg-cyber-green/10 border border-cyber-green/30 px-1.5 py-0.5 text-cyber-green font-bold">
                              [{ev.key}]
                            </span>
                          )}
                          {ev.button && (
                            <span className="rounded bg-cyber-pink/10 border border-cyber-pink/30 px-1.5 py-0.5 text-cyber-pink font-bold">
                              {ev.button === 'right' ? 'M2 (Right)' : 'M1 (Left)'}
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-600 italic py-4 text-center">
                        কোনো ইভেন্ট রেকর্ড হয়নি। রেকর্ড বাটন চাপুন বা ফাইল ড্রপ করুন।
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Col: Playback Loops, Speed, & JSON Serialization */}
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-800 bg-dark-200 p-5 space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-cyber-pink" />
                    লুপ প্লেব্যাক ও স্পিড কন্ট্রোল
                  </h4>

                  {/* Loop Count Selector */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">লুপ সাইকেল (Loop Mode)</span>
                      <span className="font-mono text-cyber-cyan font-bold">
                        {loopCountSetting === -1 ? 'Infinite (∞)' : `${loopCountSetting} বার`}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[1, 3, 5, 10, -1].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setLoopCountSetting(cnt)}
                          className={`rounded py-1.5 text-xs font-mono font-bold border transition-all ${
                            loopCountSetting === cnt
                              ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan'
                              : 'bg-dark-300 text-gray-400 border-gray-700 hover:text-white'
                          }`}
                        >
                          {cnt === -1 ? '∞' : `${cnt}x`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Playback Speed Multiplier */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">প্লেব্যাক স্পিড (Speed Multiplier)</span>
                      <span className="font-mono text-cyber-green font-bold">{ghostSpeed}x</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[0.5, 1.0, 1.5, 2.0].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setGhostSpeed(s)}
                          className={`rounded py-1.5 text-xs font-mono font-bold border transition-all ${
                            ghostSpeed === s
                              ? 'bg-cyber-green/20 text-cyber-green border-cyber-green'
                              : 'bg-dark-300 text-gray-400 border-gray-700 hover:text-white'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Inter-Loop Delay */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">লুপের মাঝে বিরতি (Inter-cycle Delay)</span>
                      <span className="font-mono text-cyber-yellow font-bold">{loopDelayMs}ms</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="1000"
                      step="50"
                      value={loopDelayMs}
                      onChange={(e) => setLoopDelayMs(parseInt(e.target.value, 10))}
                      className="w-full accent-cyber-yellow"
                    />
                  </div>

                  {/* Anti-Detect Engine Integration Info */}
                  <div className="rounded-lg bg-dark-300 p-3 border border-gray-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyber-yellow">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      'Humanizer' অ্যান্টি-ডিটেকশন অ্যাক্টিভ
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      লুপ প্লেব্যাকের সময় ফিক্সড রোবটিক টাইমিং এড়িয়ে র‍্যান্ডম মাইক্রো-জিটার ইনজেক্ট করা হয়।
                    </p>
                  </div>

                  {/* Export & Import Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-gray-800">
                    <button
                      id="btn-export-json"
                      type="button"
                      onClick={() => {
                        if (recordedMacro) {
                          const json = ghostRecorder.exportToJson(recordedMacro);
                          setJsonModalContent(json);
                          setShowJsonModal(true);
                        }
                      }}
                      disabled={!recordedMacro}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-dark-300 py-2.5 text-xs font-semibold text-white border border-gray-700 hover:bg-dark-100 transition-all disabled:opacity-40"
                    >
                      <Code2 className="h-3.5 w-3.5 text-cyber-cyan" />
                      JSON স্কিমা কোড দেখুন (View JSON)
                    </button>

                    <button
                      id="btn-import-json"
                      type="button"
                      onClick={() => {
                        setJsonModalContent('{\n  "name": "Custom_Ghost_Macro",\n  "events": []\n}');
                        setShowJsonModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-dark-300 py-2.5 text-xs font-semibold text-white border border-gray-700 hover:bg-dark-100 transition-all"
                    >
                      <Upload className="h-3.5 w-3.5 text-cyber-green" />
                      JSON পেস্ট করে লোড করুন (Paste JSON)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: SAVED MACROS LIBRARY */}
          {ghostSubTab === 'library' && (
            <div className="space-y-4">
              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-800 bg-dark-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ম্যাক্রো বা ট্যাগ খুঁজুন..."
                      value={macroSearchQuery}
                      onChange={(e) => setMacroSearchQuery(e.target.value)}
                      className="w-full rounded-lg bg-dark-300 pl-9 pr-3 py-1.5 text-xs text-white border border-gray-700 focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>

                  {/* Filter Chips */}
                  {['All', 'FPS', 'Combat', 'Movement', 'Looting', 'Flick', 'Custom'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTagFilter(tag)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedTagFilter === tag
                          ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50'
                          : 'bg-dark-300 text-gray-400 hover:text-white border border-gray-800'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => ghostFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg bg-cyber-green px-3 py-1.5 text-xs font-bold text-dark-400 hover:bg-cyber-green/90 shadow transition-all"
                  >
                    <FileUp className="h-3.5 w-3.5" />
                    নতুন ফাইল ইম্পোর্ট করুন
                  </button>
                </div>
              </div>

              {/* Macro Cards Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {savedMacros
                  .filter((m) => {
                    const matchQuery =
                      m.name.toLowerCase().includes(macroSearchQuery.toLowerCase()) ||
                      m.description?.toLowerCase().includes(macroSearchQuery.toLowerCase()) ||
                      m.tags?.some((t) => t.toLowerCase().includes(macroSearchQuery.toLowerCase()));
                    const matchTag =
                      selectedTagFilter === 'All' ||
                      m.tags?.some((t) => t.toLowerCase() === selectedTagFilter.toLowerCase());
                    return matchQuery && matchTag;
                  })
                  .map((macro) => (
                    <div
                      key={macro.id}
                      className={`rounded-xl border p-4 space-y-3 transition-all flex flex-col justify-between ${
                        recordedMacro?.id === macro.id
                          ? 'border-cyber-cyan bg-cyber-cyan/5 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                          : 'border-gray-800 bg-dark-200 hover:border-gray-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Disc className="h-4 w-4 text-cyber-pink shrink-0" />
                            <span className="truncate">{macro.name}</span>
                          </h4>
                          {recordedMacro?.id === macro.id && (
                            <span className="rounded bg-cyber-cyan/20 border border-cyber-cyan/40 px-2 py-0.5 text-[10px] font-mono text-cyber-cyan font-bold">
                              অ্যাক্টিভ
                            </span>
                          )}
                        </div>

                        {macro.description && (
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                            {macro.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {macro.tags?.map((t) => (
                            <span
                              key={t}
                              className="rounded bg-dark-300 px-2 py-0.5 text-[10px] font-mono text-gray-300 border border-gray-700"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-gray-800">
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                          <div className="rounded bg-dark-300 p-1.5 border border-gray-800">
                            <span className="text-[10px] text-gray-500 block">ইভেন্ট সংখ্যা</span>
                            <span className="text-cyber-green font-bold">{macro.eventsCount}টি</span>
                          </div>
                          <div className="rounded bg-dark-300 p-1.5 border border-gray-800">
                            <span className="text-[10px] text-gray-500 block">সময়কাল</span>
                            <span className="text-cyber-yellow font-bold">
                              {macro.totalDurationMs} ms
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoadSavedMacro(macro)}
                            className="flex items-center justify-center gap-1 rounded bg-cyber-cyan/15 hover:bg-cyber-cyan/25 py-1.5 text-xs font-bold text-cyber-cyan border border-cyber-cyan/40"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            লোড
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDirectDownload(macro, 'aimmacro')}
                            className="flex items-center justify-center gap-1 rounded bg-dark-300 hover:bg-dark-100 py-1.5 text-xs font-semibold text-gray-200 border border-gray-700"
                            title="ডাউনলোড .aimmacro"
                          >
                            <Download className="h-3 w-3 text-cyber-green" />
                            ফাইল
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSavedMacro(macro.id)}
                            className="flex items-center justify-center gap-1 rounded bg-red-950/40 hover:bg-red-900/60 py-1.5 text-xs font-semibold text-red-400 border border-red-800/60"
                            title="ডিলিট করুন"
                          >
                            <Trash2 className="h-3 w-3" />
                            ডিলিট
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SAVE MACRO MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-dark-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Save className="h-5 w-5 text-cyber-pink" />
                ম্যাক্রো লাইব্রেরিতে সেভ করুন
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  ম্যাক্রোর নাম (Macro Name) *
                </label>
                <input
                  type="text"
                  value={saveMacroName}
                  onChange={(e) => setSaveMacroName(e.target.value)}
                  placeholder="যেমন: Auto Crouch Shoot, 180 Flick..."
                  className="w-full rounded-lg bg-dark-300 px-3 py-2 text-xs text-white border border-gray-700 focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  বিবরণ (Description)
                </label>
                <textarea
                  rows={3}
                  value={saveMacroDescription}
                  onChange={(e) => setSaveMacroDescription(e.target.value)}
                  placeholder="ম্যাক্রোটি কী কাজ করে সংক্ষেপে লিখুন..."
                  className="w-full rounded-lg bg-dark-300 px-3 py-2 text-xs text-white border border-gray-700 focus:outline-none focus:border-cyber-pink"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  ট্যাগসমূহ (Tags - কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={saveMacroTags}
                  onChange={(e) => setSaveMacroTags(e.target.value)}
                  placeholder="FPS, Combat, Recoil, Custom..."
                  className="w-full rounded-lg bg-dark-300 px-3 py-2 text-xs text-white border border-gray-700 focus:outline-none focus:border-cyber-pink font-mono"
                />
              </div>

              <div className="rounded-lg bg-dark-300 p-3 border border-gray-800 text-xs font-mono flex items-center justify-between text-gray-400">
                <span>
                  ইভেন্ট:{' '}
                  <strong className="text-cyber-green">
                    {recordedMacro?.eventsCount || liveEventStream.length}টি
                  </strong>
                </span>
                <span>
                  সময়কাল:{' '}
                  <strong className="text-cyber-yellow">
                    {recordedMacro?.totalDurationMs || 0}ms
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="rounded-lg bg-dark-300 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-dark-100"
              >
                বাতিল (Cancel)
              </button>

              <button
                type="button"
                onClick={handleConfirmSaveMacro}
                className="flex items-center gap-1.5 rounded-lg bg-cyber-pink px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(255,0,85,0.4)] hover:bg-cyber-pink/90"
              >
                <Save className="h-3.5 w-3.5" />
                কনফার্ম সেভ (Save Macro)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Viewer / Importer Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-dark-200 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="h-5 w-5 text-cyber-cyan" />
                Ghost Macro JSON Schema
              </h3>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <textarea
              value={jsonModalContent}
              onChange={(e) => setJsonModalContent(e.target.value)}
              rows={12}
              className="w-full bg-[#0d1117] p-3 font-mono text-xs text-gray-200 border border-gray-800 rounded-lg focus:outline-none"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(jsonModalContent);
                  onLog('[Clipboard] Copied Macro JSON payload', 'info');
                }}
                className="flex items-center gap-1.5 rounded-lg bg-dark-300 px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-dark-100"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy JSON
              </button>
              <button
                onClick={() => {
                  try {
                    const imported = ghostRecorder.importFromJson(jsonModalContent);
                    setRecordedMacro(imported);
                    setLiveEventStream(imported.events);
                    setShowJsonModal(false);
                    onLog(
                      `[Ghost Loop] Imported '${imported.name}' (${imported.eventsCount} events)`,
                      'success'
                    );
                  } catch (err: any) {
                    onLog(`Import error: ${err.message}`, 'error');
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg bg-cyber-green px-4 py-2 text-xs font-bold text-dark-400 hover:bg-cyber-green/90"
              >
                Apply & Load Macro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
