/* eslint-disable testing-library/no-manual-cleanup -- this suite must unmount MutationObserver subscribers before resetting document theme classes. */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useDocumentDarkMode } from '../useDocumentDarkMode';

const flushMutationObservers = async () => new Promise((resolve) => setTimeout(resolve, 10));

const setDocumentDarkMode = async (enabled: boolean) => {
  await act(async () => {
    document.documentElement.classList.toggle('dark', enabled);
    await flushMutationObservers();
  });
};

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove('dark');
  document.body.classList.remove('dark');
});

describe('useDocumentDarkMode', () => {
  it('initializes with isDarkMode=false when no dark class is present', () => {
    const { result } = renderHook(() => useDocumentDarkMode());
    expect(result.current.isDarkMode).toBe(false);
  });

  it('initializes with isDarkMode=true when html element already has dark class', async () => {
    await setDocumentDarkMode(true);
    const { result } = renderHook(() => useDocumentDarkMode());
    expect(result.current.isDarkMode).toBe(true);
  });

  it('detects when dark class is added to html element after mount', async () => {
    const { result } = renderHook(() => useDocumentDarkMode());
    expect(result.current.isDarkMode).toBe(false);

    await setDocumentDarkMode(true);

    expect(result.current.isDarkMode).toBe(true);
  });

  it('toggleDarkMode switches from false to true', async () => {
    const { result } = renderHook(() => useDocumentDarkMode());
    expect(result.current.isDarkMode).toBe(false);

    await act(async () => {
      result.current.toggleDarkMode();
      await flushMutationObservers();
    });

    expect(result.current.isDarkMode).toBe(true);
  });

  it('toggleDarkMode switches from true to false', async () => {
    await setDocumentDarkMode(true);
    const { result } = renderHook(() => useDocumentDarkMode());
    expect(result.current.isDarkMode).toBe(true);

    await act(async () => {
      result.current.toggleDarkMode();
      await flushMutationObservers();
    });

    expect(result.current.isDarkMode).toBe(false);
  });

  it('toggleDarkMode updates the html element class when syncToDocument is enabled', async () => {
    const { result } = renderHook(() => useDocumentDarkMode({ syncToDocument: true }));

    await act(async () => {
      result.current.toggleDarkMode();
      await flushMutationObservers();
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
