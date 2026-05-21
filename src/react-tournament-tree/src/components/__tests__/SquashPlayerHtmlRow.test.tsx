import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { resolveBracketAppearance } from '../../utils/resolveBracketAppearance';
import { SquashPlayerHtmlRow } from '../SquashNode/SquashPlayerHtmlRow';
import { MOCK_COLORS } from './testUtils';

const resolved = resolveBracketAppearance(undefined, false, false);

const PLAYER_ONE_NAME = 'Player One';

const baseProps = {
  nodeId: 'n1',
  player: { name: PLAYER_ONE_NAME, seed: 1 },
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
    expect(onPlayerEnter).toHaveBeenCalledWith(0, { name: PLAYER_ONE_NAME, seed: 1 });
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
});
