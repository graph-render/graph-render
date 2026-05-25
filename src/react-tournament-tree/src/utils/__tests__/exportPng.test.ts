import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadPngFromSvgString, PngExportError, svgStringToPngBlob } from '../exportPng';

const MINIMAL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"></svg>';

const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

// Keep a reference to the most recently created mock image so tests can trigger events.
let lastMockImage: MockImageInstance | null = null;

class MockImageInstance {
  src = '';
  naturalWidth = 100;
  naturalHeight = 50;
  width = 100;
  height = 50;
  private readonly listeners = new Map<string, (e: Event) => void>();

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- needed to capture `this` for the closure below
    lastMockImage = this;
  }

  addEventListener(event: string, cb: (e: Event) => void) {
    this.listeners.set(event, cb);
  }

  simulateLoad() {
    this.listeners.get('load')?.(new Event('load'));
  }

  simulateError() {
    this.listeners.get('error')?.(new Event('error'));
  }
}

beforeEach(() => {
  URL.createObjectURL = mockCreateObjectURL;
  URL.revokeObjectURL = mockRevokeObjectURL;
  mockCreateObjectURL.mockClear();
  mockRevokeObjectURL.mockClear();
  lastMockImage = null;
  vi.stubGlobal('Image', MockImageInstance);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('svgStringToPngBlob', () => {
  it('rejects with PngExportError for an empty SVG string', async () => {
    await expect(svgStringToPngBlob('   ')).rejects.toThrow(PngExportError);
  });

  it('resolves with a Blob when the image loads successfully', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
      (cb: (b: Blob | null) => void) => {
        cb(new Blob(['png-data'], { type: 'image/png' }));
      }
    );

    const blobPromise = svgStringToPngBlob(MINIMAL_SVG);
    lastMockImage!.simulateLoad();

    const blob = await blobPromise;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
  });

  it('rejects with PngExportError when the image fails to load', async () => {
    const blobPromise = svgStringToPngBlob(MINIMAL_SVG);
    lastMockImage!.simulateError();

    await expect(blobPromise).rejects.toThrow(PngExportError);
  });

  it('rejects with PngExportError when canvas context is unavailable', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const blobPromise = svgStringToPngBlob(MINIMAL_SVG);
    lastMockImage!.simulateLoad();

    await expect(blobPromise).rejects.toThrow(PngExportError);
  });

  it('rejects with PngExportError when toBlob returns null', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
      (cb: (b: Blob | null) => void) => {
        cb(null);
      }
    );

    const blobPromise = svgStringToPngBlob(MINIMAL_SVG);
    lastMockImage!.simulateLoad();

    await expect(blobPromise).rejects.toThrow(PngExportError);
  });
});

describe('downloadPngFromSvgString', () => {
  it('triggers a download anchor click after PNG conversion', async () => {
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
      (cb: (b: Blob | null) => void) => {
        cb(new Blob(['png'], { type: 'image/png' }));
      }
    );

    const downloadPromise = downloadPngFromSvgString(MINIMAL_SVG, 'test.png');
    lastMockImage!.simulateLoad();

    await downloadPromise;

    expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });
});
