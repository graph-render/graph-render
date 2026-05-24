# @graph-render/tournament-tree

<p>
  <a href="https://www.npmjs.com/package/@graph-render/tournament-tree"><img src="https://img.shields.io/npm/v/@graph-render/tournament-tree" alt="npm version" /></a>
  <a href="https://github.com/graph-render/graph-render/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61dafb" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-ready-3178c6" alt="TypeScript" /></a>
</p>

**A complete tournament bracket component for React.**

Drop in `<TournamentBracket>`, pass your match data, and get a fully interactive bracket — with match cards, scores, winners, round labels, stage navigation, dark mode, mobile-friendly zoom, and SVG export — all styled and ready to use.

## Install

```bash
yarn add @graph-render/tournament-tree react react-dom
```

## Quick Start

```tsx
import { MatchStatus, TournamentBracket } from '@graph-render/tournament-tree';

const graph = {
  nodes: {
    sf1: {
      meta: {
        players: [
          { name: 'Paul Coll', seed: 1 },
          { name: 'Mohamed ElShorbagy', seed: 4 },
        ],
        sets: [
          [11, 9],
          [9, 11],
          [11, 7],
        ],
        status: MatchStatus.Completed,
      },
    },
    sf2: {
      meta: {
        players: [
          { name: 'Ali Farag', seed: 2 },
          { name: 'Tarek Momen', seed: 3 },
        ],
        sets: [
          [11, 8],
          [11, 6],
        ],
        status: MatchStatus.Completed,
      },
    },
    final: {
      meta: {
        players: [
          { name: 'Paul Coll', seed: 1 },
          { name: 'Ali Farag', seed: 2 },
        ],
        status: MatchStatus.Upcoming,
      },
    },
  },
  adj: {
    sf1: { final: { id: 'sf1-final', type: 'undirected' } },
    sf2: { final: { id: 'sf2-final', type: 'undirected' } },
    final: {},
  },
};

export default function App() {
  return (
    <TournamentBracket
      graph={graph}
      title="World Championship"
      defaultNavigationMode
      onMatchClick={(match) => console.log(match)}
    />
  );
}
```

---

## Inputs and outputs

### Inputs (what you pass in)

| Input                  | Type                                    | Required  | Role                                                      |
| ---------------------- | --------------------------------------- | --------- | --------------------------------------------------------- |
| `graph`                | `NxGraphInput`                          | yes       | Bracket structure + match metadata on each node           |
| `graph.nodes[id].meta` | `MatchMeta`                             | per match | Players, scores, status, tiebreaks, schedule, venue       |
| `graph.adj`            | adjacency map                           | yes       | Parent → child links between matches                      |
| `config`               | `Partial<GraphConfig>`                  | no        | Layout engine: tree layout, canvas size, `nodeGap`, edges |
| `appearance`           | `TournamentBracketAppearance`           | no        | Visual styling: colors, fonts, card size, chrome          |
| Other props            | see [Component props](#component-props) | no        | Title, compact mode, callbacks, viewport                  |

### Outputs (what you get back)

| Output                     | Type                  | When                                                 |
| -------------------------- | --------------------- | ---------------------------------------------------- |
| Rendered bracket UI        | React tree            | Always — header, stage labels, graph canvas, toolbar |
| `onMatchClick(node)`       | `MatchPositionedNode` | User clicks a built-in match card                    |
| `onInvalidNode(id, error)` | `string`, `Error`     | Custom or built-in node fails to render              |
| SVG export                 | file download         | User clicks export in toolbar (built-in handler)     |
| Dark mode                  | document / toolbar    | Toggles `document` dark class via built-in control   |

For custom integrations, use `useBracketAppearance()` inside children of `BracketAppearanceProvider`, or call `resolveBracketAppearance(appearance, isDarkMode, compact)` to get the merged style object without rendering.

---

## Styling & configuration

Visual styling and graph layout are **separate**:

- **`appearance`** — colors, typography, match-card dimensions, header, frame, stage labels
- **`config`** — graph layout (`layout`, `width`, `height`, `padding`, `theme.nodeGap`, routing, etc.)
- **`compact`** — selects `appearance.matchCard.compact` vs `appearance.matchCard.standard` presets (default card size and density)

Every field in `appearance` is optional. Omitted values use library defaults.

### Minimal styling example

```tsx
<TournamentBracket
  graph={graph}
  compact={false}
  appearance={{
    colors: {
      light: { ICON_BG: '#2563eb', SURFACE_BG: '#f8fafc' },
      dark: { SURFACE_BG: '#0f172a', ICON_BG: '#3b82f6' },
    },
    typography: {
      bodyFontFamily: '"Inter", system-ui, sans-serif',
      scoreFontFamily: '"JetBrains Mono", monospace',
    },
  }}
/>
```

### Full styling example

```tsx
import type { TournamentBracketAppearance } from '@graph-render/tournament-tree';

const brandAppearance: TournamentBracketAppearance = {
  colors: {
    light: {
      ICON_BG: '#7c9070',
      CARD_BORDER: '#d9d6cf',
      WINNER_CREST_BG: '#7c9070',
    },
    dark: {
      SURFACE_BG: '#191e24',
      CARD_BORDER: '#5d6470',
    },
  },
  typography: {
    bodyFontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    scoreFontFamily: '"Space Mono", ui-monospace, monospace',
  },
  matchCard: {
    standard: {
      width: 280,
      height: 100,
      borderRadius: 14,
      nameFontSize: 13,
      score: {
        fontSize: 14.5,
        matchCountFontSize: 21,
        segmentWidth: 24,
        segmentGap: 10,
      },
    },
    compact: {
      width: 160,
      height: 56,
      borderRadius: 8,
      score: {
        fontSize: 7.5,
        matchCountFontSize: 11,
        segmentWidth: 9,
        segmentGap: 5,
      },
    },
  },
  frame: {
    maxWidth: 1180,
    borderRadiusStandard: 24,
    contentPaddingStandard: '12px 24px 24px',
  },
  header: {
    titleFontSizeStandard: 18,
    iconSizeStandard: 30,
  },
  stageLabels: {
    gridGapStandard: 24,
    labelFontSizeStandard: 12,
  },
};

<TournamentBracket graph={graph} appearance={brandAppearance} compact={false} />;
```

### Graph layout (`config`)

Use `config` when you need to change how the bracket is laid out on the canvas (not how match cards look):

```tsx
import { EdgeType, LayoutDirection, LayoutType } from '@graph-render/types';

<TournamentBracket
  graph={graph}
  config={{
    width: 1600,
    height: 1200,
    padding: 40,
    layout: LayoutType.Tree,
    layoutDirection: LayoutDirection.LTR,
    defaultEdgeType: EdgeType.Undirected,
    theme: { nodeGap: 34, edgeColor: '#d9d6cf' },
  }}
/>;
```

`config.theme` only affects the **graph engine** (edges, canvas background, node spacing). Match-card colors come from `appearance.colors`.

### Default match-card sizes

| Mode     | `compact` | Default size (W×H) |
| -------- | --------- | ------------------ |
| Standard | `false`   | 280 × 100          |
| Compact  | `true`    | 160 × 56           |

Constants exported for reference: `NODE_DIMENSIONS`, `NODE_DIMENSIONS_COMPACT`, `NODE_DIMENSIONS_STAGE_NAV`.

---

## `appearance` reference

Type: `TournamentBracketAppearance` (from `@graph-render/tournament-tree` or `@graph-render/types`).

### `appearance.colors`

Override theme tokens per color mode. Keys are merged on top of built-in light/dark palettes.

| Key                                      | Used for                                              |
| ---------------------------------------- | ----------------------------------------------------- |
| `BASE_BG`                                | Match card background                                 |
| `SURFACE_BG`                             | Outer bracket frame background                        |
| `HEADER_BG`                              | Top header bar                                        |
| `HEADER_TITLE`                           | Title text                                            |
| `HEADER_BORDER`                          | Header / stage label dividers                         |
| `ICON_BG` / `ICON_FG`                    | Trophy icon badge                                     |
| `BADGE_BG` / `BADGE_TEXT` / `BADGE_DOT`  | Header status badge                                   |
| `CREST_BG` / `CREST_TEXT`                | Player initials badge                                 |
| `SEED_TEXT` / `COUNTRY_TEXT`             | Seed and country metadata in match cards              |
| `WINNER_CREST_BG` / `WINNER_CREST_TEXT`  | Winner initials badge                                 |
| `ROW_BG` / `ROW_HOVER_BG`                | Player row backgrounds                                |
| `FOREGROUND` / `MUTED_TEXT`              | Primary / secondary text                              |
| `BORDER` / `DARK_BORDER` / `CARD_BORDER` | Dividers and card outline                             |
| `LIVE_INDICATOR`                         | Live match dot                                        |
| `EDGE_COLOR`                             | Bracket connector lines (also set via `config.theme`) |
| `LABEL_TEXT`                             | Round label text                                      |
| `TOOLBAR_*`                              | Floating toolbar                                      |
| `SHADOW` / `CARD_SHADOW`                 | Frame and card shadows                                |

```ts
appearance: {
  colors: {
    light: { ICON_BG: '#2563eb' },
    dark: { SURFACE_BG: '#0f172a' },
  },
}
```

### `appearance.typography`

| Field             | Default                 | Description           |
| ----------------- | ----------------------- | --------------------- |
| `bodyFontFamily`  | Plus Jakarta Sans stack | Names, header, badges |
| `scoreFontFamily` | Space Mono stack        | Per-set score digits  |

### `appearance.matchCard.standard` / `.compact`

Applied when `compact={false}` or `compact={true}` respectively.

| Field                      | Standard default | Compact default | Description                    |
| -------------------------- | ---------------- | --------------- | ------------------------------ |
| `width`                    | 280              | 160             | Card width (px); drives layout |
| `height`                   | 100              | 56              | Card height (px)               |
| `borderRadius`             | 14               | 8               | Card corner radius             |
| `insetX`                   | 10               | 6               | Horizontal padding inside card |
| `badgeSize`                | 24               | 16              | Player crest size              |
| `badgePad`                 | 6                | 4               | Gap after crest                |
| `badgeFontSize`            | 12               | 8               | Crest initials font size       |
| `nameFontSize`             | 13               | 10              | Player name font size          |
| `matchCountWidth`          | 20               | 14              | Width of “sets won” column     |
| `matchCountTrailingGap`    | 8                | 6               | Space before sets-won column   |
| `scoreGroupTrailingGap`    | 4                | 4               | Space before score group       |
| `rowPadding`               | `8px 10px`       | `4px 6px`       | HTML row padding               |
| `rowGap`                   | 5                | 4               | HTML row grid gap              |
| `score.segmentWidth`       | 24               | 9               | Width per set-score column     |
| `score.segmentGap`         | 10               | 5               | Gap between set scores         |
| `score.fontSize`           | 14.5             | 7.5             | Set score font size            |
| `score.matchCountFontSize` | 21               | 11              | Sets-won number font size      |

### `appearance.frame`

| Field                                              | Description                                     |
| -------------------------------------------------- | ----------------------------------------------- |
| `maxWidth`                                         | Max width of bracket container (default `1180`) |
| `borderRadiusStandard` / `borderRadiusCompact`     | Outer frame radius                              |
| `contentPaddingStandard` / `contentPaddingCompact` | Padding around graph canvas                     |
| `canvasBackgroundLight` / `canvasBackgroundDark`   | CSS background behind the graph                 |

### `appearance.header`

| Field                                            | Description                   |
| ------------------------------------------------ | ----------------------------- |
| `gap`                                            | Flex gap between header items |
| `minHeightStandard` / `minHeightCompact`         | Header bar min height         |
| `paddingStandard` / `paddingCompact`             | Header horizontal padding     |
| `iconSizeStandard` / `iconSizeCompact`           | Trophy icon box size          |
| `iconRadiusStandard` / `iconRadiusCompact`       | Trophy icon corner radius     |
| `titleFontSizeStandard` / `titleFontSizeCompact` | Title font size               |
| `badgeFontSizeStandard` / `badgeFontSizeCompact` | Badge label font size         |
| `badgePaddingStandard` / `badgePaddingCompact`   | Badge padding                 |
| `badgeDotSize`                                   | Status dot size in badge      |

### `appearance.stageLabels`

| Field                                                    | Description                      |
| -------------------------------------------------------- | -------------------------------- |
| `backgroundLight` / `backgroundDark`                     | Stage label bar background       |
| `paddingStandard` / `paddingCompact`                     | Padding when showing all rounds  |
| `paddingNavigationStandard` / `paddingNavigationCompact` | Padding in stage navigation mode |
| `gridGapStandard` / `gridGapCompact`                     | Gap between round labels         |
| `labelFontSizeStandard` / `labelFontSizeCompact`         | Round name font size             |
| `activePillFontSize*` / `activePillPadding*`             | Active stage chip in nav mode    |
| `counterFontSize*`                                       | “2/5” stage counter font size    |
| `navColorLight` / `navColorDark`                         | Prev/next arrow color            |
| `navBorderLight` / `navBorderDark`                       | Prev/next button border          |

---

## Component props

| Prop                    | Type                                  | Default                  | Description                                     |
| ----------------------- | ------------------------------------- | ------------------------ | ----------------------------------------------- |
| `graph`                 | `NxGraphInput`                        | required                 | Bracket nodes + edges                           |
| `config`                | `Partial<GraphConfig>`                | tournament defaults      | Layout, canvas, routing                         |
| `appearance`            | `TournamentBracketAppearance`         | built-in theme           | Visual styling overrides                        |
| `defaultViewport`       | `Partial<GraphViewport>`              | auto fit                 | Initial pan/zoom (`x`, `y`, `zoom`)             |
| `vertexComponent`       | `VertexComponent`                     | built-in card            | Replace match card renderer                     |
| `nodeRenderMode`        | `SquashNodeRenderMode`                | `'export'`               | `'svg'` \| `'html'` \| `'export'` \| `'server'` |
| `title`                 | `string`                              | `'Tournament Bracket'`   | Header title                                    |
| `badgeText`             | `string`                              | auto from graph          | Header badge text                               |
| `showToolbar`           | `boolean`                             | `true`                   | Show toolbar actions                            |
| `showViewportControls`  | `boolean`                             | `false`                  | Show zoom controls on canvas                    |
| `defaultNavigationMode` | `boolean`                             | `true`                   | Start in per-stage navigation                   |
| `panEnabled`            | `boolean`                             | `true` (off in nav mode) | Allow panning                                   |
| `zoomEnabled`           | `boolean`                             | `true` (off in nav mode) | Allow zoom                                      |
| `pinchZoomEnabled`      | `boolean`                             | `true` (off in nav mode) | Allow pinch zoom                                |
| `compact`               | `boolean`                             | `true`                   | Use compact match-card preset                   |
| `onMatchClick`          | `(node: MatchPositionedNode) => void` | —                        | Match click handler                             |
| `onInvalidNode`         | `(id, error) => void`                 | —                        | Node render error handler                       |

---

## Match data input (`MatchMeta`)

Each node in `graph.nodes` can include `meta`:

```ts
interface MatchPlayer {
  id?: string;
  name: string;
  seed?: number;
  country?: string;
  avatarUrl?: string;
  teamName?: string;
  isBye?: boolean;
}

interface MatchMeta {
  players?: MatchPlayer[];
  sets?: number[][]; // e.g. [[11, 8], [9, 11], [11, 7]]
  tiebreaks?: number[][]; // optional tiebreak per set
  status?: MatchStatus; // Completed | Live | Upcoming
  currentSet?: number; // live: index of set in progress
  stage?: string; // optional label override
  matchType?: 'standard' | 'thirdPlace' | 'grandFinal' | 'bye' | 'walkover';
  bracketSection?: 'winners' | 'losers' | 'grandFinal';
  scheduledAt?: string;
  timezone?: string;
  venue?: string;
  seriesFormat?: string | { bestOf?: number; label?: string };
  games?: { label?: string; scores: readonly [number, number]; winner?: 0 | 1 }[];
}
```

`SquashPlayer`, `SquashMatchMeta`, `SquashNodeData`, and `SquashPositionedNode` remain exported as deprecated aliases for existing integrations. New code should prefer `MatchPlayer`, `MatchMeta`, `MatchNodeData`, and `MatchPositionedNode`.

### `MatchStatus`

```tsx
import { MatchStatus } from '@graph-render/tournament-tree';

// MatchStatus.Completed — winner highlighted
// MatchStatus.Live       — live indicator, in-progress set excluded from set count
// MatchStatus.Upcoming   — dimmed, scores hidden
```

---

## Bracket shape input (`graph.adj`)

Connect matches through `adj`. Round labels are inferred from graph depth.

```ts
const graph = {
  nodes: {
    /* id -> { meta } */
  },
  adj: {
    qf1: { sf1: { id: 'qf1-sf1', type: 'undirected' } },
    sf1: { final: { id: 'sf1-final', type: 'undirected' } },
    final: {},
  },
};
```

---

## Generate a single-elimination bracket

Use `generateSingleEliminationBracket()` when you want a ready-to-render graph from participants instead of hand-writing adjacency maps.

```tsx
import { generateSingleEliminationBracket, TournamentBracket } from '@graph-render/tournament-tree';

const graph = generateSingleEliminationBracket(
  [
    { name: 'Seed 1', seed: 1 },
    { name: 'Seed 4', seed: 4 },
    { name: 'Seed 2', seed: 2 },
    { name: 'Seed 3', seed: 3 },
  ],
  {
    seeding: 'standard',
    includeThirdPlace: true,
    thirdPlaceLabel: 'Bronze Match',
    byeLabel: 'BYE',
  }
);

<TournamentBracket graph={graph} />;
```

The generator accepts participant strings or `MatchPlayer` objects, creates stable match IDs, fills non-power-of-two draws with explicit bye slots, advances players over byes in downstream metadata, and returns the same `NxGraphInput` shape accepted by `TournamentBracket`.

When `includeThirdPlace` is enabled, semifinal loser feeds are connected to a semantic `matchType: 'thirdPlace'` node. Use `thirdPlaceLabel` to customize the displayed stage label.

Supported draw modes:

| Option                | Behavior                                      |
| --------------------- | --------------------------------------------- |
| `seeding: 'none'`     | Preserve participant order                    |
| `seeding: 'standard'` | Place seeds using standard bracket positions  |
| `seeding: 'manual'`   | Use `seedOrder` to control seed-rank order    |
| `seeding: 'random'`   | Shuffle entrants; pass `shuffle` for testing  |
| `seeded: true`        | Backward-compatible shortcut for `'standard'` |

---

## Generate a double-elimination bracket

Use `generateDoubleEliminationBracket()` for esports-style draws with winners bracket, losers bracket, grand final, and an optional reset final.

```tsx
import { generateDoubleEliminationBracket, TournamentBracket } from '@graph-render/tournament-tree';

const graph = generateDoubleEliminationBracket(
  Array.from({ length: 16 }, (_, index) => ({
    name: `Team ${index + 1}`,
    seed: index + 1,
  })),
  {
    includeBracketReset: true,
    grandFinalLabel: 'Championship Match',
    bracketResetLabel: 'Reset Final',
  }
);

<TournamentBracket
  graph={graph}
  title="Double Elimination"
  config={{
    labels: [
      'Winners R1',
      'Winners QF',
      'Winners SF',
      'Winners Final',
      'Losers Bracket',
      'Grand Final',
    ],
  }}
/>;
```

The generator supports 8-, 16-, and 32-player draws. It returns standard `NxGraphInput` nodes with `bracketSection: 'winners' | 'losers' | 'grandFinal'`; grand-final nodes also use `matchType: 'grandFinal'`. Winners-bracket loser drops are encoded on edge metadata as `{ sourceResult: 'loser', bracketDrop: true }`, so custom match cards and edge renderers can distinguish drop paths from normal winner advancement.

Generated nodes include fixed positions that place the winners bracket above the losers bracket and grand-final nodes to the right. You can still pass a custom `vertexComponent` because all tournament semantics live in node/edge metadata rather than in the built-in card renderer.

---

## Render a round-robin group

Round robin is rendered as standings plus a schedule, not through the graph layout engine.

```tsx
import {
  generateRoundRobinSchedule,
  MatchStatus,
  RoundRobinBracket,
} from '@graph-render/tournament-tree';

const participants = ['Alpha', 'Bravo', 'Charlie', 'Delta'];
const schedule = generateRoundRobinSchedule(participants);
const matches = schedule.map((match) =>
  match.id === 'rr-r1-m1' ? { ...match, scores: [2, 1], status: MatchStatus.Completed } : match
);

<RoundRobinBracket
  participants={participants}
  matches={matches}
  points={{ win: 3, draw: 1, loss: 0 }}
  title="Group A"
/>;
```

`calculateRoundRobinStandings(participants, matches, points)` derives table rows from completed match results. Equal scores are represented as draws, upcoming/live matches are ignored for standings until completed, and sorting uses points, score difference, score for, wins, then player name. Odd-sized groups are supported by the schedule generator without rendering bye matches.

---

## Compose groups and knockout stages

Use `MultiStageTournament` when a tournament starts with round-robin groups and advances players into a knockout bracket.

```tsx
import {
  buildKnockoutBracketFromGroups,
  MatchStatus,
  MultiStageTournament,
} from '@graph-render/tournament-tree';

const groups = [
  {
    id: 'a',
    name: 'Group A',
    participants: [{ name: 'Alpha' }, { name: 'Bravo' }, { name: 'Charlie' }, { name: 'Delta' }],
    matches: [
      {
        id: 'a-r1-m1',
        round: 1,
        players: [{ name: 'Alpha' }, { name: 'Bravo' }],
        scores: [2, 0],
        status: MatchStatus.Completed,
      },
    ],
  },
  // Group B...
];

const knockout = buildKnockoutBracketFromGroups(groups, {
  advancement: { topPerGroup: 2 },
});

<MultiStageTournament
  stages={[
    { type: 'groups', name: 'Groups', groups, advancement: { topPerGroup: 2 } },
    { type: 'elimination', name: 'Semifinals', bracket: knockout },
  ]}
/>;
```

Computed advancement uses `calculateGroupAdvancers(groups, { topPerGroup })`, which reads each group's completed round-robin standings. Use `manualAdvancers` when tournament officials override standings, then pass those players to `generateSingleEliminationBracket()` or a provided `bracket` for full manual control.

---

## Render best-of-N series scores

Use `seriesFormat` and `games` when a match is a BO3/BO5/BO7 series with map- or game-level scores.

```ts
const graph = {
  nodes: {
    final: {
      meta: {
        players: [{ name: 'Alpha' }, { name: 'Bravo' }],
        status: MatchStatus.Completed,
        seriesFormat: { bestOf: 5, label: 'BO5' },
        games: [
          { label: 'Map 1', scores: [13, 11] },
          { label: 'Map 2', scores: [8, 13], winner: 1 },
          { label: 'Map 3', scores: [16, 14] },
        ],
      },
    },
  },
  adj: { final: {} },
};
```

When `games` are present, the default match card renders labeled game segments and computes the highlighted winner from game winners/scores. Existing `sets` and `tiebreaks` rendering remains unchanged for squash-style inputs.

---

## Correct match scores safely

Use `correctMatchResult()` when a completed score changes after downstream matches have already been generated.

```ts
import { applyScoreCorrectionCascade, correctMatchResult } from '@graph-render/tournament-tree';

const correction = correctMatchResult(graph, 'r1-m1', {
  sets: [
    [8, 11],
    [9, 11],
  ],
});

console.log(correction.winnerChanged);
console.log(correction.affectedMatches);
console.log(correction.participantChanges);

// Optional: consumers explicitly decide when to apply downstream replacements.
const nextGraph = applyScoreCorrectionCascade(correction.updatedGraph, correction);
```

The correction result includes the updated source match, original/corrected winner indexes, affected downstream match IDs, and participant replacements/removals. The input graph is not mutated, and downstream cascade is never applied unless you call `applyScoreCorrectionCascade()`.

---

## Live update patterns

`TournamentBracket` is controlled: keep match state in your app, pass the latest `graph`, and re-render when polling or socket messages arrive. The library does not include WebSocket/server transport.

```tsx
function LiveBracket() {
  const [graph, setGraph] = useState(initialGraph);

  useEffect(() => {
    const timer = window.setInterval(async () => {
      const nextGraph = await fetch('/api/bracket').then((response) => response.json());
      setGraph(nextGraph);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return <TournamentBracket graph={graph} title="Live bracket" />;
}
```

For WebSocket-style integrations, update the same controlled graph from your own subscription:

```tsx
socket.on('match:update', (message) => {
  setGraph((graph) => patchMatch(graph, message.matchId, message.update));
});
```

Custom editable cards can use `onMatchUpdate` as a typed callback channel without the bracket owning persistence:

```tsx
<TournamentBracket
  graph={graph}
  vertexComponent={EditableCard}
  onMatchUpdate={({ matchId, update }) => saveScore(matchId, update)}
/>
```

Score and status changes use lightweight CSS transitions, and live indicators respect `prefers-reduced-motion`.

---

## Printing brackets

`TournamentBracket` injects print-friendly CSS automatically. Browser print output hides toolbar/navigation controls, switches the bracket surface to high-contrast light colors, and avoids clipping interactive chrome where possible.

For large draws, use landscape orientation and reduce browser print scale until all rounds fit. For venue posters or very large brackets, export SVG from the toolbar and print the SVG from a design or browser tool for more control.

---

## Advanced: hooks and exports

### `useBracketAppearance()`

Read the resolved style object inside custom children (requires `BracketAppearanceProvider`, which `TournamentBracket` sets up automatically):

```tsx
import { useBracketAppearance } from '@graph-render/tournament-tree';

function MyOverlay() {
  const { colors, matchCard, typography } = useBracketAppearance();
  return <div style={{ color: colors.HEADER_TITLE }}>...</div>;
}
```

### `resolveBracketAppearance(appearance, isDarkMode, compact)`

Merge user `appearance` with defaults without rendering — useful for Storybook or tests.

### Re-exports

| Export                                                                                        | Description                      |
| --------------------------------------------------------------------------------------------- | -------------------------------- |
| `TournamentBracket`                                                                           | Main component                   |
| `SquashNode`                                                                                  | Standalone match card            |
| `BracketAppearanceProvider`, `useBracketAppearance`                                           | Appearance context               |
| `resolveBracketAppearance`                                                                    | Merge `appearance` with defaults |
| `MatchPlayer`, `MatchMeta`, `MatchPositionedNode`, `TournamentBracketAppearance`, …           | Types                            |
| `NODE_DIMENSIONS`, `NODE_DIMENSIONS_COMPACT`, `NODE_DIMENSIONS_STAGE_NAV`                     | Default sizes                    |
| `DEFAULT_TOURNAMENT_CONFIG`, `COMPACT_TOURNAMENT_CONFIG`, …                                   | Default `config` presets         |
| `MatchStatus`, `MatchType`, `BracketSection`, `SquashNodeRenderMode`, `VerticalStagePosition` | Enums                            |
| `getStageViewport`, `buildStageViews`, `roundLabelsForGraph`                                  | Utilities                        |

---

## Custom match card

Replace the built-in card with your own renderer (styling is then your responsibility unless you read `useBracketAppearance()`):

```tsx
import { TournamentBracket } from '@graph-render/tournament-tree';
import type { MatchMeta } from '@graph-render/tournament-tree';
import type { VertexComponentProps } from '@graph-render/types/react';

function MyMatchCard({ node }: VertexComponentProps) {
  const meta = node.meta as MatchMeta;
  return (
    <foreignObject width={node.size?.width} height={node.size?.height}>
      <div className="my-match-card">
        {meta.players?.[0]?.name} vs {meta.players?.[1]?.name}
      </div>
    </foreignObject>
  );
}

<TournamentBracket graph={graph} vertexComponent={MyMatchCard} />;
```

---

## License

MIT — free for personal and commercial use. See [LICENSE](https://github.com/graph-render/graph-render/blob/main/LICENSE).
