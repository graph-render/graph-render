import { fromTypedNxGraph, normalizeEdges } from '@graph-render/core';
import type { NodeData, PositionedEdge, PositionedNode, Size } from '@graph-render/types';
import { GraphFailureBehavior, NodeSizingMode } from '@graph-render/types';
import { useCallback, useDeferredValue, useEffect, useMemo, useReducer, useRef } from 'react';

import type { GraphModelResult, UseGraphModelOptions } from '../models/graph';
import { resolvePositionedNodes } from '../utils/graphModelLayout';
import { buildEdgeRoutingOptions, buildGraphLayoutOptions } from '../utils/graphModelOptions';
import { resolvePositionedEdges } from '../utils/graphModelRouting';
import { applyMeasuredNodeSizes, pruneMeasuredNodeSizes } from '../utils/graphNodeMeasurements';
import { useGraphSearchState } from './useGraphSearchState';
import { useLatestRef } from './useLatestRef';

export type { GraphModelResult, UseGraphModelOptions } from '../models/graph';

// ---------------------------------------------------------------------------
// Reducer for measured node sizes (eliminates the extra render from useEffect)
// ---------------------------------------------------------------------------

type MeasuredSizesState = Record<string, Size>;

type MeasuredSizesAction =
  | { readonly type: 'PRUNE'; readonly activeNodes: readonly NodeData[] }
  | { readonly type: 'UPDATE_SIZE'; readonly nodeId: string; readonly size: Size };

const measuredSizesReducer = (
  state: MeasuredSizesState,
  action: MeasuredSizesAction
): MeasuredSizesState => {
  switch (action.type) {
    case 'PRUNE': {
      return pruneMeasuredNodeSizes(state, action.activeNodes);
    }
    case 'UPDATE_SIZE': {
      const previous = state[action.nodeId];
      if (previous?.width === action.size.width && previous?.height === action.size.height) {
        return state;
      }
      return { ...state, [action.nodeId]: action.size };
    }
  }
};

// ---------------------------------------------------------------------------

export const useGraphModel = ({
  graph,
  config,
  mergedTheme,
  collapsedIds,
  hiddenNodeIds,
  searchQuery,
  hideUnmatchedSearch = false,
  searchPredicate,
  highlightedNodeIds,
  highlightedEdgeIds,
  highlightStrategy,
  onSearchResultsChange,
  layoutNodesOverride,
  routeEdgesOverride,
  onError,
}: UseGraphModelOptions): GraphModelResult => {
  const [measuredNodeSizes, dispatchMeasuredSizes] = useReducer(
    measuredSizesReducer,
    {} as MeasuredSizesState
  );
  const onErrorRef = useLatestRef(onError);
  const reportedErrorsRef = useRef<WeakSet<Error>>(new WeakSet());
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const { nodes: sourceNodes, edges: sourceEdges } = useMemo(
    () =>
      fromTypedNxGraph(graph, config.defaultEdgeType, {
        inputValidationMode: config.inputValidationMode,
      }),
    [config.defaultEdgeType, config.inputValidationMode, graph]
  );

  const allowDegradedGraph = config.failureBehavior === GraphFailureBehavior.Degrade;

  const nodesWithMeasuredSize = useMemo(
    () => applyMeasuredNodeSizes(sourceNodes, measuredNodeSizes),
    [measuredNodeSizes, sourceNodes]
  );

  // Prune stale measured sizes in the same render pass as topology changes (no extra render).
  useMemo(() => {
    dispatchMeasuredSizes({ type: 'PRUNE', activeNodes: sourceNodes });
  }, [sourceNodes]);

  const normalizedEdges = useMemo(
    () => normalizeEdges(sourceEdges, config.defaultEdgeType),
    [config.defaultEdgeType, sourceEdges]
  );

  const searchState = useGraphSearchState({
    nodes: nodesWithMeasuredSize,
    edges: normalizedEdges,
    collapsedIds,
    hiddenNodeIds,
    searchQuery: deferredSearchQuery,
    hideUnmatchedSearch,
    searchPredicate,
    highlightedNodeIds,
    highlightedEdgeIds,
    highlightStrategy,
    onSearchResultsChange,
  });
  const {
    childNodeIdsByParent,
    effectiveHighlightedEdgeSet,
    effectiveHighlightedNodeSet,
    visibleEdges,
    visibleNodes,
  } = searchState;

  // Defer layout computation so search/collapse interactions stay interactive.
  const deferredVisibleNodes = useDeferredValue(visibleNodes);
  const deferredVisibleEdges = useDeferredValue(visibleEdges);

  const layoutOptions = useMemo(
    () =>
      buildGraphLayoutOptions({
        config,
        edges: deferredVisibleEdges,
        mergedTheme,
        nodes: deferredVisibleNodes,
      }),
    [config, mergedTheme, deferredVisibleEdges, deferredVisibleNodes]
  );

  const handleNodeMeasure = useCallback(
    (nodeId: string, size: Size) => {
      if (config.nodeSizing !== NodeSizingMode.Measured) {
        return;
      }

      dispatchMeasuredSizes({ type: 'UPDATE_SIZE', nodeId, size });
    },
    [config.nodeSizing]
  );

  const positionedNodeResult = useMemo(
    () =>
      resolvePositionedNodes({
        allowDegradedGraph,
        graph,
        layoutNodesOverride,
        layoutOptions,
        visibleNodes: deferredVisibleNodes,
      }),
    [allowDegradedGraph, graph, layoutNodesOverride, layoutOptions, deferredVisibleNodes]
  );
  const positionedNodes: readonly PositionedNode[] = positionedNodeResult.nodes;

  useEffect(() => {
    for (const { context, error } of positionedNodeResult.errors) {
      if (reportedErrorsRef.current.has(error)) {
        continue;
      }
      reportedErrorsRef.current.add(error);
      onErrorRef.current?.(error, context);
    }
  }, [onErrorRef, positionedNodeResult.errors]);

  const edgeRoutingOptions = useMemo(() => buildEdgeRoutingOptions(config), [config]);

  const positionedEdgeResult = useMemo(
    () =>
      resolvePositionedEdges({
        allowDegradedGraph,
        edgeRoutingOptions,
        graph,
        positionedNodes,
        routeEdgesOverride,
        visibleEdges: deferredVisibleEdges,
      }),
    [
      allowDegradedGraph,
      edgeRoutingOptions,
      graph,
      positionedNodes,
      routeEdgesOverride,
      deferredVisibleEdges,
    ]
  );
  const positionedEdges: readonly PositionedEdge[] = positionedEdgeResult.edges;

  useEffect(() => {
    for (const { context, error } of positionedEdgeResult.errors) {
      if (reportedErrorsRef.current.has(error)) {
        continue;
      }
      reportedErrorsRef.current.add(error);
      onErrorRef.current?.(error, context);
    }
  }, [onErrorRef, positionedEdgeResult.errors]);

  return {
    childNodeIdsByParent,
    effectiveHighlightedEdgeSet,
    effectiveHighlightedNodeSet,
    handleNodeMeasure,
    positionedEdges,
    positionedNodes,
    visibleEdges: deferredVisibleEdges,
    visibleNodesWithMeasuredSize: deferredVisibleNodes,
  };
};
