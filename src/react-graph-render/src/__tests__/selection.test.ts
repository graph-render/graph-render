import { SelectionMode } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { getMarqueeSelection, isPointInsideRect, normalizeRect, toggleId } from '../utils/selection';

// ── toggleId ─────────────────────────────────────────────────────────────────
describe('toggleId — Single mode', () => {
  it('selects an id when list is empty', () => {
    expect(toggleId([], 'a', SelectionMode.Single)).toEqual(['a']);
  });

  it('deselects the id when it is the only element', () => {
    expect(toggleId(['a'], 'a', SelectionMode.Single)).toEqual([]);
  });

  it('replaces a different id with the new one', () => {
    expect(toggleId(['b'], 'a', SelectionMode.Single)).toEqual(['a']);
  });
});

describe('toggleId — Multi mode', () => {
  it('adds an id that is not present', () => {
    expect(toggleId(['a'], 'b', SelectionMode.Multiple)).toContain('b');
  });

  it('removes an id that is already present', () => {
    expect(toggleId(['a', 'b'], 'a', SelectionMode.Multiple)).not.toContain('a');
  });

  it('keeps other ids when removing one', () => {
    const result = toggleId(['a', 'b', 'c'], 'b', SelectionMode.Multiple);
    expect(result).toContain('a');
    expect(result).toContain('c');
    expect(result).not.toContain('b');
  });
});

// ── normalizeRect ─────────────────────────────────────────────────────────────
describe('normalizeRect', () => {
  it('returns positive width/height regardless of drag direction', () => {
    const rect = normalizeRect({ startX: 50, startY: 50, endX: 10, endY: 20 });
    expect(rect.width).toBe(40);
    expect(rect.height).toBe(30);
  });

  it('normalises a forward-drag selection box', () => {
    const rect = normalizeRect({ startX: 10, startY: 20, endX: 50, endY: 60 });
    expect(rect).toEqual({ x: 10, y: 20, width: 40, height: 40 });
  });

  it('handles zero-size box', () => {
    const rect = normalizeRect({ startX: 5, startY: 5, endX: 5, endY: 5 });
    expect(rect.width).toBe(0);
    expect(rect.height).toBe(0);
  });
});

// ── isPointInsideRect ─────────────────────────────────────────────────────────
describe('isPointInsideRect', () => {
  const rect = { x: 10, y: 10, width: 20, height: 20 }; // [10,10] – [30,30]

  it('returns true for a point inside', () => {
    expect(isPointInsideRect(20, 20, rect)).toBe(true);
  });

  it('returns true on the boundary', () => {
    expect(isPointInsideRect(10, 10, rect)).toBe(true);
    expect(isPointInsideRect(30, 30, rect)).toBe(true);
  });

  it('returns false for a point outside', () => {
    expect(isPointInsideRect(5, 20, rect)).toBe(false);
    expect(isPointInsideRect(20, 5, rect)).toBe(false);
    expect(isPointInsideRect(35, 20, rect)).toBe(false);
    expect(isPointInsideRect(20, 35, rect)).toBe(false);
  });
});

// ── getMarqueeSelection ────────────────────────────────────────────────────────
describe('getMarqueeSelection', () => {
  const viewport = { x: 0, y: 0, zoom: 1 };

  const nodes = [
    { id: 'n1', position: { x: 5, y: 5 }, size: { width: 10, height: 10 } },
    { id: 'n2', position: { x: 50, y: 50 }, size: { width: 10, height: 10 } },
  ] as any[];

  const edges = [
    { id: 'e1', source: 'n1', target: 'n2', points: [{ x: 10, y: 10 }, { x: 15, y: 15 }] },
  ] as any[];

  it('selects nodes overlapping with the marquee rect', () => {
    const box = { startX: 0, startY: 0, endX: 20, endY: 20 };
    const result = getMarqueeSelection(box, viewport, nodes, edges);
    expect(result.nodeIds).toContain('n1');
    expect(result.nodeIds).not.toContain('n2');
  });

  it('selects edges whose points fall inside the rect', () => {
    const box = { startX: 0, startY: 0, endX: 20, endY: 20 };
    const result = getMarqueeSelection(box, viewport, nodes, edges);
    expect(result.edgeIds).toContain('e1');
  });

  it('selects nothing when marquee is far from all elements', () => {
    const box = { startX: 200, startY: 200, endX: 300, endY: 300 };
    const result = getMarqueeSelection(box, viewport, nodes, edges);
    expect(result.nodeIds).toHaveLength(0);
    expect(result.edgeIds).toHaveLength(0);
  });

  it('accounts for viewport zoom', () => {
    const zoomedViewport = { x: 0, y: 0, zoom: 2 };
    // At zoom 2 the marquee [0,0]–[20,20] maps to world [0,0]–[10,10]
    const box = { startX: 0, startY: 0, endX: 20, endY: 20 };
    const result = getMarqueeSelection(box, zoomedViewport, nodes, edges);
    expect(result.nodeIds).toContain('n1');
  });
});
