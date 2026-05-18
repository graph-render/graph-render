import { describe, expect, it } from 'vitest';

import { groupEdgesByTarget, sortEdgesBySourcePosition } from '../utils/graphTraversal';

const makeEdge = (id: string, source: string, target: string) =>
  ({ id, source, target, points: [] }) as any;

describe('groupEdgesByTarget', () => {
  it('groups edges by their target id', () => {
    const edges = [
      makeEdge('e1', 'a', 'c'),
      makeEdge('e2', 'b', 'c'),
      makeEdge('e3', 'a', 'd'),
    ];
    const map = groupEdgesByTarget(edges);
    expect(map.get('c')).toHaveLength(2);
    expect(map.get('d')).toHaveLength(1);
  });

  it('returns an empty map for an empty edge list', () => {
    expect(groupEdgesByTarget([]).size).toBe(0);
  });

  it('handles a single edge', () => {
    const map = groupEdgesByTarget([makeEdge('e1', 'src', 'dst')]);
    expect(map.get('dst')).toEqual([expect.objectContaining({ id: 'e1' })]);
  });

  it('preserves all edge properties in the groups', () => {
    const edge = makeEdge('e1', 'x', 'y');
    const map = groupEdgesByTarget([edge]);
    expect(map.get('y')?.[0]).toBe(edge);
  });
});

describe('sortEdgesBySourcePosition', () => {
  it('sorts by y first, then by x', () => {
    const edges = [
      makeEdge('e1', 'b', 'z'), // y=20, x=5
      makeEdge('e2', 'a', 'z'), // y=10, x=0
      makeEdge('e3', 'c', 'z'), // y=20, x=0
    ];
    const positions = new Map([
      ['a', { x: 0, y: 10 }],
      ['b', { x: 5, y: 20 }],
      ['c', { x: 0, y: 20 }],
    ]);
    const sorted = sortEdgesBySourcePosition(edges, positions);
    expect(sorted[0]?.id).toBe('e2'); // y=10 comes first
    expect(sorted[1]?.id).toBe('e3'); // y=20, x=0 before x=5
    expect(sorted[2]?.id).toBe('e1');
  });

  it('keeps edges without known position in their relative order', () => {
    const edges = [makeEdge('e1', 'unknown', 'z'), makeEdge('e2', 'unknown2', 'z')];
    const sorted = sortEdgesBySourcePosition(edges, new Map());
    expect(sorted).toHaveLength(2);
  });

  it('returns a new array (does not mutate input)', () => {
    const edges = [makeEdge('e1', 'a', 'z')];
    const positions = new Map([['a', { x: 0, y: 0 }]]);
    const sorted = sortEdgesBySourcePosition(edges, positions);
    expect(sorted).not.toBe(edges);
  });
});
