export type { NormalizedSquashMatchMeta } from './normalizeMatchMeta';
export { normalizeMatchMeta } from './normalizeMatchMeta';
export { normalizePlayer, normalizePlayerKey, normalizePlayers } from './normalizePlayer';
export type { SetWins } from './score';
export {
  getCompletedWinnerIndex,
  getDisplayScores,
  getGameScoreSegments,
  getGameWins,
  getMatchScoreSegmentCount,
  getMatchScoreSegments,
  getMatchWins,
  getScoreGroupWidth,
  getScoreSegments,
  getSetWins,
} from './score';
export {
  getBracketSectionLabel,
  getMatchAriaLabel,
  getMatchBadgeLabel,
  getMatchTypeLabel,
  getPlayerBadgeText,
  getPlayerMetadataText,
  truncateText,
} from './text';
