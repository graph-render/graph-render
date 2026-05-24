# Tournament Bracket Roadmap

Goal: make `@graph-render/tournament-tree` the best open-source library for depicting tournament brackets. This roadmap is intentionally tournament-only and excludes AI, SaaS, collaboration, and other unrelated platform bets.

## Strategic Position

The open-source bracket-rendering space is fragmented:

- `brackets-viewer.js` / `brackets-manager.js` are the most format-complete OSS tools, but they are vanilla JavaScript and not React-native.
- `@g-loot/react-tournament-brackets` offers React + SVG, but the ecosystem has maintenance, peer dependency, SSR, theming, non-power-of-two, and interaction issues.
- `react-tournament-bracket` is old and effectively abandoned.
- `bracketry` is lightweight and mobile-friendly, but mainly single-elimination.
- Challonge, Toornament, start.gg, and Battlefy prove demand, but they are hosted platforms, not embeddable OSS libraries.

Graph Render can win by being the most reliable, TypeScript-first, MIT-licensed, React-native, exportable, accessible, and format-complete bracket depiction library.

## Current Strengths

- Modern TypeScript monorepo with clear package layering.
- React component with SVG/HTML match-card rendering modes.
- Built-in stage navigation, dark mode, theming, SVG export, pan/zoom, and custom `vertexComponent`.
- Existing graph/layout core gives a strong foundation for bracket-specific layouts.
- MIT license is friendly for commercial embedding.

## Current Blockers

| Blocker                     | Why it matters                                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Squash-branded public types | `SquashPlayer` / `SquashMatchMeta` make the package feel unsuitable for tennis, padel, esports, chess, badminton, and general brackets. |
| Single-elimination only     | Serious tournament tooling needs double elimination, round robin, Swiss, groups, consolation, and placement matches.                    |
| No generator utilities      | Developers must manually create graph adjacency maps instead of passing participants and options.                                       |
| No automatic seeding/byes   | Real tournament sizes are often not powers of two.                                                                                      |
| React 19-only positioning   | Many production React apps still use React 18.                                                                                          |
| Limited print/export        | SVG export exists, but admins often need print, PNG, and PDF.                                                                           |
| Missing data adapters       | Existing tournament data often lives in Challonge, start.gg, Toornament, spreadsheets, or custom APIs.                                  |
| Accessibility gaps          | Match cards need stronger ARIA, keyboard traversal, focus handling, and screen-reader text.                                             |

## Product Principles

1. **Render first, manage optionally.** The library should primarily depict tournament structures. Management helpers are useful, but full SaaS-like tournament administration should stay out of core scope.
2. **Headless model, polished default UI.** Expose layout/generator primitives while shipping beautiful default React components.
3. **Generic by default.** Squash, tennis, esports, chess, and other domains should be examples on top of generic tournament types.
4. **Format completeness beats novelty.** Become boringly reliable for real tournament structures before adding advanced platform features.
5. **Export and print are core.** Brackets are often shared, printed, embedded, and archived.
6. **Accessibility is a differentiator.** Most bracket libraries ignore it; Graph Render should not.

## Required Feature Set

### Tournament Formats

| Priority | Format                       | Notes                                                                 |
| -------: | ---------------------------- | --------------------------------------------------------------------- |
|        1 | Single elimination           | Keep and harden current support.                                      |
|        2 | Single elimination with byes | Auto-fill missing participants and render byes clearly.               |
|        3 | Bronze / third-place match   | Common in sports and amateur tournaments.                             |
|        4 | Double elimination           | Winners bracket, losers bracket, grand final, optional bracket reset. |
|        5 | Round robin                  | Standings table plus schedule view.                                   |
|        6 | Groups / pools to knockout   | Group-stage standings feeding elimination bracket.                    |
|        7 | Placement matches            | 5th/6th, 7th/8th, consolation ladders.                                |
|        8 | Swiss system                 | Chess, card games, qualifiers, esports.                               |
|        9 | Best-of-N series             | BO1, BO3, BO5, BO7 with game/map-level scores.                        |
|       10 | Multi-stage tournaments      | Qualifiers, main draw, playoffs, finals.                              |

### Rendering and UX

| Feature            | Requirement                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Responsive layout  | Good desktop, tablet, and mobile behavior.                                                 |
| Stage navigation   | Round-by-round navigation for small screens.                                               |
| Pan/zoom           | Smooth for large brackets.                                                                 |
| Custom match cards | Full custom renderer plus smaller slots for avatar, flag, status, score, actions.          |
| Theming            | Token-based theme, CSS variable bridge, light/dark modes.                                  |
| Print mode         | Hide toolbar, use high-contrast print colors, page-break-friendly layout.                  |
| Export             | SVG first, then PNG/PDF.                                                                   |
| Accessibility      | Keyboard navigation, ARIA labels, focus rings, score descriptions, reduced-motion support. |
| Large brackets     | Efficient rendering for 64, 128, and 256 entrants.                                         |
| Localization       | Custom round labels, locale-aware dates/times, RTL direction later.                        |

### Developer Experience

| Feature                | Requirement                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Generic types          | `MatchPlayer`, `MatchMeta`, `TournamentMatch`, `TournamentStage`.                                                            |
| Backward compatibility | Keep `Squash*` as deprecated aliases during migration.                                                                       |
| Generators             | `generateSingleEliminationBracket`, `generateDoubleEliminationBracket`, `generateRoundRobinSchedule`, `generateSwissRounds`. |
| Seeding                | Standard seeding, manual seed order, random draw, byes.                                                                      |
| Controlled updates     | `graph`, `onGraphChange`, `onMatchUpdate`, `onResultCorrect`.                                                                |
| Data adapters          | Challonge, start.gg, Toornament, CSV/JSON import.                                                                            |
| Examples               | Squash, tennis, padel, badminton, chess, esports, school tournament.                                                         |
| Docs                   | Dedicated format guides and copy-paste examples.                                                                             |
| Migration guides       | From `@g-loot/react-tournament-brackets`, `brackets-viewer.js`, and custom JSON.                                             |

## Roadmap

### 30 Days: Foundation

Goal: remove adoption blockers and make the current single-elimination package feel generic and production-ready.

| Item                                 | Outcome                                                                                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Introduce generic tournament types   | Add `MatchPlayer`, `MatchMeta`, `MatchNodeData`, `MatchStatus`, `MatchType`; keep `SquashPlayer` and `SquashMatchMeta` as deprecated aliases. |
| Render seed and country              | Use existing `seed` and `country` fields in default cards. Seeds should show as seed numbers, not initials only.                              |
| Add bracket generator                | `generateSingleEliminationBracket(participants, options)` returns a ready-to-render graph.                                                    |
| Add byes                             | Auto-round participant count to next power of two and render `BYE` / `TBD` clearly.                                                           |
| Add bronze match semantics           | Support `matchType: 'thirdPlace'` and render a badge/label.                                                                                   |
| React 18 compatibility investigation | Verify hooks and peer dependencies; widen support if tests pass.                                                                              |
| Improve match-card accessibility     | Add `role`, `aria-label`, `tabIndex`, focus styles, and keyboard activation.                                                                  |
| Add print CSS                        | Print-friendly stylesheet and print demo.                                                                                                     |
| Update docs                          | Add "single elimination in 5 minutes" and examples for multiple sports.                                                                       |

Definition of done:

- A developer can pass a participant list and render a polished single-elimination bracket in under 5 minutes.
- Non-squash users no longer see squash-first names in primary docs.
- 6-, 10-, 12-, and 14-player brackets render with byes correctly.

### 90 Days: Format Expansion I

Goal: cover the two most important missing tournament structures.

| Item                         | Outcome                                                                                                                |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Double elimination model     | Add winners bracket, losers bracket, grand final, bracket reset option, and drop edges from winners to losers bracket. |
| Double elimination generator | `generateDoubleEliminationBracket(participants, options)`.                                                             |
| Double elimination layout    | Winners bracket above, losers bracket below, grand final to the right; clear labels and dashed loser-drop connectors.  |
| Round robin model            | Add participants, rounds, matches, points rules, and standings.                                                        |
| Round robin component        | Table standings plus schedule view; should not force a graph layout.                                                   |
| Seeding options              | Manual seed order, standard seed placement, random draw utility.                                                       |
| Storybook/docs demos         | Double elimination esports, round-robin group, tennis/padel bracket, chess-style event.                                |
| Migration guide              | Show how to migrate from `@g-loot/react-tournament-brackets` data to Graph Render.                                     |

Definition of done:

- 8-, 16-, and 32-player double-elimination examples render correctly.
- Round-robin standings are computed from match results.
- Docs cover single elimination, double elimination, round robin, byes, and bronze matches.

### 6 Months: Format Expansion II and Admin Workflows

Goal: handle real-world tournament complexity and organizer needs.

| Item                        | Outcome                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------- |
| Groups to knockout          | `MultiStageTournament` with group stages feeding a knockout bracket.                |
| Best-of-N series            | BO1/BO3/BO5/BO7 with game/map scores and series winner logic.                       |
| Score correction API        | Helpers to update scores, recalculate winners, and safely reset downstream matches. |
| Live update API             | Controlled update pattern for match status and scores; no WebSocket infra required. |
| Scheduled times             | `scheduledAt`, `timezone`, venue/court fields, locale-aware display.                |
| Localization                | Custom round labels, status labels, date/time formatting.                           |
| PNG export                  | Convert exported SVG to PNG client-side.                                            |
| PDF export                  | Optional peer dependency for PDF generation.                                        |
| Data adapters               | Import from Challonge, start.gg, Toornament, and CSV.                               |
| Responsive/mobile hardening | Container-based card sizing, better stage navigation, touch targets.                |

Definition of done:

- A tournament organizer can show a group stage plus knockout bracket.
- Esports BO3/BO5 cards look good by default.
- Scores can be corrected without manually rebuilding the graph.
- A bracket can be printed/exported as SVG, PNG, or PDF.

### 12 Months: Completeness and Best-in-Class Polish

Goal: become the most complete OSS bracket depiction library.

| Item                       | Outcome                                                                        |
| -------------------------- | ------------------------------------------------------------------------------ |
| Swiss format               | Pairing rounds, standings, points, tiebreakers.                                |
| Placement matches          | 5th/6th, 7th/8th, custom placement trees.                                      |
| Advanced standings         | Tie-break rules, points formulas, head-to-head, score difference.              |
| WCAG 2.1 AA pass           | Axe tests, keyboard traversal, screen-reader docs, contrast audit.             |
| Large bracket optimization | 128+ participant examples; optimize layout/rendering and stage virtualization. |
| CSS variable bridge        | Export theme tokens as `--gr-*` custom properties.                             |
| Framework decision         | Only add Vue/Svelte adapter if real demand exists; do not distract earlier.    |
| Comprehensive docs site    | Format-by-format guides, API reference, examples, migration guides, cookbook.  |

Definition of done:

- Graph Render supports every common bracket format: single elimination, double elimination, round robin, groups-to-knockout, Swiss, bronze, placement, byes, and best-of-N.
- It is clearly better documented and more accessible than existing OSS alternatives.

## Prioritized Feature Backlog

| Rank | Feature                                   |  Impact |     Effort | Priority |
| ---: | ----------------------------------------- | ------: | ---------: | -------- |
|    1 | Generic `MatchPlayer` / `MatchMeta` model |    High |     Medium | Must     |
|    2 | Single-elimination generator              |    High |     Medium | Must     |
|    3 | Seeding and byes                          |    High |     Medium | Must     |
|    4 | React 18 compatibility                    |    High |      Small | Must     |
|    5 | Seed/country rendering                    |  Medium |      Small | Must     |
|    6 | Accessibility for match cards             |    High |     Medium | Must     |
|    7 | Print CSS                                 |  Medium |      Small | Should   |
|    8 | Bronze/third-place match                  |  Medium |      Small | Should   |
|    9 | Double elimination                        |    High |      Large | Must     |
|   10 | Round robin                               |    High |      Large | Should   |
|   11 | Groups to knockout                        |    High |      Large | Should   |
|   12 | Best-of-N series                          |  Medium |     Medium | Should   |
|   13 | Score correction API                      |    High |      Large | Should   |
|   14 | PNG/PDF export                            |  Medium |     Medium | Should   |
|   15 | Data adapters                             |  Medium |     Medium | Could    |
|   16 | Swiss format                              |  Medium |      Large | Could    |
|   17 | Placement matches                         |  Medium |     Medium | Could    |
|   18 | CSS variable bridge                       |  Medium |     Medium | Could    |
|   19 | Vue/Svelte adapters                       |     Low |      Large | Later    |
|   20 | Full SaaS tournament platform             | Low now | Very large | Not now  |

## MoSCoW

### Must Have

- Generic tournament model.
- Single-elimination generator.
- Seeding and byes.
- React 18 compatibility if technically safe.
- Double elimination.
- Accessible match cards.
- Strong docs and examples.

### Should Have

- Bronze/third-place match.
- Round robin.
- Groups to knockout.
- Print CSS.
- PNG/PDF export.
- Best-of-N series.
- Score correction API.
- Localization and scheduled times.

### Could Have

- Swiss format.
- Placement matches.
- Challonge/start.gg/Toornament adapters.
- CSS variable bridge.
- Large-bracket virtualization.
- Advanced standings/tiebreak rules.

### Won't Have Yet

- AI features.
- SaaS product.
- Realtime server/WebSocket infrastructure.
- Collaborative editing.
- Marketplace.
- WebGL renderer.

## Suggested Public API Direction

```ts
export interface MatchPlayer {
  readonly id?: string;
  readonly name: string;
  readonly seed?: number;
  readonly country?: string;
  readonly avatarUrl?: string;
  readonly teamName?: string;
}

export type MatchStatus = 'completed' | 'live' | 'upcoming' | 'postponed' | 'cancelled';

export type MatchType = 'regular' | 'thirdPlace' | 'consolation' | 'placement' | 'grandFinal';

export type BracketSection = 'winners' | 'losers' | 'grandFinal';

export interface GameResult {
  readonly label?: string;
  readonly scores: readonly [number, number];
  readonly winner?: 0 | 1;
}

export interface MatchMeta {
  readonly stage?: string;
  readonly players?: readonly MatchPlayer[];
  readonly sets?: ReadonlyArray<readonly number[]>;
  readonly tiebreaks?: ReadonlyArray<readonly number[] | null>;
  readonly status?: MatchStatus;
  readonly currentSet?: number;
  readonly matchType?: MatchType;
  readonly bracketSection?: BracketSection;
  readonly scheduledAt?: string;
  readonly timezone?: string;
  readonly venue?: string;
  readonly seriesFormat?: 'BO1' | 'BO3' | 'BO5' | 'BO7';
  readonly games?: readonly GameResult[];
}
```

Generator APIs:

```ts
generateSingleEliminationBracket(participants, {
  seeded: true,
  includeThirdPlace: true,
  byeLabel: 'BYE',
});

generateDoubleEliminationBracket(participants, {
  seeded: true,
  grandFinal: 'single' | 'bracketReset',
});

generateRoundRobinSchedule(participants, {
  points: { win: 3, draw: 1, loss: 0 },
});
```

## What to Avoid

- Do not build SaaS before the library dominates OSS bracket rendering.
- Do not prioritize AI-related features for this roadmap.
- Do not add framework adapters before React usage is proven.
- Do not overbuild tournament management into the renderer; expose helpers but keep the core focused on depiction.
- Do not make custom cards require SVG `foreignObject` if it breaks form controls or mobile interactions.
- Do not ship new formats without real examples and tests for odd entrant counts.

## Success Metrics

| Horizon   | Metrics                                                                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 30 days   | Generic types documented; participant-list generator shipped; byes work; seeds/countries render; print CSS demo; accessibility improvements.   |
| 90 days   | Double elimination and round robin examples; migration guide; docs indexed; external users can build real brackets without custom layout code. |
| 6 months  | Groups-to-knockout, BO3/BO5, export formats, score correction, adapters.                                                                       |
| 12 months | Swiss, placement matches, WCAG 2.1 AA, large-bracket performance, complete docs.                                                               |

## Final Recommendation

The shortest path to becoming the best open-source tournament bracket depiction library is:

1. Make the API generic and sport-neutral.
2. Make bracket creation easy with generators.
3. Handle real participant counts with seeding and byes.
4. Add double elimination and round robin before anything else.
5. Make export, print, accessibility, and docs first-class.
6. Add Swiss, groups, placement, and data adapters after the core formats are stable.

If Graph Render executes this roadmap, it can occupy a clear market position: **the modern, TypeScript-first, React-native, MIT-licensed bracket renderer for every tournament format.**
