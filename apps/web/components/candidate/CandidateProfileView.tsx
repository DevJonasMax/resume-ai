import type { CandidateProfile } from "@resume-ai/types";
import { Briefcase, GraduationCap, Mail, MapPin, Phone, ShieldCheck, Wrench } from "lucide-react";

export interface CandidateProfileViewProps {
  candidate: CandidateProfile | null;
}

export function CandidateProfileView({ candidate }: CandidateProfileViewProps) {
  if (!candidate) {
    return (
      <div className="p-12 text-center text-zinc-500">
        Loading candidate profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Banner */}
      <div className="p-6 glass-panel rounded-2xl border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">{candidate.fullName}</h2>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                <ShieldCheck className="w-3 h-3" />
                Verified Base Truth
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
              <span className="text-xs text-zinc-500 font-mono">
                {exp.startDate} to {exp.endDate}
              </span>
            </div>

            <ul className="space-y-1.5 list-disc list-inside text-xs text-zinc-300 leading-relaxed">
              {exp.bulletPoints.map((point, pIdx) => (
                <li key={pIdx} className="text-zinc-200">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="p-6 glass-panel rounded-2xl border border-zinc-800 space-y-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Education &amp; Credentials
          </h3>
        </div>

        {candidate.education.map((edu, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 py-1">
            <div>
              <p className="font-semibold text-zinc-100">{edu.degree}</p>
              <p className="text-zinc-400">{edu.institution} • {edu.location}</p>
            </div>
            <span className="text-zinc-500 font-mono">{edu.endDate || edu.startDate || "Completed"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
