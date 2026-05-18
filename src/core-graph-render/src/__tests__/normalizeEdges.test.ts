import type { EdgeData } from '@graph-render/types';
import { EdgeType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { normalizeEdges } from '../model/normalizeEdges';

const base: EdgeData = { id: 'e1', source: 'a', target: 'b' };

describe('normalizeEdges', () => {
  it('fills in the default type when edge.type is absent', () => {
    const result = normalizeEdges([base], EdgeType.Directed);
    expect(result[0]?.type).toBe(EdgeType.Directed);
  });

  it('preserves explicit type when provided', () => {
    const result = normalizeEdges(
      [{ ...base, type: EdgeType.Undirected }],
      EdgeType.Directed
    );
    expect(result[0]?.type).toBe(EdgeType.Undirected);
  });

  it('handles an empty array', () => {
    expect(normalizeEdges([], EdgeType.Directed)).toHaveLength(0);
  });

  it('does not mutate the original edge object', () => {
    const original: EdgeData = { ...base };
    const result = normalizeEdges([original], EdgeType.Directed);
    // original should not gain a type, the result is a new object
    expect(original).not.toBe(result[0]);
  });

  it('processes multiple edges', () => {
    const edges: EdgeData[] = [
      { id: 'e1', source: 'a', target: 'b' },
      { id: 'e2', source: 'b', target: 'c', type: EdgeType.Undirected },
    ];
    const result = normalizeEdges(edges, EdgeType.Directed);
    expect(result[0]?.type).toBe(EdgeType.Directed);
    expect(result[1]?.type).toBe(EdgeType.Undirected);
  });
});
