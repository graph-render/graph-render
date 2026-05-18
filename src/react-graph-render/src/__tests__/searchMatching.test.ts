import { describe, expect, it } from 'vitest';

import {
  findSearchMatchedEdgeIds,
  findSearchMatchedNodeIds,
  getDerivedHighlightResults,
} from '../utils/searchMatching';

// ── helpers ──────────────────────────────────────────────────────────────────
const makeNode = (id: string, label?: string) => ({ id, label }) as any;
const makeEdge = (id: string, source: string, target: string, label?: string) =>
  ({ id, source, target, label }) as any;

// ── findSearchMatchedNodeIds ──────────────────────────────────────────────────
describe('findSearchMatchedNodeIds', () => {
  const nodes = [makeNode('alpha', 'Alpha Node'), makeNode('beta', 'Beta Node'), makeNode('gamma')];

  it('returns empty array when query is undefined', () => {
    expect(findSearchMatchedNodeIds(nodes, undefined, undefined)).toHaveLength(0);
  });

  it('returns empty array when query is blank', () => {
    expect(findSearchMatchedNodeIds(nodes, '   ', undefined)).toHaveLength(0);
  });

  it('matches by node id (case-insensitive)', () => {
    const result = findSearchMatchedNodeIds(nodes, 'ALPHA', undefined);
    expect(result).toContain('alpha');
    expect(result).not.toContain('beta');
  });

  it('matches by label text', () => {
    const result = findSearchMatchedNodeIds(nodes, 'beta node', undefined);
    expect(result).toContain('beta');
  });

  it('returns all matching nodes', () => {
    const result = findSearchMatchedNodeIds(nodes, 'node', undefined);
    expect(result).toContain('alpha');
    expect(result).toContain('beta');
  });

  it('uses custom searchPredicate when provided', () => {
    const predicate = (node: any, query: string) => node.id === query;
    expect(findSearchMatchedNodeIds(nodes, 'alpha', predicate)).toEqual(['alpha']);
  });

  it('swallows predicate errors and treats node as non-matched', () => {
    const throwing = () => { throw new Error('boom'); };
    const result = findSearchMatchedNodeIds(nodes, 'alpha', throwing);
    expect(result).toHaveLength(0);
  });
});

// ── findSearchMatchedEdgeIds ──────────────────────────────────────────────────
describe('findSearchMatchedEdgeIds', () => {
  const edges = [
    makeEdge('e1', 'alpha', 'beta', 'connects alpha'),
    makeEdge('e2', 'beta', 'gamma'),
    makeEdge('e3', 'gamma', 'delta'),
  ];

  it('returns empty for blank query', () => {
    expect(findSearchMatchedEdgeIds(edges, '', new Set())).toHaveLength(0);
  });

  it('includes edge when source node matches', () => {
    const result = findSearchMatchedEdgeIds(edges, 'x', new Set(['alpha']));
    expect(result).toContain('e1');
  });

  it('includes edge when target node matches', () => {
    const result = findSearchMatchedEdgeIds(edges, 'x', new Set(['gamma']));
    expect(result).toContain('e2');
    expect(result).toContain('e3');
  });

  it('includes edge when label contains query', () => {
    const result = findSearchMatchedEdgeIds(edges, 'connects', new Set());
    expect(result).toContain('e1');
    expect(result).not.toContain('e2');
  });

  it('is case-insensitive for label match', () => {
    const result = findSearchMatchedEdgeIds(edges, 'CONNECTS', new Set());
    expect(result).toContain('e1');
  });
});

// ── getDerivedHighlightResults ────────────────────────────────────────────────
describe('getDerivedHighlightResults', () => {
  const ctx = { query: 'abc', nodes: [], edges: [], selectedNodeIds: [], selectedEdgeIds: [] } as any;
  const emptyCtx = { ...ctx, query: '   ' };

  it('returns empty arrays for blank query', () => {
    const result = getDerivedHighlightResults(emptyCtx, undefined);
    expect(result).toEqual({ nodeIds: [], edgeIds: [] });
  });

  it('returns empty arrays when no strategy provided', () => {
    const result = getDerivedHighlightResults(ctx, undefined);
    expect(result).toEqual({ nodeIds: [], edgeIds: [] });
  });

  it('returns strategy result for non-empty query', () => {
    const strategy = () => ({ nodeIds: ['n1'], edgeIds: ['e1'] });
    expect(getDerivedHighlightResults(ctx, strategy)).toEqual({
      nodeIds: ['n1'],
      edgeIds: ['e1'],
    });
  });

  it('swallows strategy errors and returns empty arrays', () => {
    const failing = () => { throw new Error('boom'); };
    expect(getDerivedHighlightResults(ctx, failing)).toEqual({ nodeIds: [], edgeIds: [] });
  });
});
