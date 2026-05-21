import { EdgeType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { buildParallelEdgeIndex, DEFAULT_PARALLEL_EDGE_META } from '../parallel';

const makeEdge = (id: string, source: string, target: string, type = EdgeType.Directed) => ({
  id,
  source,
  target,
  type,
});

describe('DEFAULT_PARALLEL_EDGE_META', () => {
  it('has index=0, total=1, centeredOffset=0', () => {
    expect(DEFAULT_PARALLEL_EDGE_META).toEqual({ index: 0, total: 1, centeredOffset: 0 });
  });
});

describe('buildParallelEdgeIndex', () => {
  it('returns an empty map for an empty edge list', () => {
    expect(buildParallelEdgeIndex([]).size).toBe(0);
  });

  it('assigns index=0, total=1, centeredOffset=0 to a single edge', () => {
    const edge = makeEdge('e1', 'a', 'b');
    const index = buildParallelEdgeIndex([edge]);
    expect(index.get('e1')).toEqual({ index: 0, total: 1, centeredOffset: 0 });
  });

  it('groups two edges between the same pair with total=2', () => {
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'a', 'b')];
    const index = buildParallelEdgeIndex(edges);
    expect(index.get('e1')!.total).toBe(2);
    expect(index.get('e2')!.total).toBe(2);
  });

  it('assigns ascending indices within a group', () => {
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'a', 'b')];
    const index = buildParallelEdgeIndex(edges);
    const indices = [index.get('e1')!.index, index.get('e2')!.index].sort();
    expect(indices).toEqual([0, 1]);
  });

  it('centeredOffset is symmetric for a two-edge group', () => {
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'a', 'b')];
    const index = buildParallelEdgeIndex(edges);
    const offsets = [index.get('e1')!.centeredOffset, index.get('e2')!.centeredOffset].sort(
      (a, b) => a - b
    );
    expect(offsets[0]).toBe(-0.5);
    expect(offsets[1]).toBe(0.5);
  });

  it('treats undirected edges between a→b and b→a as the same group', () => {
    const edges = [
      makeEdge('e1', 'a', 'b', EdgeType.Undirected),
      makeEdge('e2', 'b', 'a', EdgeType.Undirected),
    ];
    const index = buildParallelEdgeIndex(edges);
    expect(index.get('e1')!.total).toBe(2);
    expect(index.get('e2')!.total).toBe(2);
  });

  it('separates edges of different types into distinct groups', () => {
    const edges = [
      makeEdge('e1', 'a', 'b', EdgeType.Directed),
      makeEdge('e2', 'a', 'b', EdgeType.Undirected),
    ];
    const index = buildParallelEdgeIndex(edges);
    expect(index.get('e1')!.total).toBe(1);
    expect(index.get('e2')!.total).toBe(1);
  });
});
