import { GlobalConfig, InstalledEmulatorInfo, LogEntry, PresetProfile, TelemetryData } from '../types';

const API_BASE = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getConfig(): Promise<{ globalConfig: GlobalConfig; activePreset: PresetProfile }> {
    const res = await fetch(`${API_BASE}/config`);
    return res.json();
  },

  async updateConfig(config: Partial<GlobalConfig>): Promise<{ success: boolean; globalConfig: GlobalConfig }> {
    const res = await fetch(`${API_BASE}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.json();
  },

  async getPresets(): Promise<{ presets: PresetProfile[]; activePresetName: string }> {
    const res = await fetch(`${API_BASE}/presets`);
    return res.json();
  },

  async getPreset(name: string): Promise<PresetProfile> {
    const res = await fetch(`${API_BASE}/presets/${encodeURIComponent(name)}`);
    return res.json();
  },

  async savePreset(preset: PresetProfile): Promise<{ success: boolean; preset: PresetProfile }> {
    const res = await fetch(`${API_BASE}/presets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preset),
    });
    return res.json();
  },

  async duplicatePreset(sourceName: string, newName: string): Promise<{ success: boolean; preset: PresetProfile }> {
    const res = await fetch(`${API_BASE}/presets/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceName, newName }),
    });
    return res.json();
  },

  async deletePreset(name: string): Promise<{ success: boolean; activePresetName: string }> {
    const res = await fetch(`${API_BASE}/presets/${encodeURIComponent(name)}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async switchPreset(name: string): Promise<{ success: boolean; activePreset: PresetProfile }> {
    const res = await fetch(`${API_BASE}/presets/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return res.json();
  },

  async getEmulators(): Promise<{ emulators: InstalledEmulatorInfo[]; activeEmulator: InstalledEmulatorInfo | null }> {
    const res = await fetch(`${API_BASE}/emulators`);
    return res.json();
  },

  async addCustomEmulator(data: { name: string; executablePath: string; adbPort?: number; type?: string }) {
    const res = await fetch(`${API_BASE}/emulators/custom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async launchEmulator(emulatorId: string) {
    const res = await fetch(`${API_BASE}/emulators/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emulatorId }),
    });
    return res.json();
  },

  async stopEmulator() {
    const res = await fetch(`${API_BASE}/emulators/stop`, {
      method: 'POST',
    });
    return res.json();
  },

  async toggleEngine(): Promise<{ isEngineActive: boolean }> {
    const res = await fetch(`${API_BASE}/engine/toggle`, {
      method: 'POST',
    });
    return res.json();
  },

  async optimizeMemory(): Promise<{ success: boolean; freedMb: number }> {
    const res = await fetch(`${API_BASE}/engine/optimize-memory`, {
      method: 'POST',
    });
    return res.json();
  },

  async applyTweaks(tweaks: {
    priority?: string;
    cpuAffinityMask?: number;
    targetFps?: number;
    dpi?: number;
    adbPort?: number;
    processOverride?: string;
  }) {
    const res = await fetch(`${API_BASE}/engine/apply-tweaks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tweaks),
    });
    return res.json();
  },

  async sendAdbCommand(params: { command?: string; x?: number; y?: number; fps?: number; dpi?: number }) {
    const res = await fetch(`${API_BASE}/adb/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async runMacro(graph: any[]) {
    const res = await fetch(`${API_BASE}/macro/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ graph }),
    });
    return res.json();
  },

  async stopMacro() {
    const res = await fetch(`${API_BASE}/macro/stop`, {
      method: 'POST',
    });
    return res.json();
  },

  async getTelemetry(): Promise<TelemetryData> {
    const res = await fetch(`${API_BASE}/telemetry`);
    return res.json();
  },

  async getLogs(): Promise<{ logs: string[] }> {
    const res = await fetch(`${API_BASE}/logs`);
    return res.json();
  },

  async clearLogs(): Promise<{ success: boolean; logs: string[] }> {
    const res = await fetch(`${API_BASE}/logs`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
