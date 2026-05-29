'use client';

export { BracketToolbar } from './components/BracketToolbar';
export {
  MultiStageTournament,
  type MultiStageTournamentProps,
} from './components/MultiStageTournament';
export { PlacementBracket, type PlacementBracketProps } from './components/PlacementBracket';
export { RoundRobinBracket, type RoundRobinBracketProps } from './components/RoundRobinBracket';
export { SquashNode } from './components/SquashNode';
export { TournamentBracket } from './components/TournamentBracket';
export {
  COMPACT_TOURNAMENT_CONFIG,
  DARK_COMPACT_TOURNAMENT_CONFIG,
  DARK_TOURNAMENT_CONFIG,
  DEFAULT_TOURNAMENT_CONFIG,
  NODE_DIMENSIONS,
  NODE_DIMENSIONS_COMPACT,
  NODE_DIMENSIONS_STAGE_NAV,
} from './constants';
export { ThemeMode } from './constants/themeMode';
export {
  BracketAppearanceProvider,
  useBracketAppearance,
} from './contexts/BracketAppearanceContext';
export {
  BracketLocalizationProvider,
  useBracketLocalization,
} from './contexts/BracketLocalizationContext';
/* eslint-disable @typescript-eslint/no-deprecated -- legacy theme exports remain available for backward compatibility */
export { BracketThemeProvider, useBracketTheme } from './contexts/BracketThemeContext';
/* eslint-enable @typescript-eslint/no-deprecated -- legacy theme exports remain available for backward compatibility */
export { useBracketMatchUpdate } from './contexts/BracketVertexOptionsContext';
export type {
  ResolvedTournamentLocalization,
  TournamentLocale,
  TournamentLocalizationOptions,
  TournamentRoundLabelKey,
  TournamentUiLabels,
} from './models/localization';
export type {
  TournamentBracketInteractionOptions,
  TournamentBracketProps,
  TournamentBracketThemeOptions,
  TournamentBracketToolbarOptions,
  TournamentMatchUpdatePayload,
} from './models/tournamentBracket';
export { routeBracketEdges } from './utils/bracketRouting';
export {
  formatBracketSectionLabel,
  formatMatchDateTime,
  formatMatchTypeLabel,
  formatStatusLabel,
  getMatchScheduleText,
  getTournamentRoundLabel,
  resolveTournamentLocalization,
} from './utils/localization';
export { injectTournamentPathKeys } from './utils/pathKeys';
export type {
  ResolvedBracketAppearance,
  ResolvedBracketFrameStyle,
  ResolvedBracketHeaderStyle,
  ResolvedBracketStageLabelsStyle,
  ResolvedBracketTypography,
  ResolvedMatchCardScoreStyle,
  ResolvedMatchCardStyle,
} from './utils/resolveBracketAppearance';
export {
  roundLabelsForGraph,
  roundLabelsForMatchCount,
  roundLabelsForRoundCount,
} from './utils/roundLabels';
export { getStageViewport } from './utils/stageViewport';
export { buildStageViews } from './utils/stageViews';
export {
  applyScoreCorrectionCascade,
  buildKnockoutBracketFromGroups,
  type BuildKnockoutFromGroupsOptions,
  calculateGroupAdvancers,
  calculateRoundRobinStandings,
  correctMatchResult,
  type DoubleEliminationBracketOptions,
  type DoubleEliminationEdgeMeta,
  type DoubleEliminationGraph,
  type EliminationFormat,
  generateDoubleEliminationBracket,
  generatePlacementMatches,
  generateRoundRobinSchedule,
  generateSingleEliminationBracket,
  type GroupAdvancementRule,
  groupPlacementMatchesByRound,
  groupPlacementMatchesByTier,
  groupRoundRobinMatchesByRound,
  type MatchResultUpdate,
  nextPowerOfTwo,
  type ParticipantCascadeChange,
  type PlacementMatch,
  type PlacementTierInput,
  resolvePlacementLabel,
  type RoundRobinGroup,
  type RoundRobinMatch,
  type RoundRobinPointsRule,
  type RoundRobinStanding,
  type ScoreCorrectionResult,
  type SingleEliminationBracketOptions,
  type SingleEliminationGraph,
  type SingleEliminationSeeding,
  type TournamentParticipantInput,
} from './utils/tournament';
/* eslint-disable @typescript-eslint/no-deprecated -- legacy tournament aliases remain exported for backward compatibility */
export type {
  GameResult,
  MatchMeta,
  MatchNodeData,
  MatchPlayer,
  MatchPositionedNode,
  MultiStageTournamentConfig,
  SeriesFormat,
  SquashMatchMeta,
  SquashNodeData,
  SquashPlayer,
  SquashPositionedNode,
  StageBounds,
  StageView,
  StageViewportResult,
  TournamentBracketAppearance,
  TournamentMatch,
  TournamentStage,
  TournamentThemeColors,
} from '@graph-render/types/tournament';
/* eslint-enable @typescript-eslint/no-deprecated -- legacy tournament aliases remain exported for backward compatibility */
export {
  BracketSection,
  MatchStatus,
  MatchType,
  SquashNodeRenderMode,
  VerticalStagePosition,
} from '@graph-render/types/tournament';
