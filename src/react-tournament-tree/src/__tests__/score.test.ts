import { MatchStatus } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import {
  getCompletedWinnerIndex,
  getDisplayScores,
  getScoreGroupWidth,
  getScoreSegments,
  getSetWins,
} from '../utils/squash/score';

const sets = [[6, 4], [3, 6], [7, 5]] as const;
const noTiebreaks: ReadonlyArray<readonly number[] | null> = [null, null, null];

// ── getDisplayScores ──────────────────────────────────────────────────────────
describe('getDisplayScores', () => {
  it('returns plain scores when no tiebreak', () => {
    expect(getDisplayScores(sets, noTiebreaks, 0)).toEqual(['6', '3', '7']);
    expect(getDisplayScores(sets, noTiebreaks, 1)).toEqual(['4', '6', '5']);
  });

  it('appends tiebreak in parentheses', () => {
    const tbs: ReadonlyArray<readonly number[] | null> = [[7, 5], null, null];
    expect(getDisplayScores(sets, tbs, 0)[0]).toBe('6(7)');
  });

  it('does NOT append a zero tiebreak', () => {
    const tbs: ReadonlyArray<readonly number[] | null> = [[0, 0], null, null];
    expect(getDisplayScores(sets, tbs, 0)[0]).toBe('6');
  });

  it('returns "—" for non-finite score', () => {
    const badSets = [[NaN, 4]] as const;
    expect(getDisplayScores(badSets, [null], 0)[0]).toBe('—');
  });
});

// ── getScoreSegments ──────────────────────────────────────────────────────────
describe('getScoreSegments', () => {
  it('returns scores when sets exist', () => {
    expect(getScoreSegments(sets, noTiebreaks, 0)).toHaveLength(3);
  });

  it('returns ["—"] for empty sets', () => {
    expect(getScoreSegments([], [], 0)).toEqual(['—']);
  });
});

// ── getScoreGroupWidth ────────────────────────────────────────────────────────
describe('getScoreGroupWidth', () => {
  it('returns segmentWidth for 0 segments', () => {
    expect(getScoreGroupWidth(0, 30, 4)).toBe(30);
  });

  it('returns segmentWidth for 1 segment (no gaps)', () => {
    expect(getScoreGroupWidth(1, 30, 4)).toBe(30);
  });

  it('includes gaps for multiple segments', () => {
    // 3 × 30 + 2 × 4 = 98
    expect(getScoreGroupWidth(3, 30, 4)).toBe(98);
  });
});

// ── getSetWins ────────────────────────────────────────────────────────────────
describe('getSetWins', () => {
  it('counts set wins for completed match', () => {
    const wins = getSetWins(sets as any, MatchStatus.Completed, 0);
    // p1 wins set0 (6>4) and set2 (7>5); p2 wins set1 (3<6)
    expect(wins).toEqual({ p1: 2, p2: 1 });
  });

  it('excludes the current live set from counts', () => {
    const wins = getSetWins(sets as any, MatchStatus.Live, 2);
    // set0: p1 wins, set1: p2 wins, set2 skipped
    expect(wins).toEqual({ p1: 1, p2: 1 });
  });

  it('returns {p1:0, p2:0} for empty sets', () => {
    expect(getSetWins([], MatchStatus.Completed, 0)).toEqual({ p1: 0, p2: 0 });
  });
});

// ── getCompletedWinnerIndex ───────────────────────────────────────────────────
describe('getCompletedWinnerIndex', () => {
  it('returns 0 when p1 wins more sets', () => {
    expect(getCompletedWinnerIndex({ p1: 2, p2: 1 }, MatchStatus.Completed)).toBe(0);
  });

  it('returns 1 when p2 wins more sets', () => {
    expect(getCompletedWinnerIndex({ p1: 1, p2: 2 }, MatchStatus.Completed)).toBe(1);
  });

  it('returns null when tied', () => {
    expect(getCompletedWinnerIndex({ p1: 1, p2: 1 }, MatchStatus.Completed)).toBeNull();
  });

  it('returns null when status is not Completed', () => {
    expect(getCompletedWinnerIndex({ p1: 2, p2: 1 }, MatchStatus.Live)).toBeNull();
  });
});
