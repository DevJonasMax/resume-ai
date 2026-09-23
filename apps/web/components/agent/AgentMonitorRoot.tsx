"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { AiBrain01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { AgentMonitorProvider, type AgentMonitorProviderProps } from "./AgentMonitorContext.js";

export interface AgentMonitorRootProps extends AgentMonitorProviderProps {
  isOpen?: boolean;
  className?: string;
}

export function AgentMonitorRoot({
  children,
  isOpen = true,
  className = "",
  ...providerProps
}: AgentMonitorRootProps) {
  const { run, onClose } = providerProps;

  if (!isOpen) return null;

  return (
    <AgentMonitorProvider {...providerProps}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className={`prism-panel rounded-2xl w-full max-w-3xl flex flex-col max-h-[85vh] shadow-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4.5 border-b border-[rgba(255,255,255,0.06)] bg-[#181b1f]/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#142820] border border-[#a7f3d0]/30 text-[#a7f3d0]">
                <HugeiconsIcon icon={AiBrain01Icon} size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Browser Automation Session</span>
                  {run ? (
                    <span className="text-zinc-500 font-mono text-xs">({run.id})</span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-[#142820] text-[#a7f3d0] border border-[#a7f3d0]/30">
                      Standby
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {run
                    ? "Real-time Jev decision and agent-browser navigation"
                    : "No active application execution in progress"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1e2228] transition-colors cursor-pointer active:scale-95"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} />
            </button>
          </div>

          <div className="flex flex-col p-5 overflow-y-auto gap-4">
            {children}
          </div>
        </div>
      </div>
    </AgentMonitorProvider>
  );
}
