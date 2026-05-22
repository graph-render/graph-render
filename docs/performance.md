# Performance Guidelines

Graph rendering performance is part of the public contract.

## Required practices

1. Keep layout and routing memoization independent from telemetry callback identity.
2. Use maps/sets for repeated node and edge lookups.
3. Keep pointer, hover, wheel, and keyboard handlers referentially stable where possible.
4. Prefer refs for transient gesture state that does not need to render.
5. Culling may over-render, but must never remove edges or nodes that are visible.
6. Avoid spreading large graph arrays into variadic functions such as `Math.min` and `Math.max`.

## Benchmark gate

Run the benchmark suite before merging performance-sensitive changes:

```bash
yarn bench
```

The benchmark suite covers representative medium and large fixtures for core layout/routing,
React model adaptation, viewport culling, and tournament graph adaptation. Benchmarks are not a
replacement for user-facing profiling, but they are the minimum guardrail for detecting accidental
algorithmic regressions in public graph rendering paths.

Changes that affect layout, routing, culling, search/highlighting, SVG export, node measurement,
or tournament graph adaptation must either keep benchmark results within the existing range or
include an explicit explanation of the trade-off in the pull request.

## Benchmark targets

Performance-sensitive changes should be evaluated with small, medium, and large graph fixtures covering layout, routing, initial render, pan/zoom, hover, selection, and export.
