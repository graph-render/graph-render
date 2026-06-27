import { BracketSection, MatchStatus, MatchType } from '@graph-render/types/tournament';
import { describe, expect, it } from 'vitest';

import { normalizeMatchMeta } from '../normalizeMatchMeta';

describe('normalizeMatchMeta', () => {
  it('accepts undefined and provides sensible defaults', () => {
    const meta = normalizeMatchMeta(undefined);
    expect(meta.status).toBe(MatchStatus.Completed);
    expect(meta.sets).toHaveLength(0);
    expect(meta.games).toHaveLength(0);
    expect(meta.tiebreaks).toHaveLength(0);
    expect(meta.currentSet).toBe(0);
    expect(meta.stage).toBe('Stage');
    expect(meta.players).toHaveLength(2);
  });

  it('accepts null and provides sensible defaults', () => {
    const meta = normalizeMatchMeta(null);
    expect(meta.status).toBe(MatchStatus.Completed);
  });

  it('preserves a valid status', () => {
    const meta = normalizeMatchMeta({ status: MatchStatus.Live });
    expect(meta.status).toBe(MatchStatus.Live);
  });

  it('throws for an invalid status value', () => {
    expect(() => normalizeMatchMeta({ status: 'invalid' })).toThrow(/status must be/);
  });

  it('normalizes a valid sets array', () => {
    const meta = normalizeMatchMeta({
      sets: [
        [6, 4],
        [3, 6],
      ],
    });
    expect(meta.sets).toHaveLength(2);
    expect(meta.sets[0]).toEqual([6, 4]);
  });

  it('throws for malformed set entry', () => {
    expect(() => normalizeMatchMeta({ sets: [[6]] })).toThrow(
      'sets[0] must contain exactly two scores'
    );
  });

  it('throws for negative score', () => {
    expect(() => normalizeMatchMeta({ sets: [[-1, 4]] })).toThrow(/non-negative number/);
  });

  it('normalizes tiebreaks with null entries', () => {
    const meta = normalizeMatchMeta({ sets: [[6, 7]], tiebreaks: [[5, 7]] });
    expect(meta.tiebreaks[0]).toEqual([5, 7]);
  });

  it('normalizes a null tiebreak entry', () => {
    const meta = normalizeMatchMeta({ sets: [[6, 4]], tiebreaks: [null] });
    expect(meta.tiebreaks[0]).toBeNull();
  });

  it('preserves a custom stage label', () => {
    const meta = normalizeMatchMeta({ stage: '  Final  ' });
    expect(meta.stage).toBe('Final');
  });

  it('falls back to "Stage" for empty stage', () => {
    const meta = normalizeMatchMeta({ stage: '' });
    expect(meta.stage).toBe('Stage');
  });

  it('clamps currentSet within valid range', () => {
    const meta = normalizeMatchMeta({ sets: [[6, 4]], currentSet: 99 });
    expect(meta.currentSet).toBe(0); // max valid is sets.length - 1
  });

  it('throws for non-numeric currentSet', () => {
    expect(() => normalizeMatchMeta({ currentSet: 'first' })).toThrow(
      /currentSet must be a finite number/
    );
  });

  it('throws when meta is a primitive (not object)', () => {
    expect(() => normalizeMatchMeta(42)).toThrow(/meta must be an object/);
  });

  it('normalizes valid players', () => {
    const meta = normalizeMatchMeta({ players: [{ name: 'Alice' }, { name: 'Bob' }] });
    expect(meta.players[0]?.name).toBe('Alice');
    expect(meta.players[1]?.name).toBe('Bob');
  });

  it('preserves generic tournament metadata', () => {
    const meta = normalizeMatchMeta({
      matchType: MatchType.ThirdPlace,
      bracketSection: BracketSection.Winners,
      scheduledAt: '2026-06-01T10:00:00Z',
      timezone: 'UTC',
      venue: 'Court 1',
      seriesFormat: { bestOf: 5, label: 'BO5' },
    });

    expect(meta.matchType).toBe(MatchType.ThirdPlace);
    expect(meta.bracketSection).toBe(BracketSection.Winners);
    expect(meta.scheduledAt).toBe('2026-06-01T10:00:00Z');
    expect(meta.timezone).toBe('UTC');
    expect(meta.venue).toBe('Court 1');
    expect(meta.seriesFormat).toEqual({ bestOf: 5, label: 'BO5' });
  });

  it('normalizes best-of-N game results', () => {
    const meta = normalizeMatchMeta({
      games: [
        { label: 'Map 1', scores: [13, 11] },
        { scores: [8, 13], winner: 1 },
      ],
    });

    expect(meta.games).toEqual([
      { label: 'Map 1', scores: [13, 11] },
      { scores: [8, 13], winner: 1 },
    ]);
  });

  it('throws for invalid game results', () => {
    expect(() => normalizeMatchMeta({ games: [{ scores: [1] }] })).toThrow(/games\[0\]/);
    expect(() => normalizeMatchMeta({ games: [{ scores: [1, 2], winner: 2 }] })).toThrow(/winner/);
  });

  it('throws for invalid generic tournament metadata', () => {
    expect(() => normalizeMatchMeta({ matchType: 'other' })).toThrow(/matchType/);
    expect(() => normalizeMatchMeta({ bracketSection: 'other' })).toThrow(/bracketSection/);
    expect(() => normalizeMatchMeta({ venue: ' ' })).toThrow(/venue/);
  });

  it('normalizes a valid finalScore', () => {
    const meta = normalizeMatchMeta({ finalScore: [2, 0] });
    expect(meta.finalScore).toEqual([2, 0]);
  });

  it('omits finalScore when not provided', () => {
    expect(normalizeMatchMeta({}).finalScore).toBeUndefined();
  });

  it('throws for a malformed finalScore', () => {
    expect(() => normalizeMatchMeta({ finalScore: [1] })).toThrow(/finalScore/);
    expect(() => normalizeMatchMeta({ finalScore: [1, -1] })).toThrow(/finalScore\[1\]/);
  });
});
