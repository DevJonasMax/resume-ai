"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
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
    <div className="p-4 badge-apricot rounded-xl flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#2e1d13] border border-[#fdba74]/30 rounded-lg text-[#fdba74] shrink-0">
          <HugeiconsIcon icon={Alert02Icon} size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#fdba74]">
            Human Intervention Required
          </h4>
          <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
            {run.intervention.description || "Bot detection, CAPTCHA, or verification check encountered."}
          </p>
          <p className="text-xs text-[#fdba74] font-medium mt-1">
            Please solve the challenge directly in the visible browser window, then click Resume below.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#fdba74]/20">
        <input
          type="text"
          placeholder="Optional notes or confirmation code..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1 w-full bg-[#121417] border border-[#fdba74]/30 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#fdba74]"
        />

        <Button
          variant="apricot"
          size="sm"
          onClick={handleConfirm}
          disabled={isResuming}
          className="w-full sm:w-auto font-semibold gap-1.5"
        >
          <HugeiconsIcon icon={PlayIcon} size={14} />
          <span>{isResuming ? "Resuming..." : "I've Solved It: Resume Agent"}</span>
        </Button>
      </div>
    </div>
  );
}
