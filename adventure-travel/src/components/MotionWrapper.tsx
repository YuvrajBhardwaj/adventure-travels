"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Scroll-in reveals that never hide content in the static HTML (motion
 * contract rule 5, FR-016). The server render and the first client render are
 * fully visible. After mount, only an element that is still entirely below the
 * viewport is hidden (instantly, unseen) and then revealed as it scrolls in.
 * Anything already on screen never animates; reduced motion stays static.
 */
function useDeferredReveal(margin: `${number}px`) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [deferred, setDeferred] = useState(false);
  const inView = useInView(ref, { once: true, margin });

  useEffect(() => {
    const el = ref.current;
    if (reduce || !el) return;
    if (el.getBoundingClientRect().top > window.innerHeight) setDeferred(true);
  }, [reduce]);

  return { ref, state: deferred && !inView ? "hidden" : "visible" } as const;
}

const reveal = (from: { y?: number; scale?: number }, delay = 0): Variants => ({
  hidden: { opacity: 0, ...from, transition: { duration: 0 } },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: DURATION.slow, ease: EASE.out, delay } },
});

interface AnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeUp({ children, className = "", delay = 0 }: AnimationProps) {
  const { ref, state } = useDeferredReveal("-80px");
  return (
    <motion.div ref={ref} initial={false} animate={state} variants={reveal({ y: 24 }, delay)} className={className}>
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className = "", delay = 0 }: AnimationProps) {
  const { ref, state } = useDeferredReveal("-80px");
  return (
    <motion.div ref={ref} initial={false} animate={state} variants={reveal({ scale: 0.96 }, delay)} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.06,
}: Omit<AnimationProps, "delay"> & { staggerDelay?: number }) {
  const { ref, state } = useDeferredReveal("-60px");
  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={state}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: staggerDelay } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: Omit<AnimationProps, "delay">) {
  return (
    <motion.div variants={reveal({ y: 20 })} className={className}>
      {children}
    </motion.div>
  );
}
