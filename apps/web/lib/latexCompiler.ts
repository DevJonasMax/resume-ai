import { PdfLatex } from "@typeward/texlive-wasm";

export interface LatexCompilationOutput {
  pdfBlob: Blob;
  pdfUrl: string;
  log: string;
}

let pdfLatexEngine: PdfLatex | null = null;

function getPdfLatexInstance(): PdfLatex {
  if (!pdfLatexEngine) {
    pdfLatexEngine = new PdfLatex({
      enginePath: "/texlive-wasm/pdflatex/emscripten/pdflatex.wasm",
      bundleUrl: "/texlive-wasm/texmf-core-pdflatex.tar",
      allowUnverifiedAssets: true,
    });
  }
  return pdfLatexEngine;
}

/**
 * Compiles a LaTeX source string to PDF using WebAssembly TeX Live.
 * Reuses a singleton PdfLatex instance for performance.
 *
 * @param latexSource The LaTeX document content to compile.
 * @returns An object containing the compiled PDF Blob, an Object URL, and execution logs.
 */
export async function compileLatexToPdf(latexSource: string): Promise<LatexCompilationOutput> {
  try {
    const engine = getPdfLatexInstance();

    const result = await engine.compile({
      mainTex: "main.tex",
      files: [
        {
          path: "main.tex",
          content: latexSource,
        },
      ],
      interaction: "nonstopmode",
      outputFormat: "pdf",
    });

    const pdfBytes = result.outputs.get("main.pdf");
    const log = result.log || result.stdout || result.stderr || "";

    if (!pdfBytes || pdfBytes.length === 0) {
      const errorDetails = log.trim() || "Compilation failed without generating a PDF.";
      throw new Error(errorDetails);
    }

    const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    return {
      pdfBlob,
      pdfUrl,
      log,
    };
  } catch (err) {
    if (pdfLatexEngine) {
      try {
        await pdfLatexEngine.dispose();
      } catch {
        // Ignore dispose errors
      }
      pdfLatexEngine = null;
    }
    throw err;
  }
}
