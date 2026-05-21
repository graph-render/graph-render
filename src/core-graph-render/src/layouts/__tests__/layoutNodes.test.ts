import { EdgeType, LayoutDirection, LayoutType } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { layoutNodes } from '../index';

const makeNode = (id: string, position?: { x: number; y: number }) => ({
  id,
  ...(position ? { position } : {}),
});

const makeEdge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
  type: EdgeType.Directed,
});

const baseOptions = {
  nodes: [makeNode('a'), makeNode('b')],
  edges: [makeEdge('e1', 'a', 'b')],
  width: 800,
  height: 600,
};

describe('layoutNodes', () => {
  it('returns nodes unchanged when every node already has a position', () => {
    const nodes = [makeNode('a', { x: 10, y: 20 }), makeNode('b', { x: 100, y: 200 })];
    const result = layoutNodes({ ...baseOptions, nodes, layout: LayoutType.Grid });
    expect(result).toHaveLength(2);
    expect(result[0]!.position).toEqual({ x: 10, y: 20 });
    expect(result[1]!.position).toEqual({ x: 100, y: 200 });
  });

  it.each([
    LayoutType.Grid,
    LayoutType.Tree,
    LayoutType.Radial,
    LayoutType.Centered,
    LayoutType.Dag,
    LayoutType.ForceDirected,
    LayoutType.CompactBracket,
    LayoutType.OrthogonalFlow,
  ])('assigns positions for layout type %s', (layout) => {
    const result = layoutNodes({
      ...baseOptions,
      layout,
      layoutDirection: LayoutDirection.LTR,
    });
    expect(result).toHaveLength(2);
    for (const node of result) {
      expect(node.position).toBeDefined();
      expect(Number.isFinite(node.position!.x)).toBe(true);
      expect(Number.isFinite(node.position!.y)).toBe(true);
    }
  });

  it('anchors auto-layout to partially fixed nodes', () => {
    const nodes = [makeNode('a', { x: 50, y: 60 }), makeNode('b')];
    const result = layoutNodes({ ...baseOptions, nodes, layout: LayoutType.Grid });
    expect(result).toHaveLength(2);
    expect(result[0]!.position).toEqual({ x: 50, y: 60 });
    expect(result[1]!.position).toBeDefined();
  });
});
