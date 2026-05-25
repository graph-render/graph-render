export class PngExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PngExportError';
  }
}

function parseSvgDimensions(svgString: string): { width: number; height: number } {
  const widthMatch = /\bwidth="([\d.]+)"/.exec(svgString);
  const heightMatch = /\bheight="([\d.]+)"/.exec(svgString);

  if (widthMatch && heightMatch) {
    const w = parseFloat(widthMatch[1] ?? '');
    const h = parseFloat(heightMatch[1] ?? '');
    if (w > 0 && h > 0) return { width: w, height: h };
  }

  const viewBoxMatch = /\bviewBox="([^"]+)"/.exec(svgString);
  if (viewBoxMatch) {
    const parts = (viewBoxMatch[1] ?? '').trim().split(/[\s,]+/);
    if (parts.length === 4) {
      const w = parseFloat(parts[2]!);
      const h = parseFloat(parts[3]!);
      if (w > 0 && h > 0) return { width: w, height: h };
    }
  }

  return { width: 0, height: 0 };
}

/**
 * Converts an SVG string to a PNG Blob using the Canvas API.
 *
 * Browser limitations:
 * - Custom fonts loaded via @font-face may not render unless they are already
 *   loaded in the document at export time.
 * - Cross-origin images embedded in the SVG will be blocked by CORS and will
 *   not appear in the exported PNG.
 * - On some browsers, tainted-canvas security restrictions may prevent export
 *   when cross-origin images are present.
 */
export async function svgStringToPngBlob(svgString: string): Promise<Blob> {
  if (!svgString.trim()) {
    throw new PngExportError('Cannot export an empty SVG document.');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = URL.createObjectURL(svgBlob);
    const dimensions = parseSvgDimensions(svgString);

    img.addEventListener('load', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = dimensions.width || img.naturalWidth || img.width || 800;
        canvas.height = dimensions.height || img.naturalHeight || img.height || 600;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new PngExportError('Cannot create canvas 2D context for PNG export.'));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) {
            resolve(blob);
          } else {
            reject(new PngExportError('Failed to convert canvas to PNG blob.'));
          }
        }, 'image/png');
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err instanceof Error ? err : new PngExportError(String(err)));
      }
    });

    img.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new PngExportError(
          'Failed to load SVG for PNG export. ' +
            'Custom fonts and cross-origin images may not render correctly in PNG exports.'
        )
      );
    });

    img.src = objectUrl;
  });
}

export async function downloadPngFromSvgString(
  svgString: string,
  filename?: string
): Promise<void> {
  const blob = await svgStringToPngBlob(svgString);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename ?? `tournament-bracket-${Date.now()}.png`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
