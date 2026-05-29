import { type MatchPlayer, MatchStatus, type PlacementMatch } from '@graph-render/types/tournament';

import type { TournamentParticipantInput } from './singleElimination';

export type { PlacementMatch };

export interface PlacementTierInput {
  /** Players competing in this tier (must be a power of 2, min 2). */
  readonly participants: readonly TournamentParticipantInput[];
  /** The lowest placement rank being decided in this tier (e.g. 5 for 5th–8th). */
  readonly startingPlacement: number;
  /** Per-placement custom labels (key = placement number, e.g. { 5: 'Bronze' }). */
  readonly labels?: Partial<Record<number, string>> | undefined;
}

const ORDINAL_SUFFIXES = ['th', 'st', 'nd', 'rd'] as const;

/** Returns the ordinal suffix for a positive integer (1 → "st", 2 → "nd", …). */
function ordinalSuffix(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  const mod10 = n % 10;
  return ORDINAL_SUFFIXES[mod10] ?? 'th';
}

/** Resolves a human-readable placement label (e.g. "5th Place"). */
export function resolvePlacementLabel(placement: number, customLabel?: string): string {
  if (customLabel) return customLabel;
  return `${placement}${ordinalSuffix(placement)} Place`;
}

const isPowerOfTwo = (n: number): boolean => n > 0 && (n & (n - 1)) === 0;

const normalizeParticipant = (p: TournamentParticipantInput, index: number): MatchPlayer => {
  if (typeof p === 'string') {
    const name = p.trim();
    if (!name) throw new TypeError(`participants[${index}] must be a non-empty string.`);
    return { name };
  }
  if (!p || typeof p !== 'object')
    throw new TypeError(`participants[${index}] must be a string or MatchPlayer object.`);
  if (typeof p.name !== 'string' || !p.name.trim())
    throw new TypeError(`participants[${index}].name must be a non-empty string.`);
  return { ...p, name: p.name.trim() };
};

/**
 * Generates placement matches for one or more placement tiers.
 *
 * Each tier with N participants (power of 2, ≥ 2) produces a mini
 * single-elimination bracket that determines ranks startingPlacement through
 * startingPlacement + N - 1.
 *
 * Example: 4 participants with startingPlacement=5 → matches for 5th–8th
 * (2 semi-final matches in round 1, then a 5th-place final + 7th-place final in round 2).
 */
export function generatePlacementMatches(
  tiers: readonly PlacementTierInput[]
): readonly PlacementMatch[] {
  const result: PlacementMatch[] = [];

  for (const tier of tiers) {
    const players = tier.participants.map(normalizeParticipant);
    const n = players.length;

    if (n < 2) throw new RangeError('Each placement tier requires at least 2 participants.');
    if (!isPowerOfTwo(n))
      throw new RangeError(`Placement tier participants count must be a power of 2 (got ${n}).`);

    const tierMatches = buildTierMatches(players, tier.startingPlacement, tier.labels ?? {});
    result.push(...tierMatches);
  }

  return result;
}

/**
 * Builds all matches for a single placement tier with a power-of-two player list.
 * Round 1 = outermost matches (most players); final round = placement finals.
 */
function buildTierMatches(
  players: readonly MatchPlayer[],
  startingPlacement: number,
  labels: Partial<Record<number, string>>
): PlacementMatch[] {
  const matches: PlacementMatch[] = [];
  const n = players.length;
  const roundCount = Math.log2(n); // e.g. 4 players → 2 rounds
  // Match count per round is constant: N/2.
  // Each match produces a winner slot and a loser slot, so currentSlots stays N.
  const matchesPerRound = n / 2;

  // Track which slots hold which players for each round (always N slots).
  let currentSlots: readonly MatchPlayer[] = players;

  for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
    const round = roundIndex + 1;
    const isLastRound = roundIndex === roundCount - 1;
    const nextWinnerSlots: MatchPlayer[] = [];
    const nextLoserSlots: MatchPlayer[] = [];

    for (let matchIndex = 0; matchIndex < matchesPerRound; matchIndex += 1) {
      const playerOne = currentSlots[matchIndex * 2]!;
      const playerTwo = currentSlots[matchIndex * 2 + 1]!;

      // slotWidth = 2 always (each match pair covers 2 placements).
      const placement = startingPlacement + matchIndex * 2;

      const customLabel = labels[placement];
      const id = `p${startingPlacement}-r${round}-m${matchIndex + 1}`;

      matches.push({
        id,
        round,
        placement,
        players: [playerOne, playerTwo],
        status: MatchStatus.Upcoming,
        ...(customLabel ? { label: customLabel } : {}),
      });

      // Both winner and loser advance to the next round.
      if (!isLastRound) {
        nextWinnerSlots.push({ name: 'TBD' });
        nextLoserSlots.push({ name: 'TBD' });
      }
    }

    if (!isLastRound) {
      // Winners play winners, losers play losers in the next round.
      currentSlots = [...nextWinnerSlots, ...nextLoserSlots];
    }
  }

  return matches;
}

/**
 * Groups placement matches by their `startingPlacement` tier.
 * Returns a Map keyed by the lowest placement number in each tier.
 */
export function groupPlacementMatchesByTier(
  matches: readonly PlacementMatch[]
): Map<number, readonly PlacementMatch[]> {
  const tierMap = new Map<number, PlacementMatch[]>();

  for (const match of matches) {
    // The tier key is the minimum placement for that tier.
    // We find it as: startingPlacement is the first match's placement in the tier.
    // Grouping by the minimum placement across all rounds for this tier:
    // Since placement values within a tier all share the same "base" (startingPlacement),
    // we derive the tier key from the match id prefix.
    const tierKey = extractTierKey(match);
    let group = tierMap.get(tierKey);
    if (!group) {
      group = [];
      tierMap.set(tierKey, group);
    }
    group.push(match);
  }

  return tierMap;
}

/** Extracts the startingPlacement from a match ID like "p5-r1-m1" → 5. */
function extractTierKey(match: PlacementMatch): number {
  const idMatch = /^p(\d+)-/.exec(match.id);
  if (idMatch?.[1]) return Number(idMatch[1]);
  // Fallback: use the match's own placement (works for 2-player tiers)
  return match.placement;
}

/**
 * Groups placement matches within a given tier by round number.
 * Returns a Map keyed by round (1 = outermost, ascending).
 */
export function groupPlacementMatchesByRound(
  matches: readonly PlacementMatch[],
  startingPlacement: number
): Map<number, readonly PlacementMatch[]> {
  const tierMatches = matches.filter((m) => extractTierKey(m) === startingPlacement);
  const roundMap = new Map<number, PlacementMatch[]>();

  for (const match of tierMatches) {
    let group = roundMap.get(match.round);
    if (!group) {
      group = [];
      roundMap.set(match.round, group);
    }
    group.push(match);
  }

  return roundMap;
}
