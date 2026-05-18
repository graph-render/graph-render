import { MatchStatus } from '@graph-render/types';
import { describe, expect, it } from 'vitest';

import { normalizeMatchMeta } from '../normalizeMatchMeta';

describe('normalizeMatchMeta', () => {
  it('accepts undefined and provides sensible defaults', () => {
    const meta = normalizeMatchMeta(undefined);
    expect(meta.status).toBe(MatchStatus.Completed);
    expect(meta.sets).toHaveLength(0);
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
});
