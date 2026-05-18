import { EdgeType } from '@graph-render/types';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GraphEdgesLayer } from '../GraphEdgesLayer';

const makeEdge = (id: string) =>
  ({
    id,
    source: 'a',
    target: 'b',
    type: EdgeType.Directed,
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ],
    sourcePosition: { x: 0, y: 0 },
    targetPosition: { x: 100, y: 100 },
  }) as any;

// A minimal stub EdgeComponent for testing layer rendering
const StubEdge = ({ edge, isHovered, isSelected, onHoverChange, onClick }: any) => (
  <g
    data-testid={`edge-${edge.id}`}
    data-hovered={String(isHovered)}
    data-selected={String(isSelected)}
    onClick={onClick}
    onMouseEnter={() => onHoverChange?.(true)}
    onMouseLeave={() => onHoverChange?.(false)}
  />
);

const baseProps = {
  EdgeComponent: StubEdge,
  edgeColor: '#334155',
  edgeWidth: 2,
  curveEdges: false,
  curveStrength: 0.5,
  showArrows: false,
  arrowMarkerId: 'arrow',
  hoverArrowMarkerId: 'hover-arrow',
  hoverIncomingArrowMarkerId: 'hover-in',
  selectionArrowMarkerId: 'sel-arrow',
  hoverHighlight: true,
  hoveredEdgeId: null,
  hoveredNodeId: null,
  selectedEdgeSet: new Set<string>(),
  highlightedEdgeSet: new Set<string>(),
  hoverEdgeColor: '#4da3ff',
  hoverNodeOutColor: '#ff5b5b',
  selectionEdgeColor: '#f59e0b',
  highlightColor: '#f59e0b',
  onEdgeHoverChange: vi.fn(),
  onEdgeSelection: vi.fn(),
};

describe('GraphEdgesLayer', () => {
  it('renders a group with aria-label="edges"', () => {
    const { container } = render(
      <svg>
        <GraphEdgesLayer {...baseProps} edges={[]} />
      </svg>
    );
    expect(container.querySelector('g[aria-label="edges"]')).not.toBeNull();
  });

  it('renders nothing when edges array is empty', () => {
    const { container } = render(
      <svg>
        <GraphEdgesLayer {...baseProps} edges={[]} />
      </svg>
    );
    const edgesGroup = container.querySelector('g[aria-label="edges"]');
    expect(edgesGroup?.children).toHaveLength(0);
  });

  it('renders one EdgeComponent per edge', () => {
    const { getAllByTestId } = render(
      <svg>
        <GraphEdgesLayer {...baseProps} edges={[makeEdge('e1'), makeEdge('e2')]} />
      </svg>
    );
    expect(getAllByTestId(/^edge-/)).toHaveLength(2);
  });

  it('passes isSelected=false for edges not in selectedEdgeSet', () => {
    const { getByTestId } = render(
      <svg>
        <GraphEdgesLayer {...baseProps} edges={[makeEdge('e1')]} />
      </svg>
    );
    expect(getByTestId('edge-e1').dataset['selected']).toBe('false');
  });

  it('passes isSelected=true for edges in selectedEdgeSet', () => {
    const { getByTestId } = render(
      <svg>
        <GraphEdgesLayer
          {...baseProps}
          edges={[makeEdge('e1')]}
          selectedEdgeSet={new Set(['e1'])}
        />
      </svg>
    );
    expect(getByTestId('edge-e1').dataset['selected']).toBe('true');
  });

  it('calls onEdgeHoverChange when an edge is hovered', () => {
    const onEdgeHoverChange = vi.fn();
    const { getByTestId } = render(
      <svg>
        <GraphEdgesLayer
          {...baseProps}
          edges={[makeEdge('e1')]}
          onEdgeHoverChange={onEdgeHoverChange}
        />
      </svg>
    );
    fireEvent.mouseEnter(getByTestId('edge-e1'));
    expect(onEdgeHoverChange).toHaveBeenCalledWith('e1', true);
  });

  it('calls onEdgeSelection when an edge is clicked', () => {
    const onEdgeSelection = vi.fn();
    const edge = makeEdge('e1');
    const { getByTestId } = render(
      <svg>
        <GraphEdgesLayer {...baseProps} edges={[edge]} onEdgeSelection={onEdgeSelection} />
      </svg>
    );
    fireEvent.click(getByTestId('edge-e1'));
    expect(onEdgeSelection).toHaveBeenCalledWith(edge);
  });

  it('passes isHovered=true when edge id matches hoveredEdgeId', () => {
    const { getByTestId } = render(
      <svg>
        <GraphEdgesLayer {...baseProps} edges={[makeEdge('e1')]} hoveredEdgeId="e1" />
      </svg>
    );
    expect(getByTestId('edge-e1').dataset['hovered']).toBe('true');
  });
});
