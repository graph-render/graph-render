import type {
  EdgeData,
  GraphConfig,
  LayoutOptions,
  NodeData,
  NormalizedGraphConfig,
  NxGraphInput,
  PositionedEdge,
  PositionedNode,
  RouteEdgesOptions,
  Size,
} from '@graph-render/types';
import type { GraphErrorPhase, GraphSearchResults } from '@graph-render/types/react';

export type GraphModelErrorPhase = Exclude<
  GraphErrorPhase,
  GraphErrorPhase.Interaction | GraphErrorPhase.Render
>;

export type GraphModelErrorHandler = (
  error: Error,
  context: {
    readonly graph: NxGraphInput;
    readonly phase: GraphModelErrorPhase;
  }
) => void;

export interface GraphModelError {
  readonly context: {
    readonly graph: NxGraphInput;
    readonly phase: GraphModelErrorPhase;
  };
  readonly error: Error;
}

export interface UseGraphModelOptions {
  readonly graph: NxGraphInput;
  readonly config: NormalizedGraphConfig;
  readonly mergedTheme: NonNullable<GraphConfig['theme']>;
  readonly collapsedIds: readonly string[];
  readonly hiddenNodeIds?: readonly string[] | undefined;
  readonly searchQuery?: string | undefined;
  readonly hideUnmatchedSearch?: boolean | undefined;
  readonly searchPredicate?: ((node: NodeData, query: string) => boolean) | undefined;
  readonly highlightedNodeIds?: readonly string[] | undefined;
  readonly highlightedEdgeIds?: readonly string[] | undefined;
  readonly highlightStrategy?:
    | ((context: {
        readonly nodes: readonly NodeData[];
        readonly edges: readonly EdgeData[];
        readonly query: string;
        readonly matchedNodeIds: readonly string[];
        readonly matchedEdgeIds: readonly string[];
      }) => Partial<GraphSearchResults>)
    | undefined;
  readonly onSearchResultsChange?: ((results: GraphSearchResults) => void) | undefined;
  readonly layoutNodesOverride?:
    ((options: LayoutOptions) => readonly PositionedNode[]) | undefined;
  readonly routeEdgesOverride?:
    | ((
        nodes: readonly PositionedNode[],
        edges: readonly EdgeData[],
        options?: RouteEdgesOptions
      ) => readonly PositionedEdge[])
    | undefined;
  readonly onError?: GraphModelErrorHandler | undefined;
}

export interface GraphModelResult {
  readonly childNodeIdsByParent: ReadonlyMap<string, readonly string[]>;
  readonly effectiveHighlightedEdgeSet: ReadonlySet<string>;
  readonly effectiveHighlightedNodeSet: ReadonlySet<string>;
  readonly handleNodeMeasure: (nodeId: string, size: Size) => void;
  readonly positionedEdges: readonly PositionedEdge[];
  readonly positionedNodes: readonly PositionedNode[];
  readonly visibleEdges: readonly EdgeData[];
  readonly visibleNodesWithMeasuredSize: readonly NodeData[];
}
