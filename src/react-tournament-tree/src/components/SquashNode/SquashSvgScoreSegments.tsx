import { SCORE_SEPARATOR_HEIGHT } from '../../constants';
import type { SquashThemeColors } from '../../types/squashNode';
import { truncateText } from '../../utils/squash';

interface SquashSvgScoreSegmentsProps {
  readonly nodeId: string;
  readonly playerIndex: number;
  readonly scoreSegments: readonly string[];
  readonly scoreGroupLeftX: number;
  readonly rowHeight: number;
  readonly scoreSegW: number;
  readonly scoreSegG: number;
  readonly textColor: string;
  readonly colors: SquashThemeColors;
  readonly scoreFontSize: number;
  readonly scoreFontFamily: string;
}

export function SquashSvgScoreSegments({
  nodeId,
  playerIndex,
  scoreSegments,
  scoreGroupLeftX,
  rowHeight,
  scoreSegW,
  scoreSegG,
  textColor,
  colors,
  scoreFontSize,
  scoreFontFamily,
}: SquashSvgScoreSegmentsProps) {
  return (
    <>
      {scoreSegments.map((segment, segmentIndex) => {
        const segmentX = scoreGroupLeftX + scoreSegW / 2 + segmentIndex * (scoreSegW + scoreSegG);
        const dividerX = segmentX + scoreSegW / 2 + scoreSegG / 2;

        return (
          <g key={`${nodeId}-svg-score-${playerIndex}-${segmentIndex}`}>
            <text
              x={segmentX}
              y={rowHeight / 2}
              textAnchor="middle"
              dy="0.35em"
              fontSize={scoreFontSize}
              fontWeight={400}
              fill={textColor}
              fontFamily={scoreFontFamily}
              data-score-segment
            >
              {truncateText(segment, 6)}
            </text>
            {segmentIndex < scoreSegments.length - 1 ? (
              <line
                x1={dividerX}
                y1={rowHeight / 2 - SCORE_SEPARATOR_HEIGHT / 2}
                x2={dividerX}
                y2={rowHeight / 2 + SCORE_SEPARATOR_HEIGHT / 2}
                stroke={colors.BORDER}
                strokeWidth={1}
                data-testid="score-divider"
              />
            ) : null}
          </g>
        );
      })}
    </>
  );
}
