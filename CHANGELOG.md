# Changelog

Every change to the Himalayan Arc Adventure site, newest first. Backend changes (database, API functions, environment variables) are marked **Backend** and also summarised in the [Backend tracker](#backend-tracker) at the bottom, which shows what is built, what is deployed and what still has to be set up.

**How to add an entry:** add it under [Unreleased] with the date, where the change lives (branch and commit, or "uncommitted"), and what changed for visitors, for the business and in the backend. Move entries to a dated release heading when they go live on www.himalayanarcadventure.com. Open work goes in [TODO.md](TODO.md).

## Where things stand (10 Nov 2026)

| Where | Commit | What it has |
|---|---|---|
| **Live site** (`main` on GitHub) | `8399ff5` | Everything up to 10 Nov: "The Ascent" home page part 1 (HIMALAYA-behind-the-peaks hero, altitude meter, The Range, Book a trek button), plainer section copy, the daily-departure Dates calendar and all earlier work. Payments in Razorpay **Test Mode** (webhook registered). The 7 Nov production build of `b37ed2c` failed on Vercel's side; an empty redeploy commit on 10 Nov went through. |
| **Preview** (`preview/trek-slideshows` on GitHub) | `8399ff5` | Same as live. |
| **Database** (Supabase `sdhtgmlkzcknmeakxgdz`) | — | All 7 SQL files applied (latest on 5 Nov); sign-up emails limited to 20 an hour. |
| Local `main` | `9b522d5` | Stale. Reset it to `origin/main` before the next use. |

---

## [Unreleased]

### 13 Nov 2026: photo gallery on tour pages; tour photo folders — `main`
- **For visitors:** every tour page has a **Photo gallery** section after the itinerary: a photo grid that opens a full-screen viewer (arrows, swipe, Esc).
  - **Auli:** 8 of our own Auli photos (the slopes, the range, the ropeway, groups on the snow).
  - **Chopta & Tungnath:** says "Photos from this tour are coming soon" until photos are added.
- **For the business:** new photo folders `public/assets/tours/auli/` and `public/assets/tours/tungnath/`. Drop photos in, run `node scripts/prepare-photos.mjs` (web size, watermark, location data stripped), and push. The tour page, its gallery and its /tours card pick them up at build time, with no code change. New Auli photos go before the current 8; Tungnath photos also become the Chopta cover.
- **Code:** new `src/components/TourGallery.tsx` and `src/lib/tourPhotos.ts`, which reads the folders at build time.

### 13 Nov 2026: Kedarkantha photo turned upright — `main`
- **For visitors:** photo 7 of 10 in the Kedarkantha gallery (`IMG_4141`, trekkers on the ridge) showed sideways. It's now rebuilt upright from the original, with the watermark the right way round.
- **Tooling:** `scripts/prepare-photos.mjs` turns this photo in its `ROTATE` list and now skips `public/assets/hero/`. The home hero layers are hand-cut transparent images, and the script would otherwise watermark and re-encode them.

### 13 Nov 2026: Chopta & Tungnath tour; every tour page shares one layout — `main`
- **For visitors:** new tour page [/tours/chopta-tungnath](https://www.himalayanarcadventure.com/tours/chopta-tungnath), laid out exactly like the Auli one:
  - **Header:** prices from Rs.5,499 per person (quad sharing).
  - **Room sharing table:** cards on phones.
  - **Day-by-day itinerary:** with meals and notes.
  - **Inclusions, good to know, booking:** WhatsApp or phone, plus **Book online**, which opens the Tungnath trek page where online payment works.
  - **On /tours and in the menus:** listed next to the Auli Winter Escape. It has no photo yet, so it shows the no-photo panel with its altitude line.
- **Code:** new `src/components/TourPage.tsx` holds the shared tour layout; each tour page only adds its own price table. Chopta is built from the Tungnath trek data (`src/data/tours.ts`), so the trek and tour pages can't disagree. The Auli page now uses the same component, with no visible change.

### 13 Nov 2026: Auli tour photo shows the mountains — `main`
- **For visitors:** the Auli Winter Escape card on /tours, its page header and its link preview now show our own Auli photo (`assets/skiing/IMG_5017`): the snow slopes and chairlift with the Himalayan range behind. It replaces the close-up of a skier.

### 13 Nov 2026: new Tours section (Auli now, Chopta next) — `main`
- **For visitors:** a new [/tours](https://www.himalayanarcadventure.com/tours) page lists short road-and-stay tours as cards. **Tours** replaces the short-lived "Trips" item in the top menu; the phone menu lists each tour and "All tours".
- **Auli page moved:** the Auli Winter Escape now lives at `/tours/auli-winter-escape`, with a Home / Tours breadcrumb. The old `/auli-winter-escape` link, live for a few minutes, redirects there permanently (`vercel.json`).
- **Code:** tours are listed in `src/data/tours.ts`, which feeds the Tours page, both menus, the footer and the sitemap. Chopta is added there once the owner sends its details.

### 13 Nov 2026: "Trips" in the menu — `main`
- **For visitors:** a new **Trips** item, right after Treks, in the top menu and the phone menu. It opens the Auli Winter Escape, the only trip so far. When a second trip is added, it can become a dropdown or a /trips page.
- **Layout:** menu links have slightly less padding between 1024 and 1280 px wide, so the "Book a trek" button still fits next to six items.

### 13 Nov 2026: course tabs match the trek tabs — `main`
- **For visitors:** the tab bar on course pages (Overview, Dates, Itinerary…) now uses the same underline style as the trek pages, instead of a blue pill. It keeps the course pages' sky-blue accent.

### 13 Nov 2026: new page, Auli Winter Escape (3 days from Rishikesh) — `main`
- **For visitors:** new page [/auli-winter-escape](https://www.himalayanarcadventure.com/auli-winter-escape) with the owner's full brief:
  - **Price:** Rs.10,000 per person, or Rs.8,000 each for groups of 4+.
  - **Group offers table:** 4, 5, 6 and 10 people. Phones get one card per group size.
  - **The rest of the brief:** the 3-day itinerary with meals and overnights, inclusions and exclusions, transport and important notes.
  - **Booking:** a "Book on WhatsApp" button (message pre-filled) and both phone numbers plus the email.
  - **Links:** in the footer and the sitemap. Fully server-rendered, with TouristTrip and breadcrumb structured data.
- **Code:** the package lives in `src/data/auliEscape.ts`. The group totals and savings are calculated from who pays what, and a test checks them against the brief (Rs.30,000 / 36,000 / 40,000 / 64,000; 25 / 28 / 33.3 / 36%). It isn't in the order API: booking is by WhatsApp or phone for now.

### 13 Nov 2026: unverified claims removed; payment guard written, **Backend** — `main`, live
- **For visitors (owner's decisions):**
  - **Removed:** the home-page and course testimonials, "No-cost EMI" (Trek Cost card and the perks list) and "India's highest motorable pass" (Mana Pass). The footer's dead Facebook and YouTube links are gone too; Instagram stays.
  - **Kept:** "since 2010" (the owner confirmed it), and "Filling fast", which comes from real seat counts.
  - **Home page:** the section heading is now "Stories from the mountains".
- **Data:** deleted the unused trek `rating`/`reviewCount` values and the `testimonials` lists (`treks.ts`, `courses.ts`). The price catalog is unchanged.
- **Backend (applied to Supabase on 13 Nov, owner approved):** new `supabase-payment-guard.sql` replaces `apply_payment()`.
  - **The bug, reproduced locally:** a ₹10,000 booking could take ₹13,000 (advance plus full order), and a cancelled or refunded booking could be marked fully paid.
  - **The fix:** the booking is left alone, and the payment is recorded and marked "Needs refund: …" on /admin/payments. The browser tells the customer to contact us; the webhook still answers 200, so Razorpay doesn't retry. `api/_lib/payments.js` logs `needs_refund` results.
  - **Tested:** 11 checks on an in-memory Postgres (PGlite) loaded with all 8 SQL files. All pass with the fix; 7 fail without it.
  - **Setup:** the setup script now runs the new file last.
  - **Applied on 13 Nov:** run on the live Supabase project. A check afterwards confirmed the new function is in place and only the server can run it.

### 13 Nov 2026: code graph refreshed — `main`
- **Tooling only:** rebuilt `graphify-out/` from `adventure-travel/src` with `graphify update` (local, no LLM cost): 855 nodes, 3,204 edges, built from `4740226`. A graph query costs about 1,600 tokens against ~57,000 for reading the source (35× fewer).

### 13 Nov 2026: pickup packages on Kuari Pass and Pangarchula Peak, **Backend** — `main`
- **Prices:** Pangarchula Peak costs ₹9,500 from Joshimath and ₹11,000 from Rishikesh, Haridwar or Dehradun. Its pages work the same way as Kuari Pass, described below.
- **For visitors:** the Kuari Pass page offers two packages, like the listing on Thrillophilia: **From Joshimath** at ₹7,500 and **From Rishikesh, Haridwar or Dehradun** at ₹9,000 per person. They appear in the Trek Cost card ("From ₹7,500"), as two package cards under the itinerary (each with its own "Show package details": transfers and "getting there" name that package's pickup town), and as a **Package** dropdown in the reservation form. The printed itinerary and Google's structured data list both prices.
- **For the business:** the chosen package shows on the booking in the dashboard, admin, checkout, payment emails and the WhatsApp message.
- **Backend:** no database change. A trek now has an optional `packages` list in `src/data/treks.ts`; `npm run catalog` writes it into the same option→price map as room tiers, so `api/bookings.js` checks the label and charges that package's price, stored in the existing `room_sharing` column. The catalog script refuses a trek with both tiers and packages, a first price different from `price`, or a label over 40 characters. New pricing test (85 passing).

### 13 Nov 2026: course dates as a calendar, like the treks — `main`
- **For visitors:** a course's Dates tab is now the same calendar as the trek pages: month chips, a month grid, the picked dates and **Register for this date**, which fills the booking form's date. A course can start any day of its season (e.g. Dec 2026 – Mar 2027), at least 3 days ahead, and must finish by the season's last day.
- **Honesty fix:** the old list said "Live availability" and marked batches "Filling Fast" or "Sold Out" from a fixed repeating pattern, not from real bookings. Every open date now just says Available.
- **Code:** new `src/components/StartDatePicker.tsx` and `src/lib/courseSeason.ts` (+ tests, 84 passing). Removed the made-up batch generator from `CourseDetailClient.tsx`.

### 13 Nov 2026: hero slideshow fixes; altitude meter removed — `main`
- **Owner's asks:** HIMALAYA must show on every photo, slides change every 2 seconds, and the side altitude meter goes.
  - The word is never placed higher than just under the navbar (it hid under it on wide laptop screens), and phones get their own height per photo because they see only the photo's middle.
  - The Nandi Kund photo is out: a trekker stands across the word on every screen size. Four slides remain (Panpatia Col ×2, Kuari Pass, Dronagiri).
  - Slides change every 2 s with a 0.8 s fade and keep going on hover; only the pause button (or reduced motion) stops them. The next two photos load ahead.
  - On phones the photo caption no longer pushes the copy and buttons off the right edge.
  - `AltitudeRail.tsx` deleted.
- **Checked:** `tsc`, `eslint`; all four slides at 1920×860, 1440×900, 1366×768 and 390×844.

### 13 Nov 2026: hero becomes a slideshow of mountains with HIMALAYA behind each ridge — `main`
- **For visitors (asked by the owner):** the hero now rotates through 5 of our photos (Panpatia Col ×2, Kuari Pass, Nandi Kund, Dronagiri). In each, the giant HIMALAYA sits behind the ridge, and people, a cairn pole or peaks stand in front of it. The caption names the trek and links to it; dots pick a photo; a pause button stops it. Autoplay stops on hover or focus and never runs under reduced motion.
- **Removed:** the separate "Seen on our treks" photo carousel added on 12 Nov (the owner preferred the 3D hero slideshow). `HomeWallpaper.tsx` deleted.
- **Images:** `public/assets/hero/<name>-bg.webp` and `-fg.webp` (the cut-out foreground, made by a sky flood-fill from the top edge with the ridge smoothed). Most of our photos have hazy or cloudy skies that don't cut cleanly; these five do. The old `ascent-bg/fg.webp` are replaced by `panpatia-1-*`.

### 12 Nov 2026: coupon codes design (no code yet) — uncommitted
- **Business:** design for three kinds of discount code in [`specs/003-coupons/design.md`](specs/003-coupons/design.md):
  - **first-booking** (10% or 20%, once per person, also across re-created accounts and Gmail aliases);
  - **partner/campaign** codes, which track which site or influencer brought each booking;
  - **loyalty** codes, unique to one customer and usable once; a forwarded code doesn't work for anyone else.

  Every code has a rupee cap.
- **Backend (planned, not built):** new `supabase-coupons.sql` (`coupons`, `coupon_redemptions`, `redeem_coupon()`, `issue_loyalty_coupon()`, coupon columns on both booking tables); discount locked into the booking `amount` at creation in `api/bookings.js`, so payments are unchanged apart from one check in `create-order.js`; env flags `COUPONS_ENABLED` and `NEXT_PUBLIC_COUPONS_ENABLED`. No new API function (stays at 8).
- **Review:** checked with the Elephant–Goldfish review (5 reviewers; [`specs/003-coupons/review.md`](specs/003-coupons/review.md)). Both blockers and all major findings are resolved in draft v2.

### 12 Nov 2026: home page photo carousel; HIMALAYA no longer hides under the navbar — `main`
- **For visitors:** a full-screen "Seen on our treks" slideshow right after the hero: 9 of our own photos from 7 routes, each captioned with the trek and its top altitude and linked to the trek page (reuses `WallpaperCarousel`; new `HomeWallpaper.tsx`).
- **Fix:** on wide, short laptop screens (e.g. 1920×860) the giant HIMALAYA sat under the navbar. It is now anchored to the ridge line and capped by screen height, checked at 1920×860, 1366×768, 1440×900 and 390×844.

### 10 Nov 2026: GoDaddy hosting guide; side branches removed — `main` (`f30a75e`)
- **Business:** new [`adventure-travel/docs/deploy-godaddy.md`](adventure-travel/docs/deploy-godaddy.md): how to upload the built `out/` folder to GoDaddy cPanel, and why online booking and payment stop working there (the 8 `api/` functions need Node.js). Recommendation: stay on Vercel, and move to Vercel Pro when Razorpay goes live, because the free Hobby plan is for non-commercial use.
- **Repo:** work now happens on `main` only. Deleted `preview/trek-slideshows` (local and GitHub), `redesign/ascent` and `hotfix/favicon` (all already in `main`). `feat/3d-mountains` is kept as the local tag `archive/feat-3d-mountains`; its folder `C:/Users/yuvra/dev/adventure-travels-3d` still has a dev server running and has to be removed by hand.

### 7 Nov 2026: "The Ascent" home page redesign, part 1 — `main` (merged from `redesign/ascent`)
- **Asked by the owner:** make the site stand out (motionsites.ai as inspiration), keep all the information. Audit first: a fresh graphify graph of `src/` (854 nodes, in `graphify-out/`), the live home page on desktop and phone, and motionsites' travel designs.
- **For visitors:**
  - **New hero:** a giant HIMALAYA set *behind* the peaks of our own Panpatia Col photo (the mountains are cut out into a second layer, `public/assets/hero/ascent-fg.webp`), with "One range. Two seasons.", the same pitch and buttons on the snowfield. Replaces the split summer/winter slider, whose headline was cut in two by the divider on phones.
  - **Altitude meter:** scrolling the home page climbs from Joshimath (1,875 m) to our highest route (5,942 m). Each tick is a real trek's top altitude, and the readout names the last one you've passed. A side meter on screens 1440 px and wider, a hairline under the navbar on smaller ones.
  - **The Range** (new section): every trek drawn as a peak at its real top altitude, laid out like a massif, with region filters, a detail card and the full list. It replaces the shape "map" (three hexagons) and the numbers strip; their facts (region lists, counts, the four headline numbers) are all in it.
  - **Navbar:** the green button is now **Book a trek** (to /treks). Sign up stays on the login page and in the phone menu.
  - **Stories:** the three cards no longer show made-up authors (Priya Sharma, Rahul Verma, Meera Nair) or reading times for articles that don't exist. They now say "Himalayan Arc team" and use our own photos instead of Unsplash.
- **Code:** new `AscentHero.tsx`, `AltitudeRail.tsx`, `TheRange.tsx`. Removed `SeasonSplitHero.tsx`, `StatsStrip.tsx`, `HimalayanMap.tsx` (no longer used).
- **Checked:** `tsc`, `eslint` (0 errors), `npm test` (77 passed); home page at 1600, 1440 and 390 px with no sideways scroll. Not yet checked: `npm run test:e2e`, Lighthouse.

### 7 Nov 2026: Home hero headline back to "ONE RANGE. TWO SEASONS." — `preview/trek-slideshows`
- The owner asked to keep the old headline instead of "TREK UTTARAKHAND. SKI AULI." (changed in `e472dd7`). Only the two headline lines went back; the newer subtitle (days and "from" price from the trek data) and the "Browse treks" button stay.

### 7 Nov 2026: **Backend** Razorpay webhook registered (Test Mode) — no code change
- **Business:** Razorpay now tells the site directly when a payment succeeds or fails, so a booking is marked paid even if the customer closes the tab before the success screen.
- **Backend:** the owner added the webhook `https://www.himalayanarcadventure.com/api/razorpay-webhook` (events `payment.captured`, `order.paid`, `payment.failed`) in Razorpay Test Mode. Checked on the live site: an event signed with the local `RAZORPAY_WEBHOOK_SECRET` returns 200 (so Vercel has the same secret), a wrong signature returns 400. The test used an ignored event type, so no booking or payment changed.
- **Not yet checked:** whether Vercel has the new test API keys, and a full test-card payment on a real booking.

### 7 Nov 2026: clearer home page hero, lighter winter videos, honest newsletter — `main`
- **Hero:** headline "TREK UTTARAKHAND. SKI AULI." with a concrete pitch: "Guided 3–15 day treks from Rs.5,000, with permits, guide and meals included. Ski and snowboard courses at Auli in winter." The day range and the "from" price are worked out from the trek data, so they stay true. Buttons: "Browse treks" and "Auli ski courses".
- **Winter videos 6 → 3:** the hero keeps the three lightest clips (1.3–2.7 MB) and drops the 3.6, 4.5 and 6.9 MB ones, so phones download much less.
- **Newsletter (footer):** there is no mailing list yet, so Subscribe now opens the visitor's email app with a ready "add me to updates" message to himalayanarcadventure@gmail.com, and says exactly that. Before, a valid email showed a red "enter a valid email" error.
- **Checked:** `tsc`, `eslint`, `npm test` (77 passed); hero checked at 390 px.

### 7 Nov 2026: Kuari Pass scroll story fixes (Moss Island style) — `preview/trek-slideshows`
- **Context:** the owner asked for option A (one scroll story) and pointed at motionsites.ai's "Moss Island" (scroll fly-in, data tags pinned into the scene, a frosted data card, a numbered index). `JourneyStory` uses those ideas with our own photos and trek data. Note: `0c64520` (another session) put an earlier version of the story **live on `main`**.
- **Fixes on top of the live version:** the altitude counter now shows each day's exact altitude (it ran half a chapter ahead, e.g. 2,468 m on Day 1); the descent day says "down to 1,875 m" instead of "Elev 1,875 m" over a high meadow photo; the summit tag no longer overlaps the day index; on phones the altitude card sits above the WhatsApp button; the booking ending fades the floating panels out.
- **Also:** the home `<main>` uses `overflow-x-clip` instead of `overflow-x-hidden` (hidden broke the pinned photo layer).
- **Hero:** restored twice to the original "ONE RANGE. TWO SEASONS." at the owner's request; another session had changed it to "TREK UTTARAKHAND. SKI AULI." (the backup diff is in Claude's scratchpad).
- **Checked:** `tsc`, `eslint`, impeccable detector (no findings); screenshots at 400 px and 1440 px at Day 1, the summit and the ending; no page errors.

### 7 Nov 2026: honest trust signals, booking form kept through sign-up, Kuari Pass scroll story — `preview/trek-slideshows`
- **Trust (no unverified claims):** star ratings and review counts are gone from trek cards, trek pages, the price card and Google's structured data (`aggregateRating`) until real reviews are collected. The made-up "10% OFF" strike-through price is removed. "100% Safe", "4.9+ Rating", "5,000+ Happy Adventurers", "100% Safety Record" and "98% Success Rate" are replaced with facts: all-inclusive, since 2010 (as in the footer), free date change, WhatsApp support, number of regions.
- **Booking without losing the form:** a signed-out visitor who books is sent to sign up with `?next=` back to the trek; the form is saved in the browser tab and restored on the Make Reservation tab. Log in and sign up follow `?next=` (same-site paths only).
- **Home page:** new `JourneyStory` section: Kuari Pass told day by day with our own photos as you scroll (altitude card, chapter index; respects reduced motion).
- **Checked:** `tsc`, `eslint` (no errors), `npm test` (77 passed).

### 7 Nov 2026: **Backend** new Razorpay test keys (local) — no code change
- **Asked by the owner** (a pasted "integrate Razorpay Standard Checkout" prompt with new test keys). Razorpay was already integrated, so no code was added. Checked against the prompt: order creation in paise (`api/create-order.js`, price from the server catalog, never from the browser), Checkout modal with UPI first, dismiss and `payment.failed` handling (`src/app/checkout/CheckoutClient.tsx`), HMAC-SHA256 `order_id|payment_id` check with a timing-safe compare that returns 400 and marks nothing paid on a mismatch (`api/verify-payment.js`), the webhook backstop (`api/razorpay-webhook.js`), and the Key Secret never reaching the browser (the server returns only the Key ID).
- **Backend:** `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` replaced with the new test-mode pair in `.env.local` and `.env.setup` (both git-ignored); Razorpay accepted them (HTTP 200). **Vercel still has the old test keys** (no `VERCEL_TOKEN`; the setup script would also re-run every SQL file, so it wasn't run). The webhook secret is unchanged.
- **Test payment done (asked by the owner, for Razorpay's onboarding step 3):** a ₹1 order was paid in Razorpay Checkout with test card 4100 2800 0000 1007. Payment `pay_Tx4zDNNdmBz6xz` is **captured**, and the signature passed the site's own check (`hmacHex`/`safeEqual` in `api/_lib/payments.js`). It was run directly against Razorpay, not through a booking, so nothing was written to the database. A few unpaid ₹1 test orders from the attempts stay in the Razorpay test dashboard (harmless).
- The new key secret was pasted in chat. It's test mode (no real money), and live keys will be a different pair anyway.

### 7 Nov 2026: walk-the-route altitude chart; trek filters that glide — `preview/trek-slideshows`
- **For visitors (asked by the owner: more interactive, motion inspired by motionsites.ai):** motionsites.ai sells prompts for AI site builders, not code, so it served as inspiration only. Most of the site already moves (hero, menu, carousels, reveals), so the additions go where they help a traveller decide, not on every section.
  - **Trek page "Elevation Profile" (every trek):** drag along it with a finger or mouse, or use the arrow keys. A marker glides from stop to stop, the stretch already walked fills in, and a readout shows the day, the camp, the altitude and the hours on trail. It opens on the summit day. Before, it worked only by hovering tiny dots with a mouse, so it did nothing on phones or with a keyboard. Now in `src/components/RouteProfile.tsx` (replaces `MiniElevationChart`).
  - **/treks filters:** when a filter or sort changes, the treks that stay glide to their new places and the rest fade out, instead of the list jumping. No animation on first load.
  - Both respect "reduce motion" (no movement, instant changes) and use the site's motion timings (`src/lib/motion.ts`).
- **Noted:** `graphify-out/` is from August and still describes the old "Expedition Happiness Treks" site; it wasn't used.
- **Backend:** none.
- **Checked:** `tsc`, `eslint`; in Edge at 400 px (touch drag) and 1440 px (keyboard); the filter narrows 22 → 4 with the glide; no page errors.

### 7 Nov 2026: clearer Google listing and a new site icon — `main` `a11e5e8` (live 7 Nov; the first production build failed on Vercel, a retry `8af2cf0` succeeded)
- **Google listing (asked by the owner: the result and its links didn't say what we sell):**
  - Home page title is now "Himalayan Arc: Uttarakhand & Himachal Treks, Auli Ski School" (was "… | Treks from Joshimath & Auli Skiing").
  - New description: "Small-group treks in Uttarakhand and Himachal with local guides from Joshimath, and a ski and snowboard school in Auli. Mountain days you will remember."
  - Link previews (WhatsApp, Facebook, X) use the longer "Himalayan Arc Adventure | Uttarakhand & Himachal Treks, Auli Ski School".
  - `/courses` is now "Auli Ski & Snowboard School" and `/activities` "Treks, Ski School & Camping in the Himalayas", so the ski school can show as one of the links under the result.
  - Google picks those links and sometimes rewrites titles and descriptions itself, so changes show only after it re-crawls (days to a few weeks). Requesting indexing in Search Console speeds this up.
- **Site icon (favicon), asked by the owner because the old one looked like clip art:** the generic sun-and-peaks icon is replaced by a mark drawn from the compass logo: a navy disc, a snow peak, a blue trail climbing to it and the orange map pin on the summit. It's drawn to read at 16 px. `public/favicon.svg` is the source; `favicon.ico` (16/32/48), `favicon.png` (192), `favicon-512.png` and `apple-touch-icon.png` (180, opaque) were rendered from it.
- **Footer:** the footer logo uses the new icon too (was the old compass picture).
- **Backcountry course:** gets the "What you'll be able to do" skill track (skinning and kick turns, first untracked line, avalanche rescue, a full-day tour), taken from its itinerary.
- **Code:** deleted the unused `CourseVideoBackdrop.tsx`.
- **Backend:** none.
- **Checked:** `tsc`, `eslint`, `npm test` (77 passed); the dev server serves the new title and icon links; icon checked at 16–96 px on light and dark backgrounds.

### 6 Nov 2026: calm course pages that lead with skills and price — `preview/trek-slideshows` `8e6acec`
- **For visitors (asked by the owner: the course photo showed behind the whole page and pulled focus):** on every course page (`/courses/<slug>`) the photos now stay in the hero slideshow only. The hero ends in a mountain-ridge edge, and everything below sits on a plain snow-white background instead of a white card floating over a full-page photo or video.
- **New "What you'll be able to do" track** at the top of the Overview tab: four day-by-day skills, ending with the certificate (across on desktop, down the side on phones). The steps come from each course's own itinerary, in a new `milestones` field in `src/data/courses.ts`, filled in for the 7-day and 2-week skiing and snowboarding courses. Backcountry has none yet, so the track is hidden there.
- **Clearer value:** each package card and the price card show a per-day cost (e.g. "About Rs.1,429 a day"). The three tinted fact boxes are now one tidy row: Who it's for, Group size, Time on snow.
- **Code:** `WallpaperCarousel` takes an optional `controlsClassName` so the course hero can lift its arrows above the ridge; other pages are unchanged. The course page no longer uses `CourseVideoBackdrop` (the component file is still there, now unused).
- **Backend:** none.
- **Checked:** `tsc`, `eslint`, the impeccable design detector (no findings); screenshots at 400 px and 1440 px on the skiing and snowboarding courses.

### 6 Nov 2026: treks leave every day of their season; calendar-style Dates tab — `preview/trek-slideshows` `8e6acec`
- **For visitors (asked by the owner, after Indiahikes and Trek The Himalayas):** a trek's Dates tab is now a calendar. Month buttons along the top (season months only), a month grid with every start date, and a "Your trek dates" panel (e.g. "Thu 17 Dec – Mon 21 Dec 2026 · Available") with **Register for this date**. No more fixed seat counts: dates show Available, Filling fast, Full (waitlist on WhatsApp) or Closed.
- **Season calendar:** short and popular treks (Kuari Pass, Pangarchula, Valley of Flowers, Kedarkantha, Brahmatal, Har Ki Dun, Roopkund, Hampta Pass, Bhrigu Lake, Tungnath, Madhyamaheshwar) start **every day** of their season. Expeditions and permit tours (Satopanth, Nandi Kund, Dronagiri, Nanda Devi BC, Kalindi Khal, Gupt Khal, Panpatia Col, Mana Pass, Niti Pass, Rimkhim) start **every Saturday**. Windows follow the region's calendar: no Jul–Aug monsoon except monsoon treks, snow treks Dec–Apr, high passes only in June and September, Bhrigu Lake from June, Madhyamaheshwar until mid-November. Dates open 3 days ahead (21 days for expeditions, for permits) and run 12 months out. The calendar lives in `src/data/trekSeasons.ts` (`DEPARTURE_CALENDAR`); a unit test keeps it inside each trek's `bestSeason`.
- **More reliable:** the dates are worked out in the browser, so they show even when the database is unreachable (before, the tab went empty).
- **Booking form:** the long batch drop-down is now a date field limited to the season, with a hint ("Starts every day, 15 Sep – 30 Jun"). Out-of-season or too-soon dates get a clear message; for expeditions another in-season day is a private departure. The booking card shows "Next departure … Starts every day".
- **Admin / Backend:** no database or API change. Rows in `/admin/departures` now only override a date (close it, tag it, cap its seats); the already-seeded Saturday rows keep working that way. `supabase-departures-seed.sql` is marked superseded (don't re-run).
- **Checked:** `tsc`, `eslint`, `npm test` (77 tests, 7 new); in the browser at 390 px and 1280 px on Kuari Pass, Kalindi Khal and Valley of Flowers.

### 6 Nov 2026: "Enquire now" side tab on trek and course pages; realistic mountain graphic — `preview/trek-slideshows`
- **Enquire tab (asked by the owner, after oknadesigns.com; restyled the same day because the first orange version looked sloppy):** every trek and course page, plus the /treks and /courses lists, has a slim frosted-ice "ENQUIRE" tab on the right edge. It sits lower on phones, near the thumb, and in the middle on desktop.
  - Look: pale sky-white glass, navy lettering, a small chat bubble and a soft offset shadow, so it doesn't fight the page's own buttons.
  - Motion: it slides in after about a second. A band of cold light runs down it every 7 seconds, so a phone visitor notices it without it pulling attention. Reduced-motion settings get it still.
  - On the list pages the popup asks "Not sure which trek?" or "Questions about a course?" instead of naming one. Tapping it opens the enquiry popup headed "Enquire about <trek or course>", with that trek's or course's own photos, WhatsApp and Call buttons, and a form (name, phone, message pre-filled with the trek or course name) that opens WhatsApp ready to send. Code: new `EnquireTab.tsx`; `ContactPopup` gains a `heading` prop.
- **Mountain graphic redrawn (the owner said the smooth green curve looked unprofessional):** `ElevationLine` now draws each trek's altitude profile as a mountain range instead of a chart line:
  - a jagged ridge, with cols between the route's stops and rocky detail between them
  - snow caps on the high ground, with tongues down the gullies
  - shaded faces on the two highest summits
  - a paler range behind, masked so it never shows through the front.
  - The chart-style summit dot is gone.
  - Colours: grey-blue rock on white sections (stats strip, closing section, desktop timeline, map cards), white ridges on photos, slate on navy.
  - The "no photo" trek panel drops its chart gridlines and dot; the range now stands across the lower half of the panel.
  - Small cards use a `compact` version (front ridge and snow only), to keep the page light.
  - The drawing is seeded, so the static HTML and the browser draw the same mountains.
- **Checks:** type-check clean, lint 0 errors. In an isolated production build, the tab opens the right popup on `/treks/kuari-pass` and `/courses/skiing-course` at 1280 px and 390 px, with no page errors.

### 6 Nov 2026: Home page on phones and tablets: swipeable photo cards, card slideshows, animated timeline — `preview/trek-slideshows`
- **Why:** the owner said the home page looked like plain lists on phones and tablets, and asked for cards whose photos change every 1–2 seconds, like the course pages.
- **For visitors (below 1024 px; desktop unchanged):**
  - **Which trek is right for you?** Four swipeable photo cards (Easy to Strenuous) with frosted duration and altitude boxes, the trek count and starting price, and a green arrow button. Was four long text blocks.
  - **Snow School:** the featured course is a card with date and duration pills and a full-width "Book this course" button. The other courses are swipeable photo cards with type and duration tags, ending on an "All 5 snow courses" card.
  - **Built around safety:** six icon tiles, two per row on phones and three on tablets. Was a numbered list.
  - **Choose Your Mountain:** swipeable camp photo cards with tag pills, plus an orange "Custom camps" card. Each still opens the photos and the enquiry form.
  - **Reviews and stories:** swipeable quote cards with initials, stars and a quote mark, and tall story photo cards.
  - **Map:** the region's treks are a swipe row of small cards, each with the trek's altitude line. Was a list of 18 links.
  - **Restricted Uttarakhand:** the three expeditions are a swipe row; the perks are pills.
  - **From first idea to summit day:** a vertical timeline whose green line fills in as you scroll, with numbered circles; each step fades in.
  - Every swipe row has a small progress bar, cards slide in from the right the first time the row scrolls into view, and they shrink slightly when tapped.
  - On phones the home page is about 5,000 px shorter (about 21,000 down to 16,000).
- **Card slideshows (all widths):** the trek photo cards, the difficulty cards, the snow-course cards, the camp cards and the "Where to today?" course cards cross-fade through their own photos every 1.8 seconds with a slow zoom. Only cards on screen change, each next photo loads one step ahead, cards don't all change on the same beat, and reduced-motion settings get a still photo. Treks without their own photos keep one cover.
- **Code:**
  - New `SwipeRail` / `RailItem` and `CardSlideshow` components.
  - Trek photo lists moved from `TrekDetailClient.tsx` to `src/data/trekGalleries.ts` (`TREK_GALLERIES`, `trekPhotos()`); added `coursePhotos()` in `courses.ts`.
  - `useDeferredReveal` is now exported from `MotionWrapper`.
  - Edited `FindYourTrek`, `SnowSchool`, `WhyTrekWithUs`, `CampingSection`, `StoriesTestimonials`, `HimalayanMap`, `UnlockRestrictedUttarakhand`, `HowItWorks`, `SummerTreksRail` (`TrekPhotoCard`) and `WelcomeChooser`.
- **Checks:** type-check clean, lint 0 errors, 70 unit tests pass. In an isolated production build at 390 px and 768 px, all 7 new swipe rows reveal on scroll, and the first snow-course card changed photo at about 2 s and 4 s, loading one photo ahead.

### 6 Nov 2026: **Live**: new phone menu, styled after oknadesigns.com — `bebc607`, `preview/trek-slideshows` and `main`
- **For visitors (phones and tablets):** the menu now drops down from the top as a white panel instead of sliding in dark from the right. It has the logo with a thin close X, a hairline, then plain uppercase links with open letter-spacing and no boxes or arrows: Home, Treks ˅, Destinations, Courses, Activities ˅, FAQ, Contact. The page you're on shows in green.
  - **Treks ˅** opens All treks (21), Uttarakhand (19), Himachal Pradesh (2), Treks from Joshimath and Winter treks; **Activities ˅** opens the four activities. These replace the old region and difficulty chips.
  - Log in and Sign up (or My bookings and Log out) sit under a second hairline.
  - A navy band at the bottom lists 4 popular treks next to a round green WhatsApp button.
  - **FAQ** is new in the phone menu.
- **Code:** `Navbar.tsx` (the mobile `SheetContent`, `MOBILE_NAV`, `MOBILE_ROW`); `ui/sheet.tsx` gains `side="top"`. The desktop menus are unchanged.
- **Checks:** type-check and lint clean. In an isolated production build at 390×844 and 360×640, every menu row is 40–44 px tall, focus starts on the close button, and Escape closes the menu and returns focus to the menu button.
- **Deploy note:** the first production build (`2523bbd`) failed because Turbopack couldn't download the Inter font from Google Fonts during the build; the same code had just built as a preview. A redeploy (`npx vercel redeploy`) went live in 1 minute.
: copy rewrite, trek fact fixes and the checkout seat hold; **Backend** database update applied — `preview/trek-slideshows` and `main`
- **Live on www.himalayanarcadventure.com:** the 29 Oct copy rewrite with the shared brand icons (`4a6900d`) and the Trek The Himalayas fact fixes (`79beeae`), then the seat-hold commit. Before the first push: production build of a copy, 6 browser tests and 70 unit tests all passed.
- **For visitors:** paying for a listed trek batch now holds the group's seats for 15 minutes, and the Razorpay window closes when the hold ends, so the last seats can't be sold twice. On /treks the first card runs wide only when the cards below it fill whole rows.
- **For the business:** sign-up confirmation emails are now limited to 20 an hour (was 2), so the 3rd sign-up in an hour gets its email.
- **Backend, database** (owner's OK on 5 Nov): Claude ran `node scripts/setup-backend.mjs` after a dry run. All 7 SQL files ran on `sdhtgmlkzcknmeakxgdz` and the Auth settings were re-applied. Read-only check afterwards:
  - `hold_trek_seats()` and `trek_bookings.seats_held_until` exist.
  - 32 indexes (was 23); 24 security rules, none left in the slow per-row form.
  - Browsers still can't insert trek bookings or call the seat hold.
- **Backend, code:** the 29 Oct seat-hold work is committed and deployed: `create-order` with `departures.holdSeats()`, `supabase-scale.sql`, the setup-script change, and `vercel.json` with functions in Mumbai (`bom1`).
- **Also:** removed a stray line of table text from the top of this file.
- **Checks:** 70/70 unit tests, type-check and lint clean.

### 29 Oct 2026: Trek facts corrected against Trek The Himalayas — `preview/trek-slideshows`
- **Source:** trekthehimalayas.com (as the owner asked), plus the Himalayan Club for Gupt Khal.
- **Altitudes:**
  - **Pangarchula:** 4,700 m → **4,600 m** (TTH: 4,600 m / 15,100 ft).
  - **Bhrigu Lake:** 4,300 m → **4,200 m** (TTH: about 4,200 m / 13,700 ft). The FAQ said 14,100 ft; it now says about 13,700 ft.
  - **Dronagiri Base Camp:** the highest point was 4,500 m while day 7 said 4,920 m. Now the Bagini base camp is **4,600 m** and Changabang/Bagini Glacier **4,900 m**, with a **4,900 m** maximum, matching TTH's Bagini itinerary; the elevation chart follows.
  - Hemkund (14,100 ft) and Hampta Pass (14,100 ft) already matched TTH, so no change.
- **Places:**
  - **Valley of Flowers:** location changed from "Rishikesh" to **Govindghat, Chamoli**.
  - **Satopanth:** "Joshimath" → **Mana, Badrinath**.
  - **Brahmatal:** Lohajung is in **Chamoli, Garhwal**, not Kumaon.
  - **Hampta day 6:** Chhatru is in **Lahaul**, not Spiti.
  - **Gupt Khal:** links the **Gangotri and Badrinath (Mana)** sides, not Kedarnath.
- **Counts:** the stats strip and /activities now count from the trek list itself: **21** treks (was 18, 17 and "9+" in different places), **166** total trek days (was 204), highest altitude 5,942 m.
- **FAQ:**
  - **Removed:** answers about Triund, Kareri Lake and Beas Kund (treks the company doesn't run). Nag Tibba became Tungnath.
  - **Kedarkantha:** no longer says "open year-round". It is best December to April, and to be avoided in July and August.
  - **Pickups:** the answer now matches each trek's real start town: Joshimath for the "Joshimath to Joshimath" treks, Dehradun for Sankri and Lohajung treks, Manali for Himachal, Delhi for Tungnath.
- **Not changed (owner's call):** prices (Mana Pass, Niti Pass and Rimkhim at Rs. 5,000), whether the Joshimath treks start with the Rishikesh drive on day 1, and the Nanda Devi campsite height.
- **Checks:** type-check clean, lint 0 errors, 70 unit tests pass.

### 29 Oct 2026: **Backend** health check, checkout seat hold, scale fixes — committed and live 5 Nov (entry above)
- **Health check (live site):** every page loads; every API function answers correctly (`bookings` 400 on an empty request; `create-order`, `verify-payment`, `account` 401 "Please sign in"; `razorpay-webhook` 400 "Invalid signature"; `cron` 401; `geo` and `rates` 200). Supabase project `sdhtgmlkzcknmeakxgdz` (Mumbai) is healthy: 3 users, 3 trek bookings, 0 payments, 6 emails sent, 215 upcoming batches, 12 MB of 500 MB.
- **Problems found on the live system:**
  - **Sign-up emails are limited to 2 an hour** (Supabase Auth `rate_limit_email_sent` = 2). Sign-up needs a confirmation email, so the 3rd sign-up in an hour fails.
  - **No admin account** (0 users with the admin role), so `/admin/*` can't be used.
  - **Payments are in Razorpay Test Mode** on the live site: real customers' cards and UPI can't pay. The Razorpay webhook isn't confirmed as registered.
  - **Hosting is Vercel Hobby**, which Vercel limits to non-commercial use. It has no overage billing: when a monthly limit runs out, the feature is paused until the next cycle.
  - **The functions ran in Washington DC (`iad1`)** while the database is in Mumbai, so every booking and payment request crossed the world several times.
  - **Page weight:** the home page downloads 14.7 MB on desktop and 7.1 MB on a phone, mostly the `.MOV` hero videos. Desktop home makes 110 requests, 55 of them background link prefetches. Trek and course pages are about 1.6–2.5 MB.
- **For visitors:** when someone pays for a listed trek batch, their seats are now held for 15 minutes (like a flight seat hold), and the Razorpay window closes when the hold ends. Two people can no longer both pay for the last seats of a batch.
- **Backend:**
  - `supabase-departures.sql`: new column `trek_bookings.seats_held_until` and the function `hold_trek_seats()` (server only). It locks the batch row, so concurrent checkouts take turns. `trek_departure_availability()` now counts held seats.
  - New `supabase-scale.sql` (run last): indexes for dashboards, admin lists and the reminder job; all 24 row-level security rules now evaluate `auth.uid()` / `is_admin()` once per query instead of once per row (same rules); fixed `search_path` on 3 functions; explicit table grants, because from 30 Oct 2026 Supabase stops granting new tables to the API automatically (existing tables keep theirs).
  - `api/create-order.js` holds the seats through `departures.holdSeats()` and returns `seatsHeldUntil`; `CheckoutClient.tsx` passes it to Razorpay as `timeout`.
  - `vercel.json`: functions now run in **Mumbai (`bom1`)**, next to the database (takes effect on the next deploy).
  - `scripts/setup-backend.mjs` runs the new file and now also sets the sign-up email limit to 20 an hour (`rate_limit_email_sent`; Supabase's default is 2).
  - **Applied 5 Nov** (entry above). Before that, both SQL files were run on the live database only inside transactions that were rolled back (results below).
- **Checks:**
  - Unit tests: 70/70 pass, including 5 new seat-hold tests. Type-check and lint are clean.
  - Rolled-back dry run on the live database: with 6 seats and 1 sold offline, a group of 3 is held, the next group of 3 is refused, and a group of 2 takes the last seats. All 24 rules were rewritten; browsers can't call the hold. Re-running all 7 setup files twice ends in the same state, with users and bookings untouched.
  - Afterwards the database was confirmed unchanged.
  - **Browser test** (agent-browser, local dev server with the latest code, desktop 1440 px and phone 390 px):
    - 12 pages load with 0 page errors, no console errors and no sideways scrolling on the phone; `/checkout` and `/dashboard` send signed-out visitors to `/login`.
    - The trek Dates tab reads live seats from the database (`trek_departure_availability`, 200 OK; July–Sept 2027 batches shown).
    - The footer's new brand icons render with labels.
    - Local API (`npm run dev:api`): `create-order` and `verify-payment` answer 401 when signed out, `bookings` 400 on an empty request, so the updated code loads.
    - Confirmed the booking gap: a signed-out visitor who fills the reservation form and submits lands on `/signup` with every field empty, and nothing reaches the server.
    - Not covered (needs the database update applied and a test login): the seat hold, the Razorpay timeout, dashboard, checkout and admin.
  - The checkout part of this change (`CheckoutClient.tsx`, Razorpay `timeout`) was committed with `4a6900d` and is on the preview branch. It took effect with the updated `create-order` on 5 Nov.

### 29 Oct 2026: Site copy rewritten to sound human; shared brand icons — `preview/trek-slideshows`
- **Why:** the owner asked to use the `no-ai-slop` and `anti-ai-slop-writing` skills (and `better-icons`). The site had about 87 stock AI/marketing words ("pristine" ×19, "breathtaking" ×12, "stunning" ×11, "unforgettable" ×9, "world-class", "epic", "seamless", "experience the magic") and about 300 em dashes.
- **For visitors:** trek, course and destination descriptions, itinerary days, the FAQ, page intros and section text now say plainly what happens and where (heights, villages, peaks, days) instead of hype. Example: Kedarkantha "Experience the magic of winter trekking… Perfect for beginners" → "Kedarkantha is a winter summit trek from Sankri in Uttarakhand, up to 3,800 m through snow and pine forest. A good first snow trek for beginners." Banned words: data 48 → 13 (all left are inside customer quotes), pages 34 → 0. Em dashes in page copy 153 → 19 (legal/payment text and a testimonial left as is).
- **Kept exactly:** every number, price, altitude, date, place and trek name, search keywords, customer testimonials, legal and cancellation wording, payment screens, and the claims waiting for the owner's decision. "Epic Adventures" stat label is now "Treks & Expeditions"; "Bir Billing, world's best site" is now "a well-known paragliding site".
- **Icons:** new `src/components/BrandIcon.tsx` holds the official WhatsApp, Instagram, Facebook, YouTube and Google marks (Simple Icons, fetched with the better-icons CLI). The WhatsApp button, contact pop-up, course page and footer now use it instead of separate hand-copied SVGs (same look, one source).
- **Skills:** `no-ai-slop`, `anti-ai-slop-writing` and `better-icons` are installed in `.claude/skills/` (git-ignored) for future copy and icon work. Superdesign was not used: the repo is an unmaintained VS Code extension and its replacement is a paid web service needing an account.
- **Checks:** type-check clean, lint 0 errors, 65 unit tests pass production build OK, all 6 browser tests pass, 70 unit tests pass.

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

### 23 Oct 2026: Permanent redirect himalayanarcadventure.com → www (308) — Vercel setting, no code change
- **SEO:** the bare domain answered with Vercel's default **307 Temporary** redirect because it wasn't attached to the project. It is now attached to the `adventure-travels` project as a **308 Permanent** redirect to `www.himalayanarcadventure.com` (checked: `/` and `/favicon.ico` both return 308). This tells Google that www is the one real address, which helps it settle the site's listing and favicon.
- **Favicon check (as Googlebot):** icon links are on the home page, `/favicon.ico` (16/32/48 px) and `/favicon.png` (192 px) load as images, robots.txt doesn't block them. The grey globe in Google is now only waiting for Google to re-crawl.

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
Run in this order, either with `node scripts/setup-backend.mjs` or in the Supabase SQL Editor. **Status: files 1–5 ran on 19 Oct 2026, and all 7 in their current versions on 5 Nov 2026, on Supabase project `sdhtgmlkzcknmeakxgdz`**, the only project so far; the owner hasn't said yet whether it's dev or production. Verified afterwards:
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
| 6 | `adventure-travel/supabase-departures.sql` | Batch calendar, seats left; (29 Oct) checkout seat hold `hold_trek_seats()` | ☑ 23 Oct · 29 Oct version ☑ 5 Nov |
| 7 | `adventure-travel/supabase-scale.sql` | Indexes, faster security rules, fixed search_path, explicit grants | ☑ 5 Nov |
| 8 | `adventure-travel/supabase-payment-guard.sql` | `apply_payment()` no longer overcharges or pays cancelled/refunded bookings; flags them "Needs refund" | ☑ 13 Nov |

After running them, give the business account admin rights (snippet at the top of file 2), then sign out and back in.

### API functions (`adventure-travel/api/`, Vercel)
| Function | Purpose | Status |
|---|---|---|
| `bookings` | Create trek/course bookings with the price locked | Live (23 Oct) |
| `create-order` | Start an advance, balance or full payment; holds a trek group's seats for 15 min | Live (seat hold from 5 Nov) |
| `verify-payment` | Confirm a payment from the browser | Live (23 Oct) |
| `razorpay-webhook` | Razorpay's confirmation (the source of truth) | Live; webhook registered in Razorpay Test Mode (7 Nov) |
| `account` | Claim signed-out bookings; delete account | Live (23 Oct) |
| `cron` | Daily reminders and email retries | Live (03:30 UTC daily) |
| Region | All functions | `bom1` (Mumbai) from 5 Nov; was `iad1` (US East) |
| `geo`, `rates` | Display currency | Live |
| ~~`course-bookings`~~, ~~`claim-bookings`~~ | Replaced by `bookings` and `account` | Removed |

### Environment variables (Vercel → Settings, and `adventure-travel/.env.local` for local work)
| Variable | Needed for | Set? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Accounts, bookings, dashboard. Production build refuses to run without them | ☑ local · ☑ Vercel Preview · ☑ Vercel Production (checked 29 Oct) |
| `SUPABASE_SERVICE_ROLE_KEY` | Every API function | ☑ local · ☑ Vercel Preview · ☑ Vercel Production |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Online payments (**Test Mode** keys) | ☑ local · ☑ Vercel Preview · ☑ Vercel Production |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `BOOKING_TO_EMAIL` | Booking, payment and reminder emails (Gmail) | ☑ local · ☑ Vercel Preview · ☑ Vercel Production |
| `CRON_SECRET` | Daily reminder job | ☑ local · ☑ Vercel Preview · ☑ Vercel Production |

### Testing status
| Check | Result |
|---|---|
| Unit tests (`npm test`) | 70/70 pass (5 Nov) |
| Type-check, lint | Clean; 0 lint errors |
| Production build | Passes (48 static pages) |
| End-to-end scenarios V1–V22 (`specs/001-persistent-backend/quickstart.md`) | Not run; needs Supabase, Razorpay test keys and SMTP |
