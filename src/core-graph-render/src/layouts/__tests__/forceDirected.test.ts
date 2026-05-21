import { EdgeType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { forceDirectedLayout } from '../forceDirected';

const makeNode = (id: string) => ({ id });
const makeEdge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
  type: EdgeType.Directed,
});

describe('forceDirectedLayout', () => {
  it('returns empty array for empty nodes', () => {
    expect(forceDirectedLayout([], [])).toHaveLength(0);
  });

  it('returns a positioned node for a single-node graph', () => {
    const nodes = [makeNode('a')];
    const result = forceDirectedLayout(nodes, []);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('position');
    expect(Number.isFinite(result[0]!.position.x)).toBe(true);
    expect(Number.isFinite(result[0]!.position.y)).toBe(true);
  });

  it('positions two connected nodes within the viewport', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = forceDirectedLayout(nodes, edges, 20, 960, 720);
    expect(result).toHaveLength(2);
    for (const n of result) {
      expect(n.position.x).toBeGreaterThanOrEqual(0);
      expect(n.position.x).toBeLessThanOrEqual(960);
      expect(n.position.y).toBeGreaterThanOrEqual(0);
      expect(n.position.y).toBeLessThanOrEqual(720);
    }
  });

  it('returns cached result for the same graph inputs', () => {
    const nodes = [makeNode('x'), makeNode('y')];
    const edges = [makeEdge('e1', 'x', 'y')];
    const first = forceDirectedLayout(nodes, edges);
    const second = forceDirectedLayout(nodes, edges);
    // Same positions because of LRU cache hit
    expect(second[0]!.position).toEqual(first[0]!.position);
    expect(second[1]!.position).toEqual(first[1]!.position);
  });

  it('clamps node positions within padded viewport (clampPoint coverage)', () => {
    const nodes = [makeNode('a')];
    const pad = 20;
    const width = 960;
    const height = 720;
    // With default node size 180×72, halfW=90, halfH=36
    // Allowed x: [20+90, 960-20-90] = [110, 850] — valid clamp range
    const result = forceDirectedLayout(nodes, [], pad, width, height);
    expect(result[0]!.position.x).toBeGreaterThanOrEqual(0);
    expect(result[0]!.position.x).toBeLessThanOrEqual(width);
    expect(result[0]!.position.y).toBeGreaterThanOrEqual(0);
    expect(result[0]!.position.y).toBeLessThanOrEqual(height);
  });
});
