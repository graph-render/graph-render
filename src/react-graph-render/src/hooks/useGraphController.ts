/* eslint-disable @typescript-eslint/no-deprecated -- useGraphController destructures deprecated flat props from GraphProps to bridge them to the new grouped-options API via resolveGraphProps. */
import { normalizeGraphConfig } from '@graph-render/core';
import { NodeSizingMode } from '@graph-render/types';
import type { GraphHandle, GraphProps, GraphRenderContext } from '@graph-render/types/react';
import { SelectionMode } from '@graph-render/types/react';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef } from 'react';

import { EdgePath } from '../components/EdgePath';
import type { GraphCanvasProps } from '../components/GraphCanvas';
import {
  DEFAULT_CONTROLS_POSITION,
  DEFAULT_MAX_ZOOM,
  DEFAULT_MIN_ZOOM,
  DEFAULT_SELECTION,
  DEFAULT_SELECTION_COLOR,
  DEFAULT_VIEWPORT,
  DEFAULT_ZOOM_STEP,
} from '../constants/graph';
import { createNodeMeasurementScheduler } from '../utils/nodeMeasurementScheduler';
import { resolveInteractionFlags, resolveViewportFlags } from '../utils/resolveGraphProps';
import { normalizeRect } from '../utils/selection';
import { normalizeZoomRange } from '../utils/viewport';
import { useGraphCollapse } from './useGraphCollapse';
import { useGraphCollapseHandlers } from './useGraphCollapseHandlers';
import { useGraphCulling } from './useGraphCulling';
import { useGraphHoverEngine } from './useGraphHoverEngine';
import { useGraphKeyboardNavigation } from './useGraphKeyboardNavigation';
import { useGraphModel } from './useGraphModel';
import { useGraphPointerInteractions } from './useGraphPointerInteractions';
import { useGraphRenderBindings } from './useGraphRenderBindings';
import { useGraphSelectionEngine } from './useGraphSelectionEngine';
import { useGraphViewportController } from './useGraphViewportController';
import { useGraphViewState } from './useGraphViewState';
import { useGraphWheelZoomListener } from './useGraphWheelZoomListener';
import { useStableConfig } from './useStableConfig';

export const useGraphController = (
  props: GraphProps,
  ref: React.ForwardedRef<GraphHandle>
): GraphCanvasProps => {
  const {
    graph,
    vertexComponent: Vertex,
    edgeComponent: EdgeComponent = EdgePath,
    config,
    interaction,
    viewportOptions,
    viewportCulling = true,
    onLayoutChange,
    viewport: controlledViewport,
    defaultViewport,
    onViewportChange,
    fitViewOnMount = false,
    fitViewPadding = 32,
    minZoom: minZoomProp,
    maxZoom: maxZoomProp,
    zoomStep: zoomStepProp,
    translateExtent: translateExtentProp,
    panEnabled: panEnabledProp,
    zoomEnabled: zoomEnabledProp,
    pinchZoomEnabled: pinchZoomEnabledProp,
    keyboardNavigation: keyboardNavigationProp,
    showControls: showControlsProp,
    controlsPosition: controlsPositionProp,
    marqueeSelectionEnabled: marqueeSelectionEnabledProp,
    focusedNodeId: controlledFocusedNodeId,
    defaultFocusedNodeId = null,
    onFocusedNodeChange,
    collapsedNodeIds,
    defaultCollapsedNodeIds,
    onCollapsedNodeIdsChange,
    toggleCollapseOnNodeDoubleClick = true,
    hiddenNodeIds,
    onNodeExpand,
    onNodeCollapse,
    searchQuery,
    hideUnmatchedSearch = false,
    searchPredicate,
    highlightedNodeIds,
    highlightedEdgeIds,
    highlightColor = '#f59e0b',
    highlightStrategy,
    onSearchResultsChange,
    selectedNodeIds,
    selectedEdgeIds,
    defaultSelectedNodeIds,
    defaultSelectedEdgeIds,
    onSelectionChange,
    selectionMode = SelectionMode.Single,
    nodeSelectionEnabled = true,
    edgeSelectionEnabled = true,
    selectionColor = DEFAULT_SELECTION_COLOR,
    edgeSelectionColor,
    layoutNodesOverride,
    routeEdgesOverride,
    renderBackground,
    renderOverlay,
    onError,
    onNodeHoverChange,
    onEdgeHoverChange,
    onNodeClick,
    onEdgeClick,
    ariaLabel,
  } = props;

  const { panEnabled, zoomEnabled, pinchZoomEnabled, keyboardNavigation, marqueeSelectionEnabled } =
    resolveInteractionFlags(interaction, {
      panEnabled: panEnabledProp,
      zoomEnabled: zoomEnabledProp,
      pinchZoomEnabled: pinchZoomEnabledProp,
      keyboardNavigation: keyboardNavigationProp,
      marqueeSelectionEnabled: marqueeSelectionEnabledProp,
    });
  const {
    minZoom = DEFAULT_MIN_ZOOM,
    maxZoom = DEFAULT_MAX_ZOOM,
    zoomStep = DEFAULT_ZOOM_STEP,
    translateExtent,
    showControls,
    controlsPosition = DEFAULT_CONTROLS_POSITION,
  } = resolveViewportFlags(viewportOptions, {
    minZoom: minZoomProp,
    maxZoom: maxZoomProp,
    zoomStep: zoomStepProp,
    translateExtent: translateExtentProp,
    showControls: showControlsProp,
    controlsPosition: controlsPositionProp,
  });

  const zoomRange = useMemo(() => normalizeZoomRange(minZoom, maxZoom), [minZoom, maxZoom]);
  const safeMinZoom = zoomRange.minZoom;
  const safeMaxZoom = zoomRange.maxZoom;
  const stableConfig = useStableConfig(config);
  const svgRef = useRef<SVGSVGElement>(null);
  const contentRef = useRef<SVGGElement>(null);
  const measurementScheduler = useMemo(() => createNodeMeasurementScheduler(), []);

  useEffect(() => {
    return () => {
      measurementScheduler.cancelAll();
    };
  }, [measurementScheduler]);

  const cfg = useMemo(() => normalizeGraphConfig(stableConfig), [stableConfig]);
  const effectiveViewportCulling = viewportCulling && cfg.nodeSizing !== NodeSizingMode.Measured;
  const mergedTheme = cfg.theme;

  const {
    viewport,
    viewportRef,
    selection,
    selectionRef,
    focusedNodeId,
    updateViewport,
    updateSelection,
    updateFocusedNode,
  } = useGraphViewState({
    controlledViewport,
    defaultViewport,
    safeMinZoom,
    safeMaxZoom,
    onViewportChange,
    selectedNodeIds,
    selectedEdgeIds,
    defaultSelectedNodeIds,
    defaultSelectedEdgeIds,
    onSelectionChange,
    controlledFocusedNodeId,
    defaultFocusedNodeId,
    onFocusedNodeChange,
  });

  const {
    collapsedIds,
    collapsedNodeSet,
    pendingExpansionNodeSet,
    updateCollapsedNodeIds,
    setPendingExpansionNodeIds,
  } = useGraphCollapse({
    collapsedNodeIds,
    defaultCollapsedNodeIds,
    onCollapsedNodeIdsChange,
  });

  const {
    childNodeIdsByParent,
    effectiveHighlightedEdgeSet,
    effectiveHighlightedNodeSet,
    handleNodeMeasure,
    positionedEdges,
    positionedNodes,
    visibleEdges,
    visibleNodesWithMeasuredSize,
  } = useGraphModel({
    graph,
    config: cfg,
    mergedTheme,
    collapsedIds,
    hiddenNodeIds,
    searchQuery,
    hideUnmatchedSearch,
    searchPredicate,
    highlightedNodeIds,
    highlightedEdgeIds,
    highlightStrategy,
    onSearchResultsChange,
    layoutNodesOverride,
    routeEdgesOverride,
    onError,
  });

  const handleNodeDoubleClick = useGraphCollapseHandlers({
    childNodeIdsByParent,
    collapsedNodeSet,
    graph,
    onError,
    onNodeCollapse,
    onNodeExpand,
    pendingExpansionNodeSet,
    setPendingExpansionNodeIds,
    toggleCollapseOnNodeDoubleClick,
    updateCollapsedNodeIds,
  });

  const {
    effectiveFocusedNodeId,
    effectiveSelection,
    selectedEdgeSet,
    selectedNodeSet,
    handleEdgeSelection,
    handleNodeSelection,
  } = useGraphSelectionEngine({
    focusedNodeId,
    selection,
    selectionRef,
    updateFocusedNode,
    updateSelection,
    visibleEdges,
    visibleNodes: visibleNodesWithMeasuredSize,
    edgeSelectionEnabled,
    nodeSelectionEnabled,
    onEdgeClick,
    onNodeClick,
    selectionMode,
  });

  const positionedNodeMap = useMemo(
    () => new Map(positionedNodes.map((n) => [n.id, n])),
    [positionedNodes]
  );
  const positionedEdgeMap = useMemo(
    () => new Map(positionedEdges.map((e) => [e.id, e])),
    [positionedEdges]
  );

  const { centerOnNode, fitView, getViewportDimensions } = useGraphViewportController({
    cfg,
    collapsedIds,
    fitViewOnMount,
    fitViewPadding,
    graph,
    pendingExpansionNodeSet,
    positionedEdges,
    positionedNodeMap,
    positionedNodes,
    ref,
    safeMaxZoom,
    safeMinZoom,
    selectionRef,
    svgRef,
    updateSelection,
    updateViewport,
    viewport,
    zoomStep,
  });

  const {
    edgeRenderStates,
    focusedPath,
    setFocusedPath,
    pathHighlight,
    hoveredNodeStates,
    edgesForRender,
    handleEdgeHoverChange,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handlePathHover,
    handlePathLeave,
  } = useGraphHoverEngine({
    hoverHighlight: cfg.hoverHighlight,
    positionedNodes,
    positionedEdges,
    positionedNodeMap,
    positionedEdgeMap,
    selection: effectiveSelection,
    viewport,
    onNodeHoverChange,
    onEdgeHoverChange,
  });

  const renderContext = useMemo<GraphRenderContext>(
    () => ({
      graph,
      nodes: positionedNodes,
      edges: positionedEdges,
      config: cfg,
      viewport,
      selection: effectiveSelection,
    }),
    [cfg, effectiveSelection, graph, positionedEdges, positionedNodes, viewport]
  );

  const onLayoutChangeRef = useRef(onLayoutChange);
  onLayoutChangeRef.current = onLayoutChange;

  useEffect(() => {
    onLayoutChangeRef.current?.({
      graph,
      nodes: positionedNodes,
      edges: positionedEdges,
      config: cfg,
      viewport: viewportRef.current,
      selection: selectionRef.current,
    });
  }, [cfg, graph, positionedEdges, positionedNodes, selectionRef, viewportRef]);

  const {
    handlePointerCancel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    isDragging,
    selectionBox,
  } = useGraphPointerInteractions({
    getViewportDimensions,
    marqueeSelectionEnabled,
    panEnabled,
    pinchZoomEnabled,
    positionedEdges,
    positionedNodes,
    safeMaxZoom,
    safeMinZoom,
    selectionMode,
    svgRef,
    translateExtent,
    updateSelection,
    updateViewport,
    viewportRef,
    zoomEnabled,
  });

  const cullingViewport = useDeferredValue(viewport);
  const { culledEdges: culledEdgesForRender, culledNodes } = useGraphCulling({
    enabled: effectiveViewportCulling && !isDragging,
    edges: edgesForRender,
    height: cfg.height,
    nodes: positionedNodes,
    viewport: cullingViewport,
    width: cfg.width,
  });

  useGraphWheelZoomListener({
    getViewportDimensions,
    safeMaxZoom,
    safeMinZoom,
    svgRef,
    translateExtent,
    updateViewport,
    viewportRef,
    zoomEnabled,
    zoomStep,
  });

  const handleKeyDown = useGraphKeyboardNavigation({
    centerOnNode,
    fitView,
    focusedNodeId: effectiveFocusedNodeId,
    handleNodeSelection,
    keyboardNavigation,
    positionedNodeMap,
    positionedNodes,
    setFocusedPath,
    updateFocusedNode,
    updateSelection,
    updateViewport,
    zoomStep,
  });

  const renderBindings = useGraphRenderBindings({
    cfg,
    edgeSelectionColor,
    isDragging,
    keyboardNavigation,
    panEnabled,
    selectionColor,
    zoomEnabled,
  });

  const selectionRect = selectionBox ? normalizeRect(selectionBox) : null;
  const handleControlZoomIn = useCallback(
    () => updateViewport((current) => ({ zoom: current.zoom + zoomStep })),
    [updateViewport, zoomStep]
  );
  const handleControlZoomOut = useCallback(
    () => updateViewport((current) => ({ zoom: current.zoom - zoomStep })),
    [updateViewport, zoomStep]
  );
  const handleControlResetViewport = useCallback(
    () => updateViewport(DEFAULT_VIEWPORT),
    [updateViewport]
  );
  const handleSvgClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (event.target === event.currentTarget) {
        updateSelection(DEFAULT_SELECTION);
        setFocusedPath(null);
        updateFocusedNode(null);
      }
    },
    [setFocusedPath, updateFocusedNode, updateSelection]
  );

  return {
    svgRef,
    contentRef,
    cfg,
    viewport,
    svgDescId: renderBindings.svgDescId,
    svgRole: renderBindings.svgRole,
    svgStyle: renderBindings.svgStyle,
    Vertex,
    EdgeComponent,
    renderBackground,
    renderOverlay,
    renderContext,
    onRenderPropError: onError,
    showArrows: renderBindings.showArrows,
    arrowMarkerId: renderBindings.arrowMarkerId,
    hoverArrowMarkerId: renderBindings.hoverArrowMarkerId,
    hoverIncomingArrowMarkerId: renderBindings.hoverIncomingArrowMarkerId,
    selectionArrowMarkerId: renderBindings.selectionArrowMarkerId,
    edgeColor: renderBindings.edgeColor,
    edgeWidth: renderBindings.edgeWidth,
    selectionEdgeColor: renderBindings.selectionEdgeColor,
    culledEdgesForRender,
    culledNodes,
    positionedNodes,
    edgeRenderStates,
    selectedEdgeSet,
    edgeSelectionEnabled,
    edgeInteractive: edgeSelectionEnabled || Boolean(onEdgeClick),
    effectiveHighlightedEdgeSet,
    selectedNodeSet,
    nodeSelectionEnabled,
    effectiveFocusedNodeId,
    effectiveHighlightedNodeSet,
    focusedPathKey: focusedPath?.pathKey,
    activePathNodeIds: pathHighlight?.nodes,
    highlightColor,
    selectionColor,
    nodeBorderColor: renderBindings.nodeBorderColor,
    nodeBorderWidth: renderBindings.nodeBorderWidth,
    hoverNodeBorderColor: renderBindings.hoverNodeBorderColor,
    hoverNodeBothColor: renderBindings.hoverNodeBothColor,
    hoverNodeInColor: cfg.hoverNodeInColor,
    hoverNodeOutColor: cfg.hoverNodeOutColor,
    hoverNodeHighlight: cfg.hoverNodeHighlight,
    hoveredNodeStates: hoveredNodeStates ?? undefined,
    measurementScheduler,
    handleNodeMeasure,
    updateFocusedNode,
    handleNodeSelection,
    handleNodeDoubleClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
    handlePathHover,
    handlePathLeave,
    handleEdgeHoverChange,
    handleEdgeSelection,
    selectionRect,
    marqueeFill: renderBindings.marqueeFill,
    marqueeStroke: renderBindings.marqueeStroke,
    nodeFill: renderBindings.nodeFill,
    nodeStroke: renderBindings.nodeStroke,
    nodeTextColor: renderBindings.nodeTextColor,
    nodeTextSize: renderBindings.nodeTextSize,
    nodeRadius: renderBindings.nodeRadius,
    fontFamily: renderBindings.fontFamily,
    controlFill: renderBindings.controlFill,
    controlStroke: renderBindings.controlStroke,
    controlTextColor: renderBindings.controlTextColor,
    controlFocusStroke: renderBindings.controlFocusStroke,
    showControls,
    controlsPosition,
    handleControlZoomIn,
    handleControlZoomOut,
    fitView,
    handleControlResetViewport,
    handleSvgClick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleKeyDown,
    ariaLabel,
  };
};
