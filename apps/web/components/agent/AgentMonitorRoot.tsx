"use client";

import { Bot, X } from "lucide-react";
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

  if (!isOpen || !run) return null;

  return (
    <AgentMonitorProvider {...providerProps}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className={`glass-panel rounded-2xl w-full max-w-3xl flex flex-col max-h-[85vh] border border-zinc-700 shadow-2xl overflow-hidden ${className}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4.5 border-b border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Browser Automation Session</span>
                  <span className="text-zinc-500 font-normal">({run.id})</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Real-time Jev decision and agent-browser navigation
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
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
