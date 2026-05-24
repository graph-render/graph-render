import type { RoundRobinGroup } from '@graph-render/tournament-tree';
import {
  buildKnockoutBracketFromGroups,
  MatchStatus,
  MultiStageTournament,
} from '@graph-render/tournament-tree';
import type { Meta, StoryObj } from '@storybook/react';

const createGroup = (id: string, names: readonly string[]): RoundRobinGroup => {
  const participants = names.map((name) => ({ name }));

  return {
    id,
    matches: [
      {
        id: `${id}-m1`,
        players: [participants[0], participants[1]],
        round: 1,
        scores: [2, 0],
        status: MatchStatus.Completed,
      },
      {
        id: `${id}-m2`,
        players: [participants[2], participants[3]],
        round: 1,
        scores: [1, 2],
        status: MatchStatus.Completed,
      },
    ],
    name: `Group ${id.toUpperCase()}`,
    participants,
  };
};

const groups = [
  createGroup('a', ['Alpha', 'Bravo', 'Charlie', 'Delta']),
  createGroup('b', ['Echo', 'Foxtrot', 'Golf', 'Hotel']),
];

const semifinalBracket = buildKnockoutBracketFromGroups(groups, {
  advancement: { topPerGroup: 2 },
  thirdPlaceLabel: 'Bronze Match',
});

const meta: Meta<typeof MultiStageTournament> = {
  title: 'Tournament/Multi Stage',
  component: MultiStageTournament,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    compact: true,
    stages: [
      {
        advancement: { topPerGroup: 2 },
        groups,
        name: 'Groups',
        type: 'groups',
      },
      {
        bracket: semifinalBracket,
        name: 'Semifinals',
        type: 'elimination',
      },
    ],
    title: 'Groups to Knockout',
  },
};

export default meta;

type Story = StoryObj<typeof MultiStageTournament>;

export const TwoGroupsToSemifinals: Story = {
  name: 'Two groups to semifinals',
};
