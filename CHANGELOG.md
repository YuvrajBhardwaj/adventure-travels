 ☑ 19 Oct | ☑ 19 Oct | ☑ 19 Oct | ☑ 19 Oct | ☑ 19 Oct |# Changelog

Every change to the Himalayan Arc Adventure site, newest first. Backend changes (database, API functions, environment variables) are marked **Backend** and also summarised in the [Backend tracker](#backend-tracker) at the bottom, which shows what is built, what is deployed and what still has to be set up.

**How to add an entry:** add it under [Unreleased] with the date, where the change lives (branch and commit, or "uncommitted"), and what changed for visitors, for the business and in the backend. Move entries to a dated release heading when they go live on www.himalayanarcadventure.com. Open work goes in [TODO.md](TODO.md).

## Where things stand (21 Oct 2026)

| Where | Commit | What it has |
|---|---|---|
| **Live site** (`main` on GitHub) | `a42c960` | Everything up to "three quick boxes on trek cost card" (15 Oct, `a630559`), plus the 19 Oct favicon hotfix. None of the 16 Oct work below. |
| **Preview** (`preview/trek-slideshows` on GitHub) | `9133594` | Everything pushed so far (21 Oct entries below marked "uncommitted" are not in it). **Connected to Supabase** since 21 Oct: https://adventure-travels-68r7k3o37-yuvrajbhardwaj2s-projects.vercel.app. The branch link always shows the newest build: https://adventure-travels-git-preview-581130-yuvrajbhardwaj2s-projects.vercel.app. Payments and emails still need the Razorpay and SMTP keys. |
| **Why it isn't live** | — | Vercel's Production environment still has **no environment variables**, and `next.config.ts` stops a production build without the Supabase ones. They go in at go-live, together with the merge into `main`. |
| Local `main` | `9b522d5` | Stale: everything in it is in the preview branch, and GitHub `main` has moved on to `a42c960`. Reset it to `origin/main` before the next use. |

---

## [Unreleased]

### 21 Oct 2026: **Backend** Supabase keys in Vercel Preview — no code change
- **Business:** the preview site now has working accounts and saves bookings to the database. The live site is unchanged.
- **Backend:**
  - Added to Vercel **Preview** with the logged-in Vercel CLI (no token needed): `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Config), and `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` (Sensitive). The values come from `.env.local`.
  - Production is left empty until go-live, so a stray rebuild of the old live code can't connect it to the new database.
  - Redeployed the newest preview so the keys are built in: https://adventure-travels-68r7k3o37-yuvrajbhardwaj2s-projects.vercel.app.
- **Checks:**
  - **Server functions:** `POST /api/account` answered 503 "temporarily unavailable" on the old preview and **401 "Please sign in."** on the new one. `POST /api/bookings` answered 400 "Unknown booking type." (connected, and checking the request).
  - **Browser code:** it now contains the Supabase project.
  - No test account or booking was created.

### 23 Oct 2026: One trek row on the home page — `main`
- **For visitors:** the home page showed treks twice ("Inside treks" small cards, then a "Trek the range in bloom" photo rail). Now "Inside treks" uses the big photo cards (photo, name, days and altitude, elevation line, short description, price) as one swipeable row, and the separate rail section is removed. Courses and destinations keep their own cards.
- **Content:** the removed rail's heading and intro line ("Trek the range in bloom", "18 treks across Uttarakhand & Himachal Pradesh…") are no longer on the home page; the same 8 treks and links are still there.

### 23 Oct 2026: Swipeable home rows, course slideshows, new Treks menu cards — `main`
- **For visitors:**
  - **Home on phones:** the "Where to today?" cards (treks, courses, destinations), the trek rail and the camping filmstrip now swipe sideways. The "Where to today?" row could not scroll at all (its column grew to fit every card and the page clipped it, hiding "See all treks →" too); the smooth-scroll library also no longer captures sideways swipes on these rows.
  - **Course pages** (skiing, snowboarding, backcountry): the header is now a photo slideshow of that course's own gallery, like the trek pages, with arrows, dots, pause and swipe.
  - **Treks hover menu:** the four featured treks use the same card as the home page: tall photo, name over it, days and altitude as big numbers, the trek's elevation line, price underneath.
- **Checks:** type-check clean; a simulated finger swipe on a 390px phone moves all three home rows (242, 301 and 488 px); screenshots of the course slideshow (desktop and phone) and the menu.

### 23 Oct 2026: **Live** — everything on `preview/trek-slideshows` is now on www.himalayanarcadventure.com (`main` = `8dd5d99`)
- **For visitors:** the live site now has the redesign, dark checkout, new site icon, accounts, booking emails and online payments (Razorpay **Test Mode**: no real money is taken yet).
- **Backend:** Vercel **Production** env vars added: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `BOOKING_TO_EMAIL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (Supabase keys and `CRON_SECRET` were already there). Production uses the same Supabase project as the preview (`sdhtgmlkzcknmeakxgdz`). Merged `main`'s favicon hotfix (`a42c960`) into the branch (kept the newer icons), then fast-forwarded `main`.
- **Checks:** www returns 200 for /, /treks, a trek page, /courses, /contact, /checkout and the new icon; the payment API answers "Please sign in" (configured). The apex domain still redirects with 307 (should be 308, set in Vercel).

### 23 Oct 2026: **Backend** Gmail sending and Razorpay test keys switched on (Preview) — no code change
- **Business:** sign-up confirmation, password-reset and booking emails now go out from himalayanarcadventure@gmail.com (Gmail App Password via Supabase custom SMTP and the site's email outbox). Online payments are on in **Razorpay Test Mode** on the preview; no real money moves.
- **Backend:** `node scripts/setup-backend.mjs` re-run (all 6 SQL files idempotent, Supabase Auth custom SMTP on, `.env.local` refreshed). Added to Vercel **Preview** (branch `preview/trek-slideshows`): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `BOOKING_TO_EMAIL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`. Preview redeployed: https://adventure-travels-pxak51ega-yuvrajbhardwaj2s-projects.vercel.app. Production unchanged.
- **Checks:** `POST /api/create-order` now answers 401 "Please sign in" (configured, not 503) and the webhook rejects unsigned calls with 400 "Invalid signature". No test booking or payment made yet.

### 22 Oct 2026: Redesign so the site reads as authored, not template-built; dark checkout; visitor-test fixes — uncommitted
- **Why:** an independent design review found the site built from the same few pieces everywhere (tracked-caps label + heading + grey line + link on every section, one card for everything, centred dark-overlay heroes, tinted icon squares, a SaaS-style stats strip, traffic-light cards) and a very common heading font. A visitor test walked every journey on phone and laptop with all form submits intercepted.
- **For visitors:**
  - **Type:** headings now use Fraunces, a soft serif (variable font, one file), instead of Space Grotesk; Space Grotesk stays for the navbar and small data labels.
  - **Signature graphic:** each trek's real altitude profile is drawn as a thin line (`ElevationLine`) on cards, the stats strip, hub headers and the no-photo panel.
  - **Home:** sections no longer repeat one layout: a typographic "Where to today?" index, big-numeral stats, a staircase for "Which trek is right for you?", photo-first trek cards, full-bleed photo bands, a numbered "Why" list, pull quotes, one navy band, and a closing line that runs into the footer. The split "ONE RANGE. TWO SEASONS." hero is unchanged.
  - **Trek cards (/treks, hubs, home):** tall photos with the name over the image, highest point and days as big numbers, the elevation line, a quiet price line; the whole card is the link.
  - **/treks and hub pages:** left-aligned editorial headers with the real altitude range; lighter filters and tables.
  - **Courses, activities, destinations, contact, FAQ, cancellation policy:** left-aligned headers (text-only on contact, FAQ and policy), one feature then a quieter list instead of identical card grids, course cards led by duration and dates, a refund "ladder" with big percentages, hairline accordions. No more gradient text, glass cards, glows or emoji icons.
  - **Checkout and admin:** always dark on the site's navy; the light/dark toggle is gone.
  - **Faster home page on phones:** the six hero videos (1.3–7 MB each) no longer download up front; they load only when shown, with a photo poster, and never on data-saver, slow connections or reduced motion.
  - **Fixes from the visitor test:** the "Best Season" pop-up now highlights the whole range (it lit only the end months); the Best Season tile no longer clips on phones; the back-to-top circle that covered the price bar on trek pages is gone; treks without photos (e.g. Tungnath) show their elevation line instead of a dark void; the course booking form now rejects a bad phone number or a past date with inline errors; /contact no longer scrolls sideways on 320px phones; a duplicate photo in a trek slideshow (and the console warning it caused) is removed; trek pages, /treks and the hubs have a `<main>` landmark; reservation fields have `name` attributes for autofill.
- **Content and SEO:** all words, links, headings and structured data are unchanged (checked by comparing every exported page before and after; the only data difference is a build timestamp). A few small labels taken from the data were added on cards and hubs ("Highest point", "Duration"); the decorative header photos on contact, FAQ and the cancellation policy were removed with their alt text.
- **Code:** `src/components/ElevationLine.tsx` (new); `NoPhoto` gains optional `profile`/`label`; `TrekPhotoCard` exported from `SummerTreksRail`; `ThemeScope` is a fixed dark shell; unused gradient-text CSS removed; `QuickInfoModal` uses `src/lib/season.ts`. No new packages.
- **Checks:** type-check clean, lint 0 errors, all 6 Puppeteer browser tests pass on the built site (no sideways scroll on 8 pages at 320/390/768/1024 px), page-by-page content comparison clean.

### 22 Oct 2026: Browser tests with Puppeteer — uncommitted
- **Business:** a free, repeatable check that catches layout and booking-form breakage before visitors do. Puppeteer is free and open source.
- **Code:** dev package `puppeteer-core` (uses the Edge or Chrome already installed, no browser download). New `adventure-travel/e2e/` (`helpers.mjs`, `site.e2e.test.mjs`) and `vitest.e2e.config.mjs`; run `npm run test:e2e` with the site running (`npm run dev`), or against any address with `E2E_BASE_URL=https://… npm run test:e2e`. `npm test` is unchanged.
- **What it checks (6 tests):** no sideways scroll on 8 main pages at 320, 390, 768 and 1024 px; the home page has its icon links and heading in the HTML; a trek page has its price route and itinerary text in the HTML; the FAQ page has all answers in the HTML; the course booking form offers WhatsApp when the booking service is unreachable; the phone menu opens and closes with Escape.
- **Safety:** the booking request is intercepted and answered locally, so the tests never create a real booking.
- **Checked:** all 6 pass on the current build; the sideways-scroll test fails on the old build with `/courses/skiing-course @1024px: 1165px wide`, the bug fixed earlier, so it does catch real problems.

### 22 Oct 2026: New site icon (favicon) that stays readable at small sizes — uncommitted
- **For visitors and Google:** the old icon was the detailed round compass logo, which blurs into a dot at the 16 to 48 px sizes used by browser tabs and Google results (and had transparent corners). The new icon is a simple, bold mark: navy square, amber sun, white mountain, green ground. It reads clearly at 16 px and looks right in Google's round crop.
- **Code:** `adventure-travel/scripts/make-favicons.mjs` (run `node scripts/make-favicons.mjs`) draws it and writes `public/favicon.svg`, `favicon.png` (192), `favicon-512.png`, `apple-touch-icon.png` (180) and `favicon.ico` (16, 32, 48). The URLs are unchanged (Google caches by URL). `layout.tsx` icon sizes and `site.webmanifest` (added the 512 icon) updated. The round logo stays in use on the site itself.
- **Checks:** the live site already served correct icon links, valid square files and no robots block, so this was about the image, not the setup. Verified in an isolated build. **Not live yet:** it is only on this branch; Google needs the new files on the live site.

### 22 Oct 2026: Modern icons on the trek overview tiles, stat strip and price card; nicer price card — uncommitted
- **For visitors:** the 11 "Key Facts" tiles on every trek page (difficulty, duration, altitude, season, group size, basecamp, suitable for, accommodation, fitness, offloading, cloakroom) use modern line icons (Lucide) in soft gradient chips, each in a brand colour (emerald, sky, amber, orange; difficulty keeps its own colour). Tiles lift slightly on hover and the icon eases up. Same words and "Know more" pop-ups.
- **Four-box strip under the trek photo** (duration, max elevation, group size, best season): Lucide icons in larger tinted chips (sky, green, orange, amber) on white cards with a soft shadow; same values and labels.
- **Price card on trek pages** (the "Trek Cost" box):
  - a soft green-to-sky header with the price in large type and "Joshimath to Joshimath" as a pill
  - room-sharing prices in a tidy table; the rating as a star pill
  - Lucide icons in tinted chips for What's Included, the info buttons, the three link tiles (Inclusions, Terms, Scholarships), the Optional extras and the trust row (replacing the 🔒 and ✓ characters)
  - the next batch as a highlighted strip and a friendlier "Call Our Mountain Experts" block
  - every word, price, phone number and button is unchanged; the "10% OFF" and "No-cost EMI · Free Trek Date Change" lines were restyled only (they are still open owner decisions)
- **Code:** `adventure-travel/src/app/treks/[id]/TrekDetailClient.tsx` (`QuickInfo`): hand-drawn SVGs replaced with Lucide icons plus a `TILE_TONES` map. No new packages. Checked at 390 and 1280 px; lint and type-check clean.

### 22 Oct 2026: Site-wide UI consistency and polish; course booking fallback; local API runner — branch `preview/trek-slideshows`, preview deploy
- **For visitors:**
  - **One look everywhere.** The same buttons, fields, dropdowns, pop-ups and side drawers on every page; off-brand cyan, violet and indigo are gone; brand colours unchanged. The account pages stay dark navy but use the same components.
  - **No more full-screen preloader.** Pages and photos show straight away, also with slow scripts. Hero text and buttons no longer fade in from invisible.
  - **Modern loading.** Placeholders shaped like the real content (dashboard, checkout, admin, forms) instead of "Loading…" text; they appear only if the wait is over 150 ms. Buttons show a spinner while saving or paying and can't be pressed twice.
  - **Smoother motion.** One set of animation speeds; pop-ups, drawers and menus can be closed mid-animation; reduced motion is respected everywhere.
  - **Easier on phones.** Tap targets are 44 px or larger; the course page no longer scrolls sideways at 1024 px; activity descriptions are readable without hover.
  - **Course booking form.** If the booking service can't be reached it now shows "We couldn't save your request online right now" with the WhatsApp button, instead of a red "please try again". Real validation messages (bad date, group size) still show inline.
- **Business:** the FAQ page now exposes all 70 answers, and the contact-page FAQ and the terms tabs expose their text to search engines (visitors see the same page). No fake loading or scarcity added. Open decisions D-01 to D-12 (invented ratings, "10% OFF", "No-cost EMI", generated course availability, opening hours) are in `specs/002-ui-polish-consistency/audit.md` and TODO.md.
- **Backend:** no change to `api/`, SQL, prices or payment logic. New developer tool `npm run dev:api` (`adventure-travel/scripts/dev-api.mjs`): runs the `api/*.js` functions on http://localhost:3100 and forwards the rest to `npm run dev`, so bookings work locally without a Vercel login. It uses the keys in `.env.local`, so a submitted booking is a real one in that Supabase project.
- **Code:** new package `@radix-ui/react-dialog`; kit additions in `src/components/ui/` (input, textarea, label, select, checkbox, spinner, empty-state, dialog, sheet, dark-scope; Button `loading`, `destructive`, `link`); `src/lib/motion.ts`; `navy` colour tokens; removed `Preloader`, the Poppins font, the `.skeleton` class and the old admin `FIELD` style. Eight groups of pages were restyled in parallel; the page-by-page audit (about 190 rows) is `specs/002-ui-polish-consistency/audit.md`.
- **Checks:** `tsc` clean, lint 0 errors, 65 tests pass, production build succeeds. 47 exported pages compared against a baseline: nothing readable was lost because of this work. Layout shift 0 on 7 pages; largest paint about 1 s on a throttled phone profile. Not yet run: Slow-4G walk, real-phone smoothness, keyboard and contrast pass, signed-in flows (dashboard, checkout, admin). These need a person and a login.

### 21 Oct 2026: Plan for site-wide UI consistency and polish
- Design plan for spec 002 in `specs/002-ui-polish-consistency/`: `plan.md`, `research.md` (14 decisions), `data-model.md`, `contracts/components.md`, `contracts/motion.md` and `quickstart.md` (checks V1–V10). No code changed yet.
- **For visitors (once built):**
  - no full-screen preloader; photos and sections show straight away
  - loading placeholders shaped like the real content, with no "Loading…" text
  - the same buttons, fields and dialogs on every page, with one set of smooth, interruptible motion.
- **Decisions:**
  - account pages keep their dark navy look
  - the existing component kit is extended rather than adding a second design system; the one new package is `@radix-ui/react-dialog`, for accessible dialogs and drawers
  - the navy shades get names, but no colour changes; off-palette cyan becomes the brand's sky or emerald.
- The spec's count of hand-typed colours was corrected from 27 to 34 (gradient stops included).

### 21 Oct 2026: Spec for site-wide UI consistency and polish — uncommitted
- New spec `specs/002-ui-polish-consistency/spec.md`: one brand-coloured component set on every page (light and dark variants), modern placeholders that match each layout, smooth and interruptible motion, nothing hiding content on first view, and every page polished from 320px to 1920px. Brand colours stay exactly as they are; off-palette uses get fixed.
- It's based on a survey of today's inconsistencies:
  - 6 plain "Loading…" texts and 7 spinners
  - 8 off-palette cyan uses and 34 hand-typed colours
  - 15 of about 118 buttons using the shared button
  - three page "looks"
  - a preloader that hides every page.
- Planning only so far; no site code changed.

### 21 Oct 2026: `CLAUDE.md` brought up to date — uncommitted
- **Fixed outdated guidance for future Claude sessions:**
  - the repo root wasn't `d:\opencode`
  - headings are Space Grotesk, not Poppins
  - most routes are a server `page.tsx` plus a client component, not all client
  - `MotionWrapper` is widely used
  - the ContactPopup placeholder note is gone.
- **Added:**
  - how to run one test file or one test by name
  - `npx vercel dev`, the photo and setup scripts, the env files and the deploy flow
  - the rules that keep page content in the static HTML for SEO
  - the share-image pipeline and the Supabase MCP server.

### 19 Oct 2026: **Backend** database set up on Supabase — script change `dbb2ce7` (branch `preview/trek-slideshows`, pushed)
- **Database:** ran `scripts/setup-backend.mjs` against Supabase project `sdhtgmlkzcknmeakxgdz`. All 5 SQL files applied and were verified: 8 tables with row-level security, 23 policies, payment and audit triggers, `apply_payment()` callable only by the server.
- **Sign-in settings (Supabase Auth):**
  - "Confirm email" is on.
  - The site URL is `https://www.himalayanarcadventure.com`.
  - Sign-in links may return to the live site's `/dashboard`, `/reset-password` and `/login`, to `localhost:3000` for local work, and to this project's Vercel previews only.
  - **Custom email (SMTP) is not set yet.** Until it is, Supabase's built-in mailer sends sign-up and reset emails only to members of your Supabase team, and only a few per hour.
- **Keys:** the Supabase keys and a generated `CRON_SECRET` are in `adventure-travel/.env.local`, which is git-ignored. **Vercel has none yet**, because no Vercel token was given.
- **Script changes** (`scripts/setup-backend.mjs`):
  - `VERCEL_TOKEN` is now optional; without it, the Vercel step is skipped and can be run later.
  - The redirect list includes localhost and this project's preview URLs.
  - A re-run keeps the same `CRON_SECRET` instead of making a new one.
- **Security:** the Supabase access token used for this was pasted in chat. Delete it in Supabase → Account → Access Tokens when setup is finished.

### 19 Oct 2026: Two new landing pages: "Treks from Joshimath" and "Winter Treks in Uttarakhand" — `b17ebd1` (branch `preview/trek-slideshows`, pushed)
- **Visitors:** two new pages, each with:
  - a comparison table (days, highest point, grade, best season, price and what the price covers)
  - a month-by-month "when to go" planner
  - the trek cards
  - links on to the Auli courses, the other hub, and WhatsApp.
- **Treks from Joshimath** (`/treks-from-joshimath`): the 8 treks that start and end at our Joshimath base, how to get there (245–270 km and 9–10 hours from Rishikesh, as in the itineraries), and the Mana, Niti and Rimkhim permit tours, where we handle the Inner Line Permit.
- **Winter Treks in Uttarakhand** (`/winter-treks-uttarakhand`): every Uttarakhand trek whose season includes January (Kedarkantha, Brahmatal, Pangarchula, Kuari Pass, Tungnath).
- **Why:** no operator owns these searches yet; the results are blogs and listings (SEO plan items #6 and #7). Every fact on both pages is generated from the trek data, so the pages can't drift from the trek pages.
- **Search engines:** both pages are server-rendered, listed in the sitemap, linked from the footer on every page, and carry ItemList and Breadcrumb structured data.
- **Season accuracy:** the planner uses a new season parser (`src/lib/season.ts`) with unit tests. The old one in `QuickInfoModal.tsx` got some ranges wrong (e.g. "Mar–Jun & Sept–Dec" lost Apr, May, Oct and Nov) and isn't changed yet; see TODO.
- **Files:** new `src/components/TrekHub.tsx`, `src/app/treks-from-joshimath/page.tsx`, `src/app/winter-treks-uttarakhand/page.tsx`, `src/lib/season.ts` and `src/lib/__tests__/season.test.ts`. Changed: `src/app/sitemap.ts`, `src/components/FooterV2.tsx`, `src/app/treks/TreksPageClient.tsx` (exports the trek card) and `vitest.config.mjs` (also runs `src/lib` tests).
- **Checks:** type-check clean, lint 0 errors, 48/48 unit tests. On a 390px phone both pages are exactly screen-wide with no sideways scroll, and the desktop header runs under the navbar with no gap.

### 19 Oct 2026: "Where to today?" is a home-page section, not a pop-up — `910d4bb` (branch `preview/trek-slideshows`, pushed)
- **Visitors:** the Treks / Courses / Destinations chooser used to cover the whole screen on a first visit to the home page. It now sits right under the hero. Tapping a tile shows what's inside it; "See all" and each card link through. There's no scroll lock or "Skip" button any more.
- **Why:** the home page is what Google shows for the brand name, and Google discourages full-screen pop-ups for visitors arriving from search. The chooser's links are now also in the page HTML that search engines read.
- **Files:**
  - `src/components/WelcomeChooser.tsx` (now an inline `<section>`)
  - `src/app/page.tsx` (placed after the hero)
  - `src/app/layout.tsx` (removed from every page)
  - `src/components/LegacyDataNotice.tsx` (dropped the session key that only the pop-up read).
- **Checks:** type-check clean, lint 0 errors (8 old warnings), 45/45 unit tests. The dev server's home HTML has the section and no full-screen overlay.

### 19 Oct 2026: Faster logo, link previews, account pages kept out of Google — `55d3fe1`, `d18cb3c`, `b47d7fa` (branch `preview/trek-slideshows`, pushed)
- **Logo badge** in the navbar: 1.8 MB down to 29 KB (192×192), with the same look. It loads on every page, so every page gets faster. The original is kept in `media-originals/brand/`. Files: `public/brand/badge.png`, `src/components/Navbar.tsx` (declared size).
- **Link previews (WhatsApp, Facebook, X):** every trek and course with our own cover photo now has its own 1200×630 preview image under WhatsApp's 300 KB limit, with the corner watermark. That's 15 images, the largest 222 KB, in `public/og/`. Treks with stock or no photos use the branded default preview. `scripts/prepare-photos.mjs` builds them, so re-run it after changing a cover photo. Pages only point at a preview that exists (`src/lib/shareImage.ts`). Files: `src/app/treks/[id]/page.tsx`, `src/app/courses/[course]/page.tsx`.
- **Account pages:** `/login`, `/signup`, `/reset-password` and `/dashboard` now tell Google not to index them, and each has its own canonical address. Before, they inherited the home page's. `/login`, `/signup` and `/reset-password` were removed from `robots.txt` so Google can actually read that instruction. `/dashboard`, `/checkout` and `/admin` stay blocked. Files: new `layout.tsx` in those four folders, `src/app/robots.ts`.
- **Checks:** type-check clean, lint 0 errors, and the dev server serves the right tags and preview files.

### 19 Oct 2026: Favicon missing in Google results — live via `a42c960` on `main`; same change as `0e3f8ca` on `preview/trek-slideshows`
**What was wrong**
- Google shows a grey globe instead of the logo next to the site in mobile search. Google's favicon service had **no icon stored** for the domain (it returns 404).
- `/apple-touch-icon.png` wasn't an icon. It was a 3000×4000 JPEG of the night camp (moon and tent), there since August. Google reads `apple-touch-icon` as a favicon candidate and needs a square image. The same photo was also the icon iPhones used when someone added the site to their home screen.
- `/favicon.png` was a 237 KB, 484×484 file, and the manifest listed sizes that didn't match the files.

**Fix**
- `/apple-touch-icon.png` is now a real 180×180 PNG of the compass emblem on white (iOS turns transparent areas black).
- `/favicon.png` is now 192×192 (52 KB), made from the same emblem (`assets/favicon_circular.png`).
- The home page now declares all three icons with their real sizes: `/favicon.ico` (48 and 256 px), `/favicon.png` and the Apple icon. `site.webmanifest` sizes are corrected.
- **Files:** `adventure-travel/public/apple-touch-icon.png`, `adventure-travel/public/favicon.png`, `adventure-travel/public/site.webmanifest`, `adventure-travel/src/app/layout.tsx`.
- **Checks:** type-check and lint clean. The dev server's home page serves the three icon links, and each file returns 200 with the right type.
- **Takes effect only after deploy.** Then request indexing of the home page in Search Console. Google says favicon updates take "several days to several weeks".
- **Shipped to the live site as a hotfix:** commit `a42c960` on GitHub `main` (pushed 19 Oct, with the owner's permission). It contains only these four files, on top of `a630559`. It didn't need the Supabase variables, because the production-build guard only arrived in `9b522d5`. The same changes are still uncommitted on `preview/trek-slideshows`; commit them there too, and the later merge into `main` stays clean, since both sides make the identical change.
- **Update to the finding below:** the home page is now in Google (the owner saw it in mobile search on 19 Oct). It still shows the old title "Premium Himalayan Adventures…" because the live site is still `a630559`. The site name shows as "himalayanarcadventure.com" because the live site has no `WebSite` structured data; that is already fixed in `f8f83d3`.

### 19 Oct 2026: Why the site doesn't rank yet, and SEO fixes — `f8f83d3`, `cd4c2cf`, `6a82a5c` (branch `preview/trek-slideshows`, pushed 19 Oct)
**Findings**
- **The site isn't indexed yet.** The domain was registered on 30 Sep 2026, so it is 19 days old with no links pointing to it. Searching for the brand or `site:himalayanarcadventure.com` returns nothing. This is normal for a new domain, not a penalty.
- **Search Console:** Google Search Console is already verified (DNS record), and pages have real pre-rendered text.
- **Redirect:** the apex domain redirects to www with a *temporary* 307 redirect. It should be permanent; that's a Vercel setting, listed in TODO.
- **Full report:** `adventure-travel/docs/seo/2026-10-19-audit-and-plan.md`. It covers a realistic timeline, a competitor-gap table for 15 searches, a prioritised plan, Google Business Profile and backlink steps, content outlines and a social calendar.

**SEO fixes in code** (by the SEO/SMO agent)
- **Headings:** every page now has one `<h1>`. The preloader's "HIMALAYAN ARC" title was a second one.
- **Titles and descriptions:** rewritten to fit Google's length limits and to lead with the search people make. Example: "Kuari Pass Trek from Joshimath: 5 Days | Himalayan Arc". Prices and counts come from the trek data. This fixed the `/courses` text, which claimed "from Rs.30,000, all meals included".
- **Share previews:** images now always use full web addresses, so WhatsApp and Facebook previews work. Dropped the X (Twitter) handle because it is longer than X allows, and the Facebook and YouTube profile links because those pages don't load.
- **Structured data for Google:**
  - the business is described as a travel agency with the Joshimath address, both phone numbers and the Gurugram office
  - trek and course pages get breadcrumbs
  - **removed invented ratings**: the site-wide 4.8 from 692, the 4.9 from 150 on courses, and the made-up "100 reviews" fallback on treks.
- **Sitemap:** now includes Tungnath and Madhyamaheshwar, plus 87 of our own photos.
- **Trek and course pages put every tab in the page HTML.** Before, only the open tab was there, so Google couldn't see the itinerary, inclusions, packing list, terms or gallery. The visible text Google can read on a trek page went from about 500 words to about 2,360. The tabs look and behave the same, and photos in closed tabs still load only when opened.
- **`/treks` now lists all 21 treks in the page HTML.** Before, it shipped as an empty loading skeleton. Links that open the list pre-filtered (`?region=`, `?difficulty=`, `?search=`) still work.
- **Pages show immediately.** The first page load no longer starts invisible (`opacity:0`) waiting for JavaScript, and the three `loading.tsx` files are removed; in the static site they moved page content into a hidden block. Moving between pages inside the site still fades in.
- **Footer "Popular Treks"** now links our own Joshimath routes (Kuari Pass, Pangarchula, Dronagiri, Valley of Flowers, Panpatia Col, Kedarkantha), so no trek page is left without internal links.
- The two Panpatia Col photos are back in that trek's banner slideshow now that they're upright.
- **Files:** `src/app/treks/[id]/TrekDetailClient.tsx`, `src/app/courses/[course]/CourseDetailClient.tsx`, `src/app/treks/TreksPageClient.tsx`, `src/app/template.tsx`, `src/components/FooterV2.tsx`. Deleted: `src/app/loading.tsx`, `src/app/treks/[id]/loading.tsx`, `src/app/courses/[course]/loading.tsx`.
- **Checks:** type-check clean, lint 0 errors, 45/45 unit tests, and a production build (48 pages; the built Kuari Pass page contains the packing list and `/treks` links all 21 treks).
- **Files:** `src/components/Preloader.tsx`, `src/lib/seo.ts`, `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/treks/[id]/page.tsx`, `src/app/courses/[course]/page.tsx`, and the `page.tsx` of /treks, /courses, /destinations, /activities, /contact and /faq.

**Protecting the site's content**
- `robots.txt` now blocks AI scraping bots (GPTBot, ClaudeBot, CCBot, Google-Extended, Bytespider, PerplexityBot, Amazonbot, Applebot-Extended, Meta). Google and Bing search crawling is unaffected.
- **Photos:**
  - All 125 photos are now web-sized: at most 1600px, with a small "© Himalayan Arc Adventure" mark in the corner.
  - Camera and GPS metadata are stripped.
  - Size went from 98 MB to 29 MB, which makes pages much faster.
  - Full-resolution originals moved to `media-originals/` (git-ignored, never published).
  - The two sideways Panpatia Col photos are now upright.
  - Re-run `node scripts/prepare-photos.mjs` after adding new photos.
  - The 35 videos are unchanged, because there is no video tool on this machine.
- `sharp` is now a declared dev dependency (it was already installed through Next).

**Backend**
- New one-command setup: `node scripts/setup-backend.mjs` (template `scripts/setup-backend.example.env`). From two tokens plus your Razorpay and email details, it:
  - reads the Supabase keys
  - runs the 5 SQL files in order
  - sets Supabase sign-in emails and redirect URLs
  - makes your account admin
  - writes every key into Vercel and `.env.local`.

  `--dry-run` checks the inputs without changing anything. It has only been tested in dry-run, because no Supabase or Vercel tokens are available yet.
- `supabase-schema.sql` is now safe to run more than once: each policy is dropped if it exists before being created.

**Tools installed on this computer (not in the repo)**
- `caveman` (shorter replies), `ponytail` (smallest-change coding style) and `agent-browser` (browser automation) skills.
- The `agent-browser` command line tool v0.39.1, with its own Chrome.

### 16 Oct 2026: Navbar redesign — `1be764a` (preview)
Committed as "Refactor code structure for improved readability and maintainability".
Made with the `impeccable` design skill, keeping the brand's own colours and fonts.
- **Fixed:** links no longer wrap onto two lines or run off the screen between 768 and 1300px. The full bar now appears from 1024px; below that, the slide-out menu.
- **Changed:**
  - Emoji removed from labels ("🏔️ Adventures", "⛷️ Courses").
  - "Adventures" is renamed **Treks**, and "Home" left the desktop bar (the logo links home).
  - The logo badge gets a "Himalayan Arc / Adventure" wordmark.
  - The accent colour moves from cyan to the site's emerald.
- **Added:**
  - **Treks mega-menu:** treks by region and difficulty (with counts), four featured treks with their own photos, days, altitude and "from" price, and a WhatsApp "ask our mountain experts" prompt.
  - A dark Activities dropdown, and an avatar account menu with My bookings, Admin (for admins) and Log out.
  - A sliding hover highlight on the links, off for visitors who prefer reduced motion.
- **Mobile menu:**
  - Same order as desktop.
  - Region and difficulty quick filters under Treks.
  - The main button is now "Talk to our mountain experts" (WhatsApp) instead of the Contact page; Contact stays in the list.
  - The currency picker shows in the bar on phones.
- **Files:** `adventure-travel/src/components/Navbar.tsx`, `adventure-travel/src/components/DesktopSearch.tsx` (now appears from 1024px, emerald accents).

### 16 Oct 2026: Repo housekeeping
- `.gitignore` now ignores `.specify/` (Spec Kit tooling) and `.claude/` (Claude Code skills and agents). `specs/` stays tracked, because the code links to those design docs. *(`1be764a`, preview)*
- Added this `CHANGELOG.md` and `TODO.md`, and a note in `CLAUDE.md` telling every Claude session to keep both current. *(uncommitted)*

### 16 Oct 2026: Tools for future work *(not in the repo)*
- **SEO/SMO agent** at `.claude/agents/seo-smo-strategist.md`. It audits SEO and social share previews, finds competitor gaps, plans content and social posts, and implements approved fixes, white-hat only. It's local, because `.claude/` is ignored.
- **`impeccable` design skill** installed for this user in `~/.agents/skills/impeccable`.

### 16 Oct 2026: Backend finished: admin, advance/balance payments, reminders, self-service — `c56f595` (preview)
**Backend**
- **Payments:**
  - `api/create-order.js` takes `{ bookingType, bookingId, kind }` with kind `advance` (30%, rounded up), `balance` or `full`. Amounts come from the booking's locked price, never the browser. It refuses cancelled, paid or refunded bookings (409) and quote requests (422). An unpaid order of the same kind is reused. Trek bookings made before prices were locked get priced from the catalog once, then locked.
  - The pricing rules live in `api/_lib/pricing.js` → `orderAmount()`, with unit tests.
  - `api/verify-payment.js` and `api/razorpay-webhook.js` both apply payments through the database's `apply_payment()` function (exactly once). Verify-payment also fetches the payment method for the receipt.
- **New `api/cron.js`:** runs daily at 09:00 IST via `vercel.json`. It sends balance reminders 7 days before and on the due date, retries failed emails (up to 3 attempts, plus any that were queued while SMTP wasn't set up) and counts overdue balances. Protected by `CRON_SECRET`.
- **New `api/account.js`:**
  - `claim`: attaches course bookings made while signed out to the account with the same *verified* email.
  - `delete`: anonymises the profile and booking contacts, keeps the payment records, and deletes the sign-in.
  - **Removed** `api/claim-bookings.js`, which `account.js` replaces.
- **API function count:** 8 (`account`, `bookings`, `create-order`, `cron`, `geo`, `rates`, `razorpay-webhook`, `verify-payment`). The Vercel Hobby limit is 12.

**For the business (admin)**
- `/admin/bookings`:
  - every trek, course and activity booking in one list, searchable by name, email, phone, reference or trek
  - filters for type, status, payment, start dates and "overdue only"
  - change a booking's status
  - "Record refund" with a confirmation step
  - a history drawer showing who changed what and when.
- `/admin/customers`: every account with its profile, emergency contact, bookings, payments and total paid.
- `/admin/payments`: every payment attempt (kind, method, status, failure reason), plus a "Failed emails" panel.
- Admin tabs on all admin pages. The activity feed now shows course bookings and admin status changes.

**For customers**
- **Checkout:** choose a **30% advance** (non-refundable, balance due 15 days before the start) or **full payment**. Only full payment is offered within 15 days of the start. Later, "Pay balance". The success message says what's left and when it's due.
- **Dashboard:**
  - total, paid, balance and due date, with an "Overdue" tag
  - "Pay now", "Pay balance" and "Quote requested"
  - cancel your own pending, unpaid trek or course booking
  - a cancellation-policy note on confirmed bookings
  - an emergency-contact reminder before a trek in the next 30 days
  - **Delete my account**: type DELETE to confirm.
- **Login:** "Forgot password?". New **/reset-password** page (hidden from search engines).
- **One-time notice** for visitors whose account or bookings were only ever saved in their browser by the old system. The old data is wiped, and the welcome chooser waits until after the notice.
- Payment terms now say the same thing everywhere: trek cost card "Pay 30% advance or in full", Terms & Conditions, and the cancellation policy.

**Other**
- Fixed the only lint error in the project (`LazyVideo.tsx`).
- Updated `CLAUDE.md` (backend architecture, `npm test`, `npm run catalog`, routes) and `.env.example` (SQL run order, which functions use each variable).
- Checks: 45/45 unit tests pass, the type-check is clean, lint has 0 errors, and a production build passes (48 static pages). Not yet run against a real database.

### 16 Oct 2026: Backend work in progress, plus trek-page slideshow — `fd980d5` (preview)
**Backend** *(started by another session, committed here)*
- Trek bookings now go through `api/bookings.js`, which prices and stores them on the server. The trek page shows a WhatsApp fallback if saving fails instead of a false "Sent!".
- Course bookings also post to `api/bookings.js`. **Removed** `api/course-bookings.js`.
- Activities page: an "ActivityRequestForm" saves activity requests to the customer's account (never priced or paid online).

**Site**
- Every trek page's banner is now a slideshow of that trek's gallery photos (videos skipped). Tall phone photos are shown whole over a blurred copy on wide screens. Treks with no photos still show the "no photo" panel. Two sideways Panpatia Col photos are kept out (`IMG_6013`, `IMG_6015`).
- The trek cost card and the mobile price bar show the "Joshimath to Joshimath" label.

### 16 Oct 2026: Trek photo slideshows and "Joshimath to Joshimath" pricing — `4fdc8c8` (preview)
- `/treks` header is a full-width slideshow of 9 real trek photos, each linking to its trek (new `WallpaperCarousel` component).
- Treks that start from a town show the price Indiahikes-style:
  - "**Joshimath to Joshimath**": Valley of Flowers, Pangarchula, Kuari Pass, Gupt Khal, Dronagiri, Mana Pass, Niti Pass and Rimkhim
  - "Delhi to Delhi": Tungnath.
- Where it shows: list cards, the printable itinerary and the page description for search engines. "What's included" says road transfers run from that town and back, and "not included" says getting to the town.

### 16 Oct 2026: Earlier work on the preview branch *(other sessions; not live yet)*
- `9b522d5` **Backend foundation**:
  - `supabase-payments-v2.sql`: payment state, amount paid, balance due date, payment kind, record retention, money-guard and audit triggers, `booking_status_events`, the `notifications` email outbox and `apply_payment()`.
  - `api/_lib/pricing.js` and `api/_lib/notify.js` (email outbox).
  - Vitest unit tests and the `npm test` script.
  - `vercel.json` cron and `CRON_SECRET`.
  - Removed the browser-only (localStorage) accounts.
  - A production build now refuses to run without the Supabase settings.
  - `WhatsAppFallback` component.
- `9c00e88` Room-sharing price tiers (Tungnath), printable itinerary, photo fallback.
- `6e1f881` "Where to today?" chooser; added the Tungnath and Madhyamaheshwar treks.
- `c2ac934` Prices shown in the visitor's local currency (IP-based, with a switcher). Charges are always INR.
- `411b73a` **Backend:** stored course bookings, course payments and profiles (`supabase-backend.sql`).
- `78271c1` Children's scholarship and group waiver on trek pages.

---

## Released

### 15 Oct 2026 — `a630559` (live)
Three quick boxes on the trek cost card, per-trek inclusions, and the scholarships tab. Earlier history: `git log`.

---

## Backend tracker

### Database migrations
Run in this order, either with `node scripts/setup-backend.mjs` or in the Supabase SQL Editor. **Status: all 5 ran on 19 Oct 2026 on Supabase project `sdhtgmlkzcknmeakxgdz`**, the only project so far; the owner hasn't said yet whether it's dev or production. Verified afterwards:
- 8 tables, all with row-level security, and 23 policies
- `apply_payment()` callable only by the server, not by browsers
- browsers can no longer insert trek bookings directly.

Below, ☑ marks the files run on that project.

| # | File | What it sets up | `sdhtgmlkzcknmeakxgdz` |
|---|---|---|---|
| 1 | `adventure-travel/supabase-schema.sql` | Profiles, trek and activity bookings, row-level security | ☑ 19 Oct |
| 2 | `adventure-travel/supabase-activity-payments.sql` | `is_admin()`, activity log, payments | ☑ 19 Oct |
| 3 | `adventure-travel/supabase-backend.sql` | Profile fields, course bookings, admin policies | ☑ 19 Oct |
| 4 | `adventure-travel/supabase-room-sharing.sql` | Room tier on trek bookings | ☑ 19 Oct |
| 5 | `adventure-travel/supabase-payments-v2.sql` | Advance/balance payments, audit trail, email outbox, `apply_payment()` | ☑ 19 Oct |

After running them, give the business account admin rights (snippet at the top of file 2), then sign out and back in.

### API functions (`adventure-travel/api/`, Vercel)
| Function | Purpose | Status |
|---|---|---|
| `bookings` | Create trek/course bookings with the price locked | Built, on preview |
| `create-order` | Start an advance, balance or full payment | Built, on preview |
| `verify-payment` | Confirm a payment from the browser | Built, on preview |
| `razorpay-webhook` | Razorpay's confirmation (the source of truth) | Built, on preview; webhook not registered |
| `account` | Claim signed-out bookings; delete account | Built, on preview |
| `cron` | Daily reminders and email retries | Built, on preview; runs on production only |
| `geo`, `rates` | Display currency | Live |
| ~~`course-bookings`~~, ~~`claim-bookings`~~ | Replaced by `bookings` and `account` | Removed |

### Environment variables (Vercel → Settings, and `adventure-travel/.env.local` for local work)
| Variable | Needed for | Set? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Accounts, bookings, dashboard. Production build refuses to run without them | ☑ local · ☑ Vercel Preview (21 Oct) · ☐ Vercel Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Every API function | ☑ local · ☑ Vercel Preview (21 Oct, Sensitive) · ☐ Vercel Production |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Online payments | ☐ local · ☐ Vercel |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `BOOKING_TO_EMAIL` | Booking, payment and reminder emails | ☐ local · ☐ Vercel |
| `CRON_SECRET` | Daily reminder job | ☑ local · ☑ Vercel Preview (21 Oct, Sensitive) · ☐ Vercel Production |

### Testing status
| Check | Result |
|---|---|
| Unit tests (`npm test`) | 45/45 pass |
| Type-check, lint | Clean; 0 lint errors |
| Production build | Passes (48 static pages) |
| End-to-end scenarios V1–V22 (`specs/001-persistent-backend/quickstart.md`) | Not run; needs Supabase, Razorpay test keys and SMTP |
