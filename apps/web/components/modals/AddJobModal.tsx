import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  GlobeIcon,
  Link01Icon,
  Linkedin01Icon,
  Loading03Icon,
  PlusSignIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient.js";
import { useI18n } from "@/lib/i18n/index.js";
import {
  detectJobPlatform,
  SUPPORTED_PLATFORMS_LIST,
} from "@/lib/platformDetector.js";
import type { JobPlatformId, JobPlatformInfo } from "@resume-ai/types";

export interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    company: string;
    description: string;
    url?: string;
    location?: string;
  }) => Promise<void>;
}

/**
 * Returns an icon component or badge representation for a platform.
 */
function PlatformIcon({ platformId }: { platformId: JobPlatformId }) {
  if (platformId === "linkedin") {
    return <HugeiconsIcon icon={Linkedin01Icon} size={13} />;
  }
  return <HugeiconsIcon icon={GlobeIcon} size={13} />;
}

export function AddJobModal({ isOpen, onClose, onSubmit }: AddJobModalProps) {
  const { t } = useI18n();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("Remote");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [autofillMessage, setAutofillMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const detectedPlatform: JobPlatformInfo = detectJobPlatform(url);
  const isKnownPlatform = detectedPlatform.id !== "generic";

  const handleAutofill = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    setIsAutofilling(true);
    setAutofillMessage(null);

    try {
      const response = await apiClient.extractJobFromUrl(trimmedUrl);
      if (response?.extracted) {
        const { title: extTitle, company: extCompany, description: extDesc, location: extLoc } =
          response.extracted;

        if (extTitle) setTitle(extTitle);
        if (extCompany) setCompany(extCompany);
        if (extDesc) setDescription(extDesc);
        if (extLoc) setLocation(extLoc);

        setAutofillMessage({
          type: "success",
          text: t("addJobModal.autofillSuccess"),
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("addJobModal.autofillFailed");
      setAutofillMessage({
        type: "error",
        text: message,
      });
    } finally {
      setIsAutofilling(false);
    }
  };

  const handleSelectPlatformPill = (platform: JobPlatformInfo) => {
    if (!url) {
      setUrl(platform.sampleUrlPattern);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !description) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        company: company.trim(),
        description: description.trim(),
        url: url.trim() || undefined,
        location: location.trim() || undefined,
      });
      setTitle("");
      setCompany("");
      setDescription("");
      setUrl("");
      setAutofillMessage(null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="prism-panel rounded-2xl w-full max-w-2xl flex flex-col max-h-[92vh] shadow-2xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.06)] bg-[#181b1f]/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#142233] text-[#93c5fd] border border-[#93c5fd]/30 shadow-sm">
              <HugeiconsIcon icon={PlusSignIcon} size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t("addJobModal.title")}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {t("addJobModal.subtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1e2228] transition-colors cursor-pointer active:scale-95"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-4 overflow-y-auto">
          {/* Application URL with real-time detection & Autofill Action */}
          <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#14161a] border border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <HugeiconsIcon icon={Link01Icon} size={13} className="text-[#93c5fd]" />
                <span>{t("addJobModal.applicationUrl")}</span>
              </label>

              {/* Dynamic Platform Detected Badge */}
              {isKnownPlatform && (
                <div
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white animate-in fade-in duration-200"
                  style={{
                    backgroundColor: `${detectedPlatform.badgeColor}22`,
                    borderColor: `${detectedPlatform.badgeColor}66`,
                    borderWidth: "1px",
                    color: detectedPlatform.badgeColor,
                  }}
                >
                  <PlatformIcon platformId={detectedPlatform.id} />
                  <span>{detectedPlatform.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input
                type="url"
                placeholder={t("addJobModal.applicationUrlPlaceholder")}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (autofillMessage) setAutofillMessage(null);
                }}
                className="flex-1 px-3.5 py-2 bg-[#181b1f] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#93c5fd]/60 transition-colors"
              />

              <Button
                type="button"
                variant="sky"
                size="sm"
                onClick={handleAutofill}
                disabled={!url.trim() || isAutofilling}
                className="shrink-0 font-semibold active:scale-95 gap-1.5"
                title={t("addJobModal.autofillFromLink")}
              >
                {isAutofilling ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={13} className="animate-spin text-[#93c5fd]" />
                    <span>{t("addJobModal.autofilling")}</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={SparklesIcon} size={13} className="text-[#93c5fd]" />
                    <span>{t("addJobModal.autofillFromLink")}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Autofill Feedback Message */}
            {autofillMessage && (
              <div
                className={`mt-2 flex items-center gap-2 p-2 rounded-lg text-[11px] animate-in fade-in duration-150 ${
                  autofillMessage.type === "success"
                    ? "bg-[#142820] text-[#a7f3d0] border border-[#a7f3d0]/30"
                    : "bg-red-950/40 text-rose-300 border border-red-800/40"
                }`}
              >
                <HugeiconsIcon
                  icon={autofillMessage.type === "success" ? CheckmarkCircle02Icon : Alert02Icon}
                  size={14}
                  className="shrink-0"
                />
                <span className="flex-1">{autofillMessage.text}</span>
              </div>
            )}
          </div>

          {/* Supported Platforms Section */}
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#121417] border border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                {t("addJobModal.supportedPlatforms")}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">10 Platforms</span>
            </div>
            <p className="text-[11px] text-zinc-500">
              {t("addJobModal.supportedPlatformsHint")}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUPPORTED_PLATFORMS_LIST.map((platform) => {
                const isSelected = detectedPlatform.id === platform.id;
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => handleSelectPlatformPill(platform)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-150 cursor-pointer active:scale-95 ${
                      isSelected
                        ? "shadow-sm scale-[1.02]"
                        : "bg-[#181b1f] hover:bg-[#20242b] text-zinc-300 hover:text-white border border-[rgba(255,255,255,0.06)]"
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: `${platform.badgeColor}25`,
                            borderColor: `${platform.badgeColor}77`,
                            color: platform.badgeColor,
                            borderWidth: "1px",
                          }
                        : undefined
                    }
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: platform.badgeColor }}
                    />
                    <span>{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Job Details */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              {t("addJobModal.jobTitleRequired")}
            </label>
            <input
              type="text"
              required
              placeholder={t("addJobModal.jobTitlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#181b1f] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#93c5fd]/60 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                {t("addJobModal.companyNameRequired")}
              </label>
              <input
                type="text"
                required
                placeholder={t("addJobModal.companyPlaceholder")}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#181b1f] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#93c5fd]/60 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                {t("addJobModal.location")}
              </label>
              <input
                type="text"
                placeholder={t("addJobModal.locationPlaceholder")}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#181b1f] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#93c5fd]/60 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              {t("addJobModal.jobDescriptionRequired")}
            </label>
            <textarea
              required
              rows={6}
              placeholder={t("addJobModal.jobDescriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#181b1f] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#93c5fd]/60 font-sans leading-relaxed transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs active:scale-95"
            >
              {t("addJobModal.cancel")}
            </Button>
            <Button
              variant="sky"
              size="sm"
              type="submit"
              disabled={isSubmitting}
              className="text-xs font-semibold active:scale-95"
            >
              <span>
                {isSubmitting ? t("addJobModal.submitting") : t("addJobModal.submit")}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
