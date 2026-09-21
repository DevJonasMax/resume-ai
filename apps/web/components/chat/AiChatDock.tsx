"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  MinusSignIcon,
  ReloadIcon,
  SentIcon,
  SparklesIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import { useResumeStudio } from "../resume/ResumeStudioContext";

const QUICK_PROMPT_SUGGESTIONS = [
  "Quantify metrics",
  "Emphasize TypeScript",
  "Tighten summary",
  "Add Cloud KPIs",
  "Strengthen action verbs",
  "ATS keyword distribution",
];

const PILL_BADGES = [
  "Quantify metrics",
  "Emphasize TypeScript",
  "Tighten summary",
];

/**
 * Lightweight helper to format assistant response text with diff highlighting,
 * bolding, bullet points, and inline code blocks.
 */
function FormattedMessageContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-xs leading-relaxed break-words">
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

export function AiChatDock() {
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
  const [showJumpButton, setShowJumpButton] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledUpRef = useRef(false);

  // Sync with isChatDrawerOpen if header button triggers it
  useEffect(() => {
    if (isChatDrawerOpen) {
      setIsVisible(true);
      setIsExpanded(true);
      // Close standard drawer so they don't overlap
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
        scrollToBottom(false);
      }, 150);
    }
  }, [isExpanded]);

  const scrollToBottom = (smooth = true) => {
    bottomAnchorRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
    setShowJumpButton(false);
    userScrolledUpRef.current = false;
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom > 70) {
      setShowJumpButton(true);
      userScrolledUpRef.current = true;
    } else {
      setShowJumpButton(false);
      userScrolledUpRef.current = false;
    }
  };

  useEffect(() => {
    if (!userScrolledUpRef.current && isExpanded) {
      scrollToBottom(true);
    }
  }, [chatMessages, isRefining, isExpanded]);

  const handleSend = async () => {
    const text = inputPrompt.trim();
    if (!text || isRefining) return;
    setInputPrompt("");
    userScrolledUpRef.current = false;
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await sendChatMessage(text);
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
    userScrolledUpRef.current = false;
    await sendChatMessage(suggestion);
  };

  if (!isVisible) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsVisible(true);
          setIsExpanded(true);
        }}
        className="fixed bottom-5 right-6 z-40 p-3 rounded-full bg-[#121417]/90 hover:bg-[#181b1f] border border-[rgba(216,180,254,0.3)] text-[#d8b4fe] shadow-2xl backdrop-blur-xl transition-all hover:scale-105 cursor-pointer"
        title="Open AI Chat Dock (⌘K)"
      >
        <HugeiconsIcon icon={SparklesIcon} size={18} />
      </button>
    );
  }

  // COLLAPSED STATE: Floating Pill Dock
  if (!isExpanded) {
    return (
      <aside
        aria-label="AI Tailoring Assistant Dock"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-3 duration-300"
      >
        <div
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-3 px-3.5 py-2 rounded-full bg-[#121417]/90 hover:bg-[#16191f]/95 backdrop-blur-xl border border-[rgba(255,255,255,0.12)] hover:border-[#d8b4fe]/40 shadow-[0_12px_36px_rgba(0,0,0,0.5),0_0_15px_rgba(216,180,254,0.06)] transition-all duration-200 cursor-pointer group select-none"
        >
          {/* AI Icon Pill Indicator */}
          <div className="w-7 h-7 rounded-full bg-[#1e192a] border border-[#d8b4fe]/40 flex items-center justify-center text-[#d8b4fe] group-hover:border-[#d8b4fe]/70 shadow-sm transition-colors shrink-0">
            <HugeiconsIcon icon={SparklesIcon} size={14} className="group-hover:rotate-12 transition-transform duration-300" />
          </div>

          {/* Placeholder Text */}
          <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors whitespace-nowrap">
            Refine resume with AI...
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
                className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[rgba(216,180,254,0.08)] hover:bg-[rgba(216,180,254,0.18)] text-[#d8b4fe] border border-[rgba(216,180,254,0.22)] hover:border-[rgba(216,180,254,0.4)] transition-all cursor-pointer whitespace-nowrap"
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

  // EXPANDED STATE: Full AI Chat Window Dock
  return (
    <aside
      aria-label="AI Tailoring Assistant Chat Window"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[600px] max-w-[95vw] h-[520px] rounded-2xl bg-[#121417]/95 backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_25px_rgba(216,180,254,0.08)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Header with AI Status & Action Controls */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.08)] bg-[#15181d]/80 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1e192a] border border-[#d8b4fe]/35 flex items-center justify-center text-[#d8b4fe] shadow-sm">
            <HugeiconsIcon icon={AiBrain01Icon} size={15} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                AI Resume Tailoring Copilot
              </span>
              <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold bg-[#a7f3d0]/10 text-[#a7f3d0] border border-[#a7f3d0]/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a7f3d0] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#a7f3d0]"></span>
                </span>
                Online
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              Jev System One / Claude • {job.company}
            </span>
          </div>
        </div>

        {/* Window controls: Minimize to Pill and Close */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            title="Minimize to Pill (Esc)"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
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
            className="p-1.5 text-zinc-400 hover:text-rose-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={15} />
          </button>
        </div>
      </header>

      {/* Interactive Suggestion Pills Bar (`ai-suggestions`) */}
      <nav aria-label="Quick AI suggestions" className="px-3.5 py-2 border-b border-[rgba(255,255,255,0.06)] bg-[#101215]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 shrink-0 select-none">
          Quick suggestions:
        </span>
        {QUICK_PROMPT_SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSuggestion(suggestion)}
            disabled={isRefining}
            className="whitespace-nowrap px-2.5 py-1 bg-[#181b1f] hover:bg-[#22272e] border border-[rgba(255,255,255,0.08)] hover:border-[#d8b4fe]/40 rounded-full text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {suggestion}
          </button>
        ))}
      </nav>

      {/* Message History Viewport (`ai-conversation`) */}
      <div className="relative flex-1 overflow-hidden bg-[#0e1013]/50">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto p-4 space-y-4"
        >
          {chatMessages.map((msg) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 text-xs leading-relaxed ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isUser
                      ? "bg-[#181b1f] border border-[rgba(255,255,255,0.12)] text-zinc-300"
                      : "bg-[#251e33] border border-[#d8b4fe]/40 text-[#d8b4fe]"
                  }`}
                >
                  {isUser ? (
                    <HugeiconsIcon icon={UserAccountIcon} size={14} />
                  ) : (
                    <HugeiconsIcon icon={SparklesIcon} size={14} />
                  )}
                </div>

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
                        : "Jev Tailoring Agent"}
                    </span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>

                  <FormattedMessageContent content={msg.content} />
                </div>
              </div>
            );
          })}

          {/* In-Flight Refining Feedback */}
          {isRefining && (
            <div className="flex items-center gap-3 text-xs text-zinc-400 p-3 bg-[#181b1f]/80 rounded-xl border border-[rgba(216,180,254,0.2)]">
              <HugeiconsIcon
                icon={ReloadIcon}
                size={16}
                className="text-[#d8b4fe] animate-spin shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-white font-medium">
                  Synthesizing LaTeX & ATS alignments...
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Applying targeted enhancements and compiling preview
                </span>
              </div>
            </div>
          )}

          <div ref={bottomAnchorRef} className="h-1" />
        </div>

        {/* SmoothUI Smart Scroll: Floating 'Jump to Latest' Pill Button */}
        {showJumpButton && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-[#181b1f]/95 hover:bg-[#22272e] text-white rounded-full text-xs font-medium border border-[rgba(255,255,255,0.16)] shadow-xl transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-bottom-2 select-none"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="text-[#a7f3d0]" />
            <span>Jump to latest</span>
          </button>
        )}
      </div>

      {/* Prompt Input Section (`ai-prompt-input`) */}
      <footer className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[#13161a]/90">
        <div className="rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#181b1f] p-2 focus-within:border-[#d8b4fe]/60 focus-within:ring-1 focus-within:ring-[#d8b4fe]/30 transition-all">
          <textarea
            ref={textareaRef}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={isRefining}
            rows={1}
            placeholder='Ask AI to adjust bullet points, quantify results (e.g. "Add metrics to AWS projects")...'
            className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 outline-none resize-none leading-relaxed min-h-[36px] max-h-[110px]"
          />

          <div className="flex items-center justify-between pt-1.5 border-t border-[rgba(255,255,255,0.05)] select-none">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1">
              <span>Enter to send</span>
              <span>•</span>
              <span>Shift+Enter for newline</span>
            </span>

            <button
              type="button"
              onClick={handleSend}
              disabled={!inputPrompt.trim() || isRefining}
              className="h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-[#d8b4fe] hover:bg-[#c084fc] text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm"
            >
              {isRefining ? (
                <>
                  <HugeiconsIcon icon={ReloadIcon} size={12} className="animate-spin" />
                  <span>Refining...</span>
                </>
              ) : (
                <>
                  <span>Send</span>
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
