import { type GameResult, MatchStatus } from '@graph-render/types/tournament';

import type { NormalizedSquashMatchMeta, SetWins } from '../../models/squash';

export const getDisplayScores = (
  sets: ReadonlyArray<readonly number[]>,
  tiebreaks: ReadonlyArray<readonly number[] | null>,
  playerIndex: number
): readonly string[] => {
  return sets.map((setScores, setIndex) => {
    const score = setScores[playerIndex];

    if (!Number.isFinite(score)) {
      return '—';
    }

    const tiebreakValue = tiebreaks[setIndex]?.[playerIndex];
    if (typeof tiebreakValue === 'number' && Number.isFinite(tiebreakValue) && tiebreakValue > 0) {
      return `${score}(${tiebreakValue})`;
    }

    return String(score);
  });
};

export const getScoreSegments = (
  sets: ReadonlyArray<readonly number[]>,
  tiebreaks: ReadonlyArray<readonly number[] | null>,
  playerIndex: number
): readonly string[] => {
  const segments = getDisplayScores(sets, tiebreaks, playerIndex);
  return segments.length > 0 ? segments : ['—'];
};

export const getGameScoreSegments = (
  games: readonly GameResult[],
  playerIndex: number
): readonly string[] => {
  if (games.length === 0) {
    return ['—'];
  }

  return games.map((game, index) => {
    const score = game.scores[playerIndex];
    const label = game.label?.trim() || `G${index + 1}`;
    return Number.isFinite(score) ? `${label}:${score}` : `${label}:—`;
  });
};

export const getMatchScoreSegments = (
  meta: NormalizedSquashMatchMeta,
  playerIndex: number
): readonly string[] =>
  meta.games.length > 0
    ? getGameScoreSegments(meta.games, playerIndex)
    : getScoreSegments(meta.sets, meta.tiebreaks, playerIndex);

export const getMatchScoreSegmentCount = (meta: NormalizedSquashMatchMeta): number =>
  Math.max(meta.games.length || meta.sets.length, 1);

export const getScoreGroupWidth = (
  segmentCount: number,
  segmentWidth: number,
  segmentGap: number
): number => {
  if (segmentCount <= 0) {
    return segmentWidth;
  }

  return segmentCount * segmentWidth + Math.max(0, segmentCount - 1) * segmentGap;
};

export const getSetWins = (
  sets: ReadonlyArray<readonly number[]>,
  status: MatchStatus,
  currentSet: number
): SetWins => {
  return sets.reduce<{ p1: number; p2: number }>(
    (acc, setScores, index) => {
      if (status === MatchStatus.Live && index === currentSet) {
        return acc;
      }
      const a = setScores[0] ?? 0;
      const b = setScores[1] ?? 0;

      if (a > b) {
        acc.p1 += 1;
      } else if (b > a) {
        acc.p2 += 1;
      }

      return acc;
    },
    { p1: 0, p2: 0 }
  );
};

export const getGameWins = (
  games: readonly GameResult[],
  status: MatchStatus,
  currentGame: number
): SetWins => {
  return games.reduce<{ p1: number; p2: number }>(
    (acc, game, index) => {
      if (status === MatchStatus.Live && index === currentGame) {
        return acc;
      }

      const winner =
        game.winner ??
        (game.scores[0] > game.scores[1] ? 0 : game.scores[1] > game.scores[0] ? 1 : null);
      if (winner === 0) {
        acc.p1 += 1;
      } else if (winner === 1) {
        acc.p2 += 1;
      }

      return acc;
    },
    { p1: 0, p2: 0 }
  );
};

export const getMatchWins = (meta: NormalizedSquashMatchMeta): SetWins =>
  meta.games.length > 0
    ? getGameWins(meta.games, meta.status, meta.currentSet)
    : getSetWins(meta.sets, meta.status, meta.currentSet);

export const getCompletedWinnerIndex = (setWins: SetWins, status: MatchStatus): number | null => {
  if (status !== MatchStatus.Completed || setWins.p1 === setWins.p2) {
    return null;
  }

  return setWins.p1 > setWins.p2 ? 0 : 1;
};

export { type SetWins } from '../../models/squash';
