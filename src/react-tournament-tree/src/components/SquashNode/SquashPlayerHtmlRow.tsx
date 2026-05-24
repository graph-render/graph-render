import type { SquashPlayerRowProps } from '../../types/squashNode';
import type { ResolvedMatchCardStyle } from '../../utils/resolveBracketAppearance';
import { getPlayerBadgeText, getPlayerMetadataText } from '../../utils/squash';
import { SquashHtmlScoreSegments } from './SquashHtmlScoreSegments';

type SquashPlayerHtmlRowProps = SquashPlayerRowProps & {
  readonly nodeHeight: number;
  readonly scoreGroupWidth: number;
  readonly matchCard: ResolvedMatchCardStyle;
  readonly bodyFontFamily: string;
  readonly scoreFontFamily: string;
};

export function SquashPlayerHtmlRow(props: SquashPlayerHtmlRowProps) {
  const { player, playerIndex, colors, isWinner, isPlayerHovered, playerOpacity, matchCard } =
    props;
  const badgeBackground = isWinner ? colors.WINNER_CREST_BG : colors.CREST_BG;
  const badgeColor = isWinner ? colors.WINNER_CREST_TEXT : colors.CREST_TEXT;
  const rowBackground = isPlayerHovered ? colors.ROW_HOVER_BG : colors.ROW_BG;
  const badgeRadius = props.compact ? 3 : 6;
  const metadataText = getPlayerMetadataText(player);
  const seedText =
    typeof player.seed === 'number' && Number.isFinite(player.seed) ? `#${player.seed}` : '';
  const countryText = player.country?.trim().toUpperCase() ?? '';
  const handlePlayerEnter = () => props.onPlayerEnter(playerIndex, player);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handlePlayerEnter();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${player.name}, ${props.setCount} sets won`}
      style={{
        display: 'grid',
        gridTemplateColumns: `${matchCard.badgeSize}px minmax(0, 1fr) ${props.scoreGroupWidth}px ${matchCard.matchCountWidth}px`,
        alignItems: 'center',
        gap: matchCard.rowGap,
        padding: matchCard.rowPadding,
        minHeight: props.nodeHeight / 2,
        background: rowBackground,
        opacity: playerOpacity,
        transition: 'background-color 140ms ease',
        borderTop: playerIndex === 1 ? `1px solid ${colors.BORDER}` : 'none',
        boxSizing: 'border-box',
      }}
      onFocus={handlePlayerEnter}
      onBlur={props.onPlayerLeave}
      onKeyDown={handleKeyDown}
      onMouseEnter={handlePlayerEnter}
      onMouseLeave={props.onPlayerLeave}
      onTouchStart={handlePlayerEnter}
      onTouchEnd={props.onPlayerLeave}
      onTouchCancel={props.onPlayerLeave}
      data-testid="player-html-row"
    >
      <div
        style={{
          width: matchCard.badgeSize,
          height: matchCard.badgeSize,
          borderRadius: badgeRadius,
          background: badgeBackground,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          color: badgeColor,
          fontSize: matchCard.badgeFontSize,
          lineHeight: 1,
          flexShrink: 0,
          fontFamily: props.bodyFontFamily,
        }}
        aria-label={`crest-${player.name}`}
      >
        {getPlayerBadgeText(player)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span
          style={{
            fontSize: matchCard.nameFontSize,
            fontWeight: isWinner ? 600 : 500,
            color: props.textColor,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: props.bodyFontFamily,
          }}
        >
          {player.name}
        </span>
        {metadataText ? (
          <span
            data-testid="player-html-metadata"
            style={{
              display: 'flex',
              gap: props.compact ? 3 : 5,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: props.bodyFontFamily,
              fontSize: Math.max(7, matchCard.nameFontSize - (props.compact ? 3 : 4)),
              fontWeight: 700,
              letterSpacing: '0.02em',
              lineHeight: 1.1,
            }}
          >
            {seedText ? <span style={{ color: colors.SEED_TEXT }}>{seedText}</span> : null}
            {countryText ? <span style={{ color: colors.COUNTRY_TEXT }}>{countryText}</span> : null}
          </span>
        ) : null}
      </div>
      <SquashHtmlScoreSegments
        nodeId={props.nodeId}
        playerIndex={playerIndex}
        scoreSegments={props.scoreSegments}
        textColor={props.textColor}
        colors={colors}
        scoreFontSize={matchCard.score.fontSize}
        scoreSegW={matchCard.score.segmentWidth}
        scoreSegG={matchCard.score.segmentGap}
        scoreFontFamily={props.scoreFontFamily}
      />
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 20,
          borderLeft: `1px solid ${colors.DARK_BORDER}`,
          fontSize: matchCard.score.matchCountFontSize,
          fontWeight: 700,
          color: props.textColor,
          fontFamily: props.bodyFontFamily,
          paddingLeft: props.compact ? 3 : 6,
        }}
      >
        {props.setCount}
      </span>
    </div>
  );
}
