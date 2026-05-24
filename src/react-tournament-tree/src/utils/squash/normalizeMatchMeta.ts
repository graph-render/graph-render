import type { MatchMeta } from '@graph-render/types/tournament';
import { BracketSection, MatchStatus, MatchType } from '@graph-render/types/tournament';

import type { NormalizedSquashMatchMeta } from '../../models/squash';
import { normalizePlayers } from './normalizePlayer';

const isMatchStatus = (value: unknown): value is MatchStatus => {
  return (
    value === MatchStatus.Completed || value === MatchStatus.Live || value === MatchStatus.Upcoming
  );
};

const isMatchType = (value: unknown): value is MatchType =>
  Object.values(MatchType).includes(value as MatchType);

const isBracketSection = (value: unknown): value is BracketSection =>
  Object.values(BracketSection).includes(value as BracketSection);

const normalizeOptionalString = (value: unknown, label: string): string | undefined => {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new TypeError(`Invalid match payload: ${label} must be a string when provided.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new TypeError(`Invalid match payload: ${label} must be non-empty when provided.`);
  }

  return trimmed;
};

const normalizeScore = (value: unknown, label: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`Invalid match payload: ${label} must be a non-negative number.`);
  }

  return value;
};

const normalizeSets = (value: unknown): ReadonlyArray<readonly number[]> => {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new TypeError('Invalid match payload: sets must be an array of score pairs.');
  }

  return value.map((entry, index) => {
    if (!Array.isArray(entry) || entry.length !== 2) {
      throw new TypeError(`Invalid match payload: sets[${index}] must contain exactly two scores.`);
    }

    return [
      normalizeScore(entry[0], `sets[${index}][0]`),
      normalizeScore(entry[1], `sets[${index}][1]`),
    ];
  });
};

const normalizeTiebreaks = (value: unknown): ReadonlyArray<readonly number[] | null> => {
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new TypeError(
      'Invalid match payload: tiebreaks must be an array of score pairs or null entries.'
    );
  }

  return value.map((entry, index) => {
    if (entry == null) {
      return null;
    }

    if (!Array.isArray(entry) || entry.length !== 2) {
      throw new TypeError(
        `Invalid match payload: tiebreaks[${index}] must contain exactly two scores or be null.`
      );
    }

    return [
      normalizeScore(entry[0], `tiebreaks[${index}][0]`),
      normalizeScore(entry[1], `tiebreaks[${index}][1]`),
    ];
  });
};

export const normalizeMatchMeta = (meta: unknown): NormalizedSquashMatchMeta => {
  if (meta != null && typeof meta !== 'object') {
    throw new TypeError('Invalid match payload: node meta must be an object when provided.');
  }

  const rawMeta = meta as Partial<MatchMeta> | undefined;
  if (rawMeta?.status != null && !isMatchStatus(rawMeta.status)) {
    throw new TypeError(
      'Invalid match payload: status must be one of completed, live, or upcoming.'
    );
  }
  if (rawMeta?.matchType != null && !isMatchType(rawMeta.matchType)) {
    throw new TypeError(
      'Invalid match payload: matchType must be one of standard, thirdPlace, grandFinal, bye, or walkover.'
    );
  }
  if (rawMeta?.bracketSection != null && !isBracketSection(rawMeta.bracketSection)) {
    throw new TypeError(
      'Invalid match payload: bracketSection must be one of winners, losers, or grandFinal.'
    );
  }

  const sets = normalizeSets(rawMeta?.sets);
  const currentSet =
    rawMeta?.currentSet == null
      ? 0
      : typeof rawMeta.currentSet === 'number' && Number.isFinite(rawMeta.currentSet)
        ? Math.max(0, Math.min(Math.floor(rawMeta.currentSet), Math.max(sets.length - 1, 0)))
        : null;

  if (currentSet === null) {
    throw new TypeError('Invalid match payload: currentSet must be a finite number when provided.');
  }
  const scheduledAt = normalizeOptionalString(rawMeta?.scheduledAt, 'scheduledAt');
  const timezone = normalizeOptionalString(rawMeta?.timezone, 'timezone');
  const venue = normalizeOptionalString(rawMeta?.venue, 'venue');

  return {
    stage:
      typeof rawMeta?.stage === 'string' && rawMeta.stage.trim() ? rawMeta.stage.trim() : 'Stage',
    players: normalizePlayers(rawMeta?.players),
    sets,
    tiebreaks: normalizeTiebreaks(rawMeta?.tiebreaks),
    status: rawMeta?.status ?? MatchStatus.Completed,
    currentSet,
    ...(rawMeta?.matchType ? { matchType: rawMeta.matchType } : {}),
    ...(rawMeta?.bracketSection ? { bracketSection: rawMeta.bracketSection } : {}),
    ...(scheduledAt ? { scheduledAt } : {}),
    ...(timezone ? { timezone } : {}),
    ...(venue ? { venue } : {}),
    ...(rawMeta?.seriesFormat !== undefined ? { seriesFormat: rawMeta.seriesFormat } : {}),
  };
};

export { type NormalizedSquashMatchMeta } from '../../models/squash';
