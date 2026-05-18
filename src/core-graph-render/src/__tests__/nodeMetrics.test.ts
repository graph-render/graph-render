import { describe, expect, it } from 'vitest';

import { getMaxNodeDimensions, getMaxNodeHeight, getMaxNodeWidth } from '../utils/nodeMetrics';
import { DEFAULT_NODE_SIZE } from '../utils/constants';

const makeNode = (width?: number, height?: number) =>
  ({ id: 'n', size: width != null && height != null ? { width, height } : undefined }) as any;

describe('getMaxNodeWidth', () => {
  it('returns the largest explicit width', () => {
    const nodes = [makeNode(50, 30), makeNode(100, 20), makeNode(70, 40)];
    expect(getMaxNodeWidth(nodes)).toBe(100);
  });

  it('falls back to DEFAULT_NODE_SIZE.width when size is absent', () => {
    const nodes = [makeNode()];
    expect(getMaxNodeWidth(nodes)).toBe(DEFAULT_NODE_SIZE.width);
  });

  it('returns 0 for an empty array', () => {
    expect(getMaxNodeWidth([])).toBe(0);
  });

  it('respects the default over a smaller explicit width', () => {
    const nodes = [makeNode(1, 1), makeNode()];
    expect(getMaxNodeWidth(nodes)).toBe(DEFAULT_NODE_SIZE.width);
  });
});

describe('getMaxNodeHeight', () => {
  it('returns the largest explicit height', () => {
    const nodes = [makeNode(50, 30), makeNode(100, 20), makeNode(70, 40)];
    expect(getMaxNodeHeight(nodes)).toBe(40);
  });

  it('falls back to DEFAULT_NODE_SIZE.height when size is absent', () => {
    const nodes = [makeNode()];
    expect(getMaxNodeHeight(nodes)).toBe(DEFAULT_NODE_SIZE.height);
  });

  it('returns 0 for an empty array', () => {
    expect(getMaxNodeHeight([])).toBe(0);
  });
});

describe('getMaxNodeDimensions', () => {
  it('returns combined maxWidth and maxHeight in one call', () => {
    const nodes = [makeNode(80, 50), makeNode(60, 90)];
    expect(getMaxNodeDimensions(nodes)).toEqual({ maxWidth: 80, maxHeight: 90 });
  });

  it('returns defaults for a single node without size', () => {
    const result = getMaxNodeDimensions([makeNode()]);
    expect(result).toEqual({
      maxWidth: DEFAULT_NODE_SIZE.width,
      maxHeight: DEFAULT_NODE_SIZE.height,
    });
  });
});
