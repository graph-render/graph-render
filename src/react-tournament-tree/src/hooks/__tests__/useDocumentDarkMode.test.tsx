import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useDocumentDarkMode } from '../useDocumentDarkMode';

afterEach(() => {
  document.documentElement.classList.remove('dark');
  document.body.classList.remove('dark');
});

describe('useDocumentDarkMode', () => {
  it('initializes with isDarkMode=false when no dark class is present', () => {
    const { result } = renderHook(() => useDocumentDarkMode());
    expect(result.current.isDarkMode).toBe(false);
  });

  it('initializes with isDarkMode=true when html element already has dark class', () => {
    document.documentElement.classList.add('dark');
    const { result } = renderHook(() => useDocumentDarkMode());
    expect(result.current.isDarkMode).toBe(true);
  });

  it('detects when dark class is added to html element after mount', async () => {
    const { result } = renderHook(() => useDocumentDarkMode());
    expect(result.current.isDarkMode).toBe(false);

    await act(async () => {
      document.documentElement.classList.add('dark');
      // Allow MutationObserver microtask to fire
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current.isDarkMode).toBe(true);
  });

  it('toggleDarkMode switches from false to true', () => {
    const { result } = renderHook(() => useDocumentDarkMode());
    expect(result.current.isDarkMode).toBe(false);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDarkMode).toBe(true);
  });

  it('toggleDarkMode switches from true to false', () => {
    document.documentElement.classList.add('dark');
    const { result } = renderHook(() => useDocumentDarkMode());
    expect(result.current.isDarkMode).toBe(true);

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(result.current.isDarkMode).toBe(false);
  });

  it('toggleDarkMode updates the html element class', () => {
    const { result } = renderHook(() => useDocumentDarkMode());

    act(() => {
      result.current.toggleDarkMode();
    });

    expect(document.documentElement).toHaveClass('dark');
  });

  it('returns a stable toggleDarkMode reference across renders', () => {
    const { result, rerender } = renderHook(() => useDocumentDarkMode());
    const firstRef = result.current.toggleDarkMode;
    rerender();
    expect(result.current.toggleDarkMode).toBe(firstRef);
  });
});
