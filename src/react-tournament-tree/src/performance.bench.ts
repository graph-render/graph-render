import { EdgeType, type NxGraphInput } from '@graph-render/types';
import { MatchStatus } from '@graph-render/types/tournament';
import { bench, describe } from 'vitest';

import { DEFAULT_MATCH_CARD_COMPACT } from './constants/bracketAppearanceDefaults';
import { buildBracketGraph, buildGraphConfig } from './utils/bracketGraph';

const makeTournamentGraph = (matchCount: number): NxGraphInput => {
  const nodes: NonNullable<NxGraphInput['nodes']> = {};
  const adj: NxGraphInput['adj'] = {};

  for (let index = 0; index < matchCount; index += 1) {
    const id = `match-${index}`;
    nodes[id] = {
      label: `Match ${index}`,
      meta: {
        players: [{ name: `Player ${index}A` }, { name: `Player ${index}B` }],
        sets: [
          [11, 8],
          [9, 11],
          [11, 7],
        ],
        status: MatchStatus.Completed,
      },
    };
    adj[id] = {};
  }

  for (let index = 1; index < matchCount; index += 1) {
    const source = `match-${index}`;
    const target = `match-${Math.floor((index - 1) / 2)}`;
    adj[source] = { [target]: { id: `edge-${index}`, type: EdgeType.Directed } };
  }

  return { nodes, adj };
};

describe('tournament graph adapter performance', () => {
  const graph = makeTournamentGraph(512);

  bench('build bracket graph: 512 matches', () => {
    buildBracketGraph(graph, false, DEFAULT_MATCH_CARD_COMPACT);
  });

  bench('build graph config: compact dark', () => {
    buildGraphConfig(undefined, true, true, DEFAULT_MATCH_CARD_COMPACT);
  });
});
