# Feature 21: CSS Variable Theme Bridge

## Description

The appearance API is strong, but many users customize design systems with CSS variables. Add a bridge without replacing the typed appearance API.

## Requirements

- Generate `--gr-*` variables from appearance tokens.
- Allow consumers to override variables in CSS.
- Keep TypeScript appearance object as canonical.
- Document mapping between tokens and CSS variables.

## Acceptance Criteria

- Theme can be adjusted through CSS custom properties.
- Existing appearance prop remains fully supported.
- Docs include Tailwind/design-system integration example.
