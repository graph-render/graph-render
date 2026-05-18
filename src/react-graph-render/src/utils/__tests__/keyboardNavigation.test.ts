import { describe, expect, it } from 'vitest';

import { KeyboardDirection } from '../../models/utils';
import { getNearestNodeInDirection } from '../keyboardNavigation';

const makeNode = (id: string, x: number, y: number, width = 100, height = 72) =>
  ({ id, position: { x, y }, size: { width, height } }) as any;

// Center of 'current': x=100, y=100 (node at x=50,y=64, size 100×72 → center=100,100)
const current = makeNode('current', 50, 64, 100, 72);

describe('getNearestNodeInDirection', () => {
  it('returns null when no other nodes exist', () => {
    expect(getNearestNodeInDirection(current, [current], KeyboardDirection.Right)).toBeNull();
  });

  it('returns null when no node is in the requested direction', () => {
    // node to the right; ask for left
    const right = makeNode('right', 400, 64);
    expect(getNearestNodeInDirection(current, [current, right], KeyboardDirection.Left)).toBeNull();
  });

  it('returns the nearest node to the right', () => {
    const near = makeNode('near', 250, 64); // centerX = 300 > 100
    const far = makeNode('far', 600, 64); // centerX = 650 > 100
    const result = getNearestNodeInDirection(
      current,
      [current, near, far],
      KeyboardDirection.Right
    );
    expect(result?.id).toBe('near');
  });

  it('returns the nearest node to the left', () => {
    const near = makeNode('near', -150, 64); // centerX = -100 < 100
    const far = makeNode('far', -500, 64);
    const result = getNearestNodeInDirection(current, [current, near, far], KeyboardDirection.Left);
    expect(result?.id).toBe('near');
  });

  it('returns the nearest node above', () => {
    const above = makeNode('above', 50, -100); // centerY = -64 < 100
    const result = getNearestNodeInDirection(current, [current, above], KeyboardDirection.Up);
    expect(result?.id).toBe('above');
  });

  it('returns the nearest node below', () => {
    const below = makeNode('below', 50, 300); // centerY = 336 > 100
    const result = getNearestNodeInDirection(current, [current, below], KeyboardDirection.Down);
    expect(result?.id).toBe('below');
  });

  it('excludes the current node from candidates', () => {
    // Only the current node in the list
    const result = getNearestNodeInDirection(current, [current], KeyboardDirection.Right);
    expect(result).toBeNull();
  });

  it('picks closest by Euclidean distance, not just axis distance', () => {
    // Both are to the right, but one is much farther diagonally
    const close = makeNode('close', 250, 64); // rightward, same row
    const diagonal = makeNode('diagonal', 260, 400); // rightward but far vertically
    const result = getNearestNodeInDirection(
      current,
      [current, close, diagonal],
      KeyboardDirection.Right
    );
    expect(result?.id).toBe('close');
  });
});
