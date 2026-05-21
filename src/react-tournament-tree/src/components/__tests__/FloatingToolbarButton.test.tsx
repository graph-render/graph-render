import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FloatingToolbarButton } from '../Bracket/FloatingToolbarButton';
import { renderWithAppearance } from './testUtils';

const baseProps = {
  isDarkMode: false,
  isNavigationMode: false,
  onToggleNavigationMode: vi.fn(),
};

describe('FloatingToolbarButton', () => {
  it('renders the navigation toggle button', () => {
    renderWithAppearance(<FloatingToolbarButton {...baseProps} />);
    expect(screen.getByRole('button', { name: /navigation mode/i })).toBeInTheDocument();
  });

  it('has aria-pressed=false when not in navigation mode', () => {
    renderWithAppearance(<FloatingToolbarButton {...baseProps} isNavigationMode={false} />);
    const btn = screen.getByRole('button', { name: /enter navigation mode/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('has aria-pressed=true when in navigation mode', () => {
    renderWithAppearance(<FloatingToolbarButton {...baseProps} isNavigationMode />);
    const btn = screen.getByRole('button', { name: /exit navigation mode/i });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggleNavigationMode when button is clicked', () => {
    const onToggle = vi.fn();
    renderWithAppearance(
      <FloatingToolbarButton {...baseProps} onToggleNavigationMode={onToggle} />
    );
    fireEvent.click(screen.getByRole('button', { name: /navigation mode/i }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('renders in dark mode without crashing', () => {
    renderWithAppearance(<FloatingToolbarButton {...baseProps} isDarkMode />, undefined, true);
    expect(screen.getByRole('button', { name: /navigation mode/i })).toBeInTheDocument();
  });
});
