import type { Job, JobStatus } from "@resume-ai/types";
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  MapPin,
  Sparkles,
} from "lucide-react";
import React from "react";

interface KanbanBoardProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onOpenResumeEditor: (jobId: string) => void;
  onOpenAgentRun: (jobId: string) => void;
  onStatusChange: (jobId: string, status: JobStatus) => void;
}

const COLUMNS: { id: JobStatus; title: string; color: string }[] = [
  { id: "discovered", title: "Discovered", color: "border-zinc-700 text-zinc-300" },
  { id: "analyzed", title: "Analyzed", color: "border-blue-500/50 text-blue-400" },
  { id: "resume_ready", title: "Resume Ready", color: "border-indigo-500/50 text-indigo-400" },
  { id: "ready_to_apply", title: "Ready to Apply", color: "border-amber-500/50 text-amber-400" },
  { id: "applying", title: "Applying", color: "border-purple-500/50 text-purple-400" },
  { id: "applied", title: "Applied", color: "border-emerald-500/50 text-emerald-400" },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  jobs,
  onSelectJob,
  onOpenResumeEditor,
  onOpenAgentRun,
  onStatusChange,
}) => {
  return (
    <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start">
      {COLUMNS.map((col) => {
        const columnJobs = jobs.filter((j) => j.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col w-80 shrink-0 bg-zinc-900/40 rounded-xl border border-zinc-800/80 p-3 max-h-[calc(100vh-140px)]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-1.5 mb-2 border-b border-zinc-800/60">
              <span className={`text-xs font-semibold uppercase tracking-wider ${col.color}`}>
                {col.title}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                {columnJobs.length}
              </span>
            </div>

            {/* Cards Container */}
            <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
              {columnJobs.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-600 border border-dashed border-zinc-800/60 rounded-lg">
                  No jobs in this stage
                </div>
              ) : (
                columnJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="group relative bg-zinc-900/80 hover:bg-zinc-850 p-3.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 line-clamp-1">
                        {job.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-zinc-500" />
                        {job.company}
                      </span>
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-500" />
                          {job.location}
                        </span>
                      )}
                    </div>

                    {/* Action Triggers */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                      {col.id === "discovered" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectJob(job);
                          }}
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                        >
                          <Sparkles className="w-3 h-3" />
                          Analyze Requirements
                        </button>
                      )}

                      {(col.id === "analyzed" || col.id === "resume_ready") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenResumeEditor(job.id);
                          }}
                          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          <FileText className="w-3 h-3" />
                          {col.id === "resume_ready" ? "View / Edit Resume" : "Tailor Resume"}
                        </button>
                      )}

                      {(col.id === "resume_ready" || col.id === "ready_to_apply") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAgentRun(job.id);
                          }}
                          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                        >
                          <Bot className="w-3 h-3" />
                          Apply with Agent
                        </button>
                      )}

                      {col.id === "applied" && (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Application Verified
                        </span>
                      )}

                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 ml-auto" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
