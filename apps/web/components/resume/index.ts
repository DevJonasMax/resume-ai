import { ResumeEditorDiffList } from "./ResumeEditorDiffList.js";
import { ResumeEditorRoot } from "./ResumeEditorRoot.js";
import { ResumeEditorSource } from "./ResumeEditorSource.js";
import { ResumeEditorToolbar } from "./ResumeEditorToolbar.js";
import { ResumeEditorViewer } from "./ResumeEditorViewer.js";

export const ResumeEditor = Object.assign(ResumeEditorRoot, {
  Root: ResumeEditorRoot,
  Toolbar: ResumeEditorToolbar,
  Viewer: ResumeEditorViewer,
  DiffList: ResumeEditorDiffList,
  Source: ResumeEditorSource,
});

export * from "./ResumeEditorContext.js";
