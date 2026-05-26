import { SquashNodeRenderMode } from '@graph-render/types/tournament';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BracketAppearanceProvider } from '../../contexts/BracketAppearanceContext';
import { buildBracketSvgString } from '../../utils/buildBracketSvg';
import { downloadPngFromSvgString } from '../../utils/exportPng';
import { useBracketPngExport } from '../useBracketPngExport';

vi.mock('../../utils/buildBracketSvg', () => ({
  buildBracketSvgString: vi.fn(() => '<svg>test</svg>'),
}));

vi.mock('../../utils/exportPng', () => ({
  downloadPngFromSvgString: vi.fn(async () => Promise.resolve()),
}));

const EMPTY_GRAPH = { nodes: {}, adj: {}, edges: {} };
const FakeVertex = () => null;

function makeWrapperRef(el: HTMLDivElement | null = null) {
  return { current: el } as React.RefObject<HTMLDivElement | null>;
}

function makeDefaultParams(overrides = {}) {
  return {
    wrapperRef: makeWrapperRef(),
    nodeRenderMode: SquashNodeRenderMode.Html,
    vertexComponent: undefined,
    isDarkMode: false,
    enrichedGraph: EMPTY_GRAPH,
    exportVertexComponent: FakeVertex,
    mergedConfig: { width: 1600, height: 1200 } as never,
    appearance: undefined,
    compact: true,
    vertexOptions: {
      nodeRenderMode: SquashNodeRenderMode.Html,
      compact: true,
      onInvalidNode: undefined,
    },
    onExportError: undefined,
    ...overrides,
  };
}

describe('useBracketPngExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a stable callback reference', () => {
    const params = makeDefaultParams();
    const { result, rerender } = renderHook(() => useBracketPngExport(params));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('calls buildBracketSvgString and downloadPngFromSvgString when invoked', () => {
    const params = makeDefaultParams();
    const { result } = renderHook(() => useBracketPngExport(params), {
      wrapper: ({ children }) => (
        <BracketAppearanceProvider isDarkMode={false} compact>
          {children}
        </BracketAppearanceProvider>
      ),
    });

    result.current();

    expect(buildBracketSvgString).toHaveBeenCalledTimes(1);
    expect(downloadPngFromSvgString).toHaveBeenCalledWith('<svg>test</svg>');
  });

  it('calls onExportError and rethrows when buildBracketSvgString throws', () => {
    const onExportError = vi.fn();
    const boom = new Error('svg build failed');
    (buildBracketSvgString as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw boom;
    });

    const params = makeDefaultParams({ onExportError });
    const { result } = renderHook(() => useBracketPngExport(params));

    expect(() => result.current()).toThrow('svg build failed');
    expect(onExportError).toHaveBeenCalledWith(boom);
  });

  it('calls onExportError when downloadPngFromSvgString rejects', async () => {
    const onExportError = vi.fn();
    const boom = new Error('png conversion failed');
    (downloadPngFromSvgString as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      Promise.reject(boom)
    );

    const params = makeDefaultParams({ onExportError });
    const { result } = renderHook(() => useBracketPngExport(params));

    result.current();

    // Wait for the promise rejection to be handled
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onExportError).toHaveBeenCalledWith(boom);
  });
});
