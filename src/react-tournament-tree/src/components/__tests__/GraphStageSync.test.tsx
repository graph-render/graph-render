import type { GraphRenderContext } from '@graph-render/types';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GraphStageSync } from '../Bracket/GraphStageSync';

// Minimal GraphRenderContext mock — only `nodes` is used by GraphStageSync
function makeMockContext(nodes: GraphRenderContext['nodes'] = []): GraphRenderContext {
  return {
    graph: { nodes: [], edges: [] },
    nodes,
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    selection: { nodeIds: new Set() },
  } as unknown as GraphRenderContext;
}

describe('GraphStageSync', () => {
  it('renders nothing (returns null)', () => {
    const { container } = render(
      <GraphStageSync
        context={makeMockContext()}
        labels={[]}
        labelOffset={46}
        onStagesChange={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onStagesChange on mount with an empty array when no nodes', () => {
    const onStagesChange = vi.fn();
    render(
      <GraphStageSync
        context={makeMockContext()}
        labels={[]}
        labelOffset={46}
        onStagesChange={onStagesChange}
      />
    );
    expect(onStagesChange).toHaveBeenCalledOnce();
    expect(onStagesChange).toHaveBeenCalledWith([]);
  });

  it('calls onStagesChange when nodes change', () => {
    const onStagesChange = vi.fn();
    const { rerender } = render(
      <GraphStageSync
        context={makeMockContext()}
        labels={[]}
        labelOffset={46}
        onStagesChange={onStagesChange}
      />
    );

    const newContext = makeMockContext([
      {
        id: 'n1',
        position: { x: 0, y: 0 },
        size: { width: 280, height: 100 },
        meta: null,
      } as unknown as GraphRenderContext['nodes'][number],
    ]);

    rerender(
      <GraphStageSync
        context={newContext}
        labels={['QF']}
        labelOffset={46}
        onStagesChange={onStagesChange}
      />
    );

    expect(onStagesChange).toHaveBeenCalledTimes(2);
  });
});
