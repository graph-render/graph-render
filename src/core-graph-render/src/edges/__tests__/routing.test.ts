import { LayoutDirection, RoutingStyle } from '@graph-render/types';
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

  it('applies routing options (straight, orthogonal, RTL, custom padding)', () => {
    const nodes = [makeNode('a', 0, 0), makeNode('b', 400, 200)];
    const edges = [makeEdge('e1', 'a', 'b')];

    const straight = routeEdges(nodes, edges, {
      straight: true,
      arrowPadding: Number.NaN,
      edgeSeparation: 0,
      selfLoopRadius: 5,
    });
    const orthogonal = routeEdges(nodes, edges, {
      routingStyle: RoutingStyle.Orthogonal,
      layoutDirection: LayoutDirection.RTL,
      forceRightToLeft: true,
      arrowPadding: 12,
      edgeSeparation: 24,
      selfLoopRadius: 40,
    });

    expect(straight[0]!.points.length).toBeGreaterThanOrEqual(2);
    expect(orthogonal[0]!.points.length).toBeGreaterThanOrEqual(2);
  });

  it('skips obstacle avoidance for very large graphs', () => {
    const nodes = Array.from({ length: 150 }, (_, index) =>
      makeNode(`n${index}`, index * 10, 0)
    );
    const edges = Array.from({ length: 150 }, (_, index) =>
      makeEdge(`e${index}`, `n${index}`, `n${(index + 1) % 150}`)
    );

    const result = routeEdges(nodes, edges);
    expect(result).toHaveLength(150);
    expect(result.every((edge) => edge.points.length >= 2)).toBe(true);
  });
});
