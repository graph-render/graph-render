import { MatchStatus } from '@graph-render/types/tournament';

import { DEFAULT_PLAYERS, NODE_BORDER_WIDTH } from '../../constants';
import { useBracketAppearance } from '../../contexts/BracketAppearanceContext';
import type { SquashNodeVariantProps } from '../../types/squashNode';
import {
  getMatchBadgeLabel,
  getMatchScoreSegmentCount,
  getMatchScoreSegments,
  getScoreGroupWidth,
  normalizePlayerKey,
} from '../../utils/squash';
import { SquashPlayerHtmlRow } from './SquashPlayerHtmlRow';

export function SquashNodeHtml(props: SquashNodeVariantProps) {
  const { nodeId, nodeWidth, nodeHeight, colors, meta, setWins, winnerIndex } = props;
  const { matchCard, typography } = useBracketAppearance();
  const p1 = meta.players[0] ?? DEFAULT_PLAYERS[0] ?? { name: 'TBD', seed: 0 };
  const p2 = meta.players[1] ?? DEFAULT_PLAYERS[1] ?? { name: 'TBD', seed: 0 };
  const matchBadgeLabel = getMatchBadgeLabel(meta.matchType, meta.bracketSection);
  const scoreGroupWidth = getScoreGroupWidth(
    getMatchScoreSegmentCount(meta),
    matchCard.score.segmentWidth,
    matchCard.score.segmentGap
  );

  return (
    <foreignObject
      width={nodeWidth}
      height={nodeHeight}
      requiredExtensions="http://www.w3.org/1999/xhtml"
      data-testid="squash-node-html"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={props.ariaLabel}
        data-match-card
        style={{
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          borderRadius: matchCard.borderRadius,
          background: props.isHovered ? colors.HOVER_BG : colors.BASE_BG,
          border: `${NODE_BORDER_WIDTH}px solid ${colors.CARD_BORDER}`,
          color: colors.FOREGROUND,
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 120ms ease, box-shadow 120ms ease',
          transform: 'none',
          overflow: 'hidden',
          position: 'relative',
          outline: 'none',
        }}
      >
        {meta.status === MatchStatus.Live ? <LiveIndicator color={colors.LIVE_INDICATOR} /> : null}
        {matchBadgeLabel ? <MatchTypeBadge label={matchBadgeLabel} /> : null}
        <div style={{ display: 'grid', gridTemplateRows: 'repeat(2, 1fr)' }}>
          {[p1, p2].map((player, playerIndex) => {
            const isWinner = winnerIndex === playerIndex;
            const isPathMatch =
              props.isNodeInActivePath &&
              props.normalizedActivePathKey !== null &&
              normalizePlayerKey(player.name) === props.normalizedActivePathKey;

            return (
              <SquashPlayerHtmlRow
                key={`${nodeId}-p-${playerIndex}`}
                {...props}
                player={player}
                playerIndex={playerIndex}
                isWinner={isWinner}
                isPlayerHovered={props.hoveredPlayerIndex === playerIndex || isPathMatch}
                playerOpacity={meta.status === MatchStatus.Upcoming ? 0.6 : 1}
                setCount={playerIndex === 0 ? setWins.p1 : setWins.p2}
                scoreSegments={getMatchScoreSegments(meta, playerIndex)}
                textColor={isWinner ? colors.FOREGROUND : colors.MUTED_TEXT}
                nodeHeight={nodeHeight}
                scoreGroupWidth={scoreGroupWidth}
                matchCard={matchCard}
                bodyFontFamily={typography.bodyFontFamily}
                scoreFontFamily={typography.scoreFontFamily}
              />
            );
          })}
        </div>
      </div>
    </foreignObject>
  );
}

function MatchTypeBadge({ label }: { readonly label: string }) {
  const { colors, typography } = useBracketAppearance();

  return (
    <div
      data-testid="match-type-badge"
      style={{
        position: 'absolute',
        top: 6,
        left: 8,
        zIndex: 1,
        borderRadius: 999,
        padding: '1px 6px',
        background: colors.BADGE_BG,
        color: colors.BADGE_TEXT,
        fontFamily: typography.bodyFontFamily,
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </div>
  );
}

function LiveIndicator({ color }: { readonly color: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Live match"
      style={{
        position: 'absolute',
        top: 10,
        right: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 10,
        fontWeight: 700,
        color,
        textTransform: 'uppercase',
      }}
    >
      <span
        data-squash-live-indicator
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          borderWidth: 0,
        }}
      >
        Live
      </span>
    </div>
  );
}
