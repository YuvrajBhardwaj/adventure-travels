# Implementation Plan: Site-wide UI Consistency and Polish

**Branch**: `002-ui-polish-consistency` (work lands on `preview/trek-slideshows`, as with the other work in progress) | **Date**: 2026-10-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-ui-polish-consistency/spec.md`

## Summary

Make every page of the Himalayan Arc Adventure site look and move like one product, without touching the brand colours, the content or the booking flows.

The approach extends what is already in the repo:
1. **Component kit:** the shadcn-style kit in `src/components/ui/` becomes the only component system. Add `input`, `textarea`, `label`, a styled native `select` and `checkbox`, `spinner`, `empty-state`, and `dialog`/`sheet` on `@radix-ui/react-dialog`. Extend `button` (loading state) and `skeleton` (transform-only shimmer with a 150ms show delay). Then migrate the hand-styled controls and 7 hand-built overlays to the kit.
2. **Tokens:** name the navy shades that are hard-coded today, map the off-palette cyan to the brand's sky/emerald, and introduce one motion scale (3 durations, 2 easings, 1 spring) in `src/lib/motion.ts` plus mirrored CSS variables.
3. **First view:** remove the blocking `Preloader` and make `SmartImage` and the home sections visible in the static HTML, so nothing waits for JavaScript.
4. **Page families:** account pages keep their navy background but render the kit's dark variant through a forced `.dark` scope. Checkout and admin keep `ThemeScope`; marketing and detail pages use the light variant.
5. **Audit:** a page-by-page `audit.md` (FR-001) drives the work. The [quickstart](./quickstart.md) checks prove each item.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19, Next.js 16 App Router with `output: "export"` (static HTML; no runtime server).

**Primary Dependencies**: Tailwind CSS v4 (theme in `globals.css`), `class-variance-authority`, `tailwind-merge`, `clsx`, `lucide-react`, framer-motion 12, all already installed. **New:** `@radix-ui/react-dialog`, the only addition ([research R2](./research.md#r2-dialogs-and-sheets-radix-dialog-plus-framer-motion)).

**Storage**: N/A (presentation only; Supabase data access is untouched).

**Testing**: no UI test framework, and none is added. The gates are:
- `tsc --noEmit`, `eslint` and the existing Vitest suite
- grep audits and a static-HTML text diff
- headless-Edge metrics and screenshots via the DevTools protocol ([quickstart](./quickstart.md)).

**Target Platform**: modern mobile and desktop browsers, 320–1920px wide. The baseline device is a mid-range Android phone on 4G.

**Project Type**: web application (a static front end with serverless API functions, which this feature doesn't touch).

**Performance Goals**: layout shift below 0.1; largest paint within 2.5s on `/` and trek pages (4G, 4× CPU); interactions at a steady 55 fps or better on a mid-range phone.

**Constraints**:
- Brand palette unchanged.
- Content, copy, URLs and search-visible HTML unchanged (FR-002).
- Static export: every panel and section stays in the exported HTML. Radix is used only where content needn't be indexed (overlays).
- Never `npm run build` while `npm run dev` runs; build an isolated copy.
- Reduced-motion and WCAG 2.2 AA throughout.

**Scale/Scope**: about 25 routes in 4 page families, about 44 components in `src/components`, 103 raw buttons to review, 7 overlays, 6 text loaders, and 18 home-page sections.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unratified template, so formally the result is **PASS (vacuous)**. In its place, this plan holds itself to the spec's non-negotiables, the same approach `specs/001` took:

| Interim guardrail | Source | Pre-design | Post-design |
|---|---|---|---|
| Brand colours unchanged; no new colours | FR-003, FR-004 | ✅ R5: only name existing hex values; cyan maps to sky/emerald | ✅ data-model palette table; V1 hex/cyan audits |
| No content, URL or SEO regression | FR-002 | ✅ R3: tabs stay custom (all panels in HTML); R4: native selects | ✅ V3 static-HTML text diff |
| Nothing hides content on first view | FR-016 | ✅ R8 (`SmartImage`), R9 (Preloader removed) | ✅ motion contract rule 5; V4 with JavaScript disabled |
| One component system (no second design system) | FR-005 | ✅ R1: extend the existing kit; only `@radix-ui/react-dialog` added | ✅ contracts/components.md |
| Reduced motion and WCAG 2.2 AA | FR-020, FR-024 | ✅ R10 | ✅ motion contract rule 4; V7, V8 |

**Result**: PASS before and after design. No violations, so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-polish-consistency/
├── spec.md              # /speckit-specify
├── plan.md              # this file
├── research.md          # Phase 0: decisions R1–R14 with the baseline survey
├── data-model.md        # Phase 1: palette, design scale, components, page families, audit item
├── quickstart.md        # Phase 1: validation V1–V10
├── contracts/
│   ├── components.md    # the UI kit interface (Button … Sheet, EmptyState, scopes)
│   └── motion.md        # duration/easing/spring tokens and motion rules
├── checklists/
│   └── requirements.md  # spec quality checklist
├── audit.md             # created by the first task: the FR-001 page-by-page audit
└── tasks.md             # /speckit-tasks (not created here)
```

### Source Code (repository root)

```text
adventure-travel/
├── package.json                         # + @radix-ui/react-dialog
├── src/
│   ├── app/
│   │   ├── globals.css                  # + navy tokens, motion CSS variables, shimmer keyframes; − .skeleton class
│   │   ├── layout.tsx                   # − <Preloader />, − Poppins
│   │   ├── template.tsx                 # page fade uses motion tokens
│   │   ├── login/ signup/ reset-password/ dashboard/   # wrapped in DarkScope; kit inputs, buttons, skeletons, empty states
│   │   ├── checkout/CheckoutClient.tsx  # kit only (already mostly)
│   │   ├── admin/*                      # kit only; history drawer → Sheet
│   │   ├── treks/ courses/ activities/ contact/ faq/ destinations/ cancellation-policy/ page.tsx (home)
│   │   │                                # migrate hand-styled controls; cyan → brand; hex → tokens
│   ├── components/
│   │   ├── ui/                          # button (+loading), skeleton (shimmer), + input, textarea, label,
│   │   │                                #   select, checkbox, spinner, dialog, sheet, empty-state, dark-scope
│   │   ├── Preloader.tsx                # deleted
│   │   ├── SmartImage.tsx               # visible on first paint, reserved space
│   │   ├── QuickInfoModal.tsx, LegacyDataNotice.tsx, VideoShowcase.tsx, CampingSection.tsx  # → Dialog
│   │   ├── Navbar.tsx                   # mobile drawer → Sheet; Sign up → Button; motion tokens
│   │   ├── WhatsAppFallback.tsx         # restyled on EmptyState layout
│   │   └── (home sections)              # no opacity:0 first paint
│   └── lib/
│       └── motion.ts                    # new: DURATION, EASE, SPRING, transition()
```

**Structure Decision**: a single Next.js app (`adventure-travel/`). Shared presentation lives in `src/components/ui/` (the kit) and `src/lib/motion.ts`; pages and section components consume them. No new folders outside these, and no changes to `api/`, `src/data/` or the SQL files.

## Implementation order (for `/speckit-tasks`)

The stories in the spec map to these phases. Each phase can ship on its own.

1. **Foundation:**
   - write `audit.md` (FR-001)
   - add the tokens (navy names, motion CSS variables, shimmer) and `src/lib/motion.ts`
   - build the kit additions (input, textarea, label, select, checkbox, spinner, empty-state, dialog, sheet, dark-scope) and extend button and skeleton
   - add `@radix-ui/react-dialog`.
2. **US1, one coherent brand (P1):**
   - colour fixes (cyan, hex) across files
   - migrate hand-styled buttons, inputs and selects family by family: account, then checkout and admin, then marketing, then detail
   - apply `DarkScope` to the account pages.
3. **US2, loading states (P2):**
   - replace the 6 text loaders and ad-hoc spinners with layout-true skeletons and `Button loading`
   - `SmartImage` reserves space and shows on first paint
   - remove `.skeleton`.
4. **US3, motion and first view (P3):**
   - remove the Preloader and the `opacity:0` first paint in home sections
   - move the 7 overlays onto Dialog and Sheet
   - put every framer-motion and Tailwind transition on the tokens
   - pass the reduced-motion check.
5. **US4, best version of every page (P4):**
   - typography scale, spacing rhythm, empty states, focus states, 320–1920px fixes per page
   - remove Poppins.
6. **Verify:** run quickstart V1–V10 and close `audit.md`, then update `CHANGELOG.md` and `TODO.md`.

## Complexity Tracking

No constitution violations to justify. The one new dependency (`@radix-ui/react-dialog`) is recorded and justified in [research R2](./research.md#r2-dialogs-and-sheets-radix-dialog-plus-framer-motion).
