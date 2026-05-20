import { SquashNodeRenderMode } from '@graph-render/types/tournament';
import { describe, expect, it } from 'vitest';

import { isSvgCompatibleRenderMode } from '../renderMode';

describe('isSvgCompatibleRenderMode', () => {
  it('returns true for Svg mode', () => {
    expect(isSvgCompatibleRenderMode(SquashNodeRenderMode.Svg)).toBe(true);
  });

  it('returns true for Export mode', () => {
    expect(isSvgCompatibleRenderMode(SquashNodeRenderMode.Export)).toBe(true);
  });

  it('returns true for Server mode', () => {
    expect(isSvgCompatibleRenderMode(SquashNodeRenderMode.Server)).toBe(true);
  });

  it('returns false for Html mode', () => {
    expect(isSvgCompatibleRenderMode(SquashNodeRenderMode.Html)).toBe(false);
  });
});
