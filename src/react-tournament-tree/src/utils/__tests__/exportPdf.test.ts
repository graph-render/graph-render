import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadPdfFromSvgString, PdfExportError } from '../exportPdf';

const MINIMAL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"></svg>';

// vi.mock is hoisted — define the spy at module scope so tests can inspect it.
const mockSave = vi.fn();
// Must use function keyword so it can be called with `new`
const MockJsPDFConstructor = vi.fn(function MockJsPDF() {
  return { addImage: vi.fn(), save: mockSave };
});

vi.mock('jspdf', () => ({
  jsPDF: MockJsPDFConstructor,
}));

let lastMockImage: MockImageInstance | null = null;

class MockImageInstance {
  src = '';
  naturalWidth = 800;
  naturalHeight = 600;
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
}

beforeEach(() => {
  lastMockImage = null;
  mockSave.mockClear();
  MockJsPDFConstructor.mockClear();
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  URL.revokeObjectURL = vi.fn();
  vi.stubGlobal('Image', MockImageInstance);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
    (cb: (b: Blob | null) => void) => {
      cb(new Blob(['png'], { type: 'image/png' }));
    }
  );
  const MockFileReader = vi.fn().mockImplementation(function MockFR(this: FileReader) {
    Object.defineProperty(this, 'result', {
      get: () => 'data:image/png;base64,abc',
    });
    (this as unknown as Record<string, unknown>)['addEventListener'] = (
      event: string,
      cb: () => void
    ) => {
      if (event === 'load') queueMicrotask(cb);
    };
    (this as unknown as Record<string, unknown>)['readAsDataURL'] = vi.fn();
  });
  vi.stubGlobal('FileReader', MockFileReader);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('downloadPdfFromSvgString', () => {
  it('calls jsPDF save() and addImage() after PNG conversion', async () => {
    const downloadPromise = downloadPdfFromSvgString(MINIMAL_SVG, 'bracket.pdf');

    // The dynamic import of jspdf + svgStringToPngBlob takes a few microtask ticks
    // before new Image() is called. Poll until it's set.
    for (let i = 0; i < 20; i++) {
      await Promise.resolve();
      if (lastMockImage !== null) break;
    }
    expect(lastMockImage).not.toBeNull();
    lastMockImage!.simulateLoad();
    await downloadPromise;

    expect(MockJsPDFConstructor).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith('bracket.pdf');
  });

  it('PdfExportError is an instance of Error with correct name', () => {
    const err = new PdfExportError('test message');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('PdfExportError');
    expect(err.message).toBe('test message');
  });
});
