export class SvgExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SvgExportError';
  }
}

export function downloadSvgString(svgString: string, filename?: string) {
  if (!svgString.trim()) {
    throw new SvgExportError('Cannot export an empty SVG document.');
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename ?? `tournament-bracket-${Date.now()}.svg`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function getSvgStringFromElement(rootElement: Element | null): string {
  if (!rootElement) {
    throw new SvgExportError('Cannot export SVG because the export root element is missing.');
  }

  const svgElement = rootElement.querySelector('svg');
  if (!svgElement) {
    throw new SvgExportError('Cannot export SVG because no <svg> element was found.');
  }

  const clonedSvg = svgElement.cloneNode(true) as SVGElement;
  clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  return new XMLSerializer().serializeToString(clonedSvg);
}

export function downloadSvgFromElement(rootElement: Element | null) {
  downloadSvgString(getSvgStringFromElement(rootElement));
}
