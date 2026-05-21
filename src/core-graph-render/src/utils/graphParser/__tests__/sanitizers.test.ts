import { NodeSizingMode } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import {
  sanitizeEdgePoints,
  sanitizeNodeData,
  sanitizeNodeId,
  sanitizePoint,
  sanitizeRecord,
} from '../sanitizers';

describe('sanitizeNodeId', () => {
  it('trims whitespace', () => {
    expect(sanitizeNodeId('  abc  ', 'node')).toBe('abc');
  });

  it('returns the value unchanged when already trimmed', () => {
    expect(sanitizeNodeId('hello', 'node')).toBe('hello');
  });

  it('throws TypeError for empty string', () => {
    expect(() => sanitizeNodeId('', 'node')).toThrow(TypeError);
  });

  it('throws TypeError for whitespace-only string', () => {
    expect(() => sanitizeNodeId('   ', 'node')).toThrow(TypeError);
  });

  it('includes the kind in the error message', () => {
    expect(() => sanitizeNodeId('', 'edge-endpoint')).toThrow('edge-endpoint');
  });
});

describe('sanitizePoint', () => {
  it('returns the point for valid x/y', () => {
    expect(sanitizePoint({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 });
  });

  it('returns undefined for non-object', () => {
    expect(sanitizePoint(null)).toBeUndefined();
    expect(sanitizePoint(42)).toBeUndefined();
    expect(sanitizePoint('string')).toBeUndefined();
  });

  it('returns undefined when x is not a finite number', () => {
    expect(sanitizePoint({ x: Number.NaN, y: 1 })).toBeUndefined();
    expect(sanitizePoint({ x: Number.POSITIVE_INFINITY, y: 1 })).toBeUndefined();
    expect(sanitizePoint({ x: 'bad', y: 1 })).toBeUndefined();
  });

  it('returns undefined when y is not a finite number', () => {
    expect(sanitizePoint({ x: 1, y: Number.NaN })).toBeUndefined();
    expect(sanitizePoint({ x: 1, y: Number.POSITIVE_INFINITY })).toBeUndefined();
  });

  it('handles zero values', () => {
    expect(sanitizePoint({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it('handles negative values', () => {
    expect(sanitizePoint({ x: -10, y: -20 })).toEqual({ x: -10, y: -20 });
  });
});

describe('sanitizeRecord', () => {
  it('returns the object as-is for a plain object', () => {
    const obj = { a: 1, b: 'two' };
    expect(sanitizeRecord(obj)).toBe(obj);
  });

  it('returns undefined for null', () => {
    expect(sanitizeRecord(null)).toBeUndefined();
  });

  it('returns undefined for an array', () => {
    expect(sanitizeRecord([1, 2, 3])).toBeUndefined();
  });

  it('returns undefined for primitives', () => {
    expect(sanitizeRecord(42)).toBeUndefined();
    expect(sanitizeRecord('str')).toBeUndefined();
  });
});

describe('sanitizeEdgePoints', () => {
  it('returns valid points array with 2+ valid points', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 10, y: 20 },
    ];
    expect(sanitizeEdgePoints(pts)).toEqual(pts);
  });

  it('returns undefined for non-array input', () => {
    expect(sanitizeEdgePoints('not array')).toBeUndefined();
    expect(sanitizeEdgePoints(null)).toBeUndefined();
    expect(sanitizeEdgePoints({})).toBeUndefined();
  });

  it('returns undefined for empty array', () => {
    expect(sanitizeEdgePoints([])).toBeUndefined();
  });

  it('returns undefined when any point is invalid', () => {
    expect(
      sanitizeEdgePoints([
        { x: 1, y: 2 },
        { x: Number.NaN, y: 4 },
      ])
    ).toBeUndefined();
    expect(
      sanitizeEdgePoints([
        { x: 1, y: Number.POSITIVE_INFINITY },
        { x: 3, y: 4 },
      ])
    ).toBeUndefined();
  });

  it('returns undefined for array with fewer than 2 points', () => {
    expect(sanitizeEdgePoints([{ x: 0, y: 0 }])).toBeUndefined();
  });
});

describe('sanitizeNodeData', () => {
  it('returns a node with just id when attrs is empty', () => {
    const node = sanitizeNodeData('n1', {});
    expect(node.id).toBe('n1');
  });

  it('picks up the label field', () => {
    const node = sanitizeNodeData('n1', { label: 'My Node' });
    expect(node.label).toBe('My Node');
  });

  it('picks up a valid position', () => {
    const node = sanitizeNodeData('n1', { position: { x: 10, y: 20 } });
    expect(node.position).toEqual({ x: 10, y: 20 });
  });

  it('ignores invalid position', () => {
    const node = sanitizeNodeData('n1', { position: { x: 'bad', y: 0 } });
    expect(node.position).toBeUndefined();
  });

  it('picks up a valid sizeMode', () => {
    const node = sanitizeNodeData('n1', { sizeMode: NodeSizingMode.Label });
    expect(node.sizeMode).toBe(NodeSizingMode.Label);
  });

  it('ignores an invalid sizeMode', () => {
    const node = sanitizeNodeData('n1', { sizeMode: 'invalid-mode' });
    expect(node.sizeMode).toBeUndefined();
  });

  it('sanitizes measurement hints when values are valid', () => {
    const node = sanitizeNodeData('n1', {
      measurementHints: {
        label: 'Measured',
        paddingX: 8,
        paddingY: 4,
        estimatedCharWidth: 9,
        lineHeight: 14,
      },
    });

    expect(node.measurementHints).toEqual({
      label: 'Measured',
      paddingX: 8,
      paddingY: 4,
      estimatedCharWidth: 9,
      lineHeight: 14,
    });
  });

  it('drops invalid measurement hint fields', () => {
    const node = sanitizeNodeData('n1', {
      measurementHints: {
        label: 42,
        paddingX: -1,
        estimatedCharWidth: 0,
      },
    });

    expect(node.measurementHints).toBeUndefined();
  });
});
