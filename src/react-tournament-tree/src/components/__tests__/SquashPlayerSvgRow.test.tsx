import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SquashPlayerSvgRow } from '../SquashNode/SquashPlayerSvgRow';
import { MOCK_COLORS } from './testUtils';

const baseProps = {
  nodeId: 'n1',
  player: { name: 'Player One', seed: 1 },
  playerIndex: 0,
  compact: false,
  isTBD: false,
  isWinner: false,
  isPlayerHovered: false,
  playerOpacity: 1,
  setCount: 2,
  scoreSegments: ['6', '4'],
  textColor: '#333',
  colors: MOCK_COLORS,
  rowY: 0,
  rowHeight: 50,
  nodeWidth: 280,
  insetX: 10,
  badgeSize: 24,
  badgePad: 6,
  badgeFontSize: 10,
  nameFontSize: 12,
  bodyFontFamily: 'sans-serif',
  playerTextX: 46,
  maxNameLength: 14,
  scoreGroupLeftX: 180,
  internalDividerX: 240,
  matchCountX: 260,
  scoreSegW: 22,
  scoreSegG: 4,
  scoreFontSize: 11,
  scoreFontFamily: 'monospace',
  matchCountFontSize: 12,
  badgeRadius: 6,
  onPlayerEnter: vi.fn(),
  onPlayerLeave: vi.fn(),
};

describe('SquashPlayerSvgRow', () => {
  it('renders player badge initials (PO for "Player One")', () => {
    render(
      <svg>
        <SquashPlayerSvgRow {...baseProps} />
      </svg>
    );
    expect(screen.getByText('PO')).toBeInTheDocument();
  });

  it('renders the set count', () => {
    render(
      <svg>
        <SquashPlayerSvgRow {...baseProps} setCount={3} />
      </svg>
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders score segments', () => {
    render(
      <svg>
        <SquashPlayerSvgRow {...baseProps} scoreSegments={['6', '4']} />
      </svg>
    );
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders a background rect', () => {
    render(
      <svg>
        <SquashPlayerSvgRow {...baseProps} />
      </svg>
    );
    expect(screen.getByTestId('player-svg-bg')).toBeInTheDocument();
  });

  it('renders an internal divider line', () => {
    render(
      <svg>
        <SquashPlayerSvgRow {...baseProps} />
      </svg>
    );
    // At least one line element (the vertical score divider)
    expect(screen.getByTestId('player-svg-divider')).toBeInTheDocument();
  });

  it('calls onPlayerEnter on mouseEnter', () => {
    const onPlayerEnter = vi.fn();
    render(
      <svg>
        <SquashPlayerSvgRow {...baseProps} onPlayerEnter={onPlayerEnter} />
      </svg>
    );
    fireEvent.mouseEnter(screen.getByTestId('player-svg-row'));
    expect(onPlayerEnter).toHaveBeenCalledWith(0, { name: 'Player One', seed: 1 });
  });

  it('calls onPlayerLeave on mouseLeave', () => {
    const onPlayerLeave = vi.fn();
    render(
      <svg>
        <SquashPlayerSvgRow {...baseProps} onPlayerLeave={onPlayerLeave} />
      </svg>
    );
    fireEvent.mouseLeave(screen.getByTestId('player-svg-row'));
    expect(onPlayerLeave).toHaveBeenCalledOnce();
  });

  it('renders second player (playerIndex=1) correctly', () => {
    render(
      <svg>
        <SquashPlayerSvgRow
          {...baseProps}
          player={{ name: 'Player Two', seed: 2 }}
          playerIndex={1}
          rowY={50}
        />
      </svg>
    );
    expect(screen.getByText('PT')).toBeInTheDocument();
  });
});
