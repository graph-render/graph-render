import { EdgeType, GraphInputValidationMode } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { processNodeEdges } from '../utils/graphParser/edges';
import { buildNodeMap } from '../utils/graphParser/nodes';
import { sanitizeEdgePoints } from '../utils/graphParser/sanitizers';
import { forceDirectedLayout } from '../layouts/forceDirected';

// ---------------------------------------------------------------------------
// createEdgeData (tested indirectly – not exported)
// Verifies that user-supplied ...rest attributes cannot override the canonical
// `source` and `target` fields that processNodeEdges passes to createEdgeData.
// ---------------------------------------------------------------------------

describe('createEdgeData (via processNodeEdges)', () => {
  it('canonical source wins over a spoofed source in attrs', () => {
    const edges = processNodeEdges(
      'real-source',
      // Cast past the type guard: NxEdgeAttrs omits source/target intentionally,
      // but we need to verify the runtime invariant still holds.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { 'real-target': { id: 'e1', source: 'spoofed-source' } as any },
      EdgeType.Directed,
      GraphInputValidationMode.Implicit,
      new Map(),
      new Set(),
      new Set(),
    );

    expect(edges).toHaveLength(1);
    expect(edges[0]!.source).toBe('real-source');
  });

  it('canonical target wins over a spoofed target in attrs', () => {
    const edges = processNodeEdges(
      'real-source',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { 'real-target': { id: 'e1', target: 'spoofed-target' } as any },
      EdgeType.Directed,
      GraphInputValidationMode.Implicit,
      new Map(),
      new Set(),
      new Set(),
    );

    expect(edges).toHaveLength(1);
    expect(edges[0]!.target).toBe('real-target');
  });
});

// ---------------------------------------------------------------------------
// buildNodeMap
// ---------------------------------------------------------------------------

describe('buildNodeMap', () => {
  it('throws TypeError with "Duplicate node id" when two raw IDs produce the same sanitized ID', () => {
    // sanitizeNodeId trims whitespace, so ' a' and 'a' both become 'a'.
    expect(() =>
      buildNodeMap({
        adj: {},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodes: { a: {} as any, ' a': {} as any },
      }),
    ).toThrow(TypeError);

    expect(() =>
      buildNodeMap({
        adj: {},
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodes: { a: {} as any, ' a': {} as any },
      }),
    ).toThrow('Duplicate node id');
  });
});

// ---------------------------------------------------------------------------
// sanitizeEdgePoints
// ---------------------------------------------------------------------------

describe('sanitizeEdgePoints', () => {
  it('returns valid points array unchanged', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ];
    expect(sanitizeEdgePoints(points)).toEqual(points);
  });

  it('returns undefined (not a partial array) when any point has a NaN coordinate', () => {
    expect(
      sanitizeEdgePoints([
        { x: 1, y: 2 },
        { x: NaN, y: 4 },
      ]),
    ).toBeUndefined();
  });

  it('returns undefined when any point has an Infinite coordinate', () => {
    expect(
      sanitizeEdgePoints([
        { x: Infinity, y: 2 },
        { x: 3, y: 4 },
      ]),
    ).toBeUndefined();

    expect(
      sanitizeEdgePoints([
        { x: 1, y: -Infinity },
        { x: 3, y: 4 },
      ]),
    ).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// clampPoint (tested indirectly via forceDirectedLayout)
// clampPoint is not exported; forceDirectedLayout applies it every iteration.
// Using a small 200×200 viewport with pad=0 forces the initial position
// (which overshoots the allowed x range) to be clamped back inside bounds.
// ---------------------------------------------------------------------------

describe('forceDirectedLayout – clamping via clampPoint', () => {
  const PAD = 0;
  const WIDTH = 200;
  const HEIGHT = 200;
  const DEFAULT_NODE_WIDTH = 180;
  const DEFAULT_NODE_HEIGHT = 72;

  it('keeps a single node fully within the padded viewport after layout', () => {
    const result = forceDirectedLayout([{ id: 'n1' }], [], PAD, WIDTH, HEIGHT);

    expect(result).toHaveLength(1);
    const node = result[0]!;

    // position is the top-left corner of the node rectangle.
    expect(node.position.x).toBeGreaterThanOrEqual(PAD);
    expect(node.position.y).toBeGreaterThanOrEqual(PAD);
    expect(node.position.x + DEFAULT_NODE_WIDTH).toBeLessThanOrEqual(WIDTH - PAD);
    expect(node.position.y + DEFAULT_NODE_HEIGHT).toBeLessThanOrEqual(HEIGHT - PAD);
  });
});
