import type { BracketSection, MatchStatus, MatchType } from '@graph-render/types/tournament';

export type TournamentLocale = string | readonly string[];

export type TournamentRoundLabelKey =
  | 'final'
  | 'quarterfinals'
  | 'roundOf'
  | `roundOf${number}`
  | 'semifinals';

export interface TournamentUiLabels {
  readonly advancedParticipants: string;
  readonly advancing: string;
  readonly buchholz: string;
  readonly doubleElimination: string;
  readonly draws: string;
  readonly goToNextStage: string;
  readonly goToPreviousStage: string;
  readonly groupStage: string;
  readonly knockout: string;
  readonly liveMatch: string;
  readonly losses: string;
  readonly nextStage: string;
  readonly placementMatch: string;
  readonly played: string;
  readonly points: string;
  readonly previousStage: string;
  readonly round: string;
  readonly scheduled: string;
  readonly schedule: string;
  readonly scoreDifference: string;
  readonly showLowerPlayers: string;
  readonly showUpperPlayers: string;
  readonly sonnebornBerger: string;
  readonly standings: string;
  readonly swiss: string;
  readonly team: string;
  readonly tournament: string;
  readonly upcoming: string;
  readonly wins: string;
}

export interface TournamentLocalizationOptions {
  readonly locale?: TournamentLocale | undefined;
  readonly timeZone?: string | undefined;
  readonly dateTimeFormatOptions?: Intl.DateTimeFormatOptions | undefined;
  readonly roundLabels?: Partial<Record<string, string>> | undefined;
  readonly statusLabels?: Partial<Record<MatchStatus | `${MatchStatus}`, string>> | undefined;
  readonly matchTypeLabels?: Partial<Record<MatchType | `${MatchType}`, string>> | undefined;
  readonly bracketSectionLabels?:
    | Partial<Record<BracketSection | `${BracketSection}`, string>>
    | undefined;
  readonly uiLabels?: Partial<TournamentUiLabels> | undefined;
}

export interface ResolvedTournamentLocalization {
  readonly locale: TournamentLocale | undefined;
  readonly timeZone: string | undefined;
  readonly dateTimeFormatOptions: Intl.DateTimeFormatOptions;
  readonly roundLabels: Readonly<Record<string, string>>;
  readonly statusLabels: Readonly<Record<string, string>>;
  readonly matchTypeLabels: Readonly<Record<string, string>>;
  readonly bracketSectionLabels: Readonly<Record<string, string>>;
  readonly uiLabels: TournamentUiLabels;
}
