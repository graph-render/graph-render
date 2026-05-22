import type { EdgeData, NodeData, Point, PositionedNode } from '@graph-render/types';

import { DEFAULT_NODE_GAP, DEFAULT_NODE_SIZE, DEFAULT_PADDING } from '../utils';
import { FORCE_LAYOUT_CACHE_LIMIT, MAX_SYNC_FORCE_NODES } from '../utils/constants';
import { gridLayout } from './grid';

interface MutablePoint {
  x: number;
  y: number;
}

export type ForceLayoutCache = Map<string, readonly PositionedNode[]>;

/**
 * Creates an isolated force-layout LRU cache.
 *
 * In browser environments the module-level default cache is shared across all
 * `<Graph>` instances, which is usually acceptable. In SSR environments (Next.js,
 * Remix, etc.) you MUST create a per-request cache to prevent cross-request data
 * leaks:
 *
 * ```ts
 * // In your request handler / RSC:
 * const layoutCache = createForceLayoutCache();
 * // Pass it via GraphProps.forceLayoutCache (future) or use forceDirectedLayout directly.
 * ```
 */
export const createForceLayoutCache = (): ForceLayoutCache =>
  new Map<string, readonly PositionedNode[]>();

// Module-level default cache for browser environments only.
// All <Graph> instances sharing a JS bundle share this 24-slot LRU.
// For SSR usage, create a per-request cache with createForceLayoutCache().
const defaultForceLayoutCache: ForceLayoutCache = createForceLayoutCache();

const finitePositive = (value: number, fallback: number): number => {
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

/**
 * Builds a cache key from topology-relevant data only.
 *
 * Layout positions depend on node identity, node sizes, edge topology, and layout
 * parameters — NOT on label text. Using only IDs and sizes eliminates the previous
 * label-truncation collision (two nodes differing only after character 160 would
 * produce the same key) and avoids serialising potentially large label strings.
 */
const buildForceLayoutCacheKey = (
  nodes: readonly NodeData[],
  edges: readonly EdgeData[],
  pad: number,
  width: number,
  height: number,
  gap: number
): string | null => {
  try {
    return JSON.stringify({
      pad,
      width,
      height,
      gap,
      nodes: nodes.map((node) => ({
        id: node.id,
        size: node.size,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
      })),
    });
  } catch {
    return null;
  }
};

const getCachedForceLayout = (
  cacheKey: string | null,
  cache: ForceLayoutCache
): readonly PositionedNode[] | undefined => {
  if (!cacheKey) {
    return undefined;
  }

  const cached = cache.get(cacheKey);
  if (!cached) {
    return undefined;
  }

  cache.delete(cacheKey);
  cache.set(cacheKey, cached);
  return cached.map((node) => {
    const size = node.size ? { ...node.size } : undefined;
    return {
      ...node,
      position: { ...node.position },
      ...(size ? { size } : {}),
    };
  });
};

const setCachedForceLayout = (
  cacheKey: string | null,
  nodes: readonly PositionedNode[],
  cache: ForceLayoutCache
): void => {
  if (!cacheKey) {
    return;
  }

  if (cache.size >= FORCE_LAYOUT_CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  cache.set(
    cacheKey,
    nodes.map((node) => {
      const size = node.size ? { ...node.size } : undefined;
      return {
        ...node,
        position: { ...node.position },
        ...(size ? { size } : {}),
      };
    })
  );
};

const clampPoint = (
  point: Point,
  width: number,
  height: number,
  pad: number,
  node: NodeData
): Point => {
  const nodeWidth = node.size?.width ?? DEFAULT_NODE_SIZE.width;
  const nodeHeight = node.size?.height ?? DEFAULT_NODE_SIZE.height;
  // `point` is the node center in force-directed simulation space.
  // Clamp so that the full node rectangle stays within the padded viewport.
  const halfW = nodeWidth / 2;
  const halfH = nodeHeight / 2;

  return {
    x: Math.min(Math.max(point.x, pad + halfW), width - pad - halfW),
    y: Math.min(Math.max(point.y, pad + halfH), height - pad - halfH),
  };
};

const getRequiredPoint = <TPoint extends Point>(
  points: ReadonlyMap<string, TPoint>,
  nodeId: string
): TPoint => {
  const point = points.get(nodeId);

  if (!point) {
    throw new Error(`Force-directed layout could not resolve point data for node "${nodeId}".`);
  }

  return point;
};

export const forceDirectedLayout = (
  nodes: readonly NodeData[],
  edges: readonly EdgeData[],
  pad: number = DEFAULT_PADDING,
  width = 960,
  height = 720,
  gap: number = DEFAULT_NODE_GAP,
  cache: ForceLayoutCache = defaultForceLayoutCache
): readonly PositionedNode[] => {
  const resolvedPad = finitePositive(pad, DEFAULT_PADDING);
  const resolvedWidth = finitePositive(width, 960);
  const resolvedHeight = finitePositive(height, 720);
  const resolvedGap = finitePositive(gap, DEFAULT_NODE_GAP);

  if (nodes.length === 0) {
    return [];
  }

  if (nodes.length > MAX_SYNC_FORCE_NODES) {
    return gridLayout(nodes, resolvedPad, resolvedGap);
  }

  const cacheKey = buildForceLayoutCacheKey(
    nodes,
    edges,
    resolvedPad,
    resolvedWidth,
    resolvedHeight,
    resolvedGap
  );
  const cached = getCachedForceLayout(cacheKey, cache);
  if (cached) {
    return cached;
  }

  const area = Math.max((resolvedWidth - resolvedPad * 2) * (resolvedHeight - resolvedPad * 2), 1);
  const k = Math.sqrt(area / Math.max(nodes.length, 1));
  const positions = new Map<string, MutablePoint>();

  for (const [index, node] of nodes.entries()) {
    const angle = (2 * Math.PI * index) / Math.max(nodes.length, 1);
    const radius = Math.min(resolvedWidth, resolvedHeight) * 0.25;
    positions.set(node.id, {
      x: resolvedWidth / 2 + radius * Math.cos(angle),
      y: resolvedHeight / 2 + radius * Math.sin(angle),
    });
  }

  for (let iteration = 0; iteration < 80; iteration += 1) {
    const displacement = new Map<string, MutablePoint>();
    for (const node of nodes) displacement.set(node.id, { x: 0, y: 0 });

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const source = nodes[i];
        const target = nodes[j];
        if (!source || !target) {
          continue;
        }
        const sourcePos = getRequiredPoint(positions, source.id);
        const targetPos = getRequiredPoint(positions, target.id);
        const dx = sourcePos.x - targetPos.x;
        const dy = sourcePos.y - targetPos.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const force = (k * k) / distance;
        const offsetX = (dx / distance) * force;
        const offsetY = (dy / distance) * force;
        const sourceDisp = getRequiredPoint(displacement, source.id);
        const targetDisp = getRequiredPoint(displacement, target.id);
        sourceDisp.x += offsetX;
        sourceDisp.y += offsetY;
        targetDisp.x -= offsetX;
        targetDisp.y -= offsetY;
      }
    }

    for (const edge of edges) {
      const sourcePos = getRequiredPoint(positions, edge.source);
      const targetPos = getRequiredPoint(positions, edge.target);
      const dx = sourcePos.x - targetPos.x;
      const dy = sourcePos.y - targetPos.y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const force = (distance * distance) / k;
      const offsetX = (dx / distance) * force;
      const offsetY = (dy / distance) * force;
      const sourceDisp = getRequiredPoint(displacement, edge.source);
      const targetDisp = getRequiredPoint(displacement, edge.target);
      sourceDisp.x -= offsetX;
      sourceDisp.y -= offsetY;
      targetDisp.x += offsetX;
      targetDisp.y += offsetY;
    }

    const temperature = Math.max(2, resolvedGap * (1 - iteration / 80));
    for (const node of nodes) {
      const point = getRequiredPoint(positions, node.id);
      const disp = getRequiredPoint(displacement, node.id);
      const magnitude = Math.max(1, Math.hypot(disp.x, disp.y));
      const nextPoint = {
        x: point.x + (disp.x / magnitude) * Math.min(magnitude, temperature),
        y: point.y + (disp.y / magnitude) * Math.min(magnitude, temperature),
      };
      positions.set(
        node.id,
        clampPoint(nextPoint, resolvedWidth, resolvedHeight, resolvedPad, node)
      );
    }
  }

  const positionedNodes = nodes.map((node) => {
    const point = getRequiredPoint(positions, node.id);
    const size = node.size ?? DEFAULT_NODE_SIZE;

    return {
      ...node,
      position: {
        x: point.x - size.width / 2,
        y: point.y - size.height / 2,
      },
    };
  });

  setCachedForceLayout(cacheKey, positionedNodes, cache);

  return positionedNodes;
};
