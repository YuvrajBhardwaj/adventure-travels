"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DURATION, EASE, transition } from "@/lib/motion";

export type PaymentPhase = "processing" | "success" | "failed" | "pending";

const COPY: Record<PaymentPhase, { title: string; body: string }> = {
  processing: {
    title: "Confirming your payment…",
    body: "Hang tight — please don't close or refresh this page.",
  },
  success: {
    title: "Payment successful!",
    body: "Your booking is confirmed. A confirmation will follow on WhatsApp and email.",
  },
  failed: {
    title: "Payment didn't go through",
    body: "No money was taken. You can try again.",
  },
  pending: {
    title: "Payment received",
    body: "We're still waiting for the bank to confirm. This can take a minute — your booking will update automatically.",
  },
};

function SuccessMark({ animate }: { animate: boolean }) {
  return (
    <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10">
      <svg viewBox="0 0 96 96" className="h-24 w-24 text-emerald-600 dark:text-emerald-400" fill="none" aria-hidden>
        <motion.circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: DURATION.slow * 1.5, ease: EASE.out }}
        />
        <motion.path
          d="M30 50 L43 63 L67 36"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animate ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: DURATION.slow, delay: animate ? DURATION.slow * 1.25 : 0, ease: EASE.out }}
        />
      </svg>
    </span>
  );
}

function Icon({ phase, animate }: { phase: PaymentPhase; animate: boolean }) {
  if (phase === "success") return <SuccessMark animate={animate} />;
  if (phase === "failed") {
    return (
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
        <TriangleAlert className="h-9 w-9" aria-hidden />
      </span>
    );
  }
  if (phase === "pending") {
    return (
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <Clock className="h-9 w-9" aria-hidden />
      </span>
    );
  }
  return (
    <span className="relative flex h-20 w-20 items-center justify-center">
      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/15 motion-reduce:animate-none" />
      {/* Documented exception (FR-013): this spinner is the continuing state of the Pay button. */}
      <Spinner size="md" className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
    </span>
  );
}

export function PaymentStatus({
  phase,
  detail,
  onRetry,
}: {
  phase: PaymentPhase;
  /** Overrides the default body copy (e.g. the bank's failure reason). */
  detail?: string | null;
  onRetry?: () => void;
}) {
  const reduce = useReducedMotion();
  const copy = COPY[phase];

  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center px-2 py-6 text-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={phase}
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.85 }}
          transition={transition("base")}
          className="flex flex-col items-center"
        >
          <Icon phase={phase} animate={!reduce} />
          <h2 className="mt-5 font-heading text-xl font-bold tracking-[-0.01em]">{copy.title}</h2>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">{detail || copy.body}</p>
          {phase === "failed" && onRetry && (
            <Button className="mt-5" onClick={onRetry}>
              Try again
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
