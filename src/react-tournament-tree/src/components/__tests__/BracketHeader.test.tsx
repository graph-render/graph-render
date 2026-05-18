import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BracketHeader } from '../Bracket/BracketHeader';
import { renderWithAppearance } from './testUtils';

const baseProps = {
  title: 'World Championship',
  badgeText: 'PSA World',
  compact: false,
  isDarkMode: false,
  isNavigationMode: false,
  showToolbar: false,
  onToggleNavigationMode: vi.fn(),
  onToggleDarkMode: vi.fn(),
  onExportSVG: vi.fn(),
};

describe('BracketHeader', () => {
  it('renders the title', () => {
    renderWithAppearance(<BracketHeader {...baseProps} />);
    expect(screen.getByText('World Championship')).toBeInTheDocument();
  });

  it('renders the badge text', () => {
    renderWithAppearance(<BracketHeader {...baseProps} />);
    expect(screen.getByText('PSA World')).toBeInTheDocument();
  });

  it('does not render toolbar when showToolbar is false', () => {
    renderWithAppearance(<BracketHeader {...baseProps} showToolbar={false} />);
    // Toolbar buttons should not be present
    expect(screen.queryByRole('button', { name: /dark mode/i })).not.toBeInTheDocument();
  });

  it('renders toolbar when showToolbar is true', () => {
    renderWithAppearance(<BracketHeader {...baseProps} showToolbar />);
    // BracketToolbar renders multiple buttons
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('renders trophy icon', () => {
    renderWithAppearance(<BracketHeader {...baseProps} />);
    expect(screen.getByTestId('trophy-icon')).toBeInTheDocument();
  });

  it('renders in dark mode without crashing', () => {
    renderWithAppearance(<BracketHeader {...baseProps} isDarkMode />, undefined, true);
    expect(screen.getByText('World Championship')).toBeInTheDocument();
  });

  it('renders in compact mode without crashing', () => {
    renderWithAppearance(<BracketHeader {...baseProps} compact />, undefined, false, true);
    expect(screen.getByText('PSA World')).toBeInTheDocument();
  });
});
