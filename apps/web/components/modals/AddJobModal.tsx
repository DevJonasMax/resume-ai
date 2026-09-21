import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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

export function AddJobModal({ isOpen, onClose, onSubmit }: AddJobModalProps) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("Remote");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="prism-panel rounded-2xl w-full max-w-xl flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.06)] bg-[#181b1f]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#142233] text-[#93c5fd] border border-[#93c5fd]/30">
              <HugeiconsIcon icon={PlusSignIcon} size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Add Job Opportunity</h3>
              <p className="text-[11px] text-zinc-400">Ingest job posting for automated analysis and tailoring</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1e2228] transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Job Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior QA Automation Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#181b1f] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#93c5fd]/60"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Stripe, Airbnb"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#181b1f] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#93c5fd]/60"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Location / Work Model</label>
              <input
                type="text"
                placeholder="e.g. Remote, San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#181b1f] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#93c5fd]/60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Application URL</label>
            <input
              type="url"
              placeholder="https://company.com/careers/apply"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#181b1f] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#93c5fd]/60"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-300">Job Description *</label>
            <textarea
              required
              rows={6}
              placeholder="Paste raw job description, requirements, and responsibilities here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#181b1f] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#93c5fd]/60 font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="sky"
              size="sm"
              type="submit"
              disabled={isSubmitting}
              className="text-xs font-semibold"
            >
              <span>{isSubmitting ? "Creating..." : "Add Opportunity"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
