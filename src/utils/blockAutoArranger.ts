import { BlockNode } from '../types';

export interface BlockLayoutResult {
  blocks: BlockNode[];
  totalHeight: number;
  maxIndentDepth: number;
}

const BLOCK_VERTICAL_GAP = 12;
const NESTED_INDENT_PX = 28;

/**
 * Arranges block hierarchy positions cleanly for visual puzzle rendering.
 * Recursively positions statement slot child blocks with correct indentation and vertical stack.
 */
export function autoArrangeBlockHierarchy(
  rootBlocks: BlockNode[],
  startX: number = 40,
  startY: number = 40
): { blocks: BlockNode[]; boundingBox: { minX: number; minY: number; maxX: number; maxY: number } } {
  let currentY = startY;
  let minX = startX;
  let minY = startY;
  let maxX = startX + 460;
  let maxY = startY;

  function arrangeList(list: BlockNode[], x: number, depth: number): BlockNode[] {
    const arranged: BlockNode[] = [];

    for (const block of list) {
      const cloned = { ...block };
      cloned.positionX = x;
      cloned.positionY = currentY;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x + 440 + depth * NESTED_INDENT_PX);
      minY = Math.min(minY, currentY);

      // Estimate base block height
      let blockHeight = 84;
      if (block.comment) blockHeight += 32;
      if (Object.keys(block.parameters || {}).length > 2) blockHeight += 24;

      currentY += blockHeight + BLOCK_VERTICAL_GAP;

      // Handle child slots (e.g. if/else, loops, actions)
      if (cloned.hasContainerSlot && cloned.childSlots && !cloned.isCollapsed) {
        const updatedSlots: Record<string, BlockNode[]> = {};
        for (const [slotName, children] of Object.entries(cloned.childSlots)) {
          if (children && children.length > 0) {
            currentY += 12; // Slot header gap
            updatedSlots[slotName] = arrangeList(children, x + NESTED_INDENT_PX, depth + 1);
            currentY += 12; // Slot footer gap
          } else {
            updatedSlots[slotName] = [];
          }
        }
        cloned.childSlots = updatedSlots;
      }

      maxY = Math.max(maxY, currentY);
      arranged.push(cloned);
    }

    return arranged;
  }

  const arrangedBlocks = arrangeList(rootBlocks, startX, 0);

  return {
    blocks: arrangedBlocks,
    boundingBox: {
      minX,
      minY,
      maxX,
      maxY: Math.max(maxY, startY + 400),
    },
  };
}
