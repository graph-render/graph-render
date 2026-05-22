// ─── Helpers ──────────────────────────────────────────────────────────────────
import { renderGraphToSvg } from '@graph-render/core';
import { SquashNodeRenderMode } from '@graph-render/types/tournament';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BracketAppearanceProvider } from '../../contexts/BracketAppearanceContext';
import { downloadSvgFromElement, downloadSvgString } from '../../utils/exportSvg';
import { useBracketSvgExport } from '../useBracketSvgExport';

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@graph-render/core', () => ({
  renderGraphToSvg: vi.fn(() => ({ svg: '<svg>test</svg>' })),
}));

vi.mock('@graph-render/react', () => ({
  Graph: vi.fn(() => null),
}));

vi.mock('../../utils/exportSvg', () => ({
  downloadSvgString: vi.fn(),
  downloadSvgFromElement: vi.fn(),
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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useBracketSvgExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns a stable callback reference', () => {
    const params = makeDefaultParams();
    const { result, rerender } = renderHook(() => useBracketSvgExport(params));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('calls downloadSvgString when nodeRenderMode is Svg and no vertexComponent', () => {
    const params = makeDefaultParams({
      nodeRenderMode: SquashNodeRenderMode.Svg,
      enrichedGraph: { nodes: { n1: { id: 'n1' } }, edges: {} },
    });
    const { result } = renderHook(() => useBracketSvgExport(params));

    result.current();

    expect(renderGraphToSvg).toHaveBeenCalledTimes(1);
    expect(downloadSvgString).toHaveBeenCalledWith('<svg>test</svg>');
  });

  it('calls downloadSvgFromElement for Export mode without vertexComponent', () => {
    const div = document.createElement('div');
    const params = makeDefaultParams({
      nodeRenderMode: SquashNodeRenderMode.Export,
      wrapperRef: makeWrapperRef(div),
    });
    const { result } = renderHook(() => useBracketSvgExport(params));

    result.current();

    expect(downloadSvgFromElement).toHaveBeenCalledWith(div);
  });

  it('calls downloadSvgFromElement when a custom vertexComponent is provided (any mode)', () => {
    const div = document.createElement('div');
    const params = makeDefaultParams({
      nodeRenderMode: SquashNodeRenderMode.Html,
      vertexComponent: FakeVertex,
      wrapperRef: makeWrapperRef(div),
    });
    const { result } = renderHook(() => useBracketSvgExport(params));

    result.current();

    expect(downloadSvgFromElement).toHaveBeenCalledWith(div);
  });

  it('renders an offscreen host and calls downloadSvgFromElement for Html mode (no vertexComponent)', () => {
    // Html mode without a custom vertexComponent triggers the flushSync / createRoot path.
    // downloadSvgFromElement is mocked, so the SVG-not-found error is never thrown.
    const params = makeDefaultParams({
      nodeRenderMode: SquashNodeRenderMode.Html,
      vertexComponent: undefined,
    });
    const { result } = renderHook(() => useBracketSvgExport(params), {
      wrapper: ({ children }) => (
        <BracketAppearanceProvider isDarkMode={false} compact>
          {children}
        </BracketAppearanceProvider>
      ),
    });

    expect(() => result.current()).not.toThrow();
    expect(downloadSvgFromElement).toHaveBeenCalledTimes(1);
  });

  it('calls onExportError and rethrows when an error occurs', () => {
    const onExportError = vi.fn();
    const boom = new Error('svg exploded');
    (downloadSvgFromElement as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw boom;
    });

    const div = document.createElement('div');
    const params = makeDefaultParams({
      nodeRenderMode: SquashNodeRenderMode.Export,
      wrapperRef: makeWrapperRef(div),
      onExportError,
    });
    const { result } = renderHook(() => useBracketSvgExport(params));

    expect(() => result.current()).toThrow('svg exploded');
    expect(onExportError).toHaveBeenCalledWith(boom);
  });

  it('rethrows the error after calling onExportError', () => {
    const onExportError = vi.fn();
    const boom = new Error('rethrow check');
    (downloadSvgFromElement as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw boom;
    });

    const div = document.createElement('div');
    const params = makeDefaultParams({
      nodeRenderMode: SquashNodeRenderMode.Export,
      wrapperRef: makeWrapperRef(div),
      onExportError,
    });
    const { result } = renderHook(() => useBracketSvgExport(params));

    expect(() => result.current()).toThrow('rethrow check');
    expect(onExportError).toHaveBeenCalledWith(boom);
    expect(result.current).toBeDefined();
  });
});
