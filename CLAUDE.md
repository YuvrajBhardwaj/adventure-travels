# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The repo root (`d:\opencode`) is an **OpenCode workspace scaffold** (`opencode.json`, the `@dietrichgebert/ponytail` plugin, `.agents/skills/`, `skills-lock.json`). It is **not** the application.

The actual product is a Next.js site in the **`adventure-travel/`** subdirectory. Almost all work happens there, and **all npm commands must be run from inside `adventure-travel/`**, not the repo root.

Other root-level artifacts are reference/generated material, not source to edit:
- `REFERENCE_SITE.md` + `reference-*.png` + `screenshot.js` — the site is a visual reproduction of the reference at `trekking-pied.vercel.app`; these document the target and (via Playwright) capture screenshots of it.
- `graphify-out/` — generated code-graph analysis output.

## Commands (run from `adventure-travel/`)

```bash
cd adventure-travel
npm install
npm run dev      # next dev — local dev server at http://localhost:3000
npm run build    # next build — production build + static generation
npm start        # serve the production build
npm run lint     # eslint (next/core-web-vitals + next/typescript)
npm test         # vitest — unit tests for the server money/email logic in api/_lib only
npm run catalog  # regenerate api/_lib/catalog.js + courseCatalog.js from src/data (prices the API charges)
```

`npm test` covers only `api/_lib/__tests__/` (Vitest); there are no UI tests. Verify UI changes with `npx tsc --noEmit` and `npm run lint`, and don't run `npm run build` while `npm run dev` is running (they share `.next/`).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · framer-motion (primary) + gsap · deployed on Vercel.

- **Tailwind v4 has no `tailwind.config`.** The theme lives in `src/app/globals.css` via `@import "tailwindcss"` and an `@theme inline { ... }` block.
- Path alias `@/*` → `src/*` (see `tsconfig.json`).
- `next/font/google` loads Poppins (headings) and Inter (body) in `layout.tsx`.

## Architecture

### Rendering model — nearly everything is a client component
Every section component **and every page (including the home `page.tsx`) is `"use client"`** and animates with inline framer-motion. The one meaningful server component is `src/app/treks/[id]/page.tsx`, which runs `generateStaticParams()` + a slug lookup, then delegates rendering to `TrekDetailClient.tsx`. Follow this split when adding data-driven detail pages: server component for data resolution, a `*Client.tsx` for the interactive UI.

### Backend: Supabase + Vercel functions (`api/`)
Accounts, bookings and payments live in **Supabase** (RLS is the only access authority). Anything that needs a secret or must be trusted runs in **Vercel Node functions** in `adventure-travel/api/` (CommonJS; shared code in `api/_lib/`, which isn't deployed as functions). They don't run under `next dev` — use `npx vercel dev`.
- `api/bookings.js` creates trek and course bookings and locks the price from the generated catalog (it replaced `course-bookings.js`); `api/account.js` handles `claim` and `delete` (it replaced `claim-bookings.js`); `api/cron.js` sends balance reminders and retries failed emails daily (`vercel.json`).
- Payments: `create-order` (advance / balance / full), `verify-payment` and `razorpay-webhook` all apply payments through the `apply_payment` database function, which is exactly-once.
- Emails go through the `notifications` outbox (`api/_lib/notify.js`), always **after** the database write.
- Database changes are SQL files in `adventure-travel/`, run in this order: `supabase-schema.sql`, `supabase-activity-payments.sql`, `supabase-backend.sql`, `supabase-room-sharing.sql`, `supabase-payments-v2.sql`.
- Money is integer **paise**; the browser never sends an amount. Design docs: `specs/001-persistent-backend/`.
- Admin screens are under `/admin/*` (activity, bookings, customers, payments) for accounts with `app_metadata.role = "admin"`.

### Content is the single source of truth (`src/data/`)
Site content (treks, courses, destinations) is hardcoded in TypeScript modules, not the database. Prices the API charges come from these files via `npm run catalog`.
- `treks.ts` — the `Trek` interface plus the `treks[]` array, and also exports `processSteps`, `testimonials`, `faqItems`, `stats`, `REGIONS`, `DIFFICULTIES`, `DIFFICULTY_COLORS`, and a `slugify()` helper.
- `destinations.ts`, `stories.ts` — analogous content modules.

Trek detail routes resolve by **`slug`, not `id`**. Adding a trek object to `treks[]` automatically generates its static route (`/treks/<slug>`) via `generateStaticParams`; the list page (`/treks`) filters/sorts this same array client-side (`useMemo`). Keep each trek's `elevationProfile`, `itinerary` altitudes, and `maxAltitude` internally consistent — several UI pieces chart them directly.

### Routes (`src/app/`)
`/` (home — composes ~18 section components in order) · `/treks` (filterable list) · `/treks/[id]` (SSG detail by slug) · `/destinations` · `/activities` · `/courses` · `/contact` · `/faq` · `/cancellation-policy` · account pages `/login`, `/signup`, `/reset-password`, `/dashboard`, `/checkout` · `/admin/*`.

### Design system — use the tokens and utilities, don't hardcode
`globals.css` defines the whole visual language. Prefer these over ad-hoc values:
- **Color tokens** (`@theme inline`): `primary` `#10B981` (emerald), `accent` `#F59E0B` (amber), `secondary` `#0EA5E9` (sky), `cta` `#F97316`, plus `background`/`foreground`/`card`/`muted`/`surface`. Use as Tailwind classes (`bg-primary`, `text-muted`, …).
- **Reusable utility classes** in `globals.css`: `glass` / `glass-card` / `glass-panel`, `text-gradient*`, `bg-gradient-*`, `py-section` / `py-section-sm` spacing, `text-display-xl/lg/md` typography scale, and a large set of `@keyframes` + `animate-*` helpers.
- Headings automatically use Poppins (`font-heading`); body uses Inter.

### Animation conventions
- **Default: inline framer-motion inside each component**, always gated on `useReducedMotion()` so reduced-motion users get static output (see any `V2` component or `MotionWrapper.tsx`).
- `src/components/MotionWrapper.tsx` provides shared wrappers (`FadeUp`, `SlideUp`, `StaggerContainer`/`StaggerItem`, `MagneticButton`, etc.) but is currently only used by a couple of pages — reach for it for new work instead of re-implementing.
- `src/hooks/useReveal.ts` + the `reveal-*` CSS classes are a CSS/IntersectionObserver reveal system that exists but is largely unused; framer-motion is the going-forward path.

### Conventions worth matching
- Images are plain `<img loading="lazy" decoding="async">` with Unsplash URLs — **not** `next/image** (despite `next.config.ts` allowing `images.unsplash.com`). Match the existing pattern unless deliberately migrating.
- Enquiries go through **WhatsApp deep links** (`wa.me/...`). Bookings are saved on the server, and when the backend is unavailable the forms fall back to WhatsApp (`WhatsAppFallback.tsx`) — never a fake success. `ContactPopup.tsx` holds a placeholder phone number marked `// ponytail: replace with real number`.
- Many components carry `dark:` Tailwind variants, but no dark-mode toggle/`.dark` class is wired up, so they are currently inert.
- Component naming: newer sections use a `V2` suffix (`HeroV2`, `PopularTreksV2`, `FeaturedAdventuresV2`, …).

### Brand
"Himalayan Arc Adventure" — guided Himalayan treks in Uttarakhand & Himachal Pradesh. Prices are in INR (`Rs.`); copy targets an Indian audience (`en_IN`).
