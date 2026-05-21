import { EdgeType, GraphInputValidationMode } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { fromNxGraph, fromTypedNxGraph } from '../index';

describe('fromNxGraph', () => {
  it('parses a simple adjacency graph into nodes and edges', () => {
    const { nodes, edges } = fromNxGraph({
      adj: { a: { b: { id: 'e1' } } },
      nodes: { a: {}, b: {} },
    });

    expect(nodes.map((n) => n.id).sort()).toEqual(['a', 'b']);
    expect(edges).toHaveLength(1);
    expect(edges[0]).toMatchObject({ id: 'e1', source: 'a', target: 'b' });
  });

  it('respects defaultEdgeType and parser options', () => {
    const { edges } = fromNxGraph(
      {
        adj: { a: { b: {} } },
        nodes: { a: {}, b: {} },
      },
      EdgeType.Undirected,
      { inputValidationMode: GraphInputValidationMode.Strict }
    );

    expect(edges[0]!.type).toBe(EdgeType.Undirected);
  });
});

describe('fromTypedNxGraph', () => {
  it('returns typed node and edge tuples', () => {
    const { nodes, edges } = fromTypedNxGraph<{ label: string }, { round: number }>({
      adj: { a: { b: { id: 'e1', meta: { round: 1 } } } },
      nodes: { a: { data: { label: 'A' } }, b: { data: { label: 'B' } } },
    });

    expect(nodes[0]).toHaveProperty('data');
    expect(edges[0]).toMatchObject({ source: 'a', target: 'b' });
  });
});
