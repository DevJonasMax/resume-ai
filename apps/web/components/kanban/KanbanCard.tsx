import type { Job } from "@resume-ai/types";
import { Bot, Building2, FileText, MapPin, Sparkles } from "lucide-react";
import { useKanban } from "./KanbanContext.js";

export interface KanbanCardProps {
  job: Job;
}

export function KanbanCard({ job }: KanbanCardProps) {
  const { onSelectJob, onAnalyzeJob, onOpenResume, onApplyJob } = useKanban();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", job.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelectJob(job)}
      className="glass-card rounded-lg p-3.5 flex flex-col gap-2.5 cursor-grab active:cursor-grabbing hover:border-zinc-500/50 group"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
          {job.title}
        </h4>
      </div>

      <div className="flex flex-col gap-1 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="truncate">{job.company}</span>
        </div>
        {job.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
      </div>

      {/* Action Footer depending on current stage */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
        {job.status === "discovered" && (
          <button
            type="button"
            onClick={() => onAnalyzeJob(job)}
            className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-950/40 hover:bg-blue-900/60 px-2.5 py-1 rounded border border-blue-800/40 transition-colors cursor-pointer w-full justify-center"
          >
            <Sparkles className="w-3 h-3" />
            <span>Analyze</span>
          </button>
        )}

        {job.status === "analyzed" && (
          <button
            type="button"
            onClick={() => onOpenResume(job)}
            className="flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 px-2.5 py-1 rounded border border-purple-800/40 transition-colors cursor-pointer w-full justify-center"
          >
            <FileText className="w-3 h-3" />
            <span>Tailor Resume</span>
          </button>
        )}

        {(job.status === "resume_ready" || job.status === "ready_to_apply") && (
          <button
            type="button"
            onClick={() => onApplyJob(job)}
            className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 px-2.5 py-1 rounded border border-amber-800/40 transition-colors cursor-pointer w-full justify-center"
          >
            <Bot className="w-3 h-3" />
            <span>Launch Agent</span>
          </button>
        )}

        {job.status === "applied" && (
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40 w-full text-center">
            ✓ Application Verified
          </span>
        )}

        {job.status === "applying" && (
          <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40 w-full text-center animate-pulse">
            Agent Navigating...
          </span>
        )}
      </div>
    </div>
  );
}
