import { type MatchPlayer, MatchStatus } from '@graph-render/types/tournament';

import type { ResolvedTournamentLocalization } from '../../models/localization';
import type { SetWins } from '../../models/squash';
import {
  formatBracketSectionLabel,
  formatMatchTypeLabel,
  formatStatusLabel,
  resolveTournamentLocalization,
} from '../localization';

export const truncateText = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
};

export const getPlayerBadgeText = (player: MatchPlayer): string => {
  const initials = player.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || '–';
};

export const getPlayerMetadataText = (player: MatchPlayer): string => {
  const parts = [
    typeof player.seed === 'number' && Number.isFinite(player.seed) ? `#${player.seed}` : '',
    player.country?.trim().toUpperCase() ?? '',
  ].filter(Boolean);

  return parts.join(' · ');
};

const DEFAULT_LOCALIZATION = resolveTournamentLocalization();

export const getMatchTypeLabel = (
  matchType: string | undefined,
  localization: ResolvedTournamentLocalization = DEFAULT_LOCALIZATION
): string => formatMatchTypeLabel(matchType, localization);

export const getBracketSectionLabel = (
  bracketSection: string | undefined,
  localization: ResolvedTournamentLocalization = DEFAULT_LOCALIZATION
): string => formatBracketSectionLabel(bracketSection, localization);

export const getMatchBadgeLabel = (
  matchType: string | undefined,
  bracketSection: string | undefined,
  localization: ResolvedTournamentLocalization = DEFAULT_LOCALIZATION
): string =>
  getMatchTypeLabel(matchType, localization) ||
  getBracketSectionLabel(bracketSection, localization);

export const getMatchAriaLabel = ({
  bracketSection,
  currentSet,
  localization = DEFAULT_LOCALIZATION,
  players,
  scheduleText,
  scoreUnit = 'sets',
  setWins,
  stage,
  status,
  venue,
  winnerIndex,
  matchType,
}: {
  readonly bracketSection?: string | undefined;
  readonly currentSet: number;
  readonly localization?: ResolvedTournamentLocalization | undefined;
  readonly matchType?: string | undefined;
  readonly players: readonly [MatchPlayer, MatchPlayer];
  readonly scheduleText?: string | undefined;
  readonly scoreUnit?: 'games' | 'sets' | undefined;
  readonly setWins: SetWins;
  readonly stage: string;
  readonly status: MatchStatus;
  readonly venue?: string | undefined;
  readonly winnerIndex: number | null;
}): string => {
  const [playerOne, playerTwo] = players;
  const score = `${playerOne.name} ${setWins.p1} ${scoreUnit}, ${playerTwo.name} ${setWins.p2} ${scoreUnit}`;
  const winnerPlayer = winnerIndex == null ? undefined : players[winnerIndex];
  const winner = winnerPlayer ? `Winner ${winnerPlayer.name}` : 'No winner yet';
  const localizedStatus = formatStatusLabel(status, localization);
  const liveDetail = status === MatchStatus.Live ? ` Current set ${currentSet + 1}.` : '';
  const scheduleDetail = scheduleText
    ? ` ${localization.uiLabels.scheduled} ${scheduleText}.`
    : venue
      ? ` Venue ${venue}.`
      : '';
  const semanticLabel = getMatchBadgeLabel(matchType, bracketSection, localization);
  const prefix = semanticLabel ? `${semanticLabel} match` : `${stage} match`;

  return `${prefix}: ${playerOne.name} versus ${playerTwo.name}. Status ${localizedStatus}. Score ${score}. ${winner}.${liveDetail}${scheduleDetail}`;
};
