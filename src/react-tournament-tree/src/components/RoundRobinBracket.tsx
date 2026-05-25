import type {
  RoundRobinMatch,
  RoundRobinPointsRule,
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
import {
  calculateRoundRobinStandings,
  generateRoundRobinSchedule,
  groupRoundRobinMatchesByRound,
} from '../utils/tournament';

export interface RoundRobinBracketProps {
  readonly participants: readonly TournamentParticipantInput[];
  readonly matches?: readonly RoundRobinMatch[] | undefined;
  readonly points?: RoundRobinPointsRule | undefined;
  readonly title?: string | undefined;
  readonly groupName?: string | undefined;
  readonly appearance?: TournamentBracketAppearance | undefined;
  readonly localization?: TournamentLocalizationOptions | undefined;
  readonly isDarkMode?: boolean | undefined;
  readonly compact?: boolean | undefined;
}

export const RoundRobinBracket = React.memo<RoundRobinBracketProps>(function RoundRobinBracket({
  appearance,
  compact = false,
  isDarkMode = false,
  localization,
  ...props
}) {
  return (
    <BracketAppearanceProvider appearance={appearance} compact={compact} isDarkMode={isDarkMode}>
      <BracketLocalizationProvider localization={localization}>
        <RoundRobinBracketContent {...props} compact={compact} />
      </BracketLocalizationProvider>
    </BracketAppearanceProvider>
  );
});

RoundRobinBracket.displayName = 'RoundRobinBracket';

function RoundRobinBracketContent({
  compact = false,
  groupName,
  matches,
  participants,
  points,
  title = 'Round Robin',
}: Omit<RoundRobinBracketProps, 'appearance' | 'isDarkMode' | 'localization'>) {
  const { colors, frame, matchCard, typography } = useBracketAppearance();
  const { uiLabels } = useBracketLocalization();
  const schedule = useMemo(
    () => matches ?? generateRoundRobinSchedule(participants),
    [matches, participants]
  );
  const standings = useMemo(
    () => calculateRoundRobinStandings(participants, schedule, points),
    [participants, points, schedule]
  );
  const rounds = useMemo(() => groupRoundRobinMatchesByRound(schedule), [schedule]);
  const tableFontSize = compact ? 12 : 14;

  return (
    <section
      aria-label={groupName ? `${title}: ${groupName}` : title}
      data-round-robin-bracket
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
          {groupName ?? uiLabels.groupStage}
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
        </h2>
      </header>

      <div
        style={{
          display: 'grid',
          gap: compact ? 14 : 20,
          gridTemplateColumns: compact ? '1fr' : 'minmax(320px, 0.85fr) minmax(360px, 1.15fr)',
        }}
      >
        <div>
          <h3 style={{ fontSize: tableFontSize, margin: '0 0 8px' }}>{uiLabels.standings}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                borderCollapse: 'collapse',
                fontSize: tableFontSize,
                minWidth: 520,
                width: '100%',
              }}
            >
              <thead>
                <tr>
                  {[
                    uiLabels.team,
                    uiLabels.played,
                    uiLabels.wins,
                    uiLabels.draws,
                    uiLabels.losses,
                    uiLabels.scoreDifference,
                    uiLabels.points,
                  ].map((label) => (
                    <th
                      key={label}
                      scope="col"
                      style={{
                        borderBottom: `1px solid ${colors.BORDER}`,
                        color: colors.LABEL_TEXT,
                        padding: '8px 6px',
                        textAlign: label === uiLabels.team ? 'left' : 'right',
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((standing) => (
                  <tr key={standing.player.id ?? standing.player.name}>
                    <td style={{ borderBottom: `1px solid ${colors.BORDER}`, padding: '8px 6px' }}>
                      {standing.player.name}
                    </td>
                    <td style={numericCellStyle(colors.BORDER)}>{standing.played}</td>
                    <td style={numericCellStyle(colors.BORDER)}>{standing.wins}</td>
                    <td style={numericCellStyle(colors.BORDER)}>{standing.draws}</td>
                    <td style={numericCellStyle(colors.BORDER)}>{standing.losses}</td>
                    <td style={numericCellStyle(colors.BORDER)}>{standing.scoreDifference}</td>
                    <td style={{ ...numericCellStyle(colors.BORDER), fontWeight: 800 }}>
                      {standing.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: tableFontSize, margin: '0 0 8px' }}>{uiLabels.schedule}</h3>
          <div style={{ display: 'grid', gap: compact ? 10 : 14 }}>
            {rounds.map((round) => (
              <section key={round.round} aria-labelledby={`rr-round-${round.round}`}>
                <h4
                  id={`rr-round-${round.round}`}
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
                    <RoundRobinMatchCard
                      key={match.id}
                      match={match}
                      borderRadius={matchCard.borderRadius}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RoundRobinMatchCard({
  borderRadius,
  match,
}: {
  readonly borderRadius: number;
  readonly match: RoundRobinMatch;
}) {
  const { colors, typography } = useBracketAppearance();
  const localization = useBracketLocalization();
  const [playerOne, playerTwo] = match.players;
  const isCompleted = match.status === MatchStatus.Completed && match.scores;
  const statusText = match.status
    ? formatStatusLabel(match.status, localization)
    : localization.uiLabels.upcoming;
  const scoreText = isCompleted ? `${match.scores?.[0]} - ${match.scores?.[1]}` : statusText;
  const scheduleText = getMatchScheduleText(
    {
      scheduledAt: match.scheduledAt,
      timezone: undefined,
      venue: match.venue,
    },
    localization
  );

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
      <span>{playerOne.name}</span>
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
      <span style={{ textAlign: 'right' }}>{playerTwo.name}</span>
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

function numericCellStyle(borderColor: string): React.CSSProperties {
  return {
    borderBottom: `1px solid ${borderColor}`,
    fontVariantNumeric: 'tabular-nums',
    padding: '8px 6px',
    textAlign: 'right',
  };
}
