import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Square,
  Terminal,
  Trash2,
  Tv,
  Wifi,
  Plus,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Send,
  CornerDownLeft,
  Pin,
} from 'lucide-react';
import { InstalledEmulatorInfo, TelemetryData } from '../types';
import { api } from '../services/api';
import { Language, translations } from '../i18n/translations';

interface DashboardViewProps {
  telemetry: TelemetryData | null;
  emulators: InstalledEmulatorInfo[];
  selectedEmulatorId: string;
  onSelectEmulator: (id: string) => void;
  onLaunchEmulator: () => void;
  onStopEmulator: () => void;
  onOptimizeEngine: () => void;
  onFlushRam: () => void;
  logs: string[];
  onClearLogs: () => void;
  onOpenAddEmulatorModal: () => void;
  isEngineActive: boolean;
  onUpdateAdbPort: (port: number) => void;
  onDeleteEmulator?: (id: string) => void;
  onTogglePinEmulator?: (id: string) => void;
  lang?: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  telemetry,
  emulators,
  selectedEmulatorId,
  onSelectEmulator,
  onLaunchEmulator,
  onStopEmulator,
  onOptimizeEngine,
  onFlushRam,
  logs,
  onClearLogs,
  onOpenAddEmulatorModal,
  isEngineActive,
  onUpdateAdbPort,
  onDeleteEmulator,
  onTogglePinEmulator,
  lang = 'bn',
}) => {
  const t = translations[lang];
  const [customPort, setCustomPort] = useState<number>(5555);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [commandInput, setCommandInput] = useState<string>('');
  const [isExecutingCmd, setIsExecutingCmd] = useState<boolean>(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const terminalBodyRef = useRef<HTMLDivElement>(null);

  const activeEmulator = emulators.find((e) => e.id === selectedEmulatorId) || emulators[0];
  const isRunning = telemetry?.isEmulatorRunning ?? false;

  // Auto-scroll when new logs arrive
  useEffect(() => {
    if (autoScroll && terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Handle Command Submission
  const handleExecuteCommand = async (cmdText?: string) => {
    const targetCmd = (cmdText || commandInput).trim();
    if (!targetCmd || isExecutingCmd) return;

    setIsExecutingCmd(true);
    setCommandHistory((prev) => [...prev, targetCmd]);
    setHistoryIndex(-1);
    setCommandInput('');

    try {
      await api.executeTerminalCommand(targetCmd);
    } catch (err) {
      console.error('Failed to execute command:', err);
    } finally {
      setIsExecutingCmd(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteCommand();
    } else if (e.key === 'ArrowUp') {
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex + 1 < commandHistory.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[commandHistory.length - 1 - nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setCommandInput(commandHistory[commandHistory.length - 1 - nextIdx] || '');
      } else {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    }
  };

  const QUICK_COMMANDS = ['help', 'fps 144', 'trim', 'priority High', 'affinity 0xF0', 'driver status', 'list profiles'];

  return (
    <div className="space-y-6 pb-8">
      {/* 3 Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Emulator Status */}
        <div className="bg-[#141419] rounded-2xl p-5 border border-[#252733] shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Tv className="w-5 h-5 text-[#39ff14]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#8892b0]">
                Emulator Status
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isRunning ? 'bg-[#39ff14] shadow-[0_0_8px_#39ff14]' : 'bg-[#e056fd]'
                }`}
              ></span>
              <span className="text-xs font-extrabold text-white">
                {isRunning ? 'RUNNING' : 'STANDBY'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-base font-bold text-white truncate">
              {isRunning ? telemetry?.emulatorStatus : activeEmulator ? activeEmulator.name : 'Select Emulator'}
            </div>
            <div className="text-xs text-[#64748b] mt-1 truncate">
              {isRunning
                ? `Process Hook: ${telemetry?.activeProcessName} (PID: ${telemetry?.activePid || 'Active'})`
                : 'Awaiting launch or process hook attachment'}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f202b] flex items-center justify-between text-xs">
            <span className="text-[#8892b0]">Target Hook</span>
            <span className="font-mono text-[#00e5ff] font-semibold">
              {activeEmulator?.type || 'BlueStacks 5'}
            </span>
          </div>
        </div>

        {/* ADB Connection */}
        <div className="bg-[#141419] rounded-2xl p-5 border border-[#252733] shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Wifi className="w-5 h-5 text-[#00e5ff]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#8892b0]">
                ADB Connection
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  telemetry?.isAdbConnected
                    ? 'bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]'
                    : 'bg-[#ff4444]'
                }`}
              ></span>
              <span className="text-xs font-extrabold text-white">
                {telemetry?.isAdbConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-base font-bold text-[#00e5ff] font-mono">
              {telemetry?.isAdbConnected
                ? `127.0.0.1:${customPort || activeEmulator?.adbPort || 5555}`
                : 'Bridge Offline'}
            </div>
            <div className="text-xs text-[#64748b] mt-1">
              Direct IOCTL pipe & ultra low-latency touch injection
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f202b] flex items-center justify-between text-xs">
            <span className="text-[#8892b0]">Port Override:</span>
            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                value={customPort}
                onChange={(e) => {
                  const p = parseInt(e.target.value) || 5555;
                  setCustomPort(p);
                  onUpdateAdbPort(p);
                }}
                className="w-18 h-7 px-2 rounded bg-[#181822] text-[#39ff14] border border-[#2d2d3b] text-xs font-mono font-bold text-center outline-none focus:border-[#39ff14]"
              />
            </div>
          </div>
        </div>

        {/* Optimizer Engine */}
        <div className="bg-[#141419] rounded-2xl p-5 border border-[#252733] shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Activity className="w-5 h-5 text-[#d500f9]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#8892b0]">
                Optimizer Engine
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isEngineActive ? 'bg-[#39ff14] shadow-[0_0_8px_#39ff14]' : 'bg-[#ffb300]'
                }`}
              ></span>
              <span className="text-xs font-extrabold text-white">
                {isEngineActive ? 'OPTIMIZED' : 'IDLE'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span>{isEngineActive ? 'AIM/OPT Kernel v3.0' : 'Engine Inactive'}</span>
              <span className="px-2 py-0.5 rounded bg-[#162b16] text-[#39ff14] text-[10px] font-extrabold border border-[#39ff14]/50">
                ACTIVE
              </span>
            </div>
            <div className="text-xs text-[#64748b] mt-1">
              DirectX 11 Duplication + OpenCV Color Analysis
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1f202b] flex items-center justify-between text-xs">
            <span className="text-[#8892b0]">FPS Telemetry</span>
            <span className="font-mono text-[#39ff14] font-bold">
              {telemetry ? `${telemetry.currentFps} / ${telemetry.targetFps} FPS` : '144 FPS Lock'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Action & Emulator Controls Card */}
      <div className="bg-[#141419] rounded-2xl p-6 border border-[#252733] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-[#1f202b]">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Detected Emulator Instances &amp; ADB Bridges</span>
            </h2>
            <p className="text-xs text-[#8892b0] mt-0.5">
              Select your active Android emulator environment or add a custom portable instance.
            </p>
          </div>

          {/* Top Button Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-add-custom-emulator"
              onClick={onOpenAddEmulatorModal}
              className="h-10 px-4 rounded-xl bg-[#181824] hover:bg-[#202030] text-[#00e5ff] border border-[#00e5ff]/50 font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Emulator</span>
            </button>

            {isRunning ? (
              <button
                id="btn-stop-emulator"
                onClick={onStopEmulator}
                className="h-10 px-5 rounded-xl bg-[#2a1616] hover:bg-[#3d1a1a] text-[#ff4444] border border-[#ff4444] font-extrabold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,68,68,0.3)]"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>TERMINATE EMULATOR</span>
              </button>
            ) : (
              <button
                id="btn-launch-emulator"
                onClick={onLaunchEmulator}
                className="h-10 px-5 rounded-xl bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] font-extrabold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(57,255,20,0.3)]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>LAUNCH &amp; HOOK</span>
              </button>
            )}
          </div>
        </div>

        {/* Emulator Selection Grid (Pinned Emulators First) */}
        {emulators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-5">
            {[...emulators]
              .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return 0;
              })
              .map((emu) => {
                const isSelected = emu.id === selectedEmulatorId;
                return (
                  <div
                    key={emu.id}
                    id={`emu-card-${emu.id}`}
                    onClick={() => onSelectEmulator(emu.id)}
                    className={`group p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                      isSelected
                        ? 'bg-[#182618] border-[#39ff14] shadow-[0_0_12px_rgba(57,255,20,0.2)]'
                        : 'bg-[#181822] border-[#252733] hover:border-[#39ff14]/50 text-[#8892b0]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] uppercase font-bold text-[#64748b]">
                            {emu.type}
                          </span>
                          {emu.isPinned && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#eab308]/20 text-[#eab308] border border-[#eab308]/40 flex items-center gap-0.5">
                              <Pin className="w-2.5 h-2.5 fill-current" />
                              <span>PINNED</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          {/* Pin / Unpin Button */}
                          {onTogglePinEmulator && (
                            <button
                              id={`btn-pin-emu-${emu.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePinEmulator(emu.id);
                              }}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                emu.isPinned
                                  ? 'bg-[#eab308]/20 text-[#eab308] hover:bg-[#eab308]/30 shadow-[0_0_8px_rgba(234,179,8,0.3)]'
                                  : 'text-[#64748b] hover:text-[#eab308] hover:bg-black/30'
                              }`}
                              title={emu.isPinned ? 'Unpin Emulator' : 'Pin Emulator to Top'}
                            >
                              <Pin className={`w-3 h-3 ${emu.isPinned ? 'fill-current' : ''}`} />
                            </button>
                          )}

                          {onDeleteEmulator && (
                            <button
                              id={`btn-del-emu-${emu.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEmulator(emu.id);
                              }}
                              className="p-1 rounded text-[#64748b] hover:text-[#ff4444] hover:bg-black/30 transition-colors cursor-pointer"
                              title={`Delete emulator ${emu.name}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}

                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected && isRunning ? 'bg-[#39ff14] shadow-[0_0_6px_#39ff14]' : 'bg-[#475569]'
                            }`}
                          ></span>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-white mt-1 truncate">{emu.name}</div>
                      <div className="text-[11px] font-mono text-[#00e5ff] mt-0.5">Port: {emu.adbPort}</div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#252733] flex items-center justify-between text-[10px]">
                      <span className="text-[#64748b]">{emu.version || 'Custom / Dynamic'}</span>
                      {isSelected && <span className="text-[#39ff14] font-bold">ACTIVE</span>}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="mt-5 p-8 rounded-xl bg-[#181822] border border-dashed border-[#252733] text-center">
            <Tv className="w-8 h-8 text-[#8892b0] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-white">No Emulator Instances Configured</p>
            <p className="text-xs text-[#8892b0] mt-1 max-w-md mx-auto">
              You have full control. Click <strong className="text-[#00e5ff]">+ Add Emulator</strong> above to connect your custom emulator executable path, ADB port, and custom emulator type.
            </p>
          </div>
        )}

        {/* Master Action Strip */}
        <div className="mt-6 pt-5 border-t border-[#1f202b] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              id="btn-master-initialize"
              onClick={onOptimizeEngine}
              className={`h-12 px-6 rounded-xl font-black text-sm flex items-center justify-center space-x-2.5 transition-all cursor-pointer w-full sm:w-auto ${
                isEngineActive
                  ? 'bg-[#1a2f1a] text-[#39ff14] border-2 border-[#39ff14] shadow-[0_0_20px_rgba(57,255,20,0.35)] hover:bg-[#234423]'
                  : 'bg-[#252733] text-white hover:bg-[#323544] border border-[#3e4256]'
              }`}
            >
              <Sparkles className="w-5 h-5 text-[#39ff14]" />
              <span>{isEngineActive ? '⚡ SYSTEM OPTIMIZED & LOCKED' : 'INITIALIZE & OPTIMIZE SYSTEM'}</span>
            </button>

            <button
              id="btn-flush-ram-cache"
              onClick={onFlushRam}
              className="h-12 px-5 rounded-xl bg-[#1a1e29] hover:bg-[#232938] text-[#00e5ff] border border-[#00e5ff] font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.2)] w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>FLUSH RAM CACHE</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-[#8892b0]">
            <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />
            <span>Process Scheduler Priority: <strong className="text-white">RealTime / High</strong></span>
          </div>
        </div>
      </div>

      {/* Live Neon Terminal Log with Interactive Command Execution */}
      <div className="bg-[#0b0b0f] rounded-2xl border border-[#252733] shadow-2xl overflow-hidden flex flex-col">
        {/* Terminal Header */}
        <div className="h-11 px-5 bg-[#14141c] border-b border-[#1f202b] flex items-center justify-between select-none">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-4 h-4 text-[#39ff14]" />
            <span className="text-xs font-bold text-white tracking-wider uppercase font-mono">
              LIVE ENGINE TERMINAL &amp; INTERACTIVE SHELL
            </span>
            <span className="px-2 py-0.5 rounded bg-[#162b16] text-[#39ff14] text-[10px] font-mono font-bold">
              IOCTL HOOK ACTIVE
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-toggle-autoscroll"
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                autoScroll
                  ? 'bg-[#182618] text-[#39ff14] border border-[#39ff14]/40'
                  : 'bg-[#1b1b26] text-[#8892b0]'
              }`}
            >
              Auto-Scroll: {autoScroll ? 'ON' : 'OFF'}
            </button>

            <button
              id="btn-clear-terminal-logs"
              onClick={onClearLogs}
              className="px-2.5 py-1 rounded bg-[#201416] hover:bg-[#301a1c] text-[#ff4444] border border-[#ff4444]/40 text-[11px] font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={terminalBodyRef}
          className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#09090d] select-text"
        >
          {logs.map((log, index) => {
            const isError = log.includes('error') || log.includes('Failed') || log.includes('exited') || log.includes('Error');
            const isSuccess = log.includes('ACTIVATED') || log.includes('Freed') || log.includes('OPTIMIZED') || log.includes('saved');
            const isAdb = log.includes('[ADB]') || log.includes('[ADB Output]') || log.includes('[Shell Output]');
            const isDriver = log.includes('[Driver]') || log.includes('[IOCTL]');
            const isUserPrompt = log.startsWith('>');

            let colorClass = 'text-[#ccd6f6]';
            if (isUserPrompt) colorClass = 'text-[#eab308] font-bold';
            else if (isError) colorClass = 'text-[#ff5555] font-semibold';
            else if (isSuccess) colorClass = 'text-[#39ff14] font-semibold';
            else if (isAdb) colorClass = 'text-[#00e5ff]';
            else if (isDriver) colorClass = 'text-[#d500f9]';

            return (
              <div key={index} className={`leading-relaxed tracking-tight ${colorClass}`}>
                {log}
              </div>
            );
          })}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-[#0d0e14] border-t border-[#1a1c26] flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-[#64748b] font-mono uppercase font-bold shrink-0">Quick Cmds:</span>
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => handleExecuteCommand(cmd)}
              className="px-2 py-0.5 rounded bg-[#161822] hover:bg-[#202434] text-[#00e5ff] border border-[#232838] hover:border-[#00e5ff]/50 font-mono text-[11px] shrink-0 transition-colors cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Command Input Prompt Bar */}
        <div className="p-3 bg-[#111218] border-t border-[#1f202b] flex items-center gap-2">
          <div className="flex items-center gap-1 text-[#39ff14] font-mono text-sm font-bold pl-2 select-none">
            <span>&gt;</span>
          </div>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecutingCmd}
            placeholder="Type terminal command (e.g. adb shell getprop, fps 144, trim, affinity 0xF0, help)..."
            className="flex-1 bg-transparent text-white font-mono text-xs outline-none placeholder:text-[#475569]"
          />
          <button
            type="button"
            onClick={() => handleExecuteCommand()}
            disabled={!commandInput.trim() || isExecutingCmd}
            className="h-8 px-3.5 rounded-lg bg-[#39ff14] hover:bg-[#32e012] disabled:opacity-30 disabled:hover:bg-[#39ff14] text-black font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Execute</span>
            <CornerDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
