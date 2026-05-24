## @graph-render/types 1.3.0 (2026-05-24)

* feat(tournament): features ([7c4fbd7](https://github.com/graph-render/graph-render/commit/7c4fbd7))
* chore: enterprise architecture review fixes ([cc06ecc](https://github.com/graph-render/graph-render/commit/cc06ecc))
* chore: production hardening review (#23) ([70cf4bb](https://github.com/graph-render/graph-render/commit/70cf4bb)), closes [#23](https://github.com/graph-render/graph-render/issues/23)
* chore(deps-dev): bump the npm-dependencies group across 1 directory with 40 updates (#21) ([6c34eae](https://github.com/graph-render/graph-render/commit/6c34eae)), closes [#21](https://github.com/graph-render/graph-render/issues/21)

## <small>1.2.6 (2026-05-21)</small>

- fix(core): format vitest config files for prettier ([2c81d40](https://github.com/graph-render/graph-render/commit/2c81d40))
- refactor(packages) make productuin ready (#15) ([381166a](https://github.com/graph-render/graph-render/commit/381166a)), closes [#15](https://github.com/graph-render/graph-render/issues/15)

## <small>1.2.5 (2026-05-18)</small>

- fix: use HTML badges and fix GitHub URLs in all package READMEs ([d70e39d](https://github.com/graph-render/graph-render/commit/d70e39d))

## <small>1.2.4 (2026-05-18)</small>

- fix: update repository URL to graph-render org in all package manifests ([1e40643](https://github.com/graph-render/graph-render/commit/1e40643))
- docs(ci): clarify GitHub Packages sidebar names and format changelogs in CI (#14) ([dc5f0e4](https://github.com/graph-render/graph-render/commit/dc5f0e4)), closes [#14](https://github.com/graph-render/graph-render/issues/14)

## <small>1.2.3 (2026-05-17)</small>

- fix(release): force @graph-render scope when publishing to GitHub Pac… (#13) ([841e4bf](https://github.com/oleksandr-zhynzher/graph-render/commit/841e4bf)), closes [#13](https://github.com/oleksandr-zhynzher/graph-render/issues/13)

## <small>1.2.2 (2026-05-17)</small>

- fix(release): publish @graph-render packages without scope remapping (#12) ([19b35c6](https://github.com/oleksandr-zhynzher/graph-render/commit/19b35c6)), closes [#12](https://github.com/oleksandr-zhynzher/graph-render/issues/12)

## <small>1.2.1 (2026-05-17)</small>

- fix(release): publish packages to GitHub Packages under repo owner scope (#11) ([98c8d69](https://github.com/oleksandr-zhynzher/graph-render/commit/98c8d69)), closes [#11](https://github.com/oleksandr-zhynzher/graph-render/issues/11)

## @graph-render/types 1.2.0 (2026-05-17)

- feat(tournament-tree): add configurable bracket appearance API (#10) ([b9e8adc](https://github.com/oleksandr-zhynzher/graph-render/commit/b9e8adc)), closes [#10](https://github.com/oleksandr-zhynzher/graph-render/issues/10)
- docs: refocus READMEs on adopters and quick starts ([a8309aa](https://github.com/oleksandr-zhynzher/graph-render/commit/a8309aa))
- refactor: graph rendering components ([35afb51](https://github.com/oleksandr-zhynzher/graph-render/commit/35afb51))
- refactor: replace all hardcoded string literal types with enums ([65f5a6e](https://github.com/oleksandr-zhynzher/graph-render/commit/65f5a6e))
- style: apply prettier formatting to changelogs ([f245bfe](https://github.com/oleksandr-zhynzher/graph-render/commit/f245bfe))

## @graph-render/types [1.1.0](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/types@1.0.2...@graph-render/types@1.1.0) (2026-05-13)

### 🚀 Features

- constrain viewport pan to bracket bounds (translateExtent) ([e007635](https://github.com/oleksandr-zhynzher/graph-render/commit/e0076352658d23a86cf010f5f5595f86edabb4dd))

## @graph-render/types [1.0.2](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/types@1.0.1...@graph-render/types@1.0.2) (2026-03-27)

### 🐛 Bug Fixes

- **core:** make failure and validation policies explicit ([9236ba2](https://github.com/oleksandr-zhynzher/graph-render/commit/9236ba2bd01d571e08ce2f80d941abdf3115f8b0))

## @graph-render/types [1.0.1](https://github.com/oleksandr-zhynzher/graph-render/compare/@graph-render/types@1.0.0...@graph-render/types@1.0.1) (2026-03-19)

### 🐛 Bug Fixes

- **react:** handle async node expansion deterministically ([4c80feb](https://github.com/oleksandr-zhynzher/graph-render/commit/4c80febfb2032e17f304b7bf4fa8429976a057de))

## @graph-render/types 1.0.0 (2026-03-17)

### 🚀 Features

- **core:** add layered radial and flow layouts ([a934bc0](https://github.com/oleksandr-zhynzher/graph-render/commit/a934bc0f06325b2b7b41e044483f8ec487fcdec8))
- **core:** add node measurement and auto sizing ([721a082](https://github.com/oleksandr-zhynzher/graph-render/commit/721a08206bf26b979f0e5de9e97cfcc34d562e1f))
- **core:** improve edge routing and labels ([273bdcb](https://github.com/oleksandr-zhynzher/graph-render/commit/273bdcb4e30f47a2d9bd75428739ee03ff5cea10))
- **react:** add marquee selection and focus navigation ([be7bf1a](https://github.com/oleksandr-zhynzher/graph-render/commit/be7bf1acc8442dd36c0d92f1a97fe13e9f368596))
- **react:** add search filter and highlight APIs ([5881c82](https://github.com/oleksandr-zhynzher/graph-render/commit/5881c8239776835210f153f54f053f40195effe3))
- **react:** add subtree collapse and filtered graph view ([95e8d64](https://github.com/oleksandr-zhynzher/graph-render/commit/95e8d641db4584fb4d749b9f0bb7b0d80b613b9b))
- **react:** add viewport controls and touch zoom ([ac9f02f](https://github.com/oleksandr-zhynzher/graph-render/commit/ac9f02f3bfbfc1fe58fb10231600f38721b3d7b3))

### 🐛 Bug Fixes

- **labels:** eliminate hardcoded colors and two sources of truth in GraphLabels ([4becf71](https://github.com/oleksandr-zhynzher/graph-render/commit/4becf71d6125740e994546c1054e021166ce74d0)), closes [#eef1f6](https://github.com/oleksandr-zhynzher/graph-render/issues/eef1f6) [#d7dbe3](https://github.com/oleksandr-zhynzher/graph-render/issues/d7dbe3) [#3f434b](https://github.com/oleksandr-zhynzher/graph-render/issues/3f434b)
