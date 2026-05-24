import type {
  EliminationFormat,
  GroupAdvancementRule,
  MatchPlayer,
  RoundRobinGroup,
} from '@graph-render/types/tournament';

import type { DoubleEliminationGraph } from './doubleElimination';
import { generateDoubleEliminationBracket } from './doubleElimination';
import { calculateRoundRobinStandings } from './roundRobin';
import type { SingleEliminationBracketOptions, SingleEliminationGraph } from './singleElimination';
import { generateSingleEliminationBracket } from './singleElimination';

export type { EliminationFormat, GroupAdvancementRule } from '@graph-render/types/tournament';

export interface BuildKnockoutFromGroupsOptions extends SingleEliminationBracketOptions {
  readonly advancement?: GroupAdvancementRule | undefined;
  readonly format?: EliminationFormat | undefined;
  readonly includeBracketReset?: boolean | undefined;
}

export function calculateGroupAdvancers(
  groups: readonly RoundRobinGroup[],
  rule: GroupAdvancementRule = {}
): readonly MatchPlayer[] {
  if (rule.manualAdvancers) {
    return rule.manualAdvancers;
  }

  const topPerGroup = rule.topPerGroup ?? 1;
  if (!Number.isInteger(topPerGroup) || topPerGroup < 1) {
    throw new RangeError('topPerGroup must be a positive integer.');
  }

  return groups.flatMap((group) =>
    calculateRoundRobinStandings(group.participants, group.matches, group.points)
      .slice(0, topPerGroup)
      .map((standing) => standing.player)
  );
}

export function buildKnockoutBracketFromGroups(
  groups: readonly RoundRobinGroup[],
  options: BuildKnockoutFromGroupsOptions = {}
): SingleEliminationGraph | DoubleEliminationGraph {
  const advancers = calculateGroupAdvancers(groups, options.advancement);
  if (advancers.length < 2) {
    throw new RangeError('At least two advanced participants are required for a knockout bracket.');
  }

  if (options.format === 'double') {
    return generateDoubleEliminationBracket(advancers, {
      includeBracketReset: options.includeBracketReset,
    });
  }

  return generateSingleEliminationBracket(advancers, options);
}
