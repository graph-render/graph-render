import { MatchStatus, type SwissMatch } from '@graph-render/types/tournament';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SwissBracket } from '../SwissBracket';
import { renderWithAppearance } from './testUtils';

const participants = ['Alice', 'Bob', 'Carol', 'Dave'];
const matches: readonly SwissMatch[] = [
  {
    id: 'r1-m1',
    players: [{ name: 'Alice' }, { name: 'Bob' }],
    round: 1,
    scores: [1, 0],
    status: MatchStatus.Completed,
  },
  {
    id: 'r1-m2',
    players: [{ name: 'Carol' }, { name: 'Dave' }],
    round: 1,
    scores: [0, 0],
    status: MatchStatus.Completed,
  },
  {
    id: 'r2-m1',
    players: [{ name: 'Alice' }, { name: 'Carol' }],
    round: 2,
    status: MatchStatus.Upcoming,
  },
];

describe('SwissBracket', () => {
  it('renders standings and schedule grouped by round', () => {
    renderWithAppearance(
      <SwissBracket
        participants={participants}
        matches={matches}
        title="Open Swiss"
        groupName="Division A"
      />
    );

    expect(screen.getByRole('region', { name: /Open Swiss: Division A/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Standings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Schedule' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Round 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Round 2' })).toBeInTheDocument();
  });

  it('shows standings sorted by points with tiebreaker columns', () => {
    renderWithAppearance(<SwissBracket participants={participants} matches={matches} />);

    const table = screen.getByRole('table', { name: 'Standings' });
    const headers = within(table).getAllByRole('columnheader');
    const headerTexts = headers.map((h) => h.textContent);

    expect(headerTexts).toContain('Pts');
    expect(headerTexts).toContain('BH');
    expect(headerTexts).toContain('SB');

    // Alice has 1 point; she should appear in row index 1 (after header row)
    const rows = within(table).getAllByRole('row');
    expect(within(rows[1]!).getByText('Alice')).toBeInTheDocument();
  });

  it('shows rank numbers in standings', () => {
    renderWithAppearance(<SwissBracket participants={participants} matches={matches} />);

    const table = screen.getByRole('table', { name: 'Standings' });
    const dataRows = within(table).getAllByRole('row').slice(1);
    // first cell of each row is the rank number
    expect(within(dataRows[0]!).getAllByRole('cell')[0]).toHaveTextContent('1');
    expect(within(dataRows[1]!).getAllByRole('cell')[0]).toHaveTextContent('2');
  });

  it('displays 0.5 draw points correctly', () => {
    renderWithAppearance(<SwissBracket participants={participants} matches={matches} />);

    const table = screen.getByRole('table', { name: 'Standings' });
    const rows = within(table).getAllByRole('row');
    // Carol and Dave drew — 0.5 pts each; points column is index 6
    const carolRow = rows.find((row) => within(row).queryByText('Carol'));
    expect(carolRow).toBeDefined();
    const carolCells = within(carolRow!).getAllByRole('cell');
    expect(carolCells[6]).toHaveTextContent('0.5');
  });

  it('shows "No pairings yet" when matches are omitted', () => {
    renderWithAppearance(<SwissBracket participants={participants} />);

    expect(screen.getByText(/no pairings yet/i)).toBeInTheDocument();
  });

  it('shows round count in title area', () => {
    renderWithAppearance(
      <SwissBracket participants={participants} matches={matches} title="Championship" />
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Championship');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('2 rounds');
  });

  it('localizes UI labels', () => {
    renderWithAppearance(
      <SwissBracket
        participants={participants}
        matches={matches}
        localization={{
          uiLabels: {
            standings: 'Classement',
            schedule: 'Planning',
            round: 'Ronde',
            buchholz: 'BH-FR',
            sonnebornBerger: 'SB-FR',
          },
        }}
      />
    );

    expect(screen.getByRole('heading', { name: 'Classement' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Planning' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ronde 1' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'BH-FR' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'SB-FR' })).toBeInTheDocument();
  });

  it('renders match cards with winner name bold', () => {
    renderWithAppearance(
      <SwissBracket
        participants={participants}
        matches={[
          {
            id: 'r1-m1',
            players: [{ name: 'Alice' }, { name: 'Bob' }],
            round: 1,
            scores: [1, 0],
            status: MatchStatus.Completed,
          },
        ]}
      />
    );

    // Alice should be bolded as winner
    const aliceCells = screen.getAllByText('Alice');
    const boldAlice = aliceCells.find((el) => el.style.fontWeight === '700');
    expect(boldAlice).toBeDefined();
  });

  it('renders correctly with isDarkMode and compact props', () => {
    renderWithAppearance(
      <SwissBracket
        participants={participants}
        matches={matches}
        isDarkMode
        compact
        title="Dark Compact"
      />
    );

    expect(screen.getByRole('region', { name: /Dark Compact/i })).toBeInTheDocument();
  });

  it('renders scheduled match venue and date', () => {
    const scheduledAt = '2026-07-01T14:00:00Z';
    const expectedDate = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(scheduledAt));

    renderWithAppearance(
      <SwissBracket
        participants={participants}
        matches={[
          {
            id: 'r1-m1',
            players: [{ name: 'Alice' }, { name: 'Bob' }],
            round: 1,
            scheduledAt,
            status: MatchStatus.Upcoming,
            venue: 'Board 1',
          },
        ]}
        localization={{ locale: 'en-US', timeZone: 'UTC' }}
      />
    );

    expect(screen.getByText(`${expectedDate} · Board 1`)).toBeInTheDocument();
  });
});
