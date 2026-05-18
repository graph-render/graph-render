import { LayoutDirection, NodeSide } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import {
  applyDirectionalPreference,
  sortSidesByDistance,
} from '../edges/sideSelection';

const node = { id: 'n1', position: { x: 0, y: 0 } };
const size = { width: 100, height: 60 };
// Side centres: Left=(0,30), Right=(100,30), Top=(50,0), Bottom=(50,60)

describe('sortSidesByDistance', () => {
  it('puts Right first when target is far to the right', () => {
    const sorted = sortSidesByDistance(node, size, { x: 1000, y: 30 });
    expect(sorted[0]).toBe(NodeSide.Right);
  });

  it('puts Left first when target is far to the left', () => {
    const sorted = sortSidesByDistance(node, size, { x: -1000, y: 30 });
    expect(sorted[0]).toBe(NodeSide.Left);
  });

  it('puts Top first when target is directly above', () => {
    const sorted = sortSidesByDistance(node, size, { x: 50, y: -1000 });
    expect(sorted[0]).toBe(NodeSide.Top);
  });

  it('puts Bottom first when target is directly below', () => {
    const sorted = sortSidesByDistance(node, size, { x: 50, y: 1000 });
    expect(sorted[0]).toBe(NodeSide.Bottom);
  });

  it('returns all four sides', () => {
    const sorted = sortSidesByDistance(node, size, { x: 50, y: 30 });
    expect(sorted).toHaveLength(4);
    expect(new Set(sorted).size).toBe(4);
  });
});

describe('applyDirectionalPreference', () => {
  const allSides = [NodeSide.Left, NodeSide.Top, NodeSide.Bottom, NodeSide.Right];

  it('returns sides unchanged when undirected', () => {
    const result = applyDirectionalPreference(allSides, false);
    expect(result).toEqual(allSides);
  });

  it('puts Right first for directed LTR', () => {
    const result = applyDirectionalPreference(allSides, true, LayoutDirection.LTR);
    expect(result[0]).toBe(NodeSide.Right);
  });

  it('puts Left first for directed RTL', () => {
    const result = applyDirectionalPreference(allSides, true, LayoutDirection.RTL);
    expect(result[0]).toBe(NodeSide.Left);
  });

  it('defaults to LTR preference when no direction supplied and directed', () => {
    const result = applyDirectionalPreference(allSides, true);
    expect(result[0]).toBe(NodeSide.Right);
  });
});
