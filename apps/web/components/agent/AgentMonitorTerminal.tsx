"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  TerminalIcon,
} from "@hugeicons/core-free-icons";
import { useAgentMonitor } from "./AgentMonitorContext.js";

const ACTION_COLORS: Record<string, string> = {
  TYPE_TEXT: "text-[#93c5fd] bg-[#142233] border-[#93c5fd]/30",
  CLICK: "text-[#d8b4fe] bg-[#251e33] border-[#d8b4fe]/30",
  UPLOAD_RESUME: "text-[#fdba74] bg-[#2e1d13] border-[#fdba74]/30",
  SCROLL_DOWN: "text-zinc-400 bg-[#181b1f] border-[rgba(255,255,255,0.06)]",
  WAIT: "text-zinc-400 bg-[#181b1f] border-[rgba(255,255,255,0.06)]",
  BLOCKED: "text-rose-400 bg-rose-950/40 border-rose-800/40",
  DONE: "text-[#a7f3d0] bg-[#142820] border-[#a7f3d0]/30",
};

export function AgentMonitorTerminal() {
  const { run } = useAgentMonitor();

  if (!run) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#181b1f] rounded-xl border border-[rgba(255,255,255,0.07)] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Status:</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded capitalize ${
              run.status === "succeeded"
                ? "bg-[#142820] text-[#a7f3d0] border border-[#a7f3d0]/30"
                : run.status === "running"
                ? "bg-[#142233] text-[#93c5fd] border border-[#93c5fd]/30 animate-pulse"
                : run.status === "waiting_user"
                ? "bg-[#2e1d13] text-[#fdba74] border border-[#fdba74]/30"
                : "bg-[#121417] text-zinc-300 border border-[rgba(255,255,255,0.06)]"
            }`}
          >
            {run.status.replace("_", " ")}
          </span>
        </div>

        <div className="flex items-center gap-4 text-zinc-400">
          <span className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Clock01Icon} size={13} className="text-zinc-500" />
            {new Date(run.startedAt).toLocaleTimeString()}
          </span>
          <span>
            Steps: <strong className="text-zinc-200">{run.events.length}</strong>
          </span>
        </div>
      </div>

      {/* Terminal View */}
      <div className="bg-[#0c0d0e] rounded-xl border border-[rgba(255,255,255,0.07)] p-4 font-mono text-xs flex flex-col gap-3 min-h-[260px] max-h-[400px] overflow-y-auto">
        <div className="flex items-center gap-2 text-zinc-400 pb-2 border-b border-[rgba(255,255,255,0.06)]">
          <HugeiconsIcon icon={TerminalIcon} size={14} className="text-[#a7f3d0]" />
          <span>Execution Log Stream</span>
        </div>

        {run.events.length === 0 ? (
          <div className="text-zinc-500 italic py-8 text-center">
            Initializing browser context and waiting for initial DOM snapshot...
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {run.events.map((evt) => {
              const badgeClass = ACTION_COLORS[evt.actionType] || "text-zinc-300 bg-[#181b1f] border-[rgba(255,255,255,0.06)]";
              return (
                <div
                  key={evt.id}
                  className="flex items-start gap-3 p-2 bg-[#121417]/60 rounded border border-[rgba(255,255,255,0.05)] hover:bg-[#181b1f] transition-colors"
                >
                  <span className="text-zinc-500 shrink-0 font-bold">
                    #{evt.stepIndex}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${badgeClass} shrink-0`}>
                    {evt.actionType}
                  </span>
                  <p className="text-zinc-300 flex-1 leading-relaxed font-sans text-xs">
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
          <div className="mt-2 p-3 badge-sage rounded-lg text-xs flex items-start gap-2">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-[#a7f3d0] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-[11px] uppercase tracking-wider text-[#a7f3d0]">
                Application Successfully Verified:
              </span>
              <p className="text-xs text-zinc-200">{run.submissionProof}</p>
            </div>
          </div>
        )}

        {run.errorMessage && (
          <div className="mt-2 p-3 bg-red-950/30 border border-red-800/40 rounded-lg text-red-300 flex items-start gap-2">
            <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-red-400 shrink-0 mt-0.5" />
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
