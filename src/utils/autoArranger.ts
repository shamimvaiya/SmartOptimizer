import { MacroNode } from '../types';

export interface LayoutOptions {
  horizontalSpacing?: number;
  verticalSpacing?: number;
  startX?: number;
  startY?: number;
}

/**
 * Topological / Layered Auto-Arranger for Macro Graphs.
 * Analyzes connections and positions nodes in clean hierarchical execution columns.
 */
export function autoArrangeNodes(
  nodes: MacroNode[],
  options: LayoutOptions = {}
): MacroNode[] {
  if (nodes.length === 0) return [];

  const horizontalSpacing = options.horizontalSpacing ?? 280;
  const verticalSpacing = options.verticalSpacing ?? 140;
  const startX = options.startX ?? 80;
  const startY = options.startY ?? 100;

  const nodeMap = new Map<string, MacroNode>();
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  nodes.forEach((n) => {
    nodeMap.set(n.id, { ...n });
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  });

  // Build graph edges from nextNodes, conditionBranch, and loopBranch
  nodes.forEach((n) => {
    const targets: string[] = [...(n.nextNodes || [])];
    if (n.conditionBranch?.trueNodeId) targets.push(n.conditionBranch.trueNodeId);
    if (n.conditionBranch?.falseNodeId) targets.push(n.conditionBranch.falseNodeId);
    if (n.loopBranch?.bodyNodeId) targets.push(n.loopBranch.bodyNodeId);
    if (n.loopBranch?.doneNodeId) targets.push(n.loopBranch.doneNodeId);

    const uniqueTargets = Array.from(new Set(targets)).filter((tid) => nodeMap.has(tid) && tid !== n.id);
    adj.set(n.id, uniqueTargets);

    uniqueTargets.forEach((targetId) => {
      inDegree.set(targetId, (inDegree.get(targetId) || 0) + 1);
    });
  });

  // Calculate layers (columns) using BFS / longest path from roots
  const layers = new Map<string, number>();
  const queue: { id: string; layer: number }[] = [];

  // Start with Event (Start) nodes or nodes with inDegree === 0
  const startNodes = nodes.filter(
    (n) => n.actionType.startsWith('Event') || (inDegree.get(n.id) === 0)
  );

  const roots = startNodes.length > 0 ? startNodes : [nodes[0]];
  const visitedRoots = new Set<string>();

  roots.forEach((root) => {
    queue.push({ id: root.id, layer: 0 });
    layers.set(root.id, 0);
    visitedRoots.add(root.id);
  });

  // Also include any other unvisited zero-in-degree nodes
  nodes.forEach((n) => {
    if (!visitedRoots.has(n.id) && inDegree.get(n.id) === 0) {
      queue.push({ id: n.id, layer: 0 });
      layers.set(n.id, 0);
      visitedRoots.add(n.id);
    }
  });

  const visited = new Set<string>();
  while (queue.length > 0) {
    const { id, layer } = queue.shift()!;
    visited.add(id);

    const neighbors = adj.get(id) || [];
    for (const nextId of neighbors) {
      const currentNextLayer = layers.get(nextId) ?? -1;
      const targetLayer = Math.max(currentNextLayer, layer + 1);
      layers.set(nextId, targetLayer);

      if (!visited.has(nextId)) {
        queue.push({ id: nextId, layer: targetLayer });
      }
    }
  }

  // Handle any disconnected components
  nodes.forEach((n) => {
    if (!layers.has(n.id)) {
      layers.set(n.id, 0);
    }
  });

  // Group nodes by layer
  const layerGroups = new Map<number, string[]>();
  layers.forEach((layer, nodeId) => {
    if (!layerGroups.has(layer)) {
      layerGroups.set(layer, []);
    }
    layerGroups.get(layer)!.push(nodeId);
  });

  const arrangedNodes: MacroNode[] = [];
  const sortedLayers = Array.from(layerGroups.keys()).sort((a, b) => a - b);

  sortedLayers.forEach((layer) => {
    const nodeIds = layerGroups.get(layer)!;
    nodeIds.forEach((nodeId, indexInLayer) => {
      const node = nodeMap.get(nodeId);
      if (node) {
        arrangedNodes.push({
          ...node,
          positionX: startX + layer * horizontalSpacing,
          positionY: startY + indexInLayer * verticalSpacing,
        });
      }
    });
  });

  return arrangedNodes;
}

/**
 * Alignment helpers for multi-selected nodes
 */
export function alignNodes(
  allNodes: MacroNode[],
  selectedIds: Set<string>,
  alignment: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY'
): MacroNode[] {
  const selected = allNodes.filter((n) => selectedIds.has(n.id));
  if (selected.length <= 1) return allNodes;

  let targetVal = 0;
  if (alignment === 'left') {
    targetVal = Math.min(...selected.map((n) => n.positionX));
  } else if (alignment === 'right') {
    targetVal = Math.max(...selected.map((n) => n.positionX));
  } else if (alignment === 'top') {
    targetVal = Math.min(...selected.map((n) => n.positionY));
  } else if (alignment === 'bottom') {
    targetVal = Math.max(...selected.map((n) => n.positionY));
  } else if (alignment === 'centerX') {
    const minX = Math.min(...selected.map((n) => n.positionX));
    const maxX = Math.max(...selected.map((n) => n.positionX));
    targetVal = (minX + maxX) / 2;
  } else if (alignment === 'centerY') {
    const minY = Math.min(...selected.map((n) => n.positionY));
    const maxY = Math.max(...selected.map((n) => n.positionY));
    targetVal = (minY + maxY) / 2;
  }

  return allNodes.map((n) => {
    if (!selectedIds.has(n.id)) return n;
    if (alignment === 'left' || alignment === 'right' || alignment === 'centerX') {
      return { ...n, positionX: Math.round(targetVal / 20) * 20 };
    } else {
      return { ...n, positionY: Math.round(targetVal / 20) * 20 };
    }
  });
}

/**
 * Distribute selected nodes evenly along X or Y axis
 */
export function distributeNodes(
  allNodes: MacroNode[],
  selectedIds: Set<string>,
  axis: 'horizontal' | 'vertical'
): MacroNode[] {
  const selected = allNodes.filter((n) => selectedIds.has(n.id));
  if (selected.length <= 2) return allNodes;

  if (axis === 'horizontal') {
    const sorted = [...selected].sort((a, b) => a.positionX - b.positionX);
    const minX = sorted[0].positionX;
    const maxX = sorted[sorted.length - 1].positionX;
    const step = (maxX - minX) / (sorted.length - 1);

    const idToX = new Map<string, number>();
    sorted.forEach((n, idx) => {
      idToX.set(n.id, Math.round((minX + idx * step) / 20) * 20);
    });

    return allNodes.map((n) => {
      if (idToX.has(n.id)) {
        return { ...n, positionX: idToX.get(n.id)! };
      }
      return n;
    });
  } else {
    const sorted = [...selected].sort((a, b) => a.positionY - b.positionY);
    const minY = sorted[0].positionY;
    const maxY = sorted[sorted.length - 1].positionY;
    const step = (maxY - minY) / (sorted.length - 1);

    const idToY = new Map<string, number>();
    sorted.forEach((n, idx) => {
      idToY.set(n.id, Math.round((minY + idx * step) / 20) * 20);
    });

    return allNodes.map((n) => {
      if (idToY.has(n.id)) {
        return { ...n, positionY: idToY.get(n.id)! };
      }
      return n;
    });
  }
}

/**
 * Calculates optimal bounding box, pan, and zoom to fit all nodes within the canvas view
 */
export function calculateZoomToFit(
  nodes: MacroNode[],
  canvasWidth: number,
  canvasHeight: number,
  padding = 80
): { panX: number; panY: number; zoom: number } {
  if (nodes.length === 0) {
    return { panX: 0, panY: 0, zoom: 1.0 };
  }

  const minX = Math.min(...nodes.map((n) => n.positionX));
  const maxX = Math.max(...nodes.map((n) => n.positionX + 240));
  const minY = Math.min(...nodes.map((n) => n.positionY));
  const maxY = Math.max(...nodes.map((n) => n.positionY + 120));

  const contentWidth = Math.max(maxX - minX, 100);
  const contentHeight = Math.max(maxY - minY, 100);

  const availableWidth = Math.max(canvasWidth - padding * 2, 100);
  const availableHeight = Math.max(canvasHeight - padding * 2, 100);

  const zoomX = availableWidth / contentWidth;
  const zoomY = availableHeight / contentHeight;
  const targetZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.35), 1.5);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const panX = canvasWidth / 2 - centerX * targetZoom;
  const panY = canvasHeight / 2 - centerY * targetZoom;

  return { panX, panY, zoom: targetZoom };
}
