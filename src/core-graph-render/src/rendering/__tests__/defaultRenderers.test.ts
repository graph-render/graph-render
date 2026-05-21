import { EdgeType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { defaultEdgeRenderer, defaultNodeRenderer } from '../defaultRenderers';

describe('defaultNodeRenderer', () => {
  it('renders a rectangle and label text for a node', () => {
    const markup = defaultNodeRenderer({
      id: 'n1',
      position: { x: 0, y: 0 },
      size: { width: 120, height: 48 },
      label: 'Player A',
    });

    expect(markup).toContain('<rect');
    expect(markup).toContain('Player A');
    expect(markup).toContain('<text');
  });

  it('falls back to node id when label is missing', () => {
    const markup = defaultNodeRenderer({
      id: 'fallback-id',
      position: { x: 10, y: 20 },
    });

    expect(markup).toContain('fallback-id');
  });

  it('escapes xml characters in labels', () => {
    const markup = defaultNodeRenderer({
      id: 'n1',
      position: { x: 0, y: 0 },
      label: 'A & B <final>',
    });

    expect(markup).toContain('A &amp; B &lt;final&gt;');
  });
});

describe('defaultEdgeRenderer', () => {
  const theme = {
    edgeColor: '#111',
    edgeWidth: 2,
    edgeLabelColor: '#222',
    markerId: 'arrow-end',
  };

  it('renders a path with marker for directed edges', () => {
    const markup = defaultEdgeRenderer(
      {
        id: 'e1',
        source: 'a',
        target: 'b',
        type: EdgeType.Directed,
        points: [
          { x: 0, y: 0 },
          { x: 50, y: 0 },
        ],
      },
      'M0 0 L50 0',
      theme
    );

    expect(markup).toContain('<path');
    expect(markup).toContain('url(#arrow-end)');
  });

  it('renders edge label text when label position is provided', () => {
    const markup = defaultEdgeRenderer(
      {
        id: 'e1',
        source: 'a',
        target: 'b',
        label: 'Final',
        labelPosition: { x: 25, y: 10 },
        points: [
          { x: 0, y: 0 },
          { x: 50, y: 0 },
        ],
      },
      'M0 0 L50 0',
      theme
    );

    expect(markup).toContain('Final');
    expect(markup).toContain('<text');
  });

  it('omits marker for undirected edges', () => {
    const markup = defaultEdgeRenderer(
      {
        id: 'e1',
        source: 'a',
        target: 'b',
        type: EdgeType.Undirected,
        points: [
          { x: 0, y: 0 },
          { x: 50, y: 0 },
        ],
      },
      'M0 0 L50 0',
      theme
    );

    expect(markup).not.toContain('marker-end');
  });
});
