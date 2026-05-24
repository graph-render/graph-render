# Feature 03: Seeding and Byes

## Description

Real tournaments rarely have perfect powers of two. The library must handle arbitrary entrant counts and standard seeding without visual hacks.

## Requirements

- Round entrant counts up to the next power of two.
- Insert bye slots automatically.
- Render bye/walkover slots clearly.
- Advance players over byes in generated metadata.
- Support standard seeding, manual seed order, and random draw.
- Ensure byes do not create compressed or cut-off brackets.

## Suggested API

```ts
generateSingleEliminationBracket(players, {
  seeding: 'standard',
  byeLabel: 'BYE',
});
```

## Acceptance Criteria

- 5-, 6-, 7-, 9-, 10-, 12-, and 14-player examples render correctly.
- No empty connector lines appear for missing participants.
- Bye matches are visually distinguishable and accessible.
- Seeded examples place top seeds correctly.
