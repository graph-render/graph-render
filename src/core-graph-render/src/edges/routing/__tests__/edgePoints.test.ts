import { NodeSide, RoutingStyle } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { calculateEdgePoints } from '../edgePoints';

const makeNode = (id: string, x: number, y: number) => ({
  id,
  position: { x, y },
});

const size = { width: 100, height: 50 };

describe('calculateEdgePoints', () => {
  it('routes smart curved edges with parallel offset applied', () => {
    const source = makeNode('a', 0, 0);
    const target = makeNode('b', 300, 80);
    const points = calculateEdgePoints(
      source,
      target,
      size,
      size,
      NodeSide.Right,
      NodeSide.Left,
      false,
      8,
      false,
      RoutingStyle.Smart,
      12
    );

    expect(points.length).toBeGreaterThanOrEqual(2);
    expect(points[0]!.x).not.toBe(points[1]!.x);
  });

  it('routes straight smart edges without parallel offset when offset is near zero', () => {
    const source = makeNode('a', 0, 0);
    const target = makeNode('b', 250, 0);
    const withOffset = calculateEdgePoints(
      source,
      target,
      size,
      size,
      NodeSide.Right,
      NodeSide.Left,
      false,
      6,
      true,
      RoutingStyle.Smart,
      0
    );
    const baseline = calculateEdgePoints(
      source,
      target,
      size,
      size,
      NodeSide.Right,
      NodeSide.Left,
      false,
      6,
      true,
      RoutingStyle.Smart,
      0.005
    );

    expect(withOffset).toEqual(baseline);
  });

  it('uses orthogonal routing for bundled style', () => {
    const source = makeNode('a', 0, 0);
    const target = makeNode('b', 280, 40);
    const points = calculateEdgePoints(
      source,
      target,
      size,
      size,
      NodeSide.Right,
      NodeSide.Left,
      false,
      6,
      false,
      RoutingStyle.Bundled,
      4
    );

    expect(points.length).toBeGreaterThanOrEqual(4);
  });

  it('omits arrow padding for undirected edges', () => {
    const source = makeNode('a', 0, 0);
    const target = makeNode('b', 200, 0);
    const directed = calculateEdgePoints(
      source,
      target,
      size,
      size,
      NodeSide.Right,
      NodeSide.Left,
      false,
      20,
      true,
      RoutingStyle.Smart,
      0
    );
    const undirected = calculateEdgePoints(
      source,
      target,
      size,
      size,
      NodeSide.Right,
      NodeSide.Left,
      true,
      20,
      true,
      RoutingStyle.Smart,
      0
    );

    expect(directed.at(-1)).toBeDefined();
    expect(undirected.at(-1)).toBeDefined();
    expect(directed.at(-1)!.x).not.toEqual(undirected.at(-1)!.x);
  });
});
