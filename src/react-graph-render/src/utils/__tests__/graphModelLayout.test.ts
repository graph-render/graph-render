import {
  buildFallbackLayout,
  layoutNodes,
  toError,
  validatePositionedNodes,
} from '@graph-render/core';
import { GraphErrorPhase } from '@graph-render/types';
import { describe, expect, it, vi } from 'vitest';

import { resolvePositionedNodes } from '../graphModelLayout';

vi.mock('@graph-render/core', () => ({
  layoutNodes: vi.fn(),
  validatePositionedNodes: vi.fn(),
  buildFallbackLayout: vi.fn(),
  toError: vi.fn((e: unknown) => (e instanceof Error ? e : new Error(String(e)))),
}));

const makeGraph = () => ({ nodes: [], edges: [] }) as any;
const makeLayoutOptions = () => ({}) as any;
const makeNode = (id: string) =>
  ({ id, position: { x: 0, y: 0 }, size: { width: 100, height: 50 } }) as any;

describe('resolvePositionedNodes', () => {
  const baseOptions = {
    allowDegradedGraph: false,
    graph: makeGraph(),
    layoutOptions: makeLayoutOptions(),
    visibleNodes: [],
  };

  it('returns layoutNodes result when no override and no error', () => {
    const nodes = [makeNode('n1')];
    vi.mocked(layoutNodes).mockReturnValue(nodes);
    vi.mocked(validatePositionedNodes).mockReturnValue(undefined);
    const result = resolvePositionedNodes(baseOptions);
    expect(result).toBe(nodes);
  });

  it('calls onError with Layout phase when layoutNodes throws', () => {
    const error = new Error('layout fail');
    vi.mocked(layoutNodes).mockImplementation(() => {
      throw error;
    });
    vi.mocked(toError).mockReturnValue(error);
    vi.mocked(buildFallbackLayout).mockReturnValue([]);
    vi.mocked(validatePositionedNodes).mockReturnValue(undefined);

    const onError = vi.fn();
    resolvePositionedNodes({ ...baseOptions, allowDegradedGraph: true, onError });
    expect(onError).toHaveBeenCalledWith(error, {
      graph: baseOptions.graph,
      phase: GraphErrorPhase.Layout,
    });
  });

  it('throws when layoutNodes fails and allowDegradedGraph is false', () => {
    const error = new Error('layout fail');
    vi.mocked(layoutNodes).mockImplementation(() => {
      throw error;
    });
    vi.mocked(toError).mockReturnValue(error);
    expect(() => resolvePositionedNodes(baseOptions)).toThrow();
  });

  it('uses layoutNodesOverride when provided', () => {
    const overrideNodes = [makeNode('override')];
    const layoutNodesOverride = vi.fn().mockReturnValue(overrideNodes);
    vi.mocked(validatePositionedNodes).mockReturnValue(undefined);
    const result = resolvePositionedNodes({ ...baseOptions, layoutNodesOverride });
    expect(result).toBe(overrideNodes);
    expect(layoutNodesOverride).toHaveBeenCalledWith(baseOptions.layoutOptions);
  });

  it('falls back to layoutNodes when override throws and allowDegradedGraph is true', () => {
    const fallback = [makeNode('fallback')];
    vi.mocked(layoutNodes).mockReturnValue(fallback);
    vi.mocked(validatePositionedNodes).mockReturnValue(undefined);
    vi.mocked(toError).mockImplementation((e) => (e instanceof Error ? e : new Error(String(e))));

    const layoutNodesOverride = vi.fn().mockImplementation(() => {
      throw new Error('override fail');
    });
    const onError = vi.fn();
    const result = resolvePositionedNodes({
      ...baseOptions,
      allowDegradedGraph: true,
      layoutNodesOverride,
      onError,
    });
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ phase: GraphErrorPhase.LayoutOverride })
    );
    expect(result).toBe(fallback);
  });

  it('calls buildFallbackLayout when both layoutNodes and override fail', () => {
    const fallbackNodes = [makeNode('fbk')];
    vi.mocked(layoutNodes).mockImplementation(() => {
      throw new Error('fail');
    });
    vi.mocked(buildFallbackLayout).mockReturnValue(fallbackNodes);
    vi.mocked(validatePositionedNodes).mockReturnValue(undefined);
    vi.mocked(toError).mockImplementation((e) => (e instanceof Error ? e : new Error(String(e))));
    const result = resolvePositionedNodes({ ...baseOptions, allowDegradedGraph: true });
    expect(buildFallbackLayout).toHaveBeenCalled();
    expect(result).toBe(fallbackNodes);
  });
});
