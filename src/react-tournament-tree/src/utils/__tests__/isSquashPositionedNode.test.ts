import type { PositionedNode } from '@graph-render/types';
import { MatchStatus } from '@graph-render/types/tournament';
import { describe, expect, it } from 'vitest';

import { isMatchPositionedNode } from '../isSquashPositionedNode';

describe('isSquashPositionedNode', () => {
  it('returns false when meta is missing', () => {
    const node: PositionedNode = { id: 'n1', position: { x: 0, y: 0 } };
    expect(isMatchPositionedNode(node)).toBe(false);
  });

  it('returns true for nodes with squash match meta', () => {
    const node: PositionedNode = {
      id: 'n1',
      position: { x: 0, y: 0 },
      meta: {
        players: [{ name: 'A' }, { name: 'B' }],
        status: MatchStatus.Upcoming,
      },
    };
    expect(isMatchPositionedNode(node)).toBe(true);
  });

  it('returns false when players is not an array', () => {
    const node = {
      id: 'n1',
      position: { x: 0, y: 0 },
      meta: { players: 'invalid' },
    } as PositionedNode;
    expect(isMatchPositionedNode(node)).toBe(false);
  });
});
