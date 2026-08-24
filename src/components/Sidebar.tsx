import React from 'react';
import { Zap, Rocket, Palette, Settings, Monitor, Shield, Power, Crop, FileCode, Cpu } from 'lucide-react';
import { TelemetryData } from '../types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  telemetry: TelemetryData | null;
  onToggleOverlay: () => void;
  isOverlayOpen: boolean;
  onResetSystem: () => void;
  onOpenSnipper: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  telemetry,
  onToggleOverlay,
  isOverlayOpen,
  onResetSystem,
  onOpenSnipper,
}) => {
  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: Zap, color: '#39ff14' },
    { id: 'LogicIntelligence', label: 'Logic & Intelligence', icon: Cpu, color: '#00e5ff' },
    { id: 'Calibration', label: 'Snipping & Calibration', icon: Crop, color: '#39ff14' },
    { id: 'Macro', label: 'Visual Macro Studio', icon: Palette, color: '#d500f9' },
    { id: 'Performance', label: 'Performance Engine', icon: Rocket, color: '#00e5ff' },
    { id: 'CsharpWpf', label: 'C# / WPF .NET 8 Code', icon: FileCode, color: '#ffd600' },
    { id: 'Settings', label: 'Settings & Stealth HUD', icon: Settings, color: '#ffb300' },
  ];

  return (
    <aside className="w-64 bg-[#111116] border-r border-[#1f202b] flex flex-col justify-between select-none h-full z-20 shrink-0">
      {/* Brand Header */}
      <div className="pt-6 pb-4 px-5 flex flex-col items-center">
        <div className="flex items-center space-x-1">
          <span className="text-3xl font-black text-[#39ff14] tracking-tight drop-shadow-[0_0_12px_rgba(57,255,20,0.6)]">
            AIM
          </span>
          <span className="text-3xl font-black text-white tracking-tight">/OPT</span>
        </div>

        <div className="mt-2 px-2.5 py-0.5 rounded-full bg-[#162b16] border border-[#39ff14]/70 flex items-center space-x-1.5 shadow-[0_0_8px_rgba(57,255,20,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse"></span>
          <span className="text-[10px] font-bold text-[#39ff14] tracking-wider uppercase">
            PRO OPTIMIZER v3.0
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="px-3 space-y-1.5 flex-1 mt-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id.toLowerCase()}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full h-12 px-4 rounded-xl flex items-center space-x-3.5 font-bold text-sm transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#1a2a1a] text-[#39ff14] border border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.15)]'
                  : 'bg-transparent text-[#8892b0] hover:text-white hover:bg-[#16161e] border border-transparent'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'text-[#39ff14] scale-110' : 'text-[#64748b]'
                }`}
              />
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}

        {/* Quick HUD Toggle Button */}
        <div className="pt-3">
          <button
            id="toggle-hud-sidebar-btn"
            onClick={onToggleOverlay}
            className={`w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all duration-200 cursor-pointer ${
              isOverlayOpen
                ? 'bg-[#002b30] border-[#00e5ff] text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                : 'bg-[#16161e] border-[#252733] text-[#8892b0] hover:text-[#00e5ff] hover:border-[#00e5ff]/50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-[#00e5ff]" />
              <span>In-Game HUD</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                isOverlayOpen ? 'bg-[#00e5ff] text-black' : 'bg-[#252733] text-[#8892b0]'
              }`}
            >
              {isOverlayOpen ? 'VISIBLE' : 'HIDDEN'}
            </span>
          </button>
        </div>
      </nav>

      {/* Footer: Live Telemetry & System Controls */}
      <div className="p-4 space-y-3 border-t border-[#1f202b]/60">
        {/* Telemetry Card */}
        <div className="bg-[#16161d] rounded-xl p-3 border border-[#252733] shadow-inner">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
                CPU LOAD
              </div>
              <div className="text-sm font-bold text-[#00e5ff] mt-0.5">
                {telemetry ? `${telemetry.cpuPercentage}%` : '8%'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">
                RAM USAGE
              </div>
              <div className="text-sm font-bold text-[#39ff14] mt-0.5">
                {telemetry ? `${telemetry.ramUsageMb} MB` : '860 MB'}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#20222b] flex items-center justify-between text-[10px]">
            <span className="text-[#667085] font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#39ff14]" />
              Kernel IOCTL
            </span>
            <span className="text-[#39ff14] font-bold">READY</span>
          </div>
        </div>

        {/* Exit / Reset System Button */}
        <button
          id="btn-exit-app"
          onClick={onResetSystem}
          className="w-full h-10 rounded-xl bg-[#241416] hover:bg-[#34181b] border border-[#ff4444]/60 hover:border-[#ff4444] text-[#ff4444] font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-[0_0_10px_rgba(255,68,68,0.15)]"
        >
          <Power className="w-3.5 h-3.5" />
          <span>RESTART ENGINE</span>
        </button>
      </div>
    </aside>
  );
};
