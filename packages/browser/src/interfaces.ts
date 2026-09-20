import type { ElementTableEntry } from "@resume-ai/types";

/**
 * Result returned upon opening or navigating to a webpage.
 */
export interface OpenPageResult {
  url: string;
  pageTitle: string;
  elementTable: ElementTableEntry[];
}

/**
 * Interface abstracting browser automation engines (agent-browser or simulated).
 */
export interface BrowserAutomationService {
  /**
   * Launches or focuses the browser on a URL.
   */
  open(url: string, headless?: boolean): Promise<OpenPageResult>;

  /**
   * Captures accessibility snapshot and parses it into an element table.
   */
  snapshot(): Promise<ElementTableEntry[]>;

  /**
   * Types text into an element referenced by ref or CSS selector.
   */
  fill(refOrSelector: string, text: string): Promise<void>;

  /**
   * Clicks an interactive element.
   */
  click(refOrSelector: string): Promise<void>;

  /**
   * Uploads a file (such as a tailored resume).
   */
  upload(refOrSelector: string, filePath: string): Promise<void>;

  /**
   * Takes a screenshot of the current page.
   */
  screenshot(outputPath?: string): Promise<string>;

  /**
   * Closes the active browser session.
   */
  close(): Promise<void>;
}
