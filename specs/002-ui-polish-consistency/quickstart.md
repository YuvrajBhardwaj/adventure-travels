# Quickstart and Validation: Site-wide UI Consistency and Polish

How to prove the feature meets [spec.md](./spec.md). Run everything from `adventure-travel/` unless noted. The rules being checked are in [data-model.md](./data-model.md) and [contracts/](./contracts/).

## Prerequisites
- A dev server on `http://localhost:3000` (`npm run dev`), restarted after any `.env.local` change, so account pages talk to Supabase.
- Microsoft Edge (headless, used for screenshots and metrics through the DevTools protocol), as in `specs/001`.
- **Before starting the work:** build the current branch once into a baseline copy and keep its `out/` folder as `out-baseline/` for the text-regression check (V3). Build in an isolated copy, because the dev server shares `.next/`.

## V1. Static audits (FR-004, FR-005, FR-011, FR-013, SC-001, SC-002)
Each command must print nothing (or a zero count):
```bash
grep -rnE 'Loading…|Loading\.\.\.' src --include=*.tsx                    # no text-only loaders
grep -rnE '\bcyan-[0-9]{2,3}' src --include=*.tsx                          # no off-palette accent
grep -rnE '(bg|text|from|to|via|border)-\[#[0-9A-Fa-f]{3,6}\]' src --include=*.tsx   # no hex colour classes
grep -rnE 'className="[^"]*\bskeleton\b' src --include=*.tsx              # legacy skeleton class gone
grep -rn 'animate-spin' src --include=*.tsx | grep -v 'components/ui/'     # spinners only inside the kit
grep -rnE 'duration: ?[0-9.]+|ease: ?\[' src --include=*.tsx | grep -v 'lib/motion.ts'   # inline motion values (review each hit)
```
Raw `<button>`s with hand-rolled styling are reviewed against the audit: each must be a kit `Button`, a navigation item, or a documented exception in `audit.md`.

## V2. Build gates
```bash
npx tsc --noEmit
npm run lint                 # 0 errors
npm test                     # all unit tests pass
# production build in an isolated copy (never while npm run dev runs in this folder)
```

## V3. No content or SEO regression (FR-002, SC-008)
Extract the visible text of every exported page (without `<script>`/`<style>`) from `out-baseline/` and from the new `out/`, then diff them per page. **Expected:** no differences in text. Class names and markup structure may change; words, links (`href`s), headings and JSON-LD must not. Also confirm every trek and course page still contains its itinerary, inclusions and packing-list text.

## V4. Layout stability and first view (FR-014, FR-016, SC-003, SC-004)
In headless Edge, with Fast 4G network emulation and 4× CPU throttling, load `/`, `/treks`, `/treks/kuari-pass`, `/dashboard` (signed in) and `/checkout?booking=…`. Record layout shift (`layout-shift` entries) and largest paint (`largest-contentful-paint`).
**Expected:**
- layout shift below 0.1 on every page
- largest paint within 2.5s on `/` and the trek page
- no full-screen overlay in the first screenshot
- photos visible without scripts (load with JavaScript disabled: the content and images show).

## V5. One look across page families (FR-005 to FR-010, SC-006)
Screenshot every family at **360, 768, 1280 and 1920px**:
- **Marketing:** `/`, `/treks`, `/courses`, `/contact`, a hub page
- **Detail:** a trek and a course
- **Account:** `/login`, `/signup`, `/dashboard`
- **Checkout and admin:** `/checkout`, `/admin/bookings`, in both light and dark toggle.

Put the primary button, secondary button, input, select, card, badge and dialog from each family side by side.
**Expected:**
- same shape (controls `rounded-xl`, surfaces `rounded-2xl`, pills `rounded-full`), size steps, type scale and states
- only palette colours
- no sideways scroll at any width (page `scrollWidth` equals its `clientWidth`).

## V6. Loading states (FR-011 to FR-015, SC-002)
With the network throttled to Slow 4G, open `/dashboard`, `/checkout`, `/admin/bookings`, `/admin/customers`, `/admin/payments`, the activity feed and a photo-heavy trek page.
**Expected:**
- every waiting area shows a placeholder shaped like its final content; no "Loading…" text, no blank gaps
- placeholders appear only if the wait exceeds about 150ms (on a fast network none flash)
- nothing jumps when data arrives
- a pressed "Pay", "Save" or "Log in" shows a spinner inside the button and can't be pressed twice.

## V7. Motion (FR-017 to FR-020, SC-005)
On a mid-range Android phone (or DevTools 4× CPU throttling), repeatedly and quickly open and close: the navbar Treks and Activities menus, the account menu, the mobile drawer (including swipe to close), a trek "Quick info" dialog, the gallery lightbox, the admin history sheet, trek tabs, the slideshows.
**Expected:**
- a steady 55 fps or better with no visible stutter
- reversing mid-animation continues smoothly
- the same kind of overlay moves the same way everywhere.

Then emulate `prefers-reduced-motion: reduce` and repeat. **Expected:** no movement (opacity only), no shimmer, no autoplaying slideshow; everything still works.

## V8. Accessibility (FR-021, FR-023, FR-024, SC-007)
- Tab through each page family: every interactive element shows the same visible focus ring. Dialogs and sheets trap focus, close on Escape and return focus to their trigger.
- Contrast: all text and essential icons meet WCAG 2.2 AA on their surface, light and dark.
- Touch targets are at least 44×44px at 360px width. At 200% zoom, no sideways scroll.

## V9. Flows still work (SC-008)
With `npx vercel dev` and the Supabase keys:
- sign up and log in
- book a trek, then open checkout up to the Razorpay window (test mode)
- edit the profile
- use the admin bookings search and filters, change a status, open a history sheet.

**Expected:** each behaves as before the change; only the look differs.

## V10. Audit closed (SC-009)
Every row in `audit.md` is `verified`, or `deferred` with a reason the owner has approved.

## Results
| Run | Date | Scenarios | Outcome |
|---|---|---|---|
| Baseline survey | 2026-10-21 | V1 (before) | 6 "Loading…" texts, 8 cyan uses, 34 hex colour classes, 3 `.skeleton` uses, 7 spinners, 7 hand-built overlays: see [research.md](./research.md) |
| After the work | 2026-10-22 | V1 | All greps print nothing (no "Loading…", no cyan, no hex classes, no `.skeleton`); the only `animate-spin` outside the kit is the slow decorative ring in `CallToActionV2` (reduced-motion safe); raw `<button>` 103 → 52 (cards, tabs, dots, accordion headers), kit `<Button>` 15 → 68 |
| After the work | 2026-10-22 | V2 | `tsc` clean; lint 0 errors (4 warnings: three hero `<img>`, one unused var in `Logo.tsx`); 65 tests pass; isolated production build succeeds |
| After the work | 2026-10-22 | V3 | Baseline and new export compared for 47 pages (text, links, headings, JSON-LD). Nothing visitors can read was lost because of this work. Differences: preloader text gone; hidden mobile menu/search panel no longer duplicated in the HTML; "Loading…" labels; all 70 FAQ answers and the T&C panels now in the HTML (added); stats counters show real numbers instead of 0; JSON-LD identical apart from a build timestamp. Trek pages and the home map also differ because the other session's commit `603b69e` (live departures, packages, map headings) landed after the baseline was built, so the baseline is stale for those |
| After the work | 2026-10-22 | V4 | Phone, 4× CPU, 1.6 Mbps, 150 ms latency, new build: layout shift 0 on all 7 pages; largest paint 0.70–1.02 s (baseline 0.56–0.96 s, within noise, under 2.5 s). No full-screen overlay in the first view |
| After the work | 2026-10-22 | V5 (overflow) | 11 pages × widths 320/390/768/1024: no sideways scroll, after fixing the course pages at 1024 (main column needed `min-w-0`; the bug pre-dated this work). The first overflow run was a measuring artifact |
| Not run | | V6 (Slow-4G walk), V7 (phone smoothness), V8 (contrast, keyboard, 200% zoom), V9 (signed-in flows) | Need a person, a real phone and a login |
