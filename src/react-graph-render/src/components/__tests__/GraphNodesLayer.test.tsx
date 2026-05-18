import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GraphNodesLayer } from '../GraphNodesLayer';

const StubVertex = ({ node }: any) => (
  <text data-testid={`vertex-${node.id}`}>{node.label ?? node.id}</text>
);

const makeNode = (id: string, overrides: Record<string, unknown> = {}) =>
  ({
    id,
    label: id,
    position: { x: 0, y: 0 },
    size: { width: 180, height: 72 },
    ...overrides,
  }) as any;

const baseProps = {
  Vertex: StubVertex,
  selectedNodeSet: new Set<string>(),
  focusedNodeId: null,
  highlightedNodeSet: new Set<string>(),
  highlightColor: '#f59e0b',
  selectionColor: '#f59e0b',
  nodeBorderWidth: 2,
  hoverNodeBorderColor: '#4da3ff',
  hoverNodeBothColor: '#4da3ff',
  hoverNodeInColor: '#4da3ff',
  hoverNodeOutColor: '#ff5b5b',
  hoverNodeHighlight: true,
  hoveredNodeStates: undefined,
  onNodeFocus: vi.fn(),
  onNodeClick: vi.fn(),
  onNodeDoubleClick: vi.fn(),
  onNodeMouseEnter: vi.fn(),
  onNodeMouseLeave: vi.fn(),
  onPathHover: vi.fn(),
  onPathLeave: vi.fn(),
};

describe('GraphNodesLayer', () => {
  it('renders a group with aria-label="nodes"', () => {
    const { container } = render(
      <svg>
        <GraphNodesLayer {...baseProps} nodes={[]} />
      </svg>
    );
    expect(container.querySelector('g[aria-label="nodes"]')).not.toBeNull();
  });

  it('renders nothing when nodes is empty', () => {
    const { container } = render(
      <svg>
        <GraphNodesLayer {...baseProps} nodes={[]} />
      </svg>
    );
    expect(container.querySelectorAll('[data-graph-node-interactive]')).toHaveLength(0);
  });

  it('renders one node group per node', () => {
    const { container } = render(
      <svg>
        <GraphNodesLayer {...baseProps} nodes={[makeNode('n1'), makeNode('n2')]} />
      </svg>
    );
    expect(container.querySelectorAll('[data-graph-node-interactive]')).toHaveLength(2);
  });

  it('renders vertex for each node', () => {
    const { getAllByTestId } = render(
      <svg>
        <GraphNodesLayer {...baseProps} nodes={[makeNode('n1'), makeNode('n2')]} />
      </svg>
    );
    expect(getAllByTestId(/^vertex-/)).toHaveLength(2);
  });

  it('renders focused rect for focused node', () => {
    const { container } = render(
      <svg>
        <GraphNodesLayer {...baseProps} nodes={[makeNode('n1')]} focusedNodeId="n1" />
      </svg>
    );
    // GraphNodeFrame renders 2 rects when focused
    expect(container.querySelectorAll('rect').length).toBeGreaterThanOrEqual(2);
  });

  it('calls onNodeClick when a node is clicked', () => {
    const onNodeClick = vi.fn();
    const { container } = render(
      <svg>
        <GraphNodesLayer {...baseProps} nodes={[makeNode('n1')]} onNodeClick={onNodeClick} />
      </svg>
    );
    const nodeGroup = container.querySelector('[data-graph-node-interactive]');
    fireEvent.click(nodeGroup!);
    expect(onNodeClick).toHaveBeenCalledTimes(1);
  });

  it('calls onNodeMouseEnter when a node is hovered', () => {
    const onNodeMouseEnter = vi.fn();
    const { container } = render(
      <svg>
        <GraphNodesLayer
          {...baseProps}
          nodes={[makeNode('n1')]}
          onNodeMouseEnter={onNodeMouseEnter}
        />
      </svg>
    );
    const nodeGroup = container.querySelector('[data-graph-node-interactive]');
    fireEvent.mouseEnter(nodeGroup!);
    expect(onNodeMouseEnter).toHaveBeenCalledWith('n1');
  });

  it('calls onNodeMouseLeave when a node is un-hovered', () => {
    const onNodeMouseLeave = vi.fn();
    const { container } = render(
      <svg>
        <GraphNodesLayer
          {...baseProps}
          nodes={[makeNode('n1')]}
          onNodeMouseLeave={onNodeMouseLeave}
        />
      </svg>
    );
    const nodeGroup = container.querySelector('[data-graph-node-interactive]');
    fireEvent.mouseLeave(nodeGroup!);
    expect(onNodeMouseLeave).toHaveBeenCalledTimes(1);
  });
});
