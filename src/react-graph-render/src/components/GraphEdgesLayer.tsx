import type { PositionedEdge } from '@graph-render/types';
import type { EdgeComponent } from '@graph-render/types/react';
import React, { useCallback } from 'react';

import type { EdgeRenderState } from '../utils/edgeRenderState';

const FALLBACK_RENDER_STATE: EdgeRenderState = { edgeHovered: false, isIncomingToHovered: false };

interface GraphEdgesLayerProps {
  readonly edges: readonly PositionedEdge[];
  readonly EdgeComponent: EdgeComponent;
  readonly edgeColor: string;
  readonly edgeWidth: number;
  readonly curveEdges: boolean;
  readonly curveStrength: number;
  readonly edgeLabelColor?: string | undefined;
  readonly showArrows: boolean;
  readonly arrowMarkerId: string;
  readonly hoverArrowMarkerId: string;
  readonly hoverIncomingArrowMarkerId: string;
  readonly selectionArrowMarkerId: string;
  /** Pre-computed per-edge hover/path state. Produced by useGraphHoverEngine. */
  readonly edgeRenderStates: ReadonlyMap<string, EdgeRenderState>;
  /** Whether hover highlighting is enabled (from config). Controls EdgeComponent event handlers. */
  readonly hoverHighlight: boolean;
  readonly selectedEdgeSet: ReadonlySet<string>;
  readonly edgeSelectionEnabled: boolean;
  readonly edgeInteractive: boolean;
  readonly highlightedEdgeSet: ReadonlySet<string>;
  readonly hoverEdgeColor: string;
  readonly hoverNodeOutColor: string;
  readonly selectionEdgeColor: string;
  readonly highlightColor: string;
  readonly onEdgeHoverChange: (edgeId: string, hovered: boolean) => void;
  readonly onEdgeSelection: (edge: PositionedEdge) => void;
}

interface GraphEdgeItemProps {
  readonly edge: PositionedEdge;
  readonly EdgeComponent: EdgeComponent;
  readonly edgeColor: string;
  readonly edgeWidth: number;
  readonly curveEdges: boolean;
  readonly curveStrength: number;
  readonly edgeLabelColor?: string | undefined;
  readonly showArrows: boolean;
  readonly arrowMarkerId: string;
  readonly hoverMarker: string | undefined;
  readonly selectionMarker: string | undefined;
  readonly edgeHovered: boolean;
  readonly isSelected: boolean;
  readonly edgeSelectionEnabled: boolean;
  readonly edgeInteractive: boolean;
  readonly hoverColor: string;
  readonly selectionColor: string;
  readonly hoverEnabled: boolean;
  readonly onEdgeHoverChange: (edgeId: string, hovered: boolean) => void;
  readonly onEdgeSelection: (edge: PositionedEdge) => void;
}

const GraphEdgeItem = React.memo(function GraphEdgeItem({
  edge,
  EdgeComponent,
  edgeColor,
  edgeWidth,
  curveEdges,
  curveStrength,
  edgeLabelColor,
  showArrows,
  arrowMarkerId,
  hoverMarker,
  selectionMarker,
  edgeHovered,
  isSelected,
  edgeSelectionEnabled,
  edgeInteractive,
  hoverColor,
  selectionColor,
  hoverEnabled,
  onEdgeHoverChange,
  onEdgeSelection,
}: GraphEdgeItemProps) {
  const handleHoverChange = useCallback(
    (value: boolean) => onEdgeHoverChange(edge.id, value),
    [edge.id, onEdgeHoverChange]
  );
  const handleClick = useCallback(() => onEdgeSelection(edge), [edge, onEdgeSelection]);

  return (
    <EdgeComponent
      edge={edge}
      color={edgeColor}
      width={edgeWidth}
      curveEdges={curveEdges}
      curveStrength={curveStrength}
      markerEnd={showArrows ? `url(#${arrowMarkerId})` : undefined}
      isHovered={edgeHovered}
      isSelected={isSelected}
      hoverColor={hoverColor}
      selectionColor={selectionColor}
      selectionEnabled={edgeSelectionEnabled}
      labelColor={edgeLabelColor}
      selectionMarker={selectionMarker}
      hoverMarker={hoverMarker}
      hoverEnabled={hoverEnabled}
      hitStrokeWidth={edgeWidth + 8}
      hoverStrokeWidth={edgeWidth + 1.5}
      selectedStrokeWidth={edgeWidth + 1.5}
      onHoverChange={handleHoverChange}
      onClick={edgeInteractive ? handleClick : undefined}
    />
  );
});

export const GraphEdgesLayer = React.memo(function GraphEdgesLayer({
  edges,
  EdgeComponent,
  edgeColor,
  edgeWidth,
  curveEdges,
  curveStrength,
  edgeLabelColor,
  showArrows,
  arrowMarkerId,
  hoverArrowMarkerId,
  hoverIncomingArrowMarkerId,
  selectionArrowMarkerId,
  edgeRenderStates,
  hoverHighlight,
  selectedEdgeSet,
  edgeSelectionEnabled,
  edgeInteractive,
  highlightedEdgeSet,
  hoverEdgeColor,
  hoverNodeOutColor,
  selectionEdgeColor,
  highlightColor,
  onEdgeHoverChange,
  onEdgeSelection,
}: GraphEdgesLayerProps) {
  return (
    <g aria-label="edges">
      {edges.map((edge) => {
        const { edgeHovered, isIncomingToHovered } =
          edgeRenderStates.get(edge.id) ?? FALLBACK_RENDER_STATE;

        return (
          <GraphEdgeItem
            key={edge.id}
            edge={edge}
            EdgeComponent={EdgeComponent}
            edgeColor={edgeColor}
            edgeWidth={edgeWidth}
            curveEdges={curveEdges}
            curveStrength={curveStrength}
            edgeLabelColor={edgeLabelColor}
            showArrows={showArrows}
            arrowMarkerId={arrowMarkerId}
            hoverMarker={
              showArrows
                ? isIncomingToHovered
                  ? `url(#${hoverIncomingArrowMarkerId})`
                  : `url(#${hoverArrowMarkerId})`
                : undefined
            }
            selectionMarker={showArrows ? `url(#${selectionArrowMarkerId})` : undefined}
            edgeHovered={edgeHovered}
            isSelected={selectedEdgeSet.has(edge.id) || highlightedEdgeSet.has(edge.id)}
            edgeSelectionEnabled={edgeSelectionEnabled}
            edgeInteractive={edgeInteractive}
            hoverColor={isIncomingToHovered ? hoverNodeOutColor : hoverEdgeColor}
            selectionColor={selectedEdgeSet.has(edge.id) ? selectionEdgeColor : highlightColor}
            hoverEnabled={hoverHighlight}
            onEdgeHoverChange={onEdgeHoverChange}
            onEdgeSelection={onEdgeSelection}
          />
        );
      })}
    </g>
  );
});
