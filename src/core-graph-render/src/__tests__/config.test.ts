import {
  EdgeType,
  GraphFailureBehavior,
  GraphInputValidationMode,
  LayoutDirection,
  LayoutType,
  NodeSizingMode,
  RoutingStyle,
} from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { normalizeGraphConfig } from '../utils/config';
import {
  DEFAULT_HEIGHT,
  DEFAULT_NODE_SIZE,
  DEFAULT_WIDTH,
  MAX_DIMENSION,
} from '../utils/constants';

describe('normalizeGraphConfig', () => {
  it('fills in all defaults when called with no argument', () => {
    const cfg = normalizeGraphConfig();
    expect(cfg.width).toBe(DEFAULT_WIDTH);
    expect(cfg.height).toBe(DEFAULT_HEIGHT);
    expect(cfg.padding).toBe(24);
    expect(cfg.defaultEdgeType).toBe(EdgeType.Directed);
    expect(cfg.failureBehavior).toBe(GraphFailureBehavior.Throw);
    expect(cfg.inputValidationMode).toBe(GraphInputValidationMode.Auto);
    expect(cfg.showArrows).toBe(true);
    expect(cfg.nodeSizing).toBe(NodeSizingMode.Fixed);
    expect(cfg.layout).toBe(LayoutType.Centered);
    expect(cfg.layoutDirection).toBe(LayoutDirection.LTR);
    expect(cfg.curveEdges).toBe(true);
    expect(cfg.forceRightToLeft).toBe(false);
    expect(cfg.hoverHighlight).toBe(true);
    expect(cfg.autoLabels).toBe(false);
    expect(cfg.routingStyle).toBe(RoutingStyle.Smart);
  });

  it('clamps width/height between 1 and MAX_DIMENSION', () => {
    // negative / zero values are clamped to min (1), not the fallback
    expect(normalizeGraphConfig({ width: -100 }).width).toBe(1);
    expect(normalizeGraphConfig({ width: 0 }).width).toBe(1);
    expect(normalizeGraphConfig({ width: MAX_DIMENSION + 1 }).width).toBe(MAX_DIMENSION);
    expect(normalizeGraphConfig({ width: 500 }).width).toBe(500);
  });

  it('returns defaults for non-finite / negative padding', () => {
    expect(normalizeGraphConfig({ padding: -1 }).padding).toBe(24);
    expect(normalizeGraphConfig({ padding: NaN }).padding).toBe(24);
    expect(normalizeGraphConfig({ padding: 0 }).padding).toBe(0);
    expect(normalizeGraphConfig({ padding: 16 }).padding).toBe(16);
  });

  it('falls back to Fixed for unknown nodeSizing values', () => {
    expect(normalizeGraphConfig({ nodeSizing: 'unknown' as any }).nodeSizing).toBe(
      NodeSizingMode.Fixed
    );
  });

  it('accepts valid nodeSizing modes', () => {
    expect(normalizeGraphConfig({ nodeSizing: NodeSizingMode.Label }).nodeSizing).toBe(
      NodeSizingMode.Label
    );
    expect(normalizeGraphConfig({ nodeSizing: NodeSizingMode.Measured }).nodeSizing).toBe(
      NodeSizingMode.Measured
    );
  });

  it('falls back to Directed for unknown defaultEdgeType', () => {
    expect(normalizeGraphConfig({ defaultEdgeType: 'bad' as any }).defaultEdgeType).toBe(
      EdgeType.Directed
    );
  });

  it('accepts Undirected edge type', () => {
    expect(normalizeGraphConfig({ defaultEdgeType: EdgeType.Undirected }).defaultEdgeType).toBe(
      EdgeType.Undirected
    );
  });

  it('falls back to Centered for unknown layout type', () => {
    expect(normalizeGraphConfig({ layout: 'bad' as any }).layout).toBe(LayoutType.Centered);
  });

  it('normalizes fixedNodeSize with invalid values to defaults', () => {
    expect(normalizeGraphConfig({ fixedNodeSize: { width: -1, height: 0 } }).fixedNodeSize).toEqual(
      DEFAULT_NODE_SIZE
    );
  });

  it('normalizes fixedNodeSize with valid values', () => {
    expect(
      normalizeGraphConfig({ fixedNodeSize: { width: 120, height: 80 } }).fixedNodeSize
    ).toEqual({ width: 120, height: 80 });
  });

  it('clamps curveStrength between 0 and 1', () => {
    expect(normalizeGraphConfig({ curveStrength: 2 }).curveStrength).toBeLessThanOrEqual(1);
    expect(normalizeGraphConfig({ curveStrength: -1 }).curveStrength).toBeGreaterThanOrEqual(0);
    expect(normalizeGraphConfig({ curveStrength: 0.5 }).curveStrength).toBe(0.5);
  });

  it('accepts RTL layout direction', () => {
    expect(
      normalizeGraphConfig({ layoutDirection: LayoutDirection.RTL }).layoutDirection
    ).toBe(LayoutDirection.RTL);
  });

  it('preserves showArrows: false', () => {
    expect(normalizeGraphConfig({ showArrows: false }).showArrows).toBe(false);
  });

  it('preserves hoverHighlight: false', () => {
    expect(normalizeGraphConfig({ hoverHighlight: false }).hoverHighlight).toBe(false);
  });
});
