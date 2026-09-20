"use client";

import React from "react";

export interface KanbanBoardProps {
  children: React.ReactNode;
  className?: string;
}

export function KanbanBoard({ children, className = "" }: KanbanBoardProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pb-6 overflow-x-auto min-h-[600px] ${className}`}
    >
      {children}
    </div>
  );
}
