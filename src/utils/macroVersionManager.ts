import { BlockNode, CustomBlockDefinition, MacroNode, MacroVariable, MacroVersionSnapshot } from '../types';

const STORAGE_VERSION_KEY = 'smartoptimizer_macro_versions';
const STORAGE_AUTOSAVE_KEY = 'smartoptimizer_macro_autosave';

export interface MacroExportPackage {
  app: 'SmartOptimizer';
  formatVersion: '3.5.0';
  exportedAt: string;
  metadata: {
    name: string;
    description: string;
    author?: string;
  };
  nodeGraph: MacroNode[];
  blockCoding: BlockNode[];
  variables: MacroVariable[];
  customBlocks: CustomBlockDefinition[];
  versionSnapshots?: MacroVersionSnapshot[];
}

export class MacroVersionManager {
  private snapshots: MacroVersionSnapshot[] = [];
  private currentVersionCounter: number = 1;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_VERSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.snapshots = parsed;
          this.currentVersionCounter = parsed.reduce((max, s) => Math.max(max, s.versionNumber || 1), 1) + 1;
        }
      }
    } catch (e) {
      this.snapshots = [];
    }
  }

  private saveToStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_VERSION_KEY, JSON.stringify(this.snapshots.slice(0, 30)));
    } catch (e) {
      // ignore
    }
  }

  public getSnapshots(): MacroVersionSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Create a new version snapshot
   */
  public createSnapshot(
    label: string,
    nodeGraph: MacroNode[],
    blockCoding: BlockNode[],
    variables: MacroVariable[],
    customBlocks: CustomBlockDefinition[] = [],
    isAutoSave: boolean = false,
    description?: string
  ): MacroVersionSnapshot {
    const snapshot: MacroVersionSnapshot = {
      id: `vsnap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      versionNumber: this.currentVersionCounter++,
      timestamp: new Date().toISOString(),
      label: label || `Snapshot v${this.currentVersionCounter - 1}`,
      description,
      nodeGraph: JSON.parse(JSON.stringify(nodeGraph)),
      blockCoding: JSON.parse(JSON.stringify(blockCoding)),
      variables: JSON.parse(JSON.stringify(variables)),
      customBlocks: JSON.parse(JSON.stringify(customBlocks)),
      isAutoSave,
    };

    // If auto-save, avoid duplicating exact consecutive auto-saves
    if (isAutoSave && this.snapshots.length > 0 && this.snapshots[0].isAutoSave) {
      this.snapshots[0] = snapshot;
    } else {
      this.snapshots.unshift(snapshot);
    }

    if (this.snapshots.length > 30) {
      this.snapshots.pop();
    }

    this.saveToStorage();
    return snapshot;
  }

  /**
   * Restore a snapshot. Before restoring, saves current state as a safety snapshot.
   */
  public restoreSnapshot(
    snapshotId: string,
    currentState: {
      nodeGraph: MacroNode[];
      blockCoding: BlockNode[];
      variables: MacroVariable[];
      customBlocks: CustomBlockDefinition[];
    }
  ): { success: boolean; restored?: MacroVersionSnapshot; backupSnapshot?: MacroVersionSnapshot; error?: string } {
    const target = this.snapshots.find((s) => s.id === snapshotId);
    if (!target) {
      return { success: false, error: 'Snapshot not found' };
    }

    // Safety backup of current state
    const backupSnapshot = this.createSnapshot(
      `Pre-Restore Backup (${new Date().toLocaleTimeString()})`,
      currentState.nodeGraph,
      currentState.blockCoding,
      currentState.variables,
      currentState.customBlocks,
      false,
      `Automatic safety backup created before restoring version v${target.versionNumber}`
    );

    return {
      success: true,
      restored: JSON.parse(JSON.stringify(target)),
      backupSnapshot,
    };
  }

  public deleteSnapshot(snapshotId: string) {
    this.snapshots = this.snapshots.filter((s) => s.id !== snapshotId);
    this.saveToStorage();
  }

  // --- Auto-Save Crash Recovery ---
  public saveAutoSave(
    nodeGraph: MacroNode[],
    blockCoding: BlockNode[],
    variables: MacroVariable[],
    customBlocks: CustomBlockDefinition[]
  ) {
    try {
      if (typeof localStorage === 'undefined') return;
      const data = {
        timestamp: new Date().toISOString(),
        nodeGraph,
        blockCoding,
        variables,
        customBlocks,
      };
      localStorage.setItem(STORAGE_AUTOSAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // ignore storage error
    }
  }

  public getAutoSave(): {
    timestamp: string;
    nodeGraph: MacroNode[];
    blockCoding: BlockNode[];
    variables: MacroVariable[];
    customBlocks: CustomBlockDefinition[];
  } | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(STORAGE_AUTOSAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      return null;
    }
    return null;
  }

  public clearAutoSave() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(STORAGE_AUTOSAVE_KEY);
    } catch (e) {}
  }
}

/**
 * Validates and parses an imported JSON file
 */
export function validateAndParseMacroPackage(jsonString: string): {
  isValid: boolean;
  package?: MacroExportPackage;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'Invalid JSON file content: Root is not an object.' };
    }

    // Check if it is a SmartOptimizer Export package or a raw Graph array
    if (Array.isArray(parsed)) {
      // Legacy Node Graph array format
      return {
        isValid: true,
        package: {
          app: 'SmartOptimizer',
          formatVersion: '3.5.0',
          exportedAt: new Date().toISOString(),
          metadata: { name: 'Imported Graph', description: 'Imported raw node graph array' },
          nodeGraph: parsed,
          blockCoding: [],
          variables: [],
          customBlocks: [],
        },
      };
    }

    // Full SmartOptimizer Package format
    const nodeGraph = Array.isArray(parsed.nodeGraph) ? parsed.nodeGraph : [];
    const blockCoding = Array.isArray(parsed.blockCoding) ? parsed.blockCoding : [];
    const variables = Array.isArray(parsed.variables) ? parsed.variables : [];
    const customBlocks = Array.isArray(parsed.customBlocks) ? parsed.customBlocks : [];

    // Validate block nodes integrity
    for (const b of blockCoding) {
      if (!b.id || !b.type) {
        return { isValid: false, error: 'Corrupted block structure: missing id or type.' };
      }
    }

    const pkg: MacroExportPackage = {
      app: 'SmartOptimizer',
      formatVersion: '3.5.0',
      exportedAt: parsed.exportedAt || new Date().toISOString(),
      metadata: parsed.metadata || { name: 'Imported Macro', description: 'Imported workflow' },
      nodeGraph,
      blockCoding,
      variables,
      customBlocks,
      versionSnapshots: Array.isArray(parsed.versionSnapshots) ? parsed.versionSnapshots : undefined,
    };

    return { isValid: true, package: pkg };
  } catch (err: any) {
    return { isValid: false, error: `JSON Parse failed: ${err.message}` };
  }
}
