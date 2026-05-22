# Contributing to Graph Render

Thank you for your interest in contributing. This monorepo publishes `@graph-render/types`, `@graph-render/core`, `@graph-render/react`, and `@graph-render/tournament-tree`.

## Development setup

1. Install Node.js 20+ and Yarn.
2. Clone the repository and run `yarn install`.
3. Run the full quality gate before opening a PR:

```bash
yarn quality
```

For changes that can affect graph rendering cost, also run:

```bash
yarn bench
```

## Package layout

| Path                        | Package                         |
| --------------------------- | ------------------------------- |
| `src/types`                 | `@graph-render/types`           |
| `src/core-graph-render`     | `@graph-render/core`            |
| `src/react-graph-render`    | `@graph-render/react`           |
| `src/react-tournament-tree` | `@graph-render/tournament-tree` |

React-specific types live in `@graph-render/types/react`. Framework-neutral contracts stay on the root `@graph-render/types` entry.

## Pull requests

- Keep changes focused; one concern per PR when possible.
- Add or update tests for behavior changes.
- Add or update benchmarks for layout, routing, culling, export, or interaction performance changes.
- Update README snippets when public APIs change (`vertexComponent` is required on `<Graph />`).
- Follow existing ESLint and Prettier settings (`yarn lint`, `yarn format:check`).
- Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

## Reporting issues

Please include a minimal reproduction, expected vs actual behavior, and versions of React and the `@graph-render/*` packages you are using.
