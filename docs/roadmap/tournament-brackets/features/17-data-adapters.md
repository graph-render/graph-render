# Feature 17: Data Adapters

## Description

Many users already have tournament data in SaaS platforms or spreadsheets. Adapters reduce migration friction.

## Requirements

- Add adapter subpath.
- Provide pure conversion helpers, no network calls.
- Start with CSV/JSON and Challonge.
- Add start.gg and Toornament after shape validation.
- Keep platform SDKs out of runtime dependencies.

## Suggested API

```ts
import { fromChallonge } from '@graph-render/tournament-tree/adapters';

const graph = fromChallonge({ participants, matches });
```

## Acceptance Criteria

- Adapters are tree-shakeable.
- Docs show expected input payloads.
- Conversion failures return actionable errors.
- Adapter tests include realistic fixtures.
