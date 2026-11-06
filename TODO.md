# TODO

What's left, most urgent first. Tick items off here and record the change in [CHANGELOG.md](CHANGELOG.md).
**You** = the business owner (accounts, dashboards, decisions). **Dev** = code work Claude or a developer can do.
Last updated: 7 Nov 2026.

- [x] ~~**You: check the new phone menu on the preview**~~ (6 Nov, styled after oknadesigns.com). Live on 6 Nov.
- [x] ~~**You: check the new phone/tablet home page on the preview** (6 Nov: swipeable photo cards, photo slideshows on cards, timeline), the redrawn mountain graphic and the "Enquire now" tab on trek and course pages, then say "go live".~~ Live on 7 Nov (`de34d31`, by request).
- [x] ~~**Dev:** calm course page background, day-by-day skill track and per-day prices~~ (6 Nov, on the preview branch, uncommitted).
- [x] ~~**Dev:** clearer Google title and description, ski school page title, new site icon~~ (7 Nov, on the preview branch, uncommitted).
- [x] ~~**Redeploy the 7 Nov change.**~~ Claude retried it; live on 7 Nov (`8af2cf0`).
- [x] ~~**Dev:** walk-the-route altitude chart on trek pages; gliding trek filters~~ (7 Nov, on the preview branch).
- [ ] **You: put the new Razorpay test keys into Vercel** (7 Nov): Vercel → adventure-travels → Settings → Environment Variables → edit `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (copy them from `adventure-travel/.env.local`) → Deployments → ⋯ → Redeploy. Then in the new Razorpay account (Test Mode) add the webhook `https://www.himalayanarcadventure.com/api/razorpay-webhook` with the `RAZORPAY_WEBHOOK_SECRET` from `.env.local`, events `payment.captured`, `order.paid`, `payment.failed`.
- [ ] **You: try the new altitude chart on the preview** (any trek page, "Elevation Profile": drag along it on your phone), then say "go live".
- [ ] **You: are the trek card star ratings real?** Cards show e.g. "★ 4.9 (623)", typed into `src/data/treks.ts`. If they aren't from real reviews (Google, TripAdvisor), remove them: invented ratings can get the site penalised by Google and break consumer-protection rules.
- [ ] **You: after these go live,** open Google Search Console → URL inspection → request indexing for the home page, `/courses` and `/activities`, so Google picks up the new titles and icon sooner. Google chooses the links under the result itself; it can take a few weeks.
- [x] ~~**Dev:** footer logo uses the new icon~~ (7 Nov).
- [x] ~~**Dev:** Backcountry skill steps; deleted the unused `CourseVideoBackdrop.tsx`~~ (7 Nov).
- [ ] **You (optional):** glance at the course skill steps on each course page; tell Claude if any line is wrong.
- [x] ~~**Dev:** daily departures through each trek's season, Calendar-style Dates tab~~ (6 Nov, on the preview branch, `8e6acec`).
- [ ] **You: check the season windows** in `adventure-travel/src/data/trekSeasons.ts` (`DEPARTURE_CALENDAR`, also listed in CHANGELOG 6 Nov), e.g. whether Roopkund or Satopanth should run daily instead of weekly, and the 3-day / 21-day booking notice.
- [ ] **You: decide about the old seeded Saturday dates** in the database. They still show as overrides, and some fall outside the new windows (e.g. Kuari Pass in early September). Claude can delete the ones outside the season (a live database change, needs your OK).
- [ ] **Dev (optional, needs a SQL change):** count bookings on generated daily dates, so a busy day turns "Filling fast"/"Full" by itself. Today only dates with an admin row can fill up.
- [ ] **Dev:** self-host the three fonts (`next/font/local`) so a Google Fonts hiccup can't fail a build again (it failed one production build on 6 Nov).
- [ ] **Dev:** card slideshows load more photos per home visit. Shrink card photos to about 800 px (they are 1600 px today) in `scripts/prepare-photos.mjs` to save phone data and Vercel bandwidth.

## Backend health check, 29 Oct (details in CHANGELOG)
Works today: accounts, trek and course bookings, booking emails and the payment flow (in test mode).
- [x] ~~**You: apply the database update and the email limit.**~~ Done 5 Nov: with your OK, Claude ran `node scripts/setup-backend.mjs`. All 7 SQL files are applied (15-minute seat hold, speed fixes) and sign-up emails are limited to 20 an hour (was 2). Checked afterwards.
- [ ] **You: choose the admin account.** Nobody has admin rights, so `/admin` is unusable. Tell Claude which email (it must already be signed up), or set `ADMIN_EMAIL` in `.env.setup` and run the setup script.
- [ ] **You: switch Razorpay to live keys and register the webhook.** The live site still takes test payments only, so real customers can't pay online.
- [ ] **You: upgrade Vercel to Pro (about $20 a month).** Hobby is for non-commercial use only, and it pauses the site when a monthly limit runs out. At today's page weight that's around 10,000 visitors a month (100 GB of bandwidth, 1M requests).
- [ ] **You (before traffic grows):** move email from Gmail (about 500 a day) to a transactional sender such as Brevo, Resend, Amazon SES or Zoho ZeptoMail. Then consider Supabase Pro ($25 a month): daily backups, no pausing, 100k monthly users instead of 50k.
- [x] ~~**Dev:** deploy the 29 Oct changes (commit and push to `main`).~~ Done 5 Nov; the server functions now run in Mumbai, next to the database.
- [ ] **Dev:** shrink the hero videos (14.7 MB home page on desktop, 38 MB of `.MOV` files). Needs ffmpeg (`winget install ffmpeg`).
- [ ] **Dev:** the admin lists load at most 500 bookings per type and 1,000 customers, and search runs only over those. Move search into the database before about 1,000 customers.
- [ ] **Dev:** cut background link prefetching (55 requests per desktop home visit) to save Vercel request quota.

## MakeMyTrip-style booking flow (asked 29 Oct; needs your choices)
Already there: live batch dates with seats left, a price locked on the server, a 30% advance or full payment, UPI-first Razorpay, a dashboard with "Pay balance" and "Cancel", booking emails and (live from 5 Nov) a 15-minute seat hold.
- [ ] Book without losing the form: sign in or sign up inside the booking step (today a signed-out visitor is sent to `/signup` and loses what they typed).
- [ ] A review step before payment: trip summary, price breakdown (per person, room tier, GST if it applies, total, amount now), and a "seats held 14:59" timer.
- [ ] Traveller details per person (name, age, gender, ID for permits) and an emergency contact.
- [ ] A confirmation page plus a downloadable voucher or invoice (PDF) with the booking ID; WhatsApp confirmation.
- [ ] My Trips: Upcoming, Completed and Cancelled tabs; cancel with a refund preview from the cancellation policy; request a date change.
- [ ] Offers: coupon codes and an early-bird price. **You:** which offers, and is GST charged on top of the listed prices?
- [ ] Add-ons: Rishikesh or Dehradun pickup, gear rental, trek insurance. **You:** which, and at what price?

## 0. Do these first (5 minutes each, big effect)
- [x] ~~Ship the favicon hotfix~~ (done 19 Oct: `a42c960` pushed to `main`).
- [ ] **You: Search Console → URL Inspection → home page → Request indexing**, so Google re-reads the new favicon. Allow days to weeks before the logo replaces the grey globe.
- [ ] **You: make the GitHub repo private.** GitHub → `YuvrajBhardwaj/adventure-travels` → Settings → General → Danger Zone → "Change visibility" → Private. Right now anyone can download the whole site: every photo and video original, the code, the database design and the business documents. Vercel still deploys from a private repo.
- [x] **You: make the www redirect permanent.** (done 23 Oct by Claude via the Vercel API: 308 now) Vercel → Project → Settings → Domains → `himalayanarcadventure.com` → redirect to `www.himalayanarcadventure.com` with **308 Permanent** (it is 307 Temporary now). Google treats a temporary redirect as "this might change".
- [ ] **You: Google Search Console.** After the next deploy, go to Sitemaps → submit `https://www.himalayanarcadventure.com/sitemap.xml`, then use URL Inspection → "Request indexing" on the home page and the 5 most important trek pages. The domain is only 19 days old, so this is how Google finds it fastest. Requesting the home page also makes Google re-read the favicon, which was fixed on 19 Oct. Allow days to weeks before the logo replaces the grey globe in results.
- [ ] **You: Google Business Profile** for the Joshimath office, with the same name, address and phone as the website footer, real photos, and a review request after each batch. Steps are in `adventure-travel/docs/seo/2026-10-19-audit-and-plan.md`.

## 1. Set up the backend (blocks login, booking and payments)
Until this is done, login and sign-up show "Accounts are temporarily unavailable". This is true on this computer and almost certainly on the live site too.

**Fast way (new):**
1. Create the Supabase project.
2. Copy `adventure-travel/scripts/setup-backend.example.env` to `adventure-travel/.env.setup` and fill it in (instructions are inside).
3. From `adventure-travel/`, run `node scripts/setup-backend.mjs --dry-run`, then `node scripts/setup-backend.mjs`.

That covers most of the items below. The manual steps are listed in case you prefer the dashboards.

- [x] ~~Create a Supabase project~~ (ref `sdhtgmlkzcknmeakxgdz`). **You:** is this the production project or a dev one?
- [x] ~~Run the 5 SQL files~~ (done 19 Oct by the setup script, and verified).
- [x] ~~Supabase Auth: confirm email, site URL, redirect URLs~~ (done 19 Oct by the setup script).
- [ ] **You: admin rights.** Sign up on the site with your email, put that email in `ADMIN_EMAIL` in `adventure-travel/.env.setup`, and run `node scripts/setup-backend.mjs` again (or tell Claude the email).
- [x] **You: Gmail App Password** (done 23 Oct; **rotate it before go-live**, it was shared in chat) into `.env.setup` (`SMTP_USER`, `SMTP_PASS`), then re-run the script. Until then Supabase only emails your own team, a few per hour, so customers can't confirm their sign-ups.
- [ ] **You (optional):** Supabase → Authentication → Providers → Google, for "Continue with Google". It needs a Google Cloud OAuth client.
- [x] **You:** Razorpay in **Test mode** (keys done 23 Oct; **still to do: add the webhook in the Razorpay dashboard**): copy the keys into `.env.setup` and re-run the script. Then add a webhook to `https://<site>/api/razorpay-webhook` for `payment.captured`, `order.paid` and `payment.failed`.
- [x] ~~Make up a `CRON_SECRET`~~ (the setup script generated one, 19 Oct).
- [x] ~~Supabase keys into Vercel **Preview**~~ (done 21 Oct with the logged-in Vercel CLI; the preview is redeployed and connected). **Production** gets them at go-live (§3). The local `.env.local` is done too, and the running dev server already picked it up.
- [ ] **Dev:** after you add the SMTP and Razorpay keys to `.env.setup`, load them into `.env.local` and Vercel Preview the same way, then redeploy the preview.

## 2. Test it end to end (after step 1)
- [ ] **Dev:** Run checks V1–V22 from [quickstart.md](specs/001-persistent-backend/quickstart.md) with `npx vercel dev` or on a preview, and record the results there. These are spec tasks T025, T033, T041, T045, T052, T055, T057 and T061. They cover:
  - bookings across devices
  - price lock
  - Google sign-in
  - advance then balance payments
  - webhook-only payments
  - email outage and reminders
  - admin search and changes
  - cancelling, deleting accounts, signed-out course bookings
  - the old-browser-accounts notice.

## 3. Go live
- [ ] **You:** Switch Razorpay to live keys and register a live webhook. Decide whether to accept international cards.
- [ ] **You or Dev:** Run the 5 SQL files on the **production** database and set the Production variables in Vercel.
- [x] **Dev:** Merge `preview/trek-slideshows` into `main` (done 23 Oct, live), after step 2 passes. This updates the live site. Then bring local `main` back in step with GitHub.
- [ ] **You:** Make one real ₹1 booking and payment, then refund it in Razorpay.

## 4. Decisions needed from you
- [ ] **Rishikesh ↔ Joshimath drive.** The 8 Joshimath treks are now priced "Joshimath to Joshimath", and "What's included" says transfers run from Joshimath. Day 1 of their itineraries still shows the Rishikesh drive. Is that drive included, extra, or available on request?
- [ ] **Valley of Flowers location.** The page header says "Rishikesh" next to "Starts from Joshimath". Should it change to Joshimath?
- [ ] **Star ratings.** The invented ones were removed from Google's structured data on 19 Oct (the site-wide 4.8/692, courses 4.9/150, and the "100 reviews" fallback). `src/data/treks.ts` still holds ratings for 19 treks, which show on the page and in trek structured data. Are they from real reviews? If not, delete them (Dev, 10 minutes).
- [ ] **Unverified claims on the page.** The footer says "4.9, based on 1,200+ Google Reviews" and "Est. 2010 / since 2010". Every trek shows a "10% OFF" strike-through price that the code calculates as price ÷ 0.9; it isn't a real old price. Testimonial names repeat across treks. If these aren't true, they should go: fake discounts count as misleading advertising under India's consumer rules, and fake reviews break Google's policies.
- [x] ~~**Departure dates and "seats left" are made up by code.**~~ Resolved 6 Nov: dates now come from each trek's season calendar (`8e6acec`). The Dates tab always shows the 8th and 22nd of each month, cycling "Available / Few Seats Left / Sold Out", and the "Filling Fast" badge depends on it. Is there a real batch calendar? If yes, Dev can put the real dates into the trek data. If no, these labels should go. Google can now read them too.
- [ ] **Altitudes to check.** Dronagiri says a maximum of 4,500 m, but its own Day 7 reaches 4,920 m. Pangarchula says 4,700 m, while most sources give about 4,590 m.
- [ ] **Stock photos.** Brahmatal, Roopkund, Kalindi Khal, Gupt Khal, Mana Pass, Niti Pass and Rimkhim show generic stock mountain photos (gallery and banner slideshow). Keep them, or show only the main image until you have real photos?
- [ ] **Navbar wording.** "Adventures" → "Treks", "Home" removed from the desktop bar, and the phone menu's main button now opens WhatsApp. OK?
- [ ] **SEO agent in git?** It's ignored with the rest of `.claude/`. Should it be shared in the repo?

## 5. Code and content
- [x] ~~**UI consistency and polish**~~ built 22 Oct (`specs/002-ui-polish-consistency/`: 70 of 72 tasks done; deployed as a preview). Still open:
  - [ ] **You:** click through on a real phone and with a real login: dashboard, checkout, admin (bookings, customers, payments, departures), the mobile menu and a trek photo viewer. These can't be tested without a login. Tell me anything odd.
  - [ ] **Dev:** after that, V6 to V9 of the quickstart (Slow-4G walk, phone smoothness, keyboard and contrast, signed-in flows), then mark the audit rows `verified`.
  - [ ] **Dev:** the checkout page stayed invisible for 10 s in a headless test with a fake booking id (also before this work). Check once with a real session.
- [ ] **UI polish: your decisions** (found while polishing; none changed):
  - [ ] Invented or unsourced claims: crossed-out "10% OFF" price on trek pages; "No-cost EMI · Free Trek Date Change"; "4.9 / 1,200+ Google Reviews" and "Since 2010" in the footer; "5,000+ Happy Adventurers", "100% Safety Record", "4.8/5" on /activities; "100% Safe / 4.9+ Rating" in the home call to action. Back each with real data or remove it.
  - [ ] Course batch dates and "Filling Fast" / "Sold Out" labels are generated from a repeating pattern, not real seats. Wire them to real seats or remove them (trek pages already use live departures).
  - [ ] Opening hours differ: the contact page says Mon to Fri 9 to 6, the FAQ says Mon to Sat 9 to 7.
  - [ ] Home says "18 treks" but there are 21 routes.
  - [ ] Show the floating WhatsApp button on every page (today only the home page has it).
  - [ ] A signed-out visitor submitting a trek reservation is sent to /signup before WhatsApp opens and loses the form. Always hand the details to WhatsApp first?
  - [ ] The footer newsletter shows a success message but saves nothing: wire it up or replace it with a WhatsApp sign-up.
  - [ ] Booking-boost ideas from the agents (sticky Pay bar on phones, a WhatsApp button on every trek card and booking card, a balance-due banner on the dashboard, a trust line under the hero buttons): say which to build.
- [ ] **Favicon in Google (globe icon instead of the logo).** New simple icon built 22 Oct (see CHANGELOG). **You:** say "go live" for a favicon-only fix to production (or merge the whole preview). Then in Search Console: URL Inspection, enter `https://www.himalayanarcadventure.com/`, "Request indexing". Google usually takes days to a few weeks to swap the icon after it re-crawls; the globe stays until then. Google also wants the home page and icon not blocked (they aren't).
- [ ] **Browser tests (Puppeteer) added** (`npm run test:e2e`, 6 checks). **Dev:** next, add checks for the signed-in flows once there is a test account (dashboard, checkout, admin), and decide whether to run them automatically on every push (GitHub Actions is free for this size).
- [ ] **Redesign (22 Oct) — your call on:**
  - [ ] Look at the preview once it's pushed and say what you like or don't; the home section order changed.
  - [ ] Trek cards now show each trek's highest point; keep or drop?
  - [ ] Contact, FAQ and cancellation-policy pages lost their decorative header photos (text-only headers); OK?
  - [ ] Still open from the visitor test: a signed-out visitor's trek reservation is sent to /signup and loses the form (D-01); "4.8 (341 Reviews)"-style ratings and "4.9 / 1,200+ Google Reviews" need to be real or removed; the activities page says "17 handcrafted treks" next to "9+"; the 404 page is bare (no links back); /checkout, /dashboard, /admin redirect to login with no "please log in" note.
  - [ ] **Dev:** convert the six hero `.MOV` videos to small MP4/WebM (needs ffmpeg; they're 1.3–7 MB each) and replace the Video band's poster that has a burned-in caption.
- [ ] **You (now that it's live):** in Razorpay (Test Mode) set the webhook URL to `https://www.himalayanarcadventure.com/api/razorpay-webhook` with the secret from `.env.setup`; when ready for real money, switch to **live** Razorpay keys (tell Claude to load them); rotate the Gmail App Password (it was shared in chat); Search Console → submit `sitemap.xml` and request indexing for the home page.
- [ ] **Facts to check** (29 Oct: altitudes, places, counts and FAQ fixed from Trek The Himalayas; see CHANGELOG. **Still yours:** Mana/Niti/Rimkhim prices, the Rishikesh day-1 drive on Joshimath treks, Nanda Devi campsite height):
  - Dronagiri: day 7 reaches 4,920 m but the highest point is listed as 4,500 m.
  - Valley of Flowers: starts from Joshimath, but its location says Rishikesh and day 1 is the Rishikesh drive (same pattern for Pangarchula and Kuari Pass). The FAQ also gives Hemkund as 14,100 ft (usually about 15,200 ft); Bhrigu Lake and Hampta Pass also show 14,100 ft.
  - Brahmatal day 1 calls Lohajung "Kumaon"; it is in Chamoli (Garhwal). Hampta day 6 mentions Spiti; Chhatru is in Lahaul.
  - Gupt Khal's blurb says it links Gangotri and Kedarnath, but the itinerary runs Niti to Mana/Badrinath. Satopanth lists Joshimath but runs Haridwar to Badrinath.
  - Mana Pass, Niti Pass and Rimkhim are all priced Rs. 5,000 for 9–10 day strenuous trips: placeholders?
  - Trek counts disagree: 18 (home stat), 17 and "9+" (activities), 21 in the data.
  - FAQ: Kedarkantha "open year-round" vs "December to April"; FAQ says Uttarakhand pickups are from Dehradun, while hubs say Joshimath to Joshimath; FAQ names Triund, Kareri and Beas Kund, which are not in the trek list.
  - Activities page shows skiing "From Rs.10,000" and snowboarding Rs.35,000; check against the course prices.
- [ ] **Traffic and bookings plan** is in `adventure-travel/docs/seo/2026-10-21-traffic-and-bookings-plan.md`: Google Business Profile, first reviews, Search Console, the 308 redirect, directory listings, WhatsApp Business, 13 questions only you can answer.
- [x] ~~Commit the navbar redesign and the `.gitignore` change~~ (done: `1be764a`, pushed to the preview branch).
- [x] **Dev:** Commit `CHANGELOG.md`, `TODO.md` and the `CLAUDE.md` note. (done: committed with `52938f8`)
- [x] ~~Re-save the sideways Panpatia photos and put them back in the slideshow~~ (done 19 Oct).
- [x] ~~Favicon missing in Google results~~ (done 19 Oct). `apple-touch-icon.png` was a camping photo, not a square icon. Live via hotfix `a42c960` on `main`, and committed on `preview/trek-slideshows` too.
- [x] **Dev:** (covered by the UI plan, US2/US3) Still waiting for JavaScript before showing: card and gallery photos (`SmartImage` starts invisible), the home hero slides and several home sections, and the home FAQ, which arrives as a hidden streamed block. Same fix pattern as the trek pages; this mainly helps load speed. (done 22 Oct)
- [x] ~~Run the SEO/SMO agent~~ (done 19 Oct). The report is `adventure-travel/docs/seo/2026-10-19-audit-and-plan.md`.
- [ ] **Dev:** Work through the report's prioritised actions. Done 19 Oct: #6 and #7 hub pages, #9 link-preview images, #10 logo badge, #14 noindex on account pages. Next up: the Inner Line Permit guide (needs your facts: documents, office, processing days), a "related treks" block on trek pages, and #15 a home-page h1 that says what we do.
- [x] **Dev:** Switch `QuickInfoModal.tsx` to the new season parser (`src/lib/season.ts`). Its own parser mis-reads ranges like "Mar–Jun & Sept–Dec" in the "Best season" pop-up. (done 22 Oct)
- [ ] **You:** After the next deploy, request indexing in Search Console for `/treks-from-joshimath` and `/winter-treks-uttarakhand`.
- [x] ~~"Where to today?" pop-up on the home page~~ (done 19 Oct). It is now a normal section under the home hero instead of a full-screen gate. Not live until the branch is merged.
- [x] **Dev:** The preloader covers every page until the site's JavaScript has loaded, plus 600 ms. It slows down when pages appear (load speed is a Google ranking signal). Shorten it, or skip it after the first visit. (done 22 Oct: removed)
- [ ] **Dev:** Downsize and watermark the 35 trek videos as well. This needs `ffmpeg`, which isn't installed here.
- [ ] **You:** Fix or recreate the Facebook and YouTube pages. The links on the site returned errors, so they were removed from the site's profile list.
- [ ] **Dev:** Fix the 9 remaining lint warnings (all minor: unused variables and similar).
- [ ] **Dev:** Optional: run `/impeccable init` once to record your brand and audience, so future design work fits better.
- [ ] **You:** Real photos for Tungnath and Madhyamaheshwar. They show a "no photo" panel at the moment.

## Done recently
See [CHANGELOG.md](CHANGELOG.md):
- trek slideshows and "Joshimath to Joshimath" pricing
- the finished backend: admin area, advance/balance payments, reminders, account self-service
- the navbar redesign
- the SEO/SMO agent.
