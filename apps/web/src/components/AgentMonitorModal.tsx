import type { AgentRun } from "@resume-ai/types";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  ExternalLink,
  RotateCw,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { apiClient } from "../apiClient.js";

interface AgentMonitorModalProps {
  jobId: string;
  initialRun: AgentRun | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AgentMonitorModal: React.FC<AgentMonitorModalProps> = ({
  jobId,
  initialRun,
  onClose,
  onSuccess,
}) => {
  const [currentRun, setCurrentRun] = useState<AgentRun | null>(initialRun);
  const [humanInput, setHumanInput] = useState("");
  const [isSubmittingIntervention, setIsSubmittingIntervention] = useState(false);

  useEffect(() => {
    if (!currentRun?.id) return;

    // Connect to Server-Sent Events stream for real-time telemetry
    const eventSource = new EventSource(`/api/agent-runs/${currentRun.id}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const updatedRun = JSON.parse(event.data) as AgentRun;
        setCurrentRun(updatedRun);

        if (updatedRun.status === "succeeded") {
          onSuccess();
        }
      } catch {
        // Ignore parse error
      }
    };

    return () => {
      eventSource.close();
    };
  }, [currentRun?.id, onSuccess]);

  const handleResumeClick = async () => {
    if (!currentRun) return;
    setIsSubmittingIntervention(true);
    try {
      const res = await apiClient.resumeAgentRun(currentRun.id, humanInput);
      setCurrentRun(res.run);
      if (res.run.status === "succeeded") {
        onSuccess();
      }
    } finally {
      setIsSubmittingIntervention(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-2xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Agent Navigation &amp; Application Monitor
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">Run: {currentRun?.id || "Starting..."}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-950/60 rounded-lg border border-zinc-800">
            <span className="text-zinc-400">Current Execution Status:</span>
            <span
              className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-semibold uppercase ${
                currentRun?.status === "succeeded"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : currentRun?.status === "waiting_user"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              }`}
            >
              {currentRun?.status || "Initializing"}
            </span>
          </div>

          {/* Human in the Loop Intervention Box */}
          {currentRun?.status === "waiting_user" && (
            <div className="p-4 bg-amber-950/20 rounded-xl border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Agent is waiting for your input</span>
              </div>
              <p className="text-zinc-300 text-xs">
                {currentRun.intervention?.description ||
                  "A CAPTCHA, MFA prompt, or ambiguous form question was detected. Resolve the challenge in the browser window and proceed."}
              </p>

              <div className="space-y-2 pt-2">
                <input
                  type="text"
                  value={humanInput}
                  onChange={(e) => setHumanInput(e.target.value)}
                  placeholder="Optional verification note or input answer..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={handleResumeClick}
                  disabled={isSubmittingIntervention}
                  className="w-full py-2 rounded-lg font-medium text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-sm"
                >
                  {isSubmittingIntervention ? "Resuming Agent..." : "Resolved - Resume Application Agent"}
                </button>
              </div>
            </div>
          )}

          {/* Submission Verified Banner */}
          {currentRun?.status === "succeeded" && (
            <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Application Verified &amp; Confirmed</span>
              </div>
              <p className="text-zinc-300 text-xs font-mono">
                Proof: {currentRun.submissionProof}
              </p>
            </div>
          )}

          {/* Step Log Timeline */}
          <div>
            <h4 className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400 mb-2">
              Step Navigation Log ({currentRun?.events.length || 0})
            </h4>

            <div className="space-y-2">
              {currentRun?.events.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/80"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-zinc-400">Step {evt.stepIndex}</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                        {evt.actionType}
                      </span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{evt.details}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
