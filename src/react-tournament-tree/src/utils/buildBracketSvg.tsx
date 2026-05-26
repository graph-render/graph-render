import { renderGraphToSvg } from '@graph-render/core';
import { Graph } from '@graph-render/react';
import type { GraphConfig } from '@graph-render/types';
import type { VertexComponent } from '@graph-render/types/react';
import { SquashNodeRenderMode } from '@graph-render/types/tournament';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { BracketAppearanceProvider } from '../contexts/BracketAppearanceContext';
import { BracketLocalizationProvider } from '../contexts/BracketLocalizationContext';
import type { BracketVertexOptions } from '../hooks/useBracketVertexComponents';
import { BracketVertexOptionsProvider } from '../hooks/useBracketVertexComponents';
import type { ResolvedTournamentLocalization } from '../models/localization';
import type { TournamentBracketProps } from '../models/tournamentBracket';
import { routeBracketEdges } from './bracketRouting';
import { getSvgStringFromElement } from './exportSvg';

export interface BuildBracketSvgParams {
  readonly wrapperRef: React.RefObject<HTMLDivElement | null>;
  readonly nodeRenderMode: NonNullable<TournamentBracketProps['nodeRenderMode']>;
  readonly vertexComponent?: TournamentBracketProps['vertexComponent'];
  readonly isDarkMode: boolean;
  readonly enrichedGraph: TournamentBracketProps['graph'];
  readonly exportVertexComponent: VertexComponent;
  readonly mergedConfig: GraphConfig;
  readonly appearance?: TournamentBracketProps['appearance'];
  readonly compact: boolean;
  readonly resolvedLocalization: ResolvedTournamentLocalization;
  readonly vertexOptions: BracketVertexOptions;
}

/**
 * Builds and returns the bracket SVG as a string without triggering a download.
 * Handles all three render modes (Svg, Export, Html).
 */
export function buildBracketSvgString({
  wrapperRef,
  nodeRenderMode,
  vertexComponent,
  isDarkMode,
  enrichedGraph,
  exportVertexComponent,
  mergedConfig,
  appearance,
  compact,
  resolvedLocalization,
  vertexOptions,
}: BuildBracketSvgParams): string {
  if (
    nodeRenderMode === SquashNodeRenderMode.Svg &&
    !vertexComponent &&
    enrichedGraph.nodes != null
  ) {
    const { svg } = renderGraphToSvg(enrichedGraph, {
      config: {
        width: mergedConfig.width,
        height: mergedConfig.height,
      },
      title: 'Tournament Bracket',
    });
    return svg;
  }

  if (nodeRenderMode !== SquashNodeRenderMode.Html || vertexComponent) {
    return getSvgStringFromElement(wrapperRef.current);
  }

  const host = document.createElement('div');
  host.style.position = 'absolute';
  host.style.width = '0';
  host.style.height = '0';
  host.style.overflow = 'hidden';
  host.style.opacity = '0';
  host.style.pointerEvents = 'none';
  document.body.append(host);

  const exportRoot = createRoot(host);

  try {
    flushSync(() => {
      exportRoot.render(
        <BracketAppearanceProvider
          appearance={appearance}
          isDarkMode={isDarkMode}
          compact={compact}
        >
          <BracketLocalizationProvider resolvedLocalization={resolvedLocalization}>
            <BracketVertexOptionsProvider value={vertexOptions}>
              <Graph
                graph={enrichedGraph}
                vertexComponent={exportVertexComponent}
                config={mergedConfig}
                routeEdgesOverride={routeBracketEdges}
              />
            </BracketVertexOptionsProvider>
          </BracketLocalizationProvider>
        </BracketAppearanceProvider>
      );
    });

    return getSvgStringFromElement(host);
  } finally {
    exportRoot.unmount();
    host.remove();
  }
}
