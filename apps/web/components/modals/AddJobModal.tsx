import { Plus, X } from "lucide-react";
import { useState } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-panel rounded-2xl w-full max-w-xl flex flex-col max-h-[90vh] border border-zinc-700 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-700/60">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Job Opportunity</h3>
              <p className="text-xs text-zinc-400">Ingest job posting for automated analysis and tailoring</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
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
              className="w-full px-3.5 py-2 bg-zinc-900/90 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
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
                className="w-full px-3.5 py-2 bg-zinc-900/90 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-300">Location / Work Model</label>
              <input
                type="text"
                placeholder="e.g. Remote, San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900/90 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
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
              className="w-full px-3.5 py-2 bg-zinc-900/90 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
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
              className="w-full px-3.5 py-2 bg-zinc-900/90 border border-zinc-700 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? "Creating..." : "Add Opportunity"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
