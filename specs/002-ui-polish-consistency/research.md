# Research: Site-wide UI Consistency and Polish

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-21

The owner confirmed these defaults on 2026-10-21 ("ok continue"):
- the dark navy account pages stay dark
- the preloader must not hide content
- extend the existing shadcn-style kit, not a second design system
- brand colours stay exactly as they are
- static-export rules apply.

The baseline numbers come from a code survey of `adventure-travel/src` on 2026-10-21.

| Area | Today |
|---|---|
| Loading | 6 plain "Loading…" texts (dashboard ×4, `ActivityRequestForm`, admin `ActivityFeed`); 7 spinners; two placeholder styles: a `.skeleton` CSS class with a shimmer (3 uses) and the kit `<Skeleton>` with a pulse (15 uses) |
| Colour | 8 off-palette `cyan-*` uses in `CoursesPageClient`, `CourseDetailClient` and `ActivitiesPageClient`; 34 hex colours hard-coded in classes, all navy shades (`#0F172A`, `#0B1222`, `#0B1D33`, `#020617`, `#0b0f17`) |
| Controls | `<Button>` used 15 times against 103 raw `<button>`s; button corners: 15× `rounded-xl`, 6× `rounded-full`, 5× `rounded-lg` |
| Overlays | 7 hand-built dialogs or drawers (`QuickInfoModal`, `LegacyDataNotice`, `VideoShowcase`, `CampingSection`, the trek gallery lightbox, the admin history drawer, the mobile nav drawer), each with its own animation and focus handling |
| Motion | 12+ distinct durations (0.2–0.95s, plus 2s) and 6+ easing curves in framer-motion; Tailwind transitions at 150, 200, 300, 500, 700 and 1000ms |
| First view | `Preloader` covers every page (fixed, `z-[200]`) until hydration plus 600ms; `SmartImage` keeps photos at `opacity-0` until hydration; several home sections start at `opacity:0` |
| Fonts | `layout.tsx` downloads Poppins, but no style uses it (headings are Space Grotesk, body Inter) |

---

## R1. Component system: extend the existing shadcn-style kit
- **Decision:** keep `src/components/ui/` (cva + `tailwind-merge` + Tailwind v4 tokens, shadcn conventions) as the only component system.
  - **Add:** `input`, `textarea`, `label`, `select` (a styled native select), `checkbox`, `dialog`/`sheet`, `empty-state` and `spinner`.
  - **Extend:** `button` with a `loading` state and dark-surface styling, and `skeleton` with the shimmer.
  - **Migrate:** the hand-styled controls on every page to these.
- **Rationale:** the kit already follows shadcn conventions (forwardRef, `cn()`, cva variants, `dark:` variants) and is used by checkout and admin. Extending it meets "shadcn/ui" without a second system (FR-005).
- **Alternatives considered:**
  - Running the shadcn CLI to regenerate the kit: it would overwrite the existing components and needs Radix for everything, including the Tabs that must stay in the static HTML.
  - A different component library (MUI, Chakra): a second design system, heavier, and off-brand.

## R2. Dialogs and sheets: Radix Dialog plus framer-motion
- **Decision:** add one dependency, `@radix-ui/react-dialog` (the primitive shadcn's Dialog and Sheet use).
  - Build `ui/dialog.tsx` (centred) and `ui/sheet.tsx` (edge drawer) on it, animated with framer-motion through Radix `forceMount` + `AnimatePresence`.
  - Move all 7 hand-built overlays onto these two.
- **Rationale:** the overlays need the same focus trap, scroll lock, Escape and outside-click handling, ARIA and background `inert`. Getting that right 7 times by hand is how they drifted apart. framer-motion (already used) gives interruptible enter and exit (FR-018), which CSS keyframes can't: reversing a keyframe mid-way jumps.
- **Alternatives considered:**
  - Keep the hand-built overlays and copy one implementation around: that is the current state.
  - Native `<dialog>`: weak exit animation and inconsistent scroll lock.
  - Pulling in all of `@radix-ui/*`: unnecessary; Tabs and Select don't need it (R3, R4).

## R3. Tabs and navigation menus stay custom
- **Decision:**
  - Keep the trek and course detail tabs (every panel mounted, inactive ones `hidden`, roving tabindex) and the navbar mega-menu and dropdowns.
  - Restyle them with the shared tokens only.
- **Rationale:** Radix Tabs unmounts inactive panels by default, and the static-export SEO rule requires every panel in the HTML. The navbar was just rebuilt (`1be764a`) and is the reference quality bar.
- **Alternatives considered:** Radix Tabs with `forceMount`, which adds a dependency for behaviour we already have.

## R4. Select and checkbox: native, styled
- **Decision:** `ui/select` and `ui/checkbox` wrap the native elements with brand styling and a chevron.
- **Rationale:** native selects give the best mobile picker, need no JavaScript, and keep their values in the static HTML (the `/treks` filters, the admin filters, the currency switcher).
- **Alternatives considered:** Radix Select, which on mobile is worse than the native picker and is another dependency.

## R5. Colour tokens: name the existing colours, remove off-palette ones
- **Decision:**
  - Add named tokens for colours already in use, but hard-coded: `--color-navy` `#0F172A` (chrome and dark pages), `--color-navy-deep` `#0B1222` (menus, deep panels), `--color-navy-hero` `#0B1D33` (courses hero).
  - `#020617` and `#0b0f17` map to `navy-deep`.
  - The 8 `cyan-*` uses map to the **secondary (sky)** family, the closest brand hue on the navy courses hero, or to **primary (emerald)** where they mark an action.
  - No new colours.
- **Rationale:** FR-003 and FR-004. Naming the hex values makes them themeable and greppable without changing a single pixel of the brand.
- **Alternatives considered:** leave the hex values inline, which fails SC-001's "every colour maps to the palette" check.

## R6. Shape rule (corner radius)
- **Decision:**
  - **Controls** (buttons, inputs, selects, textareas) use `rounded-xl` (12px).
  - **Surfaces** (cards, panels, dialogs, tables, menus) use `rounded-2xl` (16px).
  - **Pills** (badges, filter chips, navbar nav items, avatars, carousel dots) use `rounded-full`.
  - The navbar "Sign up" becomes a standard `rounded-xl` primary Button. The nav items keep their pill hover, because they are navigation, not buttons.
- **Rationale:** `rounded-xl` is already the kit Button and the most common choice (15 of 26). It matches shadcn's rectangular button language. Separating "action" from "navigation and tag" keeps one rule per element type (FR-007).
- **Alternatives considered:** pill buttons everywhere (the navbar style), which would break every form and card button for one bar.

## R7. Placeholders (skeletons)
- **Decision:** one `Skeleton` component.
  - **Surface:** `bg-slate-200/70` on light, `bg-white/[0.06]` on dark.
  - **Shimmer:** a soft gradient sweep animated with `transform` only (GPU), static under `prefers-reduced-motion`.
  - **Fade-in delay:** 150ms, as a pure-CSS `animation-delay` on opacity, so data that arrives quickly never flashes a placeholder (FR-015).
  - **Shapes:** pages compose layout-true placeholders from `Skeleton` (row, card, avatar, text lines). The `.skeleton` CSS class and plain "Loading…" text are removed.
- **Rationale:** FR-011–FR-015. A transform-based shimmer stays smooth on mid-range phones. Animating `background-position` (the current `.skeleton`) repaints every frame.
- **Alternatives considered:**
  - Keep `animate-pulse`: dated, and it pulses opacity across the whole block.
  - Spinners: banned outside controls by FR-013.

## R8. Photos visible on first paint
- **Decision:** `SmartImage` stops hiding images until hydration.
  - The `<img>` renders visible, over a `Skeleton` (or the surface colour) in a box whose size is reserved by aspect ratio or explicit height.
  - When the image decodes, it simply covers the placeholder.
- **Rationale:** FR-014 and FR-016, and SC-003/SC-004. The current `opacity-0` gate delays the main image paint and leaves blank cards when scripts are slow.
- **Alternatives considered:** a CSS-only fade using `@starting-style`, which browsers still support inconsistently, and fades aren't needed when space is reserved.

## R9. Preloader
- **Decision:** remove `<Preloader />` from `layout.tsx` and delete the component.
- **Rationale:** the owner chose "must not hide content". A full-screen overlay is exactly what FR-016 forbids, and it also hurts load-speed metrics.
- **Alternatives considered:** a thin top progress bar during client-side navigation. Not needed: page changes already cross-fade (R11).

## R10. Motion tokens
- **Decision:** one shared scale in `src/lib/motion.ts` (for framer-motion), mirrored as CSS variables in the `@theme` block (for Tailwind transitions):
  - **Durations:** `fast` 0.15s (hover and press, small controls); `base` 0.22s (menus, popovers, tabs, tooltips); `slow` 0.32s (dialogs, sheets, page fade).
  - **Easing:** `out` = `cubic-bezier(0.16, 1, 0.3, 1)` for entering and moving; `inOut` = `cubic-bezier(0.65, 0, 0.35, 1)` for leaving.
  - **Spring:** `{ type: "spring", stiffness: 420, damping: 38 }` for sheets and drag.
  - **Properties:** animate only `transform`, `opacity` and occasionally `filter`; never layout properties, except framer's measured `height: auto` for accordions.
  - **Reduced motion:** every component reads `useReducedMotion()` (or `motion-reduce:`) and falls back to opacity-only, or no animation.
- **Rationale:** FR-017–FR-020, and SC-005. Three durations and two curves replace the 12+ and 6+ in use. The `out` curve matches the navbar's `EASE` (`[0.16, 1, 0.3, 1]`), the reference.
- **Alternatives considered:** springs everywhere, which are harder to keep consistent for small hover feedback.

## R11. Page transitions
- **Decision:** keep `template.tsx` (opacity-only fade on client-side navigation, never on the first load), with its duration and easing taken from the motion tokens (`slow`, `out`).
- **Rationale:** it already satisfies static-export first paint and avoids transformed ancestors breaking `position: fixed`.

## R12. Typography scale
- **Decision:**
  - **Headings:** Space Grotesk (as today) on one scale: page `h1` uses the existing `text-display-*` utilities; section `h2` is `text-3xl sm:text-4xl font-bold tracking-[-0.02em]`; card titles are `text-lg font-semibold`.
  - **Body:** Inter `text-base`, muted `text-sm`.
  - **Labels:** `text-xs font-semibold` in sentence case. Uppercase "kicker" labels go, following the navbar redesign's rule.
  - **Remove Poppins** from `layout.tsx`: it's downloaded but never used.
- **Rationale:** FR-009, and less font weight to load (SC-004).

## R13. Page families and dark variants
- **Decision:**

  | Family | Pages | Background | Component variant |
  |---|---|---|---|
  | Marketing | `/`, `/treks`, `/destinations`, `/activities`, `/courses`, `/contact`, `/faq`, `/cancellation-policy`, hubs | light (`background`/white), navy heroes | light |
  | Detail | `/treks/[id]`, `/courses/[course]` | light | light |
  | Account | `/login`, `/signup`, `/reset-password`, `/dashboard` | navy (kept) | **dark**: wrapped in a forced-`.dark` scope |
  | Checkout and admin | `/checkout`, `/admin/*` | `ThemeScope` (visitor toggle) | follows the toggle |

  The shared navbar and footer are navy chrome on every family.
- **Rationale:** the `dark:` variant is already `@custom-variant dark (&:where(.dark, .dark *))`. A forced `.dark` wrapper on the account pages lets the same kit components render their dark variant, instead of the bespoke `bg-white/5` inputs used today (FR-008).

## R14. Verification approach
- **Decision:** there are no UI test frameworks, and none are added. Verification uses:
  - **Grep audits:** no `Loading…` text, no `cyan-` classes, no hex-colour classes, no raw `<button>` with hand-rolled `rounded-*` outside the kit, no `.skeleton` usages.
  - **Checks:** `tsc` and `eslint`, plus a production build of an isolated copy (the dev server shares `.next`).
  - **Static HTML regression:** extract the visible text of every exported page before and after the work and diff it; it must be unchanged (FR-002, SC-008).
  - **Metrics:** layout shift and largest-paint time measured in headless Edge through the DevTools protocol (`PerformanceObserver`), with 4G and CPU throttling (SC-003, SC-004).
  - **Screenshots:** every page family at 360, 768, 1280 and 1920px, including reduced-motion (emulated `prefers-reduced-motion`) and keyboard-focus passes.
  - **Smoothness:** checked by eye on a real mid-range phone, plus DevTools frame timing (SC-005).
- **Rationale:** these match the repo's existing practice: tsc, eslint, an isolated build, and the headless Edge screenshot script used throughout `specs/001`.
