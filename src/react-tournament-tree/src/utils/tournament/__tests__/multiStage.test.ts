import { MatchStatus, type RoundRobinGroup } from '@graph-render/types/tournament';
import { describe, expect, it } from 'vitest';

import { buildKnockoutBracketFromGroups, calculateGroupAdvancers } from '../multiStage';

const group = (
  id: string,
  names: readonly string[],
  scores: ReadonlyArray<readonly [number, number]>
): RoundRobinGroup => {
  const participants = names.map((name) => ({ name }));
  return {
    id,
    matches: [
      {
        id: `${id}-m1`,
        players: [participants[0]!, participants[1]!],
        round: 1,
        scores: scores[0],
        status: MatchStatus.Completed,
      },
      {
        id: `${id}-m2`,
        players: [participants[2]!, participants[3]!],
        round: 1,
        scores: scores[1],
        status: MatchStatus.Completed,
      },
    ],
    name: `Group ${id}`,
    participants,
  };
};

describe('calculateGroupAdvancers', () => {
  it('selects the top participants from each group standings table', () => {
    const advancers = calculateGroupAdvancers([
      group(
        'a',
        ['Alpha', 'Bravo', 'Charlie', 'Delta'],
        [
          [2, 0],
          [1, 1],
        ]
      ),
      group(
        'b',
        ['Echo', 'Foxtrot', 'Golf', 'Hotel'],
        [
          [0, 3],
          [2, 1],
        ]
      ),
    ]);

    expect(advancers.map((player) => player.name)).toEqual(['Alpha', 'Foxtrot']);
  });

  it('supports manual advancement overrides', () => {
    const manualAdvancers = [{ name: 'Manual 1' }, { name: 'Manual 2' }];

    expect(calculateGroupAdvancers([], { manualAdvancers })).toBe(manualAdvancers);
  });

  it('rejects invalid topPerGroup values', () => {
    expect(() => calculateGroupAdvancers([], { topPerGroup: 0 })).toThrow(/positive integer/);
  });
});

describe('buildKnockoutBracketFromGroups', () => {
  it('builds a single-elimination semifinal bracket from two groups', () => {
    const graph = buildKnockoutBracketFromGroups(
      [
        group(
          'a',
          ['Alpha', 'Bravo', 'Charlie', 'Delta'],
          [
            [2, 0],
            [1, 1],
          ]
        ),
        group(
          'b',
          ['Echo', 'Foxtrot', 'Golf', 'Hotel'],
          [
            [0, 3],
            [2, 1],
          ]
        ),
      ],
      { advancement: { topPerGroup: 2 } }
    );

    expect(Object.keys(graph.nodes ?? {})).toEqual(['r1-m1', 'r1-m2', 'final']);
    expect(graph.nodes?.['r1-m1']?.meta?.players?.map((player) => player.name)).toEqual([
      'Alpha',
      'Charlie',
    ]);
  });
});
