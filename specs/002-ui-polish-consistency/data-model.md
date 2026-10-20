# Data Model: Site-wide UI Consistency and Polish

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md) | **Date**: 2026-10-21

This feature has no database or API data. Its "entities" are the design decisions every page must share, plus the audit that tracks the work. They live in code as theme tokens (`src/app/globals.css`), the motion module (`src/lib/motion.ts`), the component kit (`src/components/ui/`) and one tracking document (`audit.md` in this folder).

## Brand palette (theme tokens, `@theme inline` in `globals.css`)

| Token | Value | Use | Status |
|---|---|---|---|
| `primary` | `#10B981` | main actions, links, active states, success | existing, unchanged |
| `accent` | `#F59E0B` | ratings, highlights, warnings | existing, unchanged |
| `secondary` | `#0EA5E9` | informational accents (replaces the off-palette cyan) | existing, unchanged |
| `cta` | `#F97316` | high-urgency calls to action | existing, unchanged |
| `background`, `foreground`, `card`, `muted`, `surface` | `#F8FAFC`, `#0F172A`, `#FFFFFF`, `#64748B`, `#F1F5F9` | neutrals | existing, unchanged |
| `navy` | `#0F172A` | navbar and footer chrome, dark account pages, dark heroes | **named** (was hard-coded) |
| `navy-deep` | `#0B1222` | menus, drawers, deep panels; also replaces `#020617` and `#0b0f17` | **named** (was hard-coded) |
| `navy-hero` | `#0B1D33` | courses hero gradient | **named** (was hard-coded) |
| Difficulty colours | `DIFFICULTY_COLORS` in `src/data/treks.ts` | difficulty dots and badges | existing, unchanged |
| Neutrals | Tailwind `slate-*`, `white/…` alpha steps | text, borders, dark-surface fills | existing |

**Rules**
- No class may contain a hex colour (`bg-[#…]`, `text-[#…]`, `from-[#…]`, `to-[#…]`).
- No `cyan-*`, or any other colour family outside this table.
- Light versus dark comes from the `dark:` variant, not from separate colours.

## Design scale

| Scale | Steps | Rule |
|---|---|---|
| Corner radius | controls `rounded-xl` · surfaces `rounded-2xl` · pills `rounded-full` | one rule per element type ([research R6](./research.md#r6-shape-rule-corner-radius)) |
| Type | page h1 `text-display-*` · section h2 `text-3xl sm:text-4xl font-bold tracking-[-0.02em]` · card title `text-lg font-semibold` · body `text-base` · muted `text-sm text-muted` · label `text-xs font-semibold` (sentence case) | headings in Space Grotesk, body in Inter |
| Spacing | sections `py-section` / `py-section-sm` · container `max-w-7xl px-4 sm:px-6 lg:px-8` · card padding `p-5 sm:p-6` · stack gaps 2 / 3 / 4 / 6 / 8 | existing utilities, applied everywhere |
| Elevation | `shadow-sm` (cards) · `shadow-lg` (raised cards on hover) · overlay `shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75)]` | either a border or a shadow per surface, never a heavy shadow under a border |
| Motion | durations fast / base / slow · easings out / inOut · sheet spring | [contracts/motion.md](./contracts/motion.md) |

## Component (kit entry, `src/components/ui/`)

| Field | Meaning |
|---|---|
| Name | e.g. `Button`, `Input`, `Skeleton`, `Dialog`, `Sheet`, `EmptyState` |
| Roles (variants) | the visual roles allowed (e.g. Button: `default`, `outline`, `ghost`, `destructive`, `link`) |
| Sizes | the fixed size steps (e.g. Button `sm` / `default` / `lg` / `icon`) |
| States | hover, pressed, focus-visible, disabled, loading (where relevant), open/closed (overlays) |
| Surfaces | a light and a dark rendering, via `dark:` |
| Motion | the tokens it uses for each state change |

**Rule:** every page uses kit components for these element types. A hand-styled equivalent counts as an audit item. The full list, with each component's interface, is in [contracts/components.md](./contracts/components.md).

## Page family

| Field | Meaning |
|---|---|
| Name | Marketing, Detail, Account, Checkout & admin |
| Pages | the routes in the family ([research R13](./research.md#r13-page-families-and-dark-variants)) |
| Background | what stays as it is today (light, navy, or `ThemeScope`) |
| Variant | which rendering of the components it uses (light, forced dark, or toggle) |

**Rule:** a family chooses the variant, never different components.

## Audit item (`audit.md`, the FR-001 deliverable)

| Field | Values |
|---|---|
| ID | `A-001` … |
| Page or area | route or component (e.g. `/dashboard`, `Navbar`) |
| Category | colour · component · shape · typography · spacing · loading · motion · responsive · accessibility |
| Found | what is inconsistent, with file:line |
| Resolution | what it becomes (kit component, token, rule) |
| Status | `open` → `fixed` → `verified`, or `deferred` (with a reason) |

**State transitions:** `open` → `fixed` (the code change lands) → `verified` (it passes the matching [quickstart](./quickstart.md) check). `open` → `deferred` needs a written reason and owner approval (SC-009).
