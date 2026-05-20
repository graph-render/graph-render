import { VerticalStagePosition } from '@graph-render/types/tournament';
import { describe, expect, it } from 'vitest';

import { NAVIGATION_MAX_ZOOM, NAVIGATION_MIN_ZOOM } from '../../constants/stageNavigation';
import { getStageViewport } from '../stageViewport';

// ── helpers ───────────────────────────────────────────────────────────────────

function bounds(minX: number, minY: number, maxX: number, maxY: number) {
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

// ── getStageViewport ──────────────────────────────────────────────────────────

describe('getStageViewport', () => {
  describe('zoom computation', () => {
    it('clamps zoom to NAVIGATION_MAX_ZOOM when viewport is huge', () => {
      const b = bounds(0, 0, 100, 100);
      const result = getStageViewport(b, 10_000, 10_000);
      expect(result.viewport.zoom).toBe(NAVIGATION_MAX_ZOOM);
    });

    it('clamps zoom to NAVIGATION_MIN_ZOOM when viewport is tiny', () => {
      const b = bounds(0, 0, 10_000, 10_000);
      const result = getStageViewport(b, 1, 1);
      expect(result.viewport.zoom).toBe(NAVIGATION_MIN_ZOOM);
    });

    it('scales to fit the stage width', () => {
      // stage width=500, padded target=500+52*2=604; viewport width=604
      // stage height very small so width drives zoom
      const b = bounds(0, 0, 500, 1);
      const result = getStageViewport(b, 604, 10_000);
      // Width ratio = 604/604 = 1.0; Height ratio huge → min(1, huge) = 1; clamp → 1
      expect(result.viewport.zoom).toBeCloseTo(1);
    });
  });

  describe('canPageVertically', () => {
    it('is false when content fits entirely in viewport', () => {
      // Stage height 100, viewport height 1000 → whole content fits, no paging
      const b = bounds(0, 0, 100, 100);
      const result = getStageViewport(b, 1000, 1000);
      expect(result.canPageVertically).toBe(false);
    });

    it('is true when stage is taller than the visible world area', () => {
      // Very narrow viewport so zoom is min, ensuring content exceeds visible height
      const b = bounds(0, 0, 100, 50_000);
      const result = getStageViewport(b, 200, 200);
      expect(result.canPageVertically).toBe(true);
    });
  });

  describe('vertical position', () => {
    // Helper to get a case where canPageVertically is true so positions differ
    function tallBounds() {
      return bounds(0, 0, 100, 5000);
    }
    const w = 300,
      h = 300;

    it('defaults to Top position', () => {
      const resultTop = getStageViewport(tallBounds(), w, h, VerticalStagePosition.Top);
      const resultDefault = getStageViewport(tallBounds(), w, h);
      expect(resultDefault.viewport.y).toBe(resultTop.viewport.y);
    });

    it('Top and Bottom produce different y values when paging is possible', () => {
      const resultTop = getStageViewport(tallBounds(), w, h, VerticalStagePosition.Top);
      const resultBottom = getStageViewport(tallBounds(), w, h, VerticalStagePosition.Bottom);
      expect(resultTop.viewport.y).not.toBe(resultBottom.viewport.y);
    });

    it('Center position y is between Top and Bottom', () => {
      const b = tallBounds();
      const top = getStageViewport(b, w, h, VerticalStagePosition.Top).viewport.y;
      const bottom = getStageViewport(b, w, h, VerticalStagePosition.Bottom).viewport.y;
      const center = getStageViewport(b, w, h, VerticalStagePosition.Center).viewport.y;
      expect(center).toBeGreaterThan(Math.min(top, bottom) - 1);
      expect(center).toBeLessThan(Math.max(top, bottom) + 1);
    });
  });

  describe('viewport x offset', () => {
    it('centers the stage horizontally in the viewport', () => {
      const b = bounds(0, 0, 200, 100);
      const result = getStageViewport(b, 600, 600);
      const { zoom, x } = result.viewport;
      // x = (width - bounds.width * zoom) / 2 - bounds.minX * zoom
      const expected = (600 - 200 * zoom) / 2 - 0 * zoom;
      expect(x).toBeCloseTo(expected);
    });

    it('accounts for non-zero minX in the horizontal offset', () => {
      const b = bounds(100, 0, 300, 100); // width=200, minX=100
      const result = getStageViewport(b, 600, 600);
      const { zoom, x } = result.viewport;
      const expected = (600 - 200 * zoom) / 2 - 100 * zoom;
      expect(x).toBeCloseTo(expected);
    });
  });

  describe('targetWorldHeight parameter', () => {
    it('overrides the default height-based zoom calculation', () => {
      const b = bounds(0, 0, 100, 500);
      const withOverride = getStageViewport(b, 400, 400, VerticalStagePosition.Top, 100);
      const withDefault = getStageViewport(b, 400, 400, VerticalStagePosition.Top);
      expect(withOverride.viewport.zoom).not.toBe(withDefault.viewport.zoom);
    });
  });
});
