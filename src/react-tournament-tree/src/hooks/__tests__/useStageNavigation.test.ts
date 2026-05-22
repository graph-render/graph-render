import type { StageView } from '@graph-render/types/tournament';
import { VerticalStagePosition } from '@graph-render/types/tournament';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { UseStageNavigationParams } from '../../models/bracket';
import { useStageNavigation } from '../useStageNavigation';

const makeStageView = (index: number, label: string): StageView => ({
  index,
  label,
  bounds: {
    minX: index * 300,
    maxX: (index + 1) * 300,
    minY: 0,
    maxY: 200,
    width: 300,
    height: 200,
  },
  nodeIds: [],
});

const makeGraphHandle = () => ({
  setViewport: vi.fn(),
  fitView: vi.fn(),
  getViewport: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
  centerOnNode: vi.fn(),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  zoomTo: vi.fn(),
  resetViewport: vi.fn(),
});

function makeContainer(): HTMLDivElement {
  const div = document.createElement('div');
  Object.defineProperty(div, 'clientWidth', { get: () => 800, configurable: true });
  Object.defineProperty(div, 'clientHeight', { get: () => 600, configurable: true });
  document.body.append(div);
  return div;
}

function makeParams(overrides: Partial<UseStageNavigationParams> = {}): UseStageNavigationParams {
  const graphHandle = makeGraphHandle();
  return {
    defaultNavigationMode: false,
    graphRef: { current: graphHandle } as unknown as UseStageNavigationParams['graphRef'],
    contentViewportRef: {
      current: makeContainer(),
    },
    graphWidth: 1600,
    graphHeight: 1200,
    stageViews: [],
    setStageViews: vi.fn(),
    ...overrides,
  };
}

describe('useStageNavigation', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useStageNavigation(makeParams()));
    expect(result.current.isNavigationMode).toBe(false);
    expect(result.current.activeStageIndex).toBe(0);
    expect(result.current.verticalStagePosition).toBe(VerticalStagePosition.Top);
    expect(result.current.canPagePlayersVertically).toBe(false);
  });

  it('respects defaultNavigationMode=true', () => {
    const { result } = renderHook(() =>
      useStageNavigation(makeParams({ defaultNavigationMode: true }))
    );
    expect(result.current.isNavigationMode).toBe(true);
  });

  it('handleToggleNavigationMode enables navigation mode', () => {
    const params = makeParams({ defaultNavigationMode: false });
    const { result } = renderHook(() => useStageNavigation(params));

    act(() => {
      result.current.handleToggleNavigationMode();
    });

    expect(result.current.isNavigationMode).toBe(true);
    expect(result.current.verticalStagePosition).toBe(VerticalStagePosition.Top);
  });

  it('handleToggleNavigationMode stores viewport before enabling navigation', () => {
    const graphHandle = makeGraphHandle();
    const mockViewport = { x: 50, y: 100, zoom: 1.2 };
    graphHandle.getViewport.mockReturnValue(mockViewport);
    const params = makeParams({
      defaultNavigationMode: false,
      graphRef: { current: graphHandle } as unknown as UseStageNavigationParams['graphRef'],
    });
    const { result } = renderHook(() => useStageNavigation(params));

    act(() => {
      result.current.handleToggleNavigationMode(); // enable nav mode — stores viewport
    });
    act(() => {
      result.current.handleToggleNavigationMode(); // disable nav mode — should restore viewport
    });

    expect(graphHandle.setViewport).toHaveBeenCalledWith(mockViewport);
    expect(result.current.isNavigationMode).toBe(false);
  });

  it('handleToggleNavigationMode calls fitView when disabling with no stored viewport', () => {
    const graphHandle = makeGraphHandle();
    // Simulate no stored previous viewport: toggle on from defaultNavigationMode=true
    // means we never stored a viewport via toggle-on path.
    const params = makeParams({
      defaultNavigationMode: true,
      graphRef: { current: graphHandle } as unknown as UseStageNavigationParams['graphRef'],
    });
    const { result } = renderHook(() => useStageNavigation(params));

    act(() => {
      result.current.handleToggleNavigationMode(); // disable (was already on, no stored viewport)
    });

    expect(graphHandle.fitView).toHaveBeenCalledTimes(1);
    expect(result.current.isNavigationMode).toBe(false);
  });

  it('handleNextStage increments activeStageIndex up to stageViews.length - 1', () => {
    const stageViews = [makeStageView(0, 'QF'), makeStageView(1, 'SF'), makeStageView(2, 'F')];
    const { result } = renderHook(() => useStageNavigation(makeParams({ stageViews })));

    act(() => result.current.handleNextStage());
    expect(result.current.activeStageIndex).toBe(1);

    act(() => result.current.handleNextStage());
    expect(result.current.activeStageIndex).toBe(2);

    act(() => result.current.handleNextStage());
    expect(result.current.activeStageIndex).toBe(2); // clamped at max
  });

  it('handleNextStage resets verticalStagePosition to Top', () => {
    const stageViews = [makeStageView(0, 'QF'), makeStageView(1, 'SF')];
    const { result } = renderHook(() => useStageNavigation(makeParams({ stageViews })));

    act(() => result.current.handlePagePlayersDown());
    expect(result.current.verticalStagePosition).toBe(VerticalStagePosition.Bottom);

    act(() => result.current.handleNextStage());
    expect(result.current.verticalStagePosition).toBe(VerticalStagePosition.Top);
  });

  it('handlePreviousStage decrements activeStageIndex down to 0', () => {
    const stageViews = [makeStageView(0, 'QF'), makeStageView(1, 'SF')];
    const { result } = renderHook(() => useStageNavigation(makeParams({ stageViews })));

    act(() => result.current.handleNextStage());
    expect(result.current.activeStageIndex).toBe(1);

    act(() => result.current.handlePreviousStage());
    expect(result.current.activeStageIndex).toBe(0);

    act(() => result.current.handlePreviousStage());
    expect(result.current.activeStageIndex).toBe(0); // clamped at 0
  });

  it('handlePreviousStage resets verticalStagePosition to Top', () => {
    const stageViews = [makeStageView(0, 'QF'), makeStageView(1, 'SF')];
    const { result } = renderHook(() => useStageNavigation(makeParams({ stageViews })));

    act(() => result.current.handleNextStage());
    act(() => result.current.handlePagePlayersDown());
    expect(result.current.verticalStagePosition).toBe(VerticalStagePosition.Bottom);

    act(() => result.current.handlePreviousStage());
    expect(result.current.verticalStagePosition).toBe(VerticalStagePosition.Top);
  });

  it('handlePagePlayersDown sets verticalStagePosition to Bottom', () => {
    const { result } = renderHook(() => useStageNavigation(makeParams()));

    act(() => result.current.handlePagePlayersDown());
    expect(result.current.verticalStagePosition).toBe(VerticalStagePosition.Bottom);
  });

  it('handlePagePlayersUp sets verticalStagePosition to Top', () => {
    const { result } = renderHook(() => useStageNavigation(makeParams()));

    act(() => result.current.handlePagePlayersDown());
    act(() => result.current.handlePagePlayersUp());
    expect(result.current.verticalStagePosition).toBe(VerticalStagePosition.Top);
  });

  it('handleStagesChange calls setStageViews', () => {
    const setStageViews = vi.fn();
    const params = makeParams({ setStageViews });
    const { result } = renderHook(() => useStageNavigation(params));

    const newStages = [makeStageView(0, 'QF')];
    act(() => result.current.handleStagesChange(newStages));

    expect(setStageViews).toHaveBeenCalledTimes(1);
  });

  it('handleStagesChange updater returns prevStages when stages are identical', () => {
    const setStageViews = vi.fn();
    const stage = makeStageView(0, 'QF');
    const params = makeParams({ setStageViews, stageViews: [stage] });
    const { result } = renderHook(() => useStageNavigation(params));

    act(() => result.current.handleStagesChange([{ ...stage }]));

    const updater = (
      setStageViews.mock.calls[0] as [(prev: readonly StageView[]) => readonly StageView[]]
    )[0];
    const prevArray = [stage];
    const returned = updater(prevArray);
    expect(returned).toBe(prevArray);
  });

  it('handleStagesChange updater returns nextStages when stages differ', () => {
    const setStageViews = vi.fn();
    const stage = makeStageView(0, 'QF');
    const params = makeParams({ setStageViews, stageViews: [stage] });
    const { result } = renderHook(() => useStageNavigation(params));

    const differentStage = makeStageView(0, 'Different');
    act(() => result.current.handleStagesChange([differentStage]));

    const updater = (
      setStageViews.mock.calls[0] as [(prev: readonly StageView[]) => readonly StageView[]]
    )[0];
    const returned = updater([stage]);
    expect(returned).toEqual([differentStage]);
  });

  it('handleStagesChange updater returns nextStages when length differs', () => {
    const setStageViews = vi.fn();
    const stage = makeStageView(0, 'QF');
    const params = makeParams({ setStageViews, stageViews: [stage] });
    const { result } = renderHook(() => useStageNavigation(params));

    const nextStages = [makeStageView(0, 'QF'), makeStageView(1, 'SF')];
    act(() => result.current.handleStagesChange(nextStages));

    const updater = (
      setStageViews.mock.calls[0] as [(prev: readonly StageView[]) => readonly StageView[]]
    )[0];
    const returned = updater([stage]);
    expect(returned).toBe(nextStages);
  });

  it('focusStage calls graphRef.current.setViewport when navigation mode is on', () => {
    const graphHandle = makeGraphHandle();
    const stageViews = [makeStageView(0, 'QF'), makeStageView(1, 'SF')];
    const params = makeParams({
      defaultNavigationMode: true,
      graphRef: { current: graphHandle } as unknown as UseStageNavigationParams['graphRef'],
      stageViews,
    });

    renderHook(() => useStageNavigation(params));

    // focusStage is called via the effect on mount when in navigation mode
    expect(graphHandle.setViewport).toHaveBeenCalled();
  });

  it('window resize triggers focusStage when navigation mode is on', () => {
    const graphHandle = makeGraphHandle();
    const stageViews = [makeStageView(0, 'QF')];
    const params = makeParams({
      defaultNavigationMode: true,
      graphRef: { current: graphHandle } as unknown as UseStageNavigationParams['graphRef'],
      stageViews,
    });

    renderHook(() => useStageNavigation(params));
    const callsAfterMount = graphHandle.setViewport.mock.calls.length;

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(graphHandle.setViewport.mock.calls.length).toBeGreaterThan(callsAfterMount);
  });

  it('activeStageIndex is clamped when stageViews shrinks via rerender', () => {
    const stageViews = [makeStageView(0, 'QF'), makeStageView(1, 'SF'), makeStageView(2, 'F')];
    const params = makeParams({ stageViews });
    const { result, rerender } = renderHook(
      (props: UseStageNavigationParams) => useStageNavigation(props),
      { initialProps: params }
    );

    act(() => result.current.handleNextStage());
    act(() => result.current.handleNextStage());
    expect(result.current.activeStageIndex).toBe(2);

    // Shrink stageViews to 1 item
    rerender({ ...params, stageViews: [makeStageView(0, 'QF')] });

    expect(result.current.activeStageIndex).toBe(0);
  });
});
