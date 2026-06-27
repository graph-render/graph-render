import type {
  BracketSection,
  GameResult,
  MatchMeta,
  MatchPlayer,
  MatchStatus,
  MatchType,
  SeriesFormat,
} from '@graph-render/types/tournament';

export interface NormalizedSquashMatchMeta extends MatchMeta {
  readonly stage: string;
  readonly players: readonly [MatchPlayer, MatchPlayer];
  readonly sets: ReadonlyArray<readonly number[]>;
  readonly tiebreaks: ReadonlyArray<readonly number[] | null>;
  readonly status: MatchStatus;
  readonly currentSet: number;
  readonly matchType?: MatchType | `${MatchType}` | undefined;
  readonly bracketSection?: BracketSection | `${BracketSection}` | undefined;
  readonly scheduledAt?: string | undefined;
  readonly timezone?: string | undefined;
  readonly venue?: string | undefined;
  readonly seriesFormat?: SeriesFormat | string | undefined;
  readonly games: readonly GameResult[];
  readonly finalScore?: readonly [number, number] | undefined;
}

export interface SetWins {
  readonly p1: number;
  readonly p2: number;
}
