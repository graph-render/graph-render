import { describe, expect, it } from 'vitest';

import { validatePositionedEdges, validatePositionedNodes } from '../model/validation';

// ── helpers ──────────────────────────────────────────────────────────────────
const makeNode = (id: string, x = 0, y = 0) =>
  ({ id, position: { x, y }, size: { width: 100, height: 50 } }) as any;

const makeEdge = (id: string, source: string, target: string, points = [{ x: 0, y: 0 }, { x: 1, y: 1 }]) =>
  ({ id, source, target, points }) as any;

// ── validatePositionedNodes ───────────────────────────────────────────────────
describe('validatePositionedNodes', () => {
  it('does not throw for valid nodes', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    expect(() => validatePositionedNodes(nodes, nodes, 'layout')).not.toThrow();
  });

  it('throws when node count does not match', () => {
    const expected = [makeNode('a'), makeNode('b')];
    const actual = [makeNode('a')];
    expect(() => validatePositionedNodes(actual, expected, 'layout')).toThrow(
      'layout must return 2 nodes'
    );
  });

  it('throws for unknown node id', () => {
    const expected = [makeNode('a')];
    const actual = [makeNode('z')];
    expect(() => validatePositionedNodes(actual, expected, 'layout')).toThrow(
      'returned unknown node id "z"'
    );
  });

  it('throws for duplicate node id', () => {
    const expected = [makeNode('a'), makeNode('b')];
    const actual = [makeNode('a'), makeNode('a')];
    expect(() => validatePositionedNodes(actual, expected, 'layout')).toThrow(
      'returned duplicate node id "a"'
    );
  });

  it('throws for non-finite position', () => {
    const expected = [makeNode('a')];
    const actual = [{ id: 'a', position: { x: NaN, y: 0 } }];
    expect(() => validatePositionedNodes(actual as any, expected, 'layout')).toThrow(
      'non-finite position'
    );
  });
});

// ── validatePositionedEdges ───────────────────────────────────────────────────
describe('validatePositionedEdges', () => {
  const nodeIds = new Set(['a', 'b', 'c']);

  it('does not throw for valid edges', () => {
    const edges = [makeEdge('e1', 'a', 'b')];
    expect(() => validatePositionedEdges(edges, nodeIds, 'routing')).not.toThrow();
  });

  it('throws for duplicate edge id', () => {
    const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e1', 'b', 'c')];
    expect(() => validatePositionedEdges(edges, nodeIds, 'routing')).toThrow(
      'returned duplicate edge id "e1"'
    );
  });

  it('throws when source node is unknown', () => {
    const edges = [makeEdge('e1', 'z', 'b')];
    expect(() => validatePositionedEdges(edges, nodeIds, 'routing')).toThrow(
      'unknown endpoint(s)'
    );
  });

  it('throws when target node is unknown', () => {
    const edges = [makeEdge('e1', 'a', 'z')];
    expect(() => validatePositionedEdges(edges, nodeIds, 'routing')).toThrow(
      'unknown endpoint(s)'
    );
  });

  it('throws when points array has fewer than 2 entries', () => {
    const edges = [makeEdge('e1', 'a', 'b', [{ x: 0, y: 0 }])];
    expect(() => validatePositionedEdges(edges, nodeIds, 'routing')).toThrow(
      'valid point path'
    );
  });

  it('throws when a point coordinate is non-finite', () => {
    const edges = [makeEdge('e1', 'a', 'b', [{ x: NaN, y: 0 }, { x: 1, y: 1 }])];
    expect(() => validatePositionedEdges(edges, nodeIds, 'routing')).toThrow(
      'non-finite point'
    );
  });
});
