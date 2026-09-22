import type { ResumeDocument } from "@resume-ai/types";

/**
 * Rendering configuration options for PDF output generation.
 */
export interface RenderOptions {
  paperSize?: "letter" | "a4" | undefined;
  format?: "pdf" | "source" | undefined;
}

/**
 * Common abstraction contract for resume PDF rendering engines.
 */
export interface PDFProvider {
  readonly name: "typst" | "react-pdf" | "latex";
  renderPdf(document: ResumeDocument, options?: RenderOptions): Promise<Buffer>;
  renderSource?(document: ResumeDocument, options?: RenderOptions): Promise<string> | string;
}
