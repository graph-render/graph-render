# Feature 09: Double Elimination

## Description

Double elimination is required for esports and many competitive events. The library needs winners bracket, losers bracket, grand final, and optional bracket reset support.

## Requirements

- Add `bracketSection: 'winners' | 'losers' | 'grandFinal'`.
- Add `matchType: 'grandFinal'`.
- Add a double-elimination generator.
- Add layout for winners bracket above losers bracket.
- Route drop edges from winners bracket losers into losers bracket.
- Support optional bracket reset / second final.
- Add 8-, 16-, and 32-player examples.

## Acceptance Criteria

- Winners, losers, and grand-final sections are clearly labeled.
- 16-player double-elimination bracket renders without overlap.
- Drop edges are visually understandable.
- Generated graph can be customized with custom match cards.
