import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BracketVertexOptionsProvider } from '../../contexts/BracketVertexOptionsContext';
import { resolveBracketAppearance } from '../../utils/resolveBracketAppearance';
import { SquashPlayerHtmlRow } from '../SquashNode/SquashPlayerHtmlRow';
import { MOCK_COLORS } from './testUtils';

const resolved = resolveBracketAppearance(undefined, false, false);

const PLAYER_ONE_NAME = 'Player One';

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

const baseProps = {
  nodeId: 'n1',
  player: { name: PLAYER_ONE_NAME, seed: 1, country: 'eg' },
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
  nodeHeight: 100,
  scoreGroupWidth: 60,
  matchCard: resolved.matchCard,
  bodyFontFamily: 'sans-serif',
  scoreFontFamily: 'monospace',
  onPlayerEnter: vi.fn(),
  onPlayerLeave: vi.fn(),
};

describe('SquashPlayerHtmlRow', () => {
  it('renders the player name', () => {
    render(<SquashPlayerHtmlRow {...baseProps} />);
    expect(screen.getByText(PLAYER_ONE_NAME)).toBeInTheDocument();
  });

  it('renders player badge initials (PO for "Player One")', () => {
    render(<SquashPlayerHtmlRow {...baseProps} />);
    expect(screen.getByLabelText(`crest-${PLAYER_ONE_NAME}`)).toHaveTextContent('PO');
  });

  it('renders set count', () => {
    render(<SquashPlayerHtmlRow {...baseProps} setCount={2} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders score segments', () => {
    render(<SquashPlayerHtmlRow {...baseProps} scoreSegments={['6', '4']} />);
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('calls onPlayerEnter with correct args when mouse enters', () => {
    const onPlayerEnter = vi.fn();
    render(<SquashPlayerHtmlRow {...baseProps} onPlayerEnter={onPlayerEnter} />);
    fireEvent.mouseEnter(screen.getByTestId('player-html-row'));
    expect(onPlayerEnter).toHaveBeenCalledWith(0, {
      name: PLAYER_ONE_NAME,
      seed: 1,
      country: 'eg',
    });
  });

  it('calls onPlayerLeave when mouse leaves', () => {
    const onPlayerLeave = vi.fn();
    render(<SquashPlayerHtmlRow {...baseProps} onPlayerLeave={onPlayerLeave} />);
    fireEvent.mouseLeave(screen.getByTestId('player-html-row'));
    expect(onPlayerLeave).toHaveBeenCalledOnce();
  });

  it('renders correctly in winner state', () => {
    render(<SquashPlayerHtmlRow {...baseProps} isWinner />);
    // Winner badge has different bg — just check no crash & name visible
    expect(screen.getByText(PLAYER_ONE_NAME)).toBeInTheDocument();
  });

  it('applies reduced opacity when playerOpacity < 1', () => {
    render(<SquashPlayerHtmlRow {...baseProps} playerOpacity={0.6} />);
    // opacity is applied via inline style on the wrapper div — just check no crash
    expect(screen.getByText(PLAYER_ONE_NAME)).toBeInTheDocument();
  });

  it('renders player index 1 (second player) correctly', () => {
    render(
      <SquashPlayerHtmlRow
        {...baseProps}
        player={{ name: 'Player Two', seed: 2 }}
        playerIndex={1}
      />
    );
    expect(screen.getByText('Player Two')).toBeInTheDocument();
    expect(screen.getByLabelText('crest-Player Two')).toHaveTextContent('PT');
  });

  it('renders the seed in brackets after the name and the country below', () => {
    render(<SquashPlayerHtmlRow {...baseProps} />);
    expect(screen.getByTestId('player-html-seed')).toHaveTextContent(/^\(1\)$/);
    expect(screen.getByTestId('player-html-metadata')).toHaveTextContent(/^EG$/);
  });

  it('omits the country line for a seeded player without a country', () => {
    render(<SquashPlayerHtmlRow {...baseProps} player={{ name: 'Player Three', seed: 3 }} />);
    expect(screen.getByTestId('player-html-seed')).toHaveTextContent('(3)');
    expect(screen.queryByTestId('player-html-metadata')).not.toBeInTheDocument();
  });

  it('omits metadata when seed and country are absent', () => {
    render(<SquashPlayerHtmlRow {...baseProps} player={{ name: 'Player Three' }} />);
    expect(screen.queryByTestId('player-html-seed')).not.toBeInTheDocument();
    expect(screen.queryByTestId('player-html-metadata')).not.toBeInTheDocument();
  });

  it('renders a flag image instead of country text when countryFlags resolves a URL', () => {
    render(withFlags(<SquashPlayerHtmlRow {...baseProps} />));
    const flag = screen.getByTestId('player-html-flag');
    expect(flag).toHaveAttribute('src', '/flags/eg.svg');
    expect(flag).toHaveAttribute('alt', 'EG');
    expect(screen.getByTestId('player-html-metadata')).toHaveTextContent(/^$/);
    expect(screen.getByTestId('player-html-seed')).toHaveTextContent('(1)');
  });

  it('renders the avatar image instead of initials when avatarUrl is set', () => {
    render(
      <SquashPlayerHtmlRow
        {...baseProps}
        player={{ ...baseProps.player, avatarUrl: '/avatars/p1.jpg' }}
      />
    );
    expect(screen.getByTestId('player-html-avatar')).toHaveAttribute('src', '/avatars/p1.jpg');
    expect(screen.getByLabelText(`crest-${PLAYER_ONE_NAME}`)).not.toHaveTextContent('PO');
  });

  it('falls back to initials when the avatar fails to load', () => {
    render(
      <SquashPlayerHtmlRow
        {...baseProps}
        player={{ ...baseProps.player, avatarUrl: '/avatars/broken.jpg' }}
      />
    );
    fireEvent.error(screen.getByTestId('player-html-avatar'));
    expect(screen.queryByTestId('player-html-avatar')).not.toBeInTheDocument();
    expect(screen.getByLabelText(`crest-${PLAYER_ONE_NAME}`)).toHaveTextContent('PO');
  });
});
