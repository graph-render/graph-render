# Feature 11: Groups to Knockout

## Description

Many real tournaments start with pools/groups and advance top participants to an elimination bracket.

## Requirements

- Add `MultiStageTournament` container type.
- Support group stages as round-robin groups.
- Support elimination stages as generated or provided brackets.
- Define advancement rules.
- Render stage tabs or stage selector.
- Show which participants advanced.

## Suggested API

```ts
export type TournamentStage =
  | { type: 'groups'; groups: RoundRobinGroup[] }
  | { type: 'elimination'; format: 'single' | 'double'; bracket: NxGraphInput };
```

## Acceptance Criteria

- Demo shows two groups feeding a semifinal bracket.
- Advanced participants are visible in the knockout stage.
- Docs explain manual and computed advancement.
