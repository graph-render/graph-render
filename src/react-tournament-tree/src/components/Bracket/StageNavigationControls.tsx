import { VerticalStagePosition } from '@graph-render/types/tournament';

import { useBracketLocalization } from '../../contexts/BracketLocalizationContext';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from '../icons';
import { getNavigationColors, RoundNavigationButton } from './navigation/NavigationButton';

interface StageNavigationControlsProps {
  readonly isDarkMode: boolean;
  readonly activeStageIndex: number;
  readonly stageCount: number;
  readonly verticalStagePosition: VerticalStagePosition;
  readonly canPagePlayersVertically: boolean;
  readonly onPreviousStage: () => void;
  readonly onNextStage: () => void;
  readonly onPagePlayersUp: () => void;
  readonly onPagePlayersDown: () => void;
}

export function StageNavigationControls({
  isDarkMode,
  activeStageIndex,
  stageCount,
  verticalStagePosition,
  canPagePlayersVertically,
  onPreviousStage,
  onNextStage,
  onPagePlayersUp,
  onPagePlayersDown,
}: StageNavigationControlsProps) {
  const { uiLabels } = useBracketLocalization();

  if (stageCount <= 1) return null;
  const colors = getNavigationColors(isDarkMode);
  const canGoPrev = activeStageIndex > 0;
  const canGoNext = activeStageIndex < stageCount - 1;
  const canPageUp =
    canPagePlayersVertically && verticalStagePosition === VerticalStagePosition.Bottom;
  const canPageDown =
    canPagePlayersVertically && verticalStagePosition === VerticalStagePosition.Top;

  return (
    <>
      <OverlayButton
        label={uiLabels.goToPreviousStage}
        position="left"
        disabled={!canGoPrev}
        colors={colors}
        onClick={onPreviousStage}
      >
        <ChevronLeftIcon color={colors.text} />
      </OverlayButton>
      <OverlayButton
        label={uiLabels.goToNextStage}
        position="right"
        disabled={!canGoNext}
        colors={colors}
        onClick={onNextStage}
      >
        <ChevronRightIcon color={colors.text} />
      </OverlayButton>
      {canPagePlayersVertically ? (
        <div
          style={{
            position: 'absolute',
            right: 18,
            bottom: 86,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <RoundNavigationButton
            label={uiLabels.showUpperPlayers}
            disabled={!canPageUp}
            colors={colors}
            onClick={onPagePlayersUp}
          >
            <ChevronUpIcon color={colors.text} />
          </RoundNavigationButton>
          <RoundNavigationButton
            label={uiLabels.showLowerPlayers}
            disabled={!canPageDown}
            colors={colors}
            onClick={onPagePlayersDown}
          >
            <ChevronDownIcon color={colors.text} />
          </RoundNavigationButton>
        </div>
      ) : null}
    </>
  );
}

function OverlayButton({
  label,
  position,
  disabled,
  colors,
  children,
  onClick,
}: {
  readonly label: string;
  readonly position: 'left' | 'right';
  readonly disabled: boolean;
  readonly colors: ReturnType<typeof getNavigationColors>;
  readonly children: React.ReactNode;
  readonly onClick: () => void;
}) {
  return (
    <RoundNavigationButton
      label={label}
      disabled={disabled}
      colors={colors}
      onClick={onClick}
      style={{ position: 'absolute', [position]: 14, top: '50%', transform: 'translateY(-50%)' }}
    >
      {children}
    </RoundNavigationButton>
  );
}
