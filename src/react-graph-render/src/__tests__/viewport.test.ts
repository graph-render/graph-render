import { describe, expect, it } from 'vitest';

import {
  centerViewportOnNode,
  clampViewportTranslation,
  clampZoom,
  getFitViewport,
  getGraphBounds,
  normalizeViewport,
} from '../utils/viewport';

// ── clampZoom ─────────────────────────────────────────────────────────────────
describe('clampZoom', () => {
  it('clamps to minZoom when value is too small', () => {
    expect(clampZoom(0.1, 0.5, 4)).toBe(0.5);
  });

  it('clamps to maxZoom when value is too large', () => {
    expect(clampZoom(10, 0.5, 4)).toBe(4);
  });

  it('returns value unchanged when within range', () => {
    expect(clampZoom(2, 0.5, 4)).toBe(2);
  });
});

// ── normalizeViewport ─────────────────────────────────────────────────────────
describe('normalizeViewport', () => {
  it('falls back to 0 for non-finite x/y', () => {
    const vp = normalizeViewport({ x: Number.NaN, y: Number.POSITIVE_INFINITY, zoom: 1 }, 0.5, 4);
    expect(vp.x).toBe(0);
    expect(vp.y).toBe(0);
  });

  it('clamps zoom within the provided bounds', () => {
    const vp = normalizeViewport({ x: 0, y: 0, zoom: 0.1 }, 0.5, 4);
    expect(vp.zoom).toBe(0.5);
  });

  it('falls back to zoom 1 when zoom is NaN after clamping', () => {
    // NaN treated as if zoom value; normalizeViewport uses isFinite, falls back to 1
    const vp = normalizeViewport({ x: 0, y: 0, zoom: Number.NaN }, 0.5, 4);
    // NaN is not finite, so falls back then clamps: clamp(1, 0.5, 4) = 1
    expect(vp.zoom).toBe(1);
  });

  it('preserves valid values', () => {
    const vp = normalizeViewport({ x: 10, y: 20, zoom: 2 }, 0.5, 4);
    expect(vp).toEqual({ x: 10, y: 20, zoom: 2 });
  });
});

// ── clampViewportTranslation ──────────────────────────────────────────────────
describe('clampViewportTranslation', () => {
  const extent = [
    [0, 0],
    [1000, 800],
  ] as const;

  it('centres content when it fits in the container', () => {
    // World 1000×800 at zoom 0.1 = 100×80, fits in 800×600 container
    const vp = clampViewportTranslation({ x: 0, y: 0, zoom: 0.1 }, extent, 800, 600);
    // x = 800/2 - (0 + 500) * 0.1 = 400 - 50 = 350
    expect(vp.x).toBeCloseTo(350);
    expect(vp.y).toBeCloseTo(260);
  });

  it('clamps translation when content is larger than the container', () => {
    const vp = clampViewportTranslation({ x: 2000, y: 2000, zoom: 2 }, extent, 800, 600);
    // At zoom 2, world 1000×800 → 2000×1600 > container → clamp x
    expect(vp.x).toBeLessThanOrEqual(0);
    expect(vp.y).toBeLessThanOrEqual(0);
  });
});

// ── getGraphBounds ─────────────────────────────────────────────────────────────
describe('getGraphBounds', () => {
  it('returns null for empty array', () => {
    expect(getGraphBounds([])).toBeNull();
  });

  it('returns correct bounds for a single node', () => {
    const node = { id: 'n', position: { x: 10, y: 20 }, size: { width: 50, height: 30 } } as any;
    const bounds = getGraphBounds([node])!;
    expect(bounds.minX).toBe(10);
    expect(bounds.minY).toBe(20);
    expect(bounds.maxX).toBe(60);
    expect(bounds.maxY).toBe(50);
  });

  it('covers all nodes in the bounding box', () => {
    const n1 = { id: 'n1', position: { x: 0, y: 0 }, size: { width: 40, height: 20 } } as any;
    const n2 = { id: 'n2', position: { x: 100, y: 50 }, size: { width: 60, height: 40 } } as any;
    const bounds = getGraphBounds([n1, n2])!;
    expect(bounds.minX).toBe(0);
    expect(bounds.minY).toBe(0);
    expect(bounds.maxX).toBe(160);
    expect(bounds.maxY).toBe(90);
  });
});

// ── getFitViewport ────────────────────────────────────────────────────────────
describe('getFitViewport', () => {
  it('returns identity viewport for null bounds', () => {
    expect(getFitViewport(null, 800, 600, 20, 0.1, 4)).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('returns identity viewport when container has zero dimensions', () => {
    const bounds = { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
    expect(getFitViewport(bounds, 0, 0, 20, 0.1, 4)).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('computes zoom to fit content with padding', () => {
    const bounds = { minX: 0, minY: 0, maxX: 300, maxY: 300, width: 300, height: 300 };
    const vp = getFitViewport(bounds, 800, 600, 20, 0.1, 4);
    // Available: 760×560, content 300×300 → zoom = min(760/300, 560/300) ≈ 1.867
    expect(vp.zoom).toBeCloseTo(560 / 300, 2);
  });

  it('clamps zoom to maxZoom', () => {
    const bounds = { minX: 0, minY: 0, maxX: 10, maxY: 10, width: 10, height: 10 };
    const vp = getFitViewport(bounds, 800, 600, 20, 0.1, 2);
    expect(vp.zoom).toBe(2);
  });
});

// ── centerViewportOnNode ──────────────────────────────────────────────────────
describe('centerViewportOnNode', () => {
  it('centres the viewport on the node centre', () => {
    const node = { id: 'n', position: { x: 100, y: 100 }, size: { width: 60, height: 40 } } as any;
    const vp = centerViewportOnNode(node, 800, 600, 1);
    // node centre = (130, 120); viewport x = 800/2 - 130 = 270, y = 600/2 - 120 = 180
    expect(vp.x).toBeCloseTo(270);
    expect(vp.y).toBeCloseTo(180);
    expect(vp.zoom).toBe(1);
  });

  it('accounts for current zoom level', () => {
    const node = { id: 'n', position: { x: 0, y: 0 }, size: { width: 100, height: 100 } } as any;
    const vp = centerViewportOnNode(node, 800, 600, 2);
    // node centre = (50, 50) at zoom 2 → x = 400 - 50*2 = 300, y = 300 - 50*2 = 200
    expect(vp.x).toBeCloseTo(300);
    expect(vp.y).toBeCloseTo(200);
  });
});
