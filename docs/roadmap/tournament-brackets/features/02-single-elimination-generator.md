# Feature 02: Single-Elimination Generator

## Description

Developers should not hand-write graph adjacency maps for a basic bracket. They should pass participants and options, then receive a ready-to-render graph.

## Requirements

- Add `generateSingleEliminationBracket(participants, options)`.
- Accept participant strings or `MatchPlayer` objects.
- Generate stable match IDs.
- Generate all rounds needed for the bracket.
- Support optional third-place match.
- Support seeded and unseeded draw modes.
- Return the same graph shape accepted by `TournamentBracket`.

## Suggested API

```ts
generateSingleEliminationBracket(participants, {
  seeded: true,
  includeThirdPlace: true,
  byeLabel: 'BYE',
});
```

## Acceptance Criteria

- 2-, 4-, 8-, 16-, and 32-player brackets generate correctly.
- 3-, 6-, 10-, 12-, and 14-player brackets generate with byes.
- Generated graph renders without manual edits.
- Storybook includes generated bracket examples.
