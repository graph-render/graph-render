/* eslint-disable @typescript-eslint/no-deprecated -- This file is a compatibility shim that intentionally reads deprecated flat props to merge them with grouped options. */
import type {
  GraphInteractionOptions,
  GraphProps,
  GraphViewportOptions,
} from '@graph-render/types/react';

export const resolveInteractionFlags = (
  interaction: GraphInteractionOptions | undefined,
  props: Pick<
    GraphProps,
    | 'panEnabled'
    | 'zoomEnabled'
    | 'pinchZoomEnabled'
    | 'keyboardNavigation'
    | 'marqueeSelectionEnabled'
  >
) => ({
  panEnabled: props.panEnabled ?? interaction?.panEnabled ?? true,
  zoomEnabled: props.zoomEnabled ?? interaction?.zoomEnabled ?? true,
  pinchZoomEnabled: props.pinchZoomEnabled ?? interaction?.pinchZoomEnabled ?? true,
  keyboardNavigation: props.keyboardNavigation ?? interaction?.keyboardNavigation ?? true,
  marqueeSelectionEnabled:
    props.marqueeSelectionEnabled ?? interaction?.marqueeSelectionEnabled ?? true,
});

export const resolveViewportFlags = (
  viewportOptions: GraphViewportOptions | undefined,
  props: Pick<
    GraphProps,
    'minZoom' | 'maxZoom' | 'zoomStep' | 'translateExtent' | 'showControls' | 'controlsPosition'
  >
) => ({
  minZoom: props.minZoom ?? viewportOptions?.minZoom,
  maxZoom: props.maxZoom ?? viewportOptions?.maxZoom,
  zoomStep: props.zoomStep ?? viewportOptions?.zoomStep,
  translateExtent: props.translateExtent ?? viewportOptions?.translateExtent,
  showControls: props.showControls ?? viewportOptions?.showControls ?? false,
  controlsPosition: props.controlsPosition ?? viewportOptions?.controlsPosition,
});
