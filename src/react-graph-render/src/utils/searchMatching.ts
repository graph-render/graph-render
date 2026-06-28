import type { EdgeData, NodeData } from '@graph-render/types';
import type { GraphSearchResults } from '@graph-render/types/react';

import type { HighlightContext } from '../models/domain';

export const findSearchMatchedNodeIds = <TNode extends NodeData>(
  nodes: readonly TNode[],
  query: string | undefined,
  searchPredicate: ((node: TNode, query: string) => boolean) | undefined
): readonly string[] => {
  const normalizedQuery = query?.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return nodes.flatMap((node) => {
    if (!doesNodeMatchSearch(node, normalizedQuery, searchPredicate)) {
      return [];
    }
    return [node.id];
  });
};

export const findSearchMatchedEdgeIds = <TEdge extends EdgeData>(
  edges: readonly TEdge[],
  query: string | undefined,
  searchMatchedNodeIdSet: ReadonlySet<string>
): readonly string[] => {
  const normalizedQuery = query?.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return edges.flatMap((edge) => {
    const label = edge.label == null ? '' : String(edge.label).toLowerCase();
    const isMatched =
      searchMatchedNodeIdSet.has(edge.source) ||
      searchMatchedNodeIdSet.has(edge.target) ||
      label.includes(normalizedQuery);
    return isMatched ? [edge.id] : [];
  });
};

export const getDerivedHighlightResults = <TNode extends NodeData, TEdge extends EdgeData>(
  context: HighlightContext<TNode, TEdge>,
  highlightStrategy:
    ((context: HighlightContext<TNode, TEdge>) => Partial<GraphSearchResults>) | undefined
): Partial<GraphSearchResults> => {
  if (!context.query.trim()) {
    return { nodeIds: [], edgeIds: [] };
  }

  try {
    return highlightStrategy?.(context) ?? { nodeIds: [], edgeIds: [] };
  } catch {
    return { nodeIds: [], edgeIds: [] };
  }
};

const doesNodeMatchSearch = <TNode extends NodeData>(
  node: TNode,
  query: string,
  searchPredicate: ((node: TNode, query: string) => boolean) | undefined
) => {
  if (searchPredicate) {
    try {
      return searchPredicate(node, query);
    } catch {
      return false;
    }
  }

  const label =
    typeof node.label === 'string' || typeof node.label === 'number' ? String(node.label) : node.id;

  return node.id.toLowerCase().includes(query) || label.toLowerCase().includes(query);
};
