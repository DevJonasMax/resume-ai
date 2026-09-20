import { ResumeEditorContent } from "./ResumeEditorContent.js";
import { ResumeEditorDiffList } from "./ResumeEditorDiffList.js";
import { ResumeEditorRoot } from "./ResumeEditorRoot.js";
import { ResumeEditorSource } from "./ResumeEditorSource.js";
import { ResumeEditorToolbar } from "./ResumeEditorToolbar.js";
import { ResumeEditorViewer } from "./ResumeEditorViewer.js";

export const ResumeEditor = Object.assign(ResumeEditorRoot, {
  Root: ResumeEditorRoot,
  Toolbar: ResumeEditorToolbar,
  Content: ResumeEditorContent,
  Viewer: ResumeEditorViewer,
  DiffList: ResumeEditorDiffList,
  Source: ResumeEditorSource,
});

export * from "./ResumeEditorContent.js";
export * from "./ResumeEditorContext.js";
