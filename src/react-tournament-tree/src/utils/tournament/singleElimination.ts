import type { NxGraphInput, NxNodeAttrs } from '@graph-render/types';
import type { MatchMeta, MatchPlayer } from '@graph-render/types/tournament';

export type TournamentParticipantInput = string | MatchPlayer;

export type SingleEliminationSeeding = 'none' | 'seeded';

export interface SingleEliminationBracketOptions {
  readonly seeded?: boolean | undefined;
  readonly seeding?: SingleEliminationSeeding | undefined;
  readonly includeThirdPlace?: boolean | undefined;
  readonly byeLabel?: string | undefined;
}

export type SingleEliminationGraph = NxGraphInput<unknown, MatchMeta, string>;

const DEFAULT_BYE_LABEL = 'BYE';
const TBD_PLAYER: MatchPlayer = { name: 'TBD' };

const isPowerOfTwo = (value: number): boolean => value > 0 && (value & (value - 1)) === 0;

export const nextPowerOfTwo = (value: number): number => {
  if (!Number.isInteger(value) || value < 2) {
    throw new RangeError('Single-elimination brackets require at least two participants.');
  }

  if (isPowerOfTwo(value)) {
    return value;
  }

  let next = 2;
  while (next < value) {
    next *= 2;
  }

  return next;
};

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

const seedParticipants = (
  participants: readonly MatchPlayer[],
  seeded: boolean
): readonly MatchPlayer[] => {
  if (!seeded) {
    return participants;
  }

  return [...participants].sort((a, b) => {
    const seedA = a.seed ?? Number.MAX_SAFE_INTEGER;
    const seedB = b.seed ?? Number.MAX_SAFE_INTEGER;
    if (seedA !== seedB) return seedA - seedB;
    return a.name.localeCompare(b.name);
  });
};

const roundStageLabel = (roundIndex: number, roundCount: number): string => {
  const matchesInRound = 2 ** (roundCount - roundIndex - 1);
  if (matchesInRound === 1) return 'Final';
  if (matchesInRound === 2) return 'SF';
  if (matchesInRound === 4) return 'QF';
  return `R${matchesInRound * 2}`;
};

const matchIdForRound = (roundIndex: number, roundCount: number, matchIndex: number): string => {
  if (roundIndex === roundCount - 1) {
    return 'final';
  }

  return `r${roundIndex + 1}-m${matchIndex + 1}`;
};

const createNode = (meta: MatchMeta): NxNodeAttrs<unknown, MatchMeta, string> => ({
  meta: {
    status: 'upcoming' as MatchMeta['status'],
    ...meta,
  },
});

export function generateSingleEliminationBracket(
  participantsInput: readonly TournamentParticipantInput[],
  options: SingleEliminationBracketOptions = {}
): SingleEliminationGraph {
  const participants = participantsInput.map(normalizeParticipant);
  const slotCount = nextPowerOfTwo(participants.length);
  const roundCount = Math.log2(slotCount);
  const byeLabel = options.byeLabel?.trim() || DEFAULT_BYE_LABEL;
  const drawnParticipants = seedParticipants(
    participants,
    options.seeded === true || options.seeding === 'seeded'
  );
  const slots: readonly MatchPlayer[] = [
    ...drawnParticipants,
    ...Array.from({ length: slotCount - drawnParticipants.length }, () => ({ name: byeLabel })),
  ];
  const nodes: NonNullable<SingleEliminationGraph['nodes']> = {};
  const adj: SingleEliminationGraph['adj'] = {};
  const rounds: string[][] = [];

  for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
    const matchesInRound = 2 ** (roundCount - roundIndex - 1);
    const stage = roundStageLabel(roundIndex, roundCount);
    const roundMatchIds: string[] = [];

    for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex += 1) {
      const id = matchIdForRound(roundIndex, roundCount, matchIndex);
      roundMatchIds.push(id);
      adj[id] = {};

      if (roundIndex === 0) {
        const playerOne = slots[matchIndex * 2] ?? TBD_PLAYER;
        const playerTwo = slots[matchIndex * 2 + 1] ?? TBD_PLAYER;
        nodes[id] = createNode({ stage, players: [playerOne, playerTwo] });
        continue;
      }

      nodes[id] = createNode({ stage, players: [TBD_PLAYER, TBD_PLAYER] });
    }

    rounds.push(roundMatchIds);
  }

  for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex += 1) {
    const round = rounds[roundIndex] ?? [];
    const nextRound = rounds[roundIndex + 1] ?? [];

    for (let matchIndex = 0; matchIndex < round.length; matchIndex += 1) {
      const sourceId = round[matchIndex];
      const targetId = nextRound[Math.floor(matchIndex / 2)];
      if (!sourceId || !targetId) continue;

      adj[sourceId] = {
        ...adj[sourceId],
        [targetId]: {
          id: `${sourceId}-${targetId}`,
          meta: { sourcePlayer: matchIndex % 2 },
        },
      };
    }
  }

  if (options.includeThirdPlace && roundCount >= 3) {
    nodes['third-place'] = createNode({
      stage: 'Third Place',
      matchType: 'thirdPlace',
      players: [TBD_PLAYER, TBD_PLAYER],
    });
    adj['third-place'] = {};

    const semifinalRound = rounds.at(-2) ?? [];
    for (const semifinalId of semifinalRound) {
      adj[semifinalId] = {
        ...adj[semifinalId],
        'third-place': {
          id: `${semifinalId}-third-place`,
          meta: { sourceResult: 'loser' },
        },
      };
    }
  }

  return { nodes, adj };
}
