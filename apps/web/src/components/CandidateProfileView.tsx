import type { CandidateProfile } from "@resume-ai/types";
import { Award, Briefcase, GraduationCap, Mail, MapPin, Phone, ShieldCheck, Wrench } from "lucide-react";
import React from "react";

interface CandidateProfileViewProps {
  candidate: CandidateProfile | null;
}

export const CandidateProfileView: React.FC<CandidateProfileViewProps> = ({ candidate }) => {
  if (!candidate) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Loading candidate profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Banner */}
      <div className="p-6 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-zinc-100">{candidate.fullName}</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                <ShieldCheck className="w-3 h-3" />
                Verified Base Truth
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mt-2">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                {candidate.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                {candidate.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                {candidate.location}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed font-sans pt-2 border-t border-zinc-800/80">
          {candidate.summary}
        </p>
      </div>

      {/* Verified Skills */}
      <div className="p-6 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
            Skills &amp; Tooling Inventory
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(candidate.skills).map(([cat, list]) => (
            <div key={cat} className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/60">
              <h4 className="text-[11px] font-semibold text-zinc-400 mb-2">{cat}</h4>
              <div className="flex flex-wrap gap-1.5">
                {list.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Experience History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
            Career Experience
          </h3>
        </div>

        {candidate.experiences.map((exp, idx) => (
          <div key={idx} className="p-5 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">{exp.role}</h4>
                <p className="text-xs text-zinc-400">
                  {exp.company} &middot; {exp.location}
                </p>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                {exp.startDate} &mdash; {exp.endDate}
              </span>
            </div>

            <ul className="space-y-1.5 list-disc list-inside text-xs text-zinc-300">
              {exp.bulletPoints.map((point, pIdx) => (
                <li key={pIdx} className="leading-relaxed">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="p-6 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Education</h3>
        </div>

        {candidate.education.map((edu, idx) => (
          <div key={idx} className="flex items-start justify-between text-xs">
            <div>
              <p className="font-semibold text-zinc-200">{edu.degree}</p>
              <p className="text-zinc-400">
                {edu.institution} &middot; {edu.location}
              </p>
            </div>
            <span className="text-zinc-500 font-mono">
              {edu.startDate} &mdash; {edu.endDate}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
