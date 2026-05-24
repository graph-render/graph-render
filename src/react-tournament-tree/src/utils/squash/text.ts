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

export const getMatchAriaLabel = ({
  currentSet,
  players,
  setWins,
  stage,
  status,
  venue,
  winnerIndex,
}: {
  readonly currentSet: number;
  readonly players: readonly [MatchPlayer, MatchPlayer];
  readonly setWins: SetWins;
  readonly stage: string;
  readonly status: MatchStatus;
  readonly venue?: string | undefined;
  readonly winnerIndex: number | null;
}): string => {
  const [playerOne, playerTwo] = players;
  const score = `${playerOne.name} ${setWins.p1} sets, ${playerTwo.name} ${setWins.p2} sets`;
  const winnerPlayer = winnerIndex == null ? undefined : players[winnerIndex];
  const winner = winnerPlayer ? `Winner ${winnerPlayer.name}` : 'No winner yet';
  const liveDetail = statusText(status) === 'live' ? ` Current set ${currentSet + 1}.` : '';
  const venueDetail = venue ? ` Venue ${venue}.` : '';

  return `${stage} match: ${playerOne.name} versus ${playerTwo.name}. Status ${statusText(
    status
  )}. Score ${score}. ${winner}.${liveDetail}${venueDetail}`;
};
