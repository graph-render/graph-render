import { describe, expect, it } from 'vitest';

import {
  normalizePlayer,
  normalizePlayerKey,
  normalizePlayers,
} from '../utils/squash/normalizePlayer';

// ── normalizePlayerKey ────────────────────────────────────────────────────────
describe('normalizePlayerKey', () => {
  it('lowercases and trims whitespace', () => {
    expect(normalizePlayerKey('  Rafael Nadal  ')).toBe('rafael nadal');
  });

  it('returns an already-normalized string unchanged', () => {
    expect(normalizePlayerKey('alice')).toBe('alice');
  });
});

// ── normalizePlayer ───────────────────────────────────────────────────────────
describe('normalizePlayer', () => {
  it('accepts a valid player object with a name', () => {
    const player = normalizePlayer({ name: 'Alice' }, 'p1');
    expect(player.name).toBe('Alice');
  });

  it('trims the name', () => {
    expect(normalizePlayer({ name: '  Bob  ' }, 'p1').name).toBe('Bob');
  });

  it('accepts an optional seed', () => {
    const player = normalizePlayer({ name: 'Alice', seed: 3 }, 'p1');
    expect(player.seed).toBe(3);
  });

  it('accepts an optional country', () => {
    const player = normalizePlayer({ name: 'Alice', country: 'ES' }, 'p1');
    expect(player.country).toBe('ES');
  });

  it('throws for non-object input', () => {
    expect(() => normalizePlayer('invalid', 'p1')).toThrow(TypeError);
    expect(() => normalizePlayer(null, 'p1')).toThrow(TypeError);
  });

  it('throws for missing name', () => {
    expect(() => normalizePlayer({}, 'p1')).toThrow(/name must be a non-empty string/);
  });

  it('throws for empty name', () => {
    expect(() => normalizePlayer({ name: '  ' }, 'p1')).toThrow(/name must be a non-empty string/);
  });

  it('throws for non-finite seed', () => {
    expect(() => normalizePlayer({ name: 'Alice', seed: NaN }, 'p1')).toThrow(/seed must be/);
  });

  it('throws for empty country string', () => {
    expect(() => normalizePlayer({ name: 'Alice', country: '  ' }, 'p1')).toThrow(/country must be/);
  });
});

// ── normalizePlayers ──────────────────────────────────────────────────────────
describe('normalizePlayers', () => {
  it('returns TBD defaults for null input', () => {
    const players = normalizePlayers(null);
    expect(players).toHaveLength(2);
  });

  it('normalizes two valid players', () => {
    const players = normalizePlayers([
      { name: 'Alice' },
      { name: 'Bob' },
    ]);
    expect(players[0]?.name).toBe('Alice');
    expect(players[1]?.name).toBe('Bob');
  });

  it('throws for array with wrong length', () => {
    expect(() => normalizePlayers([{ name: 'Alice' }])).toThrow(/exactly two entries/);
  });

  it('throws for non-array input', () => {
    expect(() => normalizePlayers('bad')).toThrow(TypeError);
  });
});
