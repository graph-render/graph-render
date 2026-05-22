/**
 * Integration test for <Graph />.
 *
 * Uses real @graph-render/core (no mock). Only browser APIs that do not exist
 * in jsdom are mocked: SVGElement.prototype.getBBox and ResizeObserver.
 */
import type { NxGraphInput } from '@graph-render/types';
import type { VertexComponent } from '@graph-render/types/react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { Graph } from '../Graph';

// ── jsdom shims ──────────────────────────────────────────────────────────────

beforeAll(() => {
  // jsdom does not implement SVGElement.getBBox
  (SVGElement.prototype as unknown as { getBBox: () => SVGRect }).getBBox = () =>
    ({ x: 0, y: 0, width: 0, height: 0 }) as SVGRect;

  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

// ── Fixtures ─────────────────────────────────────────────────────────────────

const ThreeNodeVertex: VertexComponent = ({ node }) => (
  <text data-testid={`node-${node.id}`}>{String(node.label ?? node.id)}</text>
);

const threeNodeGraph: NxGraphInput = {
  nodes: { n1: { label: 'Node 1' }, n2: { label: 'Node 2' }, n3: { label: 'Node 3' } },
  adj: {
    n1: { n2: { id: 'e1' } },
    n2: { n3: { id: 'e2' } },
    n3: {},
  },
};

const emptyGraph: NxGraphInput = { nodes: {}, adj: {} };

// ── Tests ─────────────────────────────────────────────────────────────────────

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Graph (integration)', () => {
  it('renders an SVG element', () => {
    const { container } = render(
      <Graph graph={threeNodeGraph} vertexComponent={ThreeNodeVertex} />
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders all three node vertices', async () => {
    render(<Graph graph={threeNodeGraph} vertexComponent={ThreeNodeVertex} />);
    await screen.findByTestId('node-n1');
    await screen.findByTestId('node-n2');
    await screen.findByTestId('node-n3');
  });

  it('does not crash when graph is empty', () => {
    const EmptyVertex: VertexComponent = () => <text />;
    expect(() => render(<Graph graph={emptyGraph} vertexComponent={EmptyVertex} />)).not.toThrow();
  });

  it('calls onLayoutChange after initial layout', async () => {
    const onLayoutChange = vi.fn();
    render(
      <Graph
        graph={threeNodeGraph}
        vertexComponent={ThreeNodeVertex}
        onLayoutChange={onLayoutChange}
      />
    );
    await waitFor(() => {
      expect(onLayoutChange).toHaveBeenCalled();
    });
    const firstCall = onLayoutChange.mock.calls[0];
    expect(firstCall).toBeDefined();
    const { nodes, edges } = firstCall![0] as { nodes: unknown[]; edges: unknown[] };
    expect(nodes.length).toBe(3);
    expect(edges.length).toBe(2);
  });

  it('renders with fitViewOnMount without crashing', () => {
    expect(() =>
      render(
        <Graph
          graph={threeNodeGraph}
          vertexComponent={ThreeNodeVertex}
          fitViewOnMount
          fitViewPadding={16}
        />
      )
    ).not.toThrow();
  });
});
