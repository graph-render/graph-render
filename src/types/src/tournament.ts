import type { NodeData, PositionedNode } from './node';
import type { GraphViewport } from './viewport';

export type * from './bracketAppearance';

export interface MatchPlayer {
  readonly id?: string | undefined;
  readonly name: string;
  readonly seed?: number | undefined;
  readonly country?: string | undefined;
  readonly avatarUrl?: string | undefined;
  readonly teamName?: string | undefined;
  readonly isBye?: boolean | undefined;
}

/** @deprecated Use MatchPlayer. */
export type SquashPlayer = MatchPlayer;

export enum MatchStatus {
  Completed = 'completed',
  Live = 'live',
  Upcoming = 'upcoming',
}

export enum MatchType {
  Standard = 'standard',
  ThirdPlace = 'thirdPlace',
  GrandFinal = 'grandFinal',
  Bye = 'bye',
  Walkover = 'walkover',
}

export enum BracketSection {
  Winners = 'winners',
  Losers = 'losers',
  GrandFinal = 'grandFinal',
}

export interface SeriesFormat {
  readonly bestOf?: number | undefined;
  readonly label?: string | undefined;
}

export interface RoundRobinPointsRule {
  readonly win?: number | undefined;
  readonly draw?: number | undefined;
  readonly loss?: number | undefined;
}

export interface RoundRobinMatch {
  readonly id: string;
  readonly round: number;
  readonly players: readonly [MatchPlayer, MatchPlayer];
  readonly scores?: readonly [number, number] | undefined;
  readonly status?: MatchStatus | `${MatchStatus}` | undefined;
  readonly venue?: string | undefined;
  readonly scheduledAt?: string | undefined;
}

export interface RoundRobinStanding {
  readonly player: MatchPlayer;
  readonly played: number;
  readonly wins: number;
  readonly draws: number;
  readonly losses: number;
  readonly scoreFor: number;
  readonly scoreAgainst: number;
  readonly scoreDifference: number;
  readonly points: number;
}

export interface RoundRobinGroup {
  readonly id: string;
  readonly name?: string | undefined;
  readonly participants: readonly MatchPlayer[];
  readonly matches: readonly RoundRobinMatch[];
  readonly points?: RoundRobinPointsRule | undefined;
}

export interface MatchMeta {
  readonly stage?: string | undefined;
  readonly players?: readonly MatchPlayer[] | undefined;
  readonly sets?: ReadonlyArray<readonly number[]> | undefined;
  readonly tiebreaks?: ReadonlyArray<readonly number[] | null> | undefined;
  readonly status?: MatchStatus | undefined;
  readonly currentSet?: number | undefined;
  readonly matchType?: MatchType | `${MatchType}` | undefined;
  readonly bracketSection?: BracketSection | `${BracketSection}` | undefined;
  readonly scheduledAt?: string | undefined;
  readonly timezone?: string | undefined;
  readonly venue?: string | undefined;
  readonly seriesFormat?: SeriesFormat | string | undefined;
}

/** @deprecated Use MatchMeta. */
export type SquashMatchMeta = MatchMeta;

export type MatchNodeData = NodeData<unknown, MatchMeta, string>;
export type MatchPositionedNode = PositionedNode<unknown, MatchMeta, string>;

/** @deprecated Use MatchNodeData. */
export type SquashNodeData = MatchNodeData;
/** @deprecated Use MatchPositionedNode. */
export type SquashPositionedNode = MatchPositionedNode;

export interface TournamentMatch {
  readonly id: string;
  readonly meta: MatchMeta;
}

export type TournamentStage =
  | {
      readonly type: 'elimination';
      readonly id?: string | undefined;
      readonly name?: string | undefined;
    }
  | {
      readonly type: 'groups';
      readonly id?: string | undefined;
      readonly name?: string | undefined;
    };

export enum SquashNodeRenderMode {
  Svg = 'svg',
  Html = 'html',
  Export = 'export',
  Server = 'server',
}

export interface StageBounds {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
}

export interface StageView {
  readonly index: number;
  readonly label: string;
  readonly bounds: StageBounds;
  readonly nodeIds: readonly string[];
}

export enum VerticalStagePosition {
  Top = 'top',
  Bottom = 'bottom',
  Center = 'center',
}

export interface StageViewportResult {
  readonly viewport: GraphViewport;
  readonly canPageVertically: boolean;
}
