import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { appConfig } from "@resume-ai/config";
import type { ResumeDocument } from "@resume-ai/types";
import { renderTypstTemplate } from "../templates/typst/modernTypstTemplate.js";
import type { PDFProvider, RenderOptions } from "./PDFProvider.js";

const execFileAsync = promisify(execFile);

/**
 * Provider compiling canonical ResumeDocument instances to native PDF via Typst CLI.
 */
export class TypstProvider implements PDFProvider {
  public readonly name = "typst" as const;
  private readonly typstBinary: string;

  constructor(customBinaryPath?: string) {
    this.typstBinary = this.resolveTypstBinary(customBinaryPath);
  }

  /**
   * Resolves the active Typst binary path across environment, config, and system defaults.
   */
  private resolveTypstBinary(customPath?: string): string {
    if (customPath && fs.existsSync(customPath)) {
      return customPath;
    }

    if (appConfig.typstPath && fs.existsSync(appConfig.typstPath)) {
      return appConfig.typstPath;
    }

    if (process.env["TYPST_PATH"] && fs.existsSync(process.env["TYPST_PATH"])) {
      return process.env["TYPST_PATH"];
    }

    // Check common Windows WinGet installation path
    const localAppData = process.env["LOCALAPPDATA"];
    if (localAppData) {
      const wingetTypstPath = path.join(
        localAppData,
        "Microsoft",
        "WinGet",
        "Packages",
        "Typst.Typst_Microsoft.Winget.Source_8wekyb3d8bbwe",
        "typst-x86_64-pc-windows-msvc",
        "typst.exe"
      );
      if (fs.existsSync(wingetTypstPath)) {
        return wingetTypstPath;
      }
    }

    return "typst";
  }

  /**
   * Returns the rendered Typst markup string.
   */
  public renderSource(document: ResumeDocument, options?: RenderOptions): string {
    return renderTypstTemplate(document, options);
  }

  /**
   * Compiles the resume document into a native PDF Buffer.
   */
  public async renderPdf(document: ResumeDocument, options?: RenderOptions): Promise<Buffer> {
    const typstSource = this.renderSource(document, options);
    const uniqueId = randomUUID();
    const tempDir = os.tmpdir();
    const inputFilePath = path.join(tempDir, `resume-${uniqueId}.typ`);
    const outputFilePath = path.join(tempDir, `resume-${uniqueId}.pdf`);

    try {
      await fs.promises.writeFile(inputFilePath, typstSource, "utf-8");
      await execFileAsync(this.typstBinary, ["compile", inputFilePath, outputFilePath]);
      return await fs.promises.readFile(outputFilePath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Typst compilation failed using [${this.typstBinary}]: ${message}`);
    } finally {
      await Promise.all([
        fs.promises.unlink(inputFilePath).catch(() => {}),
        fs.promises.unlink(outputFilePath).catch(() => {}),
      ]);
    }
  }
}
