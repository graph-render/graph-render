import {
  type MatchPlayer,
  MatchStatus,
  type SwissMatch,
  type SwissPointsRule,
  type SwissStanding,
} from '@graph-render/types/tournament';

import type { TournamentParticipantInput } from './singleElimination';

export type { SwissMatch, SwissPointsRule, SwissStanding } from '@graph-render/types/tournament';

// ── Helpers ──────────────────────────────────────────────────────────────────

const normalizeParticipant = (
  participant: TournamentParticipantInput,
  index: number
): MatchPlayer => {
  if (typeof participant === 'string') {
    const name = participant.trim();
    if (!name) throw new TypeError(`participants[${index}] must be a non-empty string.`);
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

// ── Helpers ──────────────────────────────────────────────────────────────────

interface ResolvedSwissPointsRule {
  readonly win: number;
  readonly draw: number;
  readonly loss: number;
}

const DEFAULT_POINTS: ResolvedSwissPointsRule = { draw: 0.5, loss: 0, win: 1 };

const resolvePoints = (points: SwissPointsRule | undefined): ResolvedSwissPointsRule => ({
  draw: points?.draw ?? DEFAULT_POINTS.draw,
  loss: points?.loss ?? DEFAULT_POINTS.loss,
  win: points?.win ?? DEFAULT_POINTS.win,
});

const playerKey = (player: { readonly id?: string | undefined; name: string }): string =>
  (player.id?.trim() || player.name.trim()).toLocaleLowerCase();

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Groups Swiss matches by round number, sorted ascending.
 */
export function groupSwissMatchesByRound(
  matches: readonly SwissMatch[]
): ReadonlyArray<{ readonly round: number; readonly matches: readonly SwissMatch[] }> {
  const grouped = new Map<number, SwissMatch[]>();
  for (const match of matches) {
    const group = grouped.get(match.round) ?? [];
    group.push(match);
    grouped.set(match.round, group);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([round, roundMatches]) => ({
      matches: [...roundMatches].sort((a, b) => a.id.localeCompare(b.id)),
      round,
    }));
}

/**
 * Computes Swiss-system standings from a participant list and completed matches.
 *
 * Standings are sorted by:
 *   1. Points (descending)
 *   2. Buchholz (sum of opponents' points, descending)
 *   3. Sonneborn-Berger (sum of defeated/drawn opponents' points, descending)
 *   4. Name (ascending, for deterministic output)
 *
 * @param participantsInput - All registered participants.
 * @param matches           - All pairings, including upcoming ones.
 * @param points            - Custom point values. Defaults: win=1, draw=0.5, loss=0.
 */
export function calculateSwissStandings(
  participantsInput: readonly TournamentParticipantInput[],
  matches: readonly SwissMatch[],
  points?: SwissPointsRule
): readonly SwissStanding[] {
  if (participantsInput.length < 2) {
    throw new RangeError('Swiss tournaments require at least two participants.');
  }

  const participants = participantsInput.map((p, i) => normalizeParticipant(p, i));
  const resolved = resolvePoints(points);

  // Phase 1: tally wins/draws/losses/points for each participant.
  interface MutableStanding {
    wins: number;
    draws: number;
    losses: number;
    played: number;
    points: number;
  }

  const tally = new Map<string, MutableStanding>(
    participants.map((p) => [playerKey(p), { draws: 0, losses: 0, played: 0, points: 0, wins: 0 }])
  );

  for (const match of matches) {
    if (match.status !== MatchStatus.Completed || !match.scores) continue;

    const [p1, p2] = match.players;
    const [s1, s2] = match.scores;

    const k1 = playerKey(p1);
    const k2 = playerKey(p2);

    const t1 = tally.get(k1);
    const t2 = tally.get(k2);

    if (!t1) {
      throw new RangeError(
        `Swiss match "${match.id}" references unknown participant "${p1.name}".`
      );
    }
    if (!t2) {
      throw new RangeError(
        `Swiss match "${match.id}" references unknown participant "${p2.name}".`
      );
    }

    if (s1 > s2) {
      t1.wins += 1;
      t1.points += resolved.win;
      t2.losses += 1;
      t2.points += resolved.loss;
    } else if (s2 > s1) {
      t2.wins += 1;
      t2.points += resolved.win;
      t1.losses += 1;
      t1.points += resolved.loss;
    } else {
      t1.draws += 1;
      t1.points += resolved.draw;
      t2.draws += 1;
      t2.points += resolved.draw;
    }

    t1.played += 1;
    t2.played += 1;
  }

  // Phase 2: compute Buchholz and Sonneborn-Berger using tallied points.
  return participants
    .map((player) => {
      const key = playerKey(player);
      const standing = tally.get(key)!;

      let buchholz = 0;
      let sonnebornBerger = 0;

      for (const match of matches) {
        if (match.status !== MatchStatus.Completed || !match.scores) continue;

        const [p1, p2] = match.players;
        const [s1, s2] = match.scores;

        const k1 = playerKey(p1);
        const k2 = playerKey(p2);

        let opponentKey: string | undefined;
        let outcomeForPlayer: 'win' | 'draw' | 'loss' | undefined;

        if (k1 === key) {
          opponentKey = k2;
          outcomeForPlayer = s1 > s2 ? 'win' : s1 < s2 ? 'loss' : 'draw';
        } else if (k2 === key) {
          opponentKey = k1;
          outcomeForPlayer = s2 > s1 ? 'win' : s2 < s1 ? 'loss' : 'draw';
        }

        if (opponentKey && outcomeForPlayer) {
          const opponentTally = tally.get(opponentKey);
          if (opponentTally) {
            buchholz += opponentTally.points;
            if (outcomeForPlayer === 'win') sonnebornBerger += opponentTally.points;
            else if (outcomeForPlayer === 'draw') sonnebornBerger += opponentTally.points / 2;
          }
        }
      }

      return {
        buchholz,
        draws: standing.draws,
        losses: standing.losses,
        played: standing.played,
        player,
        points: standing.points,
        sonnebornBerger,
        wins: standing.wins,
      } satisfies SwissStanding;
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;
      if (b.sonnebornBerger !== a.sonnebornBerger) return b.sonnebornBerger - a.sonnebornBerger;
      return a.player.name.localeCompare(b.player.name);
    });
}
