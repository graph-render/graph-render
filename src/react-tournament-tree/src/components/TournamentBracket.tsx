import type { GraphHandle } from '@graph-render/types/react';
import type { StageView } from '@graph-render/types/tournament';
import { SquashNodeRenderMode } from '@graph-render/types/tournament';
import React, { useMemo, useRef, useState } from 'react';

import { BracketAppearanceProvider } from '../contexts/BracketAppearanceContext';
import { BracketLocalizationProvider } from '../contexts/BracketLocalizationContext';
import { useBracketPdfExport } from '../hooks/useBracketPdfExport';
import { useBracketPngExport } from '../hooks/useBracketPngExport';
import { useBracketSvgExport } from '../hooks/useBracketSvgExport';
import {
  BracketVertexOptionsProvider,
  useBracketVertexComponents,
} from '../hooks/useBracketVertexComponents';
import { useDocumentDarkMode } from '../hooks/useDocumentDarkMode';
import { useStageNavigation } from '../hooks/useStageNavigation';
import type { TournamentBracketProps } from '../models/tournamentBracket';
import {
  buildBracketGraph,
  buildGraphConfig,
  getTranslateExtent,
  resolveBadgeText,
} from '../utils/bracketGraph';
import { resolveTournamentLocalization } from '../utils/localization';
import { resolveBracketAppearance } from '../utils/resolveBracketAppearance';
import { roundLabelsForGraph } from '../utils/roundLabels';
import { BracketFrame } from './Bracket/BracketFrame';
import { BracketGraphCanvas } from './Bracket/BracketGraphCanvas';

export const TournamentBracket = React.memo<TournamentBracketProps>(function TournamentBracket({
  graph,
  config,
  appearance,
  localization,
  defaultViewport,
  vertexComponent,
  nodeRenderMode = SquashNodeRenderMode.Export,
  title = 'Tournament Bracket',
  badgeText,
  toolbar,
  showToolbar,
  showViewportControls,
  showPdfExport,
  defaultNavigationMode = true,
  theme,
  isDarkMode: controlledDarkMode,
  defaultDarkMode,
  onDarkModeChange,
  syncDarkModeToDocument,
  interaction,
  panEnabled,
  zoomEnabled,
  pinchZoomEnabled,
  compact = true,
  onMatchClick,
  onMatchUpdate,
  onInvalidNode,
  onExportError,
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<GraphHandle>(null);
  const contentViewportRef = useRef<HTMLDivElement>(null);
  const resolvedShowToolbar = showToolbar ?? toolbar?.showToolbar ?? true;
  const resolvedShowViewportControls =
    showViewportControls ?? toolbar?.showViewportControls ?? false;
  const resolvedShowPdfExport = showPdfExport ?? toolbar?.showPdfExport ?? false;
  const resolvedPanEnabled = panEnabled ?? interaction?.panEnabled;
  const resolvedZoomEnabled = zoomEnabled ?? interaction?.zoomEnabled;
  const resolvedPinchZoomEnabled = pinchZoomEnabled ?? interaction?.pinchZoomEnabled;
  const { isDarkMode, toggleDarkMode } = useDocumentDarkMode({
    defaultDarkMode: defaultDarkMode ?? theme?.defaultDarkMode,
    isDarkMode: controlledDarkMode ?? theme?.isDarkMode,
    onDarkModeChange: onDarkModeChange ?? theme?.onDarkModeChange,
    syncToDocument: syncDarkModeToDocument ?? theme?.syncToDocument,
  });
  const [stageViews, setStageViews] = useState<readonly StageView[]>([]);

  const resolvedLocalization = useMemo(
    () => resolveTournamentLocalization(localization),
    [localization]
  );
  const labels = useMemo(
    () => config?.labels ?? roundLabelsForGraph(graph, resolvedLocalization),
    [config?.labels, graph, resolvedLocalization]
  );
  const resolvedAppearance = useMemo(
    () => resolveBracketAppearance(appearance, isDarkMode, compact),
    [appearance, compact, isDarkMode]
  );
  const mergedConfig = useMemo(
    () => buildGraphConfig(config, isDarkMode, compact, resolvedAppearance.matchCard),
    [compact, config, isDarkMode, resolvedAppearance.matchCard]
  );
  const enrichedGraph = useMemo(
    () => buildBracketGraph(graph, Boolean(vertexComponent), resolvedAppearance.matchCard),
    [graph, resolvedAppearance.matchCard, vertexComponent]
  );
  const resolvedBadgeText = useMemo(
    () => resolveBadgeText(badgeText, enrichedGraph, labels),
    [badgeText, enrichedGraph, labels]
  );
  const translateExtent = useMemo(() => getTranslateExtent(stageViews), [stageViews]);
  const navigation = useStageNavigation({
    defaultNavigationMode,
    graphRef,
    contentViewportRef,
    graphWidth: mergedConfig.width,
    graphHeight: mergedConfig.height,
    stageViews,
    setStageViews,
  });

  const { exportVertexComponent, resolvedVertexComponent, vertexOptions } =
    useBracketVertexComponents({
      compact,
      nodeRenderMode,
      onInvalidNode,
      onMatchUpdate,
      vertexComponent,
    });

  const sharedExportParams = {
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
    onExportError,
  };

  const handleExportSVG = useBracketSvgExport(sharedExportParams);
  const handleExportPNG = useBracketPngExport(sharedExportParams);
  const handleExportPDF = useBracketPdfExport(sharedExportParams);

  return (
    <BracketAppearanceProvider resolvedAppearance={resolvedAppearance}>
      <BracketLocalizationProvider resolvedLocalization={resolvedLocalization}>
        <BracketFrame
          title={title}
          badgeText={resolvedBadgeText}
          stageLabels={labels}
          isDarkMode={isDarkMode}
          isNavigationMode={navigation.isNavigationMode}
          stageViews={stageViews}
          activeStageIndex={navigation.activeStageIndex}
          verticalStagePosition={navigation.verticalStagePosition}
          canPagePlayersVertically={navigation.canPagePlayersVertically}
          contentViewportRef={contentViewportRef}
          showToolbar={resolvedShowToolbar}
          compact={compact}
          onToggleNavigationMode={navigation.handleToggleNavigationMode}
          onPreviousStage={navigation.handlePreviousStage}
          onNextStage={navigation.handleNextStage}
          onPagePlayersUp={navigation.handlePagePlayersUp}
          onPagePlayersDown={navigation.handlePagePlayersDown}
          onToggleDarkMode={toggleDarkMode}
          onExportSVG={handleExportSVG}
          onExportPNG={handleExportPNG}
          onExportPDF={resolvedShowPdfExport ? handleExportPDF : undefined}
        >
          <BracketVertexOptionsProvider value={vertexOptions}>
            <BracketGraphCanvas
              graphRef={graphRef}
              wrapperRef={wrapperRef}
              graph={enrichedGraph}
              vertexComponent={resolvedVertexComponent}
              config={mergedConfig}
              defaultViewport={defaultViewport}
              isNavigationMode={navigation.isNavigationMode}
              translateExtent={translateExtent}
              showViewportControls={resolvedShowViewportControls}
              panEnabled={resolvedPanEnabled}
              zoomEnabled={resolvedZoomEnabled}
              pinchZoomEnabled={resolvedPinchZoomEnabled}
              labels={labels}
              onStagesChange={navigation.handleStagesChange}
              onMatchClick={onMatchClick}
              onInvalidNode={onInvalidNode}
            />
          </BracketVertexOptionsProvider>
        </BracketFrame>
      </BracketLocalizationProvider>
    </BracketAppearanceProvider>
  );
});

TournamentBracket.displayName = 'TournamentBracket';
