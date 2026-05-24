import type { NxEdgeAttrs, NxGraphInput, NxNodeAttrs } from '@graph-render/types';
import type { GameResult, MatchMeta, MatchPlayer } from '@graph-render/types/tournament';

import { normalizeMatchMeta } from '../squash';
import { getCompletedWinnerIndex, getMatchWins } from '../squash/score';

export interface MatchResultUpdate {
  readonly sets?: ReadonlyArray<readonly number[]> | undefined;
  readonly games?: readonly GameResult[] | undefined;
  readonly status?: MatchMeta['status'] | undefined;
  readonly currentSet?: number | undefined;
  readonly winnerIndex?: 0 | 1 | null | undefined;
}

export interface ParticipantCascadeChange {
  readonly matchId: string;
  readonly playerIndex: number;
  readonly removedPlayer: MatchPlayer;
  readonly replacementPlayer?: MatchPlayer | undefined;
}

export interface ScoreCorrectionResult {
  readonly matchId: string;
  readonly originalWinnerIndex: number | null;
  readonly correctedWinnerIndex: number | null;
  readonly winnerChanged: boolean;
  readonly updatedMatch: NxNodeAttrs<unknown, MatchMeta, string>;
  readonly updatedGraph: NxGraphInput<unknown, MatchMeta, string>;
  readonly affectedMatches: readonly string[];
  readonly participantChanges: readonly ParticipantCascadeChange[];
}

const TBD_PLAYER: MatchPlayer = { name: 'TBD' };
type CorrectionEdge = NxEdgeAttrs | readonly NxEdgeAttrs[];

const isCorrectionEdgeArray = (edge: CorrectionEdge): edge is readonly NxEdgeAttrs[] =>
  Array.isArray(edge);

const getSingleEdgeMeta = (
  edge: CorrectionEdge | undefined
): Record<string, unknown> | undefined => {
  if (!edge) {
    return undefined;
  }

  const singleEdge: NxEdgeAttrs | undefined = isCorrectionEdgeArray(edge) ? edge[0] : edge;
  return singleEdge?.meta;
};

const getTargetPlayerIndex = (edge: CorrectionEdge | undefined): number | undefined => {
  const meta = getSingleEdgeMeta(edge);
  const targetPlayer = meta?.['targetPlayer'];
  if (typeof targetPlayer === 'number' && Number.isInteger(targetPlayer)) {
    return targetPlayer;
  }
  const sourcePlayer = meta?.['sourcePlayer'];
  if (typeof sourcePlayer === 'number' && Number.isInteger(sourcePlayer)) {
    return sourcePlayer;
  }
  return undefined;
};

const resolveWinnerIndex = (meta: MatchMeta, explicitWinnerIndex?: 0 | 1 | null): number | null => {
  if (explicitWinnerIndex !== undefined) {
    return explicitWinnerIndex;
  }

  const normalized = normalizeMatchMeta(meta);
  return getCompletedWinnerIndex(getMatchWins(normalized), normalized.status);
};

const updateNodeMeta = (
  node: NxNodeAttrs<unknown, MatchMeta, string>,
  update: MatchResultUpdate
): NxNodeAttrs<unknown, MatchMeta, string> => {
  const nextMeta: MatchMeta = {
    ...(node.meta ?? {}),
    ...(update.sets ? { sets: update.sets } : {}),
    ...(update.games ? { games: update.games } : {}),
    ...(update.status ? { status: update.status } : {}),
    ...(update.currentSet == null ? {} : { currentSet: update.currentSet }),
  };

  return { ...node, meta: normalizeMatchMeta(nextMeta) };
};

const collectAffectedMatches = (
  graph: NxGraphInput<unknown, MatchMeta, string>,
  matchId: string
): readonly string[] => {
  const affected: string[] = [];
  const seen = new Set<string>();
  const queue = Object.keys(graph.adj[matchId] ?? {});

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (!current || seen.has(current)) continue;
    seen.add(current);
    affected.push(current);
    queue.push(...Object.keys(graph.adj[current] ?? {}));
  }

  return affected;
};

const detectParticipantChanges = ({
  affectedMatches,
  correctedWinner,
  graph,
  matchId,
  originalWinner,
}: {
  readonly affectedMatches: readonly string[];
  readonly correctedWinner?: MatchPlayer | undefined;
  readonly graph: NxGraphInput<unknown, MatchMeta, string>;
  readonly matchId: string;
  readonly originalWinner?: MatchPlayer | undefined;
}): readonly ParticipantCascadeChange[] => {
  if (!originalWinner) return [];

  const changes: ParticipantCascadeChange[] = [];
  const directTargets = new Set(Object.keys(graph.adj[matchId] ?? {}));

  for (const affectedMatchId of affectedMatches) {
    const node = graph.nodes?.[affectedMatchId];
    const players = normalizeMatchMeta(node?.meta).players;
    const directEdge = graph.adj[matchId]?.[affectedMatchId];
    const directTargetPlayer = getTargetPlayerIndex(directEdge);
    const playerIndex =
      directTargetPlayer ?? players.findIndex((player) => isSamePlayer(player, originalWinner));

    if (playerIndex < 0 || playerIndex > 1) {
      continue;
    }

    const removedPlayer = players[playerIndex];
    if (!removedPlayer) {
      continue;
    }
    if (!isSamePlayer(removedPlayer, originalWinner)) {
      continue;
    }

    changes.push({
      matchId: affectedMatchId,
      playerIndex,
      removedPlayer,
      ...(directTargets.has(affectedMatchId) && correctedWinner
        ? { replacementPlayer: correctedWinner }
        : {}),
    });
  }

  return changes;
};

const isSamePlayer = (a: MatchPlayer, b: MatchPlayer): boolean =>
  a.id && b.id ? a.id === b.id : a.name === b.name;

export function correctMatchResult(
  graph: NxGraphInput<unknown, MatchMeta, string>,
  matchId: string,
  update: MatchResultUpdate
): ScoreCorrectionResult {
  const node = graph.nodes?.[matchId];
  if (!node) {
    throw new RangeError(`Cannot correct unknown match "${matchId}".`);
  }

  const originalMeta = normalizeMatchMeta(node.meta);
  const originalWinnerIndex = resolveWinnerIndex(originalMeta);
  const updatedMatch = updateNodeMeta(node, update);
  const correctedMeta = normalizeMatchMeta(updatedMatch.meta);
  const correctedWinnerIndex = resolveWinnerIndex(correctedMeta, update.winnerIndex);
  const winnerChanged = originalWinnerIndex !== correctedWinnerIndex;
  const affectedMatches = winnerChanged ? collectAffectedMatches(graph, matchId) : [];
  const originalWinner =
    originalWinnerIndex == null ? undefined : originalMeta.players[originalWinnerIndex];
  const correctedWinner =
    correctedWinnerIndex == null ? undefined : correctedMeta.players[correctedWinnerIndex];
  const updatedGraph: NxGraphInput<unknown, MatchMeta, string> = {
    ...graph,
    nodes: {
      ...(graph.nodes ?? {}),
      [matchId]: updatedMatch,
    },
  };

  return {
    affectedMatches,
    correctedWinnerIndex,
    matchId,
    originalWinnerIndex,
    participantChanges: detectParticipantChanges({
      affectedMatches,
      correctedWinner,
      graph,
      matchId,
      originalWinner,
    }),
    updatedGraph,
    updatedMatch,
    winnerChanged,
  };
}

export function applyScoreCorrectionCascade(
  graph: NxGraphInput<unknown, MatchMeta, string>,
  correction: ScoreCorrectionResult
): NxGraphInput<unknown, MatchMeta, string> {
  const nodes = { ...(graph.nodes ?? {}) };

  for (const change of correction.participantChanges) {
    const node = nodes[change.matchId];
    if (!node) {
      throw new RangeError(`Cannot apply correction cascade to unknown match "${change.matchId}".`);
    }
    const meta = normalizeMatchMeta(node.meta);
    const players = [...meta.players] as [MatchPlayer, MatchPlayer];
    players[change.playerIndex] = change.replacementPlayer ?? TBD_PLAYER;
    nodes[change.matchId] = { ...node, meta: { ...meta, players } };
  }

  return { ...graph, nodes };
}
