import {
  type EdgeData,
  EdgeType,
  LayoutDirection,
  LayoutType,
  type NodeData,
} from '@graph-render/types';
import { bench, describe } from 'vitest';

import { routeEdges } from './edges';
import { layoutNodes } from './layouts';

const makeTreeFixture = (
  nodeCount: number
): { readonly nodes: readonly NodeData[]; readonly edges: readonly EdgeData[] } => {
  const nodes = Array.from({ length: nodeCount }, (_, index) => ({
    id: `n-${index}`,
    label: `Node ${index}`,
  }));
  const edges = Array.from({ length: Math.max(0, nodeCount - 1) }, (_, index) => ({
    id: `e-${index}`,
    source: `n-${Math.floor((index + 1) / 2)}`,
    target: `n-${index + 1}`,
    type: EdgeType.Directed,
  }));

  return { nodes, edges };
};

describe('core graph performance', () => {
  const mediumTree = makeTreeFixture(250);
  const largeTree = makeTreeFixture(1000);

  bench('tree layout: 250 nodes', () => {
    layoutNodes({
      nodes: mediumTree.nodes,
      edges: mediumTree.edges,
      layout: LayoutType.Tree,
      layoutDirection: LayoutDirection.LTR,
      width: 4000,
      height: 3000,
    });
  });

  bench('tree layout: 1,000 nodes', () => {
    layoutNodes({
      nodes: largeTree.nodes,
      edges: largeTree.edges,
      layout: LayoutType.Tree,
      layoutDirection: LayoutDirection.LTR,
      width: 10 * 1000,
      height: 8 * 1000,
    });
  });

  bench('route orthogonal edges: 1,000 nodes', () => {
    const positionedNodes = layoutNodes({
      nodes: largeTree.nodes,
      edges: largeTree.edges,
      layout: LayoutType.Tree,
      layoutDirection: LayoutDirection.LTR,
      width: 10 * 1000,
      height: 8 * 1000,
    });
    routeEdges(positionedNodes, largeTree.edges);
  });
});
