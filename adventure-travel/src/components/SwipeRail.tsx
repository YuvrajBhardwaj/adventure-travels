"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useDeferredReveal } from "./MotionWrapper";
import { DURATION, EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const item: Variants = {
  hidden: { opacity: 0, x: 36, transition: { duration: 0 } },
  visible: { opacity: 1, x: 0, transition: { duration: DURATION.slow * 1.4, ease: EASE.out } },
};

/**
 * Phones and tablets: a row you swipe, cards snapping into place, with a progress bar under it.
 * From `lg` up, `desktop` classes take over the layout (for example `lg:grid lg:grid-cols-3`).
 * Cards slide in from the right the first time the row scrolls into view; the static HTML
 * always shows them (see useDeferredReveal).
 */
export function SwipeRail({
  children,
  label,
  desktop,
  className,
  tone = "light",
}: {
  children: ReactNode;
  label: string;
  desktop?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  const { ref: revealRef, state } = useDeferredReveal("-60px");
  const listRef = useRef<HTMLUListElement>(null);
  const [bar, setBar] = useState({ thumb: 1, at: 0 });

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setBar({ thumb: el.scrollWidth ? el.clientWidth / el.scrollWidth : 1, at: max > 0 ? el.scrollLeft / max : 0 });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const scrolls = bar.thumb < 0.995;

  return (
    <div ref={revealRef} className={className}>
      <motion.ul
        ref={listRef}
        aria-label={label}
        data-lenis-prevent-touch
        initial={false}
        animate={state}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        className={cn(
          "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden",
          "lg:mx-0 lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0",
          desktop
        )}
      >
        {children}
      </motion.ul>
      {/* Always rendered, so nothing shifts when it fills in after mount */}
      <div
        aria-hidden
        className={cn(
          "mx-auto mt-5 h-[3px] w-28 overflow-hidden rounded-full transition-opacity duration-300 lg:hidden",
          tone === "dark" ? "bg-white/15" : "bg-foreground/10",
          scrolls ? "opacity-100" : "opacity-0"
        )}
      >
        <div
          className={cn("h-full rounded-full", tone === "dark" ? "bg-emerald-400" : "bg-primary")}
          style={{ width: `${bar.thumb * 100}%`, transform: `translateX(${bar.at * (1 / bar.thumb - 1) * 100}%)` }}
        />
      </div>
    </div>
  );
}

/** One card in a SwipeRail: about 4/5 of a phone screen, so the next card peeks in. */
export function RailItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.li
      variants={reduce ? undefined : item}
      className={cn("w-[80%] max-w-[340px] shrink-0 snap-start sm:w-[46%] lg:w-auto lg:max-w-none lg:shrink", className)}
    >
      {children}
    </motion.li>
  );
}
