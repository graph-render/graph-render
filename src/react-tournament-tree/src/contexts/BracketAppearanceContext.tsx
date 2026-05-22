import type { TournamentBracketAppearance } from '@graph-render/types/tournament';
import React from 'react';

import {
  resolveBracketAppearance,
  type ResolvedBracketAppearance,
} from '../utils/resolveBracketAppearance';

const BracketAppearanceContext = React.createContext<ResolvedBracketAppearance | null>(null);

export interface BracketAppearanceProviderProps {
  readonly appearance?: TournamentBracketAppearance | undefined;
  readonly isDarkMode?: boolean | undefined;
  readonly compact?: boolean | undefined;
  /**
   * Pass a pre-resolved appearance to skip an extra `resolveBracketAppearance` call.
   * When provided, `appearance`, `isDarkMode`, and `compact` are ignored.
   */
  readonly resolvedAppearance?: ResolvedBracketAppearance | undefined;
  readonly children: React.ReactNode;
}

export const BracketAppearanceProvider: React.FC<BracketAppearanceProviderProps> = ({
  appearance,
  isDarkMode = false,
  compact = true,
  resolvedAppearance,
  children,
}) => {
  const value = React.useMemo(
    () => resolvedAppearance ?? resolveBracketAppearance(appearance, isDarkMode, compact),
    [appearance, compact, isDarkMode, resolvedAppearance]
  );

  return (
    <BracketAppearanceContext.Provider value={value}>{children}</BracketAppearanceContext.Provider>
  );
};

export function useBracketAppearance(): ResolvedBracketAppearance {
  const context = React.useContext(BracketAppearanceContext);
  if (!context) {
    throw new Error('useBracketAppearance must be used within BracketAppearanceProvider');
  }

  return context;
}
