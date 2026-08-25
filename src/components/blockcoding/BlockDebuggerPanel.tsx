import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  StepForward,
  CornerDownRight,
  CornerUpLeft,
  CircleDot,
  Terminal,
  Variable,
  History,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Plus,
  Sliders,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Gauge,
  Shield,
  Zap,
} from 'lucide-react';
import { DebuggerState, ExecutionHistoryItem, MacroVariable, ErrorRecoveryStrategy } from '../../types';

interface BlockDebuggerPanelProps {
  debuggerState: DebuggerState;
  variables: Record<string, any>;
  onUpdateVariable: (name: string, value: any) => void;
  onAddVariable: (variable: MacroVariable) => void;
  history: ExecutionHistoryItem[];
  onClearHistory: () => void;
  breakpoints: string[];
  onToggleBreakpoint: (blockId: string) => void;
  onClearAllBreakpoints: () => void;
  onRun: () => void;
  onPause: () => void;
  onResume: () => void;
  onStepOver: () => void;
  onStepInto?: () => void;
  onStepOut?: () => void;
  onStop: () => void;
  errorStrategy?: ErrorRecoveryStrategy;
  onChangeErrorStrategy?: (strat: ErrorRecoveryStrategy) => void;
  performanceReport?: any;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const BlockDebuggerPanel: React.FC<BlockDebuggerPanelProps> = ({
  debuggerState,
  variables,
  onUpdateVariable,
  onAddVariable,
  history,
  onClearHistory,
  breakpoints,
  onToggleBreakpoint,
  onClearAllBreakpoints,
  onRun,
  onPause,
  onResume,
  onStepOver,
  onStepInto,
  onStepOut,
  onStop,
  errorStrategy = 'stop',
  onChangeErrorStrategy,
  performanceReport,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<'variables' | 'history' | 'breakpoints' | 'profiler'>('variables');
  const [newVarName, setNewVarName] = useState<string>('');
  const [newVarVal, setNewVarVal] = useState<string>('0');
  const [isAddVarOpen, setIsAddVarOpen] = useState<boolean>(false);

  const isRunning = debuggerState.status === 'running';
  const isPaused = debuggerState.status === 'paused' || debuggerState.status === 'stepping';

  if (isCollapsed) {
    return (
      <div className="bg-[#090b10] rounded-2xl border-2 border-[#1f283d] flex flex-col items-center py-3 space-y-3 h-full shadow-2xl w-12 flex-shrink-0">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl bg-[#141a2c] text-[#00e5ff] hover:bg-[#1e2742] transition-colors cursor-pointer"
          title="Expand Debugger Inspector"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="w-full h-px bg-[#1f283d]" />

        {/* Quick Play/Stop Action */}
        {!isRunning && !isPaused ? (
          <button
            onClick={onRun}
            className="w-8 h-8 rounded-xl bg-[#39ff14] text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
            title="Run Macro"
          >
            <Play className="w-4 h-4 fill-black" />
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
            title="Stop Macro"
          >
            <Square className="w-4 h-4 fill-white" />
          </button>
        )}

        {/* Status Indicator */}
        <div
          className={`w-3 h-3 rounded-full ${
            isRunning ? 'bg-[#39ff14] animate-ping' : isPaused ? 'bg-amber-400' : 'bg-[#8892b0]'
          }`}
          title={`Status: ${debuggerState.status}`}
        />

        <div className="w-full h-px bg-[#1f283d]" />

        {/* Tab Quick Icons */}
        <button
          onClick={() => {
            setActiveTab('variables');
            onToggleCollapse?.();
          }}
          className="p-2 rounded-xl text-[#8892b0] hover:text-[#00e5ff] hover:bg-[#141a2c] transition-colors cursor-pointer"
          title="Variables"
        >
          <Variable className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            setActiveTab('breakpoints');
            onToggleCollapse?.();
          }}
          className="p-2 rounded-xl text-[#8892b0] hover:text-rose-400 hover:bg-[#141a2c] transition-colors cursor-pointer relative"
          title="Breakpoints"
        >
          <CircleDot className="w-4 h-4" />
          {breakpoints.length > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            onToggleCollapse?.();
          }}
          className="p-2 rounded-xl text-[#8892b0] hover:text-amber-300 hover:bg-[#141a2c] transition-colors cursor-pointer"
          title="Execution History"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            setActiveTab('profiler');
            onToggleCollapse?.();
          }}
          className="p-2 rounded-xl text-[#8892b0] hover:text-[#39ff14] hover:bg-[#141a2c] transition-colors cursor-pointer"
          title="Performance Profiler"
        >
          <Gauge className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const handleCreateVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarName.trim()) return;

    let parsedVal: any = newVarVal;
    if (newVarVal.toLowerCase() === 'true') parsedVal = true;
    else if (newVarVal.toLowerCase() === 'false') parsedVal = false;
    else if (!isNaN(Number(newVarVal)) && newVarVal !== '') parsedVal = Number(newVarVal);

    onAddVariable({
      id: `var_${Date.now()}`,
      name: newVarName.trim(),
      type: typeof parsedVal === 'number' ? 'number' : typeof parsedVal === 'boolean' ? 'boolean' : 'string',
      defaultValue: parsedVal,
      value: parsedVal,
      scope: 'global',
    });

    setNewVarName('');
    setNewVarVal('0');
    setIsAddVarOpen(false);
  };

  return (
    <div className="bg-[#090b10] rounded-2xl border-2 border-[#1f283d] flex flex-col h-full shadow-2xl overflow-hidden font-sans">
      {/* Top Debugger Command Bar */}
      <div className="p-3 bg-[#0d101a] border-b border-[#1b2538] flex flex-wrap items-center justify-between gap-2">
        {/* Playback Controls */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
          {!isRunning && !isPaused ? (
            <button
              onClick={onRun}
              className="px-3 py-1.5 rounded-xl bg-[#39ff14] hover:bg-[#2ecc71] text-black font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-[#39ff14]/20 cursor-pointer transition-transform hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Run Macro</span>
            </button>
          ) : isPaused ? (
            <button
              onClick={onResume}
              className="px-3 py-1.5 rounded-xl bg-[#39ff14] hover:bg-[#2ecc71] text-black font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-[#39ff14]/20 cursor-pointer animate-pulse"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center space-x-1.5 shadow-lg cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-black" />
              <span>Pause</span>
            </button>
          )}

          {/* Step Over Button */}
          <button
            onClick={onStepOver}
            disabled={!isPaused && !isRunning}
            className={`px-2.5 py-1.5 rounded-xl font-black text-xs flex items-center space-x-1 border transition-all cursor-pointer ${
              isPaused || isRunning
                ? 'bg-[#182238] hover:bg-[#223254] text-[#00e5ff] border-[#00e5ff]/40 shadow-sm'
                : 'bg-[#10141f] text-[#55607a] border-[#182030] cursor-not-allowed'
            }`}
            title="Step Over to Next Block (F10)"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Step Over</span>
          </button>

          {/* Step Into Button */}
          {onStepInto && (
            <button
              onClick={onStepInto}
              disabled={!isPaused && !isRunning}
              className={`px-2 py-1.5 rounded-xl font-black text-xs flex items-center space-x-1 border transition-all cursor-pointer ${
                isPaused || isRunning
                  ? 'bg-[#182238] hover:bg-[#223254] text-[#ffd600] border-[#ffd600]/40 shadow-sm'
                  : 'bg-[#10141f] text-[#55607a] border-[#182030] cursor-not-allowed'
              }`}
              title="Step Into Child Slot / Custom Block (F11)"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Step Into</span>
            </button>
          )}

          {/* Step Out Button */}
          {onStepOut && (
            <button
              onClick={onStepOut}
              disabled={!isPaused && !isRunning}
              className={`px-2 py-1.5 rounded-xl font-black text-xs flex items-center space-x-1 border transition-all cursor-pointer ${
                isPaused || isRunning
                  ? 'bg-[#182238] hover:bg-[#223254] text-[#d500f9] border-[#d500f9]/40 shadow-sm'
                  : 'bg-[#10141f] text-[#55607a] border-[#182030] cursor-not-allowed'
              }`}
              title="Step Out of Container (Shift+F11)"
            >
              <CornerUpLeft className="w-3.5 h-3.5" />
              <span>Step Out</span>
            </button>
          )}

          {/* Stop Button */}
          <button
            onClick={onStop}
            disabled={!isRunning && !isPaused}
            className={`px-2.5 py-1.5 rounded-xl font-black text-xs flex items-center space-x-1.5 border transition-all cursor-pointer ${
              isRunning || isPaused
                ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-500/40 shadow-sm'
                : 'bg-[#10141f] text-[#55607a] border-[#182030] cursor-not-allowed'
            }`}
            title="Stop Execution"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        </div>

        {/* Error Strategy & Runtime Status */}
        <div className="flex items-center space-x-2">
          {onChangeErrorStrategy && (
            <div className="flex items-center space-x-1 bg-[#101726] px-2 py-1 rounded-xl border border-[#1b2538]">
              <Shield className="w-3 h-3 text-[#00e5ff]" />
              <select
                value={errorStrategy}
                onChange={(e) => onChangeErrorStrategy(e.target.value as ErrorRecoveryStrategy)}
                className="bg-transparent text-[10px] font-bold text-white uppercase focus:outline-none cursor-pointer"
                title="Error Recovery Mode"
              >
                <option value="stop" className="bg-[#0b0e18]">Error: Stop Execution</option>
                <option value="retry" className="bg-[#0b0e18]">Error: Retry 3x</option>
                <option value="continue" className="bg-[#0b0e18]">Error: Skip & Continue</option>
                <option value="fallback" className="bg-[#0b0e18]">Error: Fallback Handler</option>
              </select>
            </div>
          )}

          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center space-x-1.5 ${
              debuggerState.status === 'running'
                ? 'bg-[#39ff14]/15 text-[#39ff14] border-[#39ff14]/40 animate-pulse'
                : debuggerState.status === 'paused'
                ? 'bg-amber-400/15 text-amber-300 border-amber-400/40'
                : debuggerState.status === 'error'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-[#141a29] text-[#8892b0] border-[#222b40]'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                debuggerState.status === 'running'
                  ? 'bg-[#39ff14]'
                  : debuggerState.status === 'paused'
                  ? 'bg-amber-400'
                  : debuggerState.status === 'error'
                  ? 'bg-rose-500'
                  : 'bg-[#55607a]'
              }`}
            />
            <span>
              {debuggerState.status.toUpperCase()}
              {debuggerState.pausedReason ? ` (${debuggerState.pausedReason})` : ''}
            </span>
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-xl bg-[#141a2c] text-[#8892b0] hover:text-white hover:bg-[#1e2742] transition-colors cursor-pointer"
              title="Collapse Inspector Panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div className="text-[10px] text-[#8892b0] font-mono hidden sm:flex items-center space-x-2">
            <span>Steps: {debuggerState.stepCount}</span>
            <span>|</span>
            <span>{debuggerState.executionTimeMs}ms</span>
          </div>
        </div>
      </div>

      {/* Error Banner if applicable */}
      {debuggerState.error && (
        <div className="p-3 bg-rose-950/70 border-b border-rose-500/50 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span className="font-bold">{debuggerState.error}</span>
          </div>
          <button
            onClick={onStop}
            className="px-2 py-0.5 rounded bg-rose-500 text-black font-black text-[10px] uppercase cursor-pointer"
          >
            Acknowledge & Stop
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-[#1b2538] bg-[#0c0f18] px-3">
        <button
          onClick={() => setActiveTab('variables')}
          className={`py-2 px-3 text-xs font-black flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'variables'
              ? 'border-[#00e5ff] text-[#00e5ff]'
              : 'border-transparent text-[#8892b0] hover:text-white'
          }`}
        >
          <Variable className="w-3.5 h-3.5" />
          <span>Variables ({Object.keys(variables).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-2 px-3 text-xs font-black flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'border-[#39ff14] text-[#39ff14]'
              : 'border-transparent text-[#8892b0] hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Timeline Trace ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('breakpoints')}
          className={`py-2 px-3 text-xs font-black flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'breakpoints'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-[#8892b0] hover:text-white'
          }`}
        >
          <CircleDot className="w-3.5 h-3.5" />
          <span>Breakpoints ({breakpoints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profiler')}
          className={`py-2 px-3 text-xs font-black flex items-center space-x-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'profiler'
              ? 'border-[#d500f9] text-[#d500f9]'
              : 'border-transparent text-[#8892b0] hover:text-white'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Performance Profiler</span>
        </button>
      </div>

      {/* Tab Panel Contents */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Tab 1: Live Variables Inspector */}
        {activeTab === 'variables' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8892b0]">
                Live Runtime Scope
              </span>
              <button
                onClick={() => setIsAddVarOpen((prev) => !prev)}
                className="px-2 py-1 rounded-lg bg-[#141b2c] hover:bg-[#1f2b45] text-[10px] font-bold text-[#00e5ff] border border-[#00e5ff]/30 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>+ Define Variable</span>
              </button>
            </div>

            {/* Quick Add Form */}
            {isAddVarOpen && (
              <form
                onSubmit={handleCreateVar}
                className="p-2.5 rounded-xl bg-[#0f1424] border border-[#00e5ff]/30 grid grid-cols-12 gap-2"
              >
                <input
                  type="text"
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  placeholder="Variable Name"
                  className="col-span-6 px-2 py-1 rounded bg-[#070910] border border-[#1f2b45] text-xs text-white font-mono"
                />
                <input
                  type="text"
                  value={newVarVal}
                  onChange={(e) => setNewVarVal(e.target.value)}
                  placeholder="Default Value"
                  className="col-span-4 px-2 py-1 rounded bg-[#070910] border border-[#1f2b45] text-xs text-[#39ff14] font-mono"
                />
                <button
                  type="submit"
                  className="col-span-2 py-1 rounded bg-[#00e5ff] text-black font-black text-xs uppercase cursor-pointer"
                >
                  Add
                </button>
              </form>
            )}

            {/* Variables Table */}
            <div className="space-y-1.5">
              {Object.entries(variables).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#0d111c] border border-[#1a2338] hover:border-[#00e5ff]/50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-[#8892b0] font-mono text-xs">{k}:</span>
                    <span className="text-[10px] text-[#55607a] font-mono uppercase">
                      ({typeof v})
                    </span>
                  </div>

                  <input
                    type="text"
                    value={String(v ?? '')}
                    onChange={(e) => {
                      const raw = e.target.value;
                      let parsed: any = raw;
                      if (raw.toLowerCase() === 'true') parsed = true;
                      else if (raw.toLowerCase() === 'false') parsed = false;
                      else if (!isNaN(Number(raw)) && raw !== '') parsed = Number(raw);
                      onUpdateVariable(k, parsed);
                    }}
                    className="w-32 px-2 py-0.5 rounded bg-[#06080d] border border-[#232e48] text-right font-mono text-xs text-[#00e5ff] font-bold outline-none focus:border-[#00e5ff]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Execution Timeline History */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8892b0]">
                Chronological Steps ({history.length})
              </span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="p-1 rounded text-[#8892b0] hover:text-rose-400 flex items-center space-x-1 text-[10px] cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {history.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-[#0d111c] border border-[#1b2538] space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status === 'success'
                          ? 'bg-[#39ff14]'
                          : item.status === 'failed'
                          ? 'bg-rose-500'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span className="font-extrabold text-white">{item.blockTitle}</span>
                  </div>
                  <span className="text-[10px] text-[#8892b0] font-mono">
                    +{item.durationMs}ms
                  </span>
                </div>
                <p className="text-[11px] text-[#8892b0] font-mono truncate">{item.message}</p>
              </div>
            ))}

            {history.length === 0 && (
              <div className="py-8 text-center text-xs text-[#8892b0]">
                No execution history yet. Click &ldquo;Run Macro&rdquo; to start tracing.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Breakpoints Manager */}
        {activeTab === 'breakpoints' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8892b0]">
                Active Breakpoints ({breakpoints.length})
              </span>
              {breakpoints.length > 0 && (
                <button
                  onClick={onClearAllBreakpoints}
                  className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30 text-[10px] font-bold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {breakpoints.map((bpId) => (
              <div
                key={bpId}
                className="flex items-center justify-between p-2 rounded-xl bg-[#0d111c] border border-rose-500/30 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <CircleDot className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span className="font-mono text-white text-xs">{bpId}</span>
                </div>
                <button
                  onClick={() => onToggleBreakpoint(bpId)}
                  className="p-1 text-[#8892b0] hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {breakpoints.length === 0 && (
              <div className="py-8 text-center text-xs text-[#8892b0]">
                No active breakpoints. Click the circle dot icon on any block to set one.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Performance Profiler */}
        {activeTab === 'profiler' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#0e1322] border border-[#1b2538] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-[#8892b0]">Total Execution Time</span>
                <div className="text-sm font-black text-[#39ff14]">{debuggerState.executionTimeMs} ms</div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-[#8892b0]">Total Blocks Executed</span>
                <div className="text-sm font-black text-[#00e5ff]">{debuggerState.stepCount}</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8892b0]">
                Block Execution Leaderboard
              </span>
              {history.slice(0, 10).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-[#070912] border border-[#1b2538] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-[10px] font-mono text-[#8892b0]">#{idx + 1}</span>
                    <span className="font-bold text-white truncate">{item.blockTitle}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#ffd600]">
                    {item.durationMs} ms
                  </span>
                </div>
              ))}

              {history.length === 0 && (
                <div className="py-8 text-center text-xs text-[#8892b0]">
                  Run a macro to collect granular per-block execution time metrics.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

