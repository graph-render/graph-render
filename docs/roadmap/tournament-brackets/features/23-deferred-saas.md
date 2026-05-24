# Feature 23: Deferred SaaS Scope

## Description

A hosted tournament platform may be valuable later, but it should not be part of the open-source bracket-rendering roadmap now.

## Requirements

- Keep library usable without accounts, servers, or paid APIs.
- Do not build auth, billing, organizer dashboards, or hosted pages before OSS traction.
- Focus on rendering, generators, adapters, export, and accessibility.
- Reconsider SaaS only after clear adoption signals.

## Acceptance Criteria

- No SaaS-specific code enters core packages.
- Docs position Graph Render as an embeddable OSS library.
- Future SaaS ideas are tracked separately from library roadmap.
