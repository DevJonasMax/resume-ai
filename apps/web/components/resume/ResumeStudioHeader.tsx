"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  Building02Icon,
  Download01Icon,
  EyeIcon,
  FileCodeIcon,
  FileDownloadIcon,
  FilterIcon,
  Layout01Icon,
  ReloadIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/index.js";
import { useResumeStudio } from "./ResumeStudioContext";

export function ResumeStudioHeader() {
  const { t } = useI18n();
  const {
    job,
    resume,
    candidate,
    allJobs,
    allCandidates,
    onSelectJob,
    onSelectCandidate,
    splitMode,
    setSplitMode,
    isRegenerating,
    regenerateResume,
    openDiffDrawer,
    openChatDrawer,
    exportPdf,
    isExportingPdf,
    downloadTex,
  } = useResumeStudio();

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const found = allJobs.find((j) => j.id === selectedId);
    if (found && onSelectJob) {
      onSelectJob(found);
    }
  };

  const handleCandidateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const found = allCandidates.find((c) => c.id === selectedId);
    if (found && onSelectCandidate) {
      onSelectCandidate(found);
    }
  };

  return (
    <header className="flex flex-col gap-3 p-4 bg-[#121417] border border-[rgba(255,255,255,0.07)] rounded-xl shadow-sm">
      {/* Top row: In-studio Job & Candidate Selectors + Meta info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[rgba(255,255,255,0.06)]">
        {/* Selectors Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Job Selector Dropdown */}
          <div className="flex items-center gap-2 bg-[#181b1f] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)]">
            <HugeiconsIcon icon={Building02Icon} size={15} className="text-[#93c5fd]" />
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
                {t("resumeStudio.opportunity")}
              </span>
              <select
                value={job.id}
                onChange={handleJobChange}
                className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer pr-4 appearance-none"
              >
                {allJobs.map((j) => (
                  <option key={j.id} value={j.id} className="bg-[#181b1f] text-zinc-200">
                    {j.company} : {j.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Candidate Selector Dropdown */}
          <div className="flex items-center gap-2 bg-[#181b1f] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)]">
            <HugeiconsIcon icon={UserAccountIcon} size={15} className="text-[#a7f3d0]" />
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">
                {t("resumeStudio.candidateProfile")}
              </span>
              <select
                value={candidate?.id || ""}
                onChange={handleCandidateChange}
                className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer pr-4 appearance-none"
              >
                {allCandidates.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#181b1f] text-zinc-200">
                    {c.fullName} ({c.location})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Version and Status badges */}
          <div className="flex items-center gap-2">
            <Badge variant="lavender" className="text-[10px] font-mono">
              v{resume.versionNumber}
            </Badge>
            <Badge variant="sage" className="text-[10px] uppercase font-mono">
              {job.status.replace("_", " ")}
            </Badge>
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
              {t("resumeStudio.alignedModifications", {
                count: resume.diffItems?.length ?? 0,
              })}
            </span>
          </div>
        </div>

        {/* Studio quick triggers */}
        <div className="flex items-center gap-2">
          {/* ATS Diffs Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={openDiffDrawer}
            className="gap-1.5 text-xs text-zinc-300 hover:text-white"
          >
            <HugeiconsIcon icon={FilterIcon} size={13} className="text-[#d8b4fe]" />
            <span>{t("resumeStudio.atsDiffs")}</span>
            <span className="badge-lavender px-1.5 py-0 rounded text-[10px] font-mono">
              {resume.diffItems?.length ?? 0}
            </span>
          </Button>

          {/* AI Dialogue Chat Trigger */}
          <Button
            variant="lavender"
            size="sm"
            onClick={openChatDrawer}
            className="gap-1.5 text-xs font-semibold"
          >
            <HugeiconsIcon icon={AiBrain01Icon} size={14} />
            <span>{t("resumeStudio.agentDialogue")}</span>
          </Button>
        </div>
      </div>

      {/* Bottom row: Workspace Layout switcher and Document Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Layout switcher: 50/50 Split, Code, Preview */}
        <div className="flex items-center bg-[#181b1f] border border-[rgba(255,255,255,0.07)] rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setSplitMode("latex")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
              splitMode === "latex"
                ? "bg-[#20242a] text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title={t("resumeStudio.codeOnlyTitle")}
          >
            <HugeiconsIcon icon={FileCodeIcon} size={13} />
            <span>{t("resumeStudio.codeOnly")}</span>
          </button>

          <button
            type="button"
            onClick={() => setSplitMode("split")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
              splitMode === "split"
                ? "bg-[#20242a] text-[#a7f3d0] font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title={t("resumeStudio.splitViewTitle")}
          >
            <HugeiconsIcon icon={Layout01Icon} size={13} className="text-[#a7f3d0]" />
            <span>{t("resumeStudio.splitView")}</span>
          </button>

          <button
            type="button"
            onClick={() => setSplitMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
              splitMode === "preview"
                ? "bg-[#20242a] text-white font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title={t("resumeStudio.previewOnlyTitle")}
          >
            <HugeiconsIcon icon={EyeIcon} size={13} />
            <span>{t("resumeStudio.previewOnly")}</span>
          </button>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {/* Regenerate Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={regenerateResume}
            disabled={isRegenerating}
            className="gap-1.5 text-xs"
            title={t("resumeStudio.regenerateTitle")}
          >
            <HugeiconsIcon
              icon={ReloadIcon}
              size={13}
              className={isRegenerating ? "animate-spin text-zinc-400" : "text-zinc-300"}
            />
            <span className="hidden sm:inline">{t("resumeStudio.regenerate")}</span>
          </Button>

          {/* Download Tex Source */}
          <Button
            variant="secondary"
            size="icon"
            onClick={downloadTex}
            title={t("resumeStudio.downloadTexTitle")}
          >
            <HugeiconsIcon icon={FileDownloadIcon} size={14} className="text-zinc-300" />
          </Button>

          {/* Export PDF Button */}
          <Button
            variant="sage"
            size="sm"
            onClick={exportPdf}
            disabled={isExportingPdf}
            className="gap-1.5 text-xs font-semibold"
          >
            <HugeiconsIcon
              icon={Download01Icon}
              size={14}
              className={isExportingPdf ? "animate-bounce" : ""}
            />
            <span>
              {isExportingPdf
                ? t("resumeStudio.exportingPdf")
                : t("resumeStudio.downloadPdf")}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
