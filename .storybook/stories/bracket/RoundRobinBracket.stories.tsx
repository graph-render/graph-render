import type { RoundRobinMatch } from '@graph-render/tournament-tree';
import {
  generateRoundRobinSchedule,
  MatchStatus,
  RoundRobinBracket,
} from '@graph-render/tournament-tree';
import type { Meta, StoryObj } from '@storybook/react';

const participants = [
  { name: 'Nour El Sherbini', seed: 1, country: 'EGY' },
  { name: 'Amanda Sobhy', seed: 2, country: 'USA' },
  { name: 'Joelle King', seed: 3, country: 'NZL' },
  { name: 'Camille Serme', seed: 4, country: 'FRA' },
];

const generatedSchedule = generateRoundRobinSchedule(participants);
const matches: readonly RoundRobinMatch[] = generatedSchedule.map((match) => {
  if (match.id === 'rr-r1-m1') {
    return { ...match, scores: [2, 0], status: MatchStatus.Completed };
  }
  if (match.id === 'rr-r1-m2') {
    return { ...match, scores: [1, 1], status: MatchStatus.Completed };
  }
  return match;
});

const meta: Meta<typeof RoundRobinBracket> = {
  title: 'Tournament/Round Robin',
  component: RoundRobinBracket,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    compact: false,
    groupName: 'Group A',
    matches,
    participants,
    points: { draw: 1, loss: 0, win: 3 },
    title: 'World Championship Group Stage',
  },
};

export default meta;

type Story = StoryObj<typeof RoundRobinBracket>;

export const GroupStage: Story = {
  name: 'Group stage — standings and schedule',
};
