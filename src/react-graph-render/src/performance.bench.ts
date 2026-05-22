import { normalizeGraphConfig } from '@graph-render/core';
import { EdgeType, LayoutType, type NxGraphInput } from '@graph-render/types';
import { bench, describe } from 'vitest';

import { resolvePositionedNodes } from './utils/graphModelLayout';
import { buildGraphLayoutOptions } from './utils/graphModelOptions';
import { filterEdgesInViewport, filterNodesInViewport } from './utils/viewportCulling';

const makeNxTree = (nodeCount: number): NxGraphInput => {
  const nodes: NonNullable<NxGraphInput['nodes']> = {};
  const adj: NxGraphInput['adj'] = {};

  for (let index = 0; index < nodeCount; index += 1) {
    const id = `n-${index}`;
    nodes[id] = { label: `Node ${index}` };
    adj[id] = {};
  }

  for (let index = 1; index < nodeCount; index += 1) {
    const source = `n-${Math.floor(index / 2)}`;
    const target = `n-${index}`;
    adj[source] = {
      ...(adj[source] as object),
      [target]: { id: `e-${index}`, type: EdgeType.Directed },
    };
  }

  return { nodes, adj };
};

describe('react graph model performance', () => {
  const graph = makeNxTree(1000);
  const cfg = normalizeGraphConfig({ layout: LayoutType.Tree, width: 10 * 1000, height: 8 * 1000 });

  bench('layout model adapter: 1,000 nodes', () => {
    const nodes = Object.entries(graph.nodes ?? {}).map(([id, attrs]) => ({ id, ...attrs }));
    const edges = Object.entries(graph.adj).flatMap(([source, targets]) =>
      Object.entries(targets).map(([target, attrs]) => ({
        id:
          typeof attrs === 'object' && attrs && 'id' in attrs
            ? String(attrs.id)
            : `${source}-${target}`,
        source,
        target,
        type: EdgeType.Directed,
      }))
    );

    resolvePositionedNodes({
      allowDegradedGraph: false,
      graph,
      layoutNodesOverride: undefined,
      layoutOptions: buildGraphLayoutOptions({ config: cfg, edges, mergedTheme: cfg.theme, nodes }),
      visibleNodes: nodes,
    });
  });

  bench('viewport culling: 1,000 nodes', () => {
    const nodes = Array.from({ length: 1000 }, (_, index) => ({
      id: `n-${index}`,
      position: { x: (index % 50) * 180, y: Math.floor(index / 50) * 100 },
      size: { width: 120, height: 60 },
    }));
    const visibleNodes = filterNodesInViewport(nodes, { x: -500, y: -300, zoom: 1 }, 1200, 800);
    filterEdgesInViewport(
      [],
      new Set(visibleNodes.map((node) => node.id)),
      { x: -500, y: -300, zoom: 1 },
      1200,
      800
    );
  });
});
