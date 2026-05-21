import { EdgeType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { renderGraphToSvg } from '../svg';

describe('renderGraphToSvg', () => {
  it('renders a minimal graph to svg markup', () => {
    const graphSvg = renderGraphToSvg({
      adj: { a: { b: { id: 'e1' } } },
      nodes: { a: { label: 'A' }, b: { label: 'B' } },
    });

    expect(graphSvg.svg).toContain('<svg');
    expect(graphSvg.svg).toContain('<rect');
    expect(graphSvg.svg).toContain('<path');
    expect(graphSvg.nodes).toHaveLength(2);
    expect(graphSvg.edges).toHaveLength(1);
    expect(graphSvg.width).toBeGreaterThan(0);
    expect(graphSvg.height).toBeGreaterThan(0);
  });

  it('respects render options such as title and edge type', () => {
    const graphSvg = renderGraphToSvg(
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

    expect(graphSvg.svg).toContain('Bracket');
    expect(graphSvg.edges[0]!.type).toBe(EdgeType.Undirected);
    expect(graphSvg.svg).not.toMatch(/marker-end="url\(#arrow\)"/);
  });
});
