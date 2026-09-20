import { Check, Copy, Save } from "lucide-react";
import { useState } from "react";
import { useResumeEditor } from "./ResumeEditorContext.js";

export function ResumeEditorSource() {
  const { editedLatex, onLatexChange, onSaveLatex, isSaving } = useResumeEditor();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedLatex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">LaTeX Source (.tex)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Source"}</span>
          </button>
          <button
            type="button"
            onClick={onSaveLatex}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950 font-mono text-xs">
        <textarea
          value={editedLatex}
          onChange={(e) => onLatexChange(e.target.value)}
          rows={26}
          spellCheck={false}
          className="w-full bg-zinc-950 text-zinc-200 p-4 font-mono leading-relaxed outline-none resize-y selection:bg-indigo-500/30 selection:text-indigo-200"
        />
      </div>
    </div>
  );
}
