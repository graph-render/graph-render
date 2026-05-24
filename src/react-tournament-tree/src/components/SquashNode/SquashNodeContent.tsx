import { SquashNodeRenderMode } from '@graph-render/types/tournament';
import React, { useEffect, useState } from 'react';

import { DEFAULT_PLAYER_ONE, DEFAULT_PLAYER_TWO, NODE_DIMENSIONS } from '../../constants';
import { useBracketAppearance } from '../../contexts/BracketAppearanceContext';
import type { SquashNodeProps } from '../../types/squashNode';
import { ensureSquashNodeAnimations } from '../../utils/animations';
import { isSvgCompatibleRenderMode } from '../../utils/renderMode';
import {
  getCompletedWinnerIndex,
  getMatchAriaLabel,
  getMatchWins,
  normalizeMatchMeta,
  normalizePlayerKey,
} from '../../utils/squash';
import { SquashNodeHtml } from './SquashNodeHtml';
import { SquashNodeSvg } from './SquashNodeSvg';

export const SquashNodeContent = React.memo<SquashNodeProps>(function SquashNodeContent({
  node,
  isHovered,
  activePathKey,
  activePathNodeIds,
  onPathHover,
  onPathLeave,
  renderMode = SquashNodeRenderMode.Export,
}) {
  const [hoveredPlayerIndex, setHoveredPlayerIndex] = useState<number | null>(null);
  const { colors, matchCard: defaultMatchCard, compact: densityCompact } = useBracketAppearance();

  useEffect(() => {
    ensureSquashNodeAnimations();
  }, []);

  const meta = normalizeMatchMeta(node.meta);
  const p1 = meta.players[0] ?? DEFAULT_PLAYER_ONE;
  const p2 = meta.players[1] ?? DEFAULT_PLAYER_TWO;
  const nodeWidth = node.size?.width ?? defaultMatchCard.width;
  const nodeHeight = node.size?.height ?? defaultMatchCard.height;
  /** Fall back to compact drawing metrics when the box is smaller than the standard card. */
  const layoutCompact =
    densityCompact || nodeHeight < NODE_DIMENSIONS.HEIGHT || nodeWidth < NODE_DIMENSIONS.WIDTH;
  const setWins = getMatchWins(meta);
  const winnerIndex = getCompletedWinnerIndex(setWins, meta.status);
  const sharedProps = {
    nodeId: node.id,
    nodeWidth,
    nodeHeight,
    compact: layoutCompact,
    isHovered,
    hoveredPlayerIndex,
    normalizedActivePathKey: activePathKey ? normalizePlayerKey(activePathKey) : null,
    isNodeInActivePath: activePathNodeIds?.has(node.id) ?? false,
    isTBD: p1.name === 'TBD' || p2.name === 'TBD',
    ariaLabel: getMatchAriaLabel({
      bracketSection: meta.bracketSection,
      currentSet: meta.currentSet,
      matchType: meta.matchType,
      players: meta.players,
      scoreUnit: meta.games.length > 0 ? 'games' : 'sets',
      setWins,
      stage: meta.stage,
      status: meta.status,
      venue: meta.venue,
      winnerIndex,
    }),
    meta,
    setWins,
    winnerIndex,
    colors,
    onPlayerEnter: (playerIndex: number, player: (typeof meta.players)[number]) => {
      setHoveredPlayerIndex(playerIndex);
      if (p1.name !== 'TBD' && p2.name !== 'TBD') {
        onPathHover?.(playerIndex, { pathKey: player.name });
      }
    },
    onPlayerLeave: () => {
      setHoveredPlayerIndex(null);
      if (p1.name !== 'TBD' && p2.name !== 'TBD') {
        onPathLeave?.();
      }
    },
  };

  if (isSvgCompatibleRenderMode(renderMode)) {
    return <SquashNodeSvg {...sharedProps} />;
  }

  return <SquashNodeHtml {...sharedProps} />;
});
