import type { SwissMatch } from '@graph-render/tournament-tree';
import { MatchStatus, SwissBracket } from '@graph-render/tournament-tree';
import type { Meta, StoryObj } from '@storybook/react';

const participants = [
  { name: 'Magnus Carlsen', seed: 1, country: 'NOR' },
  { name: 'Fabiano Caruana', seed: 2, country: 'USA' },
  { name: 'Ding Liren', seed: 3, country: 'CHN' },
  { name: 'Ian Nepomniachtchi', seed: 4, country: 'RUS' },
  { name: 'Anish Giri', seed: 5, country: 'NED' },
  { name: 'Levon Aronian', seed: 6, country: 'ARM' },
];

// Manual pairings for a 5-round Swiss event.
const matches: readonly SwissMatch[] = [
  // Round 1
  {
    id: 'r1-m1',
    players: [{ name: 'Magnus Carlsen' }, { name: 'Levon Aronian' }],
    round: 1,
    scores: [1, 0],
    status: MatchStatus.Completed,
  },
  {
    id: 'r1-m2',
    players: [{ name: 'Fabiano Caruana' }, { name: 'Anish Giri' }],
    round: 1,
    scores: [0, 0],
    status: MatchStatus.Completed,
  },
  {
    id: 'r1-m3',
    players: [{ name: 'Ding Liren' }, { name: 'Ian Nepomniachtchi' }],
    round: 1,
    scores: [0, 1],
    status: MatchStatus.Completed,
  },
  // Round 2
  {
    id: 'r2-m1',
    players: [{ name: 'Ian Nepomniachtchi' }, { name: 'Magnus Carlsen' }],
    round: 2,
    scores: [0, 1],
    status: MatchStatus.Completed,
  },
  {
    id: 'r2-m2',
    players: [{ name: 'Anish Giri' }, { name: 'Ding Liren' }],
    round: 2,
    scores: [0, 0],
    status: MatchStatus.Completed,
  },
  {
    id: 'r2-m3',
    players: [{ name: 'Levon Aronian' }, { name: 'Fabiano Caruana' }],
    round: 2,
    scores: [0, 1],
    status: MatchStatus.Completed,
  },
  // Round 3
  {
    id: 'r3-m1',
    players: [{ name: 'Magnus Carlsen' }, { name: 'Fabiano Caruana' }],
    round: 3,
    scores: [1, 0],
    status: MatchStatus.Completed,
  },
  {
    id: 'r3-m2',
    players: [{ name: 'Ian Nepomniachtchi' }, { name: 'Anish Giri' }],
    round: 3,
    scores: [1, 0],
    status: MatchStatus.Completed,
  },
  {
    id: 'r3-m3',
    players: [{ name: 'Ding Liren' }, { name: 'Levon Aronian' }],
    round: 3,
    scores: [1, 0],
    status: MatchStatus.Completed,
  },
  // Round 4
  {
    id: 'r4-m1',
    players: [{ name: 'Magnus Carlsen' }, { name: 'Ding Liren' }],
    round: 4,
    scores: [1, 0],
    status: MatchStatus.Completed,
  },
  {
    id: 'r4-m2',
    players: [{ name: 'Ian Nepomniachtchi' }, { name: 'Fabiano Caruana' }],
    round: 4,
    scores: [0, 0],
    status: MatchStatus.Completed,
  },
  {
    id: 'r4-m3',
    players: [{ name: 'Anish Giri' }, { name: 'Levon Aronian' }],
    round: 4,
    scores: [1, 0],
    status: MatchStatus.Completed,
  },
  // Round 5
  {
    id: 'r5-m1',
    players: [{ name: 'Magnus Carlsen' }, { name: 'Ian Nepomniachtchi' }],
    round: 5,
    status: MatchStatus.Upcoming,
  },
  {
    id: 'r5-m2',
    players: [{ name: 'Fabiano Caruana' }, { name: 'Ding Liren' }],
    round: 5,
    status: MatchStatus.Upcoming,
  },
  {
    id: 'r5-m3',
    players: [{ name: 'Anish Giri' }, { name: 'Levon Aronian' }],
    round: 5,
    status: MatchStatus.Upcoming,
  },
];

const meta: Meta<typeof SwissBracket> = {
  title: 'Tournament/Swiss',
  component: SwissBracket,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    compact: false,
    groupName: 'Open',
    matches,
    participants,
    points: { draw: 0.5, loss: 0, win: 1 },
    title: 'World Chess Championship — Swiss',
  },
};

export default meta;

type Story = StoryObj<typeof SwissBracket>;

/** Full 5-round Swiss with standings, Buchholz, and Sonneborn-Berger tiebreakers. */
export const FiveRounds: Story = {
  name: 'Five-round Swiss — standings + schedule',
};

/** Chess uses 1/0.5/0. Esports might prefer 3/1/0. */
export const CustomPoints: Story = {
  name: 'Custom points (esports: 3/1/0)',
  args: {
    points: { win: 3, draw: 1, loss: 0 },
    title: 'Esports Swiss — 3/1/0 Points',
  },
};

export const NoMatchesYet: Story = {
  name: 'No pairings yet',
  args: {
    matches: undefined,
    title: 'Swiss — Pairings Pending',
  },
};

export const DarkMode: Story = {
  name: 'Dark mode',
  args: {
    isDarkMode: true,
  },
};

export const Compact: Story = {
  name: 'Compact layout',
  args: {
    compact: true,
  },
};
