import { SquashNodeRenderMode } from '@graph-render/types';
import { render, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useBracketVertexComponents } from '../useBracketVertexComponents';

const EMPTY_NODE = {
  id: 'n1',
  position: { x: 0, y: 0 },
  size: { width: 280, height: 100 },
  meta: {},
} as never;

const BASE_PROPS = {
  compact: true,
  nodeRenderMode: SquashNodeRenderMode.Html,
  onInvalidNode: undefined,
  vertexComponent: undefined,
} as const;

describe('useBracketVertexComponents', () => {
  it('returns exportVertexComponent and resolvedVertexComponent', () => {
    const { result } = renderHook(() => useBracketVertexComponents(BASE_PROPS));
    expect(result.current.exportVertexComponent).toBeDefined();
    expect(result.current.resolvedVertexComponent).toBeDefined();
  });

  it('uses the provided custom vertexComponent for both slots', () => {
    const CustomComponent = vi.fn(() => null);
    const { result } = renderHook(() =>
      useBracketVertexComponents({ ...BASE_PROPS, vertexComponent: CustomComponent })
    );
    expect(result.current.exportVertexComponent).toBe(CustomComponent);
    expect(result.current.resolvedVertexComponent).toBe(CustomComponent);
  });

  it('resolvedVertexComponent is a stable reference across re-renders', () => {
    const { result, rerender } = renderHook(() => useBracketVertexComponents(BASE_PROPS));
    const first = result.current.resolvedVertexComponent;
    rerender();
    expect(result.current.resolvedVertexComponent).toBe(first);
  });

  it('exportVertexComponent is a stable reference across re-renders', () => {
    const { result, rerender } = renderHook(() => useBracketVertexComponents(BASE_PROPS));
    const first = result.current.exportVertexComponent;
    rerender();
    expect(result.current.exportVertexComponent).toBe(first);
  });

  it('default exportVertexComponent is always Export render mode regardless of nodeRenderMode', () => {
    // exportVertexComponent should always force Export mode — test by checking it is different
    // from resolvedVertexComponent when nodeRenderMode differs from Export
    const { result } = renderHook(() =>
      useBracketVertexComponents({ ...BASE_PROPS, nodeRenderMode: SquashNodeRenderMode.Html })
    );
    // Both are default fallbacks (no custom vertexComponent), so they should be different functions
    expect(result.current.exportVertexComponent).not.toBe(result.current.resolvedVertexComponent);
  });

  it('both components are the same reference when a custom vertexComponent is provided', () => {
    const Custom = () => null;
    const { result } = renderHook(() =>
      useBracketVertexComponents({ ...BASE_PROPS, vertexComponent: Custom })
    );
    expect(result.current.exportVertexComponent).toBe(result.current.resolvedVertexComponent);
  });

  it('resolvedVertexComponent updates when nodeRenderMode changes', () => {
    type Props = Parameters<typeof useBracketVertexComponents>[0];
    const { result, rerender } = renderHook((props: Props) => useBracketVertexComponents(props), {
      initialProps: BASE_PROPS,
    });
    const first = result.current.resolvedVertexComponent;

    rerender({ ...BASE_PROPS, nodeRenderMode: SquashNodeRenderMode.Svg });
    expect(result.current.resolvedVertexComponent).not.toBe(first);
  });

  it('components render without throwing (smoke test)', () => {
    const { result } = renderHook(() => useBracketVertexComponents(BASE_PROPS));
    expect(() => {
      render(createElement(result.current.exportVertexComponent, { node: EMPTY_NODE }));
    }).not.toThrow();
    expect(() => {
      render(createElement(result.current.resolvedVertexComponent, { node: EMPTY_NODE }));
    }).not.toThrow();
  });
});
