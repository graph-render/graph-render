import { MatchStatus } from '@graph-render/types/tournament';
import { useId } from 'react';

import { DEFAULT_PLAYERS, NODE_BORDER_WIDTH, NODE_DIMENSIONS } from '../../constants';
import { getSquashScoreLayout } from '../../constants/squashNode';
import { useBracketAppearance } from '../../contexts/BracketAppearanceContext';
import type { SquashNodeVariantProps } from '../../types/squashNode';
import { getScoreGroupWidth, getScoreSegments, normalizePlayerKey } from '../../utils/squash';
import { SquashPlayerSvgRow } from './SquashPlayerSvgRow';

export function SquashNodeSvg(props: SquashNodeVariantProps) {
  const { nodeId, nodeWidth, nodeHeight, compact, colors, meta, setWins, winnerIndex } = props;
  const { matchCard: defaultMatchCard, typography } = useBracketAppearance();
  const scoreLayout = layoutUsesCompactMetrics(compact, nodeWidth, nodeHeight)
    ? getSquashScoreLayout(true)
    : defaultMatchCard.score;
  const p1 = meta.players[0] ?? DEFAULT_PLAYERS[0] ?? { name: 'TBD', seed: 0 };
  const p2 = meta.players[1] ?? DEFAULT_PLAYERS[1] ?? { name: 'TBD', seed: 0 };
  const {
    insetX,
    badgeSize,
    badgePad,
    borderRadius,
    matchCountWidth,
    matchCountTrailingGap,
    scoreGroupTrailingGap,
  } = defaultMatchCard;
  const scoreSegW = scoreLayout.segmentWidth;
  const scoreSegG = scoreLayout.segmentGap;
  const scoreFontSize = scoreLayout.fontSize;
  const matchCountFontSize = scoreLayout.matchCountFontSize;
  const rowHeight = nodeHeight / 2;
  const scoreSectionWidth = getScoreGroupWidth(Math.max(meta.sets.length, 1), scoreSegW, scoreSegG);
  const internalDividerX = nodeWidth - insetX - matchCountWidth - matchCountTrailingGap;
  const scoreGroupRightX = internalDividerX - scoreGroupTrailingGap;
  const matchCountX = nodeWidth - insetX - matchCountWidth / 2;
  const playerTextX = insetX + badgeSize + badgePad;
  const maxNameWidth = Math.max(
    compact ? 28 : 48,
    scoreGroupRightX - scoreSectionWidth - playerTextX - 4
  );
  const maxNameLength = Math.max(compact ? 6 : 10, Math.floor(maxNameWidth / (compact ? 6 : 7)));
  const stableId = useId().replaceAll(':', '');
  const sanitizedNodeId = nodeId.replaceAll(/[^\da-z]/gi, '') || 'node';
  const clipId = `ds-${sanitizedNodeId}-${stableId}`;

  return (
    <g role="button" tabIndex={0} aria-label={props.ariaLabel} data-match-card>
      <defs>
        <clipPath id={clipId} data-testid="squash-node-svg-clip">
          <rect width={nodeWidth} height={nodeHeight} rx={borderRadius} ry={borderRadius} />
        </clipPath>
      </defs>
      <rect
        width={nodeWidth}
        height={nodeHeight}
        rx={borderRadius}
        ry={borderRadius}
        fill={props.isHovered ? colors.HOVER_BG : colors.BASE_BG}
        stroke={colors.CARD_BORDER}
        strokeWidth={NODE_BORDER_WIDTH}
        data-match-card-rect
        data-testid="squash-node-svg-rect"
      />

      {meta.status === MatchStatus.Live ? (
        <g
          transform={`translate(${nodeWidth - 18}, 14)`}
          role="img"
          aria-label="Live match"
          aria-live="polite"
        >
          <title>Live match</title>
          <circle r={4} fill={colors.LIVE_INDICATOR} />
        </g>
      ) : null}

      <g clipPath={`url(#${clipId})`}>
        {[p1, p2].map((player, playerIndex) => {
          const isWinner = winnerIndex === playerIndex;
          const isPathMatch =
            props.isNodeInActivePath &&
            props.normalizedActivePathKey !== null &&
            normalizePlayerKey(player.name) === props.normalizedActivePathKey;
          const textColor = isWinner ? colors.FOREGROUND : colors.MUTED_TEXT;

          return (
            <SquashPlayerSvgRow
              key={`${nodeId}-svg-p-${playerIndex}`}
              {...props}
              player={player}
              playerIndex={playerIndex}
              isWinner={isWinner}
              isPlayerHovered={props.hoveredPlayerIndex === playerIndex || isPathMatch}
              playerOpacity={meta.status === MatchStatus.Upcoming ? 0.6 : 1}
              setCount={playerIndex === 0 ? setWins.p1 : setWins.p2}
              scoreSegments={getScoreSegments(meta.sets, meta.tiebreaks, playerIndex)}
              textColor={textColor}
              rowY={playerIndex * rowHeight}
              rowHeight={rowHeight}
              insetX={insetX}
              badgeSize={badgeSize}
              badgePad={badgePad}
              badgeFontSize={defaultMatchCard.badgeFontSize}
              nameFontSize={defaultMatchCard.nameFontSize}
              bodyFontFamily={typography.bodyFontFamily}
              playerTextX={playerTextX}
              maxNameLength={maxNameLength}
              scoreGroupLeftX={scoreGroupRightX - scoreSectionWidth}
              internalDividerX={internalDividerX}
              matchCountX={matchCountX}
              scoreSegW={scoreSegW}
              scoreSegG={scoreSegG}
              scoreFontSize={scoreFontSize}
              scoreFontFamily={typography.scoreFontFamily}
              matchCountFontSize={matchCountFontSize}
              badgeRadius={compact ? 4 : 6}
            />
          );
        })}

        <line
          x1={0}
          y1={rowHeight}
          x2={nodeWidth}
          y2={rowHeight}
          stroke={colors.BORDER}
          strokeWidth={1}
        />
      </g>
    </g>
  );
}

function layoutUsesCompactMetrics(
  compact: boolean,
  nodeWidth: number,
  nodeHeight: number
): boolean {
  return compact || nodeHeight < NODE_DIMENSIONS.HEIGHT || nodeWidth < NODE_DIMENSIONS.WIDTH;
}
