import { createContext, type ReactNode, useContext } from 'react';

/** Static theme tokens derived from `config.theme` that are shared by every node. */
export interface GraphNodeTheme {
  readonly nodeFill: string;
  readonly nodeStroke: string;
  readonly nodeTextColor: string;
  readonly nodeTextSize: number;
  readonly nodeRadius: number;
  readonly fontFamily: string;
}

const GraphThemeContext = createContext<GraphNodeTheme | null>(null);

GraphThemeContext.displayName = 'GraphThemeContext';

interface GraphThemeProviderProps {
  readonly theme: GraphNodeTheme;
  readonly children: ReactNode;
}

export const GraphThemeProvider = ({ theme, children }: GraphThemeProviderProps) => (
  <GraphThemeContext.Provider value={theme}>{children}</GraphThemeContext.Provider>
);

/**
 * Returns the nearest `GraphNodeTheme` from context.
 * Must be called inside a `<GraphThemeProvider>`.
 */
export const useGraphTheme = (): GraphNodeTheme => {
  const ctx = useContext(GraphThemeContext);
  if (!ctx) {
    throw new Error('useGraphTheme must be used inside <GraphThemeProvider>');
  }
  return ctx;
};
