interface StageStepButtonProps {
  readonly label: string;
  readonly disabled: boolean;
  readonly border: string;
  readonly color: string;
  readonly children: React.ReactNode;
  readonly onClick: () => void;
}

export function StageStepButton({
  label,
  disabled,
  border,
  color,
  children,
  onClick,
}: StageStepButtonProps) {
  return (
    <button
      type="button"
      data-print-hidden
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 28,
        height: 28,
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: 'transparent',
        color,
        display: 'grid',
        placeItems: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}
