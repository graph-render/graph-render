/**
 * Minimal type declarations for the optional jspdf peer dependency.
 *
 * jspdf is not installed by default. If you want PDF export, install it:
 *   npm install jspdf
 *
 * Browser limitations: custom fonts and cross-origin images may not render
 * correctly in the exported PDF, for the same reasons as the PNG export.
 */
declare module 'jspdf' {
  interface JsPDFOptions {
    orientation?: 'portrait' | 'landscape';
    unit?: string;
    format?: [number, number] | string;
  }

  export class jsPDF {
    constructor(options?: JsPDFOptions);
    addImage(
      data: string,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number
    ): this;
    save(filename?: string): void;
  }

  export default jsPDF;
}
