import type { MatchPlayer, MatchStatus } from '@graph-render/types/tournament';

import type { SetWins } from '../../models/squash';

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

const statusText = (status: MatchStatus): string => status;

export const getMatchTypeLabel = (matchType: string | undefined): string => {
  if (matchType === 'thirdPlace') return 'Third place';
  if (matchType === 'grandFinal') return 'Grand final';
  if (matchType === 'bye') return 'Bye';
  if (matchType === 'walkover') return 'Walkover';
  return '';
};

export const getBracketSectionLabel = (bracketSection: string | undefined): string => {
  if (bracketSection === 'winners') return 'Winners';
  if (bracketSection === 'losers') return 'Losers';
  if (bracketSection === 'grandFinal') return 'Grand final';
  return '';
};

export const getMatchBadgeLabel = (
  matchType: string | undefined,
  bracketSection: string | undefined
): string => getMatchTypeLabel(matchType) || getBracketSectionLabel(bracketSection);

export const getMatchAriaLabel = ({
  bracketSection,
  currentSet,
  players,
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
  readonly matchType?: string | undefined;
  readonly players: readonly [MatchPlayer, MatchPlayer];
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
  const liveDetail = statusText(status) === 'live' ? ` Current set ${currentSet + 1}.` : '';
  const venueDetail = venue ? ` Venue ${venue}.` : '';
  const semanticLabel = getMatchBadgeLabel(matchType, bracketSection);
  const prefix = semanticLabel ? `${semanticLabel} match` : `${stage} match`;

  return `${prefix}: ${playerOne.name} versus ${playerTwo.name}. Status ${statusText(
    status
  )}. Score ${score}. ${winner}.${liveDetail}${venueDetail}`;
};
