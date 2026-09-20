"use client";

import type { CandidateProfile } from "@resume-ai/types";
import {
  Briefcase,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { apiClient } from "../../lib/apiClient.js";
import { ImportCandidateModal } from "../modals/ImportCandidateModal.js";

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
    if (!confirm("Are you sure you want to delete this candidate profile?")) return;
    try {
      await apiClient.deleteCandidate(id);
      if (onRefresh) {
        await onRefresh();
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Candidate Profile Switcher Bar */}
      <div className="p-4 glass-panel rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Active Candidate Profiles ({candidates.length})
            </span>
            <span className="text-[11px] text-zinc-400">
              Select or import candidate profiles used to tailor ATS resumes
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {candidates.length > 1 && (
            <select
              value={candidate?.id || ""}
              onChange={(e) => handleActivate(e.target.value)}
              disabled={isActivating}
              className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} {c.isActive ? "(Active)" : ""}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Import / Add Profile</span>
          </button>
        </div>
      </div>

      {!candidate ? (
        <div className="p-12 text-center text-zinc-500 glass-panel rounded-2xl border border-zinc-800 flex flex-col items-center gap-3">
          <Users className="w-8 h-8 text-zinc-600" />
          <p className="text-sm font-semibold text-zinc-300">No Candidate Profiles Found</p>
          <p className="text-xs text-zinc-500 max-w-sm">
            Import a candidate resume from PDF, text, or enter details manually to get started.
          </p>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Import First Profile
          </button>
        </div>
      ) : (
        <>
          {/* Profile Banner */}
          <div className="p-6 glass-panel rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-white tracking-tight">{candidate.fullName}</h2>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                    <ShieldCheck className="w-3 h-3" />
                    Active Candidate Truth
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-2">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    {candidate.email}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    {candidate.phone}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {candidate.location}
                  </span>
                </div>
              </div>

              {candidates.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDelete(candidate.id)}
                  className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  title="Delete Candidate Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed pt-3 border-t border-zinc-800">
              {candidate.summary}
            </p>
          </div>

          {/* Verified Skills */}
          <div className="p-6 glass-panel rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Skills &amp; Tooling Inventory
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(candidate.skills).map(([category, items]) => (
                <div key={category} className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    {category.replace(/_/g, " ")}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item) => (
                      <span
                        key={item}
                        className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[11px] font-mono border border-zinc-700/60"
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
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Career Experience
              </h3>
            </div>

            {candidate.experiences.map((exp, idx) => (
              <div key={idx} className="p-5 glass-card rounded-xl border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                  <div>
                    <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                    <p className="text-xs text-zinc-400">
                      {exp.company} • {exp.location}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
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
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Education &amp; Qualifications
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidate.education.map((edu, idx) => (
                <div key={idx} className="p-4 glass-card rounded-xl border border-zinc-800 space-y-1.5">
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
