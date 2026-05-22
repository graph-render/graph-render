import {
  type EdgeData,
  isPositionedNode,
  type LayoutDirection,
  makePositionedNode,
  type NodeData,
  type PositionedNode,
  type TreeMetrics,
} from '@graph-render/types';

import { DEFAULT_NODE_SIZE } from '../utils';
import { calculateXPosition, calculateYPosition } from './treePositioning';

/**
 * Position all nodes initially based on their level
 */
export const positionNodesInLevels = (
  nodes: readonly NodeData[],
  levels: ReadonlyArray<readonly string[]>,
  levelMap: ReadonlyMap<string, number>,
  metrics: TreeMetrics,
  gap: number,
  padding: number,
  direction: LayoutDirection
): readonly PositionedNode[] => {
  return nodes.map((node) => {
    if (isPositionedNode(node)) return node;

    const level = levelMap.get(node.id) ?? 0;
    const levelNodes = levels[level] ?? [];
    const idx = levelNodes.indexOf(node.id);
    const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;

    const x = calculateXPosition(level, metrics.maxLevel, nodeWidth, gap, padding, direction);
    const y = calculateYPosition(
      idx,
      levelNodes,
      metrics.maxNodeHeight,
      gap,
      metrics.totalHeight,
      metrics.baseY
    );

    return { ...node, position: { x, y } };
  });
};

/**
 * Calculate average Y center of parent nodes
 */
const calculateParentCentersAverage = (
  parentIds: readonly string[],
  posMap: ReadonlyMap<string, PositionedNode>
): number | null => {
  const centers = parentIds
    .map((src) => posMap.get(src))
    .filter((node): node is PositionedNode => node !== undefined)
    .map((n) => n.position.y + (n.size?.height ?? DEFAULT_NODE_SIZE.height) / 2);

  if (centers.length === 0) return null;
  return centers.reduce((a, b) => a + b, 0) / centers.length;
};

/**
 * Align nodes with multiple parents to their parent's average position
 */
export const alignNodesToParents = (
  positioned: readonly PositionedNode[],
  edges: readonly EdgeData[],
  levels: ReadonlyArray<readonly string[]>,
  maxLevel: number
): readonly PositionedNode[] => {
  const posMap = new Map<string, PositionedNode>();
  for (const n of positioned) posMap.set(n.id, n);

  // Index incoming edges once so parent lookup stays linear in graph size.
  const incomingByTarget = new Map<string, string[]>();
  for (const e of edges) {
    incomingByTarget.set(e.target, [...(incomingByTarget.get(e.target) ?? []), e.source]);
  }

  for (let level = 1; level <= maxLevel; level += 1) {
    const ids = levels[level] ?? [];
    for (const id of ids) {
      const node = posMap.get(id);
      if (!node) continue;

      const parentIds = incomingByTarget.get(id) ?? [];
      if (parentIds.length < 2) continue;

      const avgCenterY = calculateParentCentersAverage(parentIds, posMap);
      if (avgCenterY === null) continue;

      const h = node.size?.height ?? DEFAULT_NODE_SIZE.height;
      const newY = avgCenterY - h / 2;
      const updated = makePositionedNode(node, { ...node.position, y: newY });
      posMap.set(id, updated);
    }
  }

  return [...posMap.values()];
};
