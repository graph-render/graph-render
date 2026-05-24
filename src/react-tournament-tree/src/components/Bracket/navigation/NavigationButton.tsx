export interface NavigationColors {
  readonly text: string;
  readonly background: string;
  readonly border: string;
  readonly shadow: string;
}

export function getNavigationColors(isDarkMode: boolean): NavigationColors {
  return {
    text: isDarkMode ? '#f7f5ef' : '#3f4a38',
    background: isDarkMode ? 'rgba(35, 43, 51, 0.92)' : 'rgba(255, 255, 255, 0.92)',
    border: isDarkMode ? '#46505c' : '#ddd7cb',
    shadow: isDarkMode ? '0 12px 30px rgba(0, 0, 0, 0.22)' : '0 12px 30px rgba(45, 45, 45, 0.12)',
  };
}

export function RoundNavigationButton({
  label,
  disabled,
  colors,
  children,
  onClick,
  style,
}: {
  readonly label: string;
  readonly disabled: boolean;
  readonly colors: NavigationColors;
  readonly children: React.ReactNode;
  readonly onClick: () => void;
  readonly style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      data-print-hidden
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 42,
        height: 42,
        borderRadius: 999,
        border: `1px solid ${colors.border}`,
        background: colors.background,
        color: colors.text,
        display: 'grid',
        placeItems: 'center',
        boxShadow: colors.shadow,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'default' : 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
