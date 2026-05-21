import { describe, expect, it } from 'vitest';

import type { PointerState } from '../../../models/domain';
import { getTwoActivePointers } from '../pointerGestureUtils';

describe('getTwoActivePointers', () => {
  it('returns null when fewer than two pointers are tracked', () => {
    const pointers = new Map<number, PointerState>([[1, { x: 0, y: 0 }]]);
    expect(getTwoActivePointers(pointers)).toBeNull();
  });

  it('returns the first two pointer states when at least two exist', () => {
    const first = { x: 0, y: 0 };
    const second = { x: 10, y: 20 };
    const pointers = new Map<number, PointerState>([
      [1, first],
      [2, second],
      [3, { x: 99, y: 99 }],
    ]);

    expect(getTwoActivePointers(pointers)).toEqual([first, second]);
  });
});
