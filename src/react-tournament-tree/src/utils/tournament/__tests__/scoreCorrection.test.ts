import { type MatchMeta, MatchStatus } from '@graph-render/types/tournament';
import { describe, expect, it } from 'vitest';

import {
  applyScoreCorrectionCascade,
  correctMatchResult,
  type MatchResultUpdate,
} from '../scoreCorrection';

const createGraph = () => ({
  nodes: {
    'r1-m1': {
      meta: {
        players: [{ name: 'Alice' }, { name: 'Bob' }],
        sets: [
          [11, 8],
          [11, 9],
        ],
        status: MatchStatus.Completed,
      } satisfies MatchMeta,
    },
    final: {
      meta: {
        players: [{ name: 'Alice' }, { name: 'Carol' }],
        status: MatchStatus.Upcoming,
      } satisfies MatchMeta,
    },
  },
  adj: {
    'r1-m1': {
      final: { id: 'r1-m1-final', meta: { sourcePlayer: 0 } },
    },
    final: {},
  },
});

describe('correctMatchResult', () => {
  it('updates a match immutably without applying downstream cascade automatically', () => {
    const graph = createGraph();
    const correction = correctMatchResult(graph, 'r1-m1', {
      sets: [
        [8, 11],
        [9, 11],
      ],
    });

    expect(correction.winnerChanged).toBe(true);
    expect(correction.originalWinnerIndex).toBe(0);
    expect(correction.correctedWinnerIndex).toBe(1);
    expect(correction.affectedMatches).toEqual(['final']);
    expect(correction.participantChanges).toEqual([
      {
        matchId: 'final',
        playerIndex: 0,
        removedPlayer: { name: 'Alice' },
        replacementPlayer: { name: 'Bob' },
      },
    ]);
    expect(correction.updatedGraph.nodes?.['r1-m1']?.meta?.sets).toEqual([
      [8, 11],
      [9, 11],
    ]);
    expect(correction.updatedGraph.nodes?.['final']?.meta?.players?.[0]?.name).toBe('Alice');
    expect(graph.nodes.final.meta.players?.[0]?.name).toBe('Alice');
  });

  it('applies cascade only when the consumer opts in', () => {
    const graph = createGraph();
    const correction = correctMatchResult(graph, 'r1-m1', {
      sets: [
        [8, 11],
        [9, 11],
      ],
    });
    const cascaded = applyScoreCorrectionCascade(correction.updatedGraph, correction);

    expect(cascaded.nodes?.['final']?.meta?.players?.[0]?.name).toBe('Bob');
  });

  it('reports no affected matches when the winner does not change', () => {
    const correction = correctMatchResult(createGraph(), 'r1-m1', {
      sets: [
        [11, 7],
        [11, 5],
      ],
    });

    expect(correction.winnerChanged).toBe(false);
    expect(correction.affectedMatches).toEqual([]);
    expect(correction.participantChanges).toEqual([]);
  });

  it('supports game result corrections', () => {
    const graph = createGraph();
    const update: MatchResultUpdate = {
      games: [
        { label: 'G1', scores: [10, 13] },
        { label: 'G2', scores: [9, 13] },
      ],
      sets: [],
    };

    const correction = correctMatchResult(graph, 'r1-m1', update);

    expect(correction.correctedWinnerIndex).toBe(1);
    expect(correction.updatedMatch.meta?.games).toHaveLength(2);
  });

  it('throws for unknown match IDs', () => {
    expect(() => correctMatchResult(createGraph(), 'missing', { sets: [] })).toThrow(
      /unknown match/
    );
  });
});
