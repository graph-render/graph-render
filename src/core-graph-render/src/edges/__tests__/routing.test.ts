import { describe, expect, it } from 'vitest';

import { routeEdges } from '../routing';

const makeNode = (id: string, x = 0, y = 0, width = 100, height = 50) => ({
  id,
  position: { x, y },
  size: { width, height },
});

const makeEdge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
});

describe('routeEdges', () => {
  it('returns an empty array when no edges are given', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    expect(routeEdges(nodes, [])).toHaveLength(0);
  });

  it('returns a positioned edge for each input edge', () => {
    const nodes = [makeNode('a', 0, 0), makeNode('b', 300, 0)];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = routeEdges(nodes, edges);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('e1');
  });

  it('routes edges with at least 2 points each', () => {
    const nodes = [makeNode('a', 0, 0), makeNode('b', 300, 100)];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = routeEdges(nodes, edges);
    expect(result[0]!.points.length).toBeGreaterThanOrEqual(2);
  });

  it('handles self-loop edges', () => {
    const nodes = [makeNode('a', 0, 0)];
    const edges = [makeEdge('loop', 'a', 'a')];
    const result = routeEdges(nodes, edges);
    expect(result).toHaveLength(1);
    expect(result[0]!.points.length).toBeGreaterThanOrEqual(2);
  });

  it('routes multiple edges', () => {
    const nodes = [makeNode('a', 0, 0), makeNode('b', 200, 0), makeNode('c', 400, 0)];
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c')];
    const result = routeEdges(nodes, edges);
    expect(result).toHaveLength(2);
  });

  it('throws when an edge references a missing node', () => {
    const nodes = [makeNode('a')];
    const edges = [makeEdge('e1', 'a', 'missing')];
    expect(() => routeEdges(nodes, edges)).toThrow();
  });

  it('attaches a label position for routed edges', () => {
    const nodes = [makeNode('a', 0, 0), makeNode('b', 300, 0)];
    const edges = [makeEdge('e1', 'a', 'b')];
    const result = routeEdges(nodes, edges);
    expect(result[0]).toHaveProperty('labelPosition');
  });
});
