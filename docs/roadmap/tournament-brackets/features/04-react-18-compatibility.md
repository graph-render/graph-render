# Feature 04: React 18 Compatibility

## Description

React 19-only positioning blocks many production applications. React 18 support should be added if the current implementation is technically compatible.

## Requirements

- Audit `@graph-render/react` and `@graph-render/tournament-tree` for React 19-only APIs.
- Widen peer dependencies only after tests pass.
- Add CI matrix for React 18 and React 19.
- Document supported React versions clearly.

## Acceptance Criteria

- React 18 sample app renders `TournamentBracket`.
- React 19 sample app still passes.
- Peer dependency warnings disappear for React 18 users.
- Docs show compatibility table.
