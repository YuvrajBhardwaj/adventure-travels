# Changelog

Every change to the Himalayan Arc Adventure site, newest first. Backend changes (database, API functions, environment variables) are marked **Backend** and also summarised in the [Backend tracker](#backend-tracker) at the bottom, which shows what is built, what is deployed and what still has to be set up.

**How to add an entry:** add it under [Unreleased] with the date, where the change lives (branch and commit, or "uncommitted"), and what changed for visitors, for the business and in the backend. Move entries to a dated release heading when they go live on www.himalayanarcadventure.com. Open work goes in [TODO.md](TODO.md).

## Where things stand (16 Oct 2026)

| Where | Commit | What it has |
|---|---|---|
| **Live site** (`main` on GitHub) | `a630559` | Everything up to "three quick boxes on trek cost card" (15 Oct). None of the 16 Oct work below. |
| **Preview** (`preview/trek-slideshows` on GitHub) | `1be764a` | Everything in [Unreleased] except this changelog and TODO. Last preview link seen: https://adventure-travels-2ds2d9ltc-yuvrajbhardwaj2s-projects.vercel.app (built from `c56f595`, before the navbar). Bookings and payments need Supabase, which isn't set up yet. |
| **This computer, not committed** | — | Everything under "19 Oct 2026" below, plus `CHANGELOG.md`, `TODO.md` and the CLAUDE.md note about keeping them current. |
| Local `main` | `9b522d5` | 6 commits ahead of GitHub `main`; all of them are also in the preview branch. |

---

## [Unreleased]

### 19 Oct 2026: Why the site doesn't rank yet, and SEO fixes *(uncommitted)*
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
Run in this order in the Supabase SQL Editor. **Status: none has been run on any database yet; no Supabase project is connected.**

| # | File | What it sets up | Dev DB | Prod DB |
|---|---|---|---|---|
| 1 | `adventure-travel/supabase-schema.sql` | Profiles, trek and activity bookings, row-level security | ☐ | ☐ |
| 2 | `adventure-travel/supabase-activity-payments.sql` | `is_admin()`, activity log, payments | ☐ | ☐ |
| 3 | `adventure-travel/supabase-backend.sql` | Profile fields, course bookings, admin policies | ☐ | ☐ |
| 4 | `adventure-travel/supabase-room-sharing.sql` | Room tier on trek bookings | ☐ | ☐ |
| 5 | `adventure-travel/supabase-payments-v2.sql` | Advance/balance payments, audit trail, email outbox, `apply_payment()` | ☐ | ☐ |

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
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Accounts, bookings, dashboard. Production build refuses to run without them | ☐ local · ☐ Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | Every API function | ☐ local · ☐ Vercel |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Online payments | ☐ local · ☐ Vercel |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `BOOKING_TO_EMAIL` | Booking, payment and reminder emails | ☐ local · ☐ Vercel |
| `CRON_SECRET` | Daily reminder job | ☐ Vercel |

### Testing status
| Check | Result |
|---|---|
| Unit tests (`npm test`) | 45/45 pass |
| Type-check, lint | Clean; 0 lint errors |
| Production build | Passes (48 static pages) |
| End-to-end scenarios V1–V22 (`specs/001-persistent-backend/quickstart.md`) | Not run; needs Supabase, Razorpay test keys and SMTP |
