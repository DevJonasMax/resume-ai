import type { CandidateProfile } from "@resume-ai/types";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  NoteEditIcon,
  ReloadIcon,
  SparklesIcon,
  Upload01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import React, { useState } from "react";
import { apiClient } from "../../lib/apiClient.js";
import { useI18n } from "../../lib/i18n/index.js";

export interface ImportCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (candidate: CandidateProfile) => void;
}

type ImportTab = "pdf" | "text" | "manual";

export function ImportCandidateModal({ isOpen, onClose, onSuccess }: ImportCandidateModalProps) {
  const { t } = useI18n();

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
      setError(t("importCandidateModal.selectFileError"));
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
            const message = err instanceof Error ? err.message : t("importCandidateModal.parsePdfError");
            setError(message);
          } finally {
            setIsLoading(false);
          }
        };
        reader.onerror = () => {
          setError(t("importCandidateModal.readFileError"));
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
      const message = err instanceof Error ? err.message : t("importCandidateModal.importFileError");
      setError(message);
      setIsLoading(false);
    }
  };

  const handleImportText = async () => {
    if (!pastedText.trim()) {
      setError(t("importCandidateModal.pasteTextError"));
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
      const message = err instanceof Error ? err.message : t("importCandidateModal.parseTextError");
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError(t("importCandidateModal.nameEmailError"));
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
      const message = err instanceof Error ? err.message : t("importCandidateModal.createProfileError");
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
              <HugeiconsIcon icon={UserAdd01Icon} size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {t("importCandidateModal.title")}
              </h2>
              <p className="text-xs text-zinc-400">
                {t("importCandidateModal.subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer active:scale-95"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
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
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
              activeTab === "pdf"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <HugeiconsIcon icon={Upload01Icon} size={14} />
            <span>{t("importCandidateModal.tabPdf")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("text");
              setError(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
              activeTab === "text"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <HugeiconsIcon icon={NoteEditIcon} size={14} />
            <span>{t("importCandidateModal.tabText")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("manual");
              setError(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
              activeTab === "manual"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <HugeiconsIcon icon={UserAdd01Icon} size={14} />
            <span>{t("importCandidateModal.tabManual")}</span>
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
              <HugeiconsIcon icon={Upload01Icon} size={32} className="text-zinc-500" />
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  {selectedFile ? selectedFile.name : t("importCandidateModal.dropzoneTitle")}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {t("importCandidateModal.dropzoneFormats")}
                </p>
              </div>
              <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95 cursor-pointer">
                {t("importCandidateModal.browseFiles")}
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
                {t("importCandidateModal.setActiveLabel")}
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95"
              >
                {t("importCandidateModal.cancel")}
              </button>
              <button
                type="button"
                onClick={handleImportPdf}
                disabled={!selectedFile || isLoading}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <HugeiconsIcon icon={ReloadIcon} size={14} className="animate-spin" />
                    <span>{t("importCandidateModal.parsingWithAi")}</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={SparklesIcon} size={14} />
                    <span>{t("importCandidateModal.importAndParse")}</span>
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
                {t("importCandidateModal.pasteTextLabel")}
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={t("importCandidateModal.pasteTextPlaceholder")}
                rows={10}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 font-mono leading-relaxed focus:outline-none focus:border-indigo-500 transition-colors"
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
                {t("importCandidateModal.setActiveLabel")}
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95"
              >
                {t("importCandidateModal.cancel")}
              </button>
              <button
                type="button"
                onClick={handleImportText}
                disabled={!pastedText.trim() || isLoading}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <HugeiconsIcon icon={ReloadIcon} size={14} className="animate-spin" />
                    <span>{t("importCandidateModal.extractingProfile")}</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={SparklesIcon} size={14} />
                    <span>{t("importCandidateModal.parseWithAi")}</span>
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
                <label className="text-xs font-semibold text-zinc-300">
                  {t("importCandidateModal.fullName")}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("importCandidateModal.fullNamePlaceholder")}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  {t("importCandidateModal.email")}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("importCandidateModal.emailPlaceholder")}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  {t("importCandidateModal.phone")}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("importCandidateModal.phonePlaceholder")}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  {t("importCandidateModal.location")}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("importCandidateModal.locationPlaceholder")}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">
                {t("importCandidateModal.summary")}
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={t("importCandidateModal.summaryPlaceholder")}
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">
                {t("importCandidateModal.skills")}
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder={t("importCandidateModal.skillsPlaceholder")}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-zinc-800">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  {t("importCandidateModal.recentCompany")}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t("importCandidateModal.recentCompanyPlaceholder")}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  {t("importCandidateModal.recentRole")}
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder={t("importCandidateModal.recentRolePlaceholder")}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  {t("importCandidateModal.degree")}
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder={t("importCandidateModal.degreePlaceholder")}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">
                  {t("importCandidateModal.institution")}
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder={t("importCandidateModal.institutionPlaceholder")}
                  className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
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
                {t("importCandidateModal.setActiveLabel")}
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer active:scale-95"
              >
                {t("importCandidateModal.cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <HugeiconsIcon icon={ReloadIcon} size={14} className="animate-spin" />
                    <span>{t("importCandidateModal.saving")}</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                    <span>{t("importCandidateModal.saveCandidate")}</span>
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
