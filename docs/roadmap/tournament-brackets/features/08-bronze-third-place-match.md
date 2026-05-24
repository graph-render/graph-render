# Feature 08: Bronze / Third-Place Match

## Description

Many tournaments require a match between semifinal losers to decide third place. This should be a semantic feature, not a manual custom node hack.

## Requirements

- Add `matchType: 'thirdPlace'`.
- Generator can add a third-place match.
- Render third-place label/badge.
- Support custom label text.
- Ensure export and print include the match.

## Acceptance Criteria

- Generated 8-player bracket can include a third-place match.
- Third-place match is visually distinct but consistent.
- Accessibility label describes it as a third-place match.
- Docs explain how semifinal losers feed into the match.
