import type { PlacementMatch } from '@graph-render/types/tournament';
import { MatchStatus } from '@graph-render/types/tournament';
import { describe, expect, it } from 'vitest';

import {
  generatePlacementMatches,
  groupPlacementMatchesByRound,
  groupPlacementMatchesByTier,
  resolvePlacementLabel,
} from '../placement';

describe('resolvePlacementLabel', () => {
  it('formats ordinal suffixes correctly', () => {
    expect(resolvePlacementLabel(1)).toBe('1st Place');
    expect(resolvePlacementLabel(2)).toBe('2nd Place');
    expect(resolvePlacementLabel(3)).toBe('3rd Place');
    expect(resolvePlacementLabel(4)).toBe('4th Place');
    expect(resolvePlacementLabel(5)).toBe('5th Place');
    expect(resolvePlacementLabel(11)).toBe('11th Place');
    expect(resolvePlacementLabel(12)).toBe('12th Place');
    expect(resolvePlacementLabel(13)).toBe('13th Place');
    expect(resolvePlacementLabel(21)).toBe('21st Place');
  });

  it('uses custom label when provided', () => {
    expect(resolvePlacementLabel(3, 'Bronze Match')).toBe('Bronze Match');
  });
});

describe('generatePlacementMatches', () => {
  it('generates 1 match for a 2-player tier', () => {
    const matches = generatePlacementMatches([
      { participants: ['Alice', 'Bob'], startingPlacement: 3 },
    ]);
    expect(matches).toHaveLength(1);
    expect(matches[0]!.placement).toBe(3);
    expect(matches[0]!.round).toBe(1);
    expect(matches[0]!.players[0].name).toBe('Alice');
    expect(matches[0]!.players[1].name).toBe('Bob');
  });

  it('generates 3 matches for a 4-player tier (2 semi-finals + 2 finals)', () => {
    const matches = generatePlacementMatches([
      { participants: ['A', 'B', 'C', 'D'], startingPlacement: 5 },
    ]);
    // Round 1: 2 semi-final matches; Round 2: 2 final matches (5th place + 7th place)
    expect(matches).toHaveLength(4);
    const round1 = matches.filter((m) => m.round === 1);
    const round2 = matches.filter((m) => m.round === 2);
    expect(round1).toHaveLength(2);
    expect(round2).toHaveLength(2);
  });

  it('sets status to Upcoming by default', () => {
    const matches = generatePlacementMatches([
      { participants: ['Alice', 'Bob'], startingPlacement: 3 },
    ]);
    expect(matches[0]!.status).toBe(MatchStatus.Upcoming);
  });

  it('generates matches for multiple tiers', () => {
    const matches = generatePlacementMatches([
      { participants: ['A', 'B'], startingPlacement: 3 },
      { participants: ['C', 'D', 'E', 'F'], startingPlacement: 5 },
    ]);
    const tier3 = matches.filter((m) => m.id.startsWith('p3-'));
    const tier5 = matches.filter((m) => m.id.startsWith('p5-'));
    expect(tier3).toHaveLength(1);
    expect(tier5).toHaveLength(4);
  });

  it('applies custom label to matching placement', () => {
    const matches = generatePlacementMatches([
      {
        participants: ['Alice', 'Bob'],
        startingPlacement: 3,
        labels: { 3: 'Bronze Match' },
      },
    ]);
    expect(matches[0]!.label).toBe('Bronze Match');
  });

  it('generates unique match IDs', () => {
    const matches = generatePlacementMatches([
      { participants: ['A', 'B', 'C', 'D'], startingPlacement: 5 },
    ]);
    const ids = matches.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('throws on non-power-of-two participant count', () => {
    expect(() =>
      generatePlacementMatches([{ participants: ['A', 'B', 'C'], startingPlacement: 5 }])
    ).toThrow(/power of 2/);
  });

  it('throws on fewer than 2 participants', () => {
    expect(() =>
      generatePlacementMatches([{ participants: ['Alice'], startingPlacement: 3 }])
    ).toThrow(/at least 2/);
  });

  it('accepts MatchPlayer objects as participants', () => {
    const matches = generatePlacementMatches([
      {
        participants: [
          { name: 'Alice', seed: 1 },
          { name: 'Bob', seed: 2 },
        ],
        startingPlacement: 3,
      },
    ]);
    expect(matches[0]!.players[0].name).toBe('Alice');
    expect(matches[0]!.players[0].seed).toBe(1);
  });
});

describe('groupPlacementMatchesByTier', () => {
  it('groups matches by tier key', () => {
    const matches: readonly PlacementMatch[] = [
      {
        id: 'p3-r1-m1',
        round: 1,
        placement: 3,
        players: [{ name: 'A' }, { name: 'B' }],
        status: MatchStatus.Upcoming,
      },
      {
        id: 'p5-r1-m1',
        round: 1,
        placement: 5,
        players: [{ name: 'C' }, { name: 'D' }],
        status: MatchStatus.Upcoming,
      },
      {
        id: 'p5-r1-m2',
        round: 1,
        placement: 7,
        players: [{ name: 'E' }, { name: 'F' }],
        status: MatchStatus.Upcoming,
      },
    ];
    const tierMap = groupPlacementMatchesByTier(matches);
    expect(tierMap.size).toBe(2);
    expect(tierMap.get(3)).toHaveLength(1);
    expect(tierMap.get(5)).toHaveLength(2);
  });

  it('returns empty map for empty input', () => {
    expect(groupPlacementMatchesByTier([])).toEqual(new Map());
  });
});

describe('groupPlacementMatchesByRound', () => {
  it('groups matches by round within a tier', () => {
    const matches = generatePlacementMatches([
      { participants: ['A', 'B', 'C', 'D'], startingPlacement: 5 },
    ]);
    const roundMap = groupPlacementMatchesByRound(matches, 5);
    expect(roundMap.size).toBe(2);
    expect(roundMap.get(1)).toHaveLength(2);
    expect(roundMap.get(2)).toHaveLength(2);
  });

  it('filters to the requested tier only', () => {
    const matches = generatePlacementMatches([
      { participants: ['A', 'B'], startingPlacement: 3 },
      { participants: ['C', 'D'], startingPlacement: 5 },
    ]);
    const roundMap = groupPlacementMatchesByRound(matches, 3);
    expect(roundMap.size).toBe(1);
    expect(roundMap.get(1)).toHaveLength(1);
    expect(roundMap.get(1)![0]!.id).toBe('p3-r1-m1');
  });
});
