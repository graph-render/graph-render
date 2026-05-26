import { MatchStatus, type SwissMatch } from '@graph-render/types/tournament';
import { describe, expect, it } from 'vitest';

import { calculateSwissStandings, groupSwissMatchesByRound } from '../swiss';

describe('groupSwissMatchesByRound', () => {
  it('groups matches by round, sorted ascending', () => {
    const matches: readonly SwissMatch[] = [
      {
        id: 'r2-m1',
        players: [{ name: 'Alice' }, { name: 'Carol' }],
        round: 2,
        status: MatchStatus.Upcoming,
      },
      {
        id: 'r1-m1',
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        round: 1,
        status: MatchStatus.Completed,
        scores: [1, 0],
      },
      {
        id: 'r1-m2',
        players: [{ name: 'Carol' }, { name: 'Dave' }],
        round: 1,
        status: MatchStatus.Upcoming,
      },
    ];

    const rounds = groupSwissMatchesByRound(matches);

    expect(rounds).toHaveLength(2);
    expect(rounds[0]?.round).toBe(1);
    expect(rounds[0]?.matches).toHaveLength(2);
    expect(rounds[1]?.round).toBe(2);
    expect(rounds[1]?.matches).toHaveLength(1);
  });

  it('returns empty array for no matches', () => {
    expect(groupSwissMatchesByRound([])).toHaveLength(0);
  });

  it('sorts matches within a round by id', () => {
    const matches: readonly SwissMatch[] = [
      {
        id: 'r1-m3',
        players: [{ name: 'Carol' }, { name: 'Dave' }],
        round: 1,
        status: MatchStatus.Upcoming,
      },
      {
        id: 'r1-m1',
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        round: 1,
        status: MatchStatus.Upcoming,
      },
    ];

    const [round] = groupSwissMatchesByRound(matches);
    expect(round?.matches[0]?.id).toBe('r1-m1');
    expect(round?.matches[1]?.id).toBe('r1-m3');
  });
});

// ── calculateSwissStandings ───────────────────────────────────────────────────

describe('calculateSwissStandings', () => {
  it('rejects fewer than 2 participants', () => {
    expect(() => calculateSwissStandings(['Solo'], [])).toThrow(/at least two/);
  });

  it('rejects invalid participant (empty string)', () => {
    expect(() => calculateSwissStandings(['Alice', ' '], [])).toThrow(/non-empty/);
  });

  it('rejects completed match referencing unknown participant', () => {
    expect(() =>
      calculateSwissStandings(
        ['Alice', 'Bob'],
        [
          {
            id: 'r1-m1',
            players: [{ name: 'Alice' }, { name: 'Ghost' }],
            round: 1,
            scores: [1, 0],
            status: MatchStatus.Completed,
          },
        ]
      )
    ).toThrow(/unknown participant/);
  });

  it('ignores upcoming and matches without scores', () => {
    const standings = calculateSwissStandings(
      ['Alice', 'Bob'],
      [
        {
          id: 'r1-m1',
          players: [{ name: 'Alice' }, { name: 'Bob' }],
          round: 1,
          status: MatchStatus.Upcoming,
        },
      ]
    );

    expect(standings).toHaveLength(2);
    expect(standings.every((s) => s.played === 0 && s.points === 0)).toBe(true);
  });

  it('tallies wins, draws, losses and default Swiss points (1/0.5/0)', () => {
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
    ];

    const standings = calculateSwissStandings(['Alice', 'Bob', 'Carol', 'Dave'], matches);

    const alice = standings.find((s) => s.player.name === 'Alice')!;
    const bob = standings.find((s) => s.player.name === 'Bob')!;
    const carol = standings.find((s) => s.player.name === 'Carol')!;

    expect(alice).toMatchObject({ wins: 1, draws: 0, losses: 0, played: 1, points: 1 });
    expect(bob).toMatchObject({ wins: 0, draws: 0, losses: 1, played: 1, points: 0 });
    expect(carol).toMatchObject({ wins: 0, draws: 1, losses: 0, played: 1, points: 0.5 });
  });

  it('supports custom point values', () => {
    const matches: readonly SwissMatch[] = [
      {
        id: 'r1-m1',
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        round: 1,
        scores: [1, 1],
        status: MatchStatus.Completed,
      },
    ];

    const standings = calculateSwissStandings(['Alice', 'Bob', 'Carol', 'Dave'], matches, {
      draw: 1,
      loss: 0,
      win: 3,
    });

    const alice = standings.find((s) => s.player.name === 'Alice')!;
    expect(alice.points).toBe(1);
  });

  it('sorts by points desc, then buchholz desc, then sonnebornBerger desc', () => {
    // Round 1: Alice beats Bob; Carol beats Dave
    // Round 2: Alice beats Carol; Bob beats Dave
    // After 2 rounds: Alice=2, Carol=1, Bob=1, Dave=0
    // Alice's Buchholz = Bob.pts + Carol.pts = 1 + 1 = 2
    // Carol's Buchholz = Alice.pts + Dave.pts = 2 + 0 = 2
    // Bob's Buchholz   = Alice.pts + Dave.pts = 2 + 0 = 2
    // Carol SB = 0 (lost to Alice) + 0 (won over Dave, Dave.pts=0) = 0
    // Bob SB = 0 (lost to Alice) + 0 (won over Dave, Dave.pts=0) = 0
    // Carol and Bob have same points/BH/SB → alphabetical

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
        scores: [1, 0],
        status: MatchStatus.Completed,
      },
      {
        id: 'r2-m1',
        players: [{ name: 'Alice' }, { name: 'Carol' }],
        round: 2,
        scores: [1, 0],
        status: MatchStatus.Completed,
      },
      {
        id: 'r2-m2',
        players: [{ name: 'Bob' }, { name: 'Dave' }],
        round: 2,
        scores: [1, 0],
        status: MatchStatus.Completed,
      },
    ];

    const standings = calculateSwissStandings(['Alice', 'Bob', 'Carol', 'Dave'], matches);

    expect(standings[0]?.player.name).toBe('Alice');
    expect(standings[0]?.points).toBe(2);
    // Bob and Carol tied on points; check they both appear in positions 1-2
    const names12 = [standings[1]?.player.name, standings[2]?.player.name].sort();
    expect(names12).toEqual(['Bob', 'Carol']);
    expect(standings[3]?.player.name).toBe('Dave');
  });

  it('renders all 5 rounds correctly for a 5-round Swiss event', () => {
    // 6 players over 5 rounds, manual pairings
    const sixParticipants = ['A', 'B', 'C', 'D', 'E', 'F'];
    const matches: SwissMatch[] = [];
    for (let r = 1; r <= 5; r += 1) {
      matches.push(
        {
          id: `r${r}-m1`,
          players: [{ name: 'A' }, { name: 'B' }],
          round: r,
          scores: [1, 0],
          status: MatchStatus.Completed,
        },
        {
          id: `r${r}-m2`,
          players: [{ name: 'C' }, { name: 'D' }],
          round: r,
          scores: [0, 0],
          status: MatchStatus.Completed,
        },
        {
          id: `r${r}-m3`,
          players: [{ name: 'E' }, { name: 'F' }],
          round: r,
          scores: [0, 1],
          status: MatchStatus.Completed,
        }
      );
    }

    const standings = calculateSwissStandings(sixParticipants, matches);
    const rounds = groupSwissMatchesByRound(matches);

    expect(rounds).toHaveLength(5);
    expect(standings).toHaveLength(6);
    // A wins all 5 rounds
    const aStanding = standings.find((s) => s.player.name === 'A')!;
    expect(aStanding.wins).toBe(5);
    expect(aStanding.points).toBe(5);
    // F wins all 5 rounds
    const fStanding = standings.find((s) => s.player.name === 'F')!;
    expect(fStanding.wins).toBe(5);
  });

  it('computes Buchholz correctly', () => {
    // Alice beats Bob (Bob ends with 0 pts), Carol beats Dave (Dave ends with 0 pts)
    // Alice's Buchholz = Bob.pts = 0
    // Carol's Buchholz = Dave.pts = 0
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
        scores: [1, 0],
        status: MatchStatus.Completed,
      },
    ];

    const standings = calculateSwissStandings(['Alice', 'Bob', 'Carol', 'Dave'], matches);
    const alice = standings.find((s) => s.player.name === 'Alice')!;
    expect(alice.buchholz).toBe(0); // Bob has 0 pts
    expect(alice.sonnebornBerger).toBe(0); // Bob has 0 pts
  });

  it('formats standings for display with 0.5 draw points', () => {
    const matches: readonly SwissMatch[] = [
      {
        id: 'r1-m1',
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        round: 1,
        scores: [0, 0],
        status: MatchStatus.Completed,
      },
    ];
    const standings = calculateSwissStandings(['Alice', 'Bob'], matches);
    expect(standings[0]?.points).toBe(0.5);
    expect(standings[1]?.points).toBe(0.5);
  });
});
