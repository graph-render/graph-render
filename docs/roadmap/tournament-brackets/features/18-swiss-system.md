# Feature 18: Swiss System

## Description

Swiss tournaments are common in chess, card games, qualifiers, and some esports. OSS bracket rendering support is weak.

## Requirements

- Add Swiss round and pairing types.
- Render round-by-round pairings.
- Render standings with points and tie-breakers.
- Keep pairing generation separate from rendering if complex.
- Support manual pairings first.

## Acceptance Criteria

- Swiss event with 5 rounds renders pairings and standings.
- Points are computed from results.
- Manual pairings are supported.
- Docs explain Swiss limitations and expected data shape.
