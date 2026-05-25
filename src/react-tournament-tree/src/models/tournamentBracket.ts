import type { GraphConfig, NxGraphInput } from '@graph-render/types';
import type { GraphViewport, VertexComponent } from '@graph-render/types/react';
import type {
  MatchMeta,
  MatchPositionedNode,
  SquashNodeRenderMode,
  TournamentBracketAppearance,
} from '@graph-render/types/tournament';

import type { TournamentLocalizationOptions } from './localization';

export interface TournamentBracketInteractionOptions {
  readonly panEnabled?: boolean | undefined;
  readonly zoomEnabled?: boolean | undefined;
  readonly pinchZoomEnabled?: boolean | undefined;
}

export interface TournamentBracketThemeOptions {
  readonly isDarkMode?: boolean | undefined;
  readonly defaultDarkMode?: boolean | undefined;
  readonly onDarkModeChange?: ((isDarkMode: boolean) => void) | undefined;
  readonly syncToDocument?: boolean | undefined;
}

export interface TournamentBracketToolbarOptions {
  readonly showToolbar?: boolean | undefined;
  readonly showViewportControls?: boolean | undefined;
  /** When true, shows a PDF export button in the toolbar. Requires jspdf to be installed. */
  readonly showPdfExport?: boolean | undefined;
}

export interface TournamentMatchUpdatePayload {
  readonly matchId: string;
  readonly update: Partial<MatchMeta>;
}

export interface TournamentBracketProps {
  readonly graph: NxGraphInput;
  readonly config?: Partial<GraphConfig> | undefined;
  readonly appearance?: TournamentBracketAppearance | undefined;
  readonly localization?: TournamentLocalizationOptions | undefined;
  readonly defaultViewport?: Partial<GraphViewport> | undefined;
  readonly vertexComponent?: VertexComponent | undefined;
  readonly nodeRenderMode?: SquashNodeRenderMode | undefined;
  readonly title?: string | undefined;
  readonly badgeText?: string | undefined;
  /** Prefer grouped toolbar options; flat props remain supported for compatibility. */
  readonly toolbar?: TournamentBracketToolbarOptions | undefined;
  readonly showToolbar?: boolean | undefined;
  readonly showViewportControls?: boolean | undefined;
  /** When true, shows a PDF export button in the toolbar. Requires jspdf to be installed. */
  readonly showPdfExport?: boolean | undefined;
  readonly defaultNavigationMode?: boolean | undefined;
  /** Prefer grouped theme options; flat props remain supported for compatibility. */
  readonly theme?: TournamentBracketThemeOptions | undefined;
  /** Controlled dark-mode state. Prefer this over document probing for SSR/app-theme integration. */
  readonly isDarkMode?: boolean | undefined;
  /** Initial uncontrolled dark-mode state when `isDarkMode` is not provided. */
  readonly defaultDarkMode?: boolean | undefined;
  readonly onDarkModeChange?: ((isDarkMode: boolean) => void) | undefined;
  /** When true, toggling the bracket theme also toggles `document.documentElement.dark`. */
  readonly syncDarkModeToDocument?: boolean | undefined;
  /** Prefer grouped interaction options; flat props remain supported for compatibility. */
  readonly interaction?: TournamentBracketInteractionOptions | undefined;
  readonly panEnabled?: boolean | undefined;
  readonly zoomEnabled?: boolean | undefined;
  readonly pinchZoomEnabled?: boolean | undefined;
  readonly compact?: boolean | undefined;
  readonly onMatchClick?: ((node: MatchPositionedNode) => void) | undefined;
  readonly onInvalidNode?: ((nodeId: string, error: Error) => void) | undefined;
  readonly onExportError?: ((error: Error) => void) | undefined;
  readonly onMatchUpdate?: ((payload: TournamentMatchUpdatePayload) => void) | undefined;
}
