"use client";

import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

const SPRING_DEFAULT = {
  bounce: 0.1,
  duration: 0.25,
  type: "spring" as const,
};

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const AUTO_COLLAPSE_DELAY_MS = 600;
const MS_PER_SECOND = 1000;
const SHIMMER_SECONDS = 1.8;

export type AIReasoningProps = {
  children: ReactNode;
  className?: string;
  collapseWhenDone?: boolean;
  defaultOpen?: boolean;
  duration?: number;
  isStreaming?: boolean;
};

/**
 * SmoothUI AIReasoning: Collapsible reasoning trace / thought process.
 *
 * The summary line shimmers while the model is actively working, reports
 * the elapsed seconds spent reasoning, and smoothly expands/collapses.
 */
export const AIReasoning = ({
  children,
  className,
  collapseWhenDone = false,
  defaultOpen = false,
  duration,
  isStreaming = false,
}: AIReasoningProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(defaultOpen || isStreaming);
  const [isUserControlled, setIsUserControlled] = useState(false);

  const startedAtRef = useRef<number | null>(null);
  const [measuredSeconds, setMeasuredSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (isStreaming) {
      startedAtRef.current = Date.now();
      setMeasuredSeconds(null);
      if (!isUserControlled) {
        setIsOpen(true);
      }
      return;
    }
    if (startedAtRef.current !== null) {
      setMeasuredSeconds((Date.now() - startedAtRef.current) / MS_PER_SECOND);
      startedAtRef.current = null;
    }
  }, [isStreaming, isUserControlled]);

  useEffect(() => {
    if (isStreaming || !collapseWhenDone || isUserControlled) {
      return;
    }
    const timeout = setTimeout(() => setIsOpen(false), AUTO_COLLAPSE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [collapseWhenDone, isStreaming, isUserControlled]);

  const seconds = duration ?? measuredSeconds;
  const summary = (() => {
    if (isStreaming) {
      return "Thinking & evaluating ATS alignment...";
    }
    if (seconds !== null) {
      return `Thought for ${seconds.toFixed(1)}s`;
    }
    return "Thought Process & Reasoning";
  })();

  return (
    <div className={cn("w-full my-1.5", className)}>
      <button
        aria-expanded={isOpen}
        className="group flex w-full cursor-pointer items-center gap-1.5 rounded-lg py-1 px-1.5 text-left text-zinc-400 text-xs transition-colors hover:text-zinc-200 select-none bg-[#14171c]/60 border border-[rgba(255,255,255,0.05)] active:scale-95"
        onClick={() => {
          setIsUserControlled(true);
          setIsOpen((current) => !current);
        }}
        type="button"
      >
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          className="flex size-3.5 items-center justify-center text-zinc-500 group-hover:text-zinc-300"
          transition={shouldReduceMotion ? { duration: 0 } : SPRING_DEFAULT}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
        </motion.span>

        <HugeiconsIcon icon={SparklesIcon} size={11} className="text-[#d8b4fe]" />

        {isStreaming && !shouldReduceMotion ? (
          <span
            className="bg-[length:200%_100%] bg-clip-text text-transparent font-medium"
            style={{
              animation: `ai-reasoning-shimmer ${SHIMMER_SECONDS}s linear infinite`,
              backgroundImage:
                "linear-gradient(90deg, #d8b4fe 0%, #93c5fd 35%, #a7f3d0 50%, #93c5fd 65%, #d8b4fe 100%)",
            }}
          >
            {summary}
          </span>
        ) : (
          <span className="font-medium text-zinc-400 group-hover:text-zinc-200">
            {summary}
          </span>
        )}
      </button>

      <style>{`
        @keyframes ai-reasoning-shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
      `}</style>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden"
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : { height: 0, opacity: 0 }
            }
            initial={
              shouldReduceMotion
                ? { height: "auto", opacity: 1 }
                : { height: 0, opacity: 0 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    height: SPRING_DEFAULT,
                    opacity: { duration: 0.18, ease: EASE_OUT },
                  }
            }
          >
            <div className="mt-1.5 ml-2 border-l border-[#d8b4fe]/20 pl-3.5 py-1 text-zinc-400 text-[11px] leading-relaxed font-mono bg-[#0c0d10]/40 rounded-r-lg">
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default AIReasoning;
