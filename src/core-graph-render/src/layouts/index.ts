import {
  isPositionedNode,
  LayoutDirection,
  type LayoutOptions,
  LayoutType,
  type NodeData,
  type PositionedNode,
} from '@graph-render/types';

import { applyNodeSizing, DEFAULT_NODE_GAP, DEFAULT_PADDING } from '../utils';
import { centeredLayout } from './centered';
import { compactBracketLayout } from './compactBracket';
import { dagLayout } from './dag';
import { forceDirectedLayout } from './forceDirected';
import { gridLayout } from './grid';
import { orthogonalFlowLayout } from './orthogonalFlow';
import { radialTreeLayout } from './radialTree';
import { treeLayout } from './tree';

const runSelectedLayout = (
  options: LayoutOptions,
  sizedNodes: readonly NodeData[]
): readonly PositionedNode[] => {
  const { edges, padding, theme, layout, width, height, layoutDirection } = options;
  const gap = theme?.nodeGap ?? DEFAULT_NODE_GAP;
  const pad = padding ?? DEFAULT_PADDING;
  const resolvedLayout = layout ?? LayoutType.Grid;

  const assertUnreachable = (value: never): never => {
    throw new Error(`Unsupported layout type: ${String(value)}`);
  };

  switch (resolvedLayout) {
    case LayoutType.Tree: {
      return treeLayout(
        sizedNodes,
        edges,
        pad,
        gap,
        layoutDirection ?? LayoutDirection.LTR,
        height
      );
    }
    case LayoutType.Radial: {
      return radialTreeLayout(sizedNodes, edges, pad, width, height, gap);
    }
    case LayoutType.Centered: {
      return centeredLayout(sizedNodes, pad, width, height);
    }
    case LayoutType.Dag: {
      return dagLayout(
        sizedNodes,
        edges,
        pad,
        gap,
        layoutDirection ?? LayoutDirection.LTR,
        width,
        height
      );
    }
    case LayoutType.ForceDirected: {
      return forceDirectedLayout(sizedNodes, edges, pad, width, height, gap);
    }
    case LayoutType.CompactBracket: {
      return compactBracketLayout(
        sizedNodes,
        edges,
        pad,
        gap,
        layoutDirection ?? LayoutDirection.LTR,
        height
      );
    }
    case LayoutType.OrthogonalFlow: {
      return orthogonalFlowLayout(
        sizedNodes,
        edges,
        pad,
        gap,
        layoutDirection ?? LayoutDirection.LTR,
        width,
        height
      );
    }
    case LayoutType.Grid: {
      return gridLayout(sizedNodes, pad, gap);
    }
    default: {
      return assertUnreachable(resolvedLayout);
    }
  }
};

const getAnchoredLayoutOffset = (
  autoLayout: readonly PositionedNode[],
  fixedNodes: readonly PositionedNode[]
): { readonly x: number; readonly y: number } => {
  if (fixedNodes.length === 0) {
    return { x: 0, y: 0 };
  }

  const positionedFixed = fixedNodes
    .map((fixedNode) => {
      const laidOut = autoLayout.find((node) => node.id === fixedNode.id);
      return laidOut ? { fixedNode, laidOut } : null;
    })
    .filter(
      (entry): entry is { fixedNode: PositionedNode; laidOut: PositionedNode } => entry !== null
    );

  if (positionedFixed.length === 0) {
    return { x: 0, y: 0 };
  }

  const totals = positionedFixed.reduce(
    (acc, entry) => ({
      x: acc.x + (entry.fixedNode.position.x - entry.laidOut.position.x),
      y: acc.y + (entry.fixedNode.position.y - entry.laidOut.position.y),
    }),
    { x: 0, y: 0 }
  );

  return {
    x: totals.x / positionedFixed.length,
    y: totals.y / positionedFixed.length,
  };
};

export const layoutNodes = (options: LayoutOptions): readonly PositionedNode[] => {
  const sizedNodes = applyNodeSizing(options.nodes, options);

  const missingPositions = sizedNodes.some((node) => !node.position);

  if (!missingPositions) {
    return sizedNodes.filter((n): n is PositionedNode => isPositionedNode(n));
  }

  const fixedNodes = sizedNodes.filter((node): node is PositionedNode => Boolean(node.position));
  const autoLayoutInput = sizedNodes.map((node) => ({ ...node, position: undefined }));
  const autoLayout = runSelectedLayout(options, autoLayoutInput);
  const offset = getAnchoredLayoutOffset(autoLayout, fixedNodes);
  const fixedNodeMap = new Map(fixedNodes.map((node) => [node.id, node]));

  return autoLayout.map((node) => {
    const fixedNode = fixedNodeMap.get(node.id);
    if (fixedNode) {
      return fixedNode;
    }

    return {
      ...node,
      position: {
        x: node.position.x + offset.x,
        y: node.position.y + offset.y,
      },
    };
  });
};

export { centeredLayout } from './centered';
export { compactBracketLayout } from './compactBracket';
export { dagLayout } from './dag';
export {
  createForceLayoutCache,
  forceDirectedLayout,
  type ForceLayoutCache,
} from './forceDirected';
export { gridLayout } from './grid';
export { orthogonalFlowLayout } from './orthogonalFlow';
export { radialTreeLayout } from './radialTree';
export { treeLayout } from './tree';
