import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BracketVertexOptionsProvider } from '../../contexts/BracketVertexOptionsContext';
import { SquashPlayerSvgRow } from '../SquashNode/SquashPlayerSvgRow';
import { MOCK_COLORS } from './testUtils';

const baseProps = {
  nodeId: 'n1',
  player: { name: 'Player One', seed: 1, country: 'eg' },
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

const withFlags = (
  children: React.ReactNode,
  getUrl: (code: string) => string | undefined = (code) => `/flags/${code}.svg`
) => (
  <BracketVertexOptionsProvider
    value={{
      compact: false,
      nodeRenderMode: undefined,
      onInvalidNode: undefined,
      countryFlags: { getUrl, height: 15 },
    }}
  >
    {children}
  </BracketVertexOptionsProvider>
);

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
    expect(onPlayerEnter).toHaveBeenCalledWith(0, {
      name: 'Player One',
      seed: 1,
      country: 'eg',
    });
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

  it('renders the seed in brackets after the name and the country below', () => {
    render(
      <svg>
        <SquashPlayerSvgRow {...baseProps} />
      </svg>
    );
    expect(screen.getByTestId('player-svg-name')).toHaveTextContent('Player One (1)');
    expect(screen.getByTestId('player-svg-seed')).toHaveTextContent('(1)');
    expect(screen.getByTestId('player-svg-metadata')).toHaveTextContent(/^EG$/);
  });

  it('truncates the name but keeps the seed visible', () => {
    render(
      <svg>
        <SquashPlayerSvgRow
          {...baseProps}
          player={{ name: 'Maximilian Longsurname-Whitfield', seed: 12 }}
        />
      </svg>
    );
    expect(screen.getByTestId('player-svg-name')).toHaveTextContent(/… \(12\)$/);
  });

  it('omits SVG metadata when seed and country are absent', () => {
    render(
      <svg>
        <SquashPlayerSvgRow {...baseProps} player={{ name: 'Player Three' }} />
      </svg>
    );
    expect(screen.queryByTestId('player-svg-metadata')).not.toBeInTheDocument();
  });

  it('renders a flag image on the country line when countryFlags resolves a URL', () => {
    render(
      withFlags(
        <svg>
          <SquashPlayerSvgRow {...baseProps} />
        </svg>
      )
    );
    const flag = screen.getByTestId('player-svg-flag');
    expect(flag).toHaveAttribute('href', '/flags/eg.svg');
    expect(flag).toHaveAttribute('height', '15');
    expect(flag).toHaveAttribute('width', '20');
    expect(flag).toHaveTextContent('EG');
    expect(screen.queryByTestId('player-svg-metadata')).not.toBeInTheDocument();
    expect(screen.getByTestId('player-svg-seed')).toHaveTextContent('(1)');
    expect(flag).toHaveAttribute('clip-path', expect.stringMatching(/^url\(#flag-.+\)$/));
  });

  it('keeps the name clear of the flag', () => {
    render(
      withFlags(
        <svg>
          <SquashPlayerSvgRow {...baseProps} />
        </svg>
      )
    );
    const nameBottom = Number(screen.getByTestId('player-svg-name').getAttribute('y')) + 12 / 2;
    expect(Number(screen.getByTestId('player-svg-flag').getAttribute('y'))).toBeGreaterThan(
      nameBottom
    );
  });

  it('renders a flag without seed text for an unseeded player', () => {
    render(
      withFlags(
        <svg>
          <SquashPlayerSvgRow {...baseProps} player={{ name: 'Player Two', country: 'ua' }} />
        </svg>
      )
    );
    expect(screen.getByTestId('player-svg-flag')).toHaveAttribute('href', '/flags/ua.svg');
    expect(screen.queryByTestId('player-svg-metadata')).not.toBeInTheDocument();
  });

  it('falls back to country text when countryFlags returns no URL', () => {
    render(
      withFlags(
        <svg>
          <SquashPlayerSvgRow {...baseProps} />
        </svg>,
        () => undefined
      )
    );
    expect(screen.queryByTestId('player-svg-flag')).not.toBeInTheDocument();
    expect(screen.getByTestId('player-svg-metadata')).toHaveTextContent(/^EG$/);
  });

  it('renders a clipped avatar image instead of initials when avatarUrl is set', () => {
    render(
      <svg>
        <SquashPlayerSvgRow
          {...baseProps}
          player={{ ...baseProps.player, avatarUrl: '/avatars/p1.jpg' }}
        />
      </svg>
    );
    const avatar = screen.getByTestId('player-svg-avatar');
    expect(avatar).toHaveAttribute('href', '/avatars/p1.jpg');
    expect(avatar).toHaveAttribute('width', '24');
    expect(avatar).toHaveAttribute('clip-path', expect.stringMatching(/^url\(#avatar-.+\)$/));
    expect(screen.queryByText('PO')).not.toBeInTheDocument();
  });

  it('falls back to initials when the avatar fails to load', () => {
    render(
      <svg>
        <SquashPlayerSvgRow
          {...baseProps}
          player={{ ...baseProps.player, avatarUrl: '/avatars/broken.jpg' }}
        />
      </svg>
    );
    fireEvent.error(screen.getByTestId('player-svg-avatar'));
    expect(screen.queryByTestId('player-svg-avatar')).not.toBeInTheDocument();
    expect(screen.getByText('PO')).toBeInTheDocument();
  });
});
