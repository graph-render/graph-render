import type { SquashPlayerRowProps } from '../../types/squashNode';
import { getPlayerBadgeText, getPlayerMetadataText, truncateText } from '../../utils/squash';
import { SquashSvgScoreSegments } from './SquashSvgScoreSegments';

type SquashPlayerSvgRowProps = SquashPlayerRowProps & {
  readonly rowY: number;
  readonly rowHeight: number;
  readonly nodeWidth: number;
  readonly insetX: number;
  readonly badgeSize: number;
  readonly badgePad: number;
  readonly badgeFontSize: number;
  readonly nameFontSize: number;
  readonly bodyFontFamily: string;
  readonly playerTextX: number;
  readonly maxNameLength: number;
  readonly scoreGroupLeftX: number;
  readonly internalDividerX: number;
  readonly matchCountX: number;
  readonly scoreSegW: number;
  readonly scoreSegG: number;
  readonly scoreFontSize: number;
  readonly scoreFontFamily: string;
  readonly matchCountFontSize: number;
  readonly badgeRadius: number;
};

export function SquashPlayerSvgRow(props: SquashPlayerSvgRowProps) {
  const { player, playerIndex, colors, isWinner, isPlayerHovered, playerOpacity } = props;
  const rowFill = isPlayerHovered ? colors.ROW_HOVER_BG : colors.ROW_BG;
  const badgeFill = isWinner ? colors.WINNER_CREST_BG : colors.CREST_BG;
  const badgeTextColor = isWinner ? colors.WINNER_CREST_TEXT : colors.CREST_TEXT;
  const metadataText = getPlayerMetadataText(player);
  const handlePlayerEnter = () => props.onPlayerEnter(playerIndex, player);
  const handleKeyDown = (event: React.KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePlayerEnter();
    }
  };

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${player.name}, ${props.setCount} sets won`}
      transform={`translate(0, ${props.rowY})`}
      opacity={playerOpacity}
      onFocus={handlePlayerEnter}
      onBlur={props.onPlayerLeave}
      onKeyDown={handleKeyDown}
      onMouseEnter={handlePlayerEnter}
      onMouseLeave={props.onPlayerLeave}
      onTouchStart={handlePlayerEnter}
      onTouchEnd={props.onPlayerLeave}
      onTouchCancel={props.onPlayerLeave}
      data-testid="player-svg-row"
    >
      <rect
        x={0}
        width={props.nodeWidth}
        height={props.rowHeight}
        fill={rowFill}
        data-testid="player-svg-bg"
      />
      <rect
        x={props.insetX}
        y={(props.rowHeight - props.badgeSize) / 2}
        width={props.badgeSize}
        height={props.badgeSize}
        rx={props.badgeRadius}
        ry={props.badgeRadius}
        fill={badgeFill}
      />
      <text
        x={props.insetX + props.badgeSize / 2}
        y={props.rowHeight / 2}
        textAnchor="middle"
        dy="0.35em"
        fontSize={props.badgeFontSize}
        fontWeight={700}
        fill={badgeTextColor}
        fontFamily={props.bodyFontFamily}
      >
        {getPlayerBadgeText(player)}
      </text>
      <g>
        <text
          x={props.playerTextX}
          y={metadataText ? props.rowHeight / 2 - props.nameFontSize * 0.35 : props.rowHeight / 2}
          dy="0.35em"
          fontSize={props.nameFontSize}
          fontWeight={isWinner ? 600 : 500}
          fill={props.textColor}
          fontFamily={props.bodyFontFamily}
        >
          {truncateText(player.name, props.maxNameLength)}
        </text>
        {metadataText ? (
          <text
            x={props.playerTextX}
            y={props.rowHeight / 2 + props.nameFontSize * 0.55}
            dy="0.35em"
            fontSize={Math.max(6, props.nameFontSize - (props.compact ? 3 : 4))}
            fontWeight={700}
            fill={player.seed == null ? colors.COUNTRY_TEXT : colors.SEED_TEXT}
            fontFamily={props.bodyFontFamily}
            data-testid="player-svg-metadata"
          >
            {truncateText(metadataText, props.compact ? 8 : 14)}
          </text>
        ) : null}
      </g>
      {props.hideScoreSegments ? null : (
        <line
          x1={props.internalDividerX}
          y1={props.rowHeight / 2 - 8}
          x2={props.internalDividerX}
          y2={props.rowHeight / 2 + 8}
          stroke={colors.DARK_BORDER}
          strokeWidth={1}
          data-testid="player-svg-divider"
        />
      )}
      <SquashSvgScoreSegments {...props} />
      <text
        x={props.matchCountX}
        y={props.rowHeight / 2}
        textAnchor="middle"
        dy="0.35em"
        fontSize={props.matchCountFontSize}
        fontWeight={700}
        fill={props.textColor}
        fontFamily={props.bodyFontFamily}
      >
        {props.setCount}
      </text>
    </g>
  );
}
