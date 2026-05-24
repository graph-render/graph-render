# Feature 20: Large-Bracket Optimization

## Description

Large brackets with 64, 128, or 256 participants must remain usable. The goal is practical bracket rendering, not a general WebGL graph engine.

## Requirements

- Benchmark large generated brackets.
- Optimize layout and rendering for stage navigation mode.
- Avoid rendering off-screen nodes where possible.
- Consider stage-level layout caching.
- Keep SVG/HTML renderer as default.

## Acceptance Criteria

- 128-player single-elimination demo is usable.
- Stage navigation remains responsive.
- Export does not crash for large but reasonable brackets.
- Performance benchmarks are documented.
