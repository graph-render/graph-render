import type { MatchPlayer } from '@graph-render/types/tournament';

export const NODE_DIMENSIONS = {
  WIDTH: 280,
  HEIGHT: 100,
} as const;

export const NODE_DIMENSIONS_COMPACT = {
  WIDTH: 160,
  HEIGHT: 56,
} as const;

export const NODE_DIMENSIONS_STAGE_NAV = {
  WIDTH: 160,
  HEIGHT: 44,
} as const;

export const DEFAULT_PLAYERS: readonly MatchPlayer[] = [
  { name: 'TBD', seed: 0 },
  { name: 'TBD', seed: 0 },
];

export { THEME_COLORS, THEME_COLORS_DARK, THEME_COLORS_LIGHT } from './themeColors';
