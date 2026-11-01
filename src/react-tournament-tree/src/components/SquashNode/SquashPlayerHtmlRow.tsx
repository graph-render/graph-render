import { useCountryFlag } from '../../contexts/CountryFlagsContext';
import { usePlayerAvatar } from '../../hooks/usePlayerAvatar';
import type { SquashPlayerRowProps } from '../../types/squashNode';
import type { ResolvedMatchCardStyle } from '../../utils/resolveBracketAppearance';
import { getPlayerBadgeText, getPlayerCountryText, getPlayerSeedText } from '../../utils/squash';
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
  const flag = useCountryFlag(player.country, props.compact);
  const avatar = usePlayerAvatar(player.avatarUrl);
  const seedText = getPlayerSeedText(player);
  const countryText = getPlayerCountryText(player);
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
          overflow: 'hidden',
        }}
        aria-label={`crest-${player.name}`}
      >
        {avatar.url ? (
          <img
            src={avatar.url}
            alt=""
            onError={avatar.onError}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            data-testid="player-html-avatar"
          />
        ) : (
          getPlayerBadgeText(player)
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.3em',
            minWidth: 0,
            fontSize: matchCard.nameFontSize,
            fontFamily: props.bodyFontFamily,
          }}
        >
          <span
            style={{
              fontWeight: isWinner ? 600 : 500,
              color: props.textColor,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {player.name}
          </span>
          {seedText ? (
            <span
              style={{ fontWeight: 500, color: colors.SEED_TEXT, flexShrink: 0 }}
              data-testid="player-html-seed"
            >
              {seedText}
            </span>
          ) : null}
        </span>
        {flag || countryText ? (
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
              alignItems: 'center',
            }}
          >
            {flag ? (
              <img
                src={flag.url}
                alt={flag.code}
                title={flag.code}
                width={flag.width}
                height={flag.height}
                style={{
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: `0 0 0 0.5px ${colors.BORDER}`,
                  flexShrink: 0,
                  marginTop: props.compact ? 2 : 3,
                }}
                data-testid="player-html-flag"
              />
            ) : null}
            {flag ? null : <span style={{ color: colors.COUNTRY_TEXT }}>{countryText}</span>}
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
          borderLeft: props.hideScoreSegments ? 'none' : `1px solid ${colors.DARK_BORDER}`,
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
