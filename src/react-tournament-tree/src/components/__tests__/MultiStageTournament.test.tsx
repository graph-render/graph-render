import { MatchStatus, type RoundRobinGroup } from '@graph-render/types/tournament';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { generateSingleEliminationBracket } from '../../utils/tournament';
import { MultiStageTournament } from '../MultiStageTournament';

const createGroup = (id: string, names: readonly string[]): RoundRobinGroup => {
  const participants = names.map((name) => ({ name }));

  return {
    id,
    matches: [
      {
        id: `${id}-m1`,
        players: [participants[0]!, participants[1]!],
        round: 1,
        scores: [2, 0],
        status: MatchStatus.Completed,
      },
      {
        id: `${id}-m2`,
        players: [participants[2]!, participants[3]!],
        round: 1,
        scores: [2, 1],
        status: MatchStatus.Completed,
      },
    ],
    name: `Group ${id.toUpperCase()}`,
    participants,
  };
};

describe('MultiStageTournament', () => {
  it('renders group stages with visible advancers', () => {
    render(
      <MultiStageTournament
        title="Championship"
        stages={[
          {
            advancement: { topPerGroup: 1 },
            groups: [
              createGroup('a', ['Alpha', 'Bravo', 'Charlie', 'Delta']),
              createGroup('b', ['Echo', 'Foxtrot', 'Golf', 'Hotel']),
            ],
            name: 'Groups',
            type: 'groups',
          },
        ]}
      />
    );

    expect(screen.getByRole('tab', { name: 'Groups', selected: true })).toBeInTheDocument();
    expect(screen.getByLabelText('Advanced participants')).toHaveTextContent(
      'Advancing: Alpha, Echo'
    );
    expect(screen.getAllByRole('heading', { name: 'Standings' })).toHaveLength(2);
  });

  it('switches to a provided knockout bracket with tabs and keyboard navigation', () => {
    const bracket = generateSingleEliminationBracket(['Alpha', 'Echo']);
    render(
      <MultiStageTournament
        title="Championship"
        stages={[
          {
            groups: [createGroup('a', ['Alpha', 'Bravo', 'Charlie', 'Delta'])],
            name: 'Groups',
            type: 'groups',
          },
          {
            bracket,
            name: 'Semifinals',
            type: 'elimination',
          },
        ]}
      />
    );

    const groupTab = screen.getByRole('tab', { name: 'Groups' });
    const knockoutTab = screen.getByRole('tab', { name: 'Semifinals' });
    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });

    expect(knockoutTab).toHaveAttribute('aria-selected', 'true');
    expect(groupTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Echo')).toBeInTheDocument();
  });
});
