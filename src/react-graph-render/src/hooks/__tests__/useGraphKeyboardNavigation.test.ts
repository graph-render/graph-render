import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_SELECTION } from '../../constants/graph';
import { useGraphKeyboardNavigation } from '../useGraphKeyboardNavigation';

const makeNode = (id: string, x: number, y: number) =>
  ({
    id,
    position: { x, y },
    size: { width: 100, height: 50 },
  }) as const;

const createKeyEvent = (key: string) => ({
  key,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
});

const makeOptions = (overrides = {}) => {
  const nodes = [makeNode('n1', 0, 0), makeNode('n2', 200, 0)];
  return {
    centerOnNode: vi.fn(),
    fitView: vi.fn(),
    focusedNodeId: 'n1',
    handleNodeSelection: vi.fn(),
    keyboardNavigation: true,
    positionedNodeMap: new Map(nodes.map((node) => [node.id, node])),
    positionedNodes: nodes,
    setFocusedPath: vi.fn(),
    updateFocusedNode: vi.fn(),
    updateSelection: vi.fn(),
    updateViewport: vi.fn((updater) => updater({ x: 0, y: 0, zoom: 1 })),
    zoomStep: 0.1,
    ...overrides,
  };
};

describe('useGraphKeyboardNavigation', () => {
  it('does nothing when keyboard navigation is disabled', () => {
    const updateViewport = vi.fn();
    const { result } = renderHook(() =>
      useGraphKeyboardNavigation(makeOptions({ keyboardNavigation: false, updateViewport }))
    );

    act(() => result.current(createKeyEvent('+') as never));
    expect(updateViewport).not.toHaveBeenCalled();
  });

  it('zooms in and out with +/- keys', () => {
    const updateViewport = vi.fn((updater) => updater({ x: 0, y: 0, zoom: 1 }));
    const { result } = renderHook(() =>
      useGraphKeyboardNavigation(makeOptions({ updateViewport }))
    );

    act(() => result.current(createKeyEvent('+') as never));
    expect(updateViewport).toHaveBeenCalled();
    expect(updateViewport.mock.calls[0]![0]({ x: 0, y: 0, zoom: 1 }).zoom).toBeCloseTo(1.1);

    act(() => result.current(createKeyEvent('-') as never));
    expect(updateViewport.mock.calls[1]![0]({ x: 0, y: 0, zoom: 1 }).zoom).toBeCloseTo(0.9);
  });

  it('fits the viewport on 0', () => {
    const fitView = vi.fn();
    const { result } = renderHook(() => useGraphKeyboardNavigation(makeOptions({ fitView })));

    act(() => result.current(createKeyEvent('0') as never));
    expect(fitView).toHaveBeenCalled();
  });

  it('moves focus with arrow keys when a node is focused', () => {
    const updateFocusedNode = vi.fn();
    const centerOnNode = vi.fn();
    const { result } = renderHook(() =>
      useGraphKeyboardNavigation(
        makeOptions({ updateFocusedNode, centerOnNode, focusedNodeId: 'n1' })
      )
    );

    act(() => result.current(createKeyEvent('ArrowRight') as never));
    expect(updateFocusedNode).toHaveBeenCalledWith('n2');
    expect(centerOnNode).toHaveBeenCalledWith('n2');
  });

  it('pans the viewport with arrow keys when nothing is focused', () => {
    const updateViewport = vi.fn((updater) => updater({ x: 10, y: 20, zoom: 1 }));
    const { result } = renderHook(() =>
      useGraphKeyboardNavigation(makeOptions({ focusedNodeId: null, updateViewport }))
    );

    act(() => result.current(createKeyEvent('ArrowLeft') as never));
    expect(updateViewport.mock.calls[0]![0]({ x: 10, y: 20, zoom: 1 }).x).toBe(42);
  });

  it('selects focused node on Enter and clears state on Escape', () => {
    const handleNodeSelection = vi.fn();
    const updateSelection = vi.fn();
    const updateFocusedNode = vi.fn();
    const setFocusedPath = vi.fn();
    const { result } = renderHook(() =>
      useGraphKeyboardNavigation(
        makeOptions({
          handleNodeSelection,
          updateSelection,
          updateFocusedNode,
          setFocusedPath,
        })
      )
    );

    act(() => result.current(createKeyEvent('Enter') as never));
    expect(handleNodeSelection).toHaveBeenCalledWith(expect.objectContaining({ id: 'n1' }));

    act(() => result.current(createKeyEvent('Escape') as never));
    expect(setFocusedPath).toHaveBeenCalledWith(null);
    expect(updateSelection).toHaveBeenCalledWith(DEFAULT_SELECTION);
    expect(updateFocusedNode).toHaveBeenCalledWith(null);
  });
});
