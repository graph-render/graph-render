import { MatchStatus } from '@graph-render/types/tournament';
import { describe, expect, it } from 'vitest';

import {
  calculateRoundRobinStandings,
  generateRoundRobinSchedule,
  groupRoundRobinMatchesByRound,
} from '../roundRobin';

const participants = ['Alpha', 'Bravo', 'Charlie', 'Delta'];

describe('generateRoundRobinSchedule', () => {
  it('generates every pairing once for an even group', () => {
    const schedule = generateRoundRobinSchedule(participants);
    const pairings = schedule.map((match) =>
      match.players
        .map((player) => player.name)
        .sort()
        .join(' vs ')
    );

    expect(schedule).toHaveLength(6);
    expect(new Set(pairings).size).toBe(6);
    expect(groupRoundRobinMatchesByRound(schedule)).toHaveLength(3);
  });

  it('handles odd groups without emitting bye matches', () => {
    const schedule = generateRoundRobinSchedule([...participants, 'Echo']);

    expect(groupRoundRobinMatchesByRound(schedule)).toHaveLength(5);
    expect(schedule).toHaveLength(10);
    expect(schedule.some((match) => match.players.some((player) => player.isBye))).toBe(false);
  });

  it('rejects invalid participant lists', () => {
    expect(() => generateRoundRobinSchedule(['Alpha'])).toThrow(/at least two/);
    expect(() => generateRoundRobinSchedule(['Alpha', ' '])).toThrow(/non-empty/);
  });
});

describe('calculateRoundRobinStandings', () => {
  it('updates standings from completed results', () => {
    const alpha = { name: 'Alpha' };
    const bravo = { name: 'Bravo' };
    const charlie = { name: 'Charlie' };
    const delta = { name: 'Delta' };
    const standings = calculateRoundRobinStandings(participants, [
      {
        id: 'm1',
        players: [alpha, bravo],
        round: 1,
        scores: [2, 1],
        status: MatchStatus.Completed,
      },
      {
        id: 'm2',
        players: [charlie, delta],
        round: 1,
        scores: [0, 0],
        status: MatchStatus.Completed,
      },
    ]);

    expect(standings.map((standing) => standing.player.name)).toEqual([
      'Alpha',
      'Charlie',
      'Delta',
      'Bravo',
    ]);
    expect(standings[0]).toMatchObject({ played: 1, points: 3, scoreDifference: 1, wins: 1 });
    expect(standings[1]).toMatchObject({ draws: 1, points: 1 });
  });

  it('supports custom point rules and ignores upcoming matches', () => {
    const alpha = { name: 'Alpha' };
    const bravo = { name: 'Bravo' };
    const standings = calculateRoundRobinStandings(
      participants,
      [
        {
          id: 'm1',
          players: [alpha, bravo],
          round: 1,
          scores: [1, 1],
          status: MatchStatus.Completed,
        },
        {
          id: 'm2',
          players: [alpha, { name: 'Charlie' }],
          round: 2,
          scores: [9, 0],
          status: MatchStatus.Upcoming,
        },
      ],
      { draw: 2, loss: 0, win: 5 }
    );

    expect(standings.find((standing) => standing.player.name === 'Alpha')).toMatchObject({
      draws: 1,
      played: 1,
      points: 2,
    });
    expect(standings.find((standing) => standing.player.name === 'Charlie')).toMatchObject({
      played: 0,
      points: 0,
    });
  });

  it('rejects completed matches with unknown participants', () => {
    expect(() =>
      calculateRoundRobinStandings(participants, [
        {
          id: 'm1',
          players: [{ name: 'Alpha' }, { name: 'Echo' }],
          round: 1,
          scores: [1, 0],
          status: MatchStatus.Completed,
        },
      ])
    ).toThrow(/unknown participant/);
  });
});
