# Feature 14: Live Update API

## Description

The library should support live data updates without owning WebSocket infrastructure. Consumers provide updated data; Graph Render handles clean rendering.

## Requirements

- Add controlled update patterns.
- Add `onMatchUpdate` callback shape for editable/custom cards.
- Support live/upcoming/completed status transitions.
- Animate score/status changes with reduced-motion support.
- Keep transport out of scope.

## Acceptance Criteria

- Consumer can update a live score without remounting the whole bracket.
- Live indicator and score display update correctly.
- No WebSocket/server dependency is introduced.
- Docs include polling and WebSocket examples as consumer-side patterns.
