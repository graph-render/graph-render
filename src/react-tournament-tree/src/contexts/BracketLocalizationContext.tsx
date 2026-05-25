import { createContext, type ReactNode, useContext, useMemo } from 'react';

import type {
  ResolvedTournamentLocalization,
  TournamentLocalizationOptions,
} from '../models/localization';
import { resolveTournamentLocalization } from '../utils/localization';

const DEFAULT_LOCALIZATION = resolveTournamentLocalization();

const BracketLocalizationContext =
  createContext<ResolvedTournamentLocalization>(DEFAULT_LOCALIZATION);

export const useBracketLocalization = (): ResolvedTournamentLocalization =>
  useContext(BracketLocalizationContext);

interface BracketLocalizationProviderProps {
  readonly children: ReactNode;
  readonly localization?: TournamentLocalizationOptions | undefined;
  readonly resolvedLocalization?: ResolvedTournamentLocalization | undefined;
}

export const BracketLocalizationProvider = ({
  children,
  localization,
  resolvedLocalization,
}: BracketLocalizationProviderProps) => {
  const value = useMemo(
    () => resolvedLocalization ?? resolveTournamentLocalization(localization),
    [localization, resolvedLocalization]
  );

  return (
    <BracketLocalizationContext.Provider value={value}>
      {children}
    </BracketLocalizationContext.Provider>
  );
};
