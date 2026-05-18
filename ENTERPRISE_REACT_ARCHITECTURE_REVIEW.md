# Deep Enterprise React Architecture Review

## Executive Summary

This solution is **not enterprise-ready**. The codebase has a reasonable monorepo split (`types` → `core` → `react` → `tournament`) and strict TypeScript/linting intent, but the implementation falls short of large-scale production and open-source-maintainer standards because correctness, accessibility, performance, package boundaries, and test coverage are not enforced by enough architecture.

The largest architectural risks are:

1. **No tests in `src/*/src` and no package test targets** for the public libraries. Graph parsing, routing, layout, React interaction, accessibility, export, and tournament navigation can regress silently.
2. **Clean Architecture boundary leak**: foundational `@graph-render/types` and pure `@graph-render/core` public APIs export React-specific contracts.
3. **Public React APIs are overloaded with flat booleans and callbacks**, creating hidden mode combinations that will become unstable as features grow.
4. **Interactive graph accessibility is incomplete**: focus visibility, graph instructions, node names, edge keyboard access, SVG controls, live status, and icon-button labels are not consistently implemented.
5. **Scaling performance is not designed in**: full SVG trees update during pointer movement, every edge/node renders without viewport culling, and node measurement causes N independent layout reads.
6. **Package publishing hygiene is weak**: no `files` whitelist, incomplete Vite externals, no `sideEffects` metadata, and documentation examples that do not compile against required props.

Maintainability is acceptable for a small team but not for a long-lived enterprise/open-source project. Scalability is constrained by graph rendering architecture and state update granularity. TypeScript is strict, but the domain model still leaks `unknown`, unsafe casts, and package-level React coupling. Security is not obviously catastrophic, but SVG export, parser sanitization, runtime validation, and error handling need stronger guarantees.

## Final Score

| Area | Score |
|---|---:|
| Architecture | 58 / 100 |
| React Quality | 55 / 100 |
| SOLID Compliance | 57 / 100 |
| Maintainability | 56 / 100 |
| Scalability | 49 / 100 |
| Performance | 47 / 100 |
| Type Safety | 63 / 100 |
| Testing | 5 / 100 |
| Security | 54 / 100 |
| Open Source Readiness | 46 / 100 |
| **Overall Final Score** | **49 / 100** |

**Estimated Engineering Level:** Senior. The code shows typed decomposition and some good React practices, but the lack of tests, weak public API boundaries, accessibility gaps, and missed performance architecture keep it below Staff/Principal-level maintainability.

## Required Review Area Assessment

### 1. Architecture Review

The workspace split is directionally correct: shared types, pure core graph engine, React renderer, and tournament UI. However, the boundary is compromised because root types and core exports include React contracts. The architecture is closer to a layered monorepo than Clean Architecture, Feature-Sliced Design, Hexagonal Architecture, or Atomic Design. There are no enforced feature-level public/private APIs beyond package boundaries, and package source modules expose many internal seams through broad index exports while omitting other seams needed for supported extensibility.

The most serious architecture smells are: public APIs as prop bags, React contracts inside foundational packages, no testable use-case layer for graph/tournament workflows, render-time sync components (`GraphStageSync`) used for state propagation, and no architecture around large graph rendering.

### 2. React Best Practices Review

The code uses memoization, hooks, and decomposition, but not consistently enough for graph-scale interaction. Pointer move updates drive React state through the full SVG tree. Edge callbacks are recreated inside maps. Node measurement schedules one RAF per node and calls `getBBox`. Selection/search cleanup effects emit derived state after render. Accessibility does not meet enterprise standards for interactive canvas-like widgets.

### 3. SOLID Principles Review

SRP is violated by `Graph` owning rendering orchestration, interaction modes, viewport, selection, search, collapse, hover, model errors, controls, overlays, and imperative API. OCP is weak because new modes require adding booleans and conditionals to central components. ISP is weak because `GraphProps` and `TournamentBracketProps` force consumers through large interfaces. DIP is partial: layout/routing overrides exist, but React UI types leak into core exports and tournament depends directly on renderer implementation details.

### 4. GRASP Principles Review

Information Expert is often assigned correctly in utilities, but Controller responsibilities are too centralized in `Graph` and `TournamentBracket`. Low Coupling is violated by types/core React coupling and tournament reliance on graph internals. Protected Variations is weak around public props and package exports. Pure Fabrication is used for utilities, but test coverage does not protect those fabricated modules.

### 5. State Management Review

There is no external global state library, which is good for library components. Local state is mostly colocated, but ownership is inconsistent: stage views are computed inside a render overlay and pushed upward through an effect; theme mode claims document ownership but only toggles local state; controlled/uncontrolled selection and focus cleanup is effect-driven. Server state is not applicable. Caching is limited to internal layout caching, with no tests proving invalidation or correctness.

### 6. Communication Between Components

Parent-child communication relies heavily on callbacks and render callbacks. That is acceptable for a library, but the volume of callback props and boolean modes creates fragile implicit coupling. Tournament stage synchronization via an invisible overlay component is particularly indirect: rendering a graph overlay mutates bracket navigation state after commit.

### 7. TypeScript Review

Compiler settings are strict, and many models are readonly. The weak areas are generic defaults to `unknown`, unsafe casts from generic graph nodes to squash nodes, React types exported from the foundational type package, and runtime input sanitization that silently changes data instead of rejecting invalid data. DTO/domain separation is not explicit enough for user-supplied graph input vs normalized graph model.

### 8. Performance Review

Performance is not enterprise-scale. There is no viewport culling or level-of-detail rendering. SVG rendering is acceptable for small graphs but will degrade with dense graphs. Pointer movement and pinch zoom update React state directly. Node measurement and graph bounds work can force repeated layout/calculation. Tournament stage bounds use spread/map patterns that will hit argument limits on large data.

### 9. Testing Review

Testing maturity is effectively absent. `find src/*/src -name "*.test.ts*"` returns zero test files. Project configs define build/lint/format but no package test targets. For public libraries with parser, layout, routing, SVG, keyboard interaction, accessibility, and export behavior, this is a blocking open-source and enterprise-readiness failure.

### 10. Security & Stability Review

The parser has data-integrity bugs around edge endpoint override and silent point filtering. SVG export serializes cloned SVG and downloads it; it avoids `dangerouslySetInnerHTML`, but export behavior and user content escaping need tests. Error boundaries exist for squash nodes, but graph-level interaction/runtime errors are not uniformly resilient. SSR/hydration safety is weak in document theme detection.

### 11. Open Source & Enterprise Standards

The repository has CI, linting, formatting, release workflows, package README files, and strict TS config. It lacks test targets, package `files` whitelists, proven npm pack output, mature contribution/onboarding documentation in the root README, and stable public/private API boundaries. Documentation contains at least one compile-breaking example and one behavior claim contradicted by implementation.

## Detailed Findings

### Critical

| ID | Affected files | Explanation | Risks | Long-term consequences | Exact improvement recommendation |
|---|---|---|---|---|---|
| C1 | `src/core-graph-render/src/utils/graphParser/edges.ts:59`, `src/core-graph-render/src/utils/graphParser/edges.ts:66` | Edge attrs destructure `id`, `type`, `points`, `meta`, then spread `...rest` after canonical `source` and `target`. Runtime input can override validated endpoints. | Invalid topology, routing crashes, graph corruption, validation bypass. | Parser cannot be trusted as a domain boundary; downstream rendering bugs become untraceable. | Exclude `source`/`target` from rest or spread rest first and set canonical fields last. Add regression tests proving raw attrs cannot override parser-derived endpoints. |
| C2 | `src/types/project.json:6`, `src/core-graph-render/project.json:6`, `src/react-graph-render/project.json:6`, `src/react-tournament-tree/project.json:6` | Public packages have build/lint/format/storybook targets but no test target, and the source tree has zero `*.test.ts(x)` / `*.spec.ts(x)` files. | Any parser, layout, routing, interaction, accessibility, export, or package API regression can ship. | Team velocity collapses as the codebase grows because refactors are unsafe and maintainers must rely on manual QA. | Add Vitest targets per package and start with parser invariants, layout/routing correctness, keyboard/pointer behavior, accessibility labels, tournament normalization, and SVG export tests. |

### High

| ID | Affected files | Explanation | Risks | Long-term consequences | Exact improvement recommendation |
|---|---|---|---|---|---|
| H1 | `src/types/src/index.ts:8`, `src/types/src/react.ts:1`, `src/core-graph-render/src/index.ts:6` | Root `@graph-render/types` and pure `@graph-render/core` export React-specific contracts. | Non-React consumers inherit React type requirements; pure core is no longer framework-independent. | Clean Architecture boundary decays; every new UI adapter will inherit React coupling. | Move React contracts to `@graph-render/react` or a dedicated `@graph-render/types/react` subpath with explicit peer/type dependencies. Keep root types renderer-neutral. |
| H2 | `src/react-graph-render/src/components/Graph.tsx:385` | Focusable SVG sets `outline: 'none'` without a visible `:focus-visible` replacement. | Keyboard users can lose focus location. | Accessibility compliance fails for core interactive component. | Remove outline override or add a visible focus ring/stroke/class for `:focus-visible`. |
| H3 | `src/react-graph-render/src/components/Graph.tsx:422` | Interactive keyboard graph is exposed as `role="figure"` with no keyboard instructions. | Assistive-tech users do not know that arrows/zoom/select shortcuts exist. | Graph becomes inaccessible as interaction modes expand. | Add `aria-describedby` instructions and choose an explicit semantics model: `figure`/`img` for read-only, or carefully justified `application` for full keyboard canvas behavior. |
| H4 | `src/react-graph-render/src/components/GraphNode.tsx:139` | Graph nodes use `role="button"` but have no accessible name. | Screen readers announce anonymous buttons. | Node interaction is not usable in assistive tech. | Add `aria-label`/`aria-labelledby` from node label/id and expose selected/focused state consistently. |
| H5 | `src/react-graph-render/src/components/EdgePath.tsx:49` | Selectable edge hit paths are pointer-only: no role, tab stop, accessible name, or keyboard activation. | Keyboard users cannot select edges. | Edge features remain mouse-only and violate parity requirements. | When edge selection is enabled, add `role="button"`, `tabIndex={0}`, `aria-label`, and Enter/Space handling, or provide an alternate keyboard edge-selection model. |
| H6 | `src/react-graph-render/src/components/GraphViewportControls.tsx:77` | SVG viewport controls are `<g role="button">` with symbolic text and no explicit accessible labels. | Control purpose is ambiguous or unavailable to AT. | Built-in controls are not production-grade UI primitives. | Add per-control `aria-label` values and make decorative text/icons hidden from AT; consider HTML buttons over SVG groups. |
| H7 | `src/react-graph-render/src/hooks/useGraphPointerInteractions.ts:149` | Panning/pinch updates viewport React state on every pointer move. | Full SVG tree can re-render at input frequency. | Large graphs will feel broken under drag/zoom. | Use refs plus `requestAnimationFrame` batching; commit state at frame rate or gesture end and keep DOM transform updates isolated. |
| H8 | `src/react-graph-render/src/hooks/useGraphNodeMeasurement.ts:32`, `src/react-graph-render/src/hooks/useGraphNodeMeasurement.ts:39` | Each node schedules its own RAF and calls `getBBox`. | N layout reads and layout thrash for large graphs. | Large graphs scale poorly even before edge/node rendering cost. | Centralize measurement with one scheduler/ResizeObserver and skip measurement for fixed-size nodes. |
| H9 | `src/react-graph-render/src/hooks/useGraphViewportController.ts:61` | Content bounds are recomputed synchronously on every graph render. | Hover/selection/viewport changes redo bounds work. | Interaction performance worsens with graph size. | Memoize `getContentBounds(cfg, positionedEdges, positionedNodes)` by bounds-affecting config and positioned arrays. |
| H10 | `src/react-tournament-tree/vite.config.ts:14` | `react-dom/client` is used by export code but not externalized. | Library bundle can include React DOM subpaths or create duplicate runtimes. | Consumers may hit hooks/runtime duplication and bundle bloat. | Externalize `react`, `react/jsx-runtime`, `react/jsx-dev-runtime`, `react-dom`, and `react-dom/client`. |
| H11 | `src/react-tournament-tree/src/components/BracketToolbar.tsx:43`, `src/react-tournament-tree/src/components/BracketToolbar.tsx:47`, `src/react-tournament-tree/src/components/BracketToolbar.tsx:69` | Icon-only toolbar buttons rely on `title`; navigation toggle also lacks `aria-pressed`. | Touch and AT users miss button purpose/state. | Public tournament toolbar fails baseline accessibility. | Add explicit dynamic `aria-label` values and `aria-pressed={isNavigationMode}` where stateful. |
| H12 | `src/react-tournament-tree/src/components/Bracket/FloatingToolbarButton.tsx:43` | Floating icon-only navigation toggle has `aria-pressed` but no accessible action name. | Screen reader users cannot identify the action. | Navigation mode is not accessible. | Add dynamic `aria-label` such as `Enter Navigation Mode` / `Exit Navigation Mode`. |
| H13 | `src/react-tournament-tree/src/components/SquashNode/SquashNodeHtml.tsx:43`, `src/react-tournament-tree/src/components/SquashNode/SquashNodeSvg.tsx:61` | Live match state is color/animation-only in HTML and no text alternative in SVG. | Status is invisible to screen readers and color-blind users. | Real-time state becomes inaccessible and legally risky. | Add visible or visually hidden “Live” text with `role="status"` / `aria-live="polite"` and SVG `<title>`/`aria-label`. |
| H14 | `src/react-tournament-tree/src/hooks/useDocumentDarkMode.ts:6`, `src/react-tournament-tree/src/hooks/useDocumentDarkMode.ts:27`, `src/react-tournament-tree/README.md:106` | Initial state reads document-derived theme, while toggle only flips local state although docs claim document class toggling. | SSR/hydration flicker, mismatched behavior, consumer confusion. | Theme ownership becomes impossible to reason about in apps. | Use `useSyncExternalStore` or deterministic initial state plus effect sync; either mutate document class as source of truth or correct the docs/API. |
| H15 | `src/react-graph-render/package.json:18`, `src/react-tournament-tree/package.json:18` | Public packages have no `files` whitelist. | Published package content depends on npm defaults and local artifacts. | Releases can include missing or unintended files. | Add `"files": ["dist", "README.md", "CHANGELOG.md"]` and validate with `npm pack --dry-run`. |

### Medium

| ID | Affected files | Explanation | Risks | Long-term consequences | Exact improvement recommendation |
|---|---|---|---|---|---|
| M1 | `src/core-graph-render/src/utils/graphParser/nodes.ts:18` | Sanitized node id collisions silently overwrite earlier nodes. | Data loss for ids such as `"a"` and `" a "`. | Parser behavior becomes non-deterministic from a user perspective. | Before `nodeMap.set`, detect duplicate sanitized ids and throw a contextual duplicate-id error. |
| M2 | `src/core-graph-render/src/utils/graphParser/sanitizers.ts:109` | Invalid custom edge points are filtered, not rejected. | Malformed paths become different “valid” paths. | Silent data corruption hides producer bugs. | Reject the entire points array if any point is invalid/non-finite; include edge context in strict parsing errors. |
| M3 | `src/core-graph-render/src/layouts/forceDirected.ts:107`, `src/core-graph-render/src/layouts/forceDirected.ts:230` | Force layout clamps center points as if they were top-left positions, then subtracts half size. | Nodes can render outside padded viewport. | Layout correctness degrades near boundaries and with variable node sizes. | Clamp centers to `[pad + width/2, viewport - pad - width/2]` or consistently store top-left points. |
| M4 | `src/react-graph-render/src/components/Graph.tsx:225` | Selection/focus cleanup is derived-state effect work after render. | Extra commits and controlled callback feedback loops. | Controlled graph state becomes fragile under filtering/collapse/search. | Derive visible selection/focus during render; emit cleanup only on explicit visibility transitions. |
| M5 | `src/react-graph-render/src/components/Graph.tsx:431`, `src/react-graph-render/src/hooks/useGraphWheelZoom.ts:22` | React `onWheel` with `preventDefault()` has no explicit passive/non-passive listener control. | Scroll/trackpad performance can be blocked. | Gesture handling will remain unpredictable across browsers. | Attach a native wheel listener with `{ passive: false }` only while zoom interception is enabled; otherwise do not prevent default. |
| M6 | `src/react-graph-render/src/components/Graph.tsx:72` | `GraphProps` exposes many behavior booleans (`panEnabled`, `zoomEnabled`, `pinchZoomEnabled`, `keyboardNavigation`, `showControls`, selection/search flags). | Hidden mode combinations and broad prop surface. | OCP/ISP violations grow with every feature. | Introduce typed option objects/variants: `interaction`, `selection`, `search`, `controls`; keep flat booleans as deprecated compatibility layer. |
| M7 | `src/react-tournament-tree/src/components/TournamentBracket.tsx:30` | Tournament API repeats boolean-mode growth (`showToolbar`, viewport/navigation/zoom/compact). | Fragile combinations and hard-to-document behavior. | Public API becomes difficult to evolve without breaking changes. | Add structured props/slots: `toolbar`, `navigation`, `viewportControls`, `appearance.density`; deprecate flat booleans gradually. |
| M8 | `src/react-graph-render/src/components/GraphEdgesLayer.tsx:95` | Inline per-edge hover/click callbacks defeat memoization of edge components. | All edges receive new function props on parent render. | Dense graphs re-render more than necessary. | Extract a memoized `GraphEdge` child with stable callbacks, or change edge contract to pass `edgeId` into stable shared handlers. |
| M9 | `src/react-graph-render/src/components/GraphNodesLayer.tsx:65`, `src/react-graph-render/src/components/GraphEdgesLayer.tsx:61` | All nodes and edges are rendered with no viewport culling or LOD path. | Large graphs pay full render cost on hover/pan/zoom. | Library cannot scale beyond small/medium graphs. | Add viewport culling, skip labels/hit paths at low zoom, and document a canvas/WebGL fallback threshold. |
| M10 | `src/react-graph-render/src/hooks/useGraphPointerInteractions.ts:190` | `releasePointerCapture` is called unconditionally. | Can throw if target lost capture or never captured pointer. | Pointer interactions produce rare runtime crashes. | Guard with `hasPointerCapture(event.pointerId)` before release. |
| M11 | `src/react-graph-render/src/hooks/useGraphPointerInteractions.ts:74`, `src/react-graph-render/src/hooks/useGraphPointerInteractions.ts:118` | Pinch handling spreads map values on every touch movement. | Avoidable allocations in hot path. | Mobile pinch performance degrades. | Keep two active pointer refs or iterate map values without allocating arrays. |
| M12 | `src/react-graph-render/src/hooks/useGraphSearchState.ts:83` | Search results callback fires from effect after render for derived results. | Parent feedback loops and extra commit timing. | Search state becomes hard to coordinate in controlled integrations. | Emit only when result ids change via shallow equality, or notify from explicit search-query transition handling. |
| M13 | `src/react-graph-render/src/components/GraphLabels.tsx:26` | Label layer is not memoized and recomputes label/text bounds on unrelated parent renders. | Unnecessary work during interaction. | Label-heavy graphs degrade. | Wrap in `React.memo` and memoize effective labels/minY by positioned nodes and label config. |
| M14 | `src/react-graph-render/src/components/Graph.tsx:550` | React 19 package still uses `forwardRef`. | Not immediately broken, but new API guidance has moved to `ref` as a prop. | Major-version migration becomes larger later. | In the next major, migrate to `ref` prop with compatibility shim if needed. |
| M15 | `src/react-tournament-tree/src/components/BracketGraphCanvas.tsx:54` | Generic `PositionedNode` is cast to `SquashPositionedNode` before invoking public `onMatchClick`. | Consumer callback can receive invalid shape. | Type trust erodes at the library boundary. | Add a type guard/normalizer before calling `onMatchClick`; route invalid data through `onInvalidNode`. |
| M16 | `src/react-tournament-tree/src/hooks/useBracketVertexComponents.tsx:16` | Export vertex component does not pass `compact`. | SVG export can use compact metrics when `compact={false}`. | Export output diverges from on-screen UI. | Pass `compact={compact}` to export `SquashNode` and include `compact` in dependencies. |
| M17 | `src/react-tournament-tree/src/utils/stageViews.ts:14` | Stage bounds use `Math.min(...columnNodes.map(...))` and repeated arrays/spreads. | Performance overhead and argument-limit risk. | Large brackets fail or slow down unexpectedly. | Compute min/max/nodeIds in one loop per column. |
| M18 | `src/react-tournament-tree/src/hooks/useStageNavigation.ts:113` | Every bracket instance attaches a global resize listener and does layout work on every event. | Multi-instance pages multiply work; resize storms cause jank. | Navigation scalability is poor in dashboards/docs. | Use `ResizeObserver` on the viewport and throttle with `requestAnimationFrame`. |
| M19 | `src/react-tournament-tree/src/components/Bracket/BracketFrame.tsx:90` | Swipe container lacks explicit `touchAction`. | Browser gestures can conflict with stage swipe navigation. | Mobile UX remains inconsistent. | Set `touchAction: isNavigationMode ? 'pan-y' : 'auto'` or equivalent. |
| M20 | `src/react-tournament-tree/src/components/BracketHeader.tsx:56` | Bracket title is a plain `div`; long titles lack `minWidth: 0` and overflow handling. | Poor heading navigation and layout breakage for localized/custom text. | Header will fail open-source usage with arbitrary content. | Render configurable heading (`h2` default) and add `minWidth: 0`, truncation/wrap policy. |
| M21 | `src/react-tournament-tree/src/components/Bracket/stage-labels/StageLabelGrid.tsx:46` | Stage labels force `whiteSpace: 'nowrap'` without overflow handling. | Localized/custom labels can break layout. | UI is not localization-safe. | Add ellipsis/max-width or allow balanced wrapping. |
| M22 | `src/react-tournament-tree/src/components/SquashNode/SquashPlayerHtmlRow.tsx:37`, `src/react-tournament-tree/src/components/SquashNode/SquashPlayerSvgRow.tsx:38` | Player path highlighting is mouse-only. | Keyboard/touch users cannot discover equivalent state. | Interaction model is not input-modality neutral. | Add focus/touch equivalents or make hover purely decorative. |
| M23 | `src/react-graph-render/src/index.ts:1` | Public surface exports few hooks/utilities despite central extensibility seams; tournament separately imports renderer utility internals. | Consumers cannot test/extend supported behaviors without relying on internals. | Public API stability becomes accidental. | Define explicit subpath exports for stable hooks/utils or document them as private and stop depending on internal paths across packages. |
| M24 | `src/react-tournament-tree/src/index.ts:1` | `BracketToolbar` is exported without an explicit props contract, making an internal-looking component public. | Public API becomes broader than intended. | Future refactors become breaking changes. | Either stop exporting it or export `BracketToolbarProps` and commit to support. |
| M25 | `src/react-graph-render/package.json:18`, `src/react-tournament-tree/package.json:18` | Packages lack `"sideEffects": false`. | Downstream bundlers have less confidence tree-shaking pure ESM modules. | Consumers pay unnecessary bundle cost. | Add `"sideEffects": false` if modules remain side-effect-free; isolate style/DOM-injection modules if not. |
| M26 | `src/react-graph-render/README.md:44` | Quick Start renders `<Graph>` without required `vertexComponent`. | Documented TypeScript usage fails. | Open-source onboarding loses trust immediately. | Include a minimal `vertexComponent` or make the prop optional with a default renderer. |
| M27 | `src/react-tournament-tree/src/components/BracketGraphCanvas.tsx:74`, `src/react-tournament-tree/src/components/Bracket/GraphStageSync.tsx:24` | Stage synchronization is a render overlay that pushes state upward in an effect. | Rendering has hidden stateful side effects. | Data flow is hard to reason about and test. | Compute stage views in `TournamentBracket`/hook from positioned data, or expose a deliberate graph layout callback instead of an invisible overlay. |
| M28 | `src/core-graph-render/yarn.lock` | A nested package lockfile is tracked under a workspace package. | Dependency source of truth is ambiguous. | Installs and release automation can drift. | Remove nested lockfiles and rely on the root workspace lockfile. |

### Low

| ID | Affected files | Explanation | Risks | Long-term consequences | Exact improvement recommendation |
|---|---|---|---|---|---|
| L1 | `src/react-tournament-tree/src/components/BracketToolbar.tsx:20` | Button style object is rebuilt every render. | Minor memoization noise. | More toolbar props will make this pattern noisier. | Hoist static style fragments or split a small button component. |
| L2 | `src/react-tournament-tree/src/components/SquashNode/SquashNodeContent.tsx:45` | `sharedProps` object and inline handlers are recreated each render. | Mostly acceptable now, but weakens memo boundaries. | More row components will re-render unnecessarily. | Extract stable callbacks with `useCallback` if profiling shows churn, or keep rows intentionally cheap and document that choice. |
| L3 | `src/react-tournament-tree/src/components/BracketHeader.tsx:84` | Badge dot is decorative but not marked as hidden. | Possible noisy AT output depending on rendering. | Minor accessibility inconsistency. | Add `aria-hidden="true"` to decorative visual-only elements where represented in semantic HTML/SVG. |

## SOLID Violations

| Principle | Violations | Better architecture |
|---|---|---|
| SRP | `Graph` coordinates model creation, viewport, gestures, keyboard, selection, collapse, search, hover, controls, overlays, and imperative API. `TournamentBracket` coordinates theme, graph enrichment, labels, stage navigation, export, and rendering. | Split orchestration into smaller controllers/hooks with clear ownership: `useGraphInteractions`, `useGraphSelectionModel`, `useGraphAccessibility`, `useTournamentViewModel`, `useTournamentExport`. Keep page/component shells mostly declarative. |
| OCP | New graph/tournament modes require adding booleans and conditionals to public props and central components. | Use typed option objects, explicit variants, slots, and small strategy interfaces for controls, interaction, and selection/search behavior. |
| LSP | Generic graph renderer callbacks are narrowed with unsafe casts in tournament click handling. | Validate/normalize node meta before invoking squash-specific callbacks. |
| ISP | `GraphProps` and `TournamentBracketProps` are broad prop bags. Consumers must understand unrelated concerns. | Segment props into cohesive interfaces: data, rendering slots, interaction, viewport, selection, search, accessibility, controls. |
| DIP | Core/type packages expose React contracts; tournament imports renderer-level utilities. | Keep core domain independent; depend on abstractions or exported stable renderer APIs only. |

## GRASP Violations

| GRASP principle | Problem | Recommendation |
|---|---|---|
| Controller | `Graph` and `TournamentBracket` are broad controllers. | Move workflows into focused hooks/use-case modules and keep components thin. |
| Information Expert | Parser sanitizers mutate/reshape invalid data silently instead of validating at the boundary. | Make parser/normalizer the explicit information expert and fail loudly for invalid user input. |
| Low Coupling | Types/core depend on React type contracts; tournament depends on renderer utility internals. | Introduce stable package boundaries and subpath APIs. |
| High Cohesion | Public prop bags mix rendering, data, state, theme, viewport, and interaction concerns. | Cohesive option objects and components with one reason to change. |
| Protected Variations | Public exports expose internal-looking components while hiding other extension seams. | Define supported API surfaces and mark internals private. |
| Indirection | `GraphStageSync` uses render overlay indirection to push state. | Replace with explicit graph layout/stage callback or colocated derivation. |

## Architecture Improvement Plan

### Refactoring priorities

1. **Blocker: add tests before large refactors.** Create Vitest targets for all packages. Cover parser hardening, layout invariants, routing, SVG escaping/export, graph keyboard/pointer behavior, toolbar accessibility, tournament normalization, and stage navigation.
2. **Fix parser correctness.** Prevent edge endpoint override, reject invalid edge points, detect sanitized node id collisions, and add strict-mode validation paths.
3. **Repair package boundaries.** Remove React exports from root `@graph-render/types`/`@graph-render/core`; add explicit React subpath/types; define public/private package APIs.
4. **Fix accessibility in core controls.** Add focus-visible styling, graph instructions, node/edge accessible names, keyboard edge access, viewport control labels, toolbar labels, live status, and heading semantics.
5. **Address interaction performance.** Batch pointer/pinch movement, memoize bounds, batch node measurement, and add culling/LOD for graph elements.

### Quick wins

- Add package `files` whitelists and `"sideEffects": false`.
- Externalize React DOM subpaths in Vite configs.
- Fix README Quick Start and dark-mode behavior documentation.
- Add `aria-label`/`aria-pressed` to icon-only buttons.
- Guard `releasePointerCapture`.
- Replace spread/map min/max in stage bounds with a loop.
- Remove nested `src/core-graph-render/yarn.lock`.

### Long-term improvements

- Introduce a renderer architecture with pluggable SVG/canvas backends or documented thresholds.
- Move graph/tournament public APIs from boolean flags to structured options and slots.
- Establish a domain normalization layer with explicit DTO → normalized model conversion.
- Define package subpath exports: stable `components`, `hooks`, `utils`, and private internals.
- Add Storybook accessibility checks and interaction stories for keyboard, touch, and screen-reader states.
- Add performance benchmarks for graphs/brackets at realistic scale.

### Recommended architecture changes

- `@graph-render/types`: domain-only root exports; React-specific types in subpath.
- `@graph-render/core`: parser/layout/routing/rendering only; no React concepts in root API.
- `@graph-render/react`: renderer shell plus feature hooks; explicit `interaction`, `selection`, `viewport`, `accessibility`, and `rendering` option objects.
- `@graph-render/tournament-tree`: tournament view-model hook owns derived labels, graph enrichment, stage views, navigation state, and export state; components render only.
- Tests: colocated unit tests for pure utilities, React Testing Library tests for interaction/a11y, package API tests for published type resolution.

## Validation

Targeted validation required after fixes:

```bash
yarn format:check
yarn lint
yarn typecheck
yarn build
yarn test
(cd src/react-graph-render && npm pack --dry-run)
(cd src/react-tournament-tree && npm pack --dry-run)
(cd src/core-graph-render && npm pack --dry-run)
(cd src/types && npm pack --dry-run)
```

Additional validation that should be added to CI:

- Vitest coverage thresholds for core parser/layout/routing utilities.
- React Testing Library keyboard and accessibility tests for graph nodes, edges, controls, and tournament toolbar.
- Axe checks in Storybook or component tests.
- Bundle inspection proving React/React DOM are externalized and package output is clean.
- Performance benchmark for dense graph pan/zoom and large tournament navigation.
