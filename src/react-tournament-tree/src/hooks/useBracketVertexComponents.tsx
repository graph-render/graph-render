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
}: Pick<
  TournamentBracketProps,
  'compact' | 'nodeRenderMode' | 'onInvalidNode' | 'onMatchUpdate' | 'vertexComponent'
>) {
  const vertexOptions = useMemo<BracketVertexOptions>(
    () => ({ compact, nodeRenderMode, onInvalidNode, onMatchUpdate }),
    [compact, nodeRenderMode, onInvalidNode, onMatchUpdate]
  );
  const exportVertexComponent: VertexComponent = vertexComponent ?? defaultExportVertexComponent;
  const resolvedVertexComponent: VertexComponent =
    vertexComponent ?? defaultResolvedVertexComponent;

  return { exportVertexComponent, resolvedVertexComponent, vertexOptions };
}
