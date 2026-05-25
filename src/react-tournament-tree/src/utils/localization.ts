import { BracketSection, MatchStatus, MatchType } from '@graph-render/types/tournament';

import type {
  ResolvedTournamentLocalization,
  TournamentLocalizationOptions,
  TournamentUiLabels,
} from '../models/localization';
import type { NormalizedSquashMatchMeta } from '../models/squash';

const DEFAULT_DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

export const DEFAULT_TOURNAMENT_UI_LABELS: TournamentUiLabels = {
  advancedParticipants: 'Advanced participants',
  advancing: 'Advancing',
  doubleElimination: 'Double elimination',
  draws: 'D',
  goToNextStage: 'Go to next stage',
  goToPreviousStage: 'Go to previous stage',
  groupStage: 'Group stage',
  knockout: 'Knockout',
  liveMatch: 'Live match',
  losses: 'L',
  nextStage: 'Next stage',
  played: 'P',
  points: 'Pts',
  previousStage: 'Previous stage',
  round: 'Round',
  scheduled: 'Scheduled',
  schedule: 'Schedule',
  scoreDifference: '+/-',
  showLowerPlayers: 'Show lower players',
  showUpperPlayers: 'Show upper players',
  standings: 'Standings',
  team: 'Team',
  tournament: 'Tournament',
  upcoming: 'upcoming',
  wins: 'W',
};

const DEFAULT_ROUND_LABELS: Record<string, string> = {
  final: 'FINAL',
  quarterfinals: 'QUARTERFINALS',
  roundOf: 'ROUND OF {count}',
  semifinals: 'SEMIFINALS',
};

const DEFAULT_STATUS_LABELS: Record<MatchStatus, string> = {
  [MatchStatus.Completed]: MatchStatus.Completed,
  [MatchStatus.Live]: MatchStatus.Live,
  [MatchStatus.Upcoming]: MatchStatus.Upcoming,
};

const DEFAULT_MATCH_TYPE_LABELS: Record<MatchType, string> = {
  [MatchType.Bye]: 'Bye',
  [MatchType.GrandFinal]: 'Grand final',
  [MatchType.Standard]: '',
  [MatchType.ThirdPlace]: 'Third place',
  [MatchType.Walkover]: 'Walkover',
};

const DEFAULT_BRACKET_SECTION_LABELS: Record<BracketSection, string> = {
  [BracketSection.GrandFinal]: 'Grand final',
  [BracketSection.Losers]: 'Losers',
  [BracketSection.Winners]: 'Winners',
};

const DEFAULT_RESOLVED_TOURNAMENT_LOCALIZATION: ResolvedTournamentLocalization = {
  locale: undefined,
  timeZone: undefined,
  dateTimeFormatOptions: DEFAULT_DATE_TIME_FORMAT_OPTIONS,
  roundLabels: DEFAULT_ROUND_LABELS,
  statusLabels: DEFAULT_STATUS_LABELS,
  matchTypeLabels: DEFAULT_MATCH_TYPE_LABELS,
  bracketSectionLabels: DEFAULT_BRACKET_SECTION_LABELS,
  uiLabels: DEFAULT_TOURNAMENT_UI_LABELS,
};

const dateTimeFormatterCache = new Map<string, Intl.DateTimeFormat>();

export function resolveTournamentLocalization(
  localization?: TournamentLocalizationOptions
): ResolvedTournamentLocalization {
  if (!localization) {
    return DEFAULT_RESOLVED_TOURNAMENT_LOCALIZATION;
  }

  return {
    locale: localization.locale,
    timeZone: localization.timeZone,
    dateTimeFormatOptions: localization.dateTimeFormatOptions ?? DEFAULT_DATE_TIME_FORMAT_OPTIONS,
    roundLabels: mergeLabelMap(DEFAULT_ROUND_LABELS, localization.roundLabels),
    statusLabels: mergeLabelMap(DEFAULT_STATUS_LABELS, localization.statusLabels),
    matchTypeLabels: mergeLabelMap(DEFAULT_MATCH_TYPE_LABELS, localization.matchTypeLabels),
    bracketSectionLabels: mergeLabelMap(
      DEFAULT_BRACKET_SECTION_LABELS,
      localization.bracketSectionLabels
    ),
    uiLabels: {
      ...DEFAULT_TOURNAMENT_UI_LABELS,
      ...localization.uiLabels,
    },
  };
}

function mergeLabelMap(
  defaults: Readonly<Record<string, string>>,
  overrides?: Readonly<Record<string, string | undefined>>
): Readonly<Record<string, string>> {
  if (!overrides) {
    return defaults;
  }

  const merged: Record<string, string> = { ...defaults };
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
}

export function getTournamentRoundLabel(
  roundCount: number,
  roundIndex: number,
  localization = DEFAULT_RESOLVED_TOURNAMENT_LOCALIZATION
): string {
  const remaining = roundCount - roundIndex;

  if (remaining === 1) {
    return localization.roundLabels['final'] ?? DEFAULT_ROUND_LABELS['final'] ?? 'FINAL';
  }

  if (remaining === 2) {
    return (
      localization.roundLabels['semifinals'] ?? DEFAULT_ROUND_LABELS['semifinals'] ?? 'SEMIFINALS'
    );
  }

  if (remaining === 3) {
    return (
      localization.roundLabels['quarterfinals'] ??
      DEFAULT_ROUND_LABELS['quarterfinals'] ??
      'QUARTERFINALS'
    );
  }

  const participantCount = 2 ** (remaining - 1);
  const key = `roundOf${participantCount}`;
  return (
    localization.roundLabels[key] ??
    (
      localization.roundLabels['roundOf'] ??
      DEFAULT_ROUND_LABELS['roundOf'] ??
      'ROUND OF {count}'
    ).replace('{count}', String(participantCount))
  );
}

export function formatStatusLabel(
  status: MatchStatus | `${MatchStatus}`,
  localization = DEFAULT_RESOLVED_TOURNAMENT_LOCALIZATION
): string {
  return localization.statusLabels[status] ?? status;
}

export function formatMatchTypeLabel(
  matchType: string | undefined,
  localization = DEFAULT_RESOLVED_TOURNAMENT_LOCALIZATION
): string {
  return matchType ? (localization.matchTypeLabels[matchType] ?? '') : '';
}

export function formatBracketSectionLabel(
  bracketSection: string | undefined,
  localization = DEFAULT_RESOLVED_TOURNAMENT_LOCALIZATION
): string {
  return bracketSection ? (localization.bracketSectionLabels[bracketSection] ?? '') : '';
}

export function formatMatchDateTime(
  scheduledAt: string,
  timeZone: string | undefined,
  localization = DEFAULT_RESOLVED_TOURNAMENT_LOCALIZATION
): string {
  const date = new Date(scheduledAt);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`Invalid match payload: scheduledAt must be a valid date string.`);
  }

  const resolvedTimeZone = timeZone ?? localization.timeZone;
  const options = {
    ...localization.dateTimeFormatOptions,
    ...(resolvedTimeZone ? { timeZone: resolvedTimeZone } : {}),
  };
  const formatter = getDateTimeFormatter(localization.locale, options);
  return formatter.format(date);
}

export function getMatchScheduleText(
  meta: Pick<NormalizedSquashMatchMeta, 'scheduledAt' | 'timezone' | 'venue'>,
  localization = DEFAULT_RESOLVED_TOURNAMENT_LOCALIZATION
): string | undefined {
  const scheduledText = meta.scheduledAt
    ? formatMatchDateTime(meta.scheduledAt, meta.timezone ?? localization.timeZone, localization)
    : undefined;
  const venue = meta.venue?.trim();

  return [scheduledText, venue].filter(Boolean).join(' · ') || undefined;
}

function getDateTimeFormatter(
  locale: ResolvedTournamentLocalization['locale'],
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const cacheKey = JSON.stringify([locale ?? null, options]);
  const cached = dateTimeFormatterCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat(locale, options);
  dateTimeFormatterCache.set(cacheKey, formatter);
  return formatter;
}
