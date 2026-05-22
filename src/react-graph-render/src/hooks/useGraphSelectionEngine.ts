import type { PositionedEdge, PositionedNode } from '@graph-render/types';
import type { GraphSelection, SelectionMode } from '@graph-render/types/react';

import type { UseGraphViewStateResult } from '../models/hookContracts';
import { useGraphSelectionHandlers } from './useGraphSelectionHandlers';
import { useGraphVisibleSelection } from './useGraphVisibleSelection';

interface VisibleEntity {
  readonly id: string;
}

export interface UseGraphSelectionEngineOptions {
  readonly focusedNodeId: string | null;
  readonly selection: GraphSelection;
  readonly selectionRef: UseGraphViewStateResult['selectionRef'];
  readonly updateFocusedNode: UseGraphViewStateResult['updateFocusedNode'];
  readonly updateSelection: UseGraphViewStateResult['updateSelection'];
  readonly visibleEdges: readonly VisibleEntity[];
  readonly visibleNodes: readonly VisibleEntity[];
  readonly edgeSelectionEnabled: boolean;
  readonly nodeSelectionEnabled: boolean;
  readonly onEdgeClick: ((edge: PositionedEdge) => void) | undefined;
  readonly onNodeClick: ((node: PositionedNode) => void) | undefined;
  readonly selectionMode: SelectionMode;
}

/**
 * Aggregates visible-selection filtering (`useGraphVisibleSelection`) and the
 * corresponding click handlers (`useGraphSelectionHandlers`) into a single unit.
 *
 * Previously, `useGraphController` called both hooks separately and threaded
 * the `updateFocusedNode` / `updateSelection` helpers between them.
 */
export const useGraphSelectionEngine = ({
  focusedNodeId,
  selection,
  selectionRef,
  updateFocusedNode,
  updateSelection,
  visibleEdges,
  visibleNodes,
  edgeSelectionEnabled,
  nodeSelectionEnabled,
  onEdgeClick,
  onNodeClick,
  selectionMode,
}: UseGraphSelectionEngineOptions) => {
  const {
    effectiveFocusedNodeId,
    effectiveSelection,
    selectedEdgeSet,
    selectedNodeSet,
    visibleEdgeIdSet,
    visibleNodeIdSet,
  } = useGraphVisibleSelection({
    focusedNodeId,
    selection,
    selectionRef,
    updateFocusedNode,
    updateSelection,
    visibleEdges,
    visibleNodes,
  });

  const { handleEdgeSelection, handleNodeSelection } = useGraphSelectionHandlers({
    edgeSelectionEnabled,
    nodeSelectionEnabled,
    onEdgeClick,
    onNodeClick,
    selectionMode,
    updateFocusedNode,
    updateSelection,
  });

  return {
    effectiveFocusedNodeId,
    effectiveSelection,
    selectedEdgeSet,
    selectedNodeSet,
    visibleEdgeIdSet,
    visibleNodeIdSet,
    handleEdgeSelection,
    handleNodeSelection,
  };
};
