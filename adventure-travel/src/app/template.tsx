"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const noSubscribe = () => () => {};

/**
 * App Router template re-mounts on every navigation, so this gives each route a
 * smooth cross-fade entrance. We animate OPACITY ONLY (never transform/filter):
 * a transformed ancestor would become the containing block for `position: fixed`
 * descendants (scroll-progress bar, popups, mobile menu), silently breaking them.
 *
 * The first page load is never faded: the static HTML and the hydration render start
 * fully visible, so content and the LCP image paint without waiting for JavaScript.
 * Only routes mounted by a client-side navigation (after hydration) fade in.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  // False in the server HTML and while hydrating; true for anything mounted afterwards.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);

  // Same element tree with or without reduced motion (no hydration mismatch, no remount
  // of the page when the media query resolves); reduced motion just never starts faded.
  return (
    <motion.div
      key={pathname}
      initial={hydrated && !reduceMotion ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
