"use client";

import { useResumeEditor } from "./ResumeEditorContext.js";
import { ResumeEditorDiffList } from "./ResumeEditorDiffList.js";
import { ResumeEditorSource } from "./ResumeEditorSource.js";
import { ResumeEditorViewer } from "./ResumeEditorViewer.js";

/**
 * Compound component dynamically rendering the active Resume Studio workspace tab:
 * Document Preview, ATS Tailoring Diffs, or LaTeX Source code.
 */
export function ResumeEditorContent() {
  const { activeTab } = useResumeEditor();

  return (
    <div className="w-full mt-2 transition-opacity duration-200">
      {activeTab === "visual" && <ResumeEditorViewer />}
      {activeTab === "diffs" && <ResumeEditorDiffList />}
      {activeTab === "latex" && <ResumeEditorSource />}
    </div>
  );
}
