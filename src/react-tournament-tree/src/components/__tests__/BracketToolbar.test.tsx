import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BracketToolbar } from '../BracketToolbar';

const baseProps = {
  isDarkMode: false,
  isNavigationMode: false,
  onToggleNavigationMode: vi.fn(),
  onToggleDarkMode: vi.fn(),
  onExportSVG: vi.fn(),
  onExportPNG: vi.fn(),
};

describe('BracketToolbar', () => {
  it('renders four buttons by default (SVG, PNG, Nav, DarkMode)', () => {
    render(<BracketToolbar {...baseProps} />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByTestId('bracket-toolbar')).toHaveAttribute('data-print-hidden');
  });

  it('renders five buttons when onExportPDF is provided', () => {
    render(<BracketToolbar {...baseProps} onExportPDF={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Export as PDF' })).toBeInTheDocument();
  });

  it('does not render a PDF button when onExportPDF is not provided', () => {
    render(<BracketToolbar {...baseProps} />);
    expect(screen.queryByRole('button', { name: 'Export as PDF' })).not.toBeInTheDocument();
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

  it('calls onExportSVG when SVG export button is clicked', () => {
    const onExportSVG = vi.fn();
    render(<BracketToolbar {...baseProps} onExportSVG={onExportSVG} />);
    fireEvent.click(screen.getByRole('button', { name: 'Export as SVG' }));
    expect(onExportSVG).toHaveBeenCalledOnce();
  });

  it('calls onExportPNG when PNG export button is clicked', () => {
    const onExportPNG = vi.fn();
    render(<BracketToolbar {...baseProps} onExportPNG={onExportPNG} />);
    fireEvent.click(screen.getByRole('button', { name: 'Export as PNG' }));
    expect(onExportPNG).toHaveBeenCalledOnce();
  });

  it('calls onExportPDF when PDF export button is clicked', () => {
    const onExportPDF = vi.fn();
    render(<BracketToolbar {...baseProps} onExportPDF={onExportPDF} />);
    fireEvent.click(screen.getByRole('button', { name: 'Export as PDF' }));
    expect(onExportPDF).toHaveBeenCalledOnce();
  });
});
