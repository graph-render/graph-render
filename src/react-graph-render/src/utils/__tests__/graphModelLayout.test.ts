import {
  buildFallbackLayout,
  layoutNodes,
  toError,
  validatePositionedNodes,
} from '@graph-render/core';
import { GraphErrorPhase } from '@graph-render/types/react';
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
    expect(result.nodes).toBe(nodes);
    expect(result.errors).toEqual([]);
  });

  it('returns a Layout phase error when layoutNodes throws in degraded mode', () => {
    const error = new Error('layout fail');
    vi.mocked(layoutNodes).mockImplementation(() => {
      throw error;
    });
    vi.mocked(toError).mockReturnValue(error);
    vi.mocked(buildFallbackLayout).mockReturnValue([]);
    vi.mocked(validatePositionedNodes).mockReturnValue(undefined);

    const result = resolvePositionedNodes({ ...baseOptions, allowDegradedGraph: true });
    expect(result.errors).toEqual([
      {
        context: {
          graph: baseOptions.graph,
          phase: GraphErrorPhase.Layout,
        },
        error,
      },
    ]);
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
    expect(result.nodes).toBe(overrideNodes);
    expect(result.errors).toEqual([]);
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
    const result = resolvePositionedNodes({
      ...baseOptions,
      allowDegradedGraph: true,
      layoutNodesOverride,
    });
    expect(result.errors).toEqual([
      expect.objectContaining({
        context: expect.objectContaining({ phase: GraphErrorPhase.LayoutOverride }),
        error: expect.any(Error),
      }),
    ]);
    expect(result.nodes).toBe(fallback);
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
    expect(result.nodes).toBe(fallbackNodes);
  });
});
