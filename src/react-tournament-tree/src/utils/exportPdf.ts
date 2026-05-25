import type { jsPDF as JsPDFType } from 'jspdf';

import { svgStringToPngBlob } from './exportPng';

export class PdfExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfExportError';
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

  return { width: 800, height: 600 };
}

type JsPDFConstructor = new (options?: {
  orientation?: 'portrait' | 'landscape';
  unit?: string;
  format?: [number, number] | string;
}) => JsPDFType;

/**
 * Exports the bracket as a PDF file.
 *
 * Requires the optional `jspdf` package to be installed:
 *   npm install jspdf
 *
 * Browser limitations: same as PNG export — custom fonts and cross-origin
 * images may not appear correctly.
 */
export async function downloadPdfFromSvgString(
  svgString: string,
  filename?: string
): Promise<void> {
  let JsPDF: JsPDFConstructor;
  try {
    // eslint-disable-next-line import/no-unresolved -- jspdf is an optional peer dependency; install with: npm install jspdf
    const jsPdfModule = await import('jspdf');
    // jsPDF may be the default export or named export depending on the bundler.
    const resolved: unknown =
      (jsPdfModule as { jsPDF?: unknown }).jsPDF ??
      (jsPdfModule as { default?: { jsPDF?: unknown } }).default?.jsPDF ??
      (jsPdfModule as { default?: unknown }).default;
    if (typeof resolved !== 'function') {
      throw new PdfExportError(
        'Could not resolve jsPDF constructor. Ensure jspdf is correctly installed.'
      );
    }
    JsPDF = resolved as JsPDFConstructor;
  } catch (err) {
    if (err instanceof PdfExportError) throw err;
    throw new PdfExportError('PDF export requires jsPDF. Install it with: npm install jspdf');
  }

  const pngBlob = await svgStringToPngBlob(svgString);
  const pngDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.addEventListener('error', () =>
      reject(new PdfExportError('Failed to read PNG data for PDF embedding.'))
    );
    reader.readAsDataURL(pngBlob);
  });

  const { width, height } = parseSvgDimensions(svgString);

  // Use landscape orientation when the bracket is wider than it is tall.
  const orientation = width >= height ? 'landscape' : 'portrait';
  const ptPerPx = 0.75;
  const pageWidth = width * ptPerPx;
  const pageHeight = height * ptPerPx;

  const doc = new JsPDF({
    orientation,
    unit: 'pt',
    format: [pageWidth, pageHeight],
  });

  doc.addImage(pngDataUrl, 'PNG', 0, 0, pageWidth, pageHeight);
  doc.save(filename ?? `tournament-bracket-${Date.now()}.pdf`);
}
