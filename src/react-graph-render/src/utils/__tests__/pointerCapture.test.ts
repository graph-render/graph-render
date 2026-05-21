import { describe, expect, it, vi } from 'vitest';

import {
  releasePointerCaptureIfAvailable,
  setPointerCaptureIfAvailable,
} from '../pointerCapture';

describe('pointer capture helpers', () => {
  it('sets pointer capture when supported', () => {
    const setPointerCapture = vi.fn();
    const target = { setPointerCapture } as unknown as Element;

    setPointerCaptureIfAvailable(target, 7);
    expect(setPointerCapture).toHaveBeenCalledWith(7);
  });

  it('releases pointer capture only when currently captured', () => {
    const releasePointerCapture = vi.fn();
    const target = {
      hasPointerCapture: vi.fn().mockReturnValue(true),
      releasePointerCapture,
    } as unknown as Element;

    releasePointerCaptureIfAvailable(target, 3);
    expect(releasePointerCapture).toHaveBeenCalledWith(3);
  });

  it('skips release when pointer is not captured', () => {
    const releasePointerCapture = vi.fn();
    const target = {
      hasPointerCapture: vi.fn().mockReturnValue(false),
      releasePointerCapture,
    } as unknown as Element;

    releasePointerCaptureIfAvailable(target, 3);
    expect(releasePointerCapture).not.toHaveBeenCalled();
  });
});
