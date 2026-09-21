"use client";

import { CheckCircle2, Eye, FileDiff, Filter, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { useResumeStudio } from "./ResumeStudioContext";

export function ResumeStudioDiffDrawer() {
  const {
    resume,
    isDiffDrawerOpen,
    closeDiffDrawer,
    activeDiffKey,
    setActiveDiffKey,
    filterSection,
    setFilterSection,
  } = useResumeStudio();

  const diffItems = resume.diffItems || [];

  // Extract unique sections for filter tabs
  const sections = Array.from(
    new Set(diffItems.map((item) => item.section || "general"))
  );

  const filteredDiffs = diffItems.filter((item) => {
    if (filterSection === "all") return true;
    return item.section?.toLowerCase() === filterSection.toLowerCase();
  });

  return (
    <Drawer
      isOpen={isDiffDrawerOpen}
      onClose={closeDiffDrawer}
      widthClass="max-w-2xl"
      title={
        <div className="flex items-center gap-2">
          <FileDiff className="w-4 h-4 text-purple-400" />
          <span>ATS Tailoring Diff Inspector</span>
          <Badge variant="purple" className="ml-1">
            {diffItems.length} modifications
          </Badge>
        </div>
      }
      description="Inspect verifiable LaTeX adjustments synthesized to maximize ATS scoring without candidate hallucination."
    >
      <div className="flex flex-col gap-4">
        {/* Section Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-zinc-800">
          <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1 shrink-0" />
          <button
            type="button"
            onClick={() => setFilterSection("all")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              filterSection === "all"
                ? "bg-zinc-800 text-white font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All Sections ({diffItems.length})
          </button>
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setFilterSection(sec)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                filterSection.toLowerCase() === sec.toLowerCase()
                  ? "bg-zinc-800 text-white font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {sec} (
              {diffItems.filter((d) => d.section?.toLowerCase() === sec.toLowerCase()).length}
              )
            </button>
          ))}
        </div>

        {/* Diff Cards List */}
        {filteredDiffs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 rounded-xl border border-zinc-800 bg-zinc-900/30 text-xs">
            No modifications recorded for this section filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDiffs.map((diff, index) => {
              const diffKey = `${diff.section}-${index}`;
              const isSelected = activeDiffKey === diffKey;

              return (
                <div
                  key={diffKey}
                  className={`rounded-xl p-4 border transition-all duration-200 flex flex-col gap-3 ${
                    isSelected
                      ? "border-purple-500/80 bg-purple-950/20 shadow-lg shadow-purple-950/20"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                  }`}
                >
                  {/* Diff Item Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="indigo" className="uppercase font-mono text-[10px]">
                        {diff.section}
                      </Badge>
                      {diff.targetedRequirement && (
                        <span className="text-[11px] font-medium text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                          Target: {diff.targetedRequirement}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActiveDiffKey(isSelected ? null : diffKey);
                      }}
                      className="h-6 px-2 text-[11px] text-zinc-400 hover:text-white"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      <span>{isSelected ? "Clear Highlight" : "Highlight in Preview"}</span>
                    </Button>
                  </div>

                  {/* Original Content */}
                  {diff.originalText && (
                    <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-xs text-red-300/90 leading-relaxed font-mono">
                      <span className="font-semibold block text-[10px] uppercase tracking-wider text-red-400 mb-1 font-sans">
                        Original Raw Text:
                      </span>
                      <p className="line-through opacity-80">{diff.originalText}</p>
                    </div>
                  )}

                  {/* Tailored Content */}
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-xs text-emerald-200 leading-relaxed font-mono">
                    <span className="font-semibold block text-[10px] uppercase tracking-wider text-emerald-400 mb-1 font-sans flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      ATS Tailored LaTeX Output:
                    </span>
                    <p>{diff.tailoredText}</p>
                  </div>

                  {/* Engineering Rationale */}
                  <div className="pt-2 border-t border-zinc-800 flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-200">
                        Engineering Rationale:
                      </span>
                      <p className="text-zinc-400 mt-0.5 leading-relaxed">
                        {diff.rationalization}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}
