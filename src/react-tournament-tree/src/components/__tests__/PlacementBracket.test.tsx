import type { PlacementMatch } from '@graph-render/types/tournament';
import { MatchStatus } from '@graph-render/types/tournament';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PlacementBracket } from '../PlacementBracket';
import { renderWithAppearance } from './testUtils';

const participants = ['Alice', 'Bob', 'Carol', 'Dave'];

const matches: readonly PlacementMatch[] = [
  {
    id: 'p5-r1-m1',
    round: 1,
    placement: 5,
    players: [{ name: 'Alice' }, { name: 'Bob' }],
    status: MatchStatus.Upcoming,
  },
  {
    id: 'p5-r1-m2',
    round: 1,
    placement: 7,
    players: [{ name: 'Carol' }, { name: 'Dave' }],
    status: MatchStatus.Upcoming,
  },
  {
    id: 'p5-r2-m1',
    round: 2,
    placement: 5,
    players: [{ name: 'TBD' }, { name: 'TBD' }],
    status: MatchStatus.Upcoming,
  },
  {
    id: 'p5-r2-m2',
    round: 2,
    placement: 7,
    players: [{ name: 'TBD' }, { name: 'TBD' }],
    status: MatchStatus.Upcoming,
  },
];

describe('PlacementBracket', () => {
  it('renders a region with accessible label', () => {
    renderWithAppearance(
      <PlacementBracket participants={participants} matches={matches} title="5th–8th Place" />
    );
    expect(screen.getByRole('region', { name: '5th–8th Place' })).toBeInTheDocument();
  });

  it('renders the placement category header', () => {
    renderWithAppearance(<PlacementBracket participants={participants} matches={matches} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Placement Bracket');
  });

  it('shows tier count in the title area', () => {
    renderWithAppearance(<PlacementBracket participants={participants} matches={matches} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('1 tier');
  });

  it('renders a heading for the placement tier', () => {
    renderWithAppearance(<PlacementBracket participants={participants} matches={matches} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('5th Place');
  });

  it('renders round headings', () => {
    renderWithAppearance(<PlacementBracket participants={participants} matches={matches} />);
    expect(screen.getByRole('heading', { name: 'Round 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Round 2' })).toBeInTheDocument();
  });

  it('renders player names in match cards', () => {
    renderWithAppearance(<PlacementBracket participants={participants} matches={matches} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
    expect(screen.getByText('Dave')).toBeInTheDocument();
  });

  it('shows "No placement matches yet" when matches are omitted', () => {
    renderWithAppearance(<PlacementBracket participants={participants} />);
    expect(screen.getByText(/no placement matches yet/i)).toBeInTheDocument();
  });

  it('shows completed match scores and bolds the winner', () => {
    const completedMatches: readonly PlacementMatch[] = [
      {
        id: 'p5-r2-m1',
        round: 2,
        placement: 5,
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        scores: [2, 1],
        status: MatchStatus.Completed,
      },
    ];
    renderWithAppearance(
      <PlacementBracket participants={participants} matches={completedMatches} />
    );
    expect(screen.getByText('2 - 1')).toBeInTheDocument();
    const aliceCells = screen.getAllByText('Alice');
    const boldAlice = aliceCells.find((el) => el.style.fontWeight === '700');
    expect(boldAlice).toBeDefined();
  });

  it('renders a custom label for a placement match', () => {
    const customMatches: readonly PlacementMatch[] = [
      {
        id: 'p3-r1-m1',
        round: 1,
        placement: 3,
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        status: MatchStatus.Upcoming,
        label: 'Bronze Match',
      },
    ];
    renderWithAppearance(<PlacementBracket participants={participants} matches={customMatches} />);
    expect(screen.getByText('Bronze Match')).toBeInTheDocument();
  });

  it('renders correctly in dark mode', () => {
    renderWithAppearance(
      <PlacementBracket participants={participants} matches={matches} isDarkMode />,
      undefined,
      true
    );
    expect(screen.getByRole('region', { name: /placement/i })).toBeInTheDocument();
  });

  it('renders correctly in compact mode', () => {
    renderWithAppearance(
      <PlacementBracket participants={participants} matches={matches} compact />,
      undefined,
      false,
      true
    );
    expect(screen.getByRole('region', { name: /placement/i })).toBeInTheDocument();
  });

  it('renders multiple tiers with distinct headings', () => {
    const multiTierMatches: readonly PlacementMatch[] = [
      {
        id: 'p3-r1-m1',
        round: 1,
        placement: 3,
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        status: MatchStatus.Upcoming,
      },
      {
        id: 'p5-r1-m1',
        round: 1,
        placement: 5,
        players: [{ name: 'Carol' }, { name: 'Dave' }],
        status: MatchStatus.Upcoming,
      },
    ];
    renderWithAppearance(
      <PlacementBracket participants={participants} matches={multiTierMatches} />
    );
    const tierHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(tierHeadings).toHaveLength(2);
    expect(tierHeadings[0]).toHaveTextContent('3rd Place');
    expect(tierHeadings[1]).toHaveTextContent('5th Place');
    // Shows 2 tiers count
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('2 tiers');
  });

  it('shows venue and schedule info in match card', () => {
    const scheduledMatch: readonly PlacementMatch[] = [
      {
        id: 'p5-r1-m1',
        round: 1,
        placement: 5,
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        status: MatchStatus.Upcoming,
        venue: 'Court A',
      },
    ];
    renderWithAppearance(<PlacementBracket participants={participants} matches={scheduledMatch} />);
    // Within the match card article there should be a reference to venue
    const article = screen.getByRole('article');
    expect(within(article).getByText('Court A')).toBeInTheDocument();
  });
});
