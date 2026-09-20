"use client";

import type { CandidateProfile } from "@resume-ai/types";
import { Check, FileText, Loader2, Sparkles, Upload, UserPlus, X } from "lucide-react";
import React, { useState } from "react";
import { apiClient } from "../../lib/apiClient.js";

export interface ImportCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (candidate: CandidateProfile) => void;
}

type ImportTab = "pdf" | "text" | "manual";

export function ImportCandidateModal({ isOpen, onClose, onSuccess }: ImportCandidateModalProps) {
  const [activeTab, setActiveTab] = useState<ImportTab>("pdf");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PDF / File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [makeActive, setMakeActive] = useState(true);

  // Text state
  const [pastedText, setPastedText] = useState("");

  // Manual state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleImportPdf = async () => {
    if (!selectedFile) {
      setError("Please select a file to import.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (selectedFile.name.endsWith(".pdf")) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = async () => {
          try {
            const base64Data = (reader.result as string).split(",")[1];
            const res = await apiClient.importCandidate({
              pdfBase64: base64Data,
              makeActive,
            });
            onSuccess(res.candidate);
            onClose();
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to parse PDF resume";
            setError(message);
          } finally {
            setIsLoading(false);
          }
        };
        reader.onerror = () => {
          setError("Failed to read file.");
          setIsLoading(false);
        };
      } else {
        // Text / LaTeX / Markdown file
        const text = await selectedFile.text();
        const res = await apiClient.importCandidate({
          text,
          makeActive,
        });
        onSuccess(res.candidate);
        onClose();
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to import resume file";
      setError(message);
      setIsLoading(false);
    }
  };

  const handleImportText = async () => {
    if (!pastedText.trim()) {
      setError("Please paste resume text to continue.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.importCandidate({
        text: pastedText.trim(),
        makeActive,
      });
      onSuccess(res.candidate);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to parse resume text";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError("Full Name and Email are required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsedSkills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const candidateData: Partial<CandidateProfile> & { makeActive?: boolean } = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || "+1-555-0100",
        location: location.trim() || "Remote",
        summary: summary.trim() || "Experienced software professional.",
        skills: {
          "Core Competencies": parsedSkills.length > 0 ? parsedSkills : ["Software Engineering", "Problem Solving"],
        },
        experiences: company.trim()
          ? [
              {
                company: company.trim(),
                location: location.trim() || "Remote",
                role: role.trim() || "Software Engineer",
                startDate: "Jan 2021",
                endDate: "Present",
                bulletPoints: [
                  "Delivered core product features and maintained high quality standards.",
                  "Collaborated with cross-functional team members to execute engineering deliverables.",
                ],
              },
            ]
          : [],
        education: degree.trim()
          ? [
              {
                degree: degree.trim(),
                institution: institution.trim() || "Accredited University",
                location: location.trim() || "Remote",
                startDate: "2016",
                endDate: "2020",
              },
            ]
          : [],
        makeActive,
      };

      const res = await apiClient.createCandidate(candidateData);
      onSuccess(res.candidate);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create candidate profile";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Import Candidate Profile</h2>
              <p className="text-xs text-zinc-400">
                Register a candidate career profile via PDF resume, plain text, or manual entry.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 pt-4 flex items-center gap-2 border-b border-zinc-800/50 pb-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab("pdf");
              setError(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "pdf"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF or File</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("text");
              setError(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "text"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Resume Text</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("manual");
              setError(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "manual"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Manual Form</span>
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Tab 1: Upload PDF / File */}
        {activeTab === "pdf" && (
          <div className="p-5 space-y-4">
            <div className="border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3 transition-colors bg-zinc-900/30">
              <Upload className="w-8 h-8 text-zinc-400" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  {selectedFile ? selectedFile.name : "Select a PDF, LaTeX (.tex), or text resume file"}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Supported formats: .pdf, .tex, .txt, .md (up to 10MB)
                </p>
              </div>
              <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-colors cursor-pointer">
                Browse Files
                <input
                  type="file"
                  accept=".pdf,.tex,.txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="makeActivePdf"
                checked={makeActive}
                onChange={(e) => setMakeActive(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="makeActivePdf" className="text-xs text-zinc-300 cursor-pointer">
                Set this candidate profile as active immediately
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportPdf}
                disabled={!selectedFile || isLoading}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Parsing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Import &amp; Parse Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Paste Resume Text */}
        {activeTab === "text" && (
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Paste Resume Text, Markdown, or LaTeX
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the full text of candidate resume here..."
                rows={10}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="makeActiveText"
                checked={makeActive}
                onChange={(e) => setMakeActive(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="makeActiveText" className="text-xs text-zinc-300 cursor-pointer">
                Set this candidate profile as active immediately
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportText}
                disabled={!pastedText.trim() || isLoading}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Profile...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Parse with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Manual Registration */}
        {activeTab === "manual" && (
          <form onSubmit={handleCreateManual} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1-555-0123"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA / Remote"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Professional Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="High-level career overview and expertise..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">
                Skills &amp; Technologies (comma separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. TypeScript, React, Python, Docker, Playwright, PostgreSQL"
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-zinc-800">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Most Recent Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Role / Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Degree</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.S. in Computer Science"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. University of California"
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="makeActiveManual"
                checked={makeActive}
                onChange={(e) => setMakeActive(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="makeActiveManual" className="text-xs text-zinc-300 cursor-pointer">
                Set this candidate profile as active immediately
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Candidate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
