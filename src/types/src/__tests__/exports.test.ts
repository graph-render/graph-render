import { describe, expect, it } from 'vitest';

import * as rootTypes from '../index';
import * as reactTypes from '../react';

describe('@graph-render/types public exports', () => {
  it('exports core graph enums from the root entry', () => {
    expect(rootTypes.LayoutType).toBeDefined();
    expect(rootTypes.EdgeType).toBeDefined();
    expect(rootTypes.RoutingStyle).toBeDefined();
  });

  it('does not export React components from the root entry', () => {
    expect('Graph' in rootTypes).toBe(false);
    expect('VertexComponent' in rootTypes).toBe(false);
  });

  it('exports React graph contracts from the react subpath', () => {
    expect(reactTypes.SelectionMode).toBeDefined();
    expect(reactTypes.GraphErrorPhase).toBeDefined();
  });
});
