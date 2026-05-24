import { describe, expect, it } from 'vitest';

import { generateSingleEliminationBracket, nextPowerOfTwo } from '../singleElimination';

const edgeId = (
  edge: ReturnType<typeof generateSingleEliminationBracket>['adj'][string][string] | undefined
) => {
  const singleEdge = (Array.isArray(edge) ? edge[0] : edge) as
    | { readonly id?: string | undefined }
    | undefined;
  return singleEdge?.id;
};

const edgeMeta = (
  edge: ReturnType<typeof generateSingleEliminationBracket>['adj'][string][string] | undefined
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

describe('nextPowerOfTwo', () => {
  it.each([
    [2, 2],
    [3, 4],
    [6, 8],
    [10, 16],
    [32, 32],
  ])('rounds %i to %i', (input, expected) => {
    expect(nextPowerOfTwo(input)).toBe(expected);
  });

  it('throws for fewer than two participants', () => {
    expect(() => nextPowerOfTwo(1)).toThrow(/at least two/);
  });
});

describe('generateSingleEliminationBracket', () => {
  it.each([
    [2, 1],
    [4, 3],
    [8, 7],
    [16, 15],
    [32, 31],
  ])('generates a %i-player bracket with %i matches', (participantCount, matchCount) => {
    const graph = generateSingleEliminationBracket(namedParticipants(participantCount));
    expect(Object.keys(graph.nodes ?? {})).toHaveLength(matchCount);
    expect(graph.nodes?.['final']).toBeDefined();
  });

  it.each([
    [3, 3],
    [6, 7],
    [10, 15],
    [12, 15],
    [14, 15],
  ])('generates a %i-player bracket with byes to %i matches', (participantCount, matchCount) => {
    const graph = generateSingleEliminationBracket(namedParticipants(participantCount), {
      byeLabel: 'BYE',
    });
    expect(Object.keys(graph.nodes ?? {})).toHaveLength(matchCount);
    expect(
      Object.values(graph.nodes ?? {}).some((node) =>
        node.meta?.players?.some((player) => player.name === 'BYE')
      )
    ).toBe(true);
  });

  it('accepts participant strings', () => {
    const graph = generateSingleEliminationBracket(['Alice', 'Bob']);
    expect(graph.nodes?.['final']?.meta?.players?.[0]?.name).toBe('Alice');
    expect(graph.nodes?.['final']?.meta?.players?.[1]?.name).toBe('Bob');
  });

  it('uses stable round and edge IDs', () => {
    const graph = generateSingleEliminationBracket(namedParticipants(4));
    expect(Object.keys(graph.nodes ?? {})).toEqual(['r1-m1', 'r1-m2', 'final']);
    expect(edgeId(graph.adj['r1-m1']?.['final'])).toBe('r1-m1-final');
    expect(edgeId(graph.adj['r1-m2']?.['final'])).toBe('r1-m2-final');
  });

  it('sorts seeded participants by seed when requested', () => {
    const graph = generateSingleEliminationBracket(
      [
        { name: 'Seed 4', seed: 4 },
        { name: 'Seed 1', seed: 1 },
        { name: 'Seed 2', seed: 2 },
        { name: 'Seed 3', seed: 3 },
      ],
      { seeded: true }
    );
    expect(graph.nodes?.['r1-m1']?.meta?.players?.map((player) => player.name)).toEqual([
      'Seed 1',
      'Seed 4',
    ]);
  });

  it('places standard seeded byes against top seeds', () => {
    const graph = generateSingleEliminationBracket(namedParticipants(6), {
      seeding: 'standard',
    });
    expect(graph.nodes?.['r1-m1']?.meta?.players?.map((player) => player.name)).toEqual([
      'Player 1',
      'BYE',
    ]);
    expect(graph.nodes?.['r1-m3']?.meta?.players?.map((player) => player.name)).toEqual([
      'Player 2',
      'BYE',
    ]);
    expect(graph.nodes?.['r2-m1']?.meta?.players?.[0]?.name).toBe('Player 1');
    expect(graph.nodes?.['r2-m2']?.meta?.players?.[0]?.name).toBe('Player 2');
  });

  it('supports manual seed order', () => {
    const graph = generateSingleEliminationBracket(namedParticipants(4), {
      seeding: 'manual',
      seedOrder: [1, 4, 2, 3],
    });
    expect(graph.nodes?.['r1-m1']?.meta?.players?.map((player) => player.name)).toEqual([
      'Player 1',
      'Player 4',
    ]);
  });

  it('supports deterministic random draw injection', () => {
    const graph = generateSingleEliminationBracket(namedParticipants(4), {
      seeding: 'random',
      shuffle: (participants) => [...participants].reverse(),
    });
    expect(graph.nodes?.['r1-m1']?.meta?.players?.map((player) => player.name)).toEqual([
      'Player 4',
      'Player 3',
    ]);
  });

  it('marks bye matches explicitly', () => {
    const graph = generateSingleEliminationBracket(namedParticipants(3), {
      seeding: 'standard',
    });
    expect(graph.nodes?.['r1-m1']?.meta?.matchType).toBe('bye');
    expect(graph.nodes?.['r1-m1']?.meta?.status).toBe('completed');
    expect(graph.nodes?.['r1-m1']?.meta?.players?.[1]?.isBye).toBe(true);
  });

  it('rejects invalid manual seed orders', () => {
    expect(() =>
      generateSingleEliminationBracket(namedParticipants(4), {
        seeding: 'manual',
        seedOrder: [1, 1, 2, 3],
      })
    ).toThrow(/duplicates/);
    expect(() =>
      generateSingleEliminationBracket(namedParticipants(4), {
        seeding: 'manual',
        seedOrder: [1, 2],
      })
    ).toThrow(/exactly one entry/);
  });

  it('can include a third-place placeholder match', () => {
    const graph = generateSingleEliminationBracket(namedParticipants(8), {
      includeThirdPlace: true,
      thirdPlaceLabel: 'Bronze Match',
    });
    expect(graph.nodes?.['third-place']?.meta?.matchType).toBe('thirdPlace');
    expect(graph.nodes?.['third-place']?.meta?.stage).toBe('Bronze Match');
    expect(edgeId(graph.adj['r2-m1']?.['third-place'])).toBe('r2-m1-third-place');
    expect(edgeId(graph.adj['r2-m2']?.['third-place'])).toBe('r2-m2-third-place');
    expect(edgeMeta(graph.adj['r2-m1']?.['third-place'])?.['sourceResult']).toBe('loser');
  });

  it('rejects invalid participants', () => {
    expect(() => generateSingleEliminationBracket(['Alice', ' '])).toThrow(/non-empty/);
    expect(() => generateSingleEliminationBracket(['Alice'])).toThrow(/at least two/);
  });
});
