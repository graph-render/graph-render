import type { NormalizedGraphConfig, PositionedEdge, PositionedNode } from '@graph-render/types';
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';

import { DEFAULT_VIEWPORT, FIT_BOUNDS_MARGIN } from '../constants/graph';
import type { UseGraphViewportControllerOptions } from '../models/hookContracts';
import {
  expandBounds,
  getEdgeLabelBounds,
  getLabelBounds,
  mergeBounds,
} from '../utils/graphBounds';
import {
  centerViewportOnNode,
  getFitViewport,
  getGraphBounds,
  type GraphBounds,
} from '../utils/viewport';

const getContentBounds = (
  cfg: NormalizedGraphConfig,
  positionedEdges: readonly PositionedEdge[],
  positionedNodes: readonly PositionedNode[]
): GraphBounds | null => {
  const graphBounds = getGraphBounds(positionedNodes);
  const bounds = mergeBounds(
    mergeBounds(
      graphBounds,
      getLabelBounds(
        positionedNodes,
        cfg.layout,
        cfg.layoutDirection,
        cfg.labels,
        cfg.autoLabels,
        cfg.labelOffset
      )
    ),
    getEdgeLabelBounds(positionedEdges)
  );

  return bounds ? expandBounds(bounds, FIT_BOUNDS_MARGIN) : bounds;
};

export const useGraphViewportController = ({
  cfg,
  fitViewOnMount,
  fitViewPadding,
  graph,
  positionedEdges,
  positionedNodeMap,
  positionedNodes,
  ref,
  safeMaxZoom,
  safeMinZoom,
  svgRef,
  updateSelection,
  updateViewport,
  viewport,
  zoomStep,
  selectionRef,
  collapsedIds,
  pendingExpansionNodeSet,
}: UseGraphViewportControllerOptions) => {
  const hasAppliedInitialFitViewRef = useRef(false);
  const contentBounds = useMemo(
    () => getContentBounds(cfg, positionedEdges, positionedNodes),
    [cfg, positionedEdges, positionedNodes]
  );

  const getViewportDimensions = useCallback(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return { width: cfg.width, height: cfg.height };

    const containerRect = svgElement.parentElement?.getBoundingClientRect();
    const rect = containerRect ?? svgElement.getBoundingClientRect();
    return { width: rect.width || cfg.width, height: rect.height || cfg.height };
  }, [cfg.height, cfg.width, svgRef]);

  const fitView = useCallback(
    (padding: number = fitViewPadding) => {
      const { width, height } = getViewportDimensions();
      updateViewport(
        getFitViewport(contentBounds, width, height, padding, safeMinZoom, safeMaxZoom)
      );
    },
    [contentBounds, fitViewPadding, getViewportDimensions, safeMaxZoom, safeMinZoom, updateViewport]
  );

  const centerOnNode = useCallback(
    (nodeId: string) => {
      const node = positionedNodeMap.get(nodeId);
      if (!node) return;

      const { width, height } = getViewportDimensions();
      updateViewport(centerViewportOnNode(node, width, height, viewport.zoom));
    },
    [getViewportDimensions, positionedNodeMap, updateViewport, viewport.zoom]
  );

  useImperativeHandle(
    ref,
    () => ({
      fitView,
      centerOnNode,
      zoomIn: () => updateViewport((current) => ({ zoom: current.zoom + zoomStep })),
      zoomOut: () => updateViewport((current) => ({ zoom: current.zoom - zoomStep })),
      zoomTo: (zoom: number) => updateViewport({ zoom }),
      resetViewport: () => updateViewport(DEFAULT_VIEWPORT),
      getViewport: () => viewport,
      setViewport: updateViewport,
      clearSelection: () => updateSelection({ nodeIds: [], edgeIds: [] }),
      getSelection: () => selectionRef.current,
      getCollapsedNodeIds: () => collapsedIds,
      getPendingExpansionNodeIds: () => pendingExpansionNodeSet,
    }),
    [
      centerOnNode,
      collapsedIds,
      fitView,
      pendingExpansionNodeSet,
      selectionRef,
      updateSelection,
      updateViewport,
      viewport,
      zoomStep,
    ]
  );

  useEffect(() => {
    hasAppliedInitialFitViewRef.current = false;
  }, [graph]);

  useEffect(() => {
    if (!fitViewOnMount || hasAppliedInitialFitViewRef.current || positionedNodes.length === 0) {
      return;
    }

    hasAppliedInitialFitViewRef.current = true;
    fitView();
  }, [fitView, fitViewOnMount, positionedNodes.length]);

  return { centerOnNode, contentBounds, fitView, getViewportDimensions };
};
