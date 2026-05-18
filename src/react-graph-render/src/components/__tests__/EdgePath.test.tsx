import { buildEdgePath } from '@graph-render/core';
import { EdgeType } from '@graph-render/types';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EdgePath } from '../EdgePath';

vi.mock('@graph-render/core', () => ({
  buildEdgePath: vi.fn(),
}));

const makeEdge = (id: string, overrides: Record<string, unknown> = {}) =>
  ({
    id,
    source: 'a',
    target: 'b',
    type: EdgeType.Directed,
    points: [],
    ...overrides,
  }) as any;

const baseProps = {
  edge: makeEdge('e1'),
  color: '#334155',
  width: 2,
  curveEdges: false,
  curveStrength: 0.5,
  isHovered: false,
  isSelected: false,
  hoverColor: '#4da3ff',
  hoverEnabled: true,
  hitStrokeWidth: 10,
};

describe('EdgePath', () => {
  it('returns null when buildEdgePath returns null', () => {
    vi.mocked(buildEdgePath).mockReturnValue(null);
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} />
      </svg>
    );
    expect(container.querySelector('path')).toBeNull();
  });

  it('renders two paths when buildEdgePath returns a value', () => {
    vi.mocked(buildEdgePath).mockReturnValue('M0,0 L10,10');
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} />
      </svg>
    );
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });

  it('renders a transparent hit-area path', () => {
    vi.mocked(buildEdgePath).mockReturnValue('M0,0 L10,10');
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} />
      </svg>
    );
    const paths = container.querySelectorAll('path');
    expect(paths[0]?.getAttribute('stroke')).toBe('transparent');
  });

  it('strokes the visible path with the edge color', () => {
    vi.mocked(buildEdgePath).mockReturnValue('M0,0 L10,10');
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} color="#aabbcc" />
      </svg>
    );
    const paths = container.querySelectorAll('path');
    expect(paths[1]?.getAttribute('stroke')).toBe('#aabbcc');
  });

  it('strokes the visible path with hoverColor when hovered', () => {
    vi.mocked(buildEdgePath).mockReturnValue('M0,0 L10,10');
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} isHovered hoverColor="#ff5500" />
      </svg>
    );
    const paths = container.querySelectorAll('path');
    expect(paths[1]?.getAttribute('stroke')).toBe('#ff5500');
  });

  it('adds role="button" to hit path when onClick is provided', () => {
    vi.mocked(buildEdgePath).mockReturnValue('M0,0 L10,10');
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} onClick={vi.fn()} />
      </svg>
    );
    const hitPath = container.querySelector('path[data-graph-edge-interactive]');
    expect(hitPath?.getAttribute('role')).toBe('button');
  });

  it('does not add role="button" to hit path when onClick is not provided', () => {
    vi.mocked(buildEdgePath).mockReturnValue('M0,0 L10,10');
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} />
      </svg>
    );
    const hitPath = container.querySelector('path[data-graph-edge-interactive]');
    expect(hitPath?.getAttribute('role')).toBeNull();
  });

  it('sets aria-label to edge label when onClick and label are provided', () => {
    vi.mocked(buildEdgePath).mockReturnValue('M0,0 L10,10');
    const edge = makeEdge('e1', { label: 'my-edge' });
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} edge={edge} onClick={vi.fn()} />
      </svg>
    );
    const hitPath = container.querySelector('path[data-graph-edge-interactive]');
    expect(hitPath?.getAttribute('aria-label')).toBe('Edge: my-edge');
  });

  it('sets aria-label to "Graph edge" when onClick but no label', () => {
    vi.mocked(buildEdgePath).mockReturnValue('M0,0 L10,10');
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} onClick={vi.fn()} />
      </svg>
    );
    const hitPath = container.querySelector('path[data-graph-edge-interactive]');
    expect(hitPath?.getAttribute('aria-label')).toBe('Graph edge');
  });

  it('renders label text when edge has a label and labelPosition', () => {
    vi.mocked(buildEdgePath).mockReturnValue('M0,0 L10,10');
    const edge = makeEdge('e1', { label: 'Link', labelPosition: { x: 50, y: 50 } });
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} edge={edge} />
      </svg>
    );
    expect(container.querySelector('text')?.textContent).toBe('Link');
  });

  it('does not render label text when edge has no labelPosition', () => {
    vi.mocked(buildEdgePath).mockReturnValue('M0,0 L10,10');
    const edge = makeEdge('e1', { label: 'Link' });
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} edge={edge} />
      </svg>
    );
    expect(container.querySelector('text')).toBeNull();
  });

  it('adds markerEnd to visible path for Directed edges', () => {
    vi.mocked(buildEdgePath).mockReturnValue('M0,0 L10,10');
    const edge = makeEdge('e1', { type: EdgeType.Directed });
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} edge={edge} markerEnd="url(#arrow)" />
      </svg>
    );
    const paths = container.querySelectorAll('path');
    expect(paths[1]?.getAttribute('marker-end')).toBe('url(#arrow)');
  });

  it('calls onClick when the hit path is clicked', () => {
    vi.mocked(buildEdgePath).mockReturnValue('M0,0 L10,10');
    const onClick = vi.fn();
    const { container } = render(
      <svg>
        <EdgePath {...baseProps} onClick={onClick} />
      </svg>
    );
    const hitPath = container.querySelector('path[data-graph-edge-interactive]');
    fireEvent.click(hitPath!);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
