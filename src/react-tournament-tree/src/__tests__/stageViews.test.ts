import { describe, expect, it } from 'vitest';

import { STAGE_LABEL_HEIGHT } from '../constants/stageNavigation';
import { NODE_DIMENSIONS } from '../constants/node';
import { buildStageViews } from '../utils/stageViews';

// ---------------------------------------------------------------------------
// buildStageViews
// ---------------------------------------------------------------------------

describe('buildStageViews', () => {
  // Three nodes: A and B share the same x (column 0), C is far to the right (column 1).
  // All nodes use NODE_DIMENSIONS so we can compute exact expected values.
  const nodes = [
    { id: 'a', position: { x: 0, y: 0 }, size: { width: NODE_DIMENSIONS.WIDTH, height: NODE_DIMENSIONS.HEIGHT } },
    { id: 'b', position: { x: 0, y: 150 }, size: { width: NODE_DIMENSIONS.WIDTH, height: NODE_DIMENSIONS.HEIGHT } },
    { id: 'c', position: { x: 400, y: 0 }, size: { width: NODE_DIMENSIONS.WIDTH, height: NODE_DIMENSIONS.HEIGHT } },
  ] as const;

  const LABEL_OFFSET = 10;
  const LABELS = ['Round 1', 'Round 2'];

  it('produces one StageView per detected column', () => {
    const views = buildStageViews(nodes, LABELS, LABEL_OFFSET);
    expect(views).toHaveLength(2);
  });

  it('computes minX, maxX and maxY correctly in a single pass', () => {
    const views = buildStageViews(nodes, LABELS, LABEL_OFFSET);
    const [stage0, stage1] = views;

    // Column 0 has nodes A (x=0) and B (x=0), both width NODE_DIMENSIONS.WIDTH.
    expect(stage0!.bounds.minX).toBe(0);
    expect(stage0!.bounds.maxX).toBe(NODE_DIMENSIONS.WIDTH); // 0 + 280 = 280
    // maxY: B's bottom edge = 150 + NODE_DIMENSIONS.HEIGHT = 250
    expect(stage0!.bounds.maxY).toBe(150 + NODE_DIMENSIONS.HEIGHT);

    // Column 1 has only C at x=400.
    expect(stage1!.bounds.minX).toBe(400);
    expect(stage1!.bounds.maxX).toBe(400 + NODE_DIMENSIONS.WIDTH); // 680
    expect(stage1!.bounds.maxY).toBe(NODE_DIMENSIONS.HEIGHT); // 0 + 100
  });

  it('builds the nodeIds list from column nodes (sorted by y)', () => {
    const views = buildStageViews(nodes, LABELS, LABEL_OFFSET);
    // A (y=0) comes before B (y=150) after y-sort.
    expect(views[0]!.nodeIds).toEqual(['a', 'b']);
    expect(views[1]!.nodeIds).toEqual(['c']);
  });

  it('incorporates labelOffset and STAGE_LABEL_HEIGHT in bounds.minY', () => {
    const views = buildStageViews(nodes, LABELS, LABEL_OFFSET);

    // labelTop = rawMinY - labelOffset - STAGE_LABEL_HEIGHT + 6
    // For column 0: rawMinY = 0, so labelTop = 0 - 10 - STAGE_LABEL_HEIGHT + 6
    const expectedMinY = 0 - LABEL_OFFSET - STAGE_LABEL_HEIGHT + 6;
    expect(views[0]!.bounds.minY).toBe(expectedMinY);
  });

  it('uses the provided label for each stage', () => {
    const views = buildStageViews(nodes, LABELS, LABEL_OFFSET);
    expect(views[0]!.label).toBe('Round 1');
    expect(views[1]!.label).toBe('Round 2');
  });
});
