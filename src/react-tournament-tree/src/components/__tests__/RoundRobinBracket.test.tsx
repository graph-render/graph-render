import { MatchStatus, type RoundRobinMatch } from '@graph-render/types/tournament';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RoundRobinBracket } from '../RoundRobinBracket';
import { renderWithAppearance } from './testUtils';

const participants = ['Alpha', 'Bravo', 'Charlie', 'Delta'];
const matches: readonly RoundRobinMatch[] = [
  {
    id: 'm1',
    players: [{ name: 'Alpha' }, { name: 'Bravo' }],
    round: 1,
    scores: [2, 1],
    status: MatchStatus.Completed,
  },
  {
    id: 'm2',
    players: [{ name: 'Charlie' }, { name: 'Delta' }],
    round: 1,
    scores: [1, 1],
    status: MatchStatus.Completed,
  },
  {
    id: 'm3',
    players: [{ name: 'Alpha' }, { name: 'Charlie' }],
    round: 2,
    status: MatchStatus.Upcoming,
  },
];

describe('RoundRobinBracket', () => {
  it('renders standings and schedule grouped by round', () => {
    renderWithAppearance(
      <RoundRobinBracket
        participants={participants}
        matches={matches}
        title="Group A"
        groupName="Pool A"
      />
    );

    expect(screen.getByRole('region', { name: /Group A: Pool A/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Standings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Schedule' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Round 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Round 2' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Alpha versus Bravo, round 1, 2 - 1/i)).toBeInTheDocument();
  });

  it('sorts standings from completed match results', () => {
    renderWithAppearance(<RoundRobinBracket participants={participants} matches={matches} />);

    const rows = screen.getAllByRole('row');
    expect(within(rows[1]!).getByText('Alpha')).toBeInTheDocument();
    expect(within(rows[1]!).getByText('3')).toBeInTheDocument();
    expect(within(rows[2]!).getByText('Charlie')).toBeInTheDocument();
    expect(within(rows[2]!).getAllByRole('cell').at(-1)).toHaveTextContent('1');
  });

  it('can generate the schedule when matches are omitted', () => {
    renderWithAppearance(<RoundRobinBracket participants={participants} />);

    expect(screen.getByRole('heading', { name: 'Round 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Round 3' })).toBeInTheDocument();
    expect(screen.getAllByText('upcoming').length).toBeGreaterThan(0);
  });

  it('localizes schedule labels and scheduled match metadata', () => {
    const scheduledAt = '2026-06-01T10:00:00Z';
    const expectedDate = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(scheduledAt));

    renderWithAppearance(
      <RoundRobinBracket
        participants={participants}
        matches={[
          {
            id: 'm-localized',
            players: [{ name: 'Alpha' }, { name: 'Bravo' }],
            round: 1,
            scheduledAt,
            status: MatchStatus.Upcoming,
            venue: 'Court 1',
          },
        ]}
        localization={{
          locale: 'en-US',
          timeZone: 'UTC',
          statusLabels: { upcoming: 'programmado' },
          uiLabels: {
            round: 'Ronda',
            schedule: 'Calendario',
            standings: 'Tabla',
            team: 'Equipo',
          },
        }}
      />
    );

    expect(screen.getByRole('heading', { name: 'Tabla' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Calendario' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ronda 1' })).toBeInTheDocument();
    expect(screen.getByText(`${expectedDate} · Court 1`)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alpha versus Bravo, ronda 1, programmado/i)).toBeInTheDocument();
  });
});
