import { NodeSizingMode } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { applyNodeSizing } from '../nodeSizing';

const baseOptions = { nodes: [], edges: [] };

describe('applyNodeSizing', () => {
  describe('Fixed mode', () => {
    it('uses fixedNodeSize from options when node has no explicit size', () => {
      const nodes = [{ id: 'a' }];
      const result = applyNodeSizing(nodes, {
        ...baseOptions,
        nodeSizing: NodeSizingMode.Fixed,
        fixedNodeSize: { width: 200, height: 80 },
      });
      expect(result[0]!.size).toEqual({ width: 200, height: 80 });
    });

    it('prefers node.size over fixedNodeSize in Fixed mode', () => {
      const nodes = [{ id: 'a', size: { width: 150, height: 60 } }];
      const result = applyNodeSizing(nodes, {
        ...baseOptions,
        nodeSizing: NodeSizingMode.Fixed,
        fixedNodeSize: { width: 200, height: 80 },
      });
      expect(result[0]!.size).toEqual({ width: 150, height: 60 });
    });

    it('falls back to default node size when no explicit size or fixedNodeSize', () => {
      const nodes = [{ id: 'a' }];
      const result = applyNodeSizing(nodes, { ...baseOptions, nodeSizing: NodeSizingMode.Fixed });
      expect(result[0]!.size).toBeDefined();
      expect(result[0]!.size!.width).toBeGreaterThan(0);
      expect(result[0]!.size!.height).toBeGreaterThan(0);
    });
  });

  describe('Label mode', () => {
    it('estimates size from label when no explicit size', () => {
      const nodes = [{ id: 'a', label: 'Short' }];
      const result = applyNodeSizing(nodes, { ...baseOptions, nodeSizing: NodeSizingMode.Label });
      expect(result[0]!.size).toBeDefined();
      expect(result[0]!.size!.width).toBeGreaterThan(0);
    });

    it('uses node.size when available in Label mode', () => {
      const nodes = [{ id: 'a', label: 'Label', size: { width: 300, height: 100 } }];
      const result = applyNodeSizing(nodes, { ...baseOptions, nodeSizing: NodeSizingMode.Label });
      expect(result[0]!.size).toEqual({ width: 300, height: 100 });
    });

    it('scales estimated size with long labels', () => {
      const shortNode = [{ id: 'a', label: 'Hi' }];
      const longNode = [
        { id: 'b', label: 'A very long label text that spans multiple characters' },
      ];
      const shortResult = applyNodeSizing(shortNode, {
        ...baseOptions,
        nodeSizing: NodeSizingMode.Label,
      });
      const longResult = applyNodeSizing(longNode, {
        ...baseOptions,
        nodeSizing: NodeSizingMode.Label,
      });
      expect(longResult[0]!.size!.width).toBeGreaterThan(shortResult[0]!.size!.width);
    });
  });

  describe('Measured mode', () => {
    it('uses measuredSize when available', () => {
      const nodes = [{ id: 'a', measuredSize: { width: 250, height: 90 } }];
      const result = applyNodeSizing(nodes, {
        ...baseOptions,
        nodeSizing: NodeSizingMode.Measured,
      });
      expect(result[0]!.size).toEqual({ width: 250, height: 90 });
    });

    it('falls back to node.size when measuredSize is missing', () => {
      const nodes = [{ id: 'a', size: { width: 180, height: 70 } }];
      const result = applyNodeSizing(nodes, {
        ...baseOptions,
        nodeSizing: NodeSizingMode.Measured,
      });
      expect(result[0]!.size).toEqual({ width: 180, height: 70 });
    });

    it('falls back to estimated size when no measuredSize or node.size', () => {
      const nodes = [{ id: 'a', label: 'Hello' }];
      const result = applyNodeSizing(nodes, {
        ...baseOptions,
        nodeSizing: NodeSizingMode.Measured,
      });
      expect(result[0]!.size).toBeDefined();
    });
  });

  it('processes all nodes', () => {
    const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    const result = applyNodeSizing(nodes, { ...baseOptions });
    expect(result).toHaveLength(3);
  });

  it('uses node-level sizeMode override', () => {
    const nodes = [{ id: 'a', sizeMode: NodeSizingMode.Label, label: 'Test' }];
    const result = applyNodeSizing(nodes, {
      ...baseOptions,
      nodeSizing: NodeSizingMode.Fixed,
      fixedNodeSize: { width: 500, height: 500 },
    });
    // Node overrides Fixed with Label: should NOT use 500×500
    expect(result[0]!.size!.width).toBeLessThan(500);
  });
});
