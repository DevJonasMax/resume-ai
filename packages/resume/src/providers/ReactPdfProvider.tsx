import type { ReactElement } from "react";
import { type DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import type { ResumeDocument } from "@resume-ai/types";
import { ModernReactPdfTemplate } from "../templates/react-pdf/ModernReactPdfTemplate.js";
import type { PDFProvider, RenderOptions } from "./PDFProvider.js";

/**
 * Provider generating high-fidelity PDF documents using @react-pdf/renderer.
 */
export class ReactPdfProvider implements PDFProvider {
  public readonly name = "react-pdf" as const;

  /**
   * Compiles the canonical resume document into a PDF buffer via React-PDF.
   */
  public async renderPdf(document: ResumeDocument, options?: RenderOptions): Promise<Buffer> {
    const element = ModernReactPdfTemplate({ document, options }) as ReactElement<DocumentProps>;
    return await renderToBuffer(element);
  }

  /**
   * Returns a formatted JSON string representing the underlying structured document.
   */
  public renderSource(document: ResumeDocument): string {
    return JSON.stringify(document, null, 2);
  }
}
