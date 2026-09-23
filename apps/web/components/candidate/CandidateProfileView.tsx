"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  Call02Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  Location01Icon,
  Mail01Icon,
  Mortarboard01Icon,
  PlusSignIcon,
  UserMultiple02Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import type { CandidateProfile } from "@resume-ai/types";
import { Button } from "@/components/ui/button";
import { apiClient } from "../../lib/apiClient.js";
import { ImportCandidateModal } from "../modals/ImportCandidateModal.js";
import { useI18n } from "../../lib/i18n/index.js";

export interface CandidateProfileViewProps {
  candidate: CandidateProfile | null;
  candidates?: CandidateProfile[];
  onSelectCandidate?: (candidate: CandidateProfile) => void;
  onRefresh?: () => Promise<void>;
}

export function CandidateProfileView({
  candidate,
  candidates = [],
  onSelectCandidate,
  onRefresh,
}: CandidateProfileViewProps) {
  const { t } = useI18n();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleActivate = async (id: string) => {
    setIsActivating(true);
    try {
      const res = await apiClient.activateCandidate(id);
      if (onSelectCandidate) {
        onSelectCandidate(res.candidate);
      }
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setIsActivating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("candidateProfileView.deleteConfirm"))) return;
    try {
      await apiClient.deleteCandidate(id);
      if (onRefresh) {
        await onRefresh();
      }
    } catch {
      // Error handling
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Candidate Profile Switcher Bar */}
      <div className="p-4 prism-panel rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#142820] border border-[#a7f3d0]/30 text-[#a7f3d0]">
            <HugeiconsIcon icon={UserMultiple02Icon} size={18} />
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              {t("candidateProfileView.activeProfiles", { count: candidates.length })}
            </span>
            <span className="text-[11px] text-zinc-400">
              {t("candidateProfileView.activeProfilesDesc")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {candidates.length > 1 && (
            <select
              value={candidate?.id || ""}
              onChange={(e) => handleActivate(e.target.value)}
              disabled={isActivating}
              className="bg-[#181b1f] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#93c5fd]/50 cursor-pointer disabled:opacity-50"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#181b1f]">
                  {c.fullName} {c.isActive ? `(${t("candidateProfileView.activeBadge")})` : ""}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="sky"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="gap-1.5 text-xs font-semibold active:scale-95"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} />
            <span>{t("candidateProfileView.importProfile")}</span>
          </Button>
        </div>
      </div>

      {!candidate ? (
        <div className="p-12 text-center text-zinc-500 prism-panel rounded-2xl flex flex-col items-center gap-3">
          <HugeiconsIcon icon={UserMultiple02Icon} size={32} className="text-zinc-600" />
          <p className="text-sm font-semibold text-zinc-300">
            {t("candidateProfileView.noProfiles")}
          </p>
          <Button
            variant="sky"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="mt-2 active:scale-95"
          >
            {t("candidateProfileView.importProfile")}
          </Button>
        </div>
      ) : (
        <>
          {/* Profile Banner */}
          <div className="p-6 prism-panel rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-white tracking-tight">{candidate.fullName}</h2>
                  <span className="badge-sage flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} />
                    Active Candidate Truth
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-2">
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Mail01Icon} size={13} className="text-[#a7f3d0]" />
                    {candidate.email}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Call02Icon} size={13} className="text-[#a7f3d0]" />
                    {candidate.phone}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Location01Icon} size={13} className="text-[#a7f3d0]" />
                    {candidate.location}
                  </span>
                </div>
              </div>

              {candidates.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDelete(candidate.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-[#181b1f] transition-colors cursor-pointer active:scale-95"
                  title="Delete Candidate Profile"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={16} />
                </button>
              )}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed pt-3 border-t border-[rgba(255,255,255,0.06)]">
              {candidate.summary}
            </p>
          </div>

          {/* Verified Skills */}
          <div className="p-6 prism-panel rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Wrench01Icon} size={15} className="text-[#93c5fd]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                {t("candidateProfileView.skills")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(candidate.skills).map(([category, items]) => (
                <div key={category} className="p-3.5 bg-[#181b1f] rounded-xl border border-[rgba(255,255,255,0.06)]">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    {category.replace(/_/g, " ")}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="px-2 py-0.5 rounded bg-[#121417] text-zinc-200 text-[11px] font-mono border border-[rgba(255,255,255,0.06)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Career Experience */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Briefcase01Icon} size={15} className="text-[#93c5fd]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                {t("candidateProfileView.experience")}
              </h3>
            </div>

            {candidate.experiences.map((exp, idx) => (
              <div key={idx} className="p-5 prism-card rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                  <div>
                    <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                    <p className="text-xs text-zinc-400">
                      {exp.company} • {exp.location}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 bg-[#121417] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.06)]">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>

                <ul className="list-disc list-inside space-y-1 text-xs text-zinc-300 leading-relaxed">
                  {exp.bulletPoints.map((bullet, bIdx) => (
                    <li key={bIdx} className="text-zinc-300">
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Education & Honors */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Mortarboard01Icon} size={15} className="text-[#d8b4fe]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                {t("candidateProfileView.education")}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidate.education.map((edu, idx) => (
                <div key={idx} className="p-4 prism-card rounded-xl space-y-1.5">
                  <h4 className="text-sm font-bold text-white">{edu.degree}</h4>
                  <p className="text-xs text-zinc-400">{edu.institution}</p>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1">
                    <span>{edu.location}</span>
                    <span>{edu.endDate || edu.startDate || "Graduated"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Import Candidate Modal */}
      <ImportCandidateModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(newCandidate) => {
          if (onSelectCandidate) {
            onSelectCandidate(newCandidate);
          }
          if (onRefresh) {
            onRefresh();
          }
        }}
      />
    </div>
  );
}
