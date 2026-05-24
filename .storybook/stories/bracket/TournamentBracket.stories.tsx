import {
  generateSingleEliminationBracket,
  MatchStatus,
  TournamentBracket,
} from '@graph-render/tournament-tree';
import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';

import { bracketGraph } from './data/bracket';
import { bracketGraphLive } from './data/bracket_live';
import { bracketGraphQF } from './data/bracket_qf';
import { bracketGraphR16 } from './data/bracket_r8';
import { bracketGraphR64 } from './data/bracket_r64';

const generatedBracket = generateSingleEliminationBracket(
  [
    { name: 'Nour El Sherbini', seed: 1, country: 'EGY' },
    { name: 'Hania El Hammamy', seed: 8, country: 'EGY' },
    { name: 'Nouran Gohar', seed: 4, country: 'EGY' },
    { name: 'Amanda Sobhy', seed: 5, country: 'USA' },
    { name: 'Nour El Tayeb', seed: 2, country: 'EGY' },
    { name: 'Camille Serme', seed: 7, country: 'FRA' },
    { name: 'Raneem El Welily', seed: 3, country: 'EGY' },
    { name: 'Joelle King', seed: 6, country: 'NZL' },
  ],
  { seeded: true }
);
const generatedBracketWithByes = generateSingleEliminationBracket(
  [
    { name: 'Seed 1', seed: 1, country: 'EGY' },
    { name: 'Seed 2', seed: 2, country: 'USA' },
    { name: 'Seed 3', seed: 3, country: 'NZL' },
    { name: 'Seed 4', seed: 4, country: 'FRA' },
    { name: 'Seed 5', seed: 5, country: 'ENG' },
    { name: 'Seed 6', seed: 6, country: 'WAL' },
  ],
  { seeding: 'standard', byeLabel: 'BYE' }
);
const bestOfSeriesGraph = {
  nodes: {
    final: {
      meta: {
        games: [
          { label: 'Map 1', scores: [13, 11] },
          { label: 'Map 2', scores: [8, 13], winner: 1 },
          { label: 'Map 3', scores: [16, 14] },
        ],
        players: [
          { name: 'Alpha Esports', seed: 1, country: 'USA' },
          { name: 'Bravo Gaming', seed: 2, country: 'CAN' },
        ],
        seriesFormat: { bestOf: 3, label: 'BO3' },
        status: 'completed',
      },
    },
  },
  adj: { final: {} },
};

function ControlledLiveUpdateExample() {
  const [score, setScore] = useState(4);
  const graph = useMemo(
    () => ({
      nodes: {
        live: {
          meta: {
            currentSet: 0,
            players: [{ name: 'Live Alpha' }, { name: 'Live Bravo' }],
            sets: [[score, 3]],
            status: score >= 11 ? MatchStatus.Completed : MatchStatus.Live,
          },
        },
      },
      adj: { live: {} },
    }),
    [score]
  );

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <button type="button" onClick={() => setScore((value) => Math.min(11, value + 1))}>
        Simulate score update
      </button>
      <TournamentBracket graph={graph} title="Controlled Live Updates" />
    </div>
  );
}

const meta: Meta<typeof TournamentBracket> = {
  title: 'Tournament/Bracket',
  component: TournamentBracket,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    graph: bracketGraphQF,
    title: 'Open Championship',
    showToolbar: true,
    compact: true,
  },
};

export default meta;

type Story = StoryObj<typeof TournamentBracket>;

// ── Draw sizes ────────────────────────────────────────────────────────────

export const Quarterfinals: Story = {
  name: 'Quarterfinals — 8 players',
  args: {
    graph: bracketGraphQF,
    title: 'Quarterfinals',
  },
};

export const RoundOf16: Story = {
  name: 'Round of 16 — 16 players',
  args: {
    graph: bracketGraphR16,
    title: 'Round of 16',
  },
};

export const RoundOf32: Story = {
  name: 'Round of 32 — 32 players',
  args: {
    graph: bracketGraph,
    title: 'Round of 32',
  },
};

export const RoundOf64: Story = {
  name: 'Round of 64 — 64 players',
  args: {
    graph: bracketGraphR64,
    title: 'Round of 64',
  },
};

export const GeneratedSingleElimination: Story = {
  name: 'Generated — single elimination',
  args: {
    graph: generatedBracket,
    title: 'Generated Draw',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses generateSingleEliminationBracket() to create a ready-to-render bracket from participants.',
      },
    },
  },
};

export const GeneratedWithByes: Story = {
  name: 'Generated — seeded draw with byes',
  args: {
    graph: generatedBracketWithByes,
    title: 'Generated Seeded Draw',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows a non-power-of-two draw rounded to the next bracket size with explicit bye rows and automatic advancement metadata.',
      },
    },
  },
};

// ── Live / in-progress ────────────────────────────────────────────────────

export const Live: Story = {
  name: 'Live — in-progress with tiebreaks',
  args: {
    graph: bracketGraphLive,
    title: 'Live — British Open',
    badgeText: '● LIVE',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows live match indicators (pulsing dot, blue border), tiebreak score display, winning player highlighting, and upcoming match styling.',
      },
    },
  },
};

export const BestOfSeries: Story = {
  name: 'Best-of series — BO3 maps',
  args: {
    graph: bestOfSeriesGraph,
    title: 'Best-of Series',
  },
  parameters: {
    docs: {
      description: {
        story: 'Renders labeled game/map scores and computes the winner from game results.',
      },
    },
  },
};

export const ControlledLiveUpdates: Story = {
  name: 'Live — controlled updates',
  render: () => <ControlledLiveUpdateExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates consumer-owned live score state. The bracket receives a new graph; no transport dependency is included.',
      },
    },
  },
};

// ── Dark mode ─────────────────────────────────────────────────────────────

export const DarkMode: Story = {
  name: 'Dark mode — explicit dark appearance',
  args: {
    graph: bracketGraphR16,
    title: 'British Open — Dark',
    appearance: {
      colors: {
        dark: {
          BASE_BG: '#0d1117',
          SURFACE_BG: '#161b22',
          HEADER_BG: '#161b22',
          HEADER_TITLE: '#e5ecff',
          HEADER_MUTED: '#8b949e',
          HEADER_BORDER: '#30363d',
          BORDER: '#30363d',
          CARD_BORDER: '#30363d',
          WINNER_ACCENT: '#388bfd',
          WINNING_SCORE: '#58a6ff',
          FOREGROUND: '#e5ecff',
          MUTED_TEXT: '#8b949e',
        },
      },
    },
  },
};

// ── Custom appearance ─────────────────────────────────────────────────────

export const GreenAccent: Story = {
  name: 'Custom — green accent',
  args: {
    graph: bracketGraphQF,
    title: 'WSF Championships',
    appearance: {
      colors: {
        dark: {
          BASE_BG: '#0a1a0e',
          SURFACE_BG: '#0f1f14',
          HEADER_BG: '#0d2214',
          HEADER_TITLE: '#e2ffe8',
          HEADER_MUTED: '#5e9970',
          HEADER_BORDER: '#1a3322',
          BORDER: '#1e3d28',
          CARD_BORDER: '#1e3d28',
          WINNER_ACCENT: '#3fb950',
          WINNING_SCORE: '#3fb950',
          FOREGROUND: '#d4fada',
          MUTED_TEXT: '#5e9970',
          LABEL_TEXT: '#5e9970',
          EDGE_COLOR: '#1e3d28',
        },
      },
    },
  },
};

export const PurpleAccent: Story = {
  name: 'Custom — purple accent',
  args: {
    graph: bracketGraphQF,
    title: 'Crystal Palace Invitational',
    appearance: {
      colors: {
        dark: {
          BASE_BG: '#0d0b1a',
          SURFACE_BG: '#150f2e',
          HEADER_BG: '#120e2a',
          HEADER_TITLE: '#ede8ff',
          HEADER_MUTED: '#8b7eb8',
          HEADER_BORDER: '#2a1f4a',
          BORDER: '#2a1f4a',
          CARD_BORDER: '#2a1f4a',
          WINNER_ACCENT: '#bc8cff',
          WINNING_SCORE: '#bc8cff',
          FOREGROUND: '#ede8ff',
          MUTED_TEXT: '#8b7eb8',
          LABEL_TEXT: '#8b7eb8',
          EDGE_COLOR: '#2a1f4a',
        },
      },
    },
  },
};

// ── Compact mode ──────────────────────────────────────────────────────────

export const Compact: Story = {
  name: 'Compact — dense cards',
  args: {
    graph: bracketGraph,
    title: 'Compact View',
    compact: true,
    showToolbar: true,
  },
};

// ── No toolbar ────────────────────────────────────────────────────────────

export const Minimal: Story = {
  name: 'Minimal — embed-ready, no toolbar',
  args: {
    graph: bracketGraphQF,
    title: '',
    showToolbar: false,
    compact: true,
  },
};
