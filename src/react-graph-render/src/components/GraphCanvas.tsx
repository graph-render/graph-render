import type {
  NormalizedGraphConfig,
  PositionedEdge,
  PositionedNode,
  Size,
} from '@graph-render/types';
import { RoutingStyle } from '@graph-render/types';
import type {
  EdgeComponent,
  GraphControlsPosition,
  GraphErrorContext,
  GraphRenderContext,
  GraphViewport,
  VertexComponent,
} from '@graph-render/types/react';
import { GraphErrorPhase } from '@graph-render/types/react';
import React, { useMemo } from 'react';

import type { GraphNodeTheme } from '../contexts/GraphThemeContext';
import { GraphThemeProvider } from '../contexts/GraphThemeContext';
import type { Rect } from '../models/domain';
import type { EdgeRenderState } from '../utils/edgeRenderState';
import type { NodeMeasurementScheduler } from '../utils/nodeMeasurementScheduler';
import { GraphEdgesLayer } from './GraphEdgesLayer';
import { GraphLabels } from './GraphLabels';
import { GraphMarkerDefs } from './GraphMarkerDefs';
import { GraphNodesLayer } from './GraphNodesLayer';
import { GraphSelectionOverlay } from './GraphSelectionOverlay';
import { GraphViewportControls } from './GraphViewportControls';

export interface GraphCanvasProps {
  readonly svgRef: React.RefObject<SVGSVGElement | null>;
  readonly contentRef: React.RefObject<SVGGElement | null>;
  readonly cfg: NormalizedGraphConfig;
  readonly viewport: GraphViewport;
  readonly svgDescId: string;
  readonly svgRole: 'application' | 'figure';
  readonly svgStyle: React.CSSProperties;
  readonly Vertex: VertexComponent;
  readonly EdgeComponent: EdgeComponent;
  readonly renderBackground?: ((context: GraphRenderContext) => React.ReactNode) | undefined;
  readonly renderOverlay?: ((context: GraphRenderContext) => React.ReactNode) | undefined;
  readonly renderContext: GraphRenderContext;
  readonly onRenderPropError?: ((error: Error, context: GraphErrorContext) => void) | undefined;
  readonly showArrows: boolean;
  readonly arrowMarkerId: string;
  readonly hoverArrowMarkerId: string;
  readonly hoverIncomingArrowMarkerId: string;
  readonly selectionArrowMarkerId: string;
  readonly edgeColor: string;
  readonly edgeWidth: number;
  readonly selectionEdgeColor: string;
  readonly culledEdgesForRender: readonly PositionedEdge[];
  readonly culledNodes: readonly PositionedNode[];
  readonly positionedNodes: readonly PositionedNode[];
  /** Pre-computed per-edge hover/path state produced by useGraphHoverEngine. */
  readonly edgeRenderStates: ReadonlyMap<string, EdgeRenderState>;
  readonly selectedEdgeSet: ReadonlySet<string>;
  readonly edgeSelectionEnabled: boolean;
  readonly edgeInteractive: boolean;
  readonly effectiveHighlightedEdgeSet: ReadonlySet<string>;
  readonly selectedNodeSet: ReadonlySet<string>;
  readonly nodeSelectionEnabled: boolean;
  readonly effectiveFocusedNodeId: string | null;
  readonly effectiveHighlightedNodeSet: ReadonlySet<string>;
  readonly focusedPathKey: string | undefined;
  readonly activePathNodeIds: ReadonlySet<string> | undefined;
  readonly highlightColor: string;
  readonly selectionColor: string;
  readonly nodeBorderColor: string | undefined;
  readonly nodeBorderWidth: number;
  readonly hoverNodeBorderColor: string;
  readonly hoverNodeBothColor: string;
  readonly hoverNodeInColor: string;
  readonly hoverNodeOutColor: string;
  readonly hoverNodeHighlight: boolean;
  readonly hoveredNodeStates:
    | ReadonlyMap<string, { readonly in?: boolean; readonly out?: boolean }>
    | undefined;
  readonly measurementScheduler: NodeMeasurementScheduler;
  readonly handleNodeMeasure: (nodeId: string, size: Size) => void;
  readonly updateFocusedNode: (nodeId: string | null) => void;
  readonly handleNodeSelection: (node: PositionedNode) => void;
  readonly handleNodeDoubleClick: (node: PositionedNode) => void;
  readonly handleNodeMouseEnter: (nodeId: string) => void;
  readonly handleNodeMouseLeave: () => void;
  readonly handlePathHover: (nodeId: string, sourceIndex: number, pathKey?: string) => void;
  readonly handlePathLeave: () => void;
  readonly handleEdgeHoverChange: (edgeId: string, hovered: boolean) => void;
  readonly handleEdgeSelection: (edge: PositionedEdge) => void;
  readonly selectionRect: Rect | null;
  readonly marqueeFill: string;
  readonly marqueeStroke: string;
  readonly nodeFill: string;
  readonly nodeStroke: string;
  readonly nodeTextColor: string;
  readonly nodeTextSize: number;
  readonly nodeRadius: number;
  readonly fontFamily: string;
  readonly controlFill: string;
  readonly controlStroke: string;
  readonly controlTextColor: string;
  readonly controlFocusStroke: string;
  readonly showControls: boolean | undefined;
  readonly controlsPosition: GraphControlsPosition;
  readonly handleControlZoomIn: () => void;
  readonly handleControlZoomOut: () => void;
  readonly fitView: () => void;
  readonly handleControlResetViewport: () => void;
  readonly handleSvgClick: (event: React.MouseEvent<SVGSVGElement>) => void;
  readonly handlePointerDown: (event: React.PointerEvent<SVGSVGElement>) => void;
  readonly handlePointerMove: (event: React.PointerEvent<SVGSVGElement>) => void;
  readonly handlePointerUp: (event: React.PointerEvent<SVGSVGElement>) => void;
  readonly handlePointerCancel: (event: React.PointerEvent<SVGSVGElement>) => void;
  readonly handleKeyDown: (event: React.KeyboardEvent<SVGSVGElement>) => void;
  readonly ariaLabel?: string | undefined;
}

const safeCallRenderProp = (
  fn: ((context: GraphRenderContext) => React.ReactNode) | undefined,
  context: GraphRenderContext,
  onError: ((error: Error, ctx: GraphErrorContext) => void) | undefined
): React.ReactNode => {
  if (!fn) return null;
  try {
    return fn(context);
  } catch (error_) {
    const error = error_ instanceof Error ? error_ : new Error(String(error_));
    onError?.(error, { graph: context.graph, phase: GraphErrorPhase.Render });
    return null;
  }
};

export const GraphCanvas = React.memo(function GraphCanvas({
  svgRef,
  contentRef,
  cfg,
  viewport,
  svgDescId,
  svgRole,
  svgStyle,
  Vertex,
  EdgeComponent,
  renderBackground,
  renderOverlay,
  renderContext,
  onRenderPropError,
  showArrows,
  arrowMarkerId,
  hoverArrowMarkerId,
  hoverIncomingArrowMarkerId,
  selectionArrowMarkerId,
  edgeColor,
  edgeWidth,
  selectionEdgeColor,
  culledEdgesForRender,
  culledNodes,
  positionedNodes,
  edgeRenderStates,
  selectedEdgeSet,
  edgeSelectionEnabled,
  edgeInteractive,
  effectiveHighlightedEdgeSet,
  selectedNodeSet,
  nodeSelectionEnabled,
  effectiveFocusedNodeId,
  effectiveHighlightedNodeSet,
  focusedPathKey,
  activePathNodeIds,
  highlightColor,
  selectionColor,
  nodeBorderColor,
  nodeBorderWidth,
  hoverNodeBorderColor,
  hoverNodeBothColor,
  hoverNodeInColor,
  hoverNodeOutColor,
  hoverNodeHighlight,
  hoveredNodeStates,
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
  marqueeFill,
  marqueeStroke,
  nodeFill,
  nodeStroke,
  nodeTextColor,
  nodeTextSize,
  nodeRadius,
  fontFamily,
  controlFill,
  controlStroke,
  controlTextColor,
  controlFocusStroke,
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
  ariaLabel = 'Graph',
}: GraphCanvasProps) {
  const nodeTheme = useMemo<GraphNodeTheme>(
    () => ({ nodeFill, nodeStroke, nodeTextColor, nodeTextSize, nodeRadius, fontFamily }),
    [nodeFill, nodeStroke, nodeTextColor, nodeTextSize, nodeRadius, fontFamily]
  );
  return (
    <svg
      ref={svgRef}
      width={cfg.width}
      height={cfg.height}
      role={svgRole}
      aria-label={ariaLabel}
      aria-describedby={svgDescId}
      tabIndex={0}
      style={svgStyle}
      onClick={handleSvgClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      <desc id={svgDescId}>
        Interactive graph. Arrow keys pan the view. Tab / Shift+Tab cycle focusable nodes. Enter or
        Space activates the focused node. Plus (+) and Minus (−) zoom in and out.
      </desc>
      {showArrows ? (
        <GraphMarkerDefs
          arrowMarkerId={arrowMarkerId}
          edgeColor={edgeColor}
          hoverArrowMarkerId={hoverArrowMarkerId}
          hoverEdgeColor={cfg.hoverEdgeColor}
          hoverIncomingArrowMarkerId={hoverIncomingArrowMarkerId}
          hoverNodeOutColor={cfg.hoverNodeOutColor}
          selectionArrowMarkerId={selectionArrowMarkerId}
          selectionEdgeColor={selectionEdgeColor}
        />
      ) : null}

      <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
        <g ref={contentRef}>
          {safeCallRenderProp(renderBackground, renderContext, onRenderPropError)}

          <GraphLabels
            positionedNodes={positionedNodes}
            layout={cfg.layout}
            layoutDirection={cfg.layoutDirection}
            labels={cfg.labels}
            autoLabels={cfg.autoLabels}
            labelOffset={cfg.labelOffset}
            pillBackground={cfg.labelPillBackground}
            pillBorderColor={cfg.labelPillBorderColor}
            pillTextColor={cfg.labelPillTextColor}
          />

          <GraphEdgesLayer
            edges={culledEdgesForRender}
            EdgeComponent={EdgeComponent}
            edgeColor={edgeColor}
            edgeWidth={edgeWidth}
            curveEdges={cfg.curveEdges ? cfg.routingStyle !== RoutingStyle.Orthogonal : false}
            curveStrength={cfg.curveStrength}
            edgeLabelColor={cfg.edgeLabelColor}
            showArrows={showArrows}
            arrowMarkerId={arrowMarkerId}
            hoverArrowMarkerId={hoverArrowMarkerId}
            hoverIncomingArrowMarkerId={hoverIncomingArrowMarkerId}
            selectionArrowMarkerId={selectionArrowMarkerId}
            hoverHighlight={cfg.hoverHighlight}
            edgeRenderStates={edgeRenderStates}
            selectedEdgeSet={selectedEdgeSet}
            edgeSelectionEnabled={edgeSelectionEnabled}
            edgeInteractive={edgeInteractive}
            highlightedEdgeSet={effectiveHighlightedEdgeSet}
            hoverEdgeColor={cfg.hoverEdgeColor}
            hoverNodeOutColor={cfg.hoverNodeOutColor}
            selectionEdgeColor={selectionEdgeColor}
            highlightColor={highlightColor}
            onEdgeHoverChange={handleEdgeHoverChange}
            onEdgeSelection={handleEdgeSelection}
          />

          <GraphThemeProvider theme={nodeTheme}>
            <GraphNodesLayer
              nodes={culledNodes}
              Vertex={Vertex}
              selectedNodeSet={selectedNodeSet}
              nodeSelectionEnabled={nodeSelectionEnabled}
              focusedNodeId={effectiveFocusedNodeId}
              highlightedNodeSet={effectiveHighlightedNodeSet}
              activePathKey={focusedPathKey}
              activePathNodeIds={activePathNodeIds}
              highlightColor={highlightColor}
              selectionColor={selectionColor}
              nodeBorderColor={nodeBorderColor}
              nodeBorderWidth={nodeBorderWidth}
              hoverNodeBorderColor={hoverNodeBorderColor}
              hoverNodeBothColor={hoverNodeBothColor}
              hoverNodeInColor={hoverNodeInColor}
              hoverNodeOutColor={hoverNodeOutColor}
              hoverNodeHighlight={hoverNodeHighlight}
              hoveredNodeStates={hoveredNodeStates ?? undefined}
              measurementScheduler={measurementScheduler}
              onNodeMeasure={handleNodeMeasure}
              onNodeFocus={updateFocusedNode}
              onNodeClick={handleNodeSelection}
              onNodeDoubleClick={handleNodeDoubleClick}
              onNodeMouseEnter={handleNodeMouseEnter}
              onNodeMouseLeave={handleNodeMouseLeave}
              onPathHover={handlePathHover}
              onPathLeave={handlePathLeave}
            />
          </GraphThemeProvider>

          {safeCallRenderProp(renderOverlay, renderContext, onRenderPropError)}
        </g>
      </g>

      <GraphSelectionOverlay rect={selectionRect} fill={marqueeFill} stroke={marqueeStroke} />

      {showControls ? (
        <GraphViewportControls
          width={cfg.width}
          height={cfg.height}
          position={controlsPosition}
          fill={controlFill}
          stroke={controlStroke}
          textColor={controlTextColor}
          focusStroke={controlFocusStroke}
          zoomIn={handleControlZoomIn}
          zoomOut={handleControlZoomOut}
          fitView={fitView}
          resetViewport={handleControlResetViewport}
        />
      ) : null}
    </svg>
  );
});
