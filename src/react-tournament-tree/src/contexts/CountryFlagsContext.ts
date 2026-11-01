import { createContext, useContext } from 'react';

import type { TournamentCountryFlagOptions } from '../models/tournamentBracket';

/** Kept apart from BracketVertexOptionsContext so player rows can read it without an import cycle. */
export const CountryFlagsContext = createContext<TournamentCountryFlagOptions | undefined>(
  undefined
);

export interface CountryFlag {
  readonly url: string;
  readonly code: string;
  readonly height: number;
  readonly width: number;
}

/** Flag image for a player's country, or `undefined` when text should be shown. */
export const useCountryFlag = (
  country: string | undefined,
  compact: boolean
): CountryFlag | undefined => {
  const countryFlags = useContext(CountryFlagsContext);
  const code = country?.trim();
  if (!countryFlags || !code) return undefined;
  const url = countryFlags.getUrl(code);
  if (!url) return undefined;
  const height = countryFlags.height ?? (compact ? 9 : 12);

  return { url, code: code.toUpperCase(), height, width: Math.round((height * 4) / 3) };
};
