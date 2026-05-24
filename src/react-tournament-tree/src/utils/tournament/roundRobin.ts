import {
  type MatchPlayer,
  MatchStatus,
  type RoundRobinMatch,
  type RoundRobinPointsRule,
  type RoundRobinStanding,
} from '@graph-render/types/tournament';

import type { TournamentParticipantInput } from './singleElimination';

export type {
  RoundRobinGroup,
  RoundRobinMatch,
  RoundRobinPointsRule,
  RoundRobinStanding,
} from '@graph-render/types/tournament';

interface ResolvedRoundRobinPointsRule {
  readonly draw: number;
  readonly loss: number;
  readonly win: number;
}

const DEFAULT_POINTS: ResolvedRoundRobinPointsRule = {
  draw: 1,
  loss: 0,
  win: 3,
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

const normalizeParticipants = (
  participants: readonly TournamentParticipantInput[]
): MatchPlayer[] => {
  if (participants.length < 2) {
    throw new RangeError('Round-robin groups require at least two participants.');
  }

  return participants.map(normalizeParticipant);
};

const playerKey = (player: MatchPlayer): string =>
  (player.id?.trim() || player.name.trim()).toLocaleLowerCase();

const createByePlayer = (): MatchPlayer => ({ name: 'BYE', isBye: true });

const rotateEntrants = (entrants: readonly MatchPlayer[]): MatchPlayer[] => {
  const [fixed, ...rest] = entrants;
  const last = rest.at(-1);
  const middle = rest.slice(0, -1);

  return fixed && last ? [fixed, last, ...middle] : [...entrants];
};

const resolvePoints = (points: RoundRobinPointsRule | undefined): ResolvedRoundRobinPointsRule => ({
  draw: points?.draw ?? DEFAULT_POINTS.draw,
  loss: points?.loss ?? DEFAULT_POINTS.loss,
  win: points?.win ?? DEFAULT_POINTS.win,
});

const assertScore = (score: number, label: string): number => {
  if (!Number.isFinite(score) || score < 0) {
    throw new TypeError(`${label} must be a non-negative finite score.`);
  }

  return score;
};

export function generateRoundRobinSchedule(
  participantsInput: readonly TournamentParticipantInput[]
): readonly RoundRobinMatch[] {
  const participants = normalizeParticipants(participantsInput);
  let entrants =
    participants.length % 2 === 0 ? participants : [...participants, createByePlayer()];
  const roundCount = entrants.length - 1;
  const halfSize = entrants.length / 2;
  const matches: RoundRobinMatch[] = [];

  for (let round = 1; round <= roundCount; round += 1) {
    let matchInRound = 1;
    for (let index = 0; index < halfSize; index += 1) {
      const playerOne = entrants[index];
      const playerTwo = entrants[entrants.length - 1 - index];
      if (!playerOne || !playerTwo || playerOne.isBye || playerTwo.isBye) {
        continue;
      }

      const players =
        round % 2 === 0 ? ([playerTwo, playerOne] as const) : ([playerOne, playerTwo] as const);
      matches.push({
        id: `rr-r${round}-m${matchInRound}`,
        players,
        round,
        status: MatchStatus.Upcoming,
      });
      matchInRound += 1;
    }

    entrants = rotateEntrants(entrants);
  }

  return matches;
}

export function groupRoundRobinMatchesByRound(
  matches: readonly RoundRobinMatch[]
): ReadonlyArray<{ readonly round: number; readonly matches: readonly RoundRobinMatch[] }> {
  const grouped = new Map<number, RoundRobinMatch[]>();
  for (const match of matches) {
    const group = grouped.get(match.round) ?? [];
    group.push(match);
    grouped.set(match.round, group);
  }

  return [...grouped.entries()]
    .sort(([roundA], [roundB]) => roundA - roundB)
    .map(([round, roundMatches]) => ({
      matches: [...roundMatches].sort((a, b) => a.id.localeCompare(b.id)),
      round,
    }));
}

export function calculateRoundRobinStandings(
  participantsInput: readonly TournamentParticipantInput[],
  matches: readonly RoundRobinMatch[],
  points?: RoundRobinPointsRule
): readonly RoundRobinStanding[] {
  const participants = normalizeParticipants(participantsInput);
  const resolvedPoints = resolvePoints(points);
  const standings = new Map<string, RoundRobinStanding>(
    participants.map((player) => [
      playerKey(player),
      {
        draws: 0,
        losses: 0,
        played: 0,
        player,
        points: 0,
        scoreAgainst: 0,
        scoreDifference: 0,
        scoreFor: 0,
        wins: 0,
      },
    ])
  );

  const updateStanding = (
    player: MatchPlayer,
    scoreFor: number,
    scoreAgainst: number,
    outcome: 'draw' | 'loss' | 'win'
  ) => {
    const key = playerKey(player);
    const standing = standings.get(key);
    if (!standing) {
      throw new RangeError(`Round-robin match references unknown participant "${player.name}".`);
    }

    const wins = standing.wins + (outcome === 'win' ? 1 : 0);
    const draws = standing.draws + (outcome === 'draw' ? 1 : 0);
    const losses = standing.losses + (outcome === 'loss' ? 1 : 0);
    const nextScoreFor = standing.scoreFor + scoreFor;
    const nextScoreAgainst = standing.scoreAgainst + scoreAgainst;

    standings.set(key, {
      ...standing,
      draws,
      losses,
      played: standing.played + 1,
      points:
        standing.points +
        (outcome === 'win'
          ? resolvedPoints.win
          : outcome === 'draw'
            ? resolvedPoints.draw
            : resolvedPoints.loss),
      scoreAgainst: nextScoreAgainst,
      scoreDifference: nextScoreFor - nextScoreAgainst,
      scoreFor: nextScoreFor,
      wins,
    });
  };

  for (const match of matches) {
    if (match.status !== MatchStatus.Completed || !match.scores) {
      continue;
    }

    const [playerOne, playerTwo] = match.players;
    if (playerOne.isBye || playerTwo.isBye) {
      continue;
    }

    const scoreOne = assertScore(match.scores[0], `${match.id}.scores[0]`);
    const scoreTwo = assertScore(match.scores[1], `${match.id}.scores[1]`);
    const outcomeOne = scoreOne === scoreTwo ? 'draw' : scoreOne > scoreTwo ? 'win' : 'loss';
    const outcomeTwo = scoreOne === scoreTwo ? 'draw' : scoreTwo > scoreOne ? 'win' : 'loss';

    updateStanding(playerOne, scoreOne, scoreTwo, outcomeOne);
    updateStanding(playerTwo, scoreTwo, scoreOne, outcomeTwo);
  }

  return [...standings.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.scoreDifference !== a.scoreDifference) return b.scoreDifference - a.scoreDifference;
    if (b.scoreFor !== a.scoreFor) return b.scoreFor - a.scoreFor;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.player.name.localeCompare(b.player.name);
  });
}
