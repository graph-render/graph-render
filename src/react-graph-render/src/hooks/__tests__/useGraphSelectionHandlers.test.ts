import { SelectionMode } from '@graph-render/types/react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGraphSelectionHandlers } from '../useGraphSelectionHandlers';

const makeNode = (id: string) =>
  ({ id, position: { x: 0, y: 0 }, size: { width: 100, height: 50 } }) as const;

const makeEdge = (id: string) =>
  ({
    id,
    source: 'n1',
    target: 'n2',
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ],
  }) as const;

describe('useGraphSelectionHandlers', () => {
  it('focuses node without toggling selection when node selection is disabled', () => {
    const updateFocusedNode = vi.fn();
    const updateSelection = vi.fn();
    const onNodeClick = vi.fn();
    const node = makeNode('n1');
    const { result } = renderHook(() =>
      useGraphSelectionHandlers({
        edgeSelectionEnabled: true,
        nodeSelectionEnabled: false,
        onEdgeClick: undefined,
        onNodeClick,
        selectionMode: SelectionMode.Single,
        updateFocusedNode,
        updateSelection,
      })
    );

    act(() => result.current.handleNodeSelection(node));
    expect(updateFocusedNode).toHaveBeenCalledWith('n1');
    expect(updateSelection).not.toHaveBeenCalled();
    expect(onNodeClick).toHaveBeenCalledWith(node);
  });

  it('toggles node selection in multi mode', () => {
    const updateSelection = vi.fn((updater) => updater({ nodeIds: [], edgeIds: [] }));
    const { result } = renderHook(() =>
      useGraphSelectionHandlers({
        edgeSelectionEnabled: true,
        nodeSelectionEnabled: true,
        onEdgeClick: undefined,
        onNodeClick: undefined,
        selectionMode: SelectionMode.Multiple,
        updateFocusedNode: vi.fn(),
        updateSelection,
      })
    );

    act(() => result.current.handleNodeSelection(makeNode('n1')));
    expect(updateSelection).toHaveBeenCalled();
    const next = updateSelection.mock.calls[0]![0]({ nodeIds: [], edgeIds: ['e-old'] });
    expect(next.nodeIds).toEqual(['n1']);
    expect(next.edgeIds).toEqual(['e-old']);
  });

  it('clears edges when selecting a node in single mode', () => {
    const updateSelection = vi.fn((updater) => updater({ nodeIds: [], edgeIds: ['e1'] }));
    const { result } = renderHook(() =>
      useGraphSelectionHandlers({
        edgeSelectionEnabled: true,
        nodeSelectionEnabled: true,
        onEdgeClick: undefined,
        onNodeClick: undefined,
        selectionMode: SelectionMode.Single,
        updateFocusedNode: vi.fn(),
        updateSelection,
      })
    );

    act(() => result.current.handleNodeSelection(makeNode('n2')));
    const next = updateSelection.mock.calls[0]![0]({ nodeIds: [], edgeIds: ['e1'] });
    expect(next).toEqual({ nodeIds: ['n2'], edgeIds: [] });
  });

  it('invokes edge click without selection when edge selection is disabled', () => {
    const onEdgeClick = vi.fn();
    const updateSelection = vi.fn();
    const edge = makeEdge('e1');
    const { result } = renderHook(() =>
      useGraphSelectionHandlers({
        edgeSelectionEnabled: false,
        nodeSelectionEnabled: true,
        onEdgeClick,
        onNodeClick: undefined,
        selectionMode: SelectionMode.Single,
        updateFocusedNode: vi.fn(),
        updateSelection,
      })
    );

    act(() => result.current.handleEdgeSelection(edge));
    expect(onEdgeClick).toHaveBeenCalledWith(edge);
    expect(updateSelection).not.toHaveBeenCalled();
  });
});
