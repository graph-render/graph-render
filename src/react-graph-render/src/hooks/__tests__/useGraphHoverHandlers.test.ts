import { GraphHoverTrigger } from '@graph-render/types/react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGraphHoverHandlers } from '../useGraphHoverHandlers';

const makeNode = (id: string) =>
  ({ id, position: { x: 0, y: 0 }, size: { width: 100, height: 50 } }) as const;

const makeEdge = (id: string, source: string, target: string) =>
  ({
    id,
    source,
    target,
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ],
  }) as const;

const makeOptions = (overrides = {}) => {
  const node = makeNode('n1');
  const edge = makeEdge('e1', 'n1', 'n2');
  return {
    hoverHighlight: true,
    onEdgeHoverChange: vi.fn(),
    onNodeHoverChange: vi.fn(),
    positionedEdgeMap: new Map([[edge.id, edge]]),
    positionedNodeMap: new Map([[node.id, node]]),
    selection: { nodeIds: [], edgeIds: [] },
    setFocusedPath: vi.fn(),
    setHoveredEdgeId: vi.fn(),
    setHoveredNodeId: vi.fn(),
    viewport: { x: 0, y: 0, zoom: 1 },
    ...overrides,
  };
};

describe('useGraphHoverHandlers', () => {
  it('tracks node hover enter and leave', () => {
    const onNodeHoverChange = vi.fn();
    const setHoveredNodeId = vi.fn();
    const setFocusedPath = vi.fn();
    const { result } = renderHook(() =>
      useGraphHoverHandlers(
        makeOptions({ onNodeHoverChange, setHoveredNodeId, setFocusedPath })
      )
    );

    act(() => result.current.handleNodeMouseEnter('n1'));
    expect(setHoveredNodeId).toHaveBeenCalledWith('n1');
    expect(onNodeHoverChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'n1' }),
      true,
      expect.objectContaining({ trigger: GraphHoverTrigger.Pointer })
    );

    act(() => result.current.handleNodeMouseLeave());
    expect(setHoveredNodeId).toHaveBeenCalledWith(null);
    expect(setFocusedPath).toHaveBeenCalledWith(null);
    expect(onNodeHoverChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'n1' }),
      false,
      expect.any(Object)
    );
  });

  it('sets focused path on path hover', () => {
    const setFocusedPath = vi.fn();
    const onNodeHoverChange = vi.fn();
    const { result } = renderHook(() =>
      useGraphHoverHandlers(makeOptions({ setFocusedPath, onNodeHoverChange }))
    );

    act(() => result.current.handlePathHover('n1', 0, 'path-key'));
    expect(setFocusedPath).toHaveBeenCalledWith({
      nodeId: 'n1',
      sourceIndex: 0,
      pathKey: 'path-key',
    });
    expect(onNodeHoverChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'n1' }),
      true,
      expect.objectContaining({ trigger: GraphHoverTrigger.Path })
    );

    act(() => result.current.handlePathLeave());
    expect(setFocusedPath).toHaveBeenCalledWith(null);
  });

  it('clears node hover when edge highlight is enabled', () => {
    const setHoveredEdgeId = vi.fn();
    const setHoveredNodeId = vi.fn();
    const onEdgeHoverChange = vi.fn();
    const { result } = renderHook(() =>
      useGraphHoverHandlers(
        makeOptions({ setHoveredEdgeId, setHoveredNodeId, onEdgeHoverChange })
      )
    );

    act(() => result.current.handleEdgeHoverChange('e1', true));
    expect(setHoveredEdgeId).toHaveBeenCalledWith('e1');
    expect(setHoveredNodeId).toHaveBeenCalledWith(null);
    expect(onEdgeHoverChange).toHaveBeenCalled();

    act(() => result.current.handleEdgeHoverChange('e1', false));
    expect(setHoveredEdgeId).toHaveBeenCalledWith(null);
  });

  it('skips edge hover state updates when hoverHighlight is disabled', () => {
    const setHoveredEdgeId = vi.fn();
    const { result } = renderHook(() =>
      useGraphHoverHandlers(makeOptions({ hoverHighlight: false, setHoveredEdgeId }))
    );

    act(() => result.current.handleEdgeHoverChange('e1', true));
    expect(setHoveredEdgeId).not.toHaveBeenCalled();
  });
});
