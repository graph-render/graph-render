import React from 'react';

import { SCORE_SEPARATOR_HEIGHT } from '../../constants';
import type { SquashThemeColors } from '../../types/squashNode';
import { truncateText } from '../../utils/squash';

interface SquashHtmlScoreSegmentsProps {
  readonly nodeId: string;
  readonly playerIndex: number;
  readonly scoreSegments: readonly string[];
  readonly textColor: string;
  readonly colors: SquashThemeColors;
  readonly scoreFontSize: number;
  readonly scoreSegW: number;
  readonly scoreSegG: number;
  readonly scoreFontFamily: string;
}

export function SquashHtmlScoreSegments({
  nodeId,
  playerIndex,
  scoreSegments,
  textColor,
  colors,
  scoreFontSize,
  scoreSegW,
  scoreSegG,
  scoreFontFamily,
}: SquashHtmlScoreSegmentsProps) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minWidth: 0,
        width: '100%',
        gap: scoreSegG,
      }}
      data-score-segment
    >
      {scoreSegments.map((segment, segmentIndex) => (
        <React.Fragment key={`${nodeId}-html-score-${playerIndex}-${segmentIndex}`}>
          <span
            style={{
              width: scoreSegW,
              fontSize: scoreFontSize,
              color: textColor,
              fontFamily: scoreFontFamily,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {truncateText(segment, 6)}
          </span>
          {segmentIndex < scoreSegments.length - 1 ? (
            <span
              style={{
                width: 1,
                height: SCORE_SEPARATOR_HEIGHT,
                background: colors.BORDER,
                flexShrink: 0,
              }}
              data-testid="score-divider"
            />
          ) : null}
        </React.Fragment>
      ))}
    </span>
  );
}
