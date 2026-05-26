import React from 'react';

import {
  DownloadIcon,
  PdfExportIcon,
  PngExportIcon,
  SunMoonIcon,
  ToolbarNavigationIcon,
} from './icons';

interface BracketToolbarProps {
  readonly isDarkMode: boolean;
  readonly isNavigationMode: boolean;
  readonly onToggleDarkMode: () => void;
  readonly onToggleNavigationMode: () => void;
  readonly onExportSVG: () => void;
  readonly onExportPNG: () => void;
  readonly onExportPDF?: (() => void) | undefined;
}

export const BracketToolbar = React.memo<BracketToolbarProps>(function BracketToolbar({
  isDarkMode,
  isNavigationMode,
  onToggleDarkMode,
  onToggleNavigationMode,
  onExportSVG,
  onExportPNG,
  onExportPDF,
}) {
  const buttonBaseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 10,
    border: `1px solid ${isDarkMode ? '#38424d' : '#e4ded2'}`,
    background: isDarkMode ? '#232b33' : '#f7f3ec',
    color: isDarkMode ? '#f7f5ef' : '#4b5563',
    cursor: 'pointer',
    boxShadow: 'none',
    transition: 'background-color 120ms ease, color 120ms ease, transform 120ms ease',
  };

  return (
    <div
      data-print-hidden
      data-testid="bracket-toolbar"
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <button
        type="button"
        onClick={onExportSVG}
        style={buttonBaseStyle}
        aria-label="Export as SVG"
      >
        <DownloadIcon />
      </button>

      <button
        type="button"
        onClick={onExportPNG}
        style={buttonBaseStyle}
        aria-label="Export as PNG"
      >
        <PngExportIcon />
      </button>

      {onExportPDF != null ? (
        <button
          type="button"
          onClick={onExportPDF}
          style={buttonBaseStyle}
          aria-label="Export as PDF"
        >
          <PdfExportIcon />
        </button>
      ) : null}

      <button
        type="button"
        onClick={onToggleNavigationMode}
        style={{
          ...buttonBaseStyle,
          background: isNavigationMode
            ? isDarkMode
              ? '#33403d'
              : '#e7ede3'
            : buttonBaseStyle.background,
          borderColor: isNavigationMode
            ? isDarkMode
              ? '#6d8470'
              : '#b8c7ae'
            : (buttonBaseStyle.border as string),
          color: isNavigationMode ? (isDarkMode ? '#f5f8f2' : '#516347') : buttonBaseStyle.color,
        }}
        aria-label={isNavigationMode ? 'Exit Navigation Mode' : 'Enter Navigation Mode'}
        aria-pressed={isNavigationMode}
      >
        <ToolbarNavigationIcon isActive={isNavigationMode} />
      </button>

      <button
        type="button"
        onClick={onToggleDarkMode}
        style={buttonBaseStyle}
        aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <SunMoonIcon isDarkMode={isDarkMode} />
      </button>
    </div>
  );
});

BracketToolbar.displayName = 'BracketToolbar';
