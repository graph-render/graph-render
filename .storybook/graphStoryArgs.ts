import { fn } from 'storybook/test';

/**
 * Explicit spies for Graph callbacks that may run during mount (effects / layout).
 * Required for Storybook 8.6+ — implicit actions from argTypesRegex break rendering.
 */
export const graphStoryActionArgs = {
  onError: fn(),
  onLayoutChange: fn(),
  onViewportChange: fn(),
  onSearchResultsChange: fn(),
  onSelectionChange: fn(),
  onFocusedNodeChange: fn(),
  onCollapsedNodeIdsChange: fn(),
  onNodeHoverChange: fn(),
  onEdgeHoverChange: fn(),
  onNodeClick: fn(),
  onEdgeClick: fn(),
  onNodeExpand: fn(),
  onNodeCollapse: fn(),
} as const;
