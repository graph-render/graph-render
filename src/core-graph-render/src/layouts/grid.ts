import {
  isPositionedNode,
  type NodeData,
  type Point,
  type PositionedNode,
} from '@graph-render/types';

import { DEFAULT_NODE_GAP, DEFAULT_NODE_SIZE, DEFAULT_PADDING } from '../utils';

/**
 * Calculate grid dimensions based on node count
 */
const calculateGridColumns = (nodeCount: number): number => {
  return Math.ceil(Math.sqrt(nodeCount));
};

/**
 * Calculate grid position for a node at a given index
 */
const calculateGridPosition = (
  index: number,
  columns: number,
  nodeWidth: number,
  nodeHeight: number,
  padding: number,
  gap: number
): Point => {
  const col = index % columns;
  const row = Math.floor(index / columns);
  return {
    x: padding + col * (nodeWidth + gap),
    y: padding + row * (nodeHeight + gap),
  };
};

/**
 * Layout nodes in a grid pattern
 */
export const gridLayout = (
  nodes: readonly NodeData[],
  pad: number = DEFAULT_PADDING,
  gap: number = DEFAULT_NODE_GAP
): readonly PositionedNode[] => {
  const count = nodes.length;
  const cols = calculateGridColumns(count);

  return nodes.map((node, idx) => {
    if (isPositionedNode(node)) return node;

    const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;
    const nodeHeight = node.size?.height ?? DEFAULT_NODE_SIZE.height;
    const position = calculateGridPosition(idx, cols, nodeWidth, nodeHeight, pad, gap);

    return { ...node, position };
  });
};
