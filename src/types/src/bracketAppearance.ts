/**
 * Styling configuration for {@link TournamentBracket}.
 * Every field is optional; omitted values use the library defaults.
 */

export interface SquashThemeColors {
  readonly BASE_BG: string;
  readonly SURFACE_BG: string;
  readonly HEADER_BG: string;
  readonly HEADER_TITLE: string;
  readonly HEADER_MUTED: string;
  readonly HEADER_BORDER: string;
  readonly ICON_BG: string;
  readonly ICON_FG: string;
  readonly BADGE_BG: string;
  readonly BADGE_DOT: string;
  readonly BADGE_TEXT: string;
  readonly HOVER_BG: string;
  readonly CREST_BG: string;
  readonly CREST_TEXT: string;
  readonly SEED_TEXT: string;
  readonly COUNTRY_TEXT: string;
  readonly WINNER_CREST_BG: string;
  readonly WINNER_CREST_TEXT: string;
  readonly ROW_BG: string;
  readonly ROW_BG_WINNER: string;
  readonly ROW_HOVER_BG: string;
  readonly FOREGROUND: string;
  readonly MUTED_TEXT: string;
  readonly DARK_TEXT: string;
  readonly BORDER: string;
  readonly DARK_BORDER: string;
  readonly CARD_BORDER: string;
  readonly WINNER_ACCENT: string;
  readonly WINNING_SCORE: string;
  readonly LIVE_WINNING_SCORE: string;
  readonly LIVE_INDICATOR: string;
  readonly UPCOMING_TEXT: string;
  readonly EDGE_COLOR: string;
  readonly LABEL_TEXT: string;
  readonly TOOLBAR_BG: string;
  readonly TOOLBAR_BORDER: string;
  readonly TOOLBAR_ICON: string;
  readonly TOOLBAR_ICON_ACTIVE: string;
  readonly SHADOW: string;
  readonly CARD_SHADOW: string;
}

export type TournamentThemeColors = SquashThemeColors;
export type SquashThemeColorsOverrides = Partial<SquashThemeColors>;
export type TournamentThemeColorsOverrides = Partial<TournamentThemeColors>;

export interface BracketColorsAppearance {
  readonly light?: TournamentThemeColorsOverrides | undefined;
  readonly dark?: TournamentThemeColorsOverrides | undefined;
}

export interface BracketTypographyAppearance {
  readonly bodyFontFamily?: string | undefined;
  readonly scoreFontFamily?: string | undefined;
}

export interface MatchCardScoreAppearance {
  readonly segmentWidth?: number | undefined;
  readonly segmentGap?: number | undefined;
  readonly fontSize?: number | undefined;
  readonly matchCountFontSize?: number | undefined;
}

export interface MatchCardAppearance {
  readonly width?: number | undefined;
  readonly height?: number | undefined;
  readonly borderRadius?: number | undefined;
  readonly insetX?: number | undefined;
  readonly badgeSize?: number | undefined;
  readonly badgePad?: number | undefined;
  readonly badgeFontSize?: number | undefined;
  readonly nameFontSize?: number | undefined;
  readonly matchCountWidth?: number | undefined;
  readonly matchCountTrailingGap?: number | undefined;
  readonly scoreGroupTrailingGap?: number | undefined;
  readonly rowPadding?: string | undefined;
  readonly rowGap?: number | undefined;
  readonly score?: MatchCardScoreAppearance | undefined;
}

export interface MatchCardAppearanceByDensity {
  readonly compact?: MatchCardAppearance | undefined;
  readonly standard?: MatchCardAppearance | undefined;
}

export interface BracketFrameAppearance {
  readonly maxWidth?: number | string | undefined;
  readonly borderRadiusCompact?: number | undefined;
  readonly borderRadiusStandard?: number | undefined;
  readonly contentPaddingCompact?: string | undefined;
  readonly contentPaddingStandard?: string | undefined;
  readonly canvasBackgroundLight?: string | undefined;
  readonly canvasBackgroundDark?: string | undefined;
}

export interface BracketHeaderAppearance {
  readonly gap?: number | undefined;
  readonly minHeightCompact?: number | undefined;
  readonly minHeightStandard?: number | undefined;
  readonly paddingCompact?: string | undefined;
  readonly paddingStandard?: string | undefined;
  readonly iconSizeCompact?: number | undefined;
  readonly iconSizeStandard?: number | undefined;
  readonly iconRadiusCompact?: number | undefined;
  readonly iconRadiusStandard?: number | undefined;
  readonly titleFontSizeCompact?: number | undefined;
  readonly titleFontSizeStandard?: number | undefined;
  readonly badgeFontSizeCompact?: number | undefined;
  readonly badgeFontSizeStandard?: number | undefined;
  readonly badgePaddingCompact?: string | undefined;
  readonly badgePaddingStandard?: string | undefined;
  readonly badgeDotSize?: number | undefined;
}

export interface BracketStageLabelsAppearance {
  readonly backgroundLight?: string | undefined;
  readonly backgroundDark?: string | undefined;
  readonly paddingCompact?: string | undefined;
  readonly paddingStandard?: string | undefined;
  readonly paddingNavigationCompact?: string | undefined;
  readonly paddingNavigationStandard?: string | undefined;
  readonly gridGapCompact?: number | undefined;
  readonly gridGapStandard?: number | undefined;
  readonly labelFontSizeCompact?: number | undefined;
  readonly labelFontSizeStandard?: number | undefined;
  readonly activePillFontSizeCompact?: number | undefined;
  readonly activePillFontSizeStandard?: number | undefined;
  readonly activePillPaddingCompact?: string | undefined;
  readonly activePillPaddingStandard?: string | undefined;
  readonly counterFontSizeCompact?: number | undefined;
  readonly counterFontSizeStandard?: number | undefined;
  readonly navColorLight?: string | undefined;
  readonly navColorDark?: string | undefined;
  readonly navBorderLight?: string | undefined;
  readonly navBorderDark?: string | undefined;
}

/**
 * Visual customization for tournament bracket UI (match cards, chrome, colors, typography).
 * Graph layout and engine options remain on {@link GraphConfig} via the tournament package props.
 */
export interface TournamentBracketAppearance {
  readonly colors?: BracketColorsAppearance | undefined;
  readonly typography?: BracketTypographyAppearance | undefined;
  readonly matchCard?: MatchCardAppearanceByDensity | undefined;
  readonly frame?: BracketFrameAppearance | undefined;
  readonly header?: BracketHeaderAppearance | undefined;
  readonly stageLabels?: BracketStageLabelsAppearance | undefined;
}
