"use client";

import { CheckCircle2, Clock, Terminal, XCircle } from "lucide-react";
import { useAgentMonitor } from "./AgentMonitorContext.js";

const ACTION_COLORS: Record<string, string> = {
  TYPE_TEXT: "text-blue-400 bg-blue-950/60 border-blue-800/60",
  CLICK: "text-purple-400 bg-purple-950/60 border-purple-800/60",
  UPLOAD_RESUME: "text-amber-400 bg-amber-950/60 border-amber-800/60",
  SCROLL_DOWN: "text-zinc-400 bg-zinc-800 border-zinc-700",
  WAIT: "text-zinc-400 bg-zinc-800 border-zinc-700",
  BLOCKED: "text-rose-400 bg-rose-950/60 border-rose-800/60",
  DONE: "text-emerald-400 bg-emerald-950/60 border-emerald-800/60",
};

export function AgentMonitorTerminal() {
  const { run } = useAgentMonitor();

  if (!run) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Status:</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded capitalize ${
              run.status === "succeeded"
                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                : run.status === "running"
                ? "bg-cyan-950 text-cyan-400 border border-cyan-800/60 animate-pulse"
                : run.status === "waiting_user"
                ? "bg-amber-950 text-amber-400 border border-amber-800/60"
                : "bg-zinc-800 text-zinc-300"
            }`}
          >
            {run.status.replace("_", " ")}
          </span>
        </div>

        <div className="flex items-center gap-4 text-zinc-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            {new Date(run.startedAt).toLocaleTimeString()}
          </span>
          <span>
            Steps: <strong className="text-zinc-200">{run.events.length}</strong>
          </span>
        </div>
      </div>

      {/* Terminal View */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 font-mono text-xs flex flex-col gap-3 min-h-[260px] max-h-[400px] overflow-y-auto">
        <div className="flex items-center gap-2 text-zinc-500 pb-2 border-b border-zinc-800/80">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Execution Log Stream</span>
        </div>

        {run.events.length === 0 ? (
          <div className="text-zinc-500 italic py-8 text-center">
            Initializing browser context and waiting for initial DOM snapshot...
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {run.events.map((evt) => {
              const badgeClass = ACTION_COLORS[evt.actionType] || "text-zinc-300 bg-zinc-800 border-zinc-700";
              return (
                <div
                  key={evt.id}
                  className="flex items-start gap-3 p-2 bg-zinc-900/40 rounded border border-zinc-800/60 hover:bg-zinc-900/80 transition-colors"
                >
                  <span className="text-zinc-500 shrink-0 font-bold">
                    #{evt.stepIndex}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${badgeClass} shrink-0`}>
                    {evt.actionType}
                  </span>
                  <p className="text-zinc-300 flex-1 leading-relaxed">
                    {evt.details}
                  </p>
                  <span className="text-[10px] text-zinc-500 shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {run.submissionProof && (
          <div className="mt-2 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[11px] uppercase tracking-wider text-emerald-400">
                Application Successfully Verified:
              </span>
              <p className="text-xs">{run.submissionProof}</p>
            </div>
          </div>
        )}

        {run.errorMessage && (
          <div className="mt-2 p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[11px] uppercase tracking-wider text-red-400">
                Execution Error:
              </span>
              <p className="text-xs">{run.errorMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
