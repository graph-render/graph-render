import type {
  EdgeData,
  EdgeId,
  GraphConfig,
  LayoutOptions,
  NodeData,
  NormalizedGraphConfig,
  NxGraphInput,
  PathTraversalResult,
  PositionedEdge,
  PositionedNode,
  RouteEdgesOptions,
} from '@graph-render/types';

import type { GraphModelError } from './graph';

// ── viewport ────────────────────────────────────────────────────────────────

export interface GraphBounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
}

// ── pathHighlight ────────────────────────────────────────────────────────────

export interface FocusedPath {
  readonly nodeId: string;
  readonly sourceIndex: number | null;
  readonly pathKey?: string | undefined;
}

// ── pointer ──────────────────────────────────────────────────────────────────

export interface PointerState {
  readonly x: number;
  readonly y: number;
}

export interface PinchState {
  readonly active: boolean;
  readonly startDistance: number;
  readonly startZoom: number;
  readonly worldX: number;
  readonly worldY: number;
}

export interface SelectionBox {
  readonly startX: number;
  readonly startY: number;
  readonly endX: number;
  readonly endY: number;
}

// ── graphHoverState ──────────────────────────────────────────────────────────

export interface HoveredNodeState {
  readonly in: boolean;
  readonly out: boolean;
}

export interface HoveredNodeStateParams {
  readonly hoverHighlight: boolean;
  readonly focusedPath: unknown;
  readonly hoveredEdgeId: EdgeId | null;
  readonly hoveredNodeId: string | null;
  readonly edgeById: ReadonlyMap<EdgeId, PositionedEdge>;
  readonly edgesByNodeId: ReadonlyMap<string, readonly PositionedEdge[]>;
  readonly pathHighlight: PathTraversalResult | null;
}

// ── graphHoverMaps ───────────────────────────────────────────────────────────

export interface PositionedHoverNode {
  readonly id: string;
  readonly position: { readonly x: number; readonly y: number };
  readonly meta?: Record<string, unknown> | undefined;
}

// ── columns ──────────────────────────────────────────────────────────────────

export interface NodeColumn<TNode extends PositionedNode = PositionedNode> {
  readonly centerX: number;
  readonly nodes: readonly TNode[];
}

// ── graphModelLayout ─────────────────────────────────────────────────────────

export interface ResolvePositionedNodesOptions {
  readonly allowDegradedGraph: boolean;
  readonly graph: NxGraphInput;
  readonly layoutNodesOverride?:
    ((options: LayoutOptions) => readonly PositionedNode[]) | undefined;
  readonly layoutOptions: LayoutOptions;
  readonly visibleNodes: readonly NodeData[];
}

export interface ResolvePositionedNodesResult {
  readonly errors: readonly GraphModelError[];
  readonly nodes: readonly PositionedNode[];
}

// ── graphModelOptions ────────────────────────────────────────────────────────

export interface GraphLayoutOptionsInput {
  readonly config: NormalizedGraphConfig;
  readonly edges: readonly EdgeData[];
  readonly mergedTheme: NonNullable<GraphConfig['theme']>;
  readonly nodes: readonly NodeData[];
}

// ── graphModelRouting ────────────────────────────────────────────────────────

export interface ResolvePositionedEdgesOptions {
  readonly allowDegradedGraph: boolean;
  readonly edgeRoutingOptions: RouteEdgesOptions;
  readonly graph: NxGraphInput;
  readonly positionedNodes: readonly PositionedNode[];
  readonly routeEdgesOverride?:
    | ((
        nodes: readonly PositionedNode[],
        edges: readonly EdgeData[],
        options?: RouteEdgesOptions
      ) => readonly PositionedEdge[])
    | undefined;
  readonly visibleEdges: readonly EdgeData[];
}

export interface ResolvePositionedEdgesResult {
  readonly edges: readonly PositionedEdge[];
  readonly errors: readonly GraphModelError[];
}

// ── graphNodeFrame ───────────────────────────────────────────────────────────

export interface GraphNodeFrameStateOptions {
  readonly isSelected: boolean;
  readonly isHighlighted: boolean;
  readonly highlightColor: string;
  readonly selectionColor: string;
  readonly nodeBorderColor?: string | undefined;
  readonly nodeBorderWidth: number;
  readonly hoverNodeBorderColor: string;
  readonly hoverNodeBothColor: string;
  readonly hoverNodeInColor: string;
  readonly hoverNodeOutColor: string;
  readonly hoverNodeHighlight: boolean;
  readonly isHoveredIn: boolean;
  readonly isHoveredOut: boolean;
}

// ── pathKeys ─────────────────────────────────────────────────────────────────

export interface NodeWithPathMeta {
  readonly id: string;
  readonly meta?: Record<string, unknown> | undefined;
}

// ── searchMatching ───────────────────────────────────────────────────────────

export interface HighlightContext<
  TNode extends NodeData = NodeData,
  TEdge extends EdgeData = EdgeData,
> {
  readonly edges: readonly TEdge[];
  readonly matchedEdgeIds: readonly string[];
  readonly matchedNodeIds: readonly string[];
  readonly nodes: readonly TNode[];
  readonly query: string;
}

// ── selection ────────────────────────────────────────────────────────────────

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}
