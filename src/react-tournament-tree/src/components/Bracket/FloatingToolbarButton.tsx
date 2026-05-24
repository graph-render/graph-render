import { useBracketAppearance } from '../../contexts/BracketAppearanceContext';
import { StageNavigationIcon } from '../icons';

interface FloatingToolbarButtonProps {
  readonly isDarkMode: boolean;
  readonly isNavigationMode: boolean;
  readonly onToggleNavigationMode: () => void;
}

export function FloatingToolbarButton({
  isDarkMode,
  isNavigationMode,
  onToggleNavigationMode,
}: FloatingToolbarButtonProps) {
  const { colors } = useBracketAppearance();
  const border = isDarkMode ? '#38424d' : '#e5dfd4';
  const text = isNavigationMode
    ? isDarkMode
      ? '#f4f8f1'
      : '#516347'
    : isDarkMode
      ? '#d8d2c7'
      : '#59606c';

  return (
    <div
      data-print-hidden
      style={{
        position: 'absolute',
        right: 18,
        top: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 8,
        borderRadius: 22,
        border: `1px solid ${border}`,
        background: isDarkMode ? 'rgba(35, 43, 51, 0.94)' : 'rgba(255, 255, 255, 0.94)',
        boxShadow: isDarkMode
          ? '0 18px 40px rgba(0, 0, 0, 0.28)'
          : '0 18px 40px rgba(45, 45, 45, 0.12)',
      }}
    >
      <button
        type="button"
        onClick={onToggleNavigationMode}
        aria-pressed={isNavigationMode}
        aria-label={isNavigationMode ? 'Exit Navigation Mode' : 'Enter Navigation Mode'}
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          border: `1px solid ${isNavigationMode ? colors.ICON_BG : border}`,
          background: isNavigationMode ? colors.ICON_BG : 'transparent',
          color: isNavigationMode ? colors.ICON_FG : text,
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
        }}
      >
        <StageNavigationIcon color={isNavigationMode ? colors.ICON_FG : text} />
      </button>
    </div>
  );
}
