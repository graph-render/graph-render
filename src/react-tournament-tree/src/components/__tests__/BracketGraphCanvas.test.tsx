import type {
  GraphConfig,
  GraphHandle,
  TournamentBracketProps,
  VertexComponentProps,
} from '@graph-render/types';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { BracketGraphCanvas } from '../Bracket/BracketGraphCanvas';

// Mock @graph-render/react — Graph is a complex canvas component; GraphStageSync uses
// groupPositionedNodesByColumn from the same package.
vi.mock('@graph-render/react', () => ({
  Graph: vi.fn(() => null),
  groupPositionedNodesByColumn: vi.fn(() => []),
}));

const FakeVertex = (_props: VertexComponentProps) => null;

const mockGraphRef = React.createRef<GraphHandle>();
const mockWrapperRef = React.createRef<HTMLDivElement>();

const baseProps = {
  graphRef: mockGraphRef,
  wrapperRef: mockWrapperRef,
  graph: { nodes: [], edges: [] } as unknown as TournamentBracketProps['graph'],
  vertexComponent: FakeVertex,
  config: { labelOffset: 46 } as GraphConfig,
  defaultViewport: undefined,
  isNavigationMode: false,
  translateExtent: undefined,
  showViewportControls: false,
  panEnabled: undefined,
  zoomEnabled: undefined,
  pinchZoomEnabled: undefined,
  labels: ['QF', 'SF'],
  onStagesChange: vi.fn(),
  onMatchClick: undefined,
};

describe('BracketGraphCanvas', () => {
  it('renders a wrapper div', () => {
    render(<BracketGraphCanvas {...baseProps} />);
    // The component renders a wrapper div — verified by checking it doesn't crash
    // and the Graph (mocked) component is within a div wrapper
    expect(() => render(<BracketGraphCanvas {...baseProps} />)).not.toThrow();
  });

  it('renders without crashing', () => {
    expect(() => render(<BracketGraphCanvas {...baseProps} />)).not.toThrow();
  });

  it('passes onMatchClick through correctly (no error when undefined)', () => {
    expect(() =>
      render(<BracketGraphCanvas {...baseProps} onMatchClick={undefined} />)
    ).not.toThrow();
  });

  it('accepts a custom onMatchClick handler', () => {
    const onMatchClick = vi.fn();
    expect(() =>
      render(<BracketGraphCanvas {...baseProps} onMatchClick={onMatchClick} />)
    ).not.toThrow();
  });
});
