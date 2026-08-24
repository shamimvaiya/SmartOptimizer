import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PerformanceView } from './components/PerformanceView';
import { VisualMacroStudio } from './components/VisualMacroStudio';
import { SettingsOverlayView } from './components/SettingsOverlayView';
import { StealthHUDOverlay } from './components/StealthHUDOverlay';
import { AddEmulatorModal } from './components/AddEmulatorModal';
import { PresetModal } from './components/PresetModal';
import { SmartSnippingOverlay } from './components/SmartSnippingOverlay';
import { CalibrationView } from './components/CalibrationView';
import { CsharpWpfCodeView } from './components/CsharpWpfCodeView';
import { LogicIntelligenceView } from './components/LogicIntelligenceView';
import { api } from './services/api';
import { GlobalConfig, InstalledEmulatorInfo, MacroNode, PresetProfile, TelemetryData, SnipData, VisualProcessingConfig } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('Dashboard');
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig | null>(null);
  const [presets, setPresets] = useState<PresetProfile[]>([]);
  const [activePreset, setActivePreset] = useState<PresetProfile | null>(null);
  const [emulators, setEmulators] = useState<InstalledEmulatorInfo[]>([]);
  const [selectedEmulatorId, setSelectedEmulatorId] = useState<string>('emu_bs5');
  const [logs, setLogs] = useState<string[]>([]);
  const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(true);
  const [isAddEmulatorOpen, setIsAddEmulatorOpen] = useState<boolean>(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);
  const [isMacroRunning, setIsMacroRunning] = useState<boolean>(false);
  const [isSnipperOpen, setIsSnipperOpen] = useState<boolean>(false);
  const [activeSnip, setActiveSnip] = useState<SnipData | null>({
    x: 860,
    y: 440,
    width: 200,
    height: 200,
    colorHex: '#39FF14',
    timestamp: new Date().toISOString(),
  });

  // Initial Load
  const loadInitialData = useCallback(async () => {
    try {
      const [configData, presetsData, emusData, logsData, telemetryData] = await Promise.all([
        api.getConfig(),
        api.getPresets(),
        api.getEmulators(),
        api.getLogs(),
        api.getTelemetry(),
      ]);

      setGlobalConfig(configData.globalConfig);
      setActivePreset(configData.activePreset);
      setPresets(presetsData.presets);
      setEmulators(emusData.emulators);
      if (emusData.emulators.length > 0) {
        setSelectedEmulatorId(emusData.emulators[0].id);
      }
      setLogs(logsData.logs);
      setTelemetry(telemetryData);
      setIsMacroRunning(telemetryData.isMacroRunning || false);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Telemetry Polling (every 1.2s)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [tel, lgs] = await Promise.all([api.getTelemetry(), api.getLogs()]);
        setTelemetry(tel);
        setLogs(lgs.logs);
        setIsMacroRunning(tel.isMacroRunning || false);
      } catch (e) {
        // ignore polling error
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Global Hotkey Listener for Stealth HUD
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const currentHotkey = (
        activePreset?.overlay?.toggleHotkey ||
        globalConfig?.defaultHotkey ||
        'HOME'
      ).toUpperCase();

      let pressedKey = e.key.toUpperCase();
      if (pressedKey === ' ') pressedKey = 'SPACE';
      if (pressedKey === 'ESCAPE') pressedKey = 'ESC';

      if (pressedKey === currentHotkey) {
        e.preventDefault();
        setIsOverlayOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activePreset, globalConfig]);

  // Log append helper
  const handleAddLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  // Preset switching
  const handleSwitchPreset = async (name: string) => {
    try {
      const res = await api.switchPreset(name);
      if (res.activePreset) {
        setActivePreset(res.activePreset);
        if (globalConfig) {
          setGlobalConfig({ ...globalConfig, activePresetName: name });
        }
      }
    } catch (e) {
      console.error('Switch preset failed:', e);
    }
  };

  // Preset saving
  const handleSavePreset = async (preset: PresetProfile) => {
    try {
      const res = await api.savePreset(preset);
      if (res.preset) {
        setActivePreset(res.preset);
        setPresets((prev) => {
          const idx = prev.findIndex((p) => p.name === res.preset.name);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = res.preset;
            return updated;
          }
          return [...prev, res.preset];
        });
      }
    } catch (e) {
      console.error('Save preset failed:', e);
    }
  };

  // Preset Duplicate
  const handleDuplicatePreset = async () => {
    if (!activePreset) return;
    const newName = `${activePreset.name}_Copy`;
    const res = await api.duplicatePreset(activePreset.name, newName);
    if (res.preset) {
      setPresets((prev) => [...prev, res.preset]);
      setActivePreset(res.preset);
    }
  };

  // Preset Delete
  const handleDeletePreset = async () => {
    if (!activePreset) return;
    if (presets.length <= 1) {
      alert('Cannot delete the only available profile.');
      return;
    }
    const confirmed = confirm(`Are you sure you want to delete profile '${activePreset.name}'?`);
    if (!confirmed) return;

    const res = await api.deletePreset(activePreset.name);
    if (res.success) {
      const remaining = presets.filter((p) => p.name !== activePreset.name);
      setPresets(remaining);
      const nextActive = remaining[0];
      if (nextActive) setActivePreset(nextActive);
    }
  };

  // Emulator actions
  const handleLaunchEmulator = async () => {
    try {
      await api.launchEmulator(selectedEmulatorId);
      const tel = await api.getTelemetry();
      setTelemetry(tel);
    } catch (e) {
      console.error('Launch emulator error:', e);
    }
  };

  const handleStopEmulator = async () => {
    try {
      await api.stopEmulator();
      const tel = await api.getTelemetry();
      setTelemetry(tel);
    } catch (e) {
      console.error('Stop emulator error:', e);
    }
  };

  const handleOptimizeEngine = async () => {
    try {
      const res = await api.toggleEngine();
      const tel = await api.getTelemetry();
      setTelemetry(tel);
    } catch (e) {
      console.error('Toggle engine error:', e);
    }
  };

  const handleFlushRam = async () => {
    try {
      const res = await api.optimizeMemory();
      if (res.success) {
        handleAddLog(`[Memory] Flushed RAM working set: Freed ${res.freedMb} MB.`);
      }
    } catch (e) {
      console.error('Flush RAM error:', e);
    }
  };

  const handleClearLogs = async () => {
    try {
      const res = await api.clearLogs();
      setLogs(res.logs);
    } catch (e) {
      console.error('Clear logs error:', e);
    }
  };

  // Performance Tweaks apply
  const handleApplyPerformanceTweaks = async (tweaks: {
    priority: string;
    cpuAffinityMask: number;
    targetFps: number;
    dpi: number;
  }) => {
    if (!activePreset) return;
    const updated: PresetProfile = {
      ...activePreset,
      emulator: {
        ...activePreset.emulator,
        priorityClass: tweaks.priority as any,
        affinityMask: tweaks.cpuAffinityMask,
      },
      performance: {
        ...activePreset.performance,
        targetFps: tweaks.targetFps,
      },
      display: {
        ...activePreset.display,
        dpi: tweaks.dpi,
      },
    };

    await api.applyTweaks({
      priority: tweaks.priority,
      cpuAffinityMask: tweaks.cpuAffinityMask,
      targetFps: tweaks.targetFps,
      dpi: tweaks.dpi,
    });
    await handleSavePreset(updated);
  };

  const handleSendAdbFps = async (fps: number) => {
    await api.sendAdbCommand({ fps });
    handleAddLog(`[ADB] Injected target FPS: ${fps}`);
  };

  const handleSendAdbDpi = async (dpi: number) => {
    await api.sendAdbCommand({ dpi });
    handleAddLog(`[ADB] Injected WM Density: ${dpi} DPI`);
  };

  // Macro handlers
  const handleSaveGraph = async (graph: MacroNode[]) => {
    if (!activePreset) return;
    const updated = { ...activePreset, macroGraph: graph };
    await handleSavePreset(updated);
  };

  const handleRunMacro = async (graph: MacroNode[]) => {
    await api.runMacro(graph);
    setIsMacroRunning(true);
  };

  const handleStopMacro = async () => {
    await api.stopMacro();
    setIsMacroRunning(false);
  };

  // Settings handlers
  const handleSaveHotkey = async (newHotkey: string) => {
    if (!activePreset) return;
    const updated = {
      ...activePreset,
      overlay: { ...activePreset.overlay, toggleHotkey: newHotkey },
    };
    await handleSavePreset(updated);
    if (globalConfig) {
      await api.updateConfig({ defaultHotkey: newHotkey });
    }
  };

  const handleToggleAutoHide = async (autoHide: boolean) => {
    if (!activePreset) return;
    const updated = {
      ...activePreset,
      overlay: { ...activePreset.overlay, enableAutoHide: autoHide },
    };
    await handleSavePreset(updated);
  };

  const handleUpdateProcessOverride = async (processName: string) => {
    if (!activePreset) return;
    const updated = {
      ...activePreset,
      emulator: { ...activePreset.emulator, processName },
    };
    await handleSavePreset(updated);
    await api.applyTweaks({ processOverride: processName });
  };

  const handleAddCustomEmulator = async (data: {
    name: string;
    executablePath: string;
    adbPort: number;
    type: string;
  }) => {
    const res = await api.addCustomEmulator(data);
    if (res.emulator) {
      setEmulators((prev) => [...prev, res.emulator]);
      setSelectedEmulatorId(res.emulator.id);
    }
  };

  const handleResetSystem = async () => {
    await api.optimizeMemory();
    await loadInitialData();
  };

  // Visual processing config saving
  const handleSaveVisualConfig = async (config: VisualProcessingConfig) => {
    if (!activePreset) return;
    const updated = {
      ...activePreset,
      visualProcessing: config,
    };
    await handleSavePreset(updated);
  };

  // Get Page Title
  const getPageTitle = () => {
    switch (currentPage) {
      case 'Dashboard':
        return 'System Overview & Emulator Telemetry';
      case 'LogicIntelligence':
        return 'Logic & Intelligence Layer (Engine, Scripting & Anti-Detect)';
      case 'Calibration':
        return 'Smart Snipping Tool & Visual Calibration Suite';
      case 'Macro':
        return 'Visual Macro Studio (Node Graph & Automation)';
      case 'Performance':
        return 'Performance Engine & Core Tuning';
      case 'CsharpWpf':
        return 'C# .NET 8 & WPF Production Architecture';
      case 'Settings':
        return 'Stealth HUD & System Configuration';
      default:
        return 'Optimizer Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-[#0c0c10] text-[#ccd6f6] overflow-hidden font-['Outfit',sans-serif]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        telemetry={telemetry}
        onToggleOverlay={() => setIsOverlayOpen((prev) => !prev)}
        isOverlayOpen={isOverlayOpen}
        onResetSystem={handleResetSystem}
        onOpenSnipper={() => setIsSnipperOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          pageTitle={getPageTitle()}
          presets={presets}
          selectedPresetName={activePreset?.name || ''}
          onSwitchPreset={handleSwitchPreset}
          onOpenNewPresetModal={() => setIsPresetModalOpen(true)}
          onDeletePreset={handleDeletePreset}
          overlayHotkey={activePreset?.overlay?.toggleHotkey || globalConfig?.defaultHotkey || 'HOME'}
          onToggleOverlay={() => setIsOverlayOpen((prev) => !prev)}
          onOpenSnipper={() => setIsSnipperOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6">
          {currentPage === 'Dashboard' && (
            <DashboardView
              telemetry={telemetry}
              emulators={emulators}
              selectedEmulatorId={selectedEmulatorId}
              onSelectEmulator={setSelectedEmulatorId}
              onLaunchEmulator={handleLaunchEmulator}
              onStopEmulator={handleStopEmulator}
              onOptimizeEngine={handleOptimizeEngine}
              onFlushRam={handleFlushRam}
              logs={logs}
              onClearLogs={handleClearLogs}
              onOpenAddEmulatorModal={() => setIsAddEmulatorOpen(true)}
              isEngineActive={telemetry?.isEngineActive ?? true}
              onUpdateAdbPort={(port) => {
                if (activePreset) {
                  api.applyTweaks({ adbPort: port });
                }
              }}
            />
          )}

          {currentPage === 'LogicIntelligence' && activePreset && (
            <LogicIntelligenceView
              activePreset={activePreset}
              onSavePreset={handleSavePreset}
              onLog={handleAddLog}
            />
          )}

          {currentPage === 'Calibration' && activePreset && (
            <CalibrationView
              activeSnip={activeSnip}
              onSnipChange={setActiveSnip}
              onOpenSnipper={() => setIsSnipperOpen(true)}
              visualConfig={
                activePreset.visualProcessing || {
                  enableOpenCvSearch: true,
                  captureRegionX: 860,
                  captureRegionY: 440,
                  captureRegionWidth: 200,
                  captureRegionHeight: 200,
                  confidenceThreshold: 0.85,
                  colorTolerance: 15,
                  matchTemplateName: 'crosshair_target.png',
                }
              }
              onSaveVisualConfig={handleSaveVisualConfig}
              onLog={handleAddLog}
            />
          )}

          {currentPage === 'Performance' && activePreset && (
            <PerformanceView
              activePreset={activePreset}
              onApplyTweaks={handleApplyPerformanceTweaks}
              onSendAdbFps={handleSendAdbFps}
              onSendAdbDpi={handleSendAdbDpi}
            />
          )}

          {currentPage === 'Macro' && (
            <VisualMacroStudio
              initialGraph={activePreset?.macroGraph || []}
              onSaveGraph={handleSaveGraph}
              onRunMacro={handleRunMacro}
              onStopMacro={handleStopMacro}
              isMacroRunning={isMacroRunning}
              onLog={handleAddLog}
              activeSnip={activeSnip}
              onOpenSnipper={() => setIsSnipperOpen(true)}
            />
          )}

          {currentPage === 'CsharpWpf' && <CsharpWpfCodeView />}

          {currentPage === 'Settings' && activePreset && globalConfig && (
            <SettingsOverlayView
              globalConfig={globalConfig}
              activePreset={activePreset}
              onSaveHotkey={handleSaveHotkey}
              onToggleAutoHide={handleToggleAutoHide}
              onUpdateProcessOverride={handleUpdateProcessOverride}
              onCreatePresetModal={() => setIsPresetModalOpen(true)}
              onDuplicatePreset={handleDuplicatePreset}
              onDeletePreset={handleDeletePreset}
            />
          )}
        </main>
      </div>

      {/* Lightshot-style Smart Snipping Tool Fullscreen Window Overlay */}
      <SmartSnippingOverlay
        isOpen={isSnipperOpen}
        onClose={() => setIsSnipperOpen(false)}
        onConfirm={(snip) => {
          setActiveSnip(snip);
          if (activePreset) {
            handleSaveVisualConfig({
              ...(activePreset.visualProcessing || {
                enableOpenCvSearch: true,
                captureRegionX: 860,
                captureRegionY: 440,
                captureRegionWidth: 200,
                captureRegionHeight: 200,
                confidenceThreshold: 0.85,
                colorTolerance: 15,
                matchTemplateName: 'crosshair_target.png',
              }),
              captureRegionX: snip.x,
              captureRegionY: snip.y,
              captureRegionWidth: snip.width,
              captureRegionHeight: snip.height,
            });
          }
        }}
        onLog={handleAddLog}
      />

      {/* Floating Stealth In-Game HUD Overlay */}
      <StealthHUDOverlay
        telemetry={telemetry}
        activePresetName={activePreset?.name || 'FreeFire_Opt'}
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        autoHideEnabled={activePreset?.overlay?.enableAutoHide ?? true}
        hotkey={activePreset?.overlay?.toggleHotkey || globalConfig?.defaultHotkey || 'HOME'}
      />

      {/* Add Emulator Modal */}
      <AddEmulatorModal
        isOpen={isAddEmulatorOpen}
        onClose={() => setIsAddEmulatorOpen(false)}
        onAdd={handleAddCustomEmulator}
      />

      {/* New Preset Profile Modal */}
      {activePreset && (
        <PresetModal
          isOpen={isPresetModalOpen}
          onClose={() => setIsPresetModalOpen(false)}
          onSave={handleSavePreset}
          basePreset={activePreset}
        />
      )}
    </div>
  );
};
