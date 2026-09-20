import { AlertTriangle, Play } from "lucide-react";
import { useState } from "react";
import { useAgentMonitor } from "./AgentMonitorContext.js";

export function AgentMonitorIntervention() {
  const { run, onResume, isResuming } = useAgentMonitor();
  const [note, setNote] = useState("");

  if (!run || run.status !== "waiting_user" || !run.intervention) {
    return null;
  }

  const handleConfirm = async () => {
    await onResume(note.trim() || undefined);
  };

  return (
    <div className="p-4 bg-amber-950/40 border border-amber-600/50 rounded-xl flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-900/60 rounded-lg text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-200">
            Human Intervention Required
          </h4>
          <p className="text-xs text-amber-300/90 mt-0.5 leading-relaxed">
            {run.intervention.description || "Bot detection, CAPTCHA, or verification check encountered."}
          </p>
          <p className="text-xs text-amber-400 font-medium mt-1">
            Please solve the challenge directly in the visible browser window, then click Resume below.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-amber-900/40">
        <input
          type="text"
          placeholder="Optional notes or confirmation code..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1 w-full bg-zinc-900/90 border border-amber-700/50 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
        />

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isResuming}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white text-xs font-bold rounded-lg shadow-lg shadow-amber-600/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isResuming ? "Resuming..." : "I've Solved It: Resume Agent"}</span>
        </button>
      </div>
    </div>
  );
}
