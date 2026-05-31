import type {
  SwissMatch,
  SwissPointsRule,
  TournamentBracketAppearance,
} from '@graph-render/types/tournament';
import { MatchStatus } from '@graph-render/types/tournament';
import React, { useMemo } from 'react';

import {
  BracketAppearanceProvider,
  useBracketAppearance,
} from '../contexts/BracketAppearanceContext';
import {
  BracketLocalizationProvider,
  useBracketLocalization,
} from '../contexts/BracketLocalizationContext';
import type { TournamentLocalizationOptions } from '../models/localization';
import { formatStatusLabel, getMatchScheduleText } from '../utils/localization';
import type { TournamentParticipantInput } from '../utils/tournament';
import { calculateSwissStandings, groupSwissMatchesByRound } from '../utils/tournament';

export interface SwissBracketProps {
  /**
   * All registered participants. Must be supplied even when providing manual
   * matches — used to initialise standings rows and validate pairings.
   */
  readonly participants: readonly TournamentParticipantInput[];
  /**
   * Manual round-by-round pairings. If omitted the bracket renders an empty
   * schedule. Supply progressively as each round is confirmed.
   */
  readonly matches?: readonly SwissMatch[] | undefined;
  /** Custom win/draw/loss point values. Defaults: win=1, draw=0.5, loss=0. */
  readonly points?: SwissPointsRule | undefined;
  /** Displayed at the top of the bracket. */
  readonly title?: string | undefined;
  /** Secondary label shown above the title (e.g. "Open Division"). */
  readonly groupName?: string | undefined;
  readonly appearance?: TournamentBracketAppearance | undefined;
  readonly localization?: TournamentLocalizationOptions | undefined;
  readonly isDarkMode?: boolean | undefined;
  readonly compact?: boolean | undefined;
}

export const SwissBracket = React.memo<SwissBracketProps>(function SwissBracket({
  appearance,
  compact = false,
  isDarkMode = false,
  localization,
  ...props
}) {
  return (
    <BracketAppearanceProvider appearance={appearance} compact={compact} isDarkMode={isDarkMode}>
      <BracketLocalizationProvider localization={localization}>
        <SwissBracketContent {...props} compact={compact} />
      </BracketLocalizationProvider>
    </BracketAppearanceProvider>
  );
});

SwissBracket.displayName = 'SwissBracket';

// ── Internal ──────────────────────────────────────────────────────────────────

function SwissBracketContent({
  compact = false,
  groupName,
  matches = [],
  participants,
  points,
  title = 'Swiss',
}: Omit<SwissBracketProps, 'appearance' | 'isDarkMode' | 'localization'>) {
  const { colors, frame, matchCard, typography } = useBracketAppearance();
  const { uiLabels } = useBracketLocalization();
  const tableFontSize = compact ? 12 : 14;

  const standings = useMemo(
    () => calculateSwissStandings(participants, matches, points),
    [matches, participants, points]
  );

  const rounds = useMemo(() => groupSwissMatchesByRound(matches), [matches]);

  const totalRounds = rounds.length > 0 ? rounds[rounds.length - 1]!.round : 0;

  return (
    <section
      aria-label={groupName ? `${title}: ${groupName}` : title}
      data-swiss-bracket
      style={{
        background: colors.SURFACE_BG,
        border: `1px solid ${colors.HEADER_BORDER}`,
        borderRadius: frame.borderRadius,
        color: colors.FOREGROUND,
        fontFamily: typography.bodyFontFamily,
        padding: frame.contentPadding,
      }}
    >
      <header style={{ marginBottom: compact ? 12 : 18 }}>
        <p
          style={{
            color: colors.HEADER_MUTED,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.08em',
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          {groupName ?? uiLabels.swiss}
        </p>
        <h2
          style={{
            color: colors.HEADER_TITLE,
            fontSize: compact ? 18 : 24,
            lineHeight: 1.2,
            margin: '4px 0 0',
          }}
        >
          {title}
          {totalRounds > 0 ? (
            <span
              style={{
                color: colors.HEADER_MUTED,
                fontSize: compact ? 13 : 16,
                fontWeight: 400,
                marginLeft: 10,
              }}
            >
              ({totalRounds} {uiLabels.round.toLowerCase()}
              {totalRounds !== 1 ? 's' : ''})
            </span>
          ) : null}
        </h2>
      </header>

      <div
        style={{
          display: 'grid',
          gap: compact ? 14 : 20,
          gridTemplateColumns: compact ? '1fr' : 'minmax(340px, 0.9fr) minmax(340px, 1.1fr)',
        }}
      >
        {/* Standings */}
        <div>
          <h3 style={{ fontSize: tableFontSize, margin: '0 0 8px' }}>{uiLabels.standings}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table
              aria-label={uiLabels.standings}
              style={{
                borderCollapse: 'collapse',
                fontSize: tableFontSize,
                minWidth: 420,
                width: '100%',
              }}
            >
              <thead>
                <tr>
                  {[
                    { label: '#', numeric: true },
                    { label: uiLabels.team, numeric: false },
                    { label: uiLabels.played, numeric: true },
                    { label: uiLabels.wins, numeric: true },
                    { label: uiLabels.draws, numeric: true },
                    { label: uiLabels.losses, numeric: true },
                    { label: uiLabels.points, numeric: true },
                    { label: uiLabels.buchholz, numeric: true },
                    { label: uiLabels.sonnebornBerger, numeric: true },
                  ].map(({ label, numeric }) => (
                    <th
                      key={label}
                      scope="col"
                      style={{
                        borderBottom: `1px solid ${colors.BORDER}`,
                        color: colors.LABEL_TEXT,
                        padding: '8px 6px',
                        textAlign: numeric ? 'right' : 'left',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((standing, index) => (
                  <tr key={standing.player.id ?? standing.player.name}>
                    <td style={numericCellStyle(colors.BORDER)}>{index + 1}</td>
                    <td
                      style={{
                        borderBottom: `1px solid ${colors.BORDER}`,
                        padding: '8px 6px',
                      }}
                    >
                      {standing.player.name}
                    </td>
                    <td style={numericCellStyle(colors.BORDER)}>{standing.played}</td>
                    <td style={numericCellStyle(colors.BORDER)}>{standing.wins}</td>
                    <td style={numericCellStyle(colors.BORDER)}>{standing.draws}</td>
                    <td style={numericCellStyle(colors.BORDER)}>{standing.losses}</td>
                    <td style={{ ...numericCellStyle(colors.BORDER), fontWeight: 800 }}>
                      {formatPoints(standing.points)}
                    </td>
                    <td style={numericCellStyle(colors.BORDER)}>
                      {formatPoints(standing.buchholz)}
                    </td>
                    <td style={numericCellStyle(colors.BORDER)}>
                      {formatPoints(standing.sonnebornBerger)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h3 style={{ fontSize: tableFontSize, margin: '0 0 8px' }}>{uiLabels.schedule}</h3>
          {rounds.length === 0 ? (
            <p style={{ color: colors.MUTED_TEXT, fontSize: tableFontSize, margin: 0 }}>
              No pairings yet.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: compact ? 10 : 14 }}>
              {rounds.map((round) => (
                <section key={round.round} aria-labelledby={`swiss-round-${round.round}`}>
                  <h4
                    id={`swiss-round-${round.round}`}
                    style={{
                      color: colors.LABEL_TEXT,
                      fontSize: 12,
                      letterSpacing: '0.06em',
                      margin: '0 0 6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {uiLabels.round} {round.round}
                  </h4>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {round.matches.map((match) => (
                      <SwissMatchCard
                        key={match.id}
                        match={match}
                        borderRadius={matchCard.borderRadius}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Match card ────────────────────────────────────────────────────────────────

function SwissMatchCard({
  borderRadius,
  match,
}: {
  readonly borderRadius: number;
  readonly match: SwissMatch;
}) {
  const { colors, typography } = useBracketAppearance();
  const localization = useBracketLocalization();
  const [playerOne, playerTwo] = match.players;
  const isCompleted = match.status === MatchStatus.Completed && match.scores;
  const statusText = match.status
    ? formatStatusLabel(match.status, localization)
    : localization.uiLabels.upcoming;
  const scoreText = isCompleted ? `${match.scores?.[0]} – ${match.scores?.[1]}` : statusText;

  const scheduleText = getMatchScheduleText(
    {
      scheduledAt: match.scheduledAt,
      timezone: undefined,
      venue: match.venue,
    },
    localization
  );

  const [p1Score, p2Score] = match.scores ?? [];
  const p1Won = isCompleted && p1Score !== undefined && p2Score !== undefined && p1Score > p2Score;
  const p2Won = isCompleted && p2Score !== undefined && p1Score !== undefined && p2Score > p1Score;

  return (
    <article
      aria-label={`${playerOne.name} versus ${playerTwo.name}, ${localization.uiLabels.round.toLowerCase()} ${match.round}, ${scoreText}${scheduleText ? `, ${localization.uiLabels.scheduled} ${scheduleText}` : ''}`}
      style={{
        alignItems: 'center',
        background: colors.BASE_BG,
        border: `1px solid ${colors.CARD_BORDER}`,
        borderRadius,
        display: 'grid',
        gap: 10,
        gridTemplateColumns: '1fr auto 1fr',
        padding: '10px 12px',
      }}
    >
      <span style={{ fontWeight: p1Won ? 700 : 400 }}>{playerOne.name}</span>
      <strong
        style={{
          color: isCompleted ? colors.WINNING_SCORE : colors.MUTED_TEXT,
          fontFamily: typography.scoreFontFamily,
          fontSize: 13,
          whiteSpace: 'nowrap',
        }}
      >
        {scoreText}
      </strong>
      <span style={{ fontWeight: p2Won ? 700 : 400, textAlign: 'right' }}>{playerTwo.name}</span>
      {scheduleText ? (
        <small
          style={{
            color: colors.MUTED_TEXT,
            fontSize: 11,
            gridColumn: '1 / -1',
            textAlign: 'center',
          }}
        >
          {scheduleText}
        </small>
      ) : null}
    </article>
  );
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function numericCellStyle(borderColor: string): React.CSSProperties {
  return {
    borderBottom: `1px solid ${borderColor}`,
    fontVariantNumeric: 'tabular-nums',
    padding: '8px 6px',
    textAlign: 'right',
  };
}

/** Renders integers without decimals and floats with up to 1 decimal place. */
function formatPoints(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
