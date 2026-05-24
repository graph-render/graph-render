import type { VertexComponent, VertexComponentProps } from '@graph-render/types/react';
import { SquashNodeRenderMode } from '@graph-render/types/tournament';
import { createContext, type ReactNode, useContext } from 'react';

import { SquashNode } from '../components/SquashNode/SquashNode';
import type { TournamentBracketProps } from '../models/tournamentBracket';

export interface BracketVertexOptions {
  readonly compact: boolean | undefined;
  readonly nodeRenderMode: TournamentBracketProps['nodeRenderMode'];
  readonly onInvalidNode: TournamentBracketProps['onInvalidNode'];
  readonly onMatchUpdate?: TournamentBracketProps['onMatchUpdate'];
}

const DEFAULT_VERTEX_OPTIONS: BracketVertexOptions = {
  compact: true,
  nodeRenderMode: SquashNodeRenderMode.Export,
  onInvalidNode: undefined,
  onMatchUpdate: undefined,
};

const BracketVertexOptionsContext = createContext<BracketVertexOptions>(DEFAULT_VERTEX_OPTIONS);

export const useBracketMatchUpdate = (): TournamentBracketProps['onMatchUpdate'] =>
  useContext(BracketVertexOptionsContext).onMatchUpdate;

interface BracketVertexOptionsProviderProps {
  readonly children: ReactNode;
  readonly value: BracketVertexOptions;
}

export const BracketVertexOptionsProvider = ({
  children,
  value,
}: BracketVertexOptionsProviderProps) => (
  <BracketVertexOptionsContext.Provider value={value}>
    {children}
  </BracketVertexOptionsContext.Provider>
);

const DefaultExportVertexComponent = (props: VertexComponentProps) => {
  const { compact, onInvalidNode } = useContext(BracketVertexOptionsContext);

  return (
    <SquashNode
      {...props}
      renderMode={SquashNodeRenderMode.Export}
      compact={compact}
      onRenderError={onInvalidNode}
    />
  );
};

const DefaultResolvedVertexComponent = (props: VertexComponentProps) => {
  const { compact, nodeRenderMode, onInvalidNode } = useContext(BracketVertexOptionsContext);

  return (
    <SquashNode
      {...props}
      renderMode={nodeRenderMode ?? SquashNodeRenderMode.Export}
      compact={compact}
      onRenderError={onInvalidNode}
    />
  );
};

export const createDefaultExportVertexComponent = (): VertexComponent =>
  DefaultExportVertexComponent;
export const createDefaultResolvedVertexComponent = (): VertexComponent =>
  DefaultResolvedVertexComponent;
