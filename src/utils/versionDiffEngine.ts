/**
 * Version Snapshot Diff Engine
 * Computes deep visual diff between two macro snapshots.
 */

import { BlockNode, MacroVariable, MacroVersionSnapshot, VersionDiffResult } from '../types';

export function computeVersionDiff(
  vOld: MacroVersionSnapshot,
  vNew: MacroVersionSnapshot
): VersionDiffResult {
  const oldBlocks = flattenBlocks(vOld.blockCoding || []);
  const newBlocks = flattenBlocks(vNew.blockCoding || []);

  const oldMap = new Map<string, BlockNode>();
  for (const b of oldBlocks) {
    oldMap.set(b.id, b);
  }

  const newMap = new Map<string, BlockNode>();
  for (const b of newBlocks) {
    newMap.set(b.id, b);
  }

  const addedBlocks: BlockNode[] = [];
  const removedBlocks: BlockNode[] = [];
  const modifiedBlocks: VersionDiffResult['modifiedBlocks'] = [];

  // Find added and modified
  for (const [id, nBlock] of newMap.entries()) {
    const oBlock = oldMap.get(id);
    if (!oBlock) {
      addedBlocks.push(nBlock);
    } else {
      const changes: string[] = [];
      if (oBlock.title !== nBlock.title) {
        changes.push(`Title changed from "${oBlock.title}" to "${nBlock.title}"`);
      }
      if (oBlock.isDisabled !== nBlock.isDisabled) {
        changes.push(`Disabled status changed to ${nBlock.isDisabled}`);
      }

      // Check parameter changes
      const oldParams = oBlock.parameters || {};
      const newParams = nBlock.parameters || {};
      const allParamKeys = new Set([...Object.keys(oldParams), ...Object.keys(newParams)]);
      for (const k of allParamKeys) {
        if (JSON.stringify(oldParams[k]) !== JSON.stringify(newParams[k])) {
          changes.push(`Param "${k}": ${JSON.stringify(oldParams[k])} ➔ ${JSON.stringify(newParams[k])}`);
        }
      }

      // Check slot children counts
      const oSlots = oBlock.childSlots || {};
      const nSlots = nBlock.childSlots || {};
      const allSlotKeys = new Set([...Object.keys(oSlots), ...Object.keys(nSlots)]);
      for (const sk of allSlotKeys) {
        const oCount = (oSlots[sk] || []).length;
        const nCount = (nSlots[sk] || []).length;
        if (oCount !== nCount) {
          changes.push(`Slot "${sk}" children count: ${oCount} ➔ ${nCount}`);
        }
      }

      if (changes.length > 0) {
        modifiedBlocks.push({
          blockId: id,
          title: nBlock.title,
          changes,
          oldBlock: oBlock,
          newBlock: nBlock,
        });
      }
    }
  }

  // Find removed
  for (const [id, oBlock] of oldMap.entries()) {
    if (!newMap.has(id)) {
      removedBlocks.push(oBlock);
    }
  }

  // Variable changes
  const variableChanges: VersionDiffResult['variableChanges'] = [];
  const oldVars = new Map<string, MacroVariable>();
  for (const v of vOld.variables || []) {
    oldVars.set(v.name, v);
  }
  const newVars = new Map<string, MacroVariable>();
  for (const v of vNew.variables || []) {
    newVars.set(v.name, v);
  }

  for (const [name, nVar] of newVars.entries()) {
    const oVar = oldVars.get(name);
    if (!oVar) {
      variableChanges.push({
        name,
        type: 'added',
        newValue: nVar.defaultValue ?? nVar.value,
      });
    } else if (JSON.stringify(oVar.value) !== JSON.stringify(nVar.value) || oVar.type !== nVar.type) {
      variableChanges.push({
        name,
        type: 'changed',
        oldValue: oVar.value,
        newValue: nVar.value,
      });
    }
  }

  for (const [name, oVar] of oldVars.entries()) {
    if (!newVars.has(name)) {
      variableChanges.push({
        name,
        type: 'removed',
        oldValue: oVar.defaultValue ?? oVar.value,
      });
    }
  }

  return {
    addedBlocks,
    removedBlocks,
    modifiedBlocks,
    variableChanges,
  };
}

function flattenBlocks(blocks: BlockNode[]): BlockNode[] {
  const result: BlockNode[] = [];
  function traverse(nodes: BlockNode[]) {
    for (const node of nodes) {
      result.push(node);
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
  return result;
}
