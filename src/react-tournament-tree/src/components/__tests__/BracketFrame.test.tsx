import { VerticalStagePosition } from '@graph-render/types';
import { screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { BracketFrame } from '../Bracket/BracketFrame';
import { renderWithAppearance } from './testUtils';

const baseProps = {
  title: 'World Championship',
  badgeText: 'PSA',
  stageLabels: ['QF', 'SF', 'Final'],
  isDarkMode: false,
  isNavigationMode: false,
  stageViews: [],
  activeStageIndex: 0,
  verticalStagePosition: VerticalStagePosition.Center,
  canPagePlayersVertically: false,
  contentViewportRef: React.createRef<HTMLDivElement>(),
  showToolbar: false,
  compact: false,
  onToggleNavigationMode: vi.fn(),
  onPreviousStage: vi.fn(),
  onNextStage: vi.fn(),
  onPagePlayersUp: vi.fn(),
  onPagePlayersDown: vi.fn(),
  onToggleDarkMode: vi.fn(),
  onExportSVG: vi.fn(),
};

describe('BracketFrame', () => {
  it('renders the title', () => {
    renderWithAppearance(<BracketFrame {...baseProps}>content</BracketFrame>);
    expect(screen.getByText('World Championship')).toBeInTheDocument();
  });

  it('renders children', () => {
    renderWithAppearance(
      <BracketFrame {...baseProps}>
        <div data-testid="child">child</div>
      </BracketFrame>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders stage labels', () => {
    renderWithAppearance(<BracketFrame {...baseProps}>content</BracketFrame>);
    expect(screen.getByText('QF')).toBeInTheDocument();
    expect(screen.getByText('SF')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  it('does not render FloatingToolbarButton when showToolbar is false', () => {
    renderWithAppearance(
      <BracketFrame {...baseProps} showToolbar={false}>
        content
      </BracketFrame>
    );
    expect(screen.queryByRole('button', { name: /navigation mode/i })).not.toBeInTheDocument();
  });

  it('renders FloatingToolbarButton when showToolbar is true', () => {
    renderWithAppearance(
      <BracketFrame {...baseProps} showToolbar>
        content
      </BracketFrame>
    );
    // Both BracketToolbar and FloatingToolbarButton render navigation-mode buttons
    const navBtns = screen.getAllByRole('button', { name: /navigation mode/i });
    expect(navBtns.length).toBeGreaterThanOrEqual(1);
  });

  it('renders StageNavigationControls in navigation mode with enough stageViews', () => {
    const stageViews = [
      {
        index: 0,
        label: 'QF',
        bounds: { minX: 0, maxX: 300, minY: 0, maxY: 200, width: 300, height: 200 },
        nodeIds: [],
      },
      {
        index: 1,
        label: 'SF',
        bounds: { minX: 300, maxX: 600, minY: 0, maxY: 200, width: 300, height: 200 },
        nodeIds: [],
      },
    ];
    renderWithAppearance(
      <BracketFrame {...baseProps} isNavigationMode stageViews={stageViews}>
        content
      </BracketFrame>
    );
    expect(screen.getByRole('button', { name: 'Go to previous stage' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to next stage' })).toBeInTheDocument();
  });

  it('renders in dark mode without crashing', () => {
    renderWithAppearance(
      <BracketFrame {...baseProps} isDarkMode>
        content
      </BracketFrame>,
      undefined,
      true
    );
    expect(screen.getByText('World Championship')).toBeInTheDocument();
  });
});
