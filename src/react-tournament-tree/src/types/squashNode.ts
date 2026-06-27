import type { VertexComponentProps } from '@graph-render/types/react';
import type {
  MatchPlayer,
  SquashNodeRenderMode,
  TournamentThemeColors,
} from '@graph-render/types/tournament';

import type { ResolvedTournamentLocalization } from '../models/localization';
import type { NormalizedSquashMatchMeta, SetWins } from '../models/squash';

export interface SquashNodeProps extends VertexComponentProps {
  readonly renderMode?: SquashNodeRenderMode | undefined;
  readonly compact?: boolean | undefined;
  readonly onRenderError?: ((nodeId: string, error: Error) => void) | undefined;
}

export interface PlayerHoverHandlers {
  readonly onPlayerEnter: (playerIndex: number, player: MatchPlayer) => void;
  readonly onPlayerLeave: () => void;
}

export type SquashNodeVariantProps = PlayerHoverHandlers & {
  readonly nodeId: string;
  readonly nodeWidth: number;
  readonly nodeHeight: number;
  readonly compact: boolean;
  readonly isHovered?: boolean | undefined;
  readonly hoveredPlayerIndex: number | null;
  readonly normalizedActivePathKey: string | null;
  readonly isNodeInActivePath: boolean;
  readonly isTBD: boolean;
  readonly ariaLabel: string;
  readonly localization?: ResolvedTournamentLocalization | undefined;
  readonly meta: NormalizedSquashMatchMeta;
  readonly scheduleText?: string | undefined;
  readonly setWins: SetWins;
  readonly winnerIndex: number | null;
  readonly colors: TournamentThemeColors;
};

export type SquashPlayerRowProps = PlayerHoverHandlers & {
  readonly nodeId: string;
  readonly player: MatchPlayer;
  readonly playerIndex: number;
  readonly compact: boolean;
  readonly isTBD: boolean;
  readonly isWinner: boolean;
  readonly isPlayerHovered: boolean;
  readonly playerOpacity: number;
  readonly setCount: number;
  readonly scoreSegments: readonly string[];
  /** Hide the per-set score column + divider (final-score-only matches). */
  readonly hideScoreSegments?: boolean | undefined;
  readonly textColor: string;
  readonly colors: TournamentThemeColors;
};

export type { TournamentThemeColors as SquashThemeColors } from '@graph-render/types/tournament';
export { type TournamentThemeColors } from '@graph-render/types/tournament';
