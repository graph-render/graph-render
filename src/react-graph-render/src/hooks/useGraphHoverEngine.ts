import type { PositionedEdge, PositionedNode } from '@graph-render/types';
import type { GraphHoverMeta, GraphSelection, GraphViewport } from '@graph-render/types/react';

import { useGraphHover } from './useGraphHover';
import { useGraphHoverHandlers } from './useGraphHoverHandlers';

export interface UseGraphHoverEngineOptions {
  readonly hoverHighlight: boolean;
  readonly positionedNodes: readonly PositionedNode[];
  readonly positionedEdges: readonly PositionedEdge[];
  readonly positionedNodeMap: ReadonlyMap<string, PositionedNode>;
  readonly positionedEdgeMap: ReadonlyMap<string, PositionedEdge>;
  readonly selection: GraphSelection;
  readonly viewport: GraphViewport;
  readonly onNodeHoverChange:
    | ((node: PositionedNode, hovered: boolean, meta: GraphHoverMeta) => void)
    | undefined;
  readonly onEdgeHoverChange:
    | ((edge: PositionedEdge, hovered: boolean, meta: GraphHoverMeta) => void)
    | undefined;
}

/**
 * Aggregates hover state (`useGraphHover`) and the corresponding event handlers
 * (`useGraphHoverHandlers`) into a single cohesive unit.
 *
 * Previously, `useGraphController` had to thread `setHoveredEdgeId`, `setHoveredNodeId`,
 * and `setFocusedPath` from `useGraphHover` into `useGraphHoverHandlers` manually.
 * This hook encapsulates that wiring and exposes only the stable public surface.
 */
export const useGraphHoverEngine = ({
  hoverHighlight,
  positionedNodes,
  positionedEdges,
  positionedNodeMap,
  positionedEdgeMap,
  selection,
  viewport,
  onNodeHoverChange,
  onEdgeHoverChange,
}: UseGraphHoverEngineOptions) => {
  const {
    hoveredEdgeId,
    setHoveredEdgeId,
    hoveredNodeId,
    setHoveredNodeId,
    focusedPath,
    setFocusedPath,
    pathHighlight,
    hoveredNodeStates,
    edgesForRender,
  } = useGraphHover(positionedNodes, positionedEdges, hoverHighlight);

  const {
    handleEdgeHoverChange,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handlePathHover,
    handlePathLeave,
  } = useGraphHoverHandlers({
    hoverHighlight,
    onEdgeHoverChange,
    onNodeHoverChange,
    positionedEdgeMap,
    positionedNodeMap,
    selection,
    setFocusedPath,
    setHoveredEdgeId,
    setHoveredNodeId,
    viewport,
  });

  return {
    // State exposed for downstream consumers (e.g. edge culling, keyboard nav)
    hoveredEdgeId,
    hoveredNodeId,
    focusedPath,
    setFocusedPath,
    pathHighlight,
    hoveredNodeStates,
    edgesForRender,
    // Handlers exposed for component event wiring
    handleEdgeHoverChange,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handlePathHover,
    handlePathLeave,
  };
};
