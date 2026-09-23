"use client";

import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const SPRING_DEFAULT = {
  bounce: 0.1,
  duration: 0.25,
  type: "spring" as const,
};

/**
 * How close to the bottom still counts as "at the bottom".
 */
const BOTTOM_THRESHOLD_PX = 48;

export type AIConversationProps = {
  children: ReactNode;
  className?: string;
  /**
   * Changes whenever content grows — message count, or streamed text length.
   * Used to decide when to follow the bottom.
   */
  contentKey?: string | number;
};

/**
 * SmoothUI AIConversation scroll container for an AI thread.
 *
 * It follows the bottom only while the reader is already there. Scrolling up
 * during a stream is an explicit act, so it stops auto-following and presents
 * an animated 'Jump to latest' button.
 */
export const AIConversation = ({
  children,
  className,
  contentKey,
}: AIConversationProps) => {
  const shouldReduceMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [isPinned, setIsPinned] = useState(true);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const distance =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    setIsPinned(distance <= BOTTOM_THRESHOLD_PX);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    if (typeof viewport.scrollTo === "function") {
      viewport.scrollTo({ behavior, top: viewport.scrollHeight });
    } else {
      viewport.scrollTop = viewport.scrollHeight;
    }
    setIsPinned(true);
  }, []);

  useLayoutEffect(() => {
    if (isPinned) {
      scrollToBottom(shouldReduceMotion ? "auto" : "smooth");
    }
  }, [contentKey, isPinned, scrollToBottom, shouldReduceMotion]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const observer = new ResizeObserver(measure);
    for (const child of Array.from(viewport.children)) {
      observer.observe(child);
    }
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div className={cn("relative min-h-0 w-full", className)}>
      <div
        className="h-full overflow-y-auto overscroll-contain"
        onScroll={measure}
        ref={viewportRef}
      >
        {children}
      </div>

      <AnimatePresence initial={false}>
        {!isPinned && (
          <motion.button
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-label="Jump to latest"
            className="absolute inset-x-0 bottom-3 mx-auto flex w-fit cursor-pointer items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.12)] bg-[#181b1f]/95 py-1.5 pr-3.5 pl-3 text-zinc-200 hover:text-white text-xs shadow-xl backdrop-blur-md transition-colors active:scale-95 z-20"
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, scale: 0.96, y: 8 }
            }
            initial={
              shouldReduceMotion
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.96, y: 8 }
            }
            onClick={() =>
              scrollToBottom(shouldReduceMotion ? "auto" : "smooth")
            }
            transition={shouldReduceMotion ? { duration: 0 } : SPRING_DEFAULT}
            type="button"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} size={13} className="text-[#a7f3d0]" />
            <span>Jump to latest</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIConversation;
