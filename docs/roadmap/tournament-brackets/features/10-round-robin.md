# Feature 10: Round Robin

## Description

Round robin is not a tree. It should be rendered as standings plus schedule, not forced through the graph layout engine.

## Requirements

- Add `RoundRobinGroup` and `RoundRobinMatch` types.
- Add schedule generator.
- Add standings calculation.
- Support configurable points rules.
- Render standings table and round schedule.
- Share appearance tokens with `TournamentBracket`.

## Suggested API

```tsx
<RoundRobinBracket participants={players} matches={matches} points={{ win: 3, draw: 1, loss: 0 }} />
```

## Acceptance Criteria

- Standings update from completed match results.
- Schedule view groups matches by round.
- Ties can be represented.
- Docs include a group-stage example.
