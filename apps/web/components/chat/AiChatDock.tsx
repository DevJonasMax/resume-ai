"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  MinusSignIcon,
  Refresh01Icon,
  ReloadIcon,
  SentIcon,
  SparklesIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import { useResumeStudio } from "../resume/ResumeStudioContext.js";
import { useI18n } from "@/lib/i18n/index.js";
import { AgentAvatar } from "@/components/smoothui/AgentAvatar.js";
import { AIConversation } from "@/components/smoothui/AIConversation.js";
import { AIReasoning } from "@/components/smoothui/AIReasoning.js";
import { ModelSelector } from "./ModelSelector.js";

/**
 * Lightweight helper to format assistant response text with diff highlighting,
 * bolding, bullet points, and inline code blocks.
 */
function FormattedMessageContent({ content }: { content: string }) {
  // Check if content has reasoning / thought process blocks
  const thoughtMatch = content.match(/<thought>([\s\S]*?)<\/thought>/i) ||
    content.match(/\[Thought Process\]([\s\S]*?)\[\/Thought Process\]/i);

  const thoughtContent = thoughtMatch ? thoughtMatch[1].trim() : null;
  const mainContent = thoughtMatch
    ? content.replace(thoughtMatch[0], "").trim()
    : content;

  const lines = mainContent.split("\n");

  return (
    <div className="space-y-1.5 text-xs leading-relaxed break-words font-sans">
      {thoughtContent && (
        <AIReasoning defaultOpen={false}>
          <div className="whitespace-pre-wrap">{thoughtContent}</div>
        </AIReasoning>
      )}

      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Diff addition line (+ ...)
        if (trimmed.startsWith("+ ") || trimmed.startsWith("+\t")) {
          return (
            <div
              key={lineIdx}
              className="flex items-start gap-1 font-mono text-[11px] text-[#a7f3d0] bg-[#a7f3d0]/10 px-2 py-0.5 rounded border border-[#a7f3d0]/20"
            >
              <span className="select-none font-bold">+</span>
              <span className="flex-1">{trimmed.substring(2)}</span>
            </div>
          );
        }

        // Diff deletion line (- ...)
        if (trimmed.startsWith("- ") && !trimmed.startsWith("- -")) {
          return (
            <div
              key={lineIdx}
              className="flex items-start gap-1 font-mono text-[11px] text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"
            >
              <span className="select-none font-bold">-</span>
              <span className="flex-1">{trimmed.substring(2)}</span>
            </div>
          );
        }

        // Bullet list item
        if (trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
          const itemText = trimmed.substring(2);
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1">
              <span className="text-[#d8b4fe] select-none leading-5">•</span>
              <span className="flex-1">
                {parseInlineMarkdown(itemText)}
              </span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={lineIdx} className="min-h-[1em]">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Formats **bold**, `code`, and inline elements cleanly.
 */
function parseInlineMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="font-mono text-[11px] px-1 py-0.5 rounded bg-[#181b1f] text-[#d8b4fe] border border-[rgba(255,255,255,0.08)]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * Real Error Card component displaying actionable error details,
 * retry action, and copyable debugging metadata.
 */
function RealErrorCard({
  errorMessage,
  timestamp,
  activeModel,
  onRetry,
}: {
  errorMessage: string;
  timestamp: string;
  activeModel: string;
  onRetry?: () => void;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleCopyDetails = async () => {
    const details = `[Error Details]\nMessage: ${errorMessage}\nTimestamp: ${timestamp}\nModel: ${activeModel}`;
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full rounded-2xl bg-rose-950/25 border border-rose-500/35 p-4 shadow-lg shadow-rose-950/20 text-xs space-y-3 animate-in fade-in duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-rose-300">
          <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 shrink-0">
            <HugeiconsIcon icon={Alert02Icon} size={15} />
          </div>
          <div>
            <h4 className="font-bold text-rose-200 tracking-tight">
              {t("aiChat.errorCardTitle")}
            </h4>
            <p className="text-[10px] text-rose-400/80">
              {t("aiChat.errorCardSubtitle")}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">{timestamp}</span>
      </div>

      <div className="p-2.5 rounded-xl bg-[#140b0e] border border-rose-500/20 text-rose-200/90 text-xs font-mono break-words leading-relaxed">
        {errorMessage}
      </div>

      {showDetails && (
        <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800 text-[10px] text-zinc-400 font-mono space-y-1">
          <div>Model: <span className="text-zinc-200">{activeModel}</span></div>
          <div>Timestamp: <span className="text-zinc-200">{timestamp}</span></div>
          <div>Scope: Candidate profile & ATS tailoring pipeline</div>
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-rose-500/15">
        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          {showDetails ? t("aiChat.hideDetails") : t("aiChat.showDetails")}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyDetails}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-[11px] font-medium transition-all active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={12} className="text-[#a7f3d0]" />
                <span className="text-[#a7f3d0]">{t("aiChat.copied")}</span>
              </>
            ) : (
              <>
                <HugeiconsIcon icon={Copy01Icon} size={12} />
                <span>{t("aiChat.copyDetails")}</span>
              </>
            )}
          </button>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <HugeiconsIcon icon={Refresh01Icon} size={12} />
              <span>{t("aiChat.retry")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AiChatDock() {
  const { t } = useI18n();
  const {
    job,
    chatMessages,
    isRefining,
    sendChatMessage,
    candidate,
    isChatDrawerOpen,
    closeChatDrawer,
  } = useResumeStudio();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.8-flash");
  const [lastPromptSent, setLastPromptSent] = useState<string>("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick suggestions focused strictly on candidate profile/resume/application readiness
  const QUICK_PROMPT_SUGGESTIONS = [
    t("aiChat.promptSuggestions.quantifyMetrics"),
    t("aiChat.promptSuggestions.emphasizeTypeScript"),
    t("aiChat.promptSuggestions.tightenSummary"),
    t("aiChat.promptSuggestions.cloudKpis"),
    t("aiChat.promptSuggestions.actionVerbs"),
    t("aiChat.promptSuggestions.atsKeywords"),
    t("aiChat.promptSuggestions.profileReadiness"),
    t("aiChat.promptSuggestions.gapAlignment"),
  ];

  const PILL_BADGES = [
    t("aiChat.promptSuggestions.quantifyMetrics"),
    t("aiChat.promptSuggestions.atsKeywords"),
    t("aiChat.promptSuggestions.profileReadiness"),
  ];

  const lastMessage = chatMessages[chatMessages.length - 1];
  const hasRecentError = lastMessage?.role === "system";

  const avatarState = isRefining
    ? "thinking"
    : hasRecentError
    ? "error"
    : "idle";

  // Sync with isChatDrawerOpen if header button triggers it
  useEffect(() => {
    if (isChatDrawerOpen) {
      setIsVisible(true);
      setIsExpanded(true);
      closeChatDrawer();
    }
  }, [isChatDrawerOpen, closeChatDrawer]);

  // Global Keyboard Shortcuts (⌘K / Ctrl+K and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsVisible(true);
        setIsExpanded((prev) => !prev);
      } else if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  // Auto-grow textarea handler
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 36), 110);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputPrompt]);

  // Focus input on expand
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isExpanded]);

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? inputPrompt).trim();
    if (!text || isRefining) return;

    if (!overrideText) {
      setInputPrompt("");
    }
    setLastPromptSent(text);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await sendChatMessage(text, selectedModel);
    } catch {
      // Error recorded in message history
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectSuggestion = async (suggestion: string) => {
    if (isRefining) return;
    setIsVisible(true);
    setIsExpanded(true);
    await handleSend(suggestion);
  };

  const handleRetryLastPrompt = async () => {
    if (lastPromptSent && !isRefining) {
      await handleSend(lastPromptSent);
    }
  };

  const agentSeed = job?.company ? `${job.company}-gemini` : "gemini-assistant";

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsVisible(true);
          setIsExpanded(true);
        }}
        className="fixed bottom-5 right-6 z-40 p-3 rounded-full bg-[#121417]/90 hover:bg-[#181b1f] border border-[rgba(216,180,254,0.3)] text-[#d8b4fe] shadow-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Open AI Chat Dock (⌘K)"
      >
        <HugeiconsIcon icon={SparklesIcon} size={18} />
      </button>
    );
  }

  // COLLAPSED STATE: Floating Pill Dock with SmoothUI AgentAvatar
  if (!isExpanded) {
    return (
      <aside
        aria-label="AI Tailoring Assistant Dock"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300"
      >
        <div
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-3 px-3.5 py-2 rounded-full bg-[#121417]/90 hover:bg-[#16191f]/95 backdrop-blur-xl border border-[rgba(255,255,255,0.12)] hover:border-[#d8b4fe]/40 shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_15px_rgba(216,180,254,0.06)] transition-all duration-200 cursor-pointer group select-none active:scale-95"
        >
          {/* SmoothUI Generative Canvas Avatar */}
          <AgentAvatar
            seed={agentSeed}
            size={26}
            animated={true}
            state={avatarState}
            showStatusIndicator={true}
          />

          {/* Placeholder Text */}
          <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors whitespace-nowrap">
            {t("aiChat.floatingPillPlaceholder")}
          </span>

          {/* Quick Suggestion Badges */}
          <div className="hidden sm:flex items-center gap-1.5 border-l border-[rgba(255,255,255,0.08)] pl-2.5">
            {PILL_BADGES.map((badge, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectSuggestion(badge);
                }}
                disabled={isRefining}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(216,180,254,0.08)] hover:bg-[rgba(216,180,254,0.18)] text-[#d8b4fe] border border-[rgba(216,180,254,0.22)] hover:border-[rgba(216,180,254,0.4)] transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                {badge}
              </button>
            ))}
          </div>

          {/* Keyboard shortcut hint */}
          <div className="flex items-center pl-1">
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-[#181b1f] border border-[rgba(255,255,255,0.1)] rounded shadow-inner">
              <span>⌘</span>K
            </kbd>
          </div>
        </div>
      </aside>
    );
  }

  // EXPANDED STATE: Full SmoothUI AI Conversation Window
  return (
    <aside
      aria-label="AI Tailoring Assistant Chat Window"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[640px] max-w-[95vw] h-[550px] rounded-2xl bg-[#121417]/95 backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_25px_rgba(216,180,254,0.08)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header with SmoothUI Generative Canvas Avatar & Model Selector */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#15181d]/80 select-none">
        <div className="flex items-center gap-2.5">
          <AgentAvatar
            seed={agentSeed}
            size={34}
            animated={true}
            state={avatarState}
            showStatusIndicator={true}
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                {t("aiChat.copilotTitle")}
              </span>
              <span
                className={`flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold ${
                  avatarState === "error"
                    ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    : isRefining
                    ? "bg-[#93c5fd]/10 text-[#93c5fd] border border-[#93c5fd]/20"
                    : "bg-[#a7f3d0]/10 text-[#a7f3d0] border border-[#a7f3d0]/20"
                }`}
              >
                {avatarState === "error"
                  ? t("aiChat.statusError")
                  : isRefining
                  ? t("aiChat.statusGenerating")
                  : t("aiChat.statusOnline")}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              {job?.company ? `${job.company} • ` : ""}
              {t("aiChat.subHeader")}
            </span>
          </div>
        </div>

        {/* Model Selector & Window Controls */}
        <div className="flex items-center gap-2">
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={(m) => setSelectedModel(m)}
          />

          <div className="flex items-center gap-1 border-l border-[rgba(255,255,255,0.08)] pl-2">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              title="Minimize to Pill (Esc)"
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-colors cursor-pointer active:scale-95"
            >
              <HugeiconsIcon icon={MinusSignIcon} size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setIsVisible(false);
              }}
              title="Close Chat Dock"
              className="p-1.5 text-zinc-400 hover:text-rose-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer active:scale-95"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Suggestion Pills Bar */}
      <nav
        aria-label="Quick AI suggestions"
        className="px-3.5 py-2 border-b border-[rgba(255,255,255,0.06)] bg-[#101215]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 shrink-0 select-none">
          {t("aiChat.quickSuggestionsLabel")}
        </span>
        {QUICK_PROMPT_SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSuggestion(suggestion)}
            disabled={isRefining}
            className="whitespace-nowrap px-2.5 py-1 bg-[#181b1f] hover:bg-[#22272e] border border-[rgba(255,255,255,0.08)] hover:border-[#d8b4fe]/40 rounded-full text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 shrink-0 active:scale-95"
          >
            {suggestion}
          </button>
        ))}
      </nav>

      {/* SmoothUI AIConversation scroll container */}
      <div className="relative flex-1 overflow-hidden bg-[#0e1013]/50">
        <AIConversation
          className="h-full p-4"
          contentKey={chatMessages.length + (isRefining ? 1 : 0)}
        >
          <div className="space-y-4">
            {chatMessages.map((msg) => {
              const isUser = msg.role === "user";
              const isSystemError = msg.role === "system";

              // Real Error Card
              if (isSystemError) {
                return (
                  <div key={msg.id} className="w-full">
                    <RealErrorCard
                      errorMessage={msg.content}
                      timestamp={msg.timestamp}
                      activeModel={selectedModel}
                      onRetry={lastPromptSent ? handleRetryLastPrompt : undefined}
                    />
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 text-xs leading-relaxed ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar Icon */}
                  {isUser ? (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-[#181b1f] border border-[rgba(255,255,255,0.12)] text-zinc-300">
                      <HugeiconsIcon icon={UserAccountIcon} size={14} />
                    </div>
                  ) : (
                    <AgentAvatar
                      seed={agentSeed}
                      size={28}
                      animated={false}
                    />
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`flex flex-col gap-1 max-w-[85%] rounded-2xl p-3.5 ${
                      isUser
                        ? "rounded-tr-xs bg-[#181b1f] text-zinc-100 border border-[rgba(255,255,255,0.08)] shadow-sm"
                        : "rounded-tl-xs bg-[#13161a] text-zinc-200 border border-[rgba(255,255,255,0.07)] shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] text-zinc-400 mb-0.5 select-none">
                      <span className="font-semibold text-zinc-300">
                        {isUser
                          ? candidate?.fullName || "Candidate"
                          : `AI Copilot (${selectedModel})`}
                      </span>
                      <span className="font-mono">{msg.timestamp}</span>
                    </div>

                    <FormattedMessageContent content={msg.content} />
                  </div>
                </div>
              );
            })}

            {/* In-Flight Refining Feedback with SmoothUI AIReasoning shimmer */}
            {isRefining && (
              <div className="flex flex-col gap-2 p-3 bg-[#181b1f]/80 rounded-xl border border-[rgba(216,180,254,0.2)]">
                <AIReasoning isStreaming={true} defaultOpen={true}>
                  Evaluating ATS keyword distribution, aligning bullet points with verified
                  candidate experience, and executing structured refinement via {selectedModel}...
                </AIReasoning>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono pl-1">
                  <HugeiconsIcon icon={ReloadIcon} size={12} className="animate-spin text-[#d8b4fe]" />
                  <span>Synthesizing tailored document &amp; updating LaTeX preview...</span>
                </div>
              </div>
            )}
          </div>
        </AIConversation>
      </div>

      {/* Prompt Input Section */}
      <footer className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[#13161a]/90">
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#181b1f] p-2 focus-within:border-[#d8b4fe]/60 focus-within:ring-1 focus-within:ring-[#d8b4fe]/30 transition-all">
          <textarea
            ref={textareaRef}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={isRefining}
            rows={1}
            placeholder={t("aiChat.inputPlaceholder")}
            className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 outline-none resize-none leading-relaxed min-h-[36px] max-h-[110px]"
          />

          <div className="flex items-center justify-between pt-1.5 border-t border-[rgba(255,255,255,0.05)] select-none">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <span>{t("aiChat.enterToSend")}</span>
              <span>•</span>
              <span>{t("aiChat.shiftEnterNewline")}</span>
            </span>

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputPrompt.trim() || isRefining}
              className="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-[#d8b4fe] hover:bg-[#c084fc] text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              {isRefining ? (
                <>
                  <HugeiconsIcon icon={ReloadIcon} size={12} className="animate-spin" />
                  <span>{t("aiChat.refining")}</span>
                </>
              ) : (
                <>
                  <span>{t("aiChat.send")}</span>
                  <HugeiconsIcon icon={SentIcon} size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      </footer>
    </aside>
  );
}
