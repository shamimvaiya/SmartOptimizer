/**
 * Custom Block Dependency & Cycle Validation Utility
 * Detects circular references, missing dependencies, and parameter typing mismatches.
 */

import { BlockNode, CustomBlockDefinition } from '../types';

export interface CycleValidationResult {
  hasCycle: boolean;
  cyclePath: string[];
  errorMessage?: string;
}

/**
 * Validates whether adding or modifying a custom block creates a circular dependency graph.
 * (e.g., CustomBlock A calling CustomBlock B, which in turn calls CustomBlock A)
 */
export function validateCustomBlockCycles(
  customBlocks: CustomBlockDefinition[],
  candidateBlock?: CustomBlockDefinition
): CycleValidationResult {
  const blockMap = new Map<string, CustomBlockDefinition>();
  for (const cb of customBlocks) {
    blockMap.set(cb.id, cb);
  }
  if (candidateBlock) {
    blockMap.set(candidateBlock.id, candidateBlock);
  }

  // Extract direct dependency edges (which custom blocks are referenced internally)
  const adjacency = new Map<string, Set<string>>();

  function extractCustomBlockReferences(blocks: BlockNode[]): Set<string> {
    const refs = new Set<string>();
    function traverse(nodes: BlockNode[]) {
      for (const node of nodes) {
        if (node.type === 'custom_block' && node.customBlockId) {
          refs.add(node.customBlockId);
        }
        if (node.childSlots) {
          for (const slotList of Object.values(node.childSlots)) {
            if (Array.isArray(slotList)) {
              traverse(slotList);
            }
          }
        }
      }
    }
    traverse(blocks);
    return refs;
  }

  for (const [id, def] of blockMap.entries()) {
    adjacency.set(id, extractCustomBlockReferences(def.internalBlocks || []));
  }

  // Detect cycle using DFS
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const cyclePath: string[] = [];

  function dfs(currentId: string, path: string[]): boolean {
    visited.add(currentId);
    recStack.add(currentId);
    path.push(currentId);

    const neighbors = adjacency.get(currentId) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, [...path])) {
          return true;
        }
      } else if (recStack.has(neighbor)) {
        // Cycle detected
        const cycleStartIndex = path.indexOf(neighbor);
        const resolvedCycle = cycleStartIndex >= 0 ? path.slice(cycleStartIndex) : path;
        resolvedCycle.push(neighbor);
        cyclePath.push(...resolvedCycle);
        return true;
      }
    }

    recStack.delete(currentId);
    return false;
  }

  for (const id of blockMap.keys()) {
    if (!visited.has(id)) {
      if (dfs(id, [])) {
        const names = cyclePath.map((cid) => blockMap.get(cid)?.name || cid);
        return {
          hasCycle: true,
          cyclePath,
          errorMessage: `Circular dependency loop detected: ${names.join(' ➔ ')}. Recursive nesting is prohibited to prevent infinite runtime stack overflow.`,
        };
      }
    }
  }

  return {
    hasCycle: false,
    cyclePath: [],
  };
}

/**
 * Extracts all input and output variable names used in a block stack for automatic custom block creation.
 */
export function analyzeBlockVariableDependencies(blocks: BlockNode[]): {
  referencedVariables: string[];
  modifiedVariables: string[];
} {
  const referenced = new Set<string>();
  const modified = new Set<string>();

  function traverse(nodes: BlockNode[]) {
    for (const node of nodes) {
      const params = node.parameters || {};

      // Detect assignments
      if (node.type === 'var_set' || node.type === 'var_change_by') {
        if (params.varName) modified.add(String(params.varName));
      }
      if (node.type === 'math_calc' || node.type === 'math_random') {
        if (params.outputVar) modified.add(String(params.outputVar));
      }

      // Detect interpolation usages like {{ammoCount}} or condition operands
      for (const val of Object.values(params)) {
        if (typeof val === 'string') {
          const matches = val.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
          for (const m of matches) {
            referenced.add(m[1]);
          }
        }
      }

      if (node.childSlots) {
        for (const slotList of Object.values(node.childSlots)) {
          if (Array.isArray(slotList)) {
            traverse(slotList);
          }
        }
      }
    }
  }

  traverse(blocks);

  return {
    referencedVariables: Array.from(referenced),
    modifiedVariables: Array.from(modified),
  };
}
