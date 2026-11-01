import type { VertexComponent } from '@graph-render/types/react';
import { useMemo } from 'react';

import {
  type BracketVertexOptions,
  createDefaultExportVertexComponent,
  createDefaultResolvedVertexComponent,
} from '../contexts/BracketVertexOptionsContext';
import type { TournamentBracketProps } from '../models/tournamentBracket';

export type { BracketVertexOptions } from '../contexts/BracketVertexOptionsContext';
export { BracketVertexOptionsProvider } from '../contexts/BracketVertexOptionsContext';

const defaultExportVertexComponent = createDefaultExportVertexComponent();
const defaultResolvedVertexComponent = createDefaultResolvedVertexComponent();

export function useBracketVertexComponents({
  compact,
  nodeRenderMode,
  onInvalidNode,
  onMatchUpdate,
  vertexComponent,
  countryFlags,
}: Pick<
  TournamentBracketProps,
  | 'compact'
  | 'nodeRenderMode'
  | 'onInvalidNode'
  | 'onMatchUpdate'
  | 'vertexComponent'
  | 'countryFlags'
>) {
  const vertexOptions = useMemo<BracketVertexOptions>(
    () => ({ compact, nodeRenderMode, onInvalidNode, onMatchUpdate, countryFlags }),
    [compact, nodeRenderMode, onInvalidNode, onMatchUpdate, countryFlags]
  );
  const exportVertexComponent: VertexComponent = vertexComponent ?? defaultExportVertexComponent;
  const resolvedVertexComponent: VertexComponent =
    vertexComponent ?? defaultResolvedVertexComponent;

  return { exportVertexComponent, resolvedVertexComponent, vertexOptions };
}
