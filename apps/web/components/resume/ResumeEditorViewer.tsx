"use client";

import { Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { useResumeEditor } from "./ResumeEditorContext.js";

export function ResumeEditorViewer() {
  const { resume, candidate } = useResumeEditor();

  if (!candidate) {
    return (
      <div className="p-8 text-center text-zinc-400">
        Loading candidate profile...
      </div>
    );
  }

  return (
    <div
      id="resume-document-sheet"
      className="bg-zinc-900 border border-zinc-700/60 rounded-xl p-8 max-w-4xl mx-auto shadow-2xl text-zinc-100 flex flex-col gap-6 font-sans print:bg-white print:text-zinc-900 print:border-none print:shadow-none print:max-w-none print:p-0"
    >
      {/* Header matching resume-example-01.tex */}
      <div className="flex flex-col items-center text-center pb-6 border-b border-zinc-700/80">
        <h1 className="text-2xl font-bold tracking-tight text-white uppercase mb-2">
          {candidate.fullName}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-indigo-400" />
            {candidate.phone}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            {candidate.email}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            {candidate.location}
          </span>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wider uppercase text-indigo-400 border-b border-indigo-500/30 pb-1 w-full">
            Professional Summary
          </h2>
        </div>
        <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-lg relative">
          <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-700/50">
            <Sparkles className="w-2.5 h-2.5" />
            Tailored for ATS
          </span>
          <p className="text-sm text-zinc-200 leading-relaxed pt-3 sm:pt-0">
            {resume.tailoredSummary}
          </p>
        </div>
      </div>

      {/* Core Competencies / Technical Skills */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold tracking-wider uppercase text-indigo-400 border-b border-indigo-500/30 pb-1 w-full">
          Core Competencies & Technical Skills
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {Object.entries(candidate.skills).map(([category, items]) => (
            <div key={category} className="p-3 bg-zinc-800/40 rounded-lg border border-zinc-700/40 flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                {category.replace(/_/g, " ")}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {items.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-200 rounded border border-zinc-700 font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Experience */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-bold tracking-wider uppercase text-indigo-400 border-b border-indigo-500/30 pb-1 w-full">
          Professional Experience
        </h2>

        {resume.tailoredExperience.map((exp, idx) => (
          <div key={`${exp.company}-${idx}`} className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{exp.role}</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-indigo-300 font-medium">{exp.company}</span>
                </h3>
              </div>
              <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                <span>{exp.location}</span>
                <span className="text-zinc-600">|</span>
                <span>{exp.startDate} - {exp.endDate}</span>
              </div>
            </div>

            <ul className="list-disc list-inside space-y-1.5 text-xs text-zinc-300 pl-1 leading-relaxed">
              {exp.bulletPoints.map((bullet, bIdx) => (
                <li key={bIdx} className="text-zinc-200 pl-1">
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Education & Certifications */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold tracking-wider uppercase text-indigo-400 border-b border-indigo-500/30 pb-1 w-full">
          Education & Honors
        </h2>
        <div className="space-y-2 pt-1">
          {candidate.education.map((edu, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-300">
              <span className="font-semibold text-zinc-100">{edu.degree} - {edu.institution}</span>
              <span className="font-mono text-zinc-400">{edu.endDate || edu.startDate || "Completed"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
