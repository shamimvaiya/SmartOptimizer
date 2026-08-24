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
  MousePointer2,
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
  const [recordedMacro, setRecordedMacro] = useState<GhostMacroFile | null>(null);
  const [liveEventStream, setLiveEventStream] = useState<GhostMacroEvent[]>([]);
  const [ghostSpeed, setGhostSpeed] = useState<number>(1.0);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [jsonModalContent, setJsonModalContent] = useState<string>('');

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

  // Handle Ghost Loop Recording
  const handleStartGhostRecording = () => {
    ghostRecorder.startRecording();
    setIsRecordingGhost(true);
    setRecordedMacro(null);
    setLiveEventStream([]);
    onLog('[Ghost Loop] Recording started. Move mouse and press keys on the canvas...', 'macro');
  };

  const handleStopGhostRecording = () => {
    const macroFile = ghostRecorder.stopRecording();
    setIsRecordingGhost(false);
    setRecordedMacro(macroFile);
    setLiveEventStream(macroFile.events);
    onLog(
      `[Ghost Loop] Recording stopped. Captured ${macroFile.eventsCount} events (${macroFile.totalDurationMs}ms).`,
      'success'
    );
  };

  const handlePlayGhostMacro = async () => {
    if (!recordedMacro) return;
    if (isPlayingGhost) {
      ghostRecorder.stopPlayback();
      setIsPlayingGhost(false);
      return;
    }

    setIsPlayingGhost(true);
    setPlaybackProgress(0);

    await ghostRecorder.playMacro(
      recordedMacro,
      humanizerConfig,
      ghostSpeed,
      (progress) => setPlaybackProgress(progress),
      (msg) => onLog(msg, 'macro')
    );

    setIsPlayingGhost(false);
    setPlaybackProgress(100);
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GHOST LOOP MACRO RECORDER */}
      {activeTab === 'ghost' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recorder Controls & Capture Surface */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-gray-800 bg-dark-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Disc className="h-5 w-5 text-cyber-pink" />
                      'Ghost Loop' Delta Motion Recorder
                    </h3>
                    <p className="text-xs text-gray-400">
                      Captures mouse delta coordinates, clicks, and keyboard strokes with millisecond timestamps.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isRecordingGhost ? (
                      <button
                        id="btn-stop-ghost"
                        onClick={handleStopGhostRecording}
                        className="flex items-center gap-2 rounded-lg bg-cyber-pink px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(255,0,85,0.4)]"
                      >
                        <Square className="h-3.5 w-3.5 fill-current" />
                        Stop Recording
                      </button>
                    ) : (
                      <button
                        id="btn-record-ghost"
                        onClick={handleStartGhostRecording}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                      >
                        <Disc className="h-3.5 w-3.5" />
                        Record Macro
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
                            Stop Playback ({playbackProgress}%)
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 fill-current" />
                            Play Ghost Loop
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Recording Area */}
                <div
                  onMouseMove={(e) => {
                    if (isRecordingGhost) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      ghostRecorder.recordMouseMove(
                        Math.round(e.clientX - rect.left),
                        Math.round(e.clientY - rect.top)
                      );
                      setLiveEventStream(ghostRecorder.getEvents().slice(-20));
                    }
                  }}
                  onMouseDown={(e) => {
                    if (isRecordingGhost) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      ghostRecorder.recordMouseButton(
                        'mousedown',
                        'left',
                        Math.round(e.clientX - rect.left),
                        Math.round(e.clientY - rect.top)
                      );
                      setLiveEventStream(ghostRecorder.getEvents().slice(-20));
                    }
                  }}
                  onMouseUp={(e) => {
                    if (isRecordingGhost) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      ghostRecorder.recordMouseButton(
                        'mouseup',
                        'left',
                        Math.round(e.clientX - rect.left),
                        Math.round(e.clientY - rect.top)
                      );
                      setLiveEventStream(ghostRecorder.getEvents().slice(-20));
                    }
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (isRecordingGhost) {
                      ghostRecorder.recordKey('keydown', e.key);
                      setLiveEventStream(ghostRecorder.getEvents().slice(-20));
                    }
                  }}
                  className={`h-48 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-crosshair select-none ${
                    isRecordingGhost
                      ? 'border-cyber-pink bg-cyber-pink/5 animate-pulse'
                      : 'border-gray-800 bg-dark-300/40 hover:border-gray-700'
                  }`}
                >
                  <Disc
                    className={`h-8 w-8 mb-2 ${
                      isRecordingGhost ? 'text-cyber-pink animate-spin' : 'text-gray-600'
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-300">
                    {isRecordingGhost
                      ? 'Recording Live Movements... Move cursor and type keys here'
                      : 'Ghost Loop Capture Pad'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {recordedMacro
                      ? `${recordedMacro.eventsCount} events ready for playback`
                      : 'Click "Record Macro" to begin tracking'}
                  </span>
                </div>
              </div>

              {/* Event Stream Log */}
              <div className="rounded-xl border border-gray-800 bg-dark-200 p-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Captured Event Stream</span>
                  <span className="font-mono text-gray-400">
                    Total: {recordedMacro?.eventsCount || liveEventStream.length}
                  </span>
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px]">
                  {liveEventStream.length > 0 ? (
                    liveEventStream.map((ev, i) => (
                      <div
                        key={ev.id || i}
                        className="flex items-center justify-between rounded bg-dark-300 px-2 py-1 text-gray-300"
                      >
                        <span className="text-cyber-cyan font-bold">+{ev.timestampMs}ms</span>
                        <span className="text-white">{ev.type}</span>
                        {ev.deltaX !== undefined && (
                          <span className="text-gray-400">
                            ΔX:{ev.deltaX} ΔY:{ev.deltaY}
                          </span>
                        )}
                        {ev.key && <span className="text-cyber-green font-bold">[{ev.key}]</span>}
                        {ev.button && <span className="text-cyber-pink">{ev.button}</span>}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-600 italic">No events recorded yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Macro File Serialization & Export */}
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-800 bg-dark-200 p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="h-4 w-4 text-cyber-cyan" />
                  JSON Serialization & Playback
                </h4>

                {/* Playback Speed Multiplier */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Playback Speed</span>
                    <span className="font-mono text-cyber-green font-bold">{ghostSpeed}x</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0.5, 1.0, 1.5, 2.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => setGhostSpeed(s)}
                        className={`rounded py-1.5 text-xs font-mono font-bold border transition-all ${
                          ghostSpeed === s
                            ? 'bg-cyber-green/20 text-cyber-green border-cyber-green'
                            : 'bg-dark-300 text-gray-400 border-gray-700'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export / Import Buttons */}
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <button
                    id="btn-export-json"
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
                    <Download className="h-3.5 w-3.5 text-cyber-cyan" />
                    Export Macro JSON
                  </button>

                  <button
                    id="btn-import-json"
                    onClick={() => {
                      setJsonModalContent('{\n  "name": "Custom_Ghost_Macro",\n  "events": []\n}');
                      setShowJsonModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-dark-300 py-2.5 text-xs font-semibold text-white border border-gray-700 hover:bg-dark-100 transition-all"
                  >
                    <Upload className="h-3.5 w-3.5 text-cyber-green" />
                    Import / Paste JSON
                  </button>
                </div>
              </div>
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
