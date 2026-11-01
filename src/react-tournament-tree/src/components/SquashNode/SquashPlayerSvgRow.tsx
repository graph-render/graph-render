import { useId } from 'react';

import { useCountryFlag } from '../../contexts/CountryFlagsContext';
import { usePlayerAvatar } from '../../hooks/usePlayerAvatar';
import type { SquashPlayerRowProps } from '../../types/squashNode';
import {
  getPlayerBadgeText,
  getPlayerCountryText,
  getPlayerSeedText,
  truncateText,
} from '../../utils/squash';
import { SquashSvgScoreSegments } from './SquashSvgScoreSegments';

const FLAG_RADIUS = 2;

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
  const flag = useCountryFlag(player.country, props.compact);
  const avatar = usePlayerAvatar(player.avatarUrl);
  const seedText = getPlayerSeedText(player);
  // The seed sits after the name; the second line is only the country (flag or code).
  const metadataText = flag ? '' : getPlayerCountryText(player);
  const hasMetadata = Boolean(flag || metadataText);
  // Keep the seed visible by spending the truncation budget on the name only.
  const nameText = truncateText(
    player.name,
    seedText ? Math.max(4, props.maxNameLength - seedText.length - 1) : props.maxNameLength
  );
  // A flag is taller than the metadata text, so the name + flag pair is centred as a
  // block with a fixed gap; otherwise keep the original text offsets.
  const flagGap = props.compact ? 2 : 3;
  const flagBlockTop = flag
    ? (props.rowHeight - (props.nameFontSize + flagGap + flag.height)) / 2
    : 0;
  const nameY = flag
    ? flagBlockTop + props.nameFontSize / 2
    : hasMetadata
      ? props.rowHeight / 2 - props.nameFontSize * 0.35
      : props.rowHeight / 2;
  const flagY = flagBlockTop + props.nameFontSize + flagGap;
  const metadataY = flag
    ? flagY + flag.height / 2
    : props.rowHeight / 2 + props.nameFontSize * 0.55;
  const clipBaseId = useId().replaceAll(':', '');
  const flagClipId = `flag-${clipBaseId}-${playerIndex}`;
  const avatarClipId = `avatar-${clipBaseId}-${playerIndex}`;
  const badgeY = (props.rowHeight - props.badgeSize) / 2;
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
        y={badgeY}
        width={props.badgeSize}
        height={props.badgeSize}
        rx={props.badgeRadius}
        ry={props.badgeRadius}
        fill={badgeFill}
      />
      {avatar.url ? (
        <g data-testid="player-svg-avatar-group">
          <clipPath id={avatarClipId}>
            <rect
              x={props.insetX}
              y={badgeY}
              width={props.badgeSize}
              height={props.badgeSize}
              rx={props.badgeRadius}
              ry={props.badgeRadius}
            />
          </clipPath>
          <image
            href={avatar.url}
            x={props.insetX}
            y={badgeY}
            width={props.badgeSize}
            height={props.badgeSize}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${avatarClipId})`}
            // eslint-disable-next-line react/no-unknown-property -- SVG <image> fires `error` like <img>; the rule's allow-list omits it.
            onError={avatar.onError}
            data-testid="player-svg-avatar"
          />
        </g>
      ) : (
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
      )}
      <g>
        <text
          x={props.playerTextX}
          y={nameY}
          dy="0.35em"
          fontSize={props.nameFontSize}
          fontWeight={isWinner ? 600 : 500}
          fill={props.textColor}
          fontFamily={props.bodyFontFamily}
          data-testid="player-svg-name"
        >
          {nameText}
          {seedText ? (
            <tspan fill={colors.SEED_TEXT} fontWeight={500} data-testid="player-svg-seed">
              {` ${seedText}`}
            </tspan>
          ) : null}
        </text>
        {flag ? (
          <g data-testid="player-svg-flag-group">
            <clipPath id={flagClipId}>
              <rect
                x={props.playerTextX}
                y={flagY}
                width={flag.width}
                height={flag.height}
                rx={FLAG_RADIUS}
                ry={FLAG_RADIUS}
              />
            </clipPath>
            <image
              href={flag.url}
              x={props.playerTextX}
              y={flagY}
              width={flag.width}
              height={flag.height}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${flagClipId})`}
              data-testid="player-svg-flag"
            >
              <title>{flag.code}</title>
            </image>
            {/* Outline keeps white-edged flags (JP, PL…) visible against light rows. */}
            <rect
              x={props.playerTextX + 0.25}
              y={flagY + 0.25}
              width={flag.width - 0.5}
              height={flag.height - 0.5}
              rx={FLAG_RADIUS}
              ry={FLAG_RADIUS}
              fill="none"
              stroke={colors.BORDER}
              strokeWidth={0.5}
              pointerEvents="none"
            />
          </g>
        ) : null}
        {metadataText ? (
          <text
            x={props.playerTextX}
            y={metadataY}
            dy="0.35em"
            fontSize={Math.max(6, props.nameFontSize - (props.compact ? 3 : 4))}
            fontWeight={700}
            fill={colors.COUNTRY_TEXT}
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
