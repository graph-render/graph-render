import type { PlacementMatch } from '@graph-render/tournament-tree';
import {
  generatePlacementMatches,
  MatchStatus,
  PlacementBracket,
} from '@graph-render/tournament-tree';
import type { Meta, StoryObj } from '@storybook/react';

const participants = ['Alice', 'Bob', 'Carol', 'Dave'];

const upcomingMatches = generatePlacementMatches([{ participants, startingPlacement: 5 }]);

const completedMatches: readonly PlacementMatch[] = [
  {
    id: 'p5-r1-m1',
    round: 1,
    placement: 5,
    players: [{ name: 'Alice' }, { name: 'Bob' }],
    scores: [2, 1],
    status: MatchStatus.Completed,
  },
  {
    id: 'p5-r1-m2',
    round: 1,
    placement: 7,
    players: [{ name: 'Carol' }, { name: 'Dave' }],
    scores: [0, 2],
    status: MatchStatus.Completed,
  },
  {
    id: 'p5-r2-m1',
    round: 2,
    placement: 5,
    players: [{ name: 'Alice' }, { name: 'Dave' }],
    scores: [3, 1],
    status: MatchStatus.Completed,
  },
  {
    id: 'p5-r2-m2',
    round: 2,
    placement: 7,
    players: [{ name: 'Bob' }, { name: 'Carol' }],
    scores: [1, 2],
    status: MatchStatus.Completed,
  },
];

const multiTierMatches: readonly PlacementMatch[] = [
  ...generatePlacementMatches([{ participants: ['Eve', 'Frank'], startingPlacement: 3 }]),
  ...upcomingMatches,
];

const meta: Meta<typeof PlacementBracket> = {
  title: 'Tournament/Placement Bracket',
  component: PlacementBracket,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    compact: false,
    matches: upcomingMatches,
    participants,
    title: 'Placement Bracket',
  },
};

export default meta;

type Story = StoryObj<typeof PlacementBracket>;

export const EightPlayer: Story = {
  name: '5th–8th place bracket — upcoming matches',
};

export const WithResults: Story = {
  name: 'With completed results',
  args: {
    matches: completedMatches,
    title: '5th–8th Place',
  },
};

export const MultiTier: Story = {
  name: 'Multi-tier (3rd + 5th–8th)',
  args: {
    matches: multiTierMatches,
    title: 'Bronze & Placement',
  },
};

export const CustomLabels: Story = {
  name: 'Custom placement labels',
  args: {
    matches: generatePlacementMatches([
      {
        participants,
        startingPlacement: 5,
        labels: { 5: 'Bronze Final', 7: 'Consolation Final' },
      },
    ]),
    title: 'Custom Labels',
  },
};

export const DarkMode: Story = {
  name: 'Dark mode',
  args: {
    isDarkMode: true,
    matches: completedMatches,
    title: 'Dark Mode Placement',
  },
};

export const Compact: Story = {
  name: 'Compact layout',
  args: {
    compact: true,
    matches: upcomingMatches,
    title: 'Compact Placement',
  },
};
