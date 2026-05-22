import type { PositionedEdge, PositionedNode } from '@graph-render/types';
import type { GraphViewport } from '@graph-render/types/react';

import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from '../constants/graph';

const CULLING_OVERSCAN_PADDING = 96;

export interface ViewportWorldBounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export const getViewportWorldBounds = (
  viewport: GraphViewport,
  width: number,
  height: number,
  padding = CULLING_OVERSCAN_PADDING
): ViewportWorldBounds => {
  const minX = (-viewport.x - padding) / viewport.zoom;
  const minY = (-viewport.y - padding) / viewport.zoom;
  const maxX = (width - viewport.x + padding) / viewport.zoom;
  const maxY = (height - viewport.y + padding) / viewport.zoom;

  return { minX, minY, maxX, maxY };
};

const intersectsBounds = (
  x: number,
  y: number,
  w: number,
  h: number,
  bounds: ViewportWorldBounds
): boolean => {
  return x + w >= bounds.minX && x <= bounds.maxX && y + h >= bounds.minY && y <= bounds.maxY;
};

const pointIntersectsBounds = (
  point: { readonly x: number; readonly y: number },
  bounds: ViewportWorldBounds
): boolean =>
  point.x >= bounds.minX &&
  point.x <= bounds.maxX &&
  point.y >= bounds.minY &&
  point.y <= bounds.maxY;

const segmentIntersectsBounds = (
  start: { readonly x: number; readonly y: number },
  end: { readonly x: number; readonly y: number },
  bounds: ViewportWorldBounds
): boolean => {
  if (pointIntersectsBounds(start, bounds) || pointIntersectsBounds(end, bounds)) {
    return true;
  }

  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);

  return maxX >= bounds.minX && minX <= bounds.maxX && maxY >= bounds.minY && minY <= bounds.maxY;
};

const edgeIntersectsBounds = (edge: PositionedEdge, bounds: ViewportWorldBounds): boolean => {
  if (edge.points.length === 0) {
    return false;
  }

  for (let index = 0; index < edge.points.length; index += 1) {
    const point = edge.points[index];
    if (point && pointIntersectsBounds(point, bounds)) {
      return true;
    }

    const nextPoint = edge.points[index + 1];
    if (point && nextPoint && segmentIntersectsBounds(point, nextPoint, bounds)) {
      return true;
    }
  }

  return false;
};

export const filterNodesInViewport = (
  nodes: readonly PositionedNode[],
  viewport: GraphViewport,
  width: number,
  height: number,
  padding = CULLING_OVERSCAN_PADDING
): readonly PositionedNode[] => {
  if (nodes.length === 0 || width <= 0 || height <= 0) {
    return nodes;
  }

  const bounds = getViewportWorldBounds(viewport, width, height, padding);
  const visible = nodes.filter((node) => {
    const w = node.size?.width ?? DEFAULT_NODE_WIDTH;
    const h = node.size?.height ?? DEFAULT_NODE_HEIGHT;
    return intersectsBounds(node.position.x, node.position.y, w, h, bounds);
  });

  return visible.length === nodes.length ? nodes : visible;
};

export const filterEdgesInViewport = (
  edges: readonly PositionedEdge[],
  visibleNodeIds: ReadonlySet<string>,
  viewport: GraphViewport,
  width: number,
  height: number,
  padding = CULLING_OVERSCAN_PADDING
): readonly PositionedEdge[] => {
  if (edges.length === 0) {
    return edges;
  }

  const bounds = getViewportWorldBounds(viewport, width, height, padding);
  const visible = edges.filter(
    (edge) =>
      visibleNodeIds.has(edge.source) ||
      visibleNodeIds.has(edge.target) ||
      edgeIntersectsBounds(edge, bounds)
  );

  return visible.length === edges.length ? edges : visible;
};
