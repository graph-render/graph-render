# Feature 05: Seed and Country Rendering

## Description

The data model already contains seed and country fields, but the default card should display them. Seeds and country labels are essential for sports brackets.

## Requirements

- Render `seed` visibly in both HTML and SVG card modes.
- Render `country` as text code initially; flag icons can be optional later.
- Keep layout stable when seed/country are absent.
- Add appearance tokens for seed/country styling.
- Add Storybook examples with international players.

## Acceptance Criteria

- Seed numbers appear in default match cards.
- Country codes appear without breaking compact mode.
- SVG export includes seed and country text.
- Existing examples without seed/country remain unchanged.
