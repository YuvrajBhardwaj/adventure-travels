# TODO

What's left, most urgent first. Tick items off here and record the change in [CHANGELOG.md](CHANGELOG.md).
**You** = the business owner (accounts, dashboards, decisions). **Dev** = code work Claude or a developer can do.
Last updated: 24 Nov 2026. On 24 Nov every open item was checked against the code and the list was rewritten: finished items were removed, duplicates merged and the rest ordered by priority. Finished work is recorded in the CHANGELOG.

## 1. Before real customers can pay (You)
- [ ] **You: privacy decisions from the 24 Nov audit** (Claude can build each once you choose):
  - **Minors:** sign-up and booking don't ask age. Under India's DPDP Act, a child's (under 18) data needs a parent's verifiable consent. Options: an "I am 18 or older" tick at sign-up and a note that minors book through a parent, or ask age per traveller.
  - [x] ~~**Download my data:** add a button on the dashboard that downloads your profile, bookings and payments as a file?~~ (24 Nov: built, on the dashboard and listed on /privacy.)
  - **How long to keep data:** email copies and old booking messages are kept forever now. Suggestion: clear email copies after 1 year, keep booking and payment records 8 years (Indian accounts rules).
  - **Passwords:** minimum is 6 characters; suggest 8 (also set in Supabase → Auth).
- [ ] **You (ask a lawyer):** review the privacy policy and terms for the DPDP Act (and GDPR if you take EU bookings): name a grievance contact, the retention periods above, and the deadlines in the data-breach plan (24 Nov: drafted in `adventure-travel/docs/security/data-breach-plan.md`; **You:** fill in the names and phone numbers in its first table, and keep a private copy).
- [ ] **You: switch Razorpay to live (real money, Google Pay included)** (24 Nov). Code is ready; only keys change. **Done 24 Nov:** live Key ID + Secret in Vercel Production, redeployed. **Still open:** regenerate the key (the secret was pasted in a chat), the live webhook + `RAZORPAY_WEBHOOK_SECRET` (step 3), and the real test payment (step 5). 1) Razorpay dashboard → finish account activation (KYC, bank account, website `www.himalayanarcadventure.com` approved). 2) Switch the dashboard to **Live Mode** → Account & Settings → API Keys → Generate live key (`rzp_live_…` + secret). 3) Live Mode → Webhooks → add `https://www.himalayanarcadventure.com/api/razorpay-webhook`, events `payment.captured`, `order.paid`, `payment.failed`, with a new secret. 4) Vercel → Settings → Environment Variables (Production only) → set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` to the live values → Redeploy. Keep test keys on Preview. 5) Make one small real booking with Google Pay, check it shows paid on /admin/payments, then refund it in Razorpay. (UPI/Google Pay must also be enabled for the account under Live Mode → Payment Methods.) Also decide whether to accept international cards (foreign nationals pay 3×).
- [ ] **You: upgrade Vercel to Pro (about $20 a month)** at the same time. Hobby is for non-commercial use only and pauses the site when a monthly limit runs out (around 10,000 visitors a month at today's page weight).
- [ ] **You: make the GitHub repo private.** GitHub → `YuvrajBhardwaj/adventure-travels` → Settings → General → Danger Zone → "Change visibility" → Private. Today anyone can download the code, photo originals and business documents. Vercel still deploys from a private repo.
- [ ] **You: rotate the Gmail App Password** (it was shared in chat on 23 Oct), then give Claude the new one for `.env.setup` and Vercel.
- [ ] **You: Supabase → Authentication:** turn on leaked-password protection and check the minimum password length.
- [ ] **You: answer for the Privacy and Terms pages:** does **support@himalayanarcadventure.com** exist (several pages use it)? Which email takes cancellations? How long are booking records kept? Who is the grievance contact (DPDP Act)? Are guest names shared with hotels, permit offices or trek leaders?

## 2. Dev: high
- [ ] **Test (Razorpay Test Mode):** the full booking → payment → receipt flow with UPI, card and net banking; failed and cancelled payments; the back button from Razorpay; phones at 320–1440 px. Then checks V1–V22 of [quickstart.md](specs/001-persistent-backend/quickstart.md) and record the results there. Needs a test login.
- [ ] **Dev P1: 3% surcharge on card payments** (the owner chose to charge it). Needs Razorpay customer-fee settings, showing the fee before payment, and `apply_payment()` accepting the fee-inclusive amount. Until then the terms mention 3% but checkout doesn't charge it.
- [x] ~~**Dev: lighter home hero layers.**~~ (24 Nov: re-compressed, 1.49 MB → 0.99 MB for all 4 slides. 800 px copies wouldn't help: on a phone the hero is ~1,070 CSS px wide, so 800 px would look blurry.)
- [ ] **You: hero slideshow on phones:** show 2 slides instead of 4 to cut the phone download further (about 0.9 MB at start now), or keep it?
- [ ] **You: check which Razorpay keys production uses.** 24 Nov: on the live site, checkout worked under the new Content-Security-Policy (sign-in, booking, Razorpay window, card checks, bank redirect, failed-payment record), but netbanking opened HDFC's **real** login page and both Razorpay test cards were refused, so production looks like it has **live** keys. Claude stopped there; no money moved. If live is intended, make one small real payment and refund it; if not, put the test keys back in Vercel Production. A TEST booking from checkout-test@himalayanarcadventure.com (Kuari Pass, 20 Jan 2027, unpaid) is on /admin/bookings: cancel it. That test account can be deleted in Supabase → Authentication.
- [ ] **You: check the course inclusions copy (24 Nov).** 1) The equipment cards still say helmets are included, but your new text lists only skis, snowboards, boots and poles. Are helmets included? 2) Does the Backcountry course also stay in the Swiss cottage, with heaters and local support? It's unchanged for now. 3) The popups appear only after a tap, so search engines don't see their text (each card's short line is in the page).

## 3. Dev: medium
- [x] ~~Content-Security-Policy header.~~ (24 Nov, `vercel.json`; enforced after a browser test with no violations.)
- [ ] From the 18 Nov test report (`adventure-travel/docs/ux-qa/2026-11-18-test-report.md`): cap seat holds per user; one open advance order per booking; the sticky booking card is taller than some screens; return focus after the lightbox and popups.
- [ ] Phones: the mobile menu doesn't cover the page (booking bar and WhatsApp button show through); the season stat card wraps to 3+ lines; up to three floating buttons on trek pages (booking bar, WhatsApp, Enquire tab).
- [ ] Count bookings on generated daily dates, so a busy day turns "Filling fast"/"Full" by itself (needs a SQL change; today only dates with an admin row fill up).
- [ ] Cookieless Vercel Web Analytics: `npm install @vercel/analytics` stopped on a peer-dependency conflict (20 Nov). **You:** then switch on Analytics in Vercel.
- [ ] Signed-in browser tests (dashboard, checkout, admin) once there is a test account; maybe run `npm run test:e2e` on every push with GitHub Actions.
- [ ] Shrink the hero videos and the 35 trek videos to small MP4/WebM, and replace the Video band poster that has a burned-in caption. Needs ffmpeg (`winget install ffmpeg`).
- [ ] Cut background link prefetching (about 55 requests per desktop home visit) to save Vercel quota.
- [ ] Before about 1,000 customers: move admin search into the database (the lists load at most 500 bookings per type and 1,000 customers).

## 4. Decisions and content from you
**Treks and prices**
- [ ] **Kuari Pass and Pangarchula itineraries:** both start and end with the Rishikesh ↔ Joshimath drive (Kuari 5 days, Pangarchula 6), which only the Rishikesh/Haridwar/Dehradun package includes. How many days do the Joshimath-only packages run?
- [ ] **The other Joshimath treks:** day 1 of 5 itineraries is still "Drive Rishikesh to Joshimath" while the price is "Joshimath to Joshimath". Is that drive included, extra, or on request? Which treks get a Rishikesh/Haridwar/Dehradun package, and at what price?
- [ ] **Confirm Rishikesh/Haridwar/Dehradun rates:** Kuari Pass triple Rs.8,499 / double Rs.9,000; Pangarchula double Rs.11,000 / triple Rs.10,499.
- [ ] **Placeholder prices:** Mana Pass, Niti Pass, Rimkhim and Bhrigu Lake still show Rs.5,000. Also the Nanda Devi campsite height.
- [ ] **Season windows** in `adventure-travel/src/data/trekSeasons.ts` (e.g. should Roopkund or Satopanth run daily instead of weekly; the 3-day / 21-day booking notice), and whether to delete the old seeded Saturday dates that fall outside the new windows (a live database change).
- [ ] **Kuari Pass Day 4** if the group turned back to Khulara on Day 3: walk out to Joshimath, or retry the pass?
- [ ] **Claims Claude can't check:** "Certified Instructors … international certifications" (/courses), "Every activity is guided and insured" (/activities), "trained to recognise AMS" and the Gamow bag (home), "Level 4 Pro" (snowboard course), the softened safety FAQ, the backcountry ski claims in `courses.ts`, and the foreign-national price wording. Keep only what's true.
- [ ] **18 Nov test report questions:** what the 90% refund is calculated on; Tungnath trek vs Chopta tour page. (The other 7 are covered by items in this list.)

**Courses**
- [ ] Can a ski/snowboard course start on any day of the season, or only on fixed intake days?
- [ ] **December batches:** the terms say customers pay only after you confirm the batch, but checkout lets them pay straight away. Take December bookings as enquiries only, or have Claude block online payment for December batches until 7 days before the start?
- [ ] No-snow refunds are manual: refund in the Razorpay dashboard, then mark the booking refunded on /admin/bookings. Direct UPI payments are manual too: mark them paid on /admin after the customer's screenshot.

**Auli Winter Escape**
- [ ] Deluxe Package: which hotel, what else differs, and the price per person (it shows "Price on request").
- [ ] Prices for 7, 8, 9 and 11+ people (the page says "message us").
- [ ] Do the trek cancellation and payment terms apply to the Auli tour, or does it need its own?
- [ ] The second number (+91 86505 61564) and the Gmail address appear only on this page. Should they go site-wide?
- [ ] Chopta group offers like Auli's? (Today it has only room-sharing prices.)

**Photos**
- [ ] Chopta & Tungnath → `adventure-travel/public/assets/tours/tungnath/`; Madhyamaheshwar. Both show the no-photo panel.
- [ ] The 9 treks on stock or no photo: Brahmatal, Roopkund, Kalindi Khal, Gupt Khal, Nanda Devi Base Camp, Mana Pass, Niti Pass, Rimkhim (its cover is the Matterhorn: replace it first), Madhyamaheshwar.
- [ ] A landscape cover for Kuari Pass (it opens on a group selfie).
- [ ] Optional: more Auli photos (Gorson Bugyal, the lake, the stays); (24 Nov: IMG_6412 and the Auli drop are on the site; the two Auli videos need ffmpeg first); facts for Chenab Lake if you want it added.
- [ ] Real Google reviews and trek videos when you have them; late-arrival rule, gear rental prices and reporting times per departure.

**Coupon codes** (design: `specs/003-coupons/design.md`)
- [ ] **You:** answer the 8 questions in §9: 10% or 20% and the rupee cap; courses too?; exclude offline customers?; per booking; partner commission; reuse after a refund; the 48-hour payment window; loyalty code %, validity and how codes are issued.
- [ ] **Dev:** then build it in the 5 phases of design §4; **You:** approve `supabase-coupons.sql` on the live database after the dry-run.

**Other choices**
- [ ] Signed-out visitors: go straight to WhatsApp with the booking details, or keep sign-up first (the form is kept)? The traffic plan recommends WhatsApp first.
- [ ] Newsletter: Subscribe opens an email to you today. Want a real list (Brevo or Mailchimp)?
- [ ] Booking-boost ideas: sticky Pay bar on phones, WhatsApp on every trek card, a balance-due banner on the dashboard, a trust line under the hero buttons. Say which to build.

## 5. Off-site (You)
- [ ] **Google Search Console:** submit `https://www.himalayanarcadventure.com/sitemap.xml`; request indexing for the home page (also refreshes the favicon), `/treks`, `/tours`, `/courses`, `/activities`, `/treks-from-joshimath`, `/winter-treks-uttarakhand` and the top 5 trek pages.
- [ ] **Google Business Profile** for the Joshimath office (same name, address and phone as the footer, real photos), and a review request after every batch.
- [ ] The rest of `adventure-travel/docs/seo/2026-10-21-traffic-and-bookings-plan.md`: Instagram reels linking to trek pages, WhatsApp Business, listings on Thrillophilia, TripAdvisor and JustDial; recreate the Facebook and YouTube pages if you want them linked.
- [ ] After tour changes go live, check a tour link's preview in WhatsApp (or the Facebook Sharing Debugger).
- [ ] Clean-up: delete `C:/Users/yuvra/dev/adventure-travels-3d` (the old 3D experiment).

## 6. Later (Dev, when wanted)
- [ ] Trek guides (how to reach, best time, winter, Inner Line Permit) to replace the 3 placeholder story articles (`stories.ts`), or drop the stories section.
- [ ] Booking flow: review step with a "seats held 14:59" timer; traveller details per person and an emergency contact; confirmation page with a PDF voucher; My Trips tabs with a refund preview and date-change request; add-ons (pickup, gear rental, insurance: **You** say which and at what price; is GST charged on top?).
- [ ] P2: trek finder and "Find my trek" call to action; next departure on trek cards; group total in the booking form; safety badges by the booking panel; Women Trekkers link; Lighthouse and accessibility pass.
- [ ] P3: compare treks; readiness check; packing list; self-service date change; vouchers and waitlist in the dashboard.
- [ ] Auli online booking and payment, once the group rules are in the price catalog.
- [ ] Before traffic grows: move email from Gmail (about 500 a day) to a transactional sender (Brevo, Resend, SES, ZeptoMail); consider Supabase Pro ($25 a month) for daily backups.
- [ ] Optional: "Continue with Google" sign-in (Supabase → Authentication → Providers → Google; needs a Google Cloud OAuth client); a full Nuclei / OWASP ZAP scan of a preview.
