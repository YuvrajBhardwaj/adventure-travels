# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This folder is the git root. The product is a Next.js site in **`adventure-travel/`**; run every npm command from there.

Also at the root:
- **`CHANGELOG.md`, `TODO.md`:** how the owner tracks the project (see below).
- **`specs/001-persistent-backend/`:** the Spec Kit design docs for the backend: spec, plan, data model, API contracts, quickstart with validation scenarios V1–V22. Code comments cite their requirement ids (`FR-016`, research `R5`, …).
- **`.mcp.json`:** a Supabase MCP server for project `sdhtgmlkzcknmeakxgdz` (it needs `/mcp` sign-in).
- **OpenCode scaffold:** `opencode.json`, `.opencode/`, `.agents/skills/`, `skills-lock.json`. Not part of the app.
- **Reference material:** `REFERENCE_SITE.md`, `reference-*.png`, `screenshot.js` (the original visual reference) and `graphify-out/`.
- **Git-ignored, never edit or commit:**
  - root-level `*.html`, `_next/` and route folders: stale static-export output
  - `.claude/` and `.specify/`: tooling
  - `/media-originals/`: full-resolution photo originals.

## Keep CHANGELOG.md and TODO.md current

The owner tracks the project through two root files. With every change, in the same piece of work:
- Add an entry to [`CHANGELOG.md`](CHANGELOG.md) under **[Unreleased]**: the date, where the change lives (branch + commit, or "uncommitted"), and what changed for visitors, the business and the backend. Mark backend work **Backend**, and update the **Backend tracker** tables (migrations, API functions, env vars, testing status) when they change.
- Update [`TODO.md`](TODO.md): tick off what's done, and add new open items or decisions the owner needs to make.

## Commands (run from `adventure-travel/`)

```bash
npm run dev                  # next dev on http://localhost:3000 (does NOT serve api/*.js — they 404)
npm run dev:api              # with `npm run dev` running: also serves api/*.js, at http://localhost:3100 (no Vercel login; bookings are saved to the Supabase project in .env.local)
npx vercel dev               # dev server that also runs the api/ functions
npm run lint                 # eslint
npx tsc --noEmit             # type-check
npm test                     # vitest: api/_lib/__tests__ and src/lib/__tests__
npx vitest run src/lib/__tests__/season.test.ts   # one test file
npx vitest run -t "orderAmount"                    # tests matching a name
npm run build                # static export to out/
npm run catalog              # after editing prices in src/data: regenerates api/_lib/catalog.js + courseCatalog.js
node scripts/prepare-photos.mjs [--check]    # after adding/replacing photos (see Images)
node scripts/setup-backend.mjs [--dry-run]   # Supabase migrations + auth config + keys (reads .env.setup)
```

- **Builds:** never run `npm run build` while `npm run dev` is running; they share `.next/` and break the dev server. Verify with `tsc` + `lint` instead, or build a copy of the app in another folder.
- **Production builds:** `next.config.ts` throws on a Vercel production build (`VERCEL_ENV=production`) without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Env files:** `.env.local` holds the keys and `.env.setup` the setup-script inputs. Both are git-ignored (the GitHub repo is public); `.env.example` documents every variable. Restart the dev server after `.env.local` changes.
- **Deploys:** Vercel Git integration. `main` is production (www.himalayanarcadventure.com, domain at GoDaddy with DNS pointing to Vercel); other branches get preview deployments.

## Stack

Next.js 16 App Router with **`output: "export"`** (fully static: no runtime server, no `headers()` or middleware, `images.unoptimized`) · React 19 · TypeScript (strict) · Tailwind CSS v4 · framer-motion (+ gsap) · Supabase (Auth + Postgres) · Vercel Node functions + Cron · Razorpay · nodemailer.

- **Tailwind:** v4 has no `tailwind.config`. The theme is the `@theme inline { … }` block in `src/app/globals.css`.
- **Fonts:** headings and nav use Space Grotesk (theme tokens plus an `h1–h6` base style), body text Inter, display Fraunces.
- **Path alias:** `@/*` → `src/*`.

## Architecture

### Pages: server shell, client UI
- **Typical route:** a server `page.tsx` exports metadata (via `pageMetadata()`) and JSON-LD, then renders a `*Client.tsx` with the interactive UI.
- **Client pages:** home, `/login`, `/signup`, `/dashboard` and `/reset-password` are `"use client"` pages. The account pages get their metadata (noindex, canonical) from a sibling `layout.tsx`.
- **Detail routes** (`/treks/[id]`, `/courses/[course]`) use `generateStaticParams` and resolve by **slug, not id**.
- **Hub pages** (`/treks-from-joshimath`, `/winter-treks-uttarakhand`) are fully server-rendered through `src/components/TrekHub.tsx`.
- **Content must be in the exported HTML.** This was learned the hard way; search engines index only that HTML:
  - no `useSearchParams` Suspense bail-out (read the query string in an effect after mount)
  - tab panels stay mounted and are toggled with `hidden`, not rendered conditionally
  - no `opacity:0` first paint, and no `loading.tsx` (in the static export it moves page content into a hidden streamed block).

### Content: `src/data/` is the single source of truth
- **Files:** `treks.ts` (the `Trek` interface, `treks[]`, helpers such as `priceRoute()`, `pricePerPerson()`, `slugify()`), `courses.ts`, `destinations.ts`, `stories.ts`, and `trekPackage.ts` (inclusions and exclusions derived from each trek's data).
- **Pickup town:** `startsFrom` drives the "Joshimath to Joshimath" price label, the inclusions text and the hub membership.
- **Room tiers:** with `roomSharing` tiers, the first tier's price must equal `price` (`npm run catalog` enforces it).
- **Prices:** the API charges from the generated catalog, so re-run `npm run catalog` after any price change.
- **Altitudes:** keep `elevationProfile`, itinerary altitudes and `maxAltitude` consistent; several UI pieces chart them.

### Backend: Supabase + Vercel functions (`api/`)
- **Where code runs:** RLS is the only access authority. Anything needing a secret or trust runs in Vercel Node functions in `adventure-travel/api/` (CommonJS). Shared code lives in `api/_lib/`, which isn't deployed as functions; keep the total at 8 functions or fewer (Vercel Hobby allows 12).
- **`api/bookings.js`** creates trek and course bookings and locks the price in **integer paise** from the catalog. The browser never sends an amount.
- **`api/account.js`** handles `claim` (course bookings made while signed out, matched on a verified email) and `delete` (anonymises the account; payments are kept).
- **`api/cron.js`** runs daily (`vercel.json`): balance reminders, email retries, overdue count.
- **Payments:** `create-order` (`advance` = 30%, `balance`, `full`; the rules are in `api/_lib/pricing.js` `orderAmount()`), `verify-payment` and `razorpay-webhook` all apply payments through the `apply_payment()` database function, which is exactly-once.
- **Emails** go through the `notifications` outbox (`api/_lib/notify.js`), always **after** the database write; a failed email never undoes a booking.
- **Database:** SQL files in `adventure-travel/`, run in this order: `supabase-schema.sql`, `supabase-activity-payments.sql`, `supabase-backend.sql`, `supabase-room-sharing.sql`, `supabase-payments-v2.sql`. All are idempotent. Triggers guard the money columns and audit status changes into `booking_status_events`.
- **Browser side:**
  - `src/lib/auth.ts` throws `BackendUnavailableError` when Supabase isn't configured; forms then show `WhatsAppFallback`, never a fake success
  - `src/lib/admin.ts` powers `/admin/*` (bookings, customers, payments, activity) behind `AdminGate`, for users with `app_metadata.role = "admin"`
  - `src/lib/paymentRules.ts` mirrors the server's money rules, for display only.

### SEO and sharing
- **Metadata helpers** in `src/lib/seo.ts`: `pageMetadata()`, `fitTitle()` (60 characters max), `fitDescription()` (160 max), `absoluteUrl()`, `ORGANIZATION_ID`. Structured data lives in the server `page.tsx` files.
- **Structured data facts** come only from `src/data`: no invented ratings, review counts or claims.
- **Link previews:** `src/lib/shareImage.ts` uses `public/og/<slug>.jpg` (and `course-<slug>.jpg`) when it exists, otherwise the `/social-share.png` route.
- **`sitemap.ts`** includes an image sitemap. **`robots.ts`** blocks AI training crawlers and `/dashboard`, `/checkout` and `/admin`; the account pages stay crawlable so Google can see their noindex.
- **Audit and plan:** `adventure-travel/docs/seo/2026-10-19-audit-and-plan.md`.

### Images
- **Our own photos** live in `public/assets/<trek>/`. They are served web-sized (1600px max), watermarked and metadata-free; `scripts/prepare-photos.mjs` builds them from the originals in `/media-originals/`. The same script builds the `public/og/` share images.
- **Never put full-resolution originals in `public/`.**
- **Image tags:** use plain `<img>` or `SmartImage`, not `next/image`.
- **Missing photos:** treks without a photo render `NoPhoto`; don't add stock photos to new treks. Some older treks still use Unsplash covers.

### Design system
`globals.css` defines the visual language; prefer its tokens and utilities to ad-hoc values:
- **Colour tokens:** `primary` `#10B981` (emerald), `accent` `#F59E0B`, `secondary` `#0EA5E9`, `cta` `#F97316`, plus `background`, `foreground`, `card`, `muted` and `surface`.
- **Utilities:** `glass*`, `text-gradient*`, `bg-gradient-*`, `py-section*`, `text-display-*`, and many `animate-*` keyframes.
- **Dark site chrome:** the `navy` / `navy-deep` / `navy-hero` tokens (`#0F172A` / `#0B1222` / `#0B1D33`). No hex colours or `cyan-*` in class names.
- **Dark mode** exists inside `ThemeScope` (admin and checkout, visitor toggle) and `DarkScope` (account pages, forced). Elsewhere `dark:` variants are inert.
- **UI kit** in `src/components/ui/` (shadcn-style, cva + `cn()`): `button` (variants `default|outline|ghost|destructive|link`, `loading`; use `buttonVariants` for links styled as buttons), `input`, `textarea`, `label`, `select` (native), `checkbox`, `card`, `badge`, `skeleton`, `spinner`, `empty-state`, `dialog` and `sheet` (Radix + framer-motion), `avatar`, `theme-scope`, `dark-scope`. Use these instead of hand-styled controls: controls `rounded-xl`, surfaces `rounded-2xl`, pills `rounded-full`.
- **Loading:** layout-true `<Skeleton>` shapes (never "Loading…" text); a spinner only inside a busy control (`Button loading`). Nothing may hide content on first paint (no full-screen overlay, no `opacity:0` entrance for content in the static HTML).
- **Motion tokens:** `src/lib/motion.ts` (`DURATION`, `EASE`, `SPRING`, `transition()`); Tailwind `ease-out` and `ease-in-out` use the same curves. Spec and audit: `specs/002-ui-polish-consistency/`.

### Animation
- Default to inline framer-motion inside the component, **always gated on `useReducedMotion()`**, with values from `src/lib/motion.ts`.
- `src/components/MotionWrapper.tsx` has the scroll-in reveals (`FadeUp`, `ScaleIn`, `StaggerContainer`/`StaggerItem`). They render visible in the static HTML and only hide content that starts below the fold. Reuse them.
- `src/hooks/useReveal.ts` and the `reveal-*` CSS classes are legacy, barely used.

### Conventions
- **Enquiries** go through WhatsApp deep links (`wa.me/917817912062`).
- **Naming:** newer sections use a `V2` suffix (`HeroV2`, `PopularTreksV2`, …).
- **Deliberate shortcuts** are marked `// ponytail:`.

## Brand
"Himalayan Arc Adventure" runs guided Himalayan treks in Uttarakhand and Himachal Pradesh from a base in Joshimath (Chamoli), plus a ski and snowboard school in Auli. Prices are in INR (charged in INR; display can be converted to the visitor's currency). Copy targets an Indian audience (`en_IN`).
