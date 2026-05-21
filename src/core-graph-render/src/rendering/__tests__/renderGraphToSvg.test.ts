import { EdgeType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { renderGraphToSvg } from '../svg';

describe('renderGraphToSvg', () => {
  it('renders a minimal graph to svg markup', () => {
    const result = renderGraphToSvg({
      adj: { a: { b: { id: 'e1' } } },
      nodes: { a: { label: 'A' }, b: { label: 'B' } },
    });

    expect(result.svg).toContain('<svg');
    expect(result.svg).toContain('<rect');
    expect(result.svg).toContain('<path');
    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it('respects render options such as title and edge type', () => {
    const result = renderGraphToSvg(
      {
        adj: { a: { b: {} } },
        nodes: { a: {}, b: {} },
      },
      {
        title: 'Bracket',
        config: {
          defaultEdgeType: EdgeType.Undirected,
          showArrows: false,
        },
      }
    );

    expect(result.svg).toContain('Bracket');
    expect(result.edges[0]!.type).toBe(EdgeType.Undirected);
    expect(result.svg).not.toMatch(/marker-end="url\(#arrow\)"/);
  });
});
