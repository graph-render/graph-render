import { useBracketAppearance } from '../../contexts/BracketAppearanceContext';
import { useBracketLocalization } from '../../contexts/BracketLocalizationContext';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';
import { StageLabelGrid } from './stage-labels/StageLabelGrid';
import { StageStepButton } from './stage-labels/StageStepButton';

interface StageLabelBarProps {
  readonly stageLabels: readonly string[];
  readonly isDarkMode: boolean;
  readonly isNavigationMode: boolean;
  readonly activeStageIndex: number;
  readonly canGoPrev: boolean;
  readonly canGoNext: boolean;
  readonly onPreviousStage: () => void;
  readonly onNextStage: () => void;
}

export function StageLabelBar({
  stageLabels,
  isDarkMode,
  isNavigationMode,
  activeStageIndex,
  canGoPrev,
  canGoNext,
  onPreviousStage,
  onNextStage,
}: StageLabelBarProps) {
  const { colors, stageLabels: stageLabelStyle, typography } = useBracketAppearance();
  const { uiLabels } = useBracketLocalization();

  if (stageLabels.length === 0) return null;

  return (
    <div
      style={{
        padding: isNavigationMode ? stageLabelStyle.paddingNavigation : stageLabelStyle.padding,
        background: stageLabelStyle.background,
        borderBottom: `1px solid ${colors.HEADER_BORDER}`,
      }}
    >
      {isNavigationMode ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <StageStepButton
            label={uiLabels.previousStage}
            disabled={!canGoPrev}
            border={stageLabelStyle.navBorder}
            color={stageLabelStyle.navColor}
            onClick={onPreviousStage}
          >
            <ChevronLeftIcon color={stageLabelStyle.navColor} />
          </StageStepButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                padding: stageLabelStyle.activePillPadding,
                borderRadius: 999,
                background: colors.ICON_BG,
                color: colors.ICON_FG,
                fontFamily: typography.bodyFontFamily,
                fontSize: stageLabelStyle.activePillFontSize,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {stageLabels[activeStageIndex] ?? ''}
            </span>
            <span
              style={{
                fontSize: stageLabelStyle.counterFontSize,
                fontWeight: 500,
                color: isDarkMode ? 'rgba(216, 210, 199, 0.6)' : 'rgba(68, 75, 85, 0.55)',
                whiteSpace: 'nowrap',
              }}
            >
              {activeStageIndex + 1}/{stageLabels.length}
            </span>
          </div>
          <StageStepButton
            label={uiLabels.nextStage}
            disabled={!canGoNext}
            border={stageLabelStyle.navBorder}
            color={stageLabelStyle.navColor}
            onClick={onNextStage}
          >
            <ChevronRightIcon color={stageLabelStyle.navColor} />
          </StageStepButton>
        </div>
      ) : (
        <StageLabelGrid labels={stageLabels} isDarkMode={isDarkMode} />
      )}
    </div>
  );
}
