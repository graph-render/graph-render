# Graph Render

[![Release](https://github.com/graph-render/graph-render/actions/workflows/release.yml/badge.svg)](https://github.com/graph-render/graph-render/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

**Render interactive graphs and tournament brackets in React.**

Graph Render is a composable set of fully-typed TypeScript packages — from a framework-agnostic layout engine to a ready-made squash tournament bracket component.

📖 **[Live Storybook — layouts, routing, theming, custom nodes, bracket demos](https://graph-render.github.io/graph-render)**

---

## Packages

| Package                                                      | Version                                                                                                                               | Description                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [`@graph-render/tournament-tree`](src/react-tournament-tree) | [![npm](https://img.shields.io/npm/v/@graph-render/tournament-tree.svg)](https://www.npmjs.com/package/@graph-render/tournament-tree) | Ready-made tournament bracket UI for React   |
| [`@graph-render/react`](src/react-graph-render)              | [![npm](https://img.shields.io/npm/v/@graph-render/react.svg)](https://www.npmjs.com/package/@graph-render/react)                     | Interactive graph canvas for React           |
| [`@graph-render/core`](src/core-graph-render)                | [![npm](https://img.shields.io/npm/v/@graph-render/core.svg)](https://www.npmjs.com/package/@graph-render/core)                       | Framework-agnostic layout and routing engine |
| [`@graph-render/types`](src/types)                           | [![npm](https://img.shields.io/npm/v/@graph-render/types.svg)](https://www.npmjs.com/package/@graph-render/types)                     | Shared TypeScript types for all packages     |

---

## Quick Start

```bash
yarn add @graph-render/react @graph-render/core @graph-render/types
```

```tsx
import { DefaultGraphVertex, Graph } from '@graph-render/react';

const graph = {
  nodes: {
    start: { label: 'Start' },
    finish: { label: 'Finish' },
  },
  adj: {
    start: { finish: { id: 'path' } },
    finish: {},
  },
};

export function Example() {
  return <Graph graph={graph} vertexComponent={DefaultGraphVertex} />;
}
```

For the ready-made bracket UI:

```bash
yarn add @graph-render/tournament-tree @graph-render/react @graph-render/core @graph-render/types
```

React-specific public types are exported from `@graph-render/types/react`. Tournament-specific
public types are exported from `@graph-render/types/tournament`. The root `@graph-render/types`
package stays framework-neutral and domain-neutral.

---

## License

MIT — free for personal and commercial use.

<!-- dummy -->
