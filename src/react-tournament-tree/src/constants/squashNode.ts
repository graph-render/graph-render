import type { MatchPlayer } from '@graph-render/types/tournament';

import { DEFAULT_PLAYERS } from './node';

export const SCORE_FONT_FAMILY = '"Space Mono", "SFMono-Regular", ui-monospace, monospace';
export const BODY_FONT_FAMILY = '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif';
/** Default (non-compact) per-set score column width and gap between columns. */
export const SCORE_SEGMENT_WIDTH = 24;
export const SCORE_SEGMENT_GAP = 10;
export const SCORE_SEPARATOR_HEIGHT = 10;
export const NODE_BORDER_WIDTH = 2;

export interface SquashScoreLayout {
  readonly segmentWidth: number;
  readonly segmentGap: number;
  readonly fontSize: number;
  readonly matchCountFontSize: number;
}

/** Tight set-score columns for compact / stage-nav match cards. */
export const SCORE_LAYOUT_COMPACT: SquashScoreLayout = {
  segmentWidth: 9,
  segmentGap: 5,
  fontSize: 7.5,
  matchCountFontSize: 11,
};

/** Roomier set-score columns for standard match cards. */
export const SCORE_LAYOUT_DEFAULT: SquashScoreLayout = {
  segmentWidth: SCORE_SEGMENT_WIDTH,
  segmentGap: SCORE_SEGMENT_GAP,
  fontSize: 14.5,
  matchCountFontSize: 21,
};

export const getSquashScoreLayout = (compact: boolean): SquashScoreLayout =>
  compact ? SCORE_LAYOUT_COMPACT : SCORE_LAYOUT_DEFAULT;

export const DEFAULT_PLAYER_ONE: MatchPlayer = DEFAULT_PLAYERS[0] ?? { name: 'TBD', seed: 0 };
export const DEFAULT_PLAYER_TWO: MatchPlayer = DEFAULT_PLAYERS[1] ?? { name: 'TBD', seed: 0 };
