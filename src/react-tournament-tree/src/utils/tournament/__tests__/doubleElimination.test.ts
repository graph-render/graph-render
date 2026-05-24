import { BracketSection, MatchType } from '@graph-render/types/tournament';
import { describe, expect, it } from 'vitest';

import { generateDoubleEliminationBracket } from '../doubleElimination';

const edgeMeta = (
  edge: ReturnType<typeof generateDoubleEliminationBracket>['adj'][string][string] | undefined
) => {
  const singleEdge = (Array.isArray(edge) ? edge[0] : edge) as
    | { readonly meta?: Record<string, unknown> | undefined }
    | undefined;
  return singleEdge?.meta;
};

const namedParticipants = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    name: `Player ${index + 1}`,
    seed: index + 1,
  }));

describe('generateDoubleEliminationBracket', () => {
  it.each([
    [8, 14],
    [16, 30],
    [32, 62],
  ])('generates a %i-player double-elimination bracket with %i matches', (count, matches) => {
    const graph = generateDoubleEliminationBracket(namedParticipants(count));
    expect(Object.keys(graph.nodes ?? {})).toHaveLength(matches);
    expect(graph.nodes?.['grand-final']?.meta?.matchType).toBe(MatchType.GrandFinal);
  });

  it('labels winners, losers, and grand-final sections', () => {
    const graph = generateDoubleEliminationBracket(namedParticipants(8));
    const nodes = Object.values(graph.nodes ?? {});

    expect(
      nodes.filter((node) => node.meta?.bracketSection === BracketSection.Winners)
    ).toHaveLength(7);
    expect(
      nodes.filter((node) => node.meta?.bracketSection === BracketSection.Losers)
    ).toHaveLength(6);
    expect(
      nodes.filter((node) => node.meta?.bracketSection === BracketSection.GrandFinal)
    ).toHaveLength(1);
  });

  it('places first-round participants in the winners bracket', () => {
    const graph = generateDoubleEliminationBracket([
      'Alice',
      'Bob',
      'Cara',
      'Dan',
      'Eli',
      'Fay',
      'Gia',
      'Hao',
    ]);

    expect(graph.nodes?.['w-r1-m1']?.meta?.players?.map((player) => player.name)).toEqual([
      'Alice',
      'Bob',
    ]);
    expect(graph.nodes?.['w-r1-m2']?.meta?.players?.map((player) => player.name)).toEqual([
      'Cara',
      'Dan',
    ]);
  });

  it('routes winners forward and drops winners-bracket losers into the losers bracket', () => {
    const graph = generateDoubleEliminationBracket(namedParticipants(8));

    expect(edgeMeta(graph.adj['w-r1-m1']?.['w-r2-m1'])?.['sourceResult']).toBe('winner');
    expect(edgeMeta(graph.adj['w-r1-m1']?.['l-r1-m1'])).toMatchObject({
      bracketDrop: true,
      sourceResult: 'loser',
      targetPlayer: 0,
    });
    expect(edgeMeta(graph.adj['w-r2-m1']?.['l-r2-m1'])).toMatchObject({
      bracketDrop: true,
      sourceResult: 'loser',
      targetPlayer: 1,
    });
  });

  it('supports an optional bracket reset final', () => {
    const graph = generateDoubleEliminationBracket(namedParticipants(8), {
      bracketResetLabel: 'Reset Final',
      includeBracketReset: true,
    });

    expect(graph.nodes?.['grand-final-reset']?.meta).toMatchObject({
      bracketSection: BracketSection.GrandFinal,
      matchType: MatchType.GrandFinal,
      stage: 'Reset Final',
    });
    expect(edgeMeta(graph.adj['grand-final']?.['grand-final-reset'])?.['sourceResult']).toBe(
      'reset'
    );
  });

  it('positions the 16-player winners bracket above the losers bracket without overlap', () => {
    const graph = generateDoubleEliminationBracket(namedParticipants(16));
    const nodes = Object.values(graph.nodes ?? {});
    const winnerBottom = Math.max(
      ...nodes
        .filter((node) => node.meta?.bracketSection === BracketSection.Winners)
        .map((node) => (node.position?.y ?? 0) + 100)
    );
    const loserTop = Math.min(
      ...nodes
        .filter((node) => node.meta?.bracketSection === BracketSection.Losers)
        .map((node) => node.position?.y ?? 0)
    );

    expect(winnerBottom).toBeLessThan(loserTop);
  });

  it('rejects unsupported draw sizes', () => {
    expect(() => generateDoubleEliminationBracket(namedParticipants(4))).toThrow(/8, 16, or 32/);
    expect(() => generateDoubleEliminationBracket(namedParticipants(9))).toThrow(/8, 16, or 32/);
  });
});
