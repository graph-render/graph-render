import type {
  EdgeData,
  NodeData,
  NormalizedGraphConfig,
  NxGraphInput,
  PositionedEdge,
  PositionedNode,
  Size,
} from '@graph-render/types';
import type {
  GraphHandle,
  GraphHoverTrigger,
  GraphProps,
  GraphSearchResults,
  GraphSelection,
  GraphViewport,
  SelectionMode,
} from '@graph-render/types/react';
import type { RefObject } from 'react';

import type { FocusedPath } from './domain';

// ── useGraphCollapse ─────────────────────────────────────────────────────────

export interface UseGraphCollapseOptions {
  readonly collapsedNodeIds?: readonly string[] | undefined;
  readonly defaultCollapsedNodeIds?: readonly string[] | undefined;
  readonly onCollapsedNodeIdsChange?: ((nodeIds: readonly string[]) => void) | undefined;
}

export interface UseGraphCollapseResult {
  readonly collapsedIds: readonly string[];
  readonly collapsedNodeSet: ReadonlySet<string>;
  readonly pendingExpansionNodeSet: ReadonlySet<string>;
  readonly updateCollapsedNodeIds: (
    next: readonly string[] | ((current: readonly string[]) => readonly string[])
  ) => void;
  readonly setPendingExpansionNodeIds: React.Dispatch<React.SetStateAction<readonly string[]>>;
}

// ── useGraphCollapseHandlers ─────────────────────────────────────────────────

export type GraphErrorHandler = GraphProps['onError'];

export interface UseGraphCollapseHandlersOptions {
  readonly childNodeIdsByParent: ReadonlyMap<string, readonly string[]>;
  readonly collapsedNodeSet: ReadonlySet<string>;
  readonly graph: NxGraphInput;
  readonly onError: GraphErrorHandler;
  readonly onNodeCollapse: ((nodeId: string) => void) | undefined;
  readonly onNodeExpand: ((nodeId: string) => void | Promise<void>) | undefined;
  readonly pendingExpansionNodeSet: ReadonlySet<string>;
  readonly setPendingExpansionNodeIds: React.Dispatch<React.SetStateAction<readonly string[]>>;
  readonly toggleCollapseOnNodeDoubleClick: boolean;
  readonly updateCollapsedNodeIds: (
    next: readonly string[] | ((current: readonly string[]) => readonly string[])
  ) => void;
}

// ── useGraphHoverHandlers ────────────────────────────────────────────────────

export interface HoverMeta {
  readonly selection: GraphSelection;
  readonly trigger: GraphHoverTrigger;
  readonly viewport: GraphViewport;
}

export interface UseGraphHoverHandlersOptions {
  readonly hoverHighlight: boolean;
  readonly onEdgeHoverChange:
    | ((edge: PositionedEdge, hovered: boolean, meta: HoverMeta) => void)
    | undefined;
  readonly onNodeHoverChange:
    | ((node: PositionedNode, hovered: boolean, meta: HoverMeta) => void)
    | undefined;
  readonly positionedEdgeMap: ReadonlyMap<string, PositionedEdge>;
  readonly positionedNodeMap: ReadonlyMap<string, PositionedNode>;
  readonly selection: GraphSelection;
  readonly setFocusedPath: React.Dispatch<React.SetStateAction<FocusedPath | null>>;
  readonly setHoveredEdgeId: React.Dispatch<React.SetStateAction<string | null>>;
  readonly setHoveredNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  readonly viewport: GraphViewport;
}

// ── useGraphKeyboardNavigation ───────────────────────────────────────────────

export interface UseGraphKeyboardNavigationOptions {
  readonly centerOnNode: (nodeId: string) => void;
  readonly fitView: () => void;
  readonly focusedNodeId: string | null;
  readonly handleNodeSelection: (node: PositionedNode) => void;
  readonly keyboardNavigation: boolean;
  readonly positionedNodeMap: ReadonlyMap<string, PositionedNode>;
  readonly positionedNodes: readonly PositionedNode[];
  readonly setFocusedPath: React.Dispatch<React.SetStateAction<FocusedPath | null>>;
  readonly updateFocusedNode: (nodeId: string | null) => void;
  readonly updateSelection: (
    next: GraphSelection | ((current: GraphSelection) => GraphSelection)
  ) => void;
  readonly updateViewport: GraphHandle['setViewport'];
  readonly zoomStep: number;
}

// ── useGraphNodeMeasurement ──────────────────────────────────────────────────

export interface UseGraphNodeMeasurementOptions {
  readonly node: PositionedNode;
  readonly width: number;
  readonly height: number;
  readonly onNodeMeasure?: ((nodeId: string, size: Size) => void) | undefined;
}

// ── useGraphPointerInteractions ──────────────────────────────────────────────

export interface UseGraphPointerInteractionsOptions {
  readonly getViewportDimensions: () => { readonly width: number; readonly height: number };
  readonly marqueeSelectionEnabled: boolean;
  readonly panEnabled: boolean;
  readonly pinchZoomEnabled: boolean;
  readonly positionedEdges: readonly PositionedEdge[];
  readonly positionedNodes: readonly PositionedNode[];
  readonly safeMaxZoom: number;
  readonly safeMinZoom: number;
  readonly selectionMode: SelectionMode;
  readonly svgRef: React.RefObject<SVGSVGElement | null>;
  readonly translateExtent:
    | readonly [readonly [number, number], readonly [number, number]]
    | undefined;
  readonly updateSelection: (
    next: GraphSelection | ((current: GraphSelection) => GraphSelection)
  ) => void;
  readonly updateViewport: GraphHandle['setViewport'];
  readonly viewportRef: React.RefObject<GraphViewport>;
  readonly zoomEnabled: boolean;
}

// ── useGraphSearchState ──────────────────────────────────────────────────────

export interface UseGraphSearchStateOptions<
  TNode extends NodeData = NodeData,
  TEdge extends EdgeData = EdgeData,
> {
  readonly nodes: readonly TNode[];
  readonly edges: readonly TEdge[];
  readonly collapsedIds: readonly string[];
  readonly hiddenNodeIds?: readonly string[] | undefined;
  readonly searchQuery?: string | undefined;
  readonly hideUnmatchedSearch?: boolean | undefined;
  readonly searchPredicate?: ((node: TNode, query: string) => boolean) | undefined;
  readonly highlightedNodeIds?: readonly string[] | undefined;
  readonly highlightedEdgeIds?: readonly string[] | undefined;
  readonly highlightStrategy?:
    | ((context: {
        readonly nodes: readonly TNode[];
        readonly edges: readonly TEdge[];
        readonly query: string;
        readonly matchedNodeIds: readonly string[];
        readonly matchedEdgeIds: readonly string[];
      }) => Partial<GraphSearchResults>)
    | undefined;
  readonly onSearchResultsChange?: ((results: GraphSearchResults) => void) | undefined;
}

// ── useGraphSelectionHandlers ────────────────────────────────────────────────

export interface UseGraphSelectionHandlersOptions {
  readonly edgeSelectionEnabled: boolean;
  readonly nodeSelectionEnabled: boolean;
  readonly onEdgeClick: ((edge: PositionedEdge) => void) | undefined;
  readonly onNodeClick: ((node: PositionedNode) => void) | undefined;
  readonly selectionMode: SelectionMode;
  readonly updateFocusedNode: (nodeId: string | null) => void;
  readonly updateSelection: (
    next: GraphSelection | ((current: GraphSelection) => GraphSelection)
  ) => void;
}

// ── useGraphViewportController ───────────────────────────────────────────────

export interface UseGraphViewportControllerOptions {
  readonly cfg: NormalizedGraphConfig;
  readonly fitViewOnMount: boolean;
  readonly fitViewPadding: number;
  readonly graph: NxGraphInput;
  readonly positionedEdges: readonly PositionedEdge[];
  readonly positionedNodeMap: ReadonlyMap<string, PositionedNode>;
  readonly positionedNodes: readonly PositionedNode[];
  readonly ref: React.ForwardedRef<GraphHandle>;
  readonly safeMaxZoom: number;
  readonly safeMinZoom: number;
  readonly svgRef: React.RefObject<SVGSVGElement | null>;
  readonly updateSelection: (
    next: GraphSelection | ((current: GraphSelection) => GraphSelection)
  ) => void;
  readonly updateViewport: GraphHandle['setViewport'];
  readonly viewport: GraphViewport;
  readonly zoomStep: number;
  /** Ref to the current selection — read without causing re-renders. */
  readonly selectionRef: React.RefObject<GraphSelection>;
  /** Current collapsed node IDs (from useGraphCollapse). */
  readonly collapsedIds: readonly string[];
  /** Current in-flight expansion node set (from useGraphCollapse). */
  readonly pendingExpansionNodeSet: ReadonlySet<string>;
}

// ── useGraphViewState ────────────────────────────────────────────────────────

export interface UseGraphViewStateOptions {
  readonly controlledViewport: GraphViewport | undefined;
  readonly defaultViewport: Partial<GraphViewport> | undefined;
  readonly safeMinZoom: number;
  readonly safeMaxZoom: number;
  readonly onViewportChange: ((viewport: GraphViewport) => void) | undefined;
  readonly selectedNodeIds: readonly string[] | undefined;
  readonly selectedEdgeIds: readonly string[] | undefined;
  readonly defaultSelectedNodeIds: readonly string[] | undefined;
  readonly defaultSelectedEdgeIds: readonly string[] | undefined;
  readonly onSelectionChange: ((selection: GraphSelection) => void) | undefined;
  readonly controlledFocusedNodeId: string | null | undefined;
  readonly defaultFocusedNodeId: string | null;
  readonly onFocusedNodeChange: ((nodeId: string | null) => void) | undefined;
}

export interface UseGraphViewStateResult {
  readonly viewport: GraphViewport;
  readonly viewportRef: RefObject<GraphViewport>;
  readonly selection: GraphSelection;
  readonly selectionRef: RefObject<GraphSelection>;
  readonly focusedNodeId: string | null;
  readonly updateViewport: GraphHandle['setViewport'];
  readonly updateSelection: (
    next: GraphSelection | ((current: GraphSelection) => GraphSelection)
  ) => void;
  readonly updateFocusedNode: (nodeId: string | null) => void;
}

// ── useGraphWheelZoomListener ────────────────────────────────────────────────

export interface UseGraphWheelZoomOptions {
  readonly getViewportDimensions: () => { readonly width: number; readonly height: number };
  readonly safeMaxZoom: number;
  readonly safeMinZoom: number;
  readonly svgRef: React.RefObject<SVGSVGElement | null>;
  readonly translateExtent:
    | readonly [readonly [number, number], readonly [number, number]]
    | undefined;
  readonly updateViewport: GraphHandle['setViewport'];
  readonly viewportRef: React.RefObject<GraphViewport>;
  readonly zoomEnabled: boolean;
  readonly zoomStep: number;
}
