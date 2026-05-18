import { NodeSide } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { getAnchorPoint, getNodeCenter, getSideCenter, getSideInwardNormal, getSideNormal } from '../edges/geometry';

const node = { id: 'n1', position: { x: 10, y: 20 } };
const size = { width: 80, height: 40 };

describe('getNodeCenter', () => {
  it('returns the centre of the node bounding box', () => {
    expect(getNodeCenter(node, size)).toEqual({ x: 50, y: 40 });
  });

  it('works for a zero-origin node', () => {
    const origin = { id: 'o', position: { x: 0, y: 0 } };
    expect(getNodeCenter(origin, { width: 100, height: 60 })).toEqual({ x: 50, y: 30 });
  });
});

describe('getSideCenter', () => {
  it('Left: x is node.position.x, y is vertical centre', () => {
    expect(getSideCenter(node, size, NodeSide.Left)).toEqual({ x: 10, y: 40 });
  });

  it('Right: x is position.x + width, y is vertical centre', () => {
    expect(getSideCenter(node, size, NodeSide.Right)).toEqual({ x: 90, y: 40 });
  });

  it('Top: x is horizontal centre, y is position.y', () => {
    expect(getSideCenter(node, size, NodeSide.Top)).toEqual({ x: 50, y: 20 });
  });

  it('Bottom: x is horizontal centre, y is position.y + height', () => {
    expect(getSideCenter(node, size, NodeSide.Bottom)).toEqual({ x: 50, y: 60 });
  });
});

describe('getAnchorPoint', () => {
  it('Left: x = position.x - inset, y = centre + offset', () => {
    expect(getAnchorPoint(node, size, NodeSide.Left, 5, 3)).toEqual({ x: 7, y: 45 });
  });

  it('Right: x = position.x + width + inset, y = centre + offset', () => {
    expect(getAnchorPoint(node, size, NodeSide.Right, -5, 3)).toEqual({ x: 93, y: 35 });
  });

  it('Top: x = centre + offset, y = position.y - inset', () => {
    expect(getAnchorPoint(node, size, NodeSide.Top, 10, 4)).toEqual({ x: 60, y: 16 });
  });

  it('Bottom: x = centre + offset, y = position.y + height + inset', () => {
    expect(getAnchorPoint(node, size, NodeSide.Bottom, 0, 2)).toEqual({ x: 50, y: 62 });
  });
});

describe('getSideNormal', () => {
  it('Left → (-1, 0)', () => expect(getSideNormal(NodeSide.Left)).toEqual({ x: -1, y: 0 }));
  it('Right → (1, 0)', () => expect(getSideNormal(NodeSide.Right)).toEqual({ x: 1, y: 0 }));
  it('Top → (0, -1)', () => expect(getSideNormal(NodeSide.Top)).toEqual({ x: 0, y: -1 }));
  it('Bottom → (0, 1)', () => expect(getSideNormal(NodeSide.Bottom)).toEqual({ x: 0, y: 1 }));
});

describe('getSideInwardNormal', () => {
  it('Left → (1, 0)', () => expect(getSideInwardNormal(NodeSide.Left)).toEqual({ x: 1, y: 0 }));
  it('Right → (-1, 0)', () => expect(getSideInwardNormal(NodeSide.Right)).toEqual({ x: -1, y: 0 }));
  it('Top → (0, 1)', () => expect(getSideInwardNormal(NodeSide.Top)).toEqual({ x: 0, y: 1 }));
  it('Bottom → (0, -1)', () => expect(getSideInwardNormal(NodeSide.Bottom)).toEqual({ x: 0, y: -1 }));
});
