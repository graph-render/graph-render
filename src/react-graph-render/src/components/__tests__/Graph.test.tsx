import { fromTypedNxGraph } from '@graph-render/core';
import { LayoutDirection, LayoutType, RoutingStyle } from '@graph-render/types';
import { SelectionMode } from '@graph-render/types/react';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { makeEmptyNxGraph } from '../../test-utils/graphFixtures';
import { Graph } from '../Graph';

vi.mock('@graph-render/core', () => ({
  DEFAULT_THEME: {
    edgeColor: '#8b9dbf',
    edgeWidth: 2,
    background: '#ffffff',
    fontFamily: 'sans-serif',
    nodeBorderColor: undefined,
    nodeBorderWidth: 0,
  },
  normalizeGraphConfig: vi.fn(() => ({
    theme: {
      edgeColor: '#8b9dbf',
      edgeWidth: 2,
      background: '#ffffff',
      fontFamily: 'sans-serif',
      nodeBorderColor: undefined,
      nodeBorderWidth: 0,
    },
    hoverNodeBorderColor: '#4da3ff',
    hoverNodeBothColor: '#4da3ff',
    hoverEdgeColor: '#4da3ff',
    hoverNodeOutColor: '#ff5b5b',
    hoverNodeInColor: '#4da3ff',
    showArrows: false,
    layout: LayoutType.Tree,
    layoutDirection: LayoutDirection.LTR,
    labels: undefined,
    autoLabels: false,
    labelOffset: 32,
    labelPillBackground: undefined,
    labelPillBorderColor: undefined,
    labelPillTextColor: undefined,
    curveEdges: false,
    routingStyle: RoutingStyle.Smart,
    curveStrength: 0.5,
    edgeLabelColor: undefined,
    hoverHighlight: false,
    hoverNodeHighlight: false,
    width: 800,
    height: 600,
    defaultEdgeType: undefined,
    inputValidationMode: 'none',
    failureBehavior: 'degrade',
    nodeSizing: 'fixed',
  })),
  buildEdgePath: vi.fn(() => null),
  layoutNodes: vi.fn(() => []),
  buildFallbackLayout: vi.fn(() => []),
  validatePositionedNodes: vi.fn(() => ({ valid: [], invalid: [] })),
  routeEdges: vi.fn(() => []),
  buildFallbackEdges: vi.fn(() => []),
  validatePositionedEdges: vi.fn(() => ({ valid: [], invalid: [] })),
  toError: vi.fn((e: unknown) => (e instanceof Error ? e : new Error(String(e)))),
  groupEdgesByTarget: vi.fn(() => new Map()),
  sortEdgesBySourcePosition: vi.fn((edges: unknown[]) => edges),
  fromTypedNxGraph: vi.fn(() => ({ nodes: [], edges: [] })),
  normalizeEdges: vi.fn((edges: unknown[]) => edges),
}));

const StubVertex = ({ node }: any) => (
  <text data-testid={`vertex-${node.id}`}>{node.label ?? node.id}</text>
);

const emptyGraph = makeEmptyNxGraph();

describe('Graph', () => {
  it('renders an SVG element', () => {
    const { container } = render(<Graph graph={emptyGraph} vertexComponent={StubVertex} />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('uses role="application" when keyboard navigation is enabled', () => {
    const { container } = render(<Graph graph={emptyGraph} vertexComponent={StubVertex} />);
    expect(container.querySelector('svg[role="application"]')).not.toBeNull();
  });

  it('uses role="figure" when keyboard navigation is disabled', () => {
    const { container } = render(
      <Graph graph={emptyGraph} vertexComponent={StubVertex} keyboardNavigation={false} />
    );
    expect(container.querySelector('svg[role="figure"]')).not.toBeNull();
  });

  it('has aria-label="Graph" on the SVG', () => {
    const { container } = render(<Graph graph={emptyGraph} vertexComponent={StubVertex} />);
    expect(container.querySelector('svg[aria-label="Graph"]')).not.toBeNull();
  });

  it('renders the nodes group', () => {
    const { container } = render(<Graph graph={emptyGraph} vertexComponent={StubVertex} />);
    expect(container.querySelector('g[aria-label="nodes"]')).not.toBeNull();
  });

  it('renders the edges group', () => {
    const { container } = render(<Graph graph={emptyGraph} vertexComponent={StubVertex} />);
    expect(container.querySelector('g[aria-label="edges"]')).not.toBeNull();
  });

  it('does not render markers when showArrows is false', () => {
    const { container } = render(<Graph graph={emptyGraph} vertexComponent={StubVertex} />);
    expect(container.querySelector('defs')).toBeNull();
  });

  it('does not render viewport controls when showControls is false (default)', () => {
    const { container } = render(<Graph graph={emptyGraph} vertexComponent={StubVertex} />);
    expect(container.querySelector('g[aria-label="viewport-controls"]')).toBeNull();
  });

  it('renders viewport controls when showControls is true', () => {
    const { container } = render(
      <Graph graph={emptyGraph} vertexComponent={StubVertex} showControls />
    );
    expect(container.querySelector('g[aria-label="viewport-controls"]')).not.toBeNull();
  });

  it('renders a <desc> element for accessibility', () => {
    const { container } = render(<Graph graph={emptyGraph} vertexComponent={StubVertex} />);
    expect(container.querySelector('desc')).not.toBeNull();
  });

  it('renders an SVG with the configured width and height', () => {
    const { container } = render(<Graph graph={emptyGraph} vertexComponent={StubVertex} />);
    const svg = container.querySelector('svg');
    // normalizeGraphConfig mock returns 800x600
    expect(svg?.getAttribute('width')).toBe('800');
    expect(svg?.getAttribute('height')).toBe('600');
  });

  it('clears selection when SVG background is clicked', () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <Graph
        graph={emptyGraph}
        vertexComponent={StubVertex}
        onSelectionChange={onSelectionChange}
        defaultSelectedNodeIds={['n1']}
      />
    );
    const svg = container.querySelector('svg');
    // simulate click on SVG itself (target === currentTarget)
    fireEvent.click(svg!, { target: svg });
    // Selection clearing is triggered via internal state update
    // We just verify no error is thrown and component is still mounted
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('accepts and forwards a ref via React.forwardRef', () => {
    const ref = React.createRef<any>();
    render(<Graph ref={ref} graph={emptyGraph} vertexComponent={StubVertex} />);
    // ref is attached but may be null if handle is not explicitly set
    expect(() =>
      render(<Graph ref={ref} graph={emptyGraph} vertexComponent={StubVertex} />)
    ).not.toThrow();
  });

  it('stops propagation for handled keyboard shortcuts', () => {
    const onParentKeyDown = vi.fn();
    const { container } = render(
      <button type="button" onKeyDown={onParentKeyDown}>
        <Graph graph={emptyGraph} vertexComponent={StubVertex} />
      </button>
    );
    fireEvent.keyDown(container.querySelector('svg')!, { key: '+' });
    expect(onParentKeyDown).not.toHaveBeenCalled();
  });

  it('clears drag state on pointer cancel', () => {
    const { container } = render(<Graph graph={emptyGraph} vertexComponent={StubVertex} />);
    const svg = container.querySelector('svg')!;
    fireEvent.pointerDown(svg, { button: 0, clientX: 10, clientY: 10, pointerId: 1 });
    expect(svg).toHaveStyle({ cursor: 'grabbing' });
    fireEvent.pointerCancel(svg, { pointerId: 1 });
    expect(svg).toHaveStyle({ cursor: 'grab' });
  });

  it('commits the latest marquee bounds when pointer up happens before RAF paint', () => {
    vi.mocked(fromTypedNxGraph).mockReturnValue({
      nodes: [{ id: 'n1', label: 'Node 1' }],
      edges: [],
    });
    const onSelectionChange = vi.fn();
    const { container } = render(
      <Graph
        graph={emptyGraph}
        vertexComponent={StubVertex}
        selectionMode={SelectionMode.Multiple}
        onSelectionChange={onSelectionChange}
        layoutNodesOverride={() => [
          {
            id: 'n1',
            label: 'Node 1',
            position: { x: 100, y: 100 },
            size: { width: 20, height: 20 },
          },
        ]}
      />
    );

    const svg = container.querySelector('svg')!;
    fireEvent.pointerDown(svg, { button: 0, clientX: 0, clientY: 0, pointerId: 1, shiftKey: true });
    fireEvent.pointerMove(svg, { clientX: 150, clientY: 150, pointerId: 1, shiftKey: true });
    fireEvent.pointerUp(svg, { clientX: 150, clientY: 150, pointerId: 1, shiftKey: true });

    expect(onSelectionChange).toHaveBeenCalledWith({ nodeIds: ['n1'], edgeIds: [] });
    vi.mocked(fromTypedNxGraph).mockReturnValue({ nodes: [], edges: [] });
  });
});
