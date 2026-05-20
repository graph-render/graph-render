import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createNodeMeasurementScheduler } from '../../utils/nodeMeasurementScheduler';
import { GraphNode } from '../GraphNode';

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
  isSelected: false,
  nodeSelectionEnabled: true,
  isFocused: false,
  isHighlighted: false,
  highlightColor: '#f59e0b',
  selectionColor: '#f59e0b',
  nodeBorderWidth: 2,
  hoverNodeBorderColor: '#4da3ff',
  hoverNodeBothColor: '#4da3ff',
  hoverNodeInColor: '#4da3ff',
  hoverNodeOutColor: '#ff5b5b',
  hoverNodeHighlight: true,
  isActivePathNode: false,
  isHoveredIn: false,
  isHoveredOut: false,
  measurementScheduler: createNodeMeasurementScheduler(),
  onNodeMouseEnter: vi.fn(),
  onNodeMouseLeave: vi.fn(),
  onPathHover: vi.fn(),
  onPathLeave: vi.fn(),
  nodeFill: 'white',
  nodeStroke: '#d7dbe3',
  nodeTextColor: '#111827',
  nodeTextSize: 14,
  nodeRadius: 8,
  fontFamily: 'system-ui, sans-serif',
};

describe('GraphNode', () => {
  it('renders a group element with role="button"', () => {
    const { container } = render(
      <svg>
        <GraphNode {...baseProps} node={makeNode('n1')} />
      </svg>
    );
    expect(container.querySelector('g[role="button"]')).not.toBeNull();
  });

  it('renders a Vertex inside the node group', () => {
    const { getByTestId } = render(
      <svg>
        <GraphNode {...baseProps} node={makeNode('n1')} />
      </svg>
    );
    expect(getByTestId('vertex-n1')).toBeInTheDocument();
  });

  it('applies translate transform from node position', () => {
    const node = makeNode('n1', { position: { x: 50, y: 120 } });
    const { container } = render(
      <svg>
        <GraphNode {...baseProps} node={node} />
      </svg>
    );
    const group = container.querySelector('g[data-graph-node-interactive]');
    expect(group?.getAttribute('transform')).toBe('translate(50, 120)');
  });

  it('uses node label as aria-label', () => {
    const node = makeNode('n1', { label: 'My Node' });
    const { container } = render(
      <svg>
        <GraphNode {...baseProps} node={node} />
      </svg>
    );
    const group = container.querySelector('g[data-graph-node-interactive]');
    expect(group?.getAttribute('aria-label')).toBe('My Node');
  });

  it('uses node id as aria-label when label is not a string', () => {
    const node = makeNode('n1', { label: undefined });
    const { container } = render(
      <svg>
        <GraphNode {...baseProps} node={node} />
      </svg>
    );
    const group = container.querySelector('g[data-graph-node-interactive]');
    expect(group?.getAttribute('aria-label')).toBe('n1');
  });

  it('has aria-pressed reflecting selection state', () => {
    const node = makeNode('n1');
    const { container } = render(
      <svg>
        <GraphNode {...baseProps} node={node} isSelected />
      </svg>
    );
    const group = container.querySelector('g[data-graph-node-interactive]');
    expect(group?.getAttribute('aria-pressed')).toBe('true');
  });

  it('calls onNodeClick when clicked', () => {
    const onNodeClick = vi.fn();
    const node = makeNode('n1');
    const { container } = render(
      <svg>
        <GraphNode {...baseProps} node={node} onNodeClick={onNodeClick} />
      </svg>
    );
    const group = container.querySelector('g[data-graph-node-interactive]');
    fireEvent.click(group!);
    expect(onNodeClick).toHaveBeenCalledWith(node);
  });

  it('calls onNodeMouseEnter when mouse enters', () => {
    const onNodeMouseEnter = vi.fn();
    const node = makeNode('n1');
    const { container } = render(
      <svg>
        <GraphNode {...baseProps} node={node} onNodeMouseEnter={onNodeMouseEnter} />
      </svg>
    );
    const group = container.querySelector('g[data-graph-node-interactive]');
    fireEvent.mouseEnter(group!);
    expect(onNodeMouseEnter).toHaveBeenCalledWith('n1');
  });

  it('calls onNodeMouseLeave when mouse leaves', () => {
    const onNodeMouseLeave = vi.fn();
    const node = makeNode('n1');
    const { container } = render(
      <svg>
        <GraphNode {...baseProps} node={node} onNodeMouseLeave={onNodeMouseLeave} />
      </svg>
    );
    const group = container.querySelector('g[data-graph-node-interactive]');
    fireEvent.mouseLeave(group!);
    expect(onNodeMouseLeave).toHaveBeenCalledTimes(1);
  });

  it('calls onNodeDoubleClick when double-clicked', () => {
    const onNodeDoubleClick = vi.fn();
    const node = makeNode('n1');
    const { container } = render(
      <svg>
        <GraphNode {...baseProps} node={node} onNodeDoubleClick={onNodeDoubleClick} />
      </svg>
    );
    const group = container.querySelector('g[data-graph-node-interactive]');
    fireEvent.dblClick(group!);
    expect(onNodeDoubleClick).toHaveBeenCalledWith(node);
  });

  it('calls onNodeClick when Enter key pressed', () => {
    const onNodeClick = vi.fn();
    const node = makeNode('n1');
    const { container } = render(
      <svg>
        <GraphNode {...baseProps} node={node} onNodeClick={onNodeClick} />
      </svg>
    );
    const group = container.querySelector('g[data-graph-node-interactive]');
    fireEvent.keyDown(group!, { key: 'Enter' });
    expect(onNodeClick).toHaveBeenCalledWith(node);
  });

  it('renders a focus rect when isFocused is true', () => {
    const { container } = render(
      <svg>
        <GraphNode {...baseProps} node={makeNode('n1')} isFocused />
      </svg>
    );
    // GraphNodeFrame renders 2 rects when focused
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThanOrEqual(2);
  });

  it('renders only 1 rect when isFocused is false', () => {
    const { container } = render(
      <svg>
        <GraphNode {...baseProps} node={makeNode('n1')} isFocused={false} />
      </svg>
    );
    expect(container.querySelectorAll('rect')).toHaveLength(1);
  });
});
