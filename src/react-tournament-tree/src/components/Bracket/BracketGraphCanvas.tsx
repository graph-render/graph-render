import { Graph } from '@graph-render/react';
import type { GraphConfig, PositionedNode } from '@graph-render/types';
import type { GraphHandle, GraphRenderContext } from '@graph-render/types/react';
import type { StageView } from '@graph-render/types/tournament';
import { useCallback } from 'react';

import type { TournamentBracketProps } from '../../models/tournamentBracket';
import { routeBracketEdges } from '../../utils/bracketRouting';
import { toMatchPositionedNode } from '../../utils/isSquashPositionedNode';
import { buildStageViews } from '../../utils/stageViews';

interface BracketGraphCanvasProps {
  readonly graphRef: React.RefObject<GraphHandle | null>;
  readonly wrapperRef: React.RefObject<HTMLDivElement | null>;
  readonly graph: TournamentBracketProps['graph'];
  readonly vertexComponent: NonNullable<TournamentBracketProps['vertexComponent']>;
  readonly config: GraphConfig;
  readonly defaultViewport: TournamentBracketProps['defaultViewport'];
  readonly isNavigationMode: boolean;
  readonly translateExtent:
    readonly [readonly [number, number], readonly [number, number]] | undefined;
  readonly showViewportControls: boolean;
  readonly panEnabled: TournamentBracketProps['panEnabled'];
  readonly zoomEnabled: TournamentBracketProps['zoomEnabled'];
  readonly pinchZoomEnabled: TournamentBracketProps['pinchZoomEnabled'];
  readonly labels: readonly string[];
  readonly onStagesChange: (stages: readonly StageView[]) => void;
  readonly onMatchClick: TournamentBracketProps['onMatchClick'];
  readonly onInvalidNode: TournamentBracketProps['onInvalidNode'];
}

export function BracketGraphCanvas({
  graphRef,
  wrapperRef,
  graph,
  vertexComponent,
  config,
  defaultViewport,
  isNavigationMode,
  translateExtent,
  showViewportControls,
  panEnabled,
  zoomEnabled,
  pinchZoomEnabled,
  labels,
  onStagesChange,
  onMatchClick,
  onInvalidNode,
}: BracketGraphCanvasProps) {
  const handleMatchClick = useCallback(
    (node: PositionedNode) => {
      if (!onMatchClick) {
        return;
      }

      const matchNode = toMatchPositionedNode(node);
      if (!matchNode) {
        onInvalidNode?.(
          node.id,
          new TypeError(`Node "${node.id}" is not a valid tournament match node.`)
        );
        return;
      }

      onMatchClick(matchNode);
    },
    [onInvalidNode, onMatchClick]
  );

  const handleLayoutChange = useCallback(
    (context: GraphRenderContext) => {
      const stages = buildStageViews(context.nodes, labels, config.labelOffset ?? 46);
      onStagesChange(stages);
    },
    [config.labelOffset, labels, onStagesChange]
  );

  return (
    <div ref={wrapperRef} style={{ minWidth: 'fit-content' }}>
      <Graph
        ref={graphRef}
        graph={graph}
        vertexComponent={vertexComponent}
        config={config}
        defaultViewport={defaultViewport}
        interaction={{
          panEnabled: panEnabled ?? !isNavigationMode,
          zoomEnabled: zoomEnabled ?? !isNavigationMode,
          pinchZoomEnabled: pinchZoomEnabled ?? !isNavigationMode,
        }}
        viewportOptions={{
          translateExtent: isNavigationMode ? undefined : translateExtent,
          showControls: showViewportControls,
        }}
        onNodeClick={handleMatchClick}
        onLayoutChange={handleLayoutChange}
        routeEdgesOverride={routeBracketEdges}
      />
    </div>
  );
}
