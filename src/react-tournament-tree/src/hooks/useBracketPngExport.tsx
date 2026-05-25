import type { GraphConfig } from '@graph-render/types';
import type { VertexComponent } from '@graph-render/types/react';
import { useCallback } from 'react';

import type { BracketVertexOptions } from '../hooks/useBracketVertexComponents';
import type { ResolvedTournamentLocalization } from '../models/localization';
import type { TournamentBracketProps } from '../models/tournamentBracket';
import { buildBracketSvgString } from '../utils/buildBracketSvg';
import { downloadPngFromSvgString } from '../utils/exportPng';
import { resolveTournamentLocalization } from '../utils/localization';

interface UseBracketPngExportParams {
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

export function useBracketPngExport({
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
}: UseBracketPngExportParams) {
  return useCallback(() => {
    let svgString: string;
    try {
      svgString = buildBracketSvgString({
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
      });
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      onExportError?.(normalizedError);
      throw normalizedError;
    }

    downloadPngFromSvgString(svgString).catch((error: unknown) => {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      onExportError?.(normalizedError);
    });
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
