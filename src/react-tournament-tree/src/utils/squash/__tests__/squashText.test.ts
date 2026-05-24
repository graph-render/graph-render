import { MatchStatus } from '@graph-render/types/tournament';
import { describe, expect, it } from 'vitest';

import {
  getMatchAriaLabel,
  getMatchTypeLabel,
  getPlayerBadgeText,
  getPlayerMetadataText,
  truncateText,
} from '../text';

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
    expect(truncateText('abcdefgh', 5)).toBe('abcd…');
  });

  it('handles empty string', () => {
    expect(truncateText('', 5)).toBe('');
  });

  it('handles maxLength of 1', () => {
    expect(truncateText('hello', 1)).toBe('…');
  });
});

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

describe('getPlayerMetadataText', () => {
  it('combines seed and country', () => {
    expect(getPlayerMetadataText({ name: 'Alice', seed: 1, country: 'eg' })).toBe('#1 · EG');
  });

  it('renders only seed when country is absent', () => {
    expect(getPlayerMetadataText({ name: 'Alice', seed: 3 })).toBe('#3');
  });

  it('renders only country when seed is absent', () => {
    expect(getPlayerMetadataText({ name: 'Alice', country: 'us' })).toBe('US');
  });

  it('returns empty text when metadata is absent', () => {
    expect(getPlayerMetadataText({ name: 'Alice' })).toBe('');
  });
});

describe('getMatchAriaLabel', () => {
  it('summarizes stage, players, status, score, winner, and venue', () => {
    expect(
      getMatchAriaLabel({
        currentSet: 0,
        players: [
          { name: 'Alice', seed: 1 },
          { name: 'Bob', seed: 2 },
        ],
        setWins: { p1: 2, p2: 1 },
        stage: 'Final',
        status: MatchStatus.Completed,
        venue: 'Court 1',
        winnerIndex: 0,
      })
    ).toBe(
      'Final match: Alice versus Bob. Status completed. Score Alice 2 sets, Bob 1 sets. Winner Alice. Venue Court 1.'
    );
  });

  it('describes third-place matches semantically', () => {
    expect(
      getMatchAriaLabel({
        currentSet: 0,
        matchType: 'thirdPlace',
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        setWins: { p1: 0, p2: 0 },
        stage: 'Bronze',
        status: MatchStatus.Upcoming,
        winnerIndex: null,
      })
    ).toContain('Third place match: Alice versus Bob');
  });
});

describe('getMatchTypeLabel', () => {
  it('returns labels for semantic match types', () => {
    expect(getMatchTypeLabel('thirdPlace')).toBe('Third place');
    expect(getMatchTypeLabel('grandFinal')).toBe('Grand final');
    expect(getMatchTypeLabel(undefined)).toBe('');
  });
});
