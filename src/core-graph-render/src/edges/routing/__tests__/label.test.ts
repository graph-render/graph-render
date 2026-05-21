import { describe, expect, it } from 'vitest';

import { calculateLabelPosition } from '../label';

describe('calculateLabelPosition', () => {
  it('returns undefined for fewer than 2 points', () => {
    expect(calculateLabelPosition([])).toBeUndefined();
    expect(calculateLabelPosition([{ x: 0, y: 0 }])).toBeUndefined();
  });

  it('returns the midpoint of a two-point horizontal segment', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ];
    const result = calculateLabelPosition(points);
    expect(result).toEqual({ x: 50, y: 0 });
  });

  it('returns the midpoint of a two-point vertical segment', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 200 },
    ];
    const result = calculateLabelPosition(points);
    expect(result).toEqual({ x: 0, y: 100 });
  });

  it('returns a point along a diagonal segment', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ];
    const result = calculateLabelPosition(points);
    // Midpoint of a 45-degree segment
    expect(result?.x).toBeCloseTo(50, 1);
    expect(result?.y).toBeCloseTo(50, 1);
  });

  it('returns the halfway point of a polyline', () => {
    // Two equal-length segments: (0,0)→(50,0)→(100,0); midpoint is (50,0)
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 100, y: 0 },
    ];
    const result = calculateLabelPosition(points);
    expect(result?.x).toBeCloseTo(50, 1);
    expect(result?.y).toBeCloseTo(0, 1);
  });

  it('handles a zero-length leading segment before the halfway point', () => {
    const points = [
      { x: 10, y: 10 },
      { x: 10, y: 10 },
      { x: 100, y: 10 },
    ];
    const result = calculateLabelPosition(points);
    expect(result).toEqual({ x: 55, y: 10 });
  });

  it('returns a defined result for a multi-point path', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 40, y: 0 },
      { x: 60, y: 100 },
      { x: 90, y: 100 },
      { x: 100, y: 100 },
    ];
    const result = calculateLabelPosition(points);
    expect(result).toBeDefined();
    expect(Number.isFinite(result!.x)).toBe(true);
    expect(Number.isFinite(result!.y)).toBe(true);
  });
});
