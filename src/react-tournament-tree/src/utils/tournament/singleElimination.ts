import type { NxGraphInput, NxNodeAttrs } from '@graph-render/types';
import type { MatchMeta, MatchPlayer } from '@graph-render/types/tournament';

export type TournamentParticipantInput = string | MatchPlayer;

export type SingleEliminationSeeding = 'manual' | 'none' | 'random' | 'standard';

export interface SingleEliminationBracketOptions {
  readonly seeded?: boolean | undefined;
  readonly seeding?: SingleEliminationSeeding | undefined;
  readonly seedOrder?: readonly number[] | undefined;
  readonly shuffle?: ((participants: readonly MatchPlayer[]) => readonly MatchPlayer[]) | undefined;
  readonly includeThirdPlace?: boolean | undefined;
  readonly thirdPlaceLabel?: string | undefined;
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

const createByePlayer = (byeLabel: string): MatchPlayer => ({ name: byeLabel, isBye: true });

const seedParticipants = (
  participants: readonly MatchPlayer[],
  options: SingleEliminationBracketOptions,
  slotCount: number,
  byeLabel: string
): readonly MatchPlayer[] => {
  const appendByes = (drawnParticipants: readonly MatchPlayer[]) => [
    ...drawnParticipants,
    ...Array.from({ length: slotCount - drawnParticipants.length }, () =>
      createByePlayer(byeLabel)
    ),
  ];
  const seeding = options.seeding ?? (options.seeded ? 'standard' : 'none');

  if (seeding === 'none') {
    return appendByes(participants);
  }

  if (seeding === 'random') {
    const shuffled = options.shuffle
      ? options.shuffle(participants)
      : [...participants].sort(() => Math.random() - 0.5);
    if (shuffled.length !== participants.length) {
      throw new TypeError('shuffle must return the same number of participants.');
    }
    return appendByes(shuffled);
  }

  if (seeding === 'manual') {
    return appendByes(applyManualSeedOrder(participants, options.seedOrder));
  }

  return applyStandardSeedOrder(participants, slotCount, byeLabel);
};

const sortBySeed = (participants: readonly MatchPlayer[]): readonly MatchPlayer[] =>
  [...participants].sort((a, b) => {
    const seedA = a.seed ?? Number.MAX_SAFE_INTEGER;
    const seedB = b.seed ?? Number.MAX_SAFE_INTEGER;
    if (seedA !== seedB) return seedA - seedB;
    return a.name.localeCompare(b.name);
  });

const buildStandardSeedOrder = (slotCount: number): readonly number[] => {
  let order = [1, 2];
  while (order.length < slotCount) {
    const size = order.length * 2;
    order = order.flatMap((seed) => [seed, size + 1 - seed]);
  }
  return order;
};

const applyStandardSeedOrder = (
  participants: readonly MatchPlayer[],
  slotCount: number,
  byeLabel: string
): readonly MatchPlayer[] => {
  const sorted = sortBySeed(participants);
  const slots = new Array<MatchPlayer | undefined>(slotCount);
  const order = buildStandardSeedOrder(slotCount);

  for (let rank = 1; rank <= sorted.length; rank += 1) {
    const slotIndex = order.indexOf(rank);
    const participant = sorted[rank - 1];
    if (slotIndex >= 0 && participant) {
      slots[slotIndex] = participant;
    }
  }

  return Array.from({ length: slotCount }, (_, index) => slots[index] ?? createByePlayer(byeLabel));
};

const applyManualSeedOrder = (
  participants: readonly MatchPlayer[],
  seedOrder: readonly number[] | undefined
): readonly MatchPlayer[] => {
  if (!seedOrder) {
    throw new TypeError('seedOrder is required when seeding is manual.');
  }
  if (seedOrder.length !== participants.length) {
    throw new TypeError('seedOrder must contain exactly one entry per participant.');
  }

  const sorted = sortBySeed(participants);
  const seen = new Set<number>();
  return seedOrder.map((seedRank, index) => {
    if (!Number.isInteger(seedRank) || seedRank < 1 || seedRank > participants.length) {
      throw new RangeError(`seedOrder[${index}] must reference an existing participant seed rank.`);
    }
    if (seen.has(seedRank)) {
      throw new TypeError(`seedOrder[${index}] duplicates seed rank ${seedRank}.`);
    }
    seen.add(seedRank);

    const participant = sorted[seedRank - 1];
    if (!participant) {
      throw new RangeError(`seedOrder[${index}] must reference an existing participant seed rank.`);
    }

    return participant;
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

const isByePlayer = (player: MatchPlayer): boolean => player.isBye === true;

const getByeWinner = (playerOne: MatchPlayer, playerTwo: MatchPlayer): MatchPlayer | undefined => {
  if (isByePlayer(playerOne) && !isByePlayer(playerTwo)) return playerTwo;
  if (isByePlayer(playerTwo) && !isByePlayer(playerOne)) return playerOne;
  return undefined;
};

export function generateSingleEliminationBracket(
  participantsInput: readonly TournamentParticipantInput[],
  options: SingleEliminationBracketOptions = {}
): SingleEliminationGraph {
  const participants = participantsInput.map(normalizeParticipant);
  const slotCount = nextPowerOfTwo(participants.length);
  const roundCount = Math.log2(slotCount);
  const byeLabel = options.byeLabel?.trim() || DEFAULT_BYE_LABEL;
  const slots = seedParticipants(participants, options, slotCount, byeLabel);
  const nodes: NonNullable<SingleEliminationGraph['nodes']> = {};
  const adj: SingleEliminationGraph['adj'] = {};
  const rounds: string[][] = [];
  let advancingPlayers = new Map<string, MatchPlayer>();

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
        const byeWinner = getByeWinner(playerOne, playerTwo);
        if (byeWinner) {
          advancingPlayers.set(id, byeWinner);
        }
        nodes[id] = createNode({
          stage,
          matchType: byeWinner ? 'bye' : 'standard',
          status: byeWinner
            ? ('completed' as MatchMeta['status'])
            : ('upcoming' as MatchMeta['status']),
          players: [playerOne, playerTwo],
        });
        continue;
      }

      const sourceOne = rounds[roundIndex - 1]?.[matchIndex * 2];
      const sourceTwo = rounds[roundIndex - 1]?.[matchIndex * 2 + 1];
      const playerOne = (sourceOne && advancingPlayers.get(sourceOne)) || TBD_PLAYER;
      const playerTwo = (sourceTwo && advancingPlayers.get(sourceTwo)) || TBD_PLAYER;
      nodes[id] = createNode({ stage, players: [playerOne, playerTwo] });
    }

    rounds.push(roundMatchIds);

    if (roundIndex > 0) {
      advancingPlayers = new Map<string, MatchPlayer>();
    }
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
    const thirdPlaceLabel = options.thirdPlaceLabel?.trim() || 'Third Place';
    nodes['third-place'] = createNode({
      stage: thirdPlaceLabel,
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
