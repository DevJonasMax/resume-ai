import type { BrowserAction, CandidateProfile, ElementTableEntry } from "@resume-ai/types";
import { choice } from "@typesafe-ai/sdk";
import { JevClient } from "./client.js";

/**
 * Browser navigation decision maker leveraging Jev System One action selection.
 */
export class BrowserDecider {
  private readonly jev: JevClient;

  constructor(jev?: JevClient) {
    this.jev = jev || new JevClient();
  }

  /**
   * Evaluates the current page state and element table to select the next optimal action.
   */
  public async decideNextAction(options: {
    url: string;
    pageTitle: string;
    elementTable: ElementTableEntry[];
    candidate: CandidateProfile;
    stepIndex: number;
    resumeFilePath?: string;
  }): Promise<BrowserAction> {
    const { elementTable, candidate, stepIndex, pageTitle } = options;

    // Detect CAPTCHA or security verification widgets
    const isCaptchaPresent = elementTable.some(
      (e) =>
        e.name.toLowerCase().includes("captcha") ||
        e.name.toLowerCase().includes("security check") ||
        e.name.toLowerCase().includes("verify you are human")
    );

    if (isCaptchaPresent) {
      return {
        type: "BLOCKED",
        confidence: 0.99,
        explanation: "CAPTCHA or automated bot detection challenge encountered. Yielding to human user.",
      };
    }

    // Detect file upload input for resume
    const resumeUploadElement = elementTable.find(
      (e) =>
        e.role === "button" &&
        (e.name.toLowerCase().includes("resume") ||
          e.name.toLowerCase().includes("cv") ||
          e.name.toLowerCase().includes("upload"))
    );

    // Look for unfilled form inputs
    const nameInput = elementTable.find(
      (e) =>
        (e.role === "textbox" || e.role === "combobox") &&
        (e.name.toLowerCase().includes("name") || e.name.toLowerCase().includes("full name")) &&
        !e.value
    );

    const emailInput = elementTable.find(
      (e) =>
        e.role === "textbox" &&
        (e.name.toLowerCase().includes("email") || e.name.toLowerCase().includes("e-mail")) &&
        !e.value
    );

    const phoneInput = elementTable.find(
      (e) =>
        e.role === "textbox" &&
        (e.name.toLowerCase().includes("phone") || e.name.toLowerCase().includes("mobile")) &&
        !e.value
    );

    // Look for application submit or next buttons
    const submitButton = elementTable.find(
      (e) =>
        (e.role === "button" || e.role === "link") &&
        (e.name.toLowerCase() === "submit" ||
          e.name.toLowerCase() === "submit application" ||
          e.name.toLowerCase() === "apply now" ||
          e.name.toLowerCase() === "next" ||
          e.name.toLowerCase() === "continue")
    );

    const confirmationNotice = elementTable.find(
      (e) =>
        e.name.toLowerCase().includes("application submitted") ||
        e.name.toLowerCase().includes("thank you for applying") ||
        e.name.toLowerCase().includes("received your application") ||
        pageTitle.toLowerCase().includes("application submitted")
    );

    if (confirmationNotice) {
      return {
        type: "DONE",
        confidence: 0.98,
        explanation: `Application confirmed: ${confirmationNotice.name}`,
      };
    }

    // Use Jev Choice to select operation
    const decision = await this.jev.askChoice(
      {
        pageTitle,
        stepIndex,
        elementsCount: elementTable.length,
        hasNameInput: Boolean(nameInput),
        hasEmailInput: Boolean(emailInput),
        hasPhoneInput: Boolean(phoneInput),
        hasResumeUpload: Boolean(resumeUploadElement),
        hasSubmitButton: Boolean(submitButton),
      },
      choice("What operation should the browser agent execute next?", {
        TYPE_TEXT: null,
        UPLOAD_RESUME: null,
        CLICK: null,
        SCROLL_DOWN: null,
        WAIT: null,
        DONE: null,
        BLOCKED: null,
      }),
      () => {
        if (nameInput) {
          return {
            value: "TYPE_TEXT",
            confidence: 0.95,
            explanation: `Typing candidate name into ${nameInput.ref}`,
          };
        }
        if (emailInput) {
          return {
            value: "TYPE_TEXT",
            confidence: 0.95,
            explanation: `Typing candidate email into ${emailInput.ref}`,
          };
        }
        if (phoneInput) {
          return {
            value: "TYPE_TEXT",
            confidence: 0.95,
            explanation: `Typing candidate phone into ${phoneInput.ref}`,
          };
        }
        if (resumeUploadElement && options.resumeFilePath) {
          return {
            value: "UPLOAD_RESUME",
            confidence: 0.92,
            explanation: `Uploading tailored resume to ${resumeUploadElement.ref}`,
          };
        }
        if (submitButton) {
          return {
            value: "CLICK",
            confidence: 0.9,
            explanation: `Clicking action button: ${submitButton.name}`,
          };
        }
        return {
          value: "WAIT",
          confidence: 0.8,
          explanation: "Waiting for page elements to settle",
        };
      }
    );

    // Map operation to concrete target
    if (decision.value === "TYPE_TEXT") {
      if (nameInput) {
        return {
          type: "TYPE_TEXT",
          targetRef: nameInput.ref,
          targetIndex: nameInput.index,
          textValue: candidate.fullName,
          confidence: decision.confidence,
          explanation: `Filling name field ${nameInput.ref} with "${candidate.fullName}"`,
        };
      }
      if (emailInput) {
        return {
          type: "TYPE_TEXT",
          targetRef: emailInput.ref,
          targetIndex: emailInput.index,
          textValue: candidate.email,
          confidence: decision.confidence,
          explanation: `Filling email field ${emailInput.ref} with "${candidate.email}"`,
        };
      }
      if (phoneInput) {
        return {
          type: "TYPE_TEXT",
          targetRef: phoneInput.ref,
          targetIndex: phoneInput.index,
          textValue: candidate.phone,
          confidence: decision.confidence,
          explanation: `Filling phone field ${phoneInput.ref} with "${candidate.phone}"`,
        };
      }
    }

    if (decision.value === "UPLOAD_RESUME" && resumeUploadElement) {
      return {
        type: "UPLOAD_RESUME",
        targetRef: resumeUploadElement.ref,
        targetIndex: resumeUploadElement.index,
        confidence: decision.confidence,
        explanation: `Uploading resume at ${resumeUploadElement.ref}`,
      };
    }

    if (decision.value === "CLICK" && submitButton) {
      return {
        type: "CLICK",
        targetRef: submitButton.ref,
        targetIndex: submitButton.index,
        confidence: decision.confidence,
        explanation: `Clicking ${submitButton.name} (${submitButton.ref})`,
      };
    }

    return {
      type: decision.value,
      confidence: decision.confidence,
      explanation: decision.explanation,
    };
  }
}
