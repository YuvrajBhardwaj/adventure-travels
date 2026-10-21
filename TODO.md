# TODO

What's left, most urgent first. Tick items off here and record the change in [CHANGELOG.md](CHANGELOG.md).
**You** = the business owner (accounts, dashboards, decisions). **Dev** = code work Claude or a developer can do.
Last updated: 19 Oct 2026.

## 0. Do these first (5 minutes each, big effect)
- [x] ~~Ship the favicon hotfix~~ (done 19 Oct: `a42c960` pushed to `main`).
- [ ] **You: Search Console → URL Inspection → home page → Request indexing**, so Google re-reads the new favicon. Allow days to weeks before the logo replaces the grey globe.
- [ ] **You: make the GitHub repo private.** GitHub → `YuvrajBhardwaj/adventure-travels` → Settings → General → Danger Zone → "Change visibility" → Private. Right now anyone can download the whole site: every photo and video original, the code, the database design and the business documents. Vercel still deploys from a private repo.
- [ ] **You: make the www redirect permanent.** Vercel → Project → Settings → Domains → `himalayanarcadventure.com` → redirect to `www.himalayanarcadventure.com` with **308 Permanent** (it is 307 Temporary now). Google treats a temporary redirect as "this might change".
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
- [ ] **You: Gmail App Password** into `.env.setup` (`SMTP_USER`, `SMTP_PASS`), then re-run the script. Until then Supabase only emails your own team, a few per hour, so customers can't confirm their sign-ups.
- [ ] **You (optional):** Supabase → Authentication → Providers → Google, for "Continue with Google". It needs a Google Cloud OAuth client.
- [ ] **You:** Razorpay in **Test mode**: copy the keys into `.env.setup` and re-run the script. Then add a webhook to `https://<site>/api/razorpay-webhook` for `payment.captured`, `order.paid` and `payment.failed`.
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
- [ ] **Dev:** Merge `preview/trek-slideshows` into `main`, after step 2 passes. This updates the live site. Then bring local `main` back in step with GitHub.
- [ ] **You:** Make one real ₹1 booking and payment, then refund it in Razorpay.

## 4. Decisions needed from you
- [ ] **Rishikesh ↔ Joshimath drive.** The 8 Joshimath treks are now priced "Joshimath to Joshimath", and "What's included" says transfers run from Joshimath. Day 1 of their itineraries still shows the Rishikesh drive. Is that drive included, extra, or available on request?
- [ ] **Valley of Flowers location.** The page header says "Rishikesh" next to "Starts from Joshimath". Should it change to Joshimath?
- [ ] **Star ratings.** The invented ones were removed from Google's structured data on 19 Oct (the site-wide 4.8/692, courses 4.9/150, and the "100 reviews" fallback). `src/data/treks.ts` still holds ratings for 19 treks, which show on the page and in trek structured data. Are they from real reviews? If not, delete them (Dev, 10 minutes).
- [ ] **Unverified claims on the page.** The footer says "4.9, based on 1,200+ Google Reviews" and "Est. 2010 / since 2010". Every trek shows a "10% OFF" strike-through price that the code calculates as price ÷ 0.9; it isn't a real old price. Testimonial names repeat across treks. If these aren't true, they should go: fake discounts count as misleading advertising under India's consumer rules, and fake reviews break Google's policies.
- [ ] **Departure dates and "seats left" are made up by code.** The Dates tab always shows the 8th and 22nd of each month, cycling "Available / Few Seats Left / Sold Out", and the "Filling Fast" badge depends on it. Is there a real batch calendar? If yes, Dev can put the real dates into the trek data. If no, these labels should go. Google can now read them too.
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
- [ ] **Traffic and bookings plan** is in `adventure-travel/docs/seo/2026-10-21-traffic-and-bookings-plan.md`: Google Business Profile, first reviews, Search Console, the 308 redirect, directory listings, WhatsApp Business, 13 questions only you can answer.
- [x] ~~Commit the navbar redesign and the `.gitignore` change~~ (done: `1be764a`, pushed to the preview branch).
- [ ] **Dev:** Commit `CHANGELOG.md`, `TODO.md` and the `CLAUDE.md` note.
- [x] ~~Re-save the sideways Panpatia photos and put them back in the slideshow~~ (done 19 Oct).
- [x] ~~Favicon missing in Google results~~ (done 19 Oct). `apple-touch-icon.png` was a camping photo, not a square icon. Live via hotfix `a42c960` on `main`, and committed on `preview/trek-slideshows` too.
- [ ] **Dev:** (covered by the UI plan, US2/US3) Still waiting for JavaScript before showing: card and gallery photos (`SmartImage` starts invisible), the home hero slides and several home sections, and the home FAQ, which arrives as a hidden streamed block. Same fix pattern as the trek pages; this mainly helps load speed.
- [x] ~~Run the SEO/SMO agent~~ (done 19 Oct). The report is `adventure-travel/docs/seo/2026-10-19-audit-and-plan.md`.
- [ ] **Dev:** Work through the report's prioritised actions. Done 19 Oct: #6 and #7 hub pages, #9 link-preview images, #10 logo badge, #14 noindex on account pages. Next up: the Inner Line Permit guide (needs your facts: documents, office, processing days), a "related treks" block on trek pages, and #15 a home-page h1 that says what we do.
- [ ] **Dev:** Switch `QuickInfoModal.tsx` to the new season parser (`src/lib/season.ts`). Its own parser mis-reads ranges like "Mar–Jun & Sept–Dec" in the "Best season" pop-up.
- [ ] **You:** After the next deploy, request indexing in Search Console for `/treks-from-joshimath` and `/winter-treks-uttarakhand`.
- [x] ~~"Where to today?" pop-up on the home page~~ (done 19 Oct). It is now a normal section under the home hero instead of a full-screen gate. Not live until the branch is merged.
- [ ] **Dev:** The preloader covers every page until the site's JavaScript has loaded, plus 600 ms. It slows down when pages appear (load speed is a Google ranking signal). Shorten it, or skip it after the first visit.
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
