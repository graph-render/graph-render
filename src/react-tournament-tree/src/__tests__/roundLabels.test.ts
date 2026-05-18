import { describe, expect, it } from 'vitest';

import {
  roundLabelsForGraph,
  roundLabelsForMatchCount,
  roundLabelsForRoundCount,
} from '../utils/roundLabels';

// ── roundLabelsForRoundCount ──────────────────────────────────────────────────
describe('roundLabelsForRoundCount', () => {
  it('returns empty array for 0 rounds', () => {
    expect(roundLabelsForRoundCount(0)).toHaveLength(0);
  });

  it('returns empty array for negative input', () => {
    expect(roundLabelsForRoundCount(-1)).toHaveLength(0);
  });

  it('returns ["FINAL"] for 1 round', () => {
    expect(roundLabelsForRoundCount(1)).toEqual(['FINAL']);
  });

  it('returns ["SEMIFINALS", "FINAL"] for 2 rounds', () => {
    expect(roundLabelsForRoundCount(2)).toEqual(['SEMIFINALS', 'FINAL']);
  });

  it('includes QUARTERFINALS for 3 rounds', () => {
    const labels = roundLabelsForRoundCount(3);
    expect(labels).toEqual(['QUARTERFINALS', 'SEMIFINALS', 'FINAL']);
  });

  it('builds "ROUND OF N" for 4+ rounds', () => {
    const labels = roundLabelsForRoundCount(4);
    // 4 rounds: remaining 4,3,2,1 → ROUND OF 8, QUARTERFINALS, SEMIFINALS, FINAL
    expect(labels[0]).toBe('ROUND OF 8');
    expect(labels[3]).toBe('FINAL');
  });

  it('returns correct count for 5 rounds', () => {
    expect(roundLabelsForRoundCount(5)).toHaveLength(5);
  });
});

// ── roundLabelsForMatchCount ──────────────────────────────────────────────────
describe('roundLabelsForMatchCount', () => {
  it('returns empty for 0 matches', () => {
    expect(roundLabelsForMatchCount(0)).toHaveLength(0);
  });

  it('returns 1 round for 1 match', () => {
    expect(roundLabelsForMatchCount(1)).toHaveLength(1);
  });

  it('returns expected labels for 7 matches (3 rounds)', () => {
    // log2(8)=3 rounds
    const labels = roundLabelsForMatchCount(7);
    expect(labels).toEqual(['QUARTERFINALS', 'SEMIFINALS', 'FINAL']);
  });

  it('returns expected labels for 15 matches (4 rounds)', () => {
    const labels = roundLabelsForMatchCount(15);
    expect(labels[labels.length - 1]).toBe('FINAL');
    expect(labels).toHaveLength(4);
  });
});

// ── roundLabelsForGraph ───────────────────────────────────────────────────────
describe('roundLabelsForGraph', () => {
  it('returns empty for empty graph', () => {
    const emptyGraph = { adj: {}, nodes: {} } as any;
    expect(roundLabelsForGraph(emptyGraph)).toHaveLength(0);
  });

  it('returns FINAL for single-node graph', () => {
    const graph = { adj: { a: {} }, nodes: { a: {} } } as any;
    const labels = roundLabelsForGraph(graph);
    expect(labels).toEqual(['FINAL']);
  });

  it('derives labels for a 3-round graph', () => {
    // Chain: a → b → c → d (3 edges, 4 nodes → 4 levels → 4 rounds)
    const graph = {
      adj: { a: { b: {} }, b: { c: {} }, c: { d: {} } },
      nodes: { a: {}, b: {}, c: {}, d: {} },
    } as any;
    const labels = roundLabelsForGraph(graph);
    expect(labels[labels.length - 1]).toBe('FINAL');
  });
});
