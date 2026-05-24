# Feature 06: Match-Card Accessibility

## Description

Most bracket libraries neglect accessibility. Graph Render should make bracket nodes understandable and navigable for keyboard and screen-reader users.

## Requirements

- Add `role`, `aria-label`, and `tabIndex` to match-card containers.
- Add focus-visible styles.
- Describe players, status, round, winner, and score in accessible text.
- Add keyboard activation for match click actions.
- Add keyboard stage navigation.
- Respect `prefers-reduced-motion`.
- Add accessibility tests where practical.

## Acceptance Criteria

- Keyboard users can focus match cards.
- Screen readers receive useful match summaries.
- Live matches announce status changes politely.
- Axe checks do not report obvious bracket-card violations.
