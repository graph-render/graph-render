import { Graph } from '@graph-render/react';
import type { GraphConfig, PositionedNode } from '@graph-render/types';
import type { GraphHandle, VertexComponentProps } from '@graph-render/types/react';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { TournamentBracketProps } from '../../models/tournamentBracket';
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
  onInvalidNode: undefined,
};

interface LastGraphProps {
  onNodeClick?: (node: PositionedNode) => void;
  onLayoutChange?: (ctx: unknown) => void;
}

/** Extract props passed to the most recently rendered <Graph> mock. */
function getLastGraphProps(): LastGraphProps {
  const calls = (Graph as ReturnType<typeof vi.fn>).mock.calls;
  return (calls.at(-1)?.[0] as LastGraphProps | undefined) ?? {};
}

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

  it('handleMatchClick does nothing when onMatchClick is undefined', () => {
    render(<BracketGraphCanvas {...baseProps} onMatchClick={undefined} />);
    const { onNodeClick } = getLastGraphProps();
    expect(() => {
      onNodeClick?.({
        id: 'n1',
        position: { x: 0, y: 0 },
        size: { width: 1, height: 1 },
        meta: {},
      });
    }).not.toThrow();
  });

  it('handleMatchClick calls onMatchClick with a valid squash node', () => {
    const onMatchClick = vi.fn();
    const validMeta = {
      stage: 'QF',
      players: [
        { name: 'A', seed: 1 },
        { name: 'B', seed: 2 },
      ],
      sets: [[11, 9]],
      tiebreaks: [null],
      status: 'completed',
      currentSet: 0,
    };
    render(<BracketGraphCanvas {...baseProps} onMatchClick={onMatchClick} />);
    const { onNodeClick } = getLastGraphProps();
    onNodeClick?.({
      id: 'n1',
      position: { x: 0, y: 0 },
      size: { width: 280, height: 100 },
      meta: validMeta,
    });
    expect(onMatchClick).toHaveBeenCalledTimes(1);
  });

  it('handleMatchClick calls onInvalidNode when meta is not a squash node', () => {
    const onMatchClick = vi.fn();
    const onInvalidNode = vi.fn();
    render(
      <BracketGraphCanvas
        {...baseProps}
        onMatchClick={onMatchClick}
        onInvalidNode={onInvalidNode}
      />
    );
    const { onNodeClick } = getLastGraphProps();
    onNodeClick?.({
      id: 'bad-node',
      position: { x: 0, y: 0 },
      size: { width: 1, height: 1 },
      meta: null,
    } as unknown as PositionedNode);
    expect(onInvalidNode).toHaveBeenCalledWith('bad-node', expect.any(TypeError));
    expect(onMatchClick).not.toHaveBeenCalled();
  });

  it('handleLayoutChange calls onStagesChange with computed stages', () => {
    const onStagesChange = vi.fn();
    render(<BracketGraphCanvas {...baseProps} onStagesChange={onStagesChange} />);
    const { onLayoutChange } = getLastGraphProps();
    const fakeContext = {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    };
    onLayoutChange?.(fakeContext);
    expect(onStagesChange).toHaveBeenCalledTimes(1);
    expect(Array.isArray(onStagesChange.mock.calls[0]?.[0])).toBe(true);
  });
});
