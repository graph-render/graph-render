# Feature 12: Best-of-N Series

## Description

Esports, racket sports, and playoff events often use BO1, BO3, BO5, or BO7 series. A match card needs game/map-level score display.

## Requirements

- Add `seriesFormat`.
- Add `GameResult[]`.
- Render game/map scores.
- Compute series winner from game winners when possible.
- Keep existing set/tiebreak support working.

## Suggested API

```ts
export interface GameResult {
  readonly label?: string;
  readonly scores: readonly [number, number];
  readonly winner?: 0 | 1;
}
```

## Acceptance Criteria

- BO3 and BO5 examples render clearly.
- Map/game labels can be shown.
- Winner highlight is based on series result.
- Compact mode remains usable.
