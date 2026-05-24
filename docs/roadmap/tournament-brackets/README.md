# Tournament Bracket Roadmap

Goal: make `@graph-render/tournament-tree` the best open-source library for depicting tournament brackets. This roadmap is tournament-only: no AI, no SaaS-first work, no collaboration platform, and no unrelated graph-product bets.

## Positioning

Graph Render should become the modern, TypeScript-first, React-native, MIT-licensed bracket renderer for every common tournament format.

The winning angle is not "another bracket component." It is:
NO

- generic tournament data model;
- reliable bracket generators;
- broad format coverage;
- polished default UI;
- custom match-card rendering;
- strong export/print support;
- accessibility;
- real-world organizer workflows.

## Roadmap Phases

| Phase               | Timeline  | Goal                                                                                                   |
| ------------------- | --------- | ------------------------------------------------------------------------------------------------------ |
| Foundation          | 30 days   | Remove adoption blockers and make single elimination generic, easy, accessible, and printable.         |
| Format Expansion I  | 90 days   | Add double elimination and round robin with strong docs/examples.                                      |
| Format Expansion II | 6 months  | Add groups-to-knockout, best-of-N series, score workflows, export formats, localization, and adapters. |
| Completeness        | 12 months | Add Swiss, placement matches, WCAG 2.1 AA, large-bracket optimization, and deeper theming.             |

## Feature Requirement Files

|   # | Feature                            | Priority | Horizon    | File                                                                              |
| --: | ---------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------- |
|   1 | Generic tournament model           | Must     | 30 days    | [01-generic-tournament-model.md](features/01-generic-tournament-model.md)         |
|   2 | Single-elimination generator       | Must     | 30 days    | [02-single-elimination-generator.md](features/02-single-elimination-generator.md) |
|   3 | Seeding and byes                   | Must     | 30 days    | [03-seeding-and-byes.md](features/03-seeding-and-byes.md)                         |
|   4 | React 18 compatibility             | Must     | 30 days    | [04-react-18-compatibility.md](features/04-react-18-compatibility.md)             |
|   5 | Seed and country rendering         | Must     | 30 days    | [05-seed-country-rendering.md](features/05-seed-country-rendering.md)             |
|   6 | Match-card accessibility           | Must     | 30 days    | [06-match-card-accessibility.md](features/06-match-card-accessibility.md)         |
|   7 | Print CSS                          | Should   | 30 days    | [07-print-css.md](features/07-print-css.md)                                       |
|   8 | Bronze / third-place match         | Should   | 30-90 days | [08-bronze-third-place-match.md](features/08-bronze-third-place-match.md)         |
|   9 | Double elimination                 | Must     | 90 days    | [09-double-elimination.md](features/09-double-elimination.md)                     |
|  10 | Round robin                        | Should   | 90 days    | [10-round-robin.md](features/10-round-robin.md)                                   |
|  11 | Groups to knockout                 | Should   | 6 months   | [11-groups-to-knockout.md](features/11-groups-to-knockout.md)                     |
|  12 | Best-of-N series                   | Should   | 6 months   | [12-best-of-n-series.md](features/12-best-of-n-series.md)                         |
|  13 | Score correction API               | Should   | 6 months   | [13-score-correction-api.md](features/13-score-correction-api.md)                 |
|  14 | Live update API                    | Should   | 6 months   | [14-live-update-api.md](features/14-live-update-api.md)                           |
|  15 | Localization and schedule metadata | Should   | 6 months   | [15-localization-schedule.md](features/15-localization-schedule.md)               |
|  16 | PNG/PDF export                     | Should   | 6 months   | [16-png-pdf-export.md](features/16-png-pdf-export.md)                             |
|  17 | Data adapters                      | Could    | 6 months   | [17-data-adapters.md](features/17-data-adapters.md)                               |
|  18 | Swiss system                       | Could    | 12 months  | [18-swiss-system.md](features/18-swiss-system.md)                                 |
|  19 | Placement matches                  | Could    | 12 months  | [19-placement-matches.md](features/19-placement-matches.md)                       |
|  20 | Large-bracket optimization         | Could    | 12 months  | [20-large-bracket-optimization.md](features/20-large-bracket-optimization.md)     |
|  21 | CSS variable theme bridge          | Could    | 12 months  | [21-css-variable-theme-bridge.md](features/21-css-variable-theme-bridge.md)       |
|  22 | Framework adapters decision        | Later    | 12 months+ | [22-framework-adapters.md](features/22-framework-adapters.md)                     |
|  23 | Deferred SaaS scope                | Not now  | Later      | [23-deferred-saas.md](features/23-deferred-saas.md)                               |

## Execution Rules

1. Build format correctness before monetization.
2. Keep the renderer usable without a hosted backend.
3. Keep generic types primary and sport-specific examples secondary.
4. Do not ship a format without generator utilities and Storybook examples.
5. Do not ship new visual features without accessibility and export considerations.
6. Keep React-specific UI above the core graph/tournament model.

## Definition of Best Open-Source Bracket Library

Graph Render reaches the target when it can render:

- single elimination;
- byes and arbitrary entrant counts;
- bronze and placement matches;
- double elimination;
- round robin;
- groups to knockout;
- Swiss;
- best-of-N series;
- large brackets;
- printable/exportable brackets;
- accessible brackets;
- imported brackets from common tournament platforms.
