import { DEFAULT_THEME } from '@graph-render/core';
import type { NormalizedGraphConfig } from '@graph-render/types';
import type { CSSProperties } from 'react';
import { useId, useMemo } from 'react';

import {
  DEFAULT_CONTROL_FILL,
  DEFAULT_CONTROL_FOCUS_STROKE,
  DEFAULT_CONTROL_STROKE,
  DEFAULT_CONTROL_TEXT_COLOR,
  DEFAULT_MARQUEE_FILL,
  DEFAULT_MARQUEE_STROKE,
  DEFAULT_NODE_FILL,
  DEFAULT_NODE_RADIUS,
  DEFAULT_NODE_STROKE,
  DEFAULT_TEXT_FILL,
  DEFAULT_TEXT_SIZE,
} from '../constants/graph';

export interface UseGraphRenderBindingsOptions {
  readonly cfg: NormalizedGraphConfig;
  readonly edgeSelectionColor: string | undefined;
  readonly isDragging: boolean;
  readonly keyboardNavigation: boolean;
  readonly panEnabled: boolean;
  readonly selectionColor: string;
  readonly zoomEnabled: boolean;
}

export interface UseGraphRenderBindingsResult {
  readonly arrowMarkerId: string;
  readonly controlFill: string;
  readonly controlFocusStroke: string;
  readonly controlStroke: string;
  readonly controlTextColor: string;
  readonly edgeColor: string;
  readonly edgeWidth: number;
  readonly fontFamily: string;
  readonly hoverArrowMarkerId: string;
  readonly hoverIncomingArrowMarkerId: string;
  readonly hoverNodeBorderColor: string;
  readonly hoverNodeBothColor: string;
  readonly marqueeFill: string;
  readonly marqueeStroke: string;
  readonly nodeBorderColor: string | undefined;
  readonly nodeBorderWidth: number;
  readonly nodeFill: string;
  readonly nodeRadius: number;
  readonly nodeStroke: string;
  readonly nodeTextColor: string;
  readonly nodeTextSize: number;
  readonly selectionArrowMarkerId: string;
  readonly selectionEdgeColor: string;
  readonly showArrows: boolean;
  readonly svgDescId: string;
  readonly svgRole: 'application' | 'figure';
  readonly svgStyle: CSSProperties;
}

export const useGraphRenderBindings = ({
  cfg,
  edgeSelectionColor,
  isDragging,
  keyboardNavigation,
  panEnabled,
  selectionColor,
  zoomEnabled,
}: UseGraphRenderBindingsOptions): UseGraphRenderBindingsResult => {
  const markerPrefix = useId().replaceAll(':', '-');
  const mergedTheme = cfg.theme;

  const svgStyle = useMemo(
    () => ({
      background: mergedTheme.background,
      fontFamily: mergedTheme.fontFamily,
      cursor: isDragging ? 'grabbing' : panEnabled ? 'grab' : 'default',
      touchAction: panEnabled || zoomEnabled ? 'none' : 'auto',
      overflow: 'hidden',
      userSelect: 'none' as const,
    }),
    [isDragging, mergedTheme.background, mergedTheme.fontFamily, panEnabled, zoomEnabled]
  );

  return {
    arrowMarkerId: `${markerPrefix}-arrow`,
    controlFill: mergedTheme.controlFill ?? DEFAULT_CONTROL_FILL,
    controlFocusStroke: mergedTheme.controlFocusStroke ?? DEFAULT_CONTROL_FOCUS_STROKE,
    controlStroke: mergedTheme.controlStroke ?? DEFAULT_CONTROL_STROKE,
    controlTextColor: mergedTheme.controlTextColor ?? DEFAULT_CONTROL_TEXT_COLOR,
    edgeColor: mergedTheme.edgeColor ?? DEFAULT_THEME.edgeColor ?? '#8b9dbf',
    edgeWidth: mergedTheme.edgeWidth ?? DEFAULT_THEME.edgeWidth ?? 2,
    fontFamily:
      mergedTheme.fontFamily ??
      DEFAULT_THEME.fontFamily ??
      'system-ui, -apple-system, Segoe UI, sans-serif',
    hoverArrowMarkerId: `${markerPrefix}-arrow-hover`,
    hoverIncomingArrowMarkerId: `${markerPrefix}-arrow-hover-in`,
    hoverNodeBorderColor: cfg.hoverNodeBorderColor ?? cfg.hoverEdgeColor,
    hoverNodeBothColor: cfg.hoverNodeBothColor ?? cfg.hoverEdgeColor,
    marqueeFill: mergedTheme.marqueeFill ?? DEFAULT_MARQUEE_FILL,
    marqueeStroke: mergedTheme.marqueeStroke ?? DEFAULT_MARQUEE_STROKE,
    nodeBorderColor: mergedTheme.nodeBorderColor,
    nodeBorderWidth: mergedTheme.nodeBorderWidth ?? 0,
    nodeFill: mergedTheme.nodeFill ?? DEFAULT_NODE_FILL,
    nodeRadius: mergedTheme.nodeRadius ?? DEFAULT_NODE_RADIUS,
    nodeStroke: mergedTheme.nodeStroke ?? DEFAULT_NODE_STROKE,
    nodeTextColor: mergedTheme.nodeTextColor ?? DEFAULT_TEXT_FILL,
    nodeTextSize: mergedTheme.nodeTextSize ?? DEFAULT_TEXT_SIZE,
    selectionArrowMarkerId: `${markerPrefix}-arrow-selected`,
    selectionEdgeColor: edgeSelectionColor ?? selectionColor,
    showArrows: cfg.showArrows,
    svgDescId: `${markerPrefix}-desc`,
    svgRole: keyboardNavigation ? 'application' : 'figure',
    svgStyle,
  };
};
