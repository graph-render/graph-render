import { useBracketAppearance } from '../../contexts/BracketAppearanceContext';
import { BracketToolbar } from '../BracketToolbar';
import { TrophyIcon } from '../icons';

interface BracketHeaderProps {
  readonly title: string;
  readonly badgeText: string;
  readonly compact: boolean;
  readonly isDarkMode: boolean;
  readonly isNavigationMode: boolean;
  readonly showToolbar: boolean;
  readonly onToggleNavigationMode: () => void;
  readonly onToggleDarkMode: () => void;
  readonly onExportSVG: () => void;
  readonly onExportPNG: () => void;
  readonly onExportPDF?: (() => void) | undefined;
}

export function BracketHeader({
  title,
  badgeText,
  compact,
  isDarkMode,
  isNavigationMode,
  showToolbar,
  onToggleNavigationMode,
  onToggleDarkMode,
  onExportSVG,
  onExportPNG,
  onExportPDF,
}: BracketHeaderProps) {
  const { colors, header, typography } = useBracketAppearance();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: header.gap,
        minHeight: header.minHeight,
        padding: header.padding,
        background: colors.HEADER_BG,
        borderBottom: `1px solid ${colors.HEADER_BORDER}`,
      }}
    >
      <div
        style={{
          width: header.iconSize,
          height: header.iconSize,
          borderRadius: header.iconRadius,
          display: 'grid',
          placeItems: 'center',
          background: colors.ICON_BG,
          color: colors.ICON_FG,
          flexShrink: 0,
        }}
      >
        <TrophyIcon />
      </div>
      <h2
        style={{
          fontFamily: typography.bodyFontFamily,
          fontSize: header.titleFontSize,
          fontWeight: 600,
          color: colors.HEADER_TITLE,
          margin: 0,
        }}
      >
        {title}
      </h2>
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          minHeight: compact ? 18 : 28,
          padding: header.badgePadding,
          borderRadius: 999,
          background: colors.BADGE_BG,
          color: colors.BADGE_TEXT,
          fontFamily: typography.bodyFontFamily,
          fontSize: header.badgeFontSize,
          fontWeight: 600,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: header.badgeDotSize,
            height: header.badgeDotSize,
            borderRadius: '50%',
            background: colors.BADGE_DOT,
            flexShrink: 0,
          }}
        />
        {badgeText}
      </div>
      {showToolbar ? (
        <BracketToolbar
          isDarkMode={isDarkMode}
          isNavigationMode={isNavigationMode}
          onToggleNavigationMode={onToggleNavigationMode}
          onToggleDarkMode={onToggleDarkMode}
          onExportSVG={onExportSVG}
          onExportPNG={onExportPNG}
          onExportPDF={onExportPDF}
        />
      ) : null}
    </div>
  );
}
