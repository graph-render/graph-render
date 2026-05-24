import type { NxGraphInput, NxNodeAttrs } from '@graph-render/types';
import {
  BracketSection,
  type MatchMeta,
  type MatchPlayer,
  MatchStatus,
  MatchType,
} from '@graph-render/types/tournament';

import type { TournamentParticipantInput } from './singleElimination';

export interface DoubleEliminationBracketOptions {
  readonly includeBracketReset?: boolean | undefined;
  readonly grandFinalLabel?: string | undefined;
  readonly bracketResetLabel?: string | undefined;
}

export interface DoubleEliminationEdgeMeta {
  readonly sourceResult?: 'winner' | 'loser' | 'reset' | undefined;
  readonly sourcePlayer?: number | undefined;
  readonly targetPlayer?: number | undefined;
  readonly bracketDrop?: boolean | undefined;
}

export type DoubleEliminationGraph = NxGraphInput<
  unknown,
  MatchMeta,
  string,
  DoubleEliminationEdgeMeta,
  string
>;

const SUPPORTED_DRAW_SIZES = new Set([8, 16, 32]);
const TBD_PLAYER: MatchPlayer = { name: 'TBD' };
const NODE_COLUMN_GAP = 340;
const NODE_ROW_GAP = 140;
const SECTION_GAP = 220;
const DEFAULT_NODE_HEIGHT = 100;

const normalizeParticipant = (
  participant: TournamentParticipantInput,
  index: number
): MatchPlayer => {
  if (typeof participant === 'string') {
    const name = participant.trim();
    if (!name) {
      throw new TypeError(`participants[${index}] must be a non-empty string.`);
    }

    return { name };
  }

  if (!participant || typeof participant !== 'object') {
    throw new TypeError(`participants[${index}] must be a string or MatchPlayer object.`);
  }

  if (typeof participant.name !== 'string' || !participant.name.trim()) {
    throw new TypeError(`participants[${index}].name must be a non-empty string.`);
  }

  return { ...participant, name: participant.name.trim() };
};

const createNode = (
  meta: MatchMeta,
  position: { readonly x: number; readonly y: number }
): NxNodeAttrs<unknown, MatchMeta, string> => ({
  meta: {
    status: MatchStatus.Upcoming,
    ...meta,
  },
  position,
});

const roundStageLabel = (roundIndex: number, roundCount: number): string => {
  const matchesInRound = 2 ** (roundCount - roundIndex - 1);
  if (matchesInRound === 1) return 'Final';
  if (matchesInRound === 2) return 'SF';
  if (matchesInRound === 4) return 'QF';
  return `R${matchesInRound * 2}`;
};

const winnersMatchId = (roundIndex: number, roundCount: number, matchIndex: number): string =>
  roundIndex === roundCount - 1 ? 'w-final' : `w-r${roundIndex + 1}-m${matchIndex + 1}`;

const losersMatchId = (roundIndex: number, roundCount: number, matchIndex: number): string =>
  roundIndex === roundCount - 1 ? 'l-final' : `l-r${roundIndex + 1}-m${matchIndex + 1}`;

const positionedY = (index: number, count: number, maxCount: number): number =>
  ((index + 0.5) * (maxCount / count) - 0.5) * NODE_ROW_GAP;

const createLosersRoundCounts = (slotCount: number): readonly number[] => {
  const counts: number[] = [];
  for (let count = slotCount / 4; count >= 1; count /= 2) {
    counts.push(count, count);
  }

  return counts;
};

const addEdge = (
  adj: DoubleEliminationGraph['adj'],
  sourceId: string,
  targetId: string,
  meta: DoubleEliminationEdgeMeta
) => {
  adj[sourceId] = {
    ...adj[sourceId],
    [targetId]: {
      id: `${sourceId}-${targetId}`,
      meta,
    },
  };
};

export function generateDoubleEliminationBracket(
  participantsInput: readonly TournamentParticipantInput[],
  options: DoubleEliminationBracketOptions = {}
): DoubleEliminationGraph {
  const participants = participantsInput.map(normalizeParticipant);
  const slotCount = participants.length;
  if (!SUPPORTED_DRAW_SIZES.has(slotCount)) {
    throw new RangeError(
      'Double-elimination brackets currently require 8, 16, or 32 participants.'
    );
  }

  const winnerRoundCount = Math.log2(slotCount);
  const loserRoundCounts = createLosersRoundCounts(slotCount);
  const firstWinnerRoundCount = slotCount / 2;
  const firstLoserRoundCount = slotCount / 4;
  const winnerSectionHeight = (firstWinnerRoundCount - 1) * NODE_ROW_GAP + DEFAULT_NODE_HEIGHT;
  const loserBaseY = winnerSectionHeight + SECTION_GAP;
  const loserSectionHeight = (firstLoserRoundCount - 1) * NODE_ROW_GAP + DEFAULT_NODE_HEIGHT;
  const grandFinalY = loserBaseY + loserSectionHeight / 2 - DEFAULT_NODE_HEIGHT / 2;
  const nodes: NonNullable<DoubleEliminationGraph['nodes']> = {};
  const adj: DoubleEliminationGraph['adj'] = {};
  const winnersRounds: string[][] = [];
  const losersRounds: string[][] = [];

  for (let roundIndex = 0; roundIndex < winnerRoundCount; roundIndex += 1) {
    const matchesInRound = 2 ** (winnerRoundCount - roundIndex - 1);
    const stage = `Winners ${roundStageLabel(roundIndex, winnerRoundCount)}`;
    const roundIds: string[] = [];

    for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex += 1) {
      const id = winnersMatchId(roundIndex, winnerRoundCount, matchIndex);
      roundIds.push(id);
      adj[id] = {};
      nodes[id] = createNode(
        {
          bracketSection: BracketSection.Winners,
          stage,
          players:
            roundIndex === 0
              ? [
                  participants[matchIndex * 2] ?? TBD_PLAYER,
                  participants[matchIndex * 2 + 1] ?? TBD_PLAYER,
                ]
              : [TBD_PLAYER, TBD_PLAYER],
        },
        {
          x: roundIndex * NODE_COLUMN_GAP,
          y: positionedY(matchIndex, matchesInRound, firstWinnerRoundCount),
        }
      );
    }

    winnersRounds.push(roundIds);
  }

  for (let roundIndex = 0; roundIndex < loserRoundCounts.length; roundIndex += 1) {
    const matchesInRound = loserRoundCounts[roundIndex] ?? 1;
    const isFinal = roundIndex === loserRoundCounts.length - 1;
    const stage = isFinal ? 'Losers Final' : `Losers R${roundIndex + 1}`;
    const roundIds: string[] = [];

    for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex += 1) {
      const id = losersMatchId(roundIndex, loserRoundCounts.length, matchIndex);
      roundIds.push(id);
      adj[id] = {};
      nodes[id] = createNode(
        {
          bracketSection: BracketSection.Losers,
          stage,
          players: [TBD_PLAYER, TBD_PLAYER],
        },
        {
          x: (roundIndex + 1) * NODE_COLUMN_GAP,
          y: loserBaseY + positionedY(matchIndex, matchesInRound, firstLoserRoundCount),
        }
      );
    }

    losersRounds.push(roundIds);
  }

  const grandFinalLabel = options.grandFinalLabel?.trim() || 'Grand Final';
  const bracketResetLabel = options.bracketResetLabel?.trim() || 'Bracket Reset';
  const grandFinalX = (loserRoundCounts.length + 1) * NODE_COLUMN_GAP;
  nodes['grand-final'] = createNode(
    {
      bracketSection: BracketSection.GrandFinal,
      matchType: MatchType.GrandFinal,
      stage: grandFinalLabel,
      players: [TBD_PLAYER, TBD_PLAYER],
    },
    { x: grandFinalX, y: grandFinalY }
  );
  adj['grand-final'] = {};

  if (options.includeBracketReset) {
    nodes['grand-final-reset'] = createNode(
      {
        bracketSection: BracketSection.GrandFinal,
        matchType: MatchType.GrandFinal,
        stage: bracketResetLabel,
        players: [TBD_PLAYER, TBD_PLAYER],
      },
      { x: grandFinalX + NODE_COLUMN_GAP, y: grandFinalY + NODE_ROW_GAP }
    );
    adj['grand-final-reset'] = {};
  }

  for (let roundIndex = 0; roundIndex < winnersRounds.length - 1; roundIndex += 1) {
    const round = winnersRounds[roundIndex] ?? [];
    const nextRound = winnersRounds[roundIndex + 1] ?? [];

    for (let matchIndex = 0; matchIndex < round.length; matchIndex += 1) {
      const sourceId = round[matchIndex];
      const targetId = nextRound[Math.floor(matchIndex / 2)];
      if (!sourceId || !targetId) continue;
      addEdge(adj, sourceId, targetId, {
        sourcePlayer: matchIndex % 2,
        sourceResult: 'winner',
        targetPlayer: matchIndex % 2,
      });
    }
  }

  for (let roundIndex = 0; roundIndex < losersRounds.length - 1; roundIndex += 1) {
    const round = losersRounds[roundIndex] ?? [];
    const nextRound = losersRounds[roundIndex + 1] ?? [];
    const sameMatchCount = round.length === nextRound.length;

    for (let matchIndex = 0; matchIndex < round.length; matchIndex += 1) {
      const sourceId = round[matchIndex];
      const targetId = sameMatchCount
        ? nextRound[matchIndex]
        : nextRound[Math.floor(matchIndex / 2)];
      if (!sourceId || !targetId) continue;
      addEdge(adj, sourceId, targetId, {
        sourceResult: 'winner',
        targetPlayer: sameMatchCount ? 0 : matchIndex % 2,
      });
    }
  }

  winnersRounds[0]?.forEach((sourceId, matchIndex) => {
    const targetId = losersRounds[0]?.[Math.floor(matchIndex / 2)];
    if (!targetId) return;
    addEdge(adj, sourceId, targetId, {
      bracketDrop: true,
      sourcePlayer: matchIndex % 2,
      sourceResult: 'loser',
      targetPlayer: matchIndex % 2,
    });
  });

  for (let winnerRoundIndex = 1; winnerRoundIndex < winnersRounds.length; winnerRoundIndex += 1) {
    const targetLoserRoundIndex =
      winnerRoundIndex === winnersRounds.length - 1
        ? loserRoundCounts.length - 1
        : winnerRoundIndex * 2 - 1;
    const targetLoserRound = losersRounds[targetLoserRoundIndex] ?? [];

    winnersRounds[winnerRoundIndex]?.forEach((sourceId, matchIndex) => {
      const targetId = targetLoserRound[matchIndex];
      if (!targetId) return;
      addEdge(adj, sourceId, targetId, {
        bracketDrop: true,
        sourceResult: 'loser',
        targetPlayer: 1,
      });
    });
  }

  const winnersFinal = winnersRounds.at(-1)?.[0];
  const losersFinal = losersRounds.at(-1)?.[0];
  if (winnersFinal) {
    addEdge(adj, winnersFinal, 'grand-final', { sourceResult: 'winner', targetPlayer: 0 });
  }
  if (losersFinal) {
    addEdge(adj, losersFinal, 'grand-final', { sourceResult: 'winner', targetPlayer: 1 });
  }
  if (options.includeBracketReset) {
    addEdge(adj, 'grand-final', 'grand-final-reset', { sourceResult: 'reset' });
  }

  return { nodes, adj };
}
