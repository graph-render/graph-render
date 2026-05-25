import type { NxGraphInput } from '@graph-render/types';

import type { ResolvedTournamentLocalization } from '../models/localization';
import { getTournamentRoundLabel } from './localization';

function buildOutgoingMap(graph: NxGraphInput): ReadonlyMap<string, readonly string[]> {
  const outgoing = new Map<string, string[]>();

  for (const [source, neighbors] of Object.entries(graph.adj)) {
    outgoing.set(source, Object.keys(neighbors));
    for (const target of Object.keys(neighbors)) {
      if (!outgoing.has(target)) {
        outgoing.set(target, []);
      }
    }
  }

  for (const nodeId of Object.keys(graph.nodes ?? {})) {
    if (!outgoing.has(nodeId)) {
      outgoing.set(nodeId, []);
    }
  }

  return outgoing;
}

function inferRoundCount(graph: NxGraphInput): number {
  const outgoing = buildOutgoingMap(graph);
  if (outgoing.size === 0) {
    return 0;
  }

  const inDegree = new Map(Array.from(outgoing.keys(), (nodeId) => [nodeId, 0]));
  for (const [, targets] of outgoing) {
    for (const target of targets) {
      inDegree.set(target, (inDegree.get(target) ?? 0) + 1);
    }
  }

  const roots = [...inDegree.entries()]
    .filter(([, degree]) => degree === 0)
    .map(([nodeId]) => nodeId);

  if (roots.length === 0) {
    return 0;
  }

  const queue = [...roots];
  const levels = new Map<string, number>(roots.map((nodeId) => [nodeId, 0]));

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (!current) {
      continue;
    }
    const level = levels.get(current) ?? 0;

    for (const target of outgoing.get(current) ?? []) {
      const nextLevel = level + 1;
      const existing = levels.get(target);
      if (existing == null || nextLevel > existing) {
        levels.set(target, nextLevel);
      }

      inDegree.set(target, (inDegree.get(target) ?? 0) - 1);
      if ((inDegree.get(target) ?? 0) === 0) {
        queue.push(target);
      }
    }
  }

  const maxLevel = Math.max(...levels.values());
  return Number.isFinite(maxLevel) ? maxLevel + 1 : 0;
}

/**
 * Derive round labels from the number of rounds.
 * Example: 4 rounds -> ["1/8", "1/4", "1/2", "Final"].
 */
export function roundLabelsForRoundCount(
  roundCount: number,
  localization?: ResolvedTournamentLocalization
): readonly string[] {
  if (!Number.isFinite(roundCount) || roundCount <= 0) return [];

  return Array.from({ length: roundCount }, (_, idx) =>
    getTournamentRoundLabel(roundCount, idx, localization)
  );
}

/**
 * Derive round labels from the number of matches (nodes).
 * Example: 15 matches -> 4 rounds => ["1/8", "1/4", "1/2", "Final"].
 */
export function roundLabelsForMatchCount(
  matchCount: number,
  localization?: ResolvedTournamentLocalization
): readonly string[] {
  if (!Number.isFinite(matchCount) || matchCount <= 0) return [];
  const rounds = Math.max(1, Math.ceil(Math.log2(matchCount + 1)));
  return roundLabelsForRoundCount(rounds, localization);
}

/**
 * Convenience helper to derive labels directly from a graph definition.
 */
export function roundLabelsForGraph(
  graph: NxGraphInput,
  localization?: ResolvedTournamentLocalization
): readonly string[] {
  return roundLabelsForRoundCount(inferRoundCount(graph), localization);
}
