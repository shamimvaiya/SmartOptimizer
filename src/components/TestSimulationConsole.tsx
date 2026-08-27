import React, { useState } from 'react';
import { Terminal, Play, Maximize2, Minimize2, ChevronDown, ChevronUp, Sparkles, Crosshair } from 'lucide-react';

interface TestSimulationConsoleProps {
  isBn?: boolean;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  logs?: string[];
  isSimulating?: boolean;
  onStartSimulation?: () => void;
  onStopSimulation?: () => void;
  onClearLogs?: () => void;
  lang?: string;
}

export const TestSimulationConsole: React.FC<TestSimulationConsoleProps> = ({
  isBn: propIsBn,
  className = '',
  collapsible = true,
  defaultOpen = true,
  logs: propLogs,
  isSimulating: propIsSimulating,
  onStartSimulation,
  onStopSimulation,
  onClearLogs,
  lang = 'bn',
}) => {
  const isBn = propIsBn ?? (lang === 'bn');
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [simulationMode, setSimulationMode] = useState<'text' | 'graphic'>('text');
  const [internalIsSimulating, setInternalIsSimulating] = useState<boolean>(false);
  const [internalLogs, setInternalLogs] = useState<string[]>([]);
  const [mouseTrail, setMouseTrail] = useState<{ x: number; y: number }[]>([]);

  const isSimulating = propIsSimulating ?? internalIsSimulating;
  const simulationLogs = propLogs ?? internalLogs;

  const handleRunSimulation = () => {
    if (onStartSimulation) {
      onStartSimulation();
      return;
    }
    if (isSimulating) return;
    setInternalIsSimulating(true);
    setInternalLogs([]);
    setMouseTrail([]);

    let step = 0;
    const simSteps = [
      `[0.08s] Thread pool initialized (Thread ID: #4012)`,
      `[0.15s] Reading Bézier curvature matrix... OK`,
      `[0.24s] Mouse Y-compensation delta: -3.4px`,
      `[0.32s] Sub-pixel micro-jitter injected (±0.9px)`,
      `[0.45s] Action sequence executed successfully!`,
    ];

    const trailPoints: { x: number; y: number }[] = [];

    const interval = setInterval(() => {
      if (step < simSteps.length) {
        setInternalLogs((prev) => [...prev, simSteps[step]]);
        trailPoints.push({
          x: 100 + Math.sin(step * 1.5) * 16 + Math.random() * 4,
          y: 35 + step * 20 + Math.random() * 4,
        });
        setMouseTrail([...trailPoints]);
        step++;
      } else {
        clearInterval(interval);
        setInternalIsSimulating(false);
      }
    }, 200);
  };

  const handleStopSimulation = () => {
    if (onStopSimulation) {
      onStopSimulation();
      return;
    }
    setInternalIsSimulating(false);
  };

  const handleClearLogs = () => {
    if (onClearLogs) {
      onClearLogs();
      return;
    }
    setInternalLogs([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="h-9 px-3 rounded-xl bg-[#12131f] hover:bg-[#1a1c2e] border border-[#2b2d42] text-[#00e5ff] font-bold text-xs flex items-center space-x-2 cursor-pointer shadow-lg transition-all"
        title="Open Test Simulation Console"
      >
        <Terminal className="w-4 h-4 text-[#00e5ff]" />
        <span>{isBn ? 'টেস্ট সিমুলেশন কনসোল' : 'Test Console'}</span>
        <ChevronUp className="w-3.5 h-3.5 text-[#8892b0]" />
      </button>
    );
  }

  return (
    <div className={`rounded-xl bg-[#0c0d14] border border-[#1f2133] p-3 shadow-2xl flex flex-col space-y-2 select-none ${className}`}>
      {/* Console Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1e2030]">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#00e5ff]" />
          <span className="text-xs font-black text-white tracking-wide">
            {isBn ? 'টেস্ট সিমুলেশন কনসোল' : 'TEST & SIMULATION CONSOLE'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg bg-[#141624] p-0.5 border border-[#262940]">
            <button
              onClick={() => setSimulationMode('text')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                simulationMode === 'text'
                  ? 'bg-[#00e5ff] text-black shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                  : 'text-[#8892b0] hover:text-white'
              }`}
            >
              Text Log
            </button>
            <button
              onClick={() => setSimulationMode('graphic')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                simulationMode === 'graphic'
                  ? 'bg-[#39ff14] text-black shadow-[0_0_8px_rgba(57,255,20,0.4)]'
                  : 'text-[#8892b0] hover:text-white'
              }`}
            >
              Visual Canvas
            </button>
          </div>

          {collapsible && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-[#8892b0] hover:text-white hover:bg-[#1f2133] transition-colors cursor-pointer"
              title="Minimize Console"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mode Body */}
      {simulationMode === 'text' ? (
        <div className="h-56 rounded-xl bg-[#05060a] p-3 border border-[#1a1c2b] font-mono text-xs text-[#39ff14] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-[#1f283d]">
          {simulationLogs.length > 0 ? (
            simulationLogs.map((log, i) => (
              <div key={i} className="flex items-start space-x-2">
                <span className="text-[#00e5ff] font-bold select-none">&gt;</span>
                <span className="leading-relaxed">{log}</span>
              </div>
            ))
          ) : (
            <div className="text-[#64748b] italic py-4 text-center">
              {isBn
                ? 'রিয়েল-টাইম গেম ইমুলেশন টেস্ট দেখতে "রান টেস্ট সিমুলেশন" এ ক্লিক করুন।'
                : 'Click "Run Test Simulation" to test script flow and trajectory.'}
            </div>
          )}
        </div>
      ) : (
        <div className="h-56 rounded-xl bg-[#05060a] border border-[#1a1c2b] relative overflow-hidden flex items-center justify-center">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          {/* Target HUD Reticle */}
          <div className="w-16 h-16 rounded-full border-2 border-[#00e5ff]/50 flex items-center justify-center relative shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <div className="w-8 h-8 rounded-full border border-[#39ff14]/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-ping" />
            </div>
          </div>

          {/* Recoil Trajectory */}
          {mouseTrail.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                fill="none"
                stroke="#39ff14"
                strokeWidth="2.5"
                strokeDasharray="5 3"
                points={mouseTrail.map((p) => `${p.x * 1.8},${p.y * 1.3}`).join(' ')}
              />
              {mouseTrail.map((p, idx) => (
                <circle key={idx} cx={p.x * 1.8} cy={p.y * 1.3} r="3" fill="#ffd600" />
              ))}
            </svg>
          )}

          {isSimulating && (
            <div className="absolute top-3 left-3 text-[10px] font-mono text-[#39ff14] bg-black/80 px-2.5 py-1 rounded-lg border border-[#39ff14]/50 animate-pulse shadow-lg">
              ● EXECUTING HUMAN BÉZIER RECOIL SIMULATION...
            </div>
          )}
        </div>
      )}

      {/* Trigger & Control Bar */}
      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="flex-1 h-8 rounded-lg bg-[#162b16] hover:bg-[#203e20] disabled:opacity-50 text-[#39ff14] border border-[#39ff14]/60 font-black text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all shadow-[0_0_10px_rgba(57,255,20,0.2)]"
        >
          <Play className="w-3.5 h-3.5 fill-current text-[#39ff14]" />
          <span>{isBn ? 'রান টেস্ট সিমুলেশন' : 'Run Test Simulation'}</span>
        </button>

        {isSimulating && (
          <button
            onClick={handleStopSimulation}
            className="h-8 px-3 rounded-lg bg-[#2b1616] hover:bg-[#3e2020] text-[#ff4444] border border-[#ff4444]/60 font-black text-xs flex items-center justify-center space-x-1 cursor-pointer transition-all"
          >
            <span>{isBn ? 'স্টপ' : 'Stop'}</span>
          </button>
        )}

        <button
          onClick={handleClearLogs}
          className="h-8 px-3 rounded-lg bg-[#141624] hover:bg-[#1f2238] text-[#8892b0] hover:text-white border border-[#272a42] font-bold text-xs flex items-center justify-center cursor-pointer transition-all"
          title="Clear Logs"
        >
          <span>{isBn ? 'ক্লিয়ার' : 'Clear'}</span>
        </button>
      </div>
    </div>
  );
};
