import React from 'react';
import {
  Zap,
  Rocket,
  Palette,
  Settings,
  Monitor,
  Shield,
  Power,
  Crop,
  FileCode,
  Cpu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Crosshair,
} from 'lucide-react';
import { TelemetryData } from '../types';
import { Language, translations } from '../i18n/translations';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  telemetry: TelemetryData | null;
  onToggleOverlay: () => void;
  isOverlayOpen: boolean;
  onResetSystem: () => void;
  onOpenSnipper: () => void;
  onExitApplication?: () => void;
  lang?: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  telemetry,
  onToggleOverlay,
  isOverlayOpen,
  onResetSystem,
  onOpenSnipper,
  onExitApplication,
  lang = 'bn',
}) => {
  const t = translations[lang];
  const isBn = lang === 'bn';

  const navItems = [
    { id: 'Dashboard', label: t.navDashboard, icon: Zap, color: '#39ff14' },
    { id: 'Crosshair', label: isBn ? 'ক্রসহায়ার' : 'Crosshair', icon: Crosshair, color: '#39ff14' },
    { id: 'LogicIntelligence', label: t.navLogicIntelligence, icon: Cpu, color: '#00e5ff' },
    { id: 'Calibration', label: t.navCalibration, icon: Crop, color: '#39ff14' },
    { id: 'Macro', label: t.navMacroStudio, icon: Palette, color: '#d500f9' },
    { id: 'Performance', label: t.navPerformance, icon: Rocket, color: '#00e5ff' },
    { id: 'Settings', label: t.navSettings, icon: Settings, color: '#ffb300' },
  ];

  // VS Code style click logic:
  // 1. If collapsed: open and select
  // 2. If open and clicking currently active tab: collapse sidebar
  // 3. If open and clicking different tab: switch tab
  const handleItemClick = (id: string) => {
    if (isCollapsed) {
      onToggleCollapse();
      onNavigate(id);
    } else {
      if (currentPage === id) {
        onToggleCollapse(); // Collapse when clicking already active tab
      } else {
        onNavigate(id);
      }
    }
  };

  return (
    <aside
      className={`bg-[#101117] border-r border-[#1f202b] flex flex-col justify-between select-none h-full z-20 shrink-0 transition-all duration-200 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header & VS Code Collapse Toggle */}
      <div>
        <div className={`pt-4 pb-3 px-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <div className="flex items-center space-x-2 min-w-0">
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-black text-[#39ff14] tracking-tight drop-shadow-[0_0_12px_rgba(57,255,20,0.6)]">
                  AIM
                </span>
                <span className="text-2xl font-black text-white tracking-tight">/OPT</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#162b16] text-[#39ff14] border border-[#39ff14]/50 font-extrabold">
                v3.0
              </span>
            </div>
          ) : (
            <div
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl bg-[#162b16] border border-[#39ff14]/60 flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:scale-105 transition-transform"
              title={isBn ? 'সাইডবার প্রসারিত করুন' : 'Expand Sidebar'}
            >
              <span className="text-xs font-black text-[#39ff14]">A/O</span>
            </div>
          )}

          {/* Toggle Button */}
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg bg-[#181a24] hover:bg-[#232738] text-[#8892b0] hover:text-[#39ff14] transition-colors cursor-pointer"
              title={isBn ? 'সাইডবার ছোট করুন' : 'Collapse Sidebar to Slim Rail'}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div className="mx-3 mb-3 px-2 py-0.5 rounded-md bg-[#141d18] border border-[#39ff14]/40 flex items-center justify-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14] animate-pulse"></span>
            <span className="text-[9px] font-bold text-[#39ff14] tracking-wider uppercase truncate">
              {t.appSubtitle}
            </span>
          </div>
        )}

        {/* Navigation Rail / Items */}
        <nav className="px-2 space-y-1 mt-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id.toLowerCase()}`}
                onClick={() => handleItemClick(item.id)}
                className={`w-full rounded-xl flex items-center transition-all duration-150 cursor-pointer group relative ${
                  isCollapsed ? 'h-11 justify-center px-0' : 'h-11 px-3 space-x-3'
                } ${
                  isActive
                    ? 'bg-[#182618] text-[#39ff14] border border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.15)]'
                    : 'bg-transparent text-[#8892b0] hover:text-white hover:bg-[#161822] border border-transparent'
                }`}
                title={isCollapsed ? `${item.label} (${isBn ? 'ক্লিক করে খুলুন' : 'Click to Open'})` : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform duration-150 ${
                    isActive ? 'text-[#39ff14] scale-110' : 'text-[#64748b] group-hover:text-white'
                  }`}
                />
                {!isCollapsed && (
                  <span className="text-xs font-bold tracking-wide truncate">{item.label}</span>
                )}

                {/* Collapsed Tooltip Indicator */}
                {isCollapsed && isActive && (
                  <span className="absolute left-1 w-1 h-5 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14]" />
                )}
              </button>
            );
          })}

          {/* Quick In-Game HUD Toggle - REMOVED AS REQUESTED */}
        </nav>
      </div>

      {/* Footer: Live Telemetry & System Controls */}
      <div className="p-2 space-y-2 border-t border-[#1f202b]/70 bg-[#0c0d12]">
        {!isCollapsed ? (
          <div className="bg-[#141620] rounded-xl p-2.5 border border-[#232738]">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[9px] font-bold text-[#667085] uppercase">{t.cpuLoad}</div>
                <div className="text-xs font-bold text-[#00e5ff] mt-0.5">
                  {telemetry ? `${telemetry.cpuPercentage}%` : '8%'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold text-[#667085] uppercase">{t.ramUsage}</div>
                <div className="text-xs font-bold text-[#39ff14] mt-0.5">
                  {telemetry ? `${telemetry.ramUsageMb} MB` : '860 MB'}
                </div>
              </div>
            </div>

            <div className="mt-1.5 pt-1.5 border-t border-[#1f2330] flex items-center justify-between text-[9px]">
              <span className="text-[#667085] font-semibold flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-[#39ff14]" />
                {t.kernelIoctl}
              </span>
              <span className="text-[#39ff14] font-bold">READY</span>
            </div>
          </div>
        ) : (
          /* Collapsed Mini Footer Actions */
          <div className="space-y-1.5 flex flex-col items-center">
            <button
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl bg-[#151722] hover:bg-[#202538] text-[#8892b0] hover:text-[#39ff14] flex items-center justify-center transition-colors cursor-pointer"
              title={isBn ? 'সাইডবার বড় করুন' : 'Expand Sidebar'}
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
