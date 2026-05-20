import {
  buildFallbackEdges,
  routeEdges,
  toError,
  validatePositionedEdges,
} from '@graph-render/core';
import { GraphErrorPhase } from '@graph-render/types/react';
import { describe, expect, it, vi } from 'vitest';

import { resolvePositionedEdges } from '../graphModelRouting';

vi.mock('@graph-render/core', () => ({
  routeEdges: vi.fn(),
  validatePositionedEdges: vi.fn(),
  buildFallbackEdges: vi.fn(),
  toError: vi.fn((e: unknown) => (e instanceof Error ? e : new Error(String(e)))),
}));

const makeGraph = () => ({ nodes: [], edges: [] }) as any;
const makeNode = (id: string) =>
  ({ id, position: { x: 0, y: 0 }, size: { width: 100, height: 50 } }) as any;
const makeEdge = (id: string, source: string, target: string) => ({ id, source, target }) as any;

describe('resolvePositionedEdges', () => {
  const baseOptions = {
    allowDegradedGraph: false,
    edgeRoutingOptions: {} as any,
    graph: makeGraph(),
    positionedNodes: [makeNode('n1'), makeNode('n2')],
    visibleEdges: [makeEdge('e1', 'n1', 'n2')],
  };

  it('returns routeEdges result when no override and no error', () => {
    const edges = [{ id: 'e1', source: 'n1', target: 'n2', points: [] }] as any[];
    vi.mocked(routeEdges).mockReturnValue(edges);
    vi.mocked(validatePositionedEdges).mockReturnValue(undefined);
    const result = resolvePositionedEdges(baseOptions);
    expect(result.edges).toBe(edges);
    expect(result.errors).toEqual([]);
  });

  it('throws when routeEdges fails and allowDegradedGraph is false', () => {
    vi.mocked(routeEdges).mockImplementation(() => {
      throw new Error('route fail');
    });
    vi.mocked(toError).mockImplementation((e) => (e instanceof Error ? e : new Error(String(e))));
    expect(() => resolvePositionedEdges(baseOptions)).toThrow();
  });

  it('returns a Routing phase error when routeEdges throws in degraded mode', () => {
    const error = new Error('route fail');
    vi.mocked(routeEdges).mockImplementation(() => {
      throw error;
    });
    vi.mocked(toError).mockReturnValue(error);
    vi.mocked(buildFallbackEdges).mockReturnValue([]);
    vi.mocked(validatePositionedEdges).mockReturnValue(undefined);
    const result = resolvePositionedEdges({ ...baseOptions, allowDegradedGraph: true });
    expect(result.errors).toEqual([
      {
        context: {
          graph: baseOptions.graph,
          phase: GraphErrorPhase.Routing,
        },
        error,
      },
    ]);
  });

  it('uses routeEdgesOverride when provided', () => {
    const overrideEdges = [{ id: 'e_override' }] as any[];
    const routeEdgesOverride = vi.fn().mockReturnValue(overrideEdges);
    vi.mocked(validatePositionedEdges).mockReturnValue(undefined);
    const result = resolvePositionedEdges({ ...baseOptions, routeEdgesOverride });
    expect(result.edges).toBe(overrideEdges);
    expect(result.errors).toEqual([]);
    expect(routeEdgesOverride).toHaveBeenCalled();
  });

  it('falls back to routeEdges when override throws and allowDegradedGraph is true', () => {
    const routeEdgesOverride = vi.fn().mockImplementation(() => {
      throw new Error('override fail');
    });
    const fallback = [{ id: 'e1_fb', points: [] }] as any[];
    vi.mocked(routeEdges).mockReturnValue(fallback);
    vi.mocked(validatePositionedEdges).mockReturnValue(undefined);
    vi.mocked(toError).mockImplementation((e) => (e instanceof Error ? e : new Error(String(e))));
    const result = resolvePositionedEdges({
      ...baseOptions,
      allowDegradedGraph: true,
      routeEdgesOverride,
    });
    expect(result.errors).toEqual([
      expect.objectContaining({
        context: expect.objectContaining({ phase: GraphErrorPhase.RoutingOverride }),
        error: expect.any(Error),
      }),
    ]);
    expect(result.edges).toBe(fallback);
  });

  it('calls buildFallbackEdges when routeEdges fails with degraded mode', () => {
    vi.mocked(routeEdges).mockImplementation(() => {
      throw new Error('fail');
    });
    const fallbackEdges = [{ id: 'fb', points: [] }] as any[];
    vi.mocked(buildFallbackEdges).mockReturnValue(fallbackEdges);
    vi.mocked(validatePositionedEdges).mockReturnValue(undefined);
    vi.mocked(toError).mockImplementation((e) => (e instanceof Error ? e : new Error(String(e))));
    const result = resolvePositionedEdges({ ...baseOptions, allowDegradedGraph: true });
    expect(buildFallbackEdges).toHaveBeenCalled();
    expect(result.edges).toBe(fallbackEdges);
  });
});
