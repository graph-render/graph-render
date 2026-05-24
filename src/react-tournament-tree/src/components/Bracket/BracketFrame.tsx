import type { StageView, VerticalStagePosition } from '@graph-render/types/tournament';
import { useEffect } from 'react';

import { useBracketAppearance } from '../../contexts/BracketAppearanceContext';
import { ensureTournamentPrintStyles } from '../../utils/printStyles';
import { BracketHeader } from './BracketHeader';
import { FloatingToolbarButton } from './FloatingToolbarButton';
import { StageLabelBar } from './StageLabelBar';
import { StageNavigationControls } from './StageNavigationControls';

interface BracketFrameProps {
  readonly children: React.ReactNode;
  readonly title: string;
  readonly badgeText: string;
  readonly stageLabels: readonly string[];
  readonly isDarkMode: boolean;
  readonly isNavigationMode: boolean;
  readonly stageViews: readonly StageView[];
  readonly activeStageIndex: number;
  readonly verticalStagePosition: VerticalStagePosition;
  readonly canPagePlayersVertically: boolean;
  readonly contentViewportRef: React.RefObject<HTMLDivElement | null>;
  readonly showToolbar: boolean;
  readonly compact: boolean;
  readonly onToggleNavigationMode: () => void;
  readonly onPreviousStage: () => void;
  readonly onNextStage: () => void;
  readonly onPagePlayersUp: () => void;
  readonly onPagePlayersDown: () => void;
  readonly onToggleDarkMode: () => void;
  readonly onExportSVG: () => void;
}

export function BracketFrame({
  children,
  title,
  badgeText,
  stageLabels,
  isDarkMode,
  isNavigationMode,
  stageViews,
  activeStageIndex,
  verticalStagePosition,
  canPagePlayersVertically,
  contentViewportRef,
  showToolbar,
  compact,
  onToggleNavigationMode,
  onPreviousStage,
  onNextStage,
  onPagePlayersUp,
  onPagePlayersDown,
  onToggleDarkMode,
  onExportSVG,
}: BracketFrameProps) {
  const { colors, frame } = useBracketAppearance();
  const canGoPrev = activeStageIndex > 0;
  const canGoNext = activeStageIndex < stageViews.length - 1;

  useEffect(() => {
    ensureTournamentPrintStyles();
  }, []);

  return (
    <div
      data-tournament-bracket-frame
      data-testid="tournament-bracket-frame"
      style={{
        width: '100%',
        maxWidth: frame.maxWidth,
        background: colors.SURFACE_BG,
        borderRadius: frame.borderRadius,
        boxShadow: colors.SHADOW,
        overflow: 'hidden',
      }}
    >
      <BracketHeader
        title={title}
        badgeText={badgeText}
        compact={compact}
        isDarkMode={isDarkMode}
        isNavigationMode={isNavigationMode}
        showToolbar={showToolbar}
        onToggleNavigationMode={onToggleNavigationMode}
        onToggleDarkMode={onToggleDarkMode}
        onExportSVG={onExportSVG}
      />
      <StageLabelBar
        stageLabels={stageLabels}
        isDarkMode={isDarkMode}
        isNavigationMode={isNavigationMode}
        activeStageIndex={activeStageIndex}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPreviousStage={onPreviousStage}
        onNextStage={onNextStage}
      />
      <div
        ref={contentViewportRef}
        data-tournament-bracket-content
        data-testid="tournament-bracket-content"
        style={{
          position: 'relative',
          padding: frame.contentPadding,
          overflowX: isNavigationMode ? 'hidden' : 'auto',
          overflowY: 'hidden',
          background: frame.canvasBackground,
        }}
      >
        {children}
        {showToolbar ? (
          <FloatingToolbarButton
            isDarkMode={isDarkMode}
            isNavigationMode={isNavigationMode}
            onToggleNavigationMode={onToggleNavigationMode}
          />
        ) : null}
        {isNavigationMode ? (
          <StageNavigationControls
            isDarkMode={isDarkMode}
            activeStageIndex={activeStageIndex}
            stageCount={stageViews.length}
            verticalStagePosition={verticalStagePosition}
            canPagePlayersVertically={canPagePlayersVertically}
            onPreviousStage={onPreviousStage}
            onNextStage={onNextStage}
            onPagePlayersUp={onPagePlayersUp}
            onPagePlayersDown={onPagePlayersDown}
          />
        ) : null}
      </div>
    </div>
  );
}
