import React, { useState } from 'react';
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
} from 'lucide-react';
import { InstalledEmulatorInfo, TelemetryData } from '../types';

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
}) => {
  const [customPort, setCustomPort] = useState<number>(5555);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  const activeEmulator = emulators.find((e) => e.id === selectedEmulatorId) || emulators[0];
  const isRunning = telemetry?.isEmulatorRunning ?? false;

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
              Low-latency command pipe & fast touch injection
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

        {/* Emulator Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
          {emulators.map((emu) => {
            const isSelected = emu.id === selectedEmulatorId;
            return (
              <div
                key={emu.id}
                id={`emu-card-${emu.id}`}
                onClick={() => onSelectEmulator(emu.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#182618] border-[#39ff14] shadow-[0_0_12px_rgba(57,255,20,0.2)]'
                    : 'bg-[#181822] border-[#252733] hover:border-[#39ff14]/50 text-[#8892b0]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#64748b]">
                      {emu.type}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected && isRunning ? 'bg-[#39ff14] shadow-[0_0_6px_#39ff14]' : 'bg-[#475569]'
                      }`}
                    ></span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1 truncate">{emu.name}</div>
                  <div className="text-[11px] font-mono text-[#00e5ff] mt-0.5">Port: {emu.adbPort}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#252733] flex items-center justify-between text-[10px]">
                  <span className="text-[#64748b]">{emu.version || '64-Bit'}</span>
                  {isSelected && <span className="text-[#39ff14] font-bold">ACTIVE</span>}
                </div>
              </div>
            );
          })}
        </div>

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
              <Sparkles className="w-5 h-5 text-[#39ff14] animate-spin" />
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

      {/* Live Neon Terminal Log */}
      <div className="bg-[#0b0b0f] rounded-2xl border border-[#252733] shadow-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="h-11 px-5 bg-[#14141c] border-b border-[#1f202b] flex items-center justify-between select-none">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-4 h-4 text-[#39ff14]" />
            <span className="text-xs font-bold text-white tracking-wider uppercase font-mono">
              LIVE ENGINE TERMINAL LOG
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
        <div className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-1.5 bg-[#09090d]">
          {logs.map((log, index) => {
            const isError = log.includes('error') || log.includes('Failed') || log.includes('exited');
            const isSuccess = log.includes('ACTIVATED') || log.includes('Freed') || log.includes('OPTIMIZED');
            const isAdb = log.includes('[ADB]');
            const isDriver = log.includes('[Driver]') || log.includes('[IOCTL]');

            let colorClass = 'text-[#ccd6f6]';
            if (isError) colorClass = 'text-[#ff5555] font-semibold';
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
      </div>
    </div>
  );
};
