---

description: "Task list for site-wide UI consistency and polish"
---

# Tasks: Site-wide UI Consistency and Polish

**Input**: Design documents from `specs/002-ui-polish-consistency/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: the spec asks for no automated UI tests and the repo has no UI test framework ([research R14](./research.md#r14-verification-approach)). Verification is by the [quickstart](./quickstart.md) checks V1–V10.

**Organization**: tasks are grouped by user story, so each story can be built and checked on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[Story]**: the user story the task belongs to (US1–US4).
- All source paths are relative to `adventure-travel/`. Spec documents are in `specs/002-ui-polish-consistency/`.

## Shared rules for every task

These come from the design docs. Every task follows them without restating them:
- **Colours:** only the palette in [data-model.md](./data-model.md). No `bg-[#…]` / `text-[#…]` / `from-[#…]` hex classes, and no `cyan-*`.
- **Shape:** controls `rounded-xl`, surfaces `rounded-2xl`, pills `rounded-full` ([R6](./research.md#r6-shape-rule-corner-radius)).
- **Motion:** values from `src/lib/motion.ts` only. Animate `transform` and `opacity` only. Gate on `useReducedMotion()` or `motion-reduce:`. Nothing visible in the static HTML starts at `opacity:0` ([contracts/motion.md](./contracts/motion.md)).
- **Content:** no change to copy, links, headings, JSON-LD or what each page shows (FR-002). Tab panels stay mounted and `hidden`.
- **Buttons:** an action is a kit `Button`, or a link styled with `buttonVariants`. Navigation items, tabs, carousel dots and icon toggles may stay raw `<button>`s, but they use the shared focus ring and a 44px touch target.
- **Audit:** when a task fixes an `audit.md` row, set that row to `fixed`.

---

## Phase 1: Setup

**Purpose**: baseline, dependency and audit before any visual change.

- [X] T001 Build the current site once in an isolated copy (`scratchpad/buildcheck`, `npx next build --webpack`; never in `adventure-travel/` while `npm run dev` runs) and keep its `out/` as `out-baseline/` for the V3 text diff
- [X] T002 Add `@radix-ui/react-dialog` to `package.json` dependencies (`npm install @radix-ui/react-dialog`), and nothing else
- [ ] T003 Write `specs/002-ui-polish-consistency/audit.md` (FR-001): one `A-xxx` row per inconsistency, page by page, with category (colour · component · shape · typography · spacing · loading · motion · responsive · accessibility), file:line, resolution and status `open`. Seed it from the V1 grep audits in [quickstart.md](./quickstart.md) and the baseline survey in [research.md](./research.md), and cover every route in [R13](./research.md#r13-page-families-and-dark-variants)

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: the tokens and the kit every story uses.

**⚠️ CRITICAL**: no user-story work starts until this phase is done.

- [X] T004 In `src/app/globals.css` (`@theme inline`), add the named colours `--color-navy: #0F172A`, `--color-navy-deep: #0B1222`, `--color-navy-hero: #0B1D33`. Override Tailwind's `--ease-out` with `cubic-bezier(0.16, 1, 0.3, 1)` and `--ease-in-out` with `cubic-bezier(0.65, 0, 0.35, 1)`, so existing `ease-out`/`ease-in-out` classes use the motion tokens. Add a transform-only `skeleton-shimmer` keyframe and a `skeleton-in` (opacity 0 → 1, 150ms delay) keyframe
- [X] T005 [P] Create `src/lib/motion.ts` exactly as in [contracts/motion.md](./contracts/motion.md): `DURATION = { fast: 0.15, base: 0.22, slow: 0.32 }`, `EASE = { out: [0.16, 1, 0.3, 1], inOut: [0.65, 0, 0.35, 1] }`, `SPRING = { sheet: { type: "spring", stiffness: 420, damping: 38 } }`, and `transition(d, e = "out")`
- [X] T006 [P] Create `src/components/ui/spinner.tsx`: `Loader2` at 16px (`size="sm"`) or 20px, inheriting the text colour, `animate-spin motion-reduce:animate-none`, `aria-hidden`
- [X] T007 Extend `src/components/ui/button.tsx`: add variants `destructive` (red) and `link`; add a `loading` prop that renders `Spinner` before the label, sets `aria-busy` and `disabled`; keep every existing call site working (depends on T006)
- [X] T008 [P] Create `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx` and `src/components/ui/label.tsx`: `rounded-xl`, Input `h-11`, `text-base sm:text-sm`, light white field with slate border, dark `bg-white/5 border-white/10 text-white`, emerald focus ring, `invalid` → red border and `aria-invalid`
- [X] T009 [P] Create `src/components/ui/select.tsx` (styled native `<select>` in the Input box, with a chevron icon) and `src/components/ui/checkbox.tsx` (styled native checkbox, `accent-emerald-600`, wrapped with its label for a 44px target)
- [X] T010 Rewrite `src/components/ui/skeleton.tsx`: light `bg-slate-200/70`, dark `bg-white/[0.06]`, a transform-only shimmer sweep (`skeleton-shimmer`), a 150ms CSS fade-in delay (`skeleton-in`), static under `motion-reduce`, `aria-hidden`; same props as today (depends on T004)
- [X] T011 [P] Create `src/components/ui/empty-state.tsx`: `<EmptyState icon? title description? action? tone? />`, centred, muted icon in a `rounded-2xl` tinted square, title `text-base font-semibold`, description `text-sm text-muted`, light and dark renderings
- [X] T012 Create `src/components/ui/dialog.tsx` on `@radix-ui/react-dialog`: `Dialog`, `DialogTrigger`, `DialogContent` (`title`, `description?`, `size="sm|md|lg|full"`, `tone="light|dark"`, `hideTitle?`), `DialogClose`. Animate with framer-motion through `forceMount` + `AnimatePresence`: scrim fades over `base`; content scales from 0.96 and fades over `slow` with `EASE.out`; opacity only under reduced motion (depends on T002, T005)
- [X] T013 Create `src/components/ui/sheet.tsx` on the same primitive: `Sheet`, `SheetContent` (`side="right|left|bottom"`, `title`, `tone`), slid with `SPRING.sheet`, `rounded-2xl` on the inner edge only, optional drag-to-close (depends on T002, T005)
- [X] T014 [P] Create `src/components/ui/dark-scope.tsx`: forces `.dark` on its subtree (`<div className="dark contents">`-style wrapper, no toggle), so kit components render their dark variant
- [X] T015 (already present: the global `:focus-visible` rule in globals.css) Add a shared `:focus-visible` outline in `src/app/globals.css` (emerald ring, 2px offset) for raw interactive elements that aren't kit components

**Checkpoint**: tokens, motion module and kit exist; `npx tsc --noEmit` and `npm run lint` pass.

---

## Phase 3: User Story 1 — One coherent brand on every page (Priority: P1) 🎯 MVP

**Goal**: same-purpose elements look the same on every page, in brand colours only.

**Independent Test**: [quickstart](./quickstart.md) V1 (colour greps print nothing) and V5 (side-by-side screenshots of each family show the same button, input, select, card, badge).

### Colour

- [ ] T016 [P] [US1] Replace the `cyan-*` uses with brand colours (`sky-*` on the navy hero, `emerald-*` where it marks an action) in `src/app/courses/CoursesPageClient.tsx`, `src/app/courses/[course]/CourseDetailClient.tsx` and `src/app/activities/ActivitiesPageClient.tsx`
- [ ] T017 [P] [US1] Replace hex classes with `navy` / `navy-deep` tokens in `src/components/Navbar.tsx` (`#0B1222`, `#020617` → `navy-deep`; `#0F172A` → `navy`)
- [ ] T018 [P] [US1] Replace hex classes with tokens in `src/components/FooterV2.tsx`, `src/components/TrekHub.tsx`, `src/components/WallpaperCarousel.tsx`, `src/components/CampingSection.tsx`, `src/components/UnlockRestrictedUttarakhand.tsx`, `src/components/LegacyDataNotice.tsx` and `src/components/WelcomeChooser.tsx` (`#0b0f17` → `navy-deep`)
- [ ] T019 [P] [US1] Replace hex classes with tokens in `src/app/cancellation-policy/CancellationPolicyPageClient.tsx`, `src/app/faq/FAQPageClient.tsx` and `src/app/courses/CoursesPageClient.tsx` (`#0B1D33` → `navy-hero`)

### Account family (dark)

- [ ] T020 [US1] Wrap `src/app/login/page.tsx` in `DarkScope` on `bg-navy`; use `Label`, `Input`, `Button` (submit `loading`), and `buttonVariants` for the link buttons
- [ ] T021 [P] [US1] Same for `src/app/signup/page.tsx` (including the terms `Checkbox`)
- [ ] T022 [P] [US1] Same for `src/app/reset-password/page.tsx`
- [ ] T023 [US1] Same for `src/app/dashboard/page.tsx`: profile form fields → `Input`/`Label`/`Select`, all 9 raw buttons → `Button` variants (cancel booking → `destructive` or `outline`), cards → `Card` dark, status pills → `Badge`
- [ ] T024 [P] [US1] Restyle `src/components/GoogleSignInButton.tsx` as a `Button variant="outline"` with the Google mark, dark-aware

### Marketing and detail families (light)

- [ ] T025 [P] [US1] `src/app/contact/ContactPageClient.tsx`: form fields → `Input`/`Textarea`/`Select`/`Label`, submit → `Button loading`
- [ ] T026 [P] [US1] `src/components/ContactPopup.tsx` and `src/components/ActivityRequestForm.tsx`: form fields and buttons → kit
- [ ] T027 [P] [US1] `src/app/treks/TreksPageClient.tsx`: search and filters → `Input`/`Select`, filter chips keep `rounded-full` pills with the shared focus ring, reset → `Button variant="ghost"`
- [ ] T028 [P] [US1] `src/app/destinations/DestinationsPageClient.tsx` and `src/app/faq/FAQPageClient.tsx`: inputs and buttons → kit
- [ ] T029 [US1] `src/app/treks/[id]/TrekDetailClient.tsx`: booking form fields → kit; action buttons (book, enquire, WhatsApp, load more) → `Button`/`buttonVariants`; tabs and gallery thumbs stay custom with tokens; status and difficulty pills → `Badge` where they are statuses
- [ ] T030 [US1] `src/app/courses/[course]/CourseDetailClient.tsx`: booking form fields and action buttons → kit, same rules as T029
- [ ] T031 [P] [US1] `src/components/CampingSection.tsx`, `src/components/VideoShowcase.tsx`, `src/components/CallToActionV2.tsx`, `src/components/SeasonSplitHero.tsx`, `src/components/FAQV2.tsx`, `src/components/TermsConditions.tsx`: action buttons and links-as-buttons → `Button`/`buttonVariants`
- [ ] T032 [P] [US1] `src/components/FooterV2.tsx` (newsletter field and button), `src/components/CurrencySwitcher.tsx` (`Select`), `src/components/DesktopSearch.tsx` and `src/components/MobileSearchButton.tsx` (`Input`)
- [ ] T033 [US1] `src/components/Navbar.tsx`: "Sign up" → `Button` (`rounded-xl`, primary); nav items keep their pill hover; account menu items use the shared focus ring
- [ ] T034 [P] [US1] `src/components/PaymentChoice.tsx`, `src/app/checkout/CheckoutClient.tsx`, `src/components/checkout/*`: remaining hand-styled inputs and buttons → kit (most already use it)

### Admin family

- [ ] T035 [P] [US1] `src/app/admin/bookings/BookingsAdminClient.tsx`, `src/app/admin/payments/PaymentsAdminClient.tsx`, `src/app/admin/customers/CustomersAdminClient.tsx`, `src/app/admin/activity/AdminActivityClient.tsx`: filter inputs/selects → `Input`/`Select`, raw buttons → `Button`

### Shape

- [ ] T036 [US1] Sweep every file touched above (and `src/components/**`) for `rounded-lg`/`rounded-full` on action buttons and `rounded-xl`/`rounded-3xl` on surfaces; bring them to the shape rule

**Checkpoint**: V1 colour greps print nothing; every family uses the kit (V5).

---

## Phase 4: User Story 2 — Modern, layout-true loading states (Priority: P2)

**Goal**: every waiting area shows a placeholder shaped like its content; spinners only inside busy controls; no layout jumps.

**Independent Test**: [quickstart](./quickstart.md) V6 (Slow 4G pass over dashboard, checkout, admin lists, a photo-heavy trek page) and the `Loading…` / `.skeleton` / `animate-spin` greps in V1.

- [ ] T037 [US2] `src/app/dashboard/page.tsx`: replace the 4 "Loading…" texts with layout-true `Skeleton` blocks (booking rows, payment rows, profile fields), each region `aria-busy` with an `sr-only` label
- [ ] T038 [P] [US2] `src/components/ActivityRequestForm.tsx`: replace "Loading…" with a `Skeleton` shaped like the form
- [ ] T039 [P] [US2] `src/components/admin/ActivityFeed.tsx`: "Load older activity" → `Button loading={loadingMore}`; refresh icon spin → `Button loading`
- [ ] T040 [P] [US2] `src/app/admin/bookings/BookingsAdminClient.tsx`, `src/app/admin/payments/PaymentsAdminClient.tsx`, `src/app/admin/customers/CustomersAdminClient.tsx`: refresh buttons use `Button loading` instead of a hand-spun icon; table skeletons match the row layout
- [ ] T041 [P] [US2] `src/app/checkout/CheckoutClient.tsx`: the pay button uses `Button loading` (drop the inline `Loader2`); `src/components/checkout/PaymentStatus.tsx` uses `Spinner` (documented in `audit.md` as the continuing state of the Pay action)
- [ ] T042 [P] [US2] `src/app/treks/[id]/TrekDetailClient.tsx`: the inline SVG spinner → `Button loading`
- [X] T043 [US2] `src/components/SmartImage.tsx`: render the `<img>` visible from the first paint over a `Skeleton` underlay in its reserved box; no `opacity-0` gate (R8)
- [ ] T044 [P] [US2] `src/app/page.tsx` (FAQV2 `dynamic` loading) and `src/app/courses/[course]/CourseDetailClient.tsx` (video tile): `.skeleton` spans → `Skeleton`
- [ ] T045 [US2] Remove the `.skeleton` class and its keyframes from `src/app/globals.css` once T043–T044 land

**Checkpoint**: V1 loading greps print nothing; V6 passes.

---

## Phase 5: User Story 3 — Silky-smooth, interruptible motion (Priority: P3)

**Goal**: content visible on first view; one motion scale; every overlay interruptible and consistent.

**Independent Test**: [quickstart](./quickstart.md) V4 (first view with JavaScript off, layout shift, largest paint) and V7 (rapid open/close, reduced motion).

### First view

- [X] T046 [US3] Remove `<Preloader />` from `src/app/layout.tsx` and delete `src/components/Preloader.tsx` (R9)
- [X] T047 [US3] Rewrite the reveal components in `src/components/MotionWrapper.tsx` (`FadeUp`, `FadeLeft`, `FadeRight`, `ScaleIn`, `SlideUp`, `SlideIn`, `StaggerContainer`/`StaggerItem`, and the rest) so they render visible in the static HTML: after mount, only elements below the viewport are hidden (instantly) and then revealed on scroll-in with `transition("slow")`; elements already in view never animate; reduced motion renders static. Keep every export and prop so the ~15 callers don't change
- [ ] T048 [P] [US3] Remove first-paint `initial={{ opacity: 0 … }}` entrances on page heroes and sections in `src/app/contact/ContactPageClient.tsx`, `src/app/faq/FAQPageClient.tsx`, `src/app/cancellation-policy/CancellationPolicyPageClient.tsx`, `src/app/destinations/DestinationsPageClient.tsx`, `src/app/activities/ActivitiesPageClient.tsx` (also drop its `useReveal`), `src/app/courses/CoursesPageClient.tsx` and `src/app/courses/[course]/CourseDetailClient.tsx`; scroll-ins use the `MotionWrapper` reveals instead of raw `whileInView`
- [ ] T049 [P] [US3] Same for `src/app/treks/[id]/TrekDetailClient.tsx`, `src/components/FooterV2.tsx`, `src/components/HimalayanMap.tsx`, `src/components/FAQV2.tsx` and `src/components/WallpaperCarousel.tsx` (first slide visible in the HTML)

### Overlays → Dialog / Sheet

- [ ] T050 [US3] `src/components/QuickInfoModal.tsx` → `Dialog` (bottom-aligned on phones, centred above `sm`)
- [ ] T051 [P] [US3] `src/components/LegacyDataNotice.tsx` → `Dialog tone="dark"`
- [ ] T052 [P] [US3] `src/components/VideoShowcase.tsx` and `src/components/CampingSection.tsx` video/photo modals → `Dialog size="full" tone="dark"`
- [ ] T053 [P] [US3] Trek gallery lightbox in `src/app/treks/[id]/TrekDetailClient.tsx` and course lightbox in `src/app/courses/[course]/CourseDetailClient.tsx` → `Dialog size="full" tone="dark"` (keep arrow-key and swipe navigation)
- [ ] T054 [P] [US3] `src/components/ContactPopup.tsx` → `Dialog`
- [ ] T055 [P] [US3] Admin history drawer in `src/app/admin/bookings/BookingsAdminClient.tsx` → `Sheet side="right"`
- [ ] T056 [US3] Mobile nav drawer in `src/components/Navbar.tsx` → `Sheet side="right" tone="dark"` (keep swipe-to-close and the drawer contents); `src/components/MobileSearchButton.tsx` panel → `Sheet side="bottom"`

### Motion tokens

- [ ] T057 [US3] `src/components/Navbar.tsx`: menus and dropdowns use `transition("base")` / `EASE.out` from `src/lib/motion.ts` (replace the local `EASE` constant)
- [ ] T058 [P] [US3] `src/app/template.tsx` page fade → `transition("slow")`; `src/components/WallpaperCarousel.tsx` and `src/components/SeasonSplitHero.tsx` keep their long ambient crossfades but take easing from `EASE`
- [ ] T059 [US3] Sweep `src/**/*.tsx` for inline `duration:` / `ease: [` in framer-motion props and Tailwind `duration-500/700/1000` on interactive elements; move them to the tokens (ambient slideshow and Ken Burns timing excepted, per [contracts/motion.md](./contracts/motion.md))

**Checkpoint**: V4 with JavaScript disabled shows all content and photos; V7 passes, including reduced motion.

---

## Phase 6: User Story 4 — Best version of every page (Priority: P4)

**Goal**: finished typography, spacing, empty and error states, focus and responsive layout on every page.

**Independent Test**: [quickstart](./quickstart.md) V5 (360/768/1280/1920px, no sideways scroll) and V8 (focus, contrast, touch targets).

- [X] T060 [US4] Remove Poppins from `src/app/layout.tsx` (font import, variable and `className`) and any `--font-poppins` reference in `src/app/globals.css` (R12)
- [ ] T061 [P] [US4] `src/components/WhatsAppFallback.tsx`: restyle on the `EmptyState` layout (amber tone, primary "Send these details on WhatsApp" via `buttonVariants`); same props
- [ ] T062 [P] [US4] Empty states → `EmptyState`: no bookings / no payments in `src/app/dashboard/page.tsx`, no results in `src/app/treks/TreksPageClient.tsx`, empty tables in the admin clients
- [ ] T063 [P] [US4] `src/components/NoPhoto.tsx`: align with the `EmptyState` look (same icon square and muted text)
- [ ] T064 [US4] Section heading scale: section `h2` → `text-3xl sm:text-4xl font-bold tracking-[-0.02em]`, card titles `text-lg font-semibold`, across the home sections (`src/components/*V2.tsx`, `WhyTrekWithUs`, `HowItWorks`, `SnowSchool`, `SummerTreksRail`, `StoriesTestimonials`, `HimalayanMap`, `UnlockRestrictedUttarakhand`, `CampingSection`, `VideoShowcase`, `FindYourTrek`) and page clients; keep each heading's words unchanged
- [ ] T065 [US4] Spacing: sections use `py-section` / `py-section-sm`, containers `max-w-7xl px-4 sm:px-6 lg:px-8`, cards `p-5 sm:p-6`, across the same files
- [ ] T066 [US4] Responsive pass at 320, 360, 768, 1280, 1920px with the headless-Edge script: fix any sideways scroll, overlap or sub-44px touch target, page by page; log each fix in `audit.md`

**Checkpoint**: V5 and V8 pass for every family.

---

## Phase 7: Polish and verification

- [ ] T067 Run the V1 grep audits; resolve or document every hit in `audit.md`
- [ ] T068 Run `npx tsc --noEmit`, `npm run lint` (0 errors) and `npm test`
- [ ] T069 Build the changed site in the isolated copy and run the V3 text diff against `out-baseline/` (visible text, `href`s, headings, JSON-LD per page): no differences
- [ ] T070 Run V4 (layout shift, largest paint, JavaScript-off first view) and V5/V7 screenshots in headless Edge; record the results in the Results table of `quickstart.md`
- [ ] T071 Set every `audit.md` row to `verified`, or `deferred` with a reason for the owner (V10)
- [ ] T072 [P] Update `CHANGELOG.md` and `TODO.md` (owner rule), and `CLAUDE.md` (kit list, Preloader gone, Poppins gone, motion tokens, `DarkScope`)

---

## Dependencies and execution order

### Phase dependencies

- **Setup (Phase 1)**: none. T001 must finish before any source file changes.
- **Foundational (Phase 2)**: depends on T002. Blocks every story.
- **US1–US4 (Phases 3–6)**: each depends only on Phase 2. They touch many of the same files, so with one developer run them in priority order (P1 → P4).
- **Polish (Phase 7)**: after the stories you want to ship.

### Story dependencies

- **US1 (P1)**: needs the kit (T006–T014).
- **US2 (P2)**: needs `Skeleton` (T010) and `Button loading` (T007). Independent of US1, but shares files with it (dashboard, admin, checkout).
- **US3 (P3)**: needs `motion.ts` (T005) and Dialog/Sheet (T012–T013).
- **US4 (P4)**: needs `EmptyState` (T011). Best done last, because it reviews pages the other stories changed.

### Within each story

- Kit or token first, then the pages that use it.
- One file at a time for the large clients (`TrekDetailClient`, `CourseDetailClient`, `dashboard/page.tsx`, `Navbar`): their tasks are sequential across stories.

### Parallel opportunities

- Phase 2: T005, T006, T008, T009, T011, T014 in parallel; then T007, T010, T012, T013.
- US1: the colour tasks T016–T019 in parallel; the form tasks T021, T022, T024–T028, T031, T032, T034, T035 in parallel.
- US2: T038–T042 and T044 in parallel.
- US3: T048–T049 and T051–T055 in parallel.
- US4: T061–T063 in parallel.

## Parallel example: User Story 1

```text
Task: "T016 Replace cyan-* with brand colours in CoursesPageClient, CourseDetailClient, ActivitiesPageClient"
Task: "T017 Replace hex classes with navy tokens in Navbar.tsx"
Task: "T018 Replace hex classes with tokens in FooterV2, TrekHub, WallpaperCarousel, …"
Task: "T019 Replace hex classes with tokens in CancellationPolicy, FAQ, Courses page clients"
```

## Implementation strategy

### MVP first (User Story 1)

1. Phase 1: baseline build, dependency, audit.
2. Phase 2: tokens, motion module, kit.
3. Phase 3 (US1): brand colours and the kit on every page.
4. **Stop and check:** V1 colour greps, V2 build gates, V3 text diff, V5 screenshots. This alone gives a visibly unified site.

### Incremental delivery

1. Setup + Foundational → kit ready.
2. US1 → one coherent brand (MVP).
3. US2 → modern loading.
4. US3 → first view and smooth motion.
5. US4 → per-page polish.
6. Each step is checked with tsc, lint and the V3 text diff before the next, so content and search text never regress.

## Notes

- `[P]` tasks touch different files and have no unfinished dependencies.
- Don't run `npm run build` in `adventure-travel/` while the dev server runs; use the isolated copy.
- Log each change in `CHANGELOG.md` and `TODO.md` as it lands (owner rule in `CLAUDE.md`).
