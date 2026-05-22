import {
  type EdgeData,
  LayoutDirection,
  makePositionedNode,
  type NodeData,
  type PositionedNode,
} from '@graph-render/types';

import {
  DEFAULT_NODE_GAP,
  DEFAULT_NODE_SIZE,
  DEFAULT_PADDING,
  getMaxNodeDimensions,
} from '../utils';
import { assignDagLevels } from './treeTopology';

const groupNodesByLayer = (
  nodes: readonly NodeData[],
  levels: ReadonlyMap<string, number>
): ReadonlyArray<readonly NodeData[]> => {
  const buckets = new Map<number, NodeData[]>();
  for (const node of nodes) {
    const level = levels.get(node.id) ?? 0;
    const entries = buckets.get(level) ?? [];
    entries.push(node);
    buckets.set(level, entries);
  }

  return [...buckets.entries()].sort((a, b) => a[0] - b[0]).map(([, entries]) => entries);
};

export const dagLayout = (
  nodes: readonly NodeData[],
  edges: readonly EdgeData[],
  pad: number = DEFAULT_PADDING,
  gap: number = DEFAULT_NODE_GAP,
  direction: LayoutDirection = LayoutDirection.LTR,
  width = 960,
  height = 720
): readonly PositionedNode[] => {
  if (nodes.length === 0) {
    return [];
  }

  const { levels } = assignDagLevels(nodes, edges);
  const layers = groupNodesByLayer(nodes, levels);
  const { maxWidth: maxNodeWidth, maxHeight: maxNodeHeight } = getMaxNodeDimensions(nodes);
  const columnGap = maxNodeWidth + gap;
  const rowGap = maxNodeHeight + Math.max(24, gap * 0.7);
  const contentWidth = Math.max(width - pad * 2, columnGap * Math.max(layers.length - 1, 1));
  const baseX = direction === LayoutDirection.RTL ? width - pad - maxNodeWidth : pad;
  const stepX = direction === LayoutDirection.RTL ? -columnGap : columnGap;

  return layers.flatMap((layer, layerIndex) => {
    const totalHeight = layer.reduce(
      (sum, node, index) =>
        sum +
        (node.size?.height ?? DEFAULT_NODE_SIZE.height) +
        (index > 0 ? rowGap - maxNodeHeight : 0),
      0
    );
    let y = Math.max(pad, (height - totalHeight) / 2);

    return layer.map((node, nodeIndex) => {
      const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;
      const x =
        baseX +
        layerIndex * stepX +
        (direction === LayoutDirection.RTL ? maxNodeWidth - nodeWidth : 0);
      const positioned = makePositionedNode(node, {
        x: layers.length > 1 ? x : pad + Math.max(0, (contentWidth - nodeWidth) / 2),
        y,
      });

      y +=
        (node.size?.height ?? DEFAULT_NODE_SIZE.height) +
        (nodeIndex < layer.length - 1 ? rowGap - maxNodeHeight : 0);
      return positioned;
    });
  });
};
