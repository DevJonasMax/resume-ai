import { appConfig } from "@resume-ai/config";
import { LegacyLaTeXProvider } from "./LegacyLaTeXProvider.js";
import type { PDFProvider } from "./PDFProvider.js";
import { ReactPdfProvider } from "./ReactPdfProvider.js";
import { TypstProvider } from "./TypstProvider.js";

/**
 * Central resolver managing and providing cached PDF provider singleton instances.
 */
export class PDFProviderResolver {
  private static readonly providers: Map<string, PDFProvider> = new Map();

  /**
   * Resolves and returns the requested or globally configured PDFProvider.
   */
  public static getProvider(name?: "typst" | "react-pdf" | "latex"): PDFProvider {
    const target = name || appConfig.pdfProvider || "typst";
    if (!this.providers.has(target)) {
      switch (target) {
        case "react-pdf":
          this.providers.set(target, new ReactPdfProvider());
          break;
        case "latex":
          this.providers.set(target, new LegacyLaTeXProvider());
          break;
        case "typst":
        default:
          this.providers.set("typst", new TypstProvider(appConfig.typstPath));
          break;
      }
    }
    return this.providers.get(target)!;
  }
}

/**
 * Convenient shorthand helper to obtain the active or specified PDF provider.
 */
export function getPDFProvider(name?: "typst" | "react-pdf" | "latex"): PDFProvider {
  return PDFProviderResolver.getProvider(name);
}
