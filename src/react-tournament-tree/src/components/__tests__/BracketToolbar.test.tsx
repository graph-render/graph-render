import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BracketToolbar } from '../BracketToolbar';

const baseProps = {
  isDarkMode: false,
  isNavigationMode: false,
  onToggleNavigationMode: vi.fn(),
  onToggleDarkMode: vi.fn(),
  onExportSVG: vi.fn(),
};

describe('BracketToolbar', () => {
  it('renders three buttons', () => {
    render(<BracketToolbar {...baseProps} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByTestId('bracket-toolbar')).toHaveAttribute('data-print-hidden');
  });

  it('dark-mode button shows "Switch to Dark Mode" label in light mode', () => {
    render(<BracketToolbar {...baseProps} isDarkMode={false} />);
    expect(screen.getByRole('button', { name: 'Switch to Dark Mode' })).toBeInTheDocument();
  });

  it('dark-mode button shows "Switch to Light Mode" label in dark mode', () => {
    render(<BracketToolbar {...baseProps} isDarkMode />);
    expect(screen.getByRole('button', { name: 'Switch to Light Mode' })).toBeInTheDocument();
  });

  it('navigation-mode button has aria-pressed=false when not in navigation mode', () => {
    render(<BracketToolbar {...baseProps} isNavigationMode={false} />);
    const btn = screen.getByRole('button', { name: 'Enter Navigation Mode' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('navigation-mode button has aria-pressed=true when in navigation mode', () => {
    render(<BracketToolbar {...baseProps} isNavigationMode />);
    const btn = screen.getByRole('button', { name: 'Exit Navigation Mode' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggleDarkMode when dark-mode button is clicked', () => {
    const onToggleDarkMode = vi.fn();
    render(<BracketToolbar {...baseProps} onToggleDarkMode={onToggleDarkMode} />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to Dark Mode' }));
    expect(onToggleDarkMode).toHaveBeenCalledOnce();
  });

  it('calls onToggleNavigationMode when navigation button is clicked', () => {
    const onToggle = vi.fn();
    render(<BracketToolbar {...baseProps} onToggleNavigationMode={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'Enter Navigation Mode' }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('calls onExportSVG when export button is clicked', () => {
    const onExportSVG = vi.fn();
    render(<BracketToolbar {...baseProps} onExportSVG={onExportSVG} />);
    fireEvent.click(screen.getByRole('button', { name: 'Export as SVG' }));
    expect(onExportSVG).toHaveBeenCalledOnce();
  });
});
