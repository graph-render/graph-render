# Feature 13: Score Correction API

## Description

Organizers make mistakes. If a score is corrected after a winner advanced, downstream matches must be reset or recalculated safely.

## Requirements

- Add helpers to update match scores.
- Recompute match winner.
- Detect when downstream participants must be removed or replaced.
- Provide explicit correction result object.
- Avoid silent destructive changes.

## Suggested API

```ts
const result = correctMatchResult(graph, matchId, {
  scores: [
    [11, 8],
    [9, 11],
    [11, 6],
  ],
});
```

## Acceptance Criteria

- Correction can change winner.
- Downstream affected matches are reported.
- Consumer decides whether to apply cascade.
- Tests cover winner changes and no-winner changes.
