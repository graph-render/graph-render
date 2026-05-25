import { MatchStatus } from '@graph-render/types/tournament';
import { describe, expect, it } from 'vitest';

import {
  formatMatchDateTime,
  formatStatusLabel,
  getMatchScheduleText,
  resolveTournamentLocalization,
} from '../localization';
import { roundLabelsForRoundCount } from '../roundLabels';

const SCHEDULED_AT = '2026-06-01T10:00:00Z';

describe('tournament localization', () => {
  it('formats match dates with locale and timezone', () => {
    const localization = resolveTournamentLocalization({
      locale: 'en-US',
      timeZone: 'UTC',
    });
    const expected = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(SCHEDULED_AT));

    expect(formatMatchDateTime(SCHEDULED_AT, undefined, localization)).toBe(expected);
  });

  it('uses per-match timezone before the default localization timezone', () => {
    const localization = resolveTournamentLocalization({
      locale: 'en-US',
      timeZone: 'UTC',
      dateTimeFormatOptions: { hour: '2-digit', minute: '2-digit' },
    });
    const expected = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Kyiv',
    }).format(new Date(SCHEDULED_AT));

    expect(formatMatchDateTime(SCHEDULED_AT, 'Europe/Kyiv', localization)).toBe(expected);
  });

  it('applies generated round and status label overrides', () => {
    const localization = resolveTournamentLocalization({
      roundLabels: {
        final: 'Фінал',
        roundOf: 'Раунд {count}',
      },
      statusLabels: {
        [MatchStatus.Upcoming]: 'заплановано',
      },
    });

    expect(roundLabelsForRoundCount(4, localization)).toEqual([
      'Раунд 8',
      'QUARTERFINALS',
      'SEMIFINALS',
      'Фінал',
    ]);
    expect(formatStatusLabel(MatchStatus.Upcoming, localization)).toBe('заплановано');
  });

  it('combines formatted schedule text with venue', () => {
    const localization = resolveTournamentLocalization({
      locale: 'en-US',
      timeZone: 'UTC',
      dateTimeFormatOptions: { month: 'short', day: 'numeric', hour: 'numeric' },
    });
    const expectedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(SCHEDULED_AT));

    expect(
      getMatchScheduleText(
        {
          scheduledAt: SCHEDULED_AT,
          timezone: undefined,
          venue: 'Court 1',
        },
        localization
      )
    ).toBe(`${expectedDate} · Court 1`);
  });

  it('throws for invalid schedule input instead of silently dropping it', () => {
    const localization = resolveTournamentLocalization();

    expect(() => formatMatchDateTime('not-a-date', undefined, localization)).toThrow(/scheduledAt/);
    expect(() => formatMatchDateTime(SCHEDULED_AT, 'Invalid/Zone', localization)).toThrow(
      RangeError
    );
  });
});
