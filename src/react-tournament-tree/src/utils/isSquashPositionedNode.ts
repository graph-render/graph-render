import type { PositionedNode } from '@graph-render/types';
import type { MatchMeta, MatchPositionedNode } from '@graph-render/types/tournament';

const isMatchMeta = (value: unknown): value is MatchMeta => {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  const meta = value as MatchMeta;
  return meta.players == null || Array.isArray(meta.players);
};

export const isMatchPositionedNode = (node: PositionedNode): boolean => {
  if (node.meta == null) {
    return false;
  }

  return isMatchMeta(node.meta);
};

export const toMatchPositionedNode = (node: PositionedNode): MatchPositionedNode | null => {
  return isMatchPositionedNode(node) ? (node as MatchPositionedNode) : null;
};

/** @deprecated Use isMatchPositionedNode. */
export const isSquashPositionedNode = isMatchPositionedNode;
/** @deprecated Use toMatchPositionedNode. */
export const toSquashPositionedNode = toMatchPositionedNode;
