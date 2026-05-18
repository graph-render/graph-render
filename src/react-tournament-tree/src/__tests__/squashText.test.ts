import { describe, expect, it } from 'vitest';

import { getPlayerBadgeText, truncateText } from '../utils/squash/text';

// ── truncateText ──────────────────────────────────────────────────────────────
describe('truncateText', () => {
  it('returns text unchanged when within the limit', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  it('returns text unchanged when equal to the limit', () => {
    expect(truncateText('hello', 5)).toBe('hello');
  });

  it('truncates and appends ellipsis when exceeding the limit', () => {
    const result = truncateText('hello world', 8);
    expect(result).toHaveLength(8);
    expect(result.endsWith('…')).toBe(true);
  });

  it('keeps the correct number of characters before the ellipsis', () => {
    // maxLength=5 → 4 chars + '…'
    expect(truncateText('abcdefgh', 5)).toBe('abcd…');
  });

  it('handles empty string', () => {
    expect(truncateText('', 5)).toBe('');
  });

  it('handles maxLength of 1', () => {
    expect(truncateText('hello', 1)).toBe('…');
  });
});

// ── getPlayerBadgeText ────────────────────────────────────────────────────────
describe('getPlayerBadgeText', () => {
  it('returns initials from a full name', () => {
    expect(getPlayerBadgeText({ name: 'John Doe' })).toBe('JD');
  });

  it('returns a single initial for a single-word name', () => {
    expect(getPlayerBadgeText({ name: 'Rafael' })).toBe('R');
  });

  it('uses only the first two words', () => {
    expect(getPlayerBadgeText({ name: 'Maria de Silva' })).toBe('MD');
  });

  it('returns "–" for an empty name', () => {
    expect(getPlayerBadgeText({ name: '' })).toBe('–');
  });

  it('returns "–" for a whitespace-only name', () => {
    expect(getPlayerBadgeText({ name: '   ' })).toBe('–');
  });

  it('uppercases initials', () => {
    expect(getPlayerBadgeText({ name: 'alice bob' })).toBe('AB');
  });
});
