import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadSvgFromElement, SvgExportError } from '../exportSvg';

// jsdom does not implement URL.createObjectURL, so we must mock it.
const mockCreateObjectURL = vi.fn((_blob: Blob) => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

beforeEach(() => {
  URL.createObjectURL = mockCreateObjectURL;
  URL.revokeObjectURL = mockRevokeObjectURL;
  mockCreateObjectURL.mockClear();
  mockRevokeObjectURL.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeSvgContainer(): HTMLDivElement {
  const container = document.createElement('div');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '400');
  svg.setAttribute('height', '200');
  container.append(svg);
  document.body.append(container);
  return container;
}

describe('downloadSvgFromElement', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('throws when rootElement is null', () => {
    expect(() => downloadSvgFromElement(null)).toThrow(SvgExportError);
    expect(mockCreateObjectURL).not.toHaveBeenCalled();
  });

  it('throws when there is no <svg> inside rootElement', () => {
    const div = document.createElement('div');
    expect(() => downloadSvgFromElement(div)).toThrow(SvgExportError);
    expect(mockCreateObjectURL).not.toHaveBeenCalled();
  });

  it('creates an object URL from a Blob', () => {
    const container = makeSvgContainer();
    downloadSvgFromElement(container);
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('revokes the object URL after triggering the download', () => {
    const container = makeSvgContainer();
    downloadSvgFromElement(container);
    expect(mockRevokeObjectURL).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('adds xmlns attributes to the cloned SVG', () => {
    const container = makeSvgContainer();
    downloadSvgFromElement(container);

    // Verify the Blob passed to createObjectURL has svg+xml type
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    const passedBlob = mockCreateObjectURL.mock.calls[0]![0];
    expect(passedBlob.type).toBe('image/svg+xml;charset=utf-8');
  });

  it('removes the anchor element from the DOM after click', () => {
    const container = makeSvgContainer();
    const initialAnchorCount = document.body.querySelectorAll('a').length;
    downloadSvgFromElement(container);
    expect(document.body.querySelectorAll('a').length).toBe(initialAnchorCount);
  });
});
