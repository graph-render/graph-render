import type { ComponentType, ReactNode } from 'react';

import type { GraphConfig, NormalizedGraphConfig } from './config';
import type { EdgeData, PositionedEdge as CorePositionedEdge, PositionedEdge } from './edge';
import type { NxGraphInput } from './graph';
import type { LayoutOptions } from './layout';
import type { NodeData, PositionedNode as CorePositionedNode } from './node';
import type { RouteEdgesOptions } from './routing';
import type { GraphViewport } from './viewport';

type AnyNode = CorePositionedNode;
type AnyEdge = CorePositionedEdge;
type AnyNodeData = NodeData;
type AnyEdgeData = EdgeData;

export interface PathHoverOptions {
  readonly pathKey?: string | undefined;
  readonly playerKey?: string | undefined;
}

export interface VertexComponentProps<TNode extends AnyNode = CorePositionedNode> {
  readonly node: TNode;
  readonly isSelected?: boolean | undefined;
  readonly isHovered?: boolean | undefined;
  readonly isHoveredIn?: boolean | undefined;
  readonly isHoveredOut?: boolean | undefined;
  readonly isHoveredBoth?: boolean | undefined;
  readonly activePathKey?: string | undefined;
  readonly activePathNodeIds?: ReadonlySet<string> | undefined;
  readonly hoverInColor?: string | undefined;
  readonly hoverOutColor?: string | undefined;
  readonly hoverBothColor?: string | undefined;
  /** Resolved from `Graph` `config.theme` — override per-vertex in custom renderers if needed. */
  readonly nodeFill?: string | undefined;
  readonly nodeStroke?: string | undefined;
  readonly nodeTextColor?: string | undefined;
  readonly nodeTextSize?: number | undefined;
  readonly nodeRadius?: number | undefined;
  readonly nodeBorderWidth?: number | undefined;
  readonly fontFamily?: string | undefined;
  readonly onPathHover?:
    ((sourceIndex: number | null, opts?: PathHoverOptions) => void) | undefined;
  readonly onPathLeave?: (() => void) | undefined;
}

export interface EdgePathProps<TEdge extends PositionedEdge = PositionedEdge> {
  readonly edge: TEdge;
  readonly color: string;
  readonly width: number;
  readonly curveEdges: boolean;
  readonly curveStrength: number;
  readonly markerEnd?: string | undefined;
  readonly isHovered?: boolean | undefined;
  readonly isSelected?: boolean | undefined;
  readonly hoverColor: string;
  readonly selectionColor?: string | undefined;
  readonly labelColor?: string | undefined;
  readonly selectionMarker?: string | undefined;
  readonly hoverMarker?: string | undefined;
  readonly hoverEnabled: boolean;
  readonly selectionEnabled?: boolean | undefined;
  readonly hoverStrokeWidth?: number | undefined;
  readonly selectedStrokeWidth?: number | undefined;
  readonly hitStrokeWidth?: number | undefined;
  readonly onHoverChange?: ((hovered: boolean) => void) | undefined;
  readonly onClick?: (() => void) | undefined;
}

export type VertexComponent<TNode extends AnyNode = CorePositionedNode> = ComponentType<
  VertexComponentProps<TNode>
>;
export type EdgeComponent<TEdge extends PositionedEdge = PositionedEdge> = ComponentType<
  EdgePathProps<TEdge>
>;

export type { GraphViewport } from './viewport';

export interface GraphSelection {
  readonly nodeIds: readonly string[];
  readonly edgeIds: readonly string[];
}

export interface GraphRenderContext<
  TGraph extends NxGraphInput = NxGraphInput,
  TNode extends AnyNode = CorePositionedNode,
  TEdge extends AnyEdge = CorePositionedEdge,
> {
  readonly graph: TGraph;
  readonly nodes: readonly TNode[];
  readonly edges: readonly TEdge[];
  /** Normalized configuration that is always available at render time. */
  readonly config: NormalizedGraphConfig;
  readonly viewport: GraphViewport;
  readonly selection: GraphSelection;
}

/**
 * Tree-shakeable alternative available as `SelectionModeValues`/`SelectionModeValue`.
 * Prefer those for new code — plain string literals are assignable to `SelectionModeValue`.
 */
export enum SelectionMode {
  Single = 'single',
  Multiple = 'multiple',
}

export const SelectionModeValues = { Single: 'single', Multiple: 'multiple' } as const;
export type SelectionModeValue = (typeof SelectionModeValues)[keyof typeof SelectionModeValues];

export enum GraphHoverTrigger {
  Pointer = 'pointer',
  Path = 'path',
}

export interface GraphHoverMeta {
  readonly viewport: GraphViewport;
  readonly selection: GraphSelection;
  readonly trigger: GraphHoverTrigger;
}

export interface GraphSearchResults {
  readonly nodeIds: readonly string[];
  readonly edgeIds: readonly string[];
}

/**
 * Tree-shakeable alternative available as `GraphErrorPhaseValues`/`GraphErrorPhaseValue`.
 * Prefer those for new code.
 */
export enum GraphErrorPhase {
  Layout = 'layout',
  LayoutOverride = 'layout-override',
  Routing = 'routing',
  RoutingOverride = 'routing-override',
  Interaction = 'interaction',
  Render = 'render',
}

export const GraphErrorPhaseValues = {
  Layout: 'layout',
  LayoutOverride: 'layout-override',
  Routing: 'routing',
  RoutingOverride: 'routing-override',
  Interaction: 'interaction',
  Render: 'render',
} as const;
export type GraphErrorPhaseValue =
  (typeof GraphErrorPhaseValues)[keyof typeof GraphErrorPhaseValues];

export interface GraphErrorContext<TGraph extends NxGraphInput = NxGraphInput> {
  readonly graph: TGraph;
  readonly phase: GraphErrorPhase;
}

export interface GraphHandle {
  readonly fitView: (padding?: number) => void;
  readonly centerOnNode: (nodeId: string) => void;
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
  readonly zoomTo: (zoom: number) => void;
  readonly resetViewport: () => void;
  readonly getViewport: () => GraphViewport;
  readonly setViewport: (
    next:
      Partial<GraphViewport> | ((current: GraphViewport) => Partial<GraphViewport> | GraphViewport)
  ) => void;
  readonly clearSelection: () => void;
  /** Read the current selection without a re-render. */
  readonly getSelection: () => GraphSelection;
  /** Read the current collapsed node IDs without a re-render. */
  readonly getCollapsedNodeIds: () => readonly string[];
  /** Read the node IDs whose async expansion is currently in-flight. */
  readonly getPendingExpansionNodeIds: () => ReadonlySet<string>;
}

export interface DragState {
  readonly active: boolean;
  readonly startX: number;
  readonly startY: number;
  readonly originX: number;
  readonly originY: number;
}

export enum GraphControlsPosition {
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
}

/** Grouped interaction flags (flat props on {@link GraphProps} remain supported). */
export interface GraphInteractionOptions {
  readonly panEnabled?: boolean | undefined;
  readonly zoomEnabled?: boolean | undefined;
  readonly pinchZoomEnabled?: boolean | undefined;
  readonly keyboardNavigation?: boolean | undefined;
  readonly marqueeSelectionEnabled?: boolean | undefined;
}

/** Grouped viewport / control options (flat props on {@link GraphProps} remain supported). */
export interface GraphViewportOptions {
  readonly minZoom?: number | undefined;
  readonly maxZoom?: number | undefined;
  readonly zoomStep?: number | undefined;
  readonly translateExtent?:
    readonly [readonly [number, number], readonly [number, number]] | undefined;
  readonly showControls?: boolean | undefined;
  readonly controlsPosition?: GraphControlsPosition | undefined;
}

export interface GraphProps<
  TGraph extends NxGraphInput = NxGraphInput,
  TNode extends AnyNode = CorePositionedNode,
  TEdge extends AnyEdge = CorePositionedEdge,
  TNodeRecord extends AnyNodeData = NodeData,
  TEdgeRecord extends AnyEdgeData = EdgeData,
> {
  readonly graph: TGraph;
  readonly vertexComponent: VertexComponent<TNode>;
  readonly edgeComponent?: EdgeComponent<TEdge> | undefined;
  readonly config?: GraphConfig | undefined;
  readonly viewport?: GraphViewport | undefined;
  readonly defaultViewport?: Partial<GraphViewport> | undefined;
  readonly onViewportChange?: ((viewport: GraphViewport) => void) | undefined;
  readonly fitViewOnMount?: boolean | undefined;
  readonly fitViewPadding?: number | undefined;
  /**
   * @deprecated Use {@link GraphViewportOptions.minZoom} via the `viewportOptions` prop instead.
   * Flat props take precedence over grouped options when both are set.
   */
  readonly minZoom?: number | undefined;
  /**
   * @deprecated Use {@link GraphViewportOptions.maxZoom} via the `viewportOptions` prop instead.
   * Flat props take precedence over grouped options when both are set.
   */
  readonly maxZoom?: number | undefined;
  /**
   * @deprecated Use {@link GraphViewportOptions.zoomStep} via the `viewportOptions` prop instead.
   * Flat props take precedence over grouped options when both are set.
   */
  readonly zoomStep?: number | undefined;
  /**
   * World-space bounding box `[[minX, minY], [maxX, maxY]]` the user cannot pan outside of.
   * @deprecated Use {@link GraphViewportOptions.translateExtent} via the `viewportOptions` prop instead.
   * Flat props take precedence over grouped options when both are set.
   */
  readonly translateExtent?:
    readonly [readonly [number, number], readonly [number, number]] | undefined;
  /** Prefer grouped {@link GraphInteractionOptions}; flat props override these when both are set. */
  readonly interaction?: GraphInteractionOptions | undefined;
  /** Prefer grouped {@link GraphViewportOptions}; flat props override these when both are set. */
  readonly viewportOptions?: GraphViewportOptions | undefined;
  /** When true (default), nodes and edges outside the viewport are not mounted. */
  readonly viewportCulling?: boolean | undefined;
  /** Called after layout when positioned nodes/edges change. */
  readonly onLayoutChange?:
    ((context: GraphRenderContext<TGraph, TNode, TEdge>) => void) | undefined;
  /**
   * @deprecated Use {@link GraphInteractionOptions.panEnabled} via the `interaction` prop instead.
   * Flat props take precedence over grouped options when both are set.
   */
  readonly panEnabled?: boolean | undefined;
  /**
   * @deprecated Use {@link GraphInteractionOptions.zoomEnabled} via the `interaction` prop instead.
   * Flat props take precedence over grouped options when both are set.
   */
  readonly zoomEnabled?: boolean | undefined;
  /**
   * @deprecated Use {@link GraphInteractionOptions.pinchZoomEnabled} via the `interaction` prop instead.
   * Flat props take precedence over grouped options when both are set.
   */
  readonly pinchZoomEnabled?: boolean | undefined;
  /**
   * @deprecated Use {@link GraphInteractionOptions.keyboardNavigation} via the `interaction` prop instead.
   * Flat props take precedence over grouped options when both are set.
   */
  readonly keyboardNavigation?: boolean | undefined;
  /**
   * @deprecated Use {@link GraphViewportOptions.showControls} via the `viewportOptions` prop instead.
   * Flat props take precedence over grouped options when both are set.
   */
  readonly showControls?: boolean | undefined;
  /**
   * @deprecated Use {@link GraphViewportOptions.controlsPosition} via the `viewportOptions` prop instead.
   * Flat props take precedence over grouped options when both are set.
   */
  readonly controlsPosition?: GraphControlsPosition | undefined;
  /**
   * @deprecated Use {@link GraphInteractionOptions.marqueeSelectionEnabled} via the `interaction` prop instead.
   * Flat props take precedence over grouped options when both are set.
   */
  readonly marqueeSelectionEnabled?: boolean | undefined;
  readonly focusedNodeId?: string | null | undefined;
  readonly defaultFocusedNodeId?: string | null | undefined;
  readonly onFocusedNodeChange?: ((nodeId: string | null) => void) | undefined;
  readonly collapsedNodeIds?: readonly string[] | undefined;
  readonly defaultCollapsedNodeIds?: readonly string[] | undefined;
  readonly onCollapsedNodeIdsChange?: ((nodeIds: readonly string[]) => void) | undefined;
  readonly toggleCollapseOnNodeDoubleClick?: boolean | undefined;
  readonly hiddenNodeIds?: readonly string[] | undefined;
  readonly onNodeExpand?: ((nodeId: string) => void | Promise<void>) | undefined;
  readonly onNodeCollapse?: ((nodeId: string) => void) | undefined;
  readonly searchQuery?: string | undefined;
  readonly hideUnmatchedSearch?: boolean | undefined;
  readonly searchPredicate?: ((node: TNodeRecord, query: string) => boolean) | undefined;
  readonly highlightedNodeIds?: readonly string[] | undefined;
  readonly highlightedEdgeIds?: readonly string[] | undefined;
  readonly highlightColor?: string | undefined;
  readonly highlightStrategy?:
    | ((context: {
        readonly nodes: readonly TNodeRecord[];
        readonly edges: readonly TEdgeRecord[];
        readonly query: string;
        readonly matchedNodeIds: readonly string[];
        readonly matchedEdgeIds: readonly string[];
      }) => Partial<GraphSearchResults>)
    | undefined;
  readonly onSearchResultsChange?: ((results: GraphSearchResults) => void) | undefined;
  readonly selectedNodeIds?: readonly string[] | undefined;
  readonly selectedEdgeIds?: readonly string[] | undefined;
  readonly defaultSelectedNodeIds?: readonly string[] | undefined;
  readonly defaultSelectedEdgeIds?: readonly string[] | undefined;
  readonly onSelectionChange?: ((selection: GraphSelection) => void) | undefined;
  readonly selectionMode?: SelectionMode | undefined;
  readonly nodeSelectionEnabled?: boolean | undefined;
  readonly edgeSelectionEnabled?: boolean | undefined;
  readonly selectionColor?: string | undefined;
  readonly edgeSelectionColor?: string | undefined;
  readonly layoutNodesOverride?: ((options: LayoutOptions) => readonly TNode[]) | undefined;
  readonly routeEdgesOverride?:
    | ((
        nodes: readonly TNode[],
        edges: readonly TEdgeRecord[],
        options?: RouteEdgesOptions
      ) => readonly TEdge[])
    | undefined;
  readonly renderBackground?:
    ((context: GraphRenderContext<TGraph, TNode, TEdge>) => ReactNode) | undefined;
  readonly renderOverlay?:
    ((context: GraphRenderContext<TGraph, TNode, TEdge>) => ReactNode) | undefined;
  readonly onError?: ((error: Error, context: GraphErrorContext<TGraph>) => void) | undefined;
  readonly onNodeHoverChange?:
    ((node: TNode, hovered: boolean, meta: GraphHoverMeta) => void) | undefined;
  readonly onEdgeHoverChange?:
    ((edge: TEdge, hovered: boolean, meta: GraphHoverMeta) => void) | undefined;
  readonly onNodeClick?: ((node: TNode) => void) | undefined;
  readonly onEdgeClick?: ((edge: TEdge) => void) | undefined;
  /** Accessible label for the SVG element. Defaults to `"Graph"`. Expose when rendering multiple graphs on a page. */
  readonly ariaLabel?: string | undefined;
}
