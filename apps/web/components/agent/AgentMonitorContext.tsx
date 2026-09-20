"use client";

import type { AgentRun } from "@resume-ai/types";
import React, { createContext, useContext, useMemo, useState } from "react";

export interface AgentMonitorContextValue {
  run: AgentRun | null;
  isRunning: boolean;
  isResuming: boolean;
  onClose: () => void;
  onResume: (userInput?: string) => Promise<void>;
}

const AgentMonitorContext = createContext<AgentMonitorContextValue | null>(null);

export interface AgentMonitorProviderProps {
  children: React.ReactNode;
  run: AgentRun | null;
  isRunning: boolean;
  onClose: () => void;
  onResume: (userInput?: string) => Promise<void>;
}

export function AgentMonitorProvider({
  children,
  run,
  isRunning,
  onClose,
  onResume,
}: AgentMonitorProviderProps) {
  const [isResuming, setIsResuming] = useState(false);

  const handleResume = async (userInput?: string) => {
    setIsResuming(true);
    try {
      await onResume(userInput);
    } finally {
      setIsResuming(false);
    }
  };

  const value = useMemo<AgentMonitorContextValue>(
    () => ({
      run,
      isRunning,
      isResuming,
      onClose,
      onResume: handleResume,
    }),
    [run, isRunning, isResuming, onClose, handleResume]
  );

  return (
    <AgentMonitorContext.Provider value={value}>
      {children}
    </AgentMonitorContext.Provider>
  );
}

export function useAgentMonitor(): AgentMonitorContextValue {
  const context = useContext(AgentMonitorContext);
  if (!context) {
    throw new Error("useAgentMonitor must be used within an AgentMonitorProvider");
  }
  return context;
}
