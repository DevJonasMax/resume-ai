"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  ArrowDown01Icon,
  ReloadIcon,
  SentIcon,
  SparklesIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { useResumeStudio } from "./ResumeStudioContext";

const QUICK_PROMPT_SUGGESTIONS = [
  "Quantify achievements with % metrics & KPIs",
  "Emphasize Kubernetes, Cloud & distributed systems",
  "Shorten professional summary to 3 concise lines",
  "Align technical skills strictly with job posting requirements",
  "Strengthen action verbs across recent engineering roles",
];

export function ResumeStudioChatDrawer() {
  const {
    job,
    isChatDrawerOpen,
    closeChatDrawer,
    chatMessages,
    isRefining,
    sendChatMessage,
    candidate,
  } = useResumeStudio();

  const [inputPrompt, setInputPrompt] = useState("");
  const [showJumpButton, setShowJumpButton] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  const scrollToBottom = (smooth = true) => {
    bottomAnchorRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
    setShowJumpButton(false);
    userScrolledUpRef.current = false;
  };

  // Handle scroll events to detect if user has scrolled away from bottom
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

  // Auto-scroll when new messages arrive if user hasn't deliberately scrolled up
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      scrollToBottom(true);
    }
  }, [chatMessages, isRefining]);

  // Scroll to bottom whenever drawer is opened
  useEffect(() => {
    if (isChatDrawerOpen) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [isChatDrawerOpen]);

  const handleSend = async () => {
    const text = inputPrompt.trim();
    if (!text || isRefining) return;
    setInputPrompt("");
    userScrolledUpRef.current = false;
    await sendChatMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectSuggestion = async (suggestion: string) => {
    if (isRefining) return;
    userScrolledUpRef.current = false;
    await sendChatMessage(suggestion);
  };

  return (
    <Drawer
      isOpen={isChatDrawerOpen}
      onClose={closeChatDrawer}
      widthClass="max-w-xl"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#181b1f] border border-[#d8b4fe]/30 text-[#d8b4fe]">
            <HugeiconsIcon icon={AiBrain01Icon} size={16} />
          </div>
          <div>
            <span className="text-sm font-bold text-white">
              AI Tailoring Agent Dialogue
            </span>
            <span className="block text-[11px] text-zinc-500 font-mono">
              Jev Decision Engine • {job.company}
            </span>
          </div>
        </div>
      }
      description="Collaborate interactively with the AI agent to iteratively refine resume wording, section emphasis, and ATS keyword distribution."
    >
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Quick Suggestion Pills */}
        <div className="pb-3 border-b border-[rgba(255,255,255,0.06)]">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Suggested Refinements:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
            {QUICK_PROMPT_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                disabled={isRefining}
                className="whitespace-nowrap px-2.5 py-1 bg-[#181b1f] hover:bg-[#22272e] border border-[rgba(255,255,255,0.08)] rounded-full text-xs text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* SmoothUI AI Conversation Messages Viewport */}
        <div className="relative flex-1 overflow-hidden">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto p-3 space-y-4"
          >
            {chatMessages.map((msg) => {
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                      isUser
                        ? "bg-[#181b1f] border border-[rgba(255,255,255,0.1)] text-zinc-300"
                        : "bg-[#251e33] border border-[#d8b4fe]/40 text-[#d8b4fe] shadow-sm"
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
                    className={`flex flex-col gap-1 max-w-[85%] rounded-xl p-3.5 ${
                      isUser
                        ? "bg-[#181b1f] text-zinc-100 border border-[rgba(255,255,255,0.08)]"
                        : "bg-[#121417] text-zinc-200 border border-[rgba(255,255,255,0.06)] shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] text-zinc-500 mb-0.5">
                      <span className="font-semibold text-zinc-400">
                        {isUser
                          ? candidate?.fullName || "Candidate"
                          : "Jev Tailoring Agent"}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              );
            })}

            {/* In-Flight Refining Indicator */}
            {isRefining && (
              <div className="flex items-center gap-3 text-xs text-zinc-400 p-3 bg-[#181b1f]/60 rounded-xl border border-[rgba(255,255,255,0.08)]">
                <HugeiconsIcon icon={ReloadIcon} size={15} className="text-[#d8b4fe] animate-spin shrink-0" />
                <div className="flex flex-col">
                  <span className="text-white font-medium">
                    Synthesizing LaTeX Tailoring...
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Aligning ATS keywords and compiling resume document
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomAnchorRef} className="h-1" />
          </div>

          {/* SmoothUI Smart Scroll: Floating "Jump to Latest" Pill Button */}
          {showJumpButton && (
            <button
              type="button"
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-[#181b1f] hover:bg-[#20242a] text-white rounded-full text-xs font-medium border border-[rgba(255,255,255,0.12)] shadow-xl transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-bottom-2"
            >
              <HugeiconsIcon icon={ArrowDown01Icon} size={14} className="text-[#a7f3d0]" />
              <span>Jump to latest</span>
            </button>
          )}
        </div>

        {/* Chat Input Surface */}
        <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <div className="relative rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#181b1f]/80 p-2.5 focus-within:border-[#d8b4fe]/60 transition-all">
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRefining}
              rows={2}
              placeholder={`Instruct the agent (e.g. "Focus bullets on AWS & Terraform costs")...`}
              className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 outline-none resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1.5 border-t border-[rgba(255,255,255,0.05)]">
              <span className="text-[10px] text-zinc-500">
                Enter to send • Shift+Enter for newline
              </span>

              <Button
                variant="lavender"
                size="sm"
                onClick={handleSend}
                disabled={!inputPrompt.trim() || isRefining}
                className="h-7 px-3 text-xs"
              >
                <span>Send</span>
                <HugeiconsIcon icon={SentIcon} size={12} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
