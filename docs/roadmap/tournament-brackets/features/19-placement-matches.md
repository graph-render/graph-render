# Feature 19: Placement Matches

## Description

Placement matches determine ranks beyond the winner, such as 5th/6th and 7th/8th. These are common in youth, amateur, and federation events.

## Requirements

- Add `matchType: 'placement'`.
- Allow generators to create placement rounds.
- Label placement matches clearly.
- Support custom placement labels.
- Keep placement branches visually separate from main championship path.

## Acceptance Criteria

- 8-player bracket can render 1st through 8th placement matches.
- Placement matches export and print correctly.
- Accessibility labels include placement purpose.
