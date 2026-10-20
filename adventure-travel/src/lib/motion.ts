import type { Transition } from "framer-motion";

/**
 * The site's one motion scale (specs/002-ui-polish-consistency/contracts/motion.md).
 * Components import these instead of writing durations or curves inline.
 * globals.css mirrors EASE as the Tailwind `ease-out` / `ease-in-out` tokens.
 */

type Bezier = [number, number, number, number];

/** Seconds. fast: hover/press and small icons · base: menus, popovers, tabs · slow: dialogs, sheets, page fade. */
export const DURATION = { fast: 0.15, base: 0.22, slow: 0.32 } as const;

/** out: entering or moving into place · inOut: leaving, and colour/opacity cross-fades. */
export const EASE: { out: Bezier; inOut: Bezier } = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
};

/** Sheets, drawers and drag-to-dismiss. */
export const SPRING = {
  sheet: { type: "spring", stiffness: 420, damping: 38 },
} as const satisfies Record<string, Transition>;

export const transition = (d: keyof typeof DURATION, e: keyof typeof EASE = "out"): Transition => ({
  duration: DURATION[d],
  ease: EASE[e],
});
