"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

const SIZE = 44;
const R = (SIZE - 8) / 2;
const CIRC = 2 * Math.PI * R;

export default function ScrollProgressRing({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const dashoffset = useTransform(progress, [0, 1], [CIRC, 0]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      className={`fixed z-50 flex items-center justify-center rounded-full bg-white/90 shadow-[0_8px_24px_rgba(2,6,23,0.18)] ring-1 ring-black/5 backdrop-blur transition-opacity hover:bg-white ${className}`}
      style={{ width: SIZE, height: SIZE }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90" aria-hidden>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="currentColor" strokeWidth={4} className="text-black/5" />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          className="text-emerald-500"
          strokeDasharray={CIRC}
          style={{ strokeDashoffset: dashoffset }}
        />
      </svg>
      <svg className="absolute h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </motion.button>
  );
}
