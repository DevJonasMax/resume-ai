import type { CandidateProfile, ResumeDocument } from "@resume-ai/types";
import { LaTeXEngine } from "../LaTeXEngine.js";
import type { PDFProvider, RenderOptions } from "./PDFProvider.js";

/**
 * @deprecated Legacy LaTeX provider retained for backwards compatibility.
 * Use TypstProvider or ReactPdfProvider for modern multi-provider PDF generation.
 */
export class LegacyLaTeXProvider implements PDFProvider {
  public readonly name = "latex" as const;
  private readonly latexEngine: LaTeXEngine;

  constructor() {
    this.latexEngine = new LaTeXEngine();
  }

  /**
   * Generates legacy LaTeX document source markup.
   */
  public renderSource(document: ResumeDocument): string {
    const candidate: CandidateProfile = {
      id: "legacy",
      fullName: document.basics.fullName,
      email: document.basics.email,
      phone: document.basics.phone,
      location: document.basics.location,
      summary: document.summary,
      experiences: document.experiences,
      skills: document.skills.reduce<Record<string, string[]>>((acc, g) => {
        acc[g.category] = g.items;
        return acc;
      }, {}),
      education: document.education,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.latexEngine.renderDocument({
      candidate,
      summary: document.summary,
      experiences: document.experiences,
    });
  }

  /**
   * Legacy LaTeX PDF rendering. Emits actionable error directing consumers to modern providers.
   */
  public async renderPdf(_document: ResumeDocument, _options?: RenderOptions): Promise<Buffer> {
    throw new Error(
      "Legacy LaTeX PDF compilation is deprecated. Configure PDF_PROVIDER='typst' or PDF_PROVIDER='react-pdf' for automated PDF rendering."
    );
  }
}
