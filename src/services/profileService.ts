import { PresetProfile } from '../types';
import { api } from './api';

export const profileService = {
  async getAllProfiles(): Promise<{ presets: PresetProfile[]; activePresetName: string }> {
    try {
      return await api.getPresets();
    } catch (err) {
      console.warn('API error, falling back to local profiles:', err);
      const stored = localStorage.getItem('aimopt_profiles');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          presets: Object.values(parsed.presets || {}),
          activePresetName: parsed.activePresetName || 'FreeFire_Opt',
        };
      }
      return { presets: [], activePresetName: 'FreeFire_Opt' };
    }
  },

  async getProfile(name: string): Promise<PresetProfile> {
    return await api.getPreset(name);
  },

  async createProfile(name: string, targetGame: string = 'General Android Game'): Promise<PresetProfile> {
    const newProfile: PresetProfile = {
      id: `profile_${Date.now()}`,
      name: name.trim().replace(/\s+/g, '_'),
      description: `Custom JSON Profile for ${targetGame}`,
      targetGame: targetGame,
      emulator: {
        processName: 'HD-Player.exe',
        executablePath: 'C:\\Program Files\\BlueStacks_nxt\\HD-Player.exe',
        priorityClass: 'High',
        affinityMask: 255,
        adbPort: 5555,
        autoLaunch: false,
      },
      performance: {
        targetFps: 120,
        enableCpuAffinity: true,
        enableRamOptimization: true,
        monitorIntervalMs: 1000,
        autoBoostFpsOnLaunch: true,
      },
      display: {
        width: 1920,
        height: 1080,
        dpi: 240,
        autoScaleResolution: true,
      },
      visualProcessing: {
        captureRegionX: 860,
        captureRegionY: 440,
        captureRegionWidth: 200,
        captureRegionHeight: 200,
        colorTolerance: 15,
        captureIntervalMs: 16,
      },
      overlay: {
        toggleHotkey: 'HOME',
        enableAutoHide: true,
        autoHideDelaySec: 4,
        transparency: 0.92,
        showFps: true,
        showSystemStats: true,
      },
      macroGraph: [
        {
          id: `node_start_${Date.now()}`,
          actionType: 'Event (Start)',
          parameters: 'Trigger: On Hotkey or Auto',
          positionX: 60,
          positionY: 100,
          nextNodes: [],
        },
      ],
    };

    const res = await api.savePreset(newProfile);
    return res.preset;
  },

  async saveProfile(profile: PresetProfile): Promise<PresetProfile> {
    const res = await api.savePreset(profile);
    return res.preset;
  },

  async deleteProfile(name: string): Promise<string> {
    const res = await api.deletePreset(name);
    return res.activePresetName;
  },

  async switchProfile(name: string): Promise<PresetProfile> {
    const res = await api.switchPreset(name);
    return res.activePreset;
  },
};
