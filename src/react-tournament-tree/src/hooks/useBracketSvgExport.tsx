import { renderGraphToSvg } from '@graph-render/core';
import { Graph } from '@graph-render/react';
import type { GraphConfig } from '@graph-render/types';
import type { VertexComponent } from '@graph-render/types/react';
import { SquashNodeRenderMode } from '@graph-render/types/tournament';
import { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { BracketAppearanceProvider } from '../contexts/BracketAppearanceContext';
import { BracketLocalizationProvider } from '../contexts/BracketLocalizationContext';
import type { ResolvedTournamentLocalization } from '../models/localization';
import type { TournamentBracketProps } from '../models/tournamentBracket';
import { routeBracketEdges } from '../utils/bracketRouting';
import { downloadSvgFromElement, downloadSvgString } from '../utils/exportSvg';
import { resolveTournamentLocalization } from '../utils/localization';
import {
  type BracketVertexOptions,
  BracketVertexOptionsProvider,
} from './useBracketVertexComponents';

interface UseBracketSvgExportParams {
  readonly wrapperRef: React.RefObject<HTMLDivElement | null>;
  readonly nodeRenderMode: NonNullable<TournamentBracketProps['nodeRenderMode']>;
  readonly vertexComponent?: TournamentBracketProps['vertexComponent'];
  readonly isDarkMode: boolean;
  readonly enrichedGraph: TournamentBracketProps['graph'];
  readonly exportVertexComponent: VertexComponent;
  readonly mergedConfig: GraphConfig;
  readonly appearance?: TournamentBracketProps['appearance'];
  readonly compact: boolean;
  readonly resolvedLocalization?: ResolvedTournamentLocalization | undefined;
  readonly vertexOptions: BracketVertexOptions;
  readonly onExportError?: TournamentBracketProps['onExportError'];
}

export function useBracketSvgExport({
  wrapperRef,
  nodeRenderMode,
  vertexComponent,
  isDarkMode,
  enrichedGraph,
  exportVertexComponent,
  mergedConfig,
  appearance,
  compact,
  resolvedLocalization = resolveTournamentLocalization(),
  vertexOptions,
  onExportError,
}: UseBracketSvgExportParams) {
  return useCallback(() => {
    try {
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
        downloadSvgString(svg);
        return;
      }

      if (nodeRenderMode !== SquashNodeRenderMode.Html || vertexComponent) {
        downloadSvgFromElement(wrapperRef.current);
        return;
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

        downloadSvgFromElement(host);
      } finally {
        exportRoot.unmount();
        host.remove();
      }
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      onExportError?.(normalizedError);
      throw normalizedError;
    }
  }, [
    enrichedGraph,
    exportVertexComponent,
    appearance,
    compact,
    isDarkMode,
    mergedConfig,
    nodeRenderMode,
    onExportError,
    resolvedLocalization,
    vertexComponent,
    vertexOptions,
    wrapperRef,
  ]);
}
