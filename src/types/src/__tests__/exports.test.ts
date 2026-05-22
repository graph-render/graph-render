import { describe, expect, it } from 'vitest';

import * as rootTypes from '../index';
import { isPositionedNode, makePositionedNode } from '../node';
import * as reactTypes from '../react';

describe('@graph-render/types public exports', () => {
  it('exports core graph enums from the root entry', () => {
    expect(rootTypes.LayoutType).toBeDefined();
    expect(rootTypes.EdgeType).toBeDefined();
    expect(rootTypes.RoutingStyle).toBeDefined();
  });

  it('does not export React components from the root entry', () => {
    expect('Graph' in rootTypes).toBe(false);
    expect('VertexComponent' in rootTypes).toBe(false);
  });

  it('exports React graph contracts from the react subpath', () => {
    expect(reactTypes.SelectionMode).toBeDefined();
    expect(reactTypes.GraphErrorPhase).toBeDefined();
  });
});

describe('makePositionedNode', () => {
  it('merges node data with a position', () => {
    const node = { id: 'n1', label: 'Test' };
    const position = { x: 10, y: 20 };
    const result = makePositionedNode(node, position);
    expect(result).toEqual({ id: 'n1', label: 'Test', position: { x: 10, y: 20 } });
  });

  it('preserves all node fields', () => {
    const node = { id: 'n2', data: { foo: 'bar' }, size: { width: 100, height: 40 } };
    const result = makePositionedNode(node, { x: 0, y: 0 });
    expect(result.data).toEqual({ foo: 'bar' });
    expect(result.size).toEqual({ width: 100, height: 40 });
    expect(result.position).toEqual({ x: 0, y: 0 });
  });
});

describe('isPositionedNode', () => {
  it('returns true when position is defined', () => {
    expect(isPositionedNode({ id: 'n1', position: { x: 1, y: 2 } })).toBe(true);
  });

  it('returns false when position is undefined', () => {
    expect(isPositionedNode({ id: 'n1' })).toBe(false);
  });
});
