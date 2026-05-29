import type { PlacementMatch, TournamentBracketAppearance } from '@graph-render/types/tournament';
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
  groupPlacementMatchesByRound,
  groupPlacementMatchesByTier,
  resolvePlacementLabel,
} from '../utils/tournament/placement';

export interface PlacementBracketProps {
  readonly participants: readonly TournamentParticipantInput[];
  readonly matches?: readonly PlacementMatch[] | undefined;
  readonly title?: string | undefined;
  readonly appearance?: TournamentBracketAppearance | undefined;
  readonly localization?: TournamentLocalizationOptions | undefined;
  readonly isDarkMode?: boolean | undefined;
  readonly compact?: boolean | undefined;
}

export const PlacementBracket = React.memo<PlacementBracketProps>(function PlacementBracket({
  appearance,
  compact = false,
  isDarkMode = false,
  localization,
  ...props
}) {
  return (
    <BracketAppearanceProvider appearance={appearance} compact={compact} isDarkMode={isDarkMode}>
      <BracketLocalizationProvider localization={localization}>
        <PlacementBracketContent {...props} compact={compact} />
      </BracketLocalizationProvider>
    </BracketAppearanceProvider>
  );
});

PlacementBracket.displayName = 'PlacementBracket';

interface PlacementBracketContentProps extends Omit<
  PlacementBracketProps,
  'appearance' | 'isDarkMode' | 'localization'
> {
  readonly compact: boolean;
}

function PlacementBracketContent({
  compact,
  matches,
  title = 'Placement Bracket',
}: PlacementBracketContentProps) {
  const { colors, frame, matchCard, typography } = useBracketAppearance();
  const { uiLabels } = useBracketLocalization();

  const resolvedMatches = useMemo(() => matches ?? [], [matches]);
  const tierMap = useMemo(() => groupPlacementMatchesByTier(resolvedMatches), [resolvedMatches]);
  const tierKeys = useMemo(() => [...tierMap.keys()].sort((a, b) => a - b), [tierMap]);
  const tierCount = tierKeys.length;

  return (
    <section
      aria-label={title}
      data-placement-bracket
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
          {uiLabels.placementMatch}
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
          {tierCount > 0 ? (
            <span
              style={{
                color: colors.HEADER_MUTED,
                fontSize: compact ? 13 : 16,
                fontWeight: 400,
                marginLeft: 10,
              }}
            >
              ({tierCount} {tierCount !== 1 ? 'tiers' : 'tier'})
            </span>
          ) : null}
        </h2>
      </header>

      {tierCount === 0 ? (
        <p
          style={{
            color: colors.MUTED_TEXT,
            fontSize: compact ? 13 : 14,
            margin: 0,
            textAlign: 'center',
          }}
        >
          No placement matches yet
        </p>
      ) : (
        <div style={{ display: 'grid', gap: compact ? 16 : 24 }}>
          {tierKeys.map((startingPlacement) => {
            const tierMatches = tierMap.get(startingPlacement) ?? [];
            const maxPlacement = Math.max(...tierMatches.map((m) => m.placement));
            const tierLabel = `${resolvePlacementLabel(startingPlacement)}–${resolvePlacementLabel(maxPlacement)}`;
            const roundMap = groupPlacementMatchesByRound(resolvedMatches, startingPlacement);
            const roundKeys = [...roundMap.keys()].sort((a, b) => a - b);

            return (
              <section
                key={startingPlacement}
                aria-labelledby={`placement-tier-${startingPlacement}`}
              >
                <h3
                  id={`placement-tier-${startingPlacement}`}
                  style={{
                    color: colors.HEADER_TITLE,
                    fontSize: compact ? 14 : 16,
                    margin: '0 0 10px',
                  }}
                >
                  {tierLabel}
                </h3>
                <div style={{ display: 'grid', gap: compact ? 10 : 14 }}>
                  {roundKeys.map((round) => {
                    const roundMatches = roundMap.get(round) ?? [];
                    return (
                      <section
                        key={round}
                        aria-labelledby={`placement-p${startingPlacement}-r${round}`}
                      >
                        <h4
                          id={`placement-p${startingPlacement}-r${round}`}
                          style={{
                            color: colors.LABEL_TEXT,
                            fontSize: 12,
                            letterSpacing: '0.06em',
                            margin: '0 0 6px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {uiLabels.round} {round}
                        </h4>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {roundMatches.map((match) => (
                            <PlacementMatchCard
                              key={match.id}
                              match={match}
                              borderRadius={matchCard.borderRadius}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

function PlacementMatchCard({
  borderRadius,
  match,
}: {
  readonly borderRadius: number;
  readonly match: PlacementMatch;
}) {
  const { colors, typography } = useBracketAppearance();
  const localization = useBracketLocalization();
  const [playerOne, playerTwo] = match.players;
  const isCompleted = match.status === MatchStatus.Completed && match.scores;
  const winnerIndex =
    isCompleted && match.scores
      ? match.scores[0] > match.scores[1]
        ? 0
        : match.scores[1] > match.scores[0]
          ? 1
          : undefined
      : undefined;
  const statusText = match.status
    ? formatStatusLabel(match.status, localization)
    : localization.uiLabels.upcoming;
  const scoreText = isCompleted ? `${match.scores?.[0]} - ${match.scores?.[1]}` : statusText;
  const placementLabel = match.label ?? resolvePlacementLabel(match.placement);
  const scheduleText = getMatchScheduleText(
    { scheduledAt: match.scheduledAt, timezone: undefined, venue: match.venue },
    localization
  );

  return (
    <article
      aria-label={`${placementLabel}: ${playerOne.name} versus ${playerTwo.name}, ${scoreText}${scheduleText ? `, ${localization.uiLabels.scheduled} ${scheduleText}` : ''}`}
      style={{
        background: colors.BASE_BG,
        border: `1px solid ${colors.CARD_BORDER}`,
        borderRadius,
        padding: '10px 12px',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'grid',
          gap: 8,
          gridTemplateColumns: '1fr auto 1fr',
        }}
      >
        <span
          style={{
            fontWeight: winnerIndex === 0 ? 700 : undefined,
          }}
        >
          {playerOne.name}
        </span>
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
        <span
          style={{
            fontWeight: winnerIndex === 1 ? 700 : undefined,
            textAlign: 'right',
          }}
        >
          {playerTwo.name}
        </span>
      </div>
      <div
        style={{
          color: colors.LABEL_TEXT,
          fontSize: 11,
          letterSpacing: '0.05em',
          marginTop: 4,
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        {placementLabel}
      </div>
      {scheduleText ? (
        <small
          style={{
            color: colors.MUTED_TEXT,
            display: 'block',
            fontSize: 11,
            marginTop: 4,
            textAlign: 'center',
          }}
        >
          {scheduleText}
        </small>
      ) : null}
    </article>
  );
}
