"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  EyeIcon,
  FileCodeIcon,
  FilterIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
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
          <HugeiconsIcon icon={FileCodeIcon} size={16} className="text-[#d8b4fe]" />
          <span>ATS Tailoring Diff Inspector</span>
          <Badge variant="lavender" className="ml-1">
            {diffItems.length} modifications
          </Badge>
        </div>
      }
      description="Inspect verifiable LaTeX adjustments synthesized to maximize ATS scoring without candidate hallucination."
    >
      <div className="flex flex-col gap-4">
        {/* Section Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[rgba(255,255,255,0.06)]">
          <HugeiconsIcon icon={FilterIcon} size={14} className="text-zinc-500 mr-1 shrink-0" />
          <button
            type="button"
            onClick={() => setFilterSection("all")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              filterSection === "all"
                ? "bg-[#181b1f] text-white font-semibold border border-[rgba(255,255,255,0.08)]"
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
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                filterSection.toLowerCase() === sec.toLowerCase()
                  ? "bg-[#181b1f] text-white font-semibold border border-[rgba(255,255,255,0.08)]"
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
          <div className="p-8 text-center text-zinc-500 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#181b1f]/40 text-xs">
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
                      ? "border-[#d8b4fe]/60 bg-[#d8b4fe]/5 shadow-lg"
                      : "border-[rgba(255,255,255,0.07)] bg-[#181b1f]/50 hover:border-[rgba(255,255,255,0.12)]"
                  }`}
                >
                  {/* Diff Item Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="sky" className="uppercase font-mono text-[10px]">
                        {diff.section}
                      </Badge>
                      {diff.targetedRequirement && (
                        <span className="text-[11px] font-medium badge-lavender px-2 py-0.5 rounded">
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
                      <HugeiconsIcon icon={EyeIcon} size={12} className="mr-1" />
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
                  <div className="p-3 badge-sage rounded-lg text-xs leading-relaxed font-mono">
                    <span className="font-semibold block text-[10px] uppercase tracking-wider text-[#a7f3d0] mb-1 font-sans flex items-center gap-1.5">
                      <HugeiconsIcon icon={SparklesIcon} size={11} />
                      ATS Tailored LaTeX Output:
                    </span>
                    <p className="text-zinc-100">{diff.tailoredText}</p>
                  </div>

                  {/* Engineering Rationale */}
                  <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-start gap-2 text-xs">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-[#a7f3d0] shrink-0 mt-0.5" />
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
