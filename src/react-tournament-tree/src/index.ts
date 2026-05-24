'use client';

export { BracketToolbar } from './components/BracketToolbar';
export {
  MultiStageTournament,
  type MultiStageTournamentProps,
} from './components/MultiStageTournament';
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
/* eslint-disable @typescript-eslint/no-deprecated -- legacy theme API kept for backward compatibility */
export { BracketThemeProvider, useBracketTheme } from './contexts/BracketThemeContext';
export type {
  TournamentBracketInteractionOptions,
  TournamentBracketProps,
  TournamentBracketThemeOptions,
  TournamentBracketToolbarOptions,
} from './models/tournamentBracket';
export { routeBracketEdges } from './utils/bracketRouting';
export { injectTournamentPathKeys } from './utils/pathKeys';
/* eslint-enable @typescript-eslint/no-deprecated -- legacy theme API kept for backward compatibility */
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
  buildKnockoutBracketFromGroups,
  type BuildKnockoutFromGroupsOptions,
  calculateGroupAdvancers,
  calculateRoundRobinStandings,
  type DoubleEliminationBracketOptions,
  type DoubleEliminationEdgeMeta,
  type DoubleEliminationGraph,
  type EliminationFormat,
  generateDoubleEliminationBracket,
  generateRoundRobinSchedule,
  generateSingleEliminationBracket,
  type GroupAdvancementRule,
  groupRoundRobinMatchesByRound,
  nextPowerOfTwo,
  type RoundRobinGroup,
  type RoundRobinMatch,
  type RoundRobinPointsRule,
  type RoundRobinStanding,
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
