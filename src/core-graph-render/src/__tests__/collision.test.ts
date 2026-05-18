import { describe, expect, it } from 'vitest';

import { segmentIntersectsRect } from '../edges/collision';

const rect = { x: 10, y: 10, w: 20, h: 20 }; // [10,10] – [30,30]

describe('segmentIntersectsRect', () => {
  it('returns false when segment is entirely to the left', () => {
    expect(segmentIntersectsRect({ x: 0, y: 15 }, { x: 5, y: 15 }, rect)).toBe(false);
  });

  it('returns false when segment is entirely to the right', () => {
    expect(segmentIntersectsRect({ x: 35, y: 15 }, { x: 40, y: 15 }, rect)).toBe(false);
  });

  it('returns false when segment is entirely above', () => {
    expect(segmentIntersectsRect({ x: 15, y: 0 }, { x: 15, y: 5 }, rect)).toBe(false);
  });

  it('returns false when segment is entirely below', () => {
    expect(segmentIntersectsRect({ x: 15, y: 35 }, { x: 15, y: 40 }, rect)).toBe(false);
  });

  it('returns true when segment passes through the rect horizontally', () => {
    expect(segmentIntersectsRect({ x: 0, y: 20 }, { x: 40, y: 20 }, rect)).toBe(true);
  });

  it('returns true when segment passes through the rect vertically', () => {
    expect(segmentIntersectsRect({ x: 20, y: 0 }, { x: 20, y: 40 }, rect)).toBe(true);
  });

  it('returns true when segment starts inside the rect', () => {
    expect(segmentIntersectsRect({ x: 15, y: 15 }, { x: 50, y: 50 }, rect)).toBe(true);
  });

  it('returns true when segment ends inside the rect', () => {
    expect(segmentIntersectsRect({ x: 0, y: 0 }, { x: 20, y: 20 }, rect)).toBe(true);
  });

  it('returns true when both endpoints are inside the rect', () => {
    expect(segmentIntersectsRect({ x: 12, y: 12 }, { x: 18, y: 18 }, rect)).toBe(true);
  });

  it('returns false when diagonal segment misses the rect entirely', () => {
    expect(segmentIntersectsRect({ x: 0, y: 0 }, { x: 5, y: 100 }, rect)).toBe(false);
  });

  it('returns true when segment crosses a rect corner', () => {
    // Segment from (5,5) to (15,5) — y=5 is above the rect, should miss
    expect(segmentIntersectsRect({ x: 5, y: 5 }, { x: 15, y: 5 }, rect)).toBe(false);
    // Segment from (0, 30) to (40, 10) crosses the rect
    expect(segmentIntersectsRect({ x: 0, y: 30 }, { x: 40, y: 10 }, rect)).toBe(true);
  });
});
