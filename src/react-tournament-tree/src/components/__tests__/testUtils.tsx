/**
 * Shared test utilities and fixtures for component tests.
 */
import { MatchStatus } from '@graph-render/types';
import { render, type RenderOptions } from '@testing-library/react';
import type React from 'react';

import { THEME_COLORS_LIGHT } from '../../constants';
import { BracketAppearanceProvider } from '../../contexts/BracketAppearanceContext';
import type { NormalizedSquashMatchMeta } from '../../models/squash';
import type { SquashThemeColors } from '../../types/squashNode';

// ─── Provider wrapper ────────────────────────────────────────────────────────

export function withAppearance(
  ui: React.ReactElement,
  isDarkMode = false,
  compact = false
): React.ReactElement {
  return (
    <BracketAppearanceProvider isDarkMode={isDarkMode} compact={compact}>
      {ui}
    </BracketAppearanceProvider>
  );
}

export function renderWithAppearance(
  ui: React.ReactElement,
  options?: RenderOptions,
  isDarkMode = false,
  compact = false
) {
  return render(withAppearance(ui, isDarkMode, compact), options);
}

// ─── Match meta fixtures ─────────────────────────────────────────────────────

export const MOCK_META: NormalizedSquashMatchMeta = {
  stage: 'QF',
  players: [
    { name: 'Player One', seed: 1 },
    { name: 'Player Two', seed: 2 },
  ],
  sets: [[6, 4]],
  tiebreaks: [null],
  status: MatchStatus.Completed,
  currentSet: 0,
};

export const MOCK_META_UPCOMING: NormalizedSquashMatchMeta = {
  stage: 'QF',
  players: [
    { name: 'Player One', seed: 1 },
    { name: 'Player Two', seed: 2 },
  ],
  sets: [],
  tiebreaks: [],
  status: MatchStatus.Upcoming,
  currentSet: 0,
};

export const MOCK_META_LIVE: NormalizedSquashMatchMeta = {
  stage: 'QF',
  players: [
    { name: 'Player One', seed: 1 },
    { name: 'Player Two', seed: 2 },
  ],
  sets: [[3, 2]],
  tiebreaks: [null],
  status: MatchStatus.Live,
  currentSet: 0,
};

export const MOCK_META_TBD: NormalizedSquashMatchMeta = {
  stage: 'QF',
  players: [
    { name: 'TBD', seed: 0 },
    { name: 'TBD', seed: 0 },
  ],
  sets: [],
  tiebreaks: [],
  status: MatchStatus.Upcoming,
  currentSet: 0,
};

// ─── Theme colors ─────────────────────────────────────────────────────────────

export const MOCK_COLORS: SquashThemeColors = THEME_COLORS_LIGHT;
