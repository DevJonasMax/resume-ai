import { ResumeStudioChatDrawer } from "./ResumeStudioChatDrawer";
import { ResumeStudioDiffDrawer } from "./ResumeStudioDiffDrawer";
import { ResumeStudioHeader } from "./ResumeStudioHeader";
import { ResumeStudioLatexEditor } from "./ResumeStudioLatexEditor";
import { ResumeStudioPdfPreview } from "./ResumeStudioPdfPreview";
import { ResumeStudioRoot } from "./ResumeStudioRoot";
import { ResumeStudioSplitView } from "./ResumeStudioSplitView";

export const ResumeStudio = Object.assign(ResumeStudioRoot, {
  Root: ResumeStudioRoot,
  Header: ResumeStudioHeader,
  SplitView: ResumeStudioSplitView,
  LatexEditor: ResumeStudioLatexEditor,
  PdfPreview: ResumeStudioPdfPreview,
  DiffDrawer: ResumeStudioDiffDrawer,
  ChatDrawer: ResumeStudioChatDrawer,
});

// Alias for backwards-compatibility
export const ResumeEditor = ResumeStudio;

export * from "./ResumeStudioChatDrawer";
export * from "./ResumeStudioContext";
export * from "./ResumeStudioDiffDrawer";
export * from "./ResumeStudioHeader";
export * from "./ResumeStudioLatexEditor";
export * from "./ResumeStudioPdfPreview";
export * from "./ResumeStudioRoot";
export * from "./ResumeStudioSplitView";
