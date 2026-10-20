# Traffic and bookings plan (2026-10-21)

For the owner of Himalayan Arc Adventure. A short appendix for the developer is at the end. This builds on `2026-10-19-audit-and-plan.md`.

**In one paragraph:** the domain is 3 weeks old, so Google traffic will build slowly. The fastest bookings in the next 90 days will come from Google Business Profile, WhatsApp and Instagram, all pointing at trek pages that make booking easy. Today the live site makes it hard. It still runs the old code, the two new landing pages give "page not found", and the booking form sends anyone not signed in to a sign-up page that doesn't work in production. Fix those three first.

---

## 1. Booking funnel audit: what stops people booking

The path checked: Google result → trek page → "Trek Cost" card → Dates / Make Reservation → WhatsApp or `/checkout`. Live site fetched 21 Oct; code read on branch `preview/trek-slideshows`.

| # | Problem (evidence) | Effect on bookings | Fix |
|---|---|---|---|
| 1 | **The reservation form is a dead end for new visitors.** If they aren't signed in, "Send Reservation Request" sends them to `/signup` *before* WhatsApp opens. Their name, phone and date are thrown away (`TrekDetailClient.tsx:234-237`). Production has no Supabase keys, so sign-up shows "Accounts are temporarily unavailable". | **Highest.** Your keenest visitors, the ones who filled in the form, leave with nothing sent. | Always send the details to WhatsApp (and save them as an enquiry). Ask for an account only at the payment step. Developer item D1. |
| 2 | **The live site is behind.** `/treks-from-joshimath` and `/winter-treks-uttarakhand` give 404 on www. The live trek pages still have the old titles (e.g. "Kuari Pass Trek — 5 Days, Moderate \| Uttarakhand \| Himalayan Arc Adventure", 79 characters), "Filling Fast", "% OFF" and "No-cost EMI". | Google can't rank pages that aren't live, and the winter planning window is now. | Go-live (TODO §3). If the payment backend isn't ready, consider shipping the SEO and booking fixes first with payments switched off. That's a decision for you and the developer. |
| 3 | **Claims we can't back up.** The strike-through price is just price ÷ 0.9 with "10% OFF" (`TrekDetailClient.tsx:617-618, 672-677`). Star ratings and review counts appear with no source (`treks.ts:113-681`, e.g. Valley of Flowers "4.8 · 692"). The booking card also says "No-cost EMI · Free Trek Date Change" (`:710`). | Experienced trekkers check reviews on Google. A 3-week-old business showing "692 reviews" while having no Google reviews looks fake, and fake discounts breach India's CCPA dark-pattern guidelines. | Remove these until they are true (D2). Show real proof instead (row 4). |
| 4 | **Real trust signals are missing.** There's no registration number, insurance, trek-leader names or certificates, team photo, office photo or link to Google reviews. The only person named is "Kuldeep Rawat" in the contact pop-up (`ContactPopup.tsx:7`). | Trekkers pay strangers lakhs to take them to 4,000 m. Proof of safety and competence is what closes the sale. | Owner facts Q1–Q4 below, then a trust strip in the booking card (D4). |
| 5 | **The cancellation terms contradict each other.** The T&C say "The advance amount is non-refundable" and "No refund applies if only the advance amount was paid", yet also "25+ days before: 90% cash refund" (`TermsConditions.tsx:46-54`). The booking card promises "Free Trek Date Change". | People hesitate when refund rules are unclear. A dispute is likely. | You decide the rules (Q5). The developer then shows a 3-line summary next to the price (D6). |
| 6 | **Price clarity.** "Joshimath to Joshimath" is the strongest line on the page, but Day 1 of 8 itineraries is still "Rishikesh → Joshimath". The T&C mention "5% GST", and the card doesn't say whether prices include it. | Unclear prices mean fewer enquiries. | Answer Q6 and Q7; the developer then puts the answer on every card. |
| 7 | **Dates.** Live departure dates are being built (`useDepartures.ts`, `/admin/departures`, uncommitted). With no batches entered, the page says "No batches are listed for the coming months yet". | Fixed dates with real seat counts are the strongest honest reason to book now. | After go-live, enter real winter batches in `/admin/departures` (owner) and ship the feature (D5). |
| 8 | **WhatsApp is generic.** The floating button always sends "I'd like to know more about your treks" (`FloatingWhatsApp.tsx:11`). The mobile bottom bar has "Info" and "View Dates & Register" but no WhatsApp button (`TrekDetailClient.tsx:516-533`). | You can't tell which page an enquiry came from, and phone visitors take an extra step. | Add a WhatsApp button to the mobile bar, and have every WhatsApp link name the page (D3, section 5). |
| 9 | **Paying online requires login** (`CheckoutClient.tsx:162`), and the Razorpay keys aren't set yet. | Fine for now: WhatsApp then a UPI link is how most Indian trek operators close. | Keep WhatsApp as the main path. Add online payment once it's tested (TODO §2). |
| 10 | **Speed.** Live HTML is 205 KB (home) and 142 KB (Kuari Pass). The UI-polish work removes the preloader and the invisible-until-JavaScript photos. | Medium. | Re-test with PageSpeed Insights after the polish lands (D10). |

## 2. Traffic plan: next 30 / 60 / 90 days

### 2.1 Target searches and who ranks now (our search tool, not Google; a guide only)

| Search | Our page | Who ranks now | What they have that we don't | Our move |
|---|---|---|---|---|
| treks from joshimath | `/treks-from-joshimath` (404 live) | [insider.in 2019 events](https://insider.in/kuari-pass-trek-nov23-2019/event), [Thrillophilia tag page](https://www.thrillophilia.com/cities/joshmath/tags/moderate-treks), [Trekup Dharansi](https://trekupindia.com/documented-trek/dharansi-pass-trek), [Holidify](https://www.holidify.com/tour-package/monsoon-trek-package-to-valley-of-flowers--hemkund-sahib-from-joshimath-32230.html), blogs | Nothing better: **no operator hub page** | Deploy it. Add the office address, a team photo and road distances to each trailhead (Q8) |
| kuari pass trek | `/treks/kuari-pass` | [Indiahikes](https://indiahikes.com/kuari-pass), [Treks and Trails](https://treksandtrails.org/tours/kuari-pass-trek), [Trekup](https://www.trekupindia.com/kuari-pass-trek), [Aquaterra](https://aquaterra.in/kuari-pass-trek-uttarakhand-india/), [Bikat](https://www.bikatadventures.com/Home/Itinerary/Kuari-Pass-Trek), Outlook | Depth (Indiahikes about 11,000 words, videos), the Curzon Trail history | Sources disagree on the pass height (3,757–3,876 m) and distance (22–30 km). Publish **our own GPS-measured** figures (Q9) and "how we run it from Joshimath". A long-term target |
| winter treks uttarakhand | `/winter-treks-uttarakhand` (404 live) | [TTH hub](https://trekthehimalayas.com/winter-treks-in-uttarakhand), [Himalaya Shelter listicle](https://himalayashelter.com/10-best-winter-treks-in-uttarakhand), [Ghughuti guide](https://ghughuti.org/the-ultimate-guide-to-winter-treks-in-uttarakhand/), Outlook | A month-by-month snow guide; Chopta–Chandrashila and Dayara listed | Deploy **now**: people plan December trips in October and November. Add a dated "snow line this week from Joshimath" note with photos |
| auli skiing course (price) | `/courses/skiing-course` | Blogs ([Trekgo](https://trekgo.in/blog/auli-skiing-guide), [Himalaya Shelter](https://himalayashelter.com/auli-uttarakhand)), [Bikat](https://bikatadventures.com/Home/Itinerary/skiing-basic-course-auli-7-days) (price on request), [tourtravelworld](https://www.tourtravelworld.com/packages/skiing-course-tour-157857.html) (₹13,500–16,500) | Old articles quoting GMVN at ₹9,000–15,000 | We publish real prices (₹10,000 training only / ₹20,000 with stay). Add "GMVN vs our school", the chairlift/ropeway status this season, and the instructors' certification (Q3) |
| dronagiri trek (package) | `/treks/dronagiri-base-camp` | [tourtravelworld](https://www.tourtravelworld.com/packages/trekto-dronagiri-aka-sanjeevani-parvat-premium-211496.html) (₹18,999; one listing shows "INR 0"), [Himalayan High Bagini](https://www.himalayanhigh.in/baghini-glacier-trek-details), [TTH Bagini](https://trekthehimalayas.com/bagini-glacier-chang-bang-base-camp-trek/), news and a Maharashtra fort | **A weak field.** Listings only | Our likeliest early top-3. Fix the altitude conflict (4,500 m stated vs 4,920 m on Day 7), and explain what ₹29,999 covers against an ₹18,999 listing |
| tungnath chandrashila trek | `/treks/tungnath` | [Treks and Trails](https://treksandtrails.org/tours/chopta-tungnath-chandrashila), [Himalaya Shelter](https://himalayashelter.com/trek/Chopta-Chandrashila-Trek), [Bajaj Finserv](https://www.bajajfinserv.in/chandrashila-trek), [Indiahikes blog](https://indiahikes.com/blog/where-is-deoriatal-chandrashila-trek) | Photos; trailhead at Chopta | Our data says Tungnath **starts from Delhi** (`treks.ts:725`), so don't chase "from Joshimath" unless you add a Joshimath pickup (Q10). Target "tungnath chandrashila winter trek" instead. It needs our own photos (it shows "no photo" today) |

Spring targets, which need content live 2–3 months ahead: "valley of flowers trek package" (pages ready by April), "pangarchula peak trek" (Mar–May season, so by January), "mana / niti inner line permit" (by April).

### 2.2 Timeline

| Window | Do | Expect |
|---|---|---|
| **Days 0–30** (to 20 Nov) | Go live. Submit in Search Console. Google Business Profile with 20+ photos. First 10 reviews. Developer items D1–D3. Winter social push (section 3.6) | Pages indexed; brand searches show the site; first enquiries from GBP and WhatsApp |
| **Days 31–60** (to 20 Dec) | Trust strip and real batches (D4, D5). Weekly Auli/Joshimath snow report. Per-trek FAQs on Kuari Pass, Kedarkantha, Brahmatal, Tungnath and the ski courses (D7). Related-treks block (D8). First YouTube uploads | Long-tail impressions (Dronagiri, Auli course price, Joshimath hub). Reviews reach 15–20 |
| **Days 61–90** (to 19 Jan) | Spring pages: Pangarchula depth, "Kuari Pass vs Pangarchula", Inner Line Permit guide, Valley of Flowers how-to-reach. Directory listings done | Top-10 on thin queries: Dronagiri, Joshimath hub, Auli ski price |

### 2.3 Internal-linking fixes
- Link the home page to both hubs (the footer already does; add a line in the body).
- Every Joshimath trek gets the breadcrumb "Treks from Joshimath". The visible crumb "Adventures" becomes "Treks" (`TrekDetailClient.tsx:308`).
- Winter hub ↔ Auli ski courses, both ways.
- A "Related treks" block on each trek page (same base town or season).

## 3. Owner-only actions (code can't do these)

### 3.1 This week
1. **Permanent redirect:** Vercel → Project → Settings → Domains → `himalayanarcadventure.com` → redirect to `www`, **308 Permanent**. Confirmed still 307 today.
2. **Search Console** ([search.google.com/search-console](https://search.google.com/search-console)), right after go-live:
   - Sitemaps → submit `https://www.himalayanarcadventure.com/sitemap.xml`.
   - URL Inspection → Request indexing for `/`, `/treks-from-joshimath`, `/winter-treks-uttarakhand`, `/treks/kuari-pass`, `/treks/kedarkantha`, `/treks/brahmatal`, `/treks/tungnath`, `/treks/dronagiri-base-camp`, `/courses/skiing-course` and `/courses/snowboarding-course`.
   - Then add [Bing Webmaster Tools](https://www.bing.com/webmasters) using "Import from GSC".

### 3.2 Google Business Profile, Joshimath base ([business.google.com](https://business.google.com/create))
- **Name:** exactly "Himalayan Arc Adventure". **Category:** primary "Tour operator"; extra categories "Travel agency" and "Ski school".
- **Address:** identical to the site footer, with a map pin on the office. **Phone:** +91 78179 12062. **Website:** `https://www.himalayanarcadventure.com/?utm_source=google&utm_medium=gbp&utm_campaign=profile`.
- **Services:** one per trek and course, with "from ₹" prices taken from the site.
- **Photos:** 20+ on day one: office outside and inside, the team with names, campsites, Auli slopes, kit. Add 5 more a week.
- **Posts:** 1–2 a week (new batch, snow report, ski season opening). Use "Book" or "Learn more" pointing at the trek page with a UTM.
- **Q&A:** add the 5 questions customers really ask on WhatsApp, with honest answers.

### 3.3 First 10–20 genuine reviews
Send to **past trekkers only**. Send it to every one of them, not just the happy ones, with no discounts or gifts for reviewing; incentives break Google's rules. Reply to every review.

> Namaste {Name}! This is {your name} from Himalayan Arc Adventure, Joshimath. Thank you for trekking {trek} with us in {month}. We've just started our Google page, and an honest review from you would help other trekkers trust a small local team. It takes 1 minute: {GBP review link}. If anything on the trek could have been better, please tell us that too. 🙏

(Get the review link from GBP → "Ask for reviews".)

### 3.4 Listings and directories (same name, address and phone everywhere)
- **Uttarakhand Tourism Development Board:** register as a trekking operator. The 2022 rules define a "Registered Operator". Ask to be listed on uttarakhandtourism.gov.in. **Highest-value link available to us.**
- [TripAdvisor owner listing](https://www.tripadvisor.in/Owners), Justdial, Bing Places, Apple Business Connect.
- [ATOAI membership](https://www.atoai.org); Ministry of Tourism approval if eligible.
- Thrillophilia supplier listing: optional. It brings bookings but takes a commission and competes with your own pages.
- Joshimath/Auli homestays and gear shops that genuinely work with you can link to you as a partner.
- Never buy links or "best operator" listicle spots.

### 3.5 WhatsApp Business (on +91 78179 12062)
- **Catalogue:** one item per trek and course with price, days and the page link (with `utm_source=whatsapp&utm_medium=catalogue`).
- **Greeting:** "Namaste! You've reached Himalayan Arc Adventure, Joshimath. Tell us the trek and month, and we'll send dates and the full cost." **Away message:** "We're on the trail with a batch; we reply by {time}. Dates and prices: {link}."
- **Quick replies:** `/price` (what Joshimath to Joshimath covers), `/dates`, `/pay` (advance and UPI steps), `/cancel` (the policy summary), `/pack` (packing list link), `/reach` (how to get to Joshimath).
- **Labels:** New enquiry → Quote sent → Advance paid → Trekked → Review asked.

### 3.6 Instagram + YouTube Shorts: 4 weeks, 3 posts a week, each tied to a page

| Week | Post 1 (Reel/Short) | Post 2 (carousel) | Post 3 |
|---|---|---|---|
| 26 Oct | Kuari Pass ridge clip (`kuari-pass-trek/*.mov`) → `/treks/kuari-pass` | "5 winter treks in Uttarakhand, by month" → `/winter-treks-uttarakhand` | Team at the Joshimath office (new photo) → `/treks-from-joshimath` |
| 2 Nov | Auli ski clip (`skiing/*.MP4`) → `/courses/skiing-course` | "What Joshimath to Joshimath includes" (after Q6) → `/treks/kuari-pass` | Kedarkantha snow photos → `/treks/kedarkantha` |
| 9 Nov | Snowboard clip (`snowboarding/*.MOV`) → `/courses/snowboarding-course` | "GMVN vs private ski school: what you get" (after Q3) → `/courses` | Snow report #1, with date and place → `/winter-treks-uttarakhand` |
| 16 Nov | Pangarchula summit clip (`.mp4`) → `/treks/pangarchula-peak` (spring batches) | "Winter packing list" → `/treks/kuari-pass` | Snow report #2 + "December batches" (only if real) → the trek page |

- **Every caption:** hook → first-hand line → facts (days, altitude, "₹X Joshimath to Joshimath") → "WhatsApp us, link in bio" → location tag (Joshimath, Auli, Chamoli).
- **Links:** use UTMs (section 5).
- **Not allowed:** bought followers or engagement.

## 4. Developer backlog (after the UI polish lands)

| # | Change | Where | Effort | Impact |
|---|---|---|---|---|
| D1 | Signed-out reservation: open WhatsApp with the details (and save the enquiry); ask for an account only at payment | `TrekDetailClient.tsx:233-266` (the `!user` redirect at 234-237); same check on course pages | S | **H** |
| D2 | Remove the computed strike-through and "% OFF", "No-cost EMI · Free Trek Date Change", and the rating badges, until the owner confirms them; delete `rating`/`reviewCount` from data | `TrekDetailClient.tsx:367-374, 617-618, 672-677, 700-710`; `treks.ts:113-681` | S | **H** |
| D3 | WhatsApp button in the mobile bottom bar; every WhatsApp link carries a page tag (section 5) | `TrekDetailClient.tsx:516-533`; `FloatingWhatsApp.tsx:11`; `ContactPopup.tsx:29-34` | S | **H** |
| D4 | Trust strip in the booking card, from data: registration number, insurance, leader names and certifications, "See our Google reviews" link | `BookingCard` (`TrekDetailClient.tsx:819-828`); new fields in `src/data` | S | H |
| D5 | Ship the real departures (DB batches, seats). No badge without real batches (already the rule) | `useDepartures.ts`, `src/lib/departures.ts`, `/admin/departures` | M | H |
| D6 | 3-line cancellation summary under the price, linking to the full policy | `BookingCard`; `TermsConditions.tsx` | S | M |
| D7 | Visible per-trek FAQs from a new `faqs` field. No `FAQPage` markup needed (Google shows FAQ results only for government and health sites) | `treks.ts`, `TrekDetailClient.tsx` Overview | M | M |
| D8 | Server-rendered "Related treks" block + hub breadcrumb; "Adventures" → "Treks" | `treks/[id]/page.tsx`; `TrekDetailClient.tsx:308` | S | M |
| D9 | Query-led home h1 ("Himalayan treks from Joshimath & Auli ski school") | home hero component | S | M |
| D10 | Speed: PageSpeed Insights on home and Kuari Pass after the polish; hero images as WebP with `srcset`; re-encode `.mov` to H.264 MP4 (needs ffmpeg) | `public/assets`, `WallpaperCarousel.tsx` | M | M |
| D11 | Cookieless analytics (Vercel Web Analytics) with events `whatsapp_click {page}`, `reservation_submit {trek}`, `checkout_start` | `layout.tsx` | S | M (measurement) |
| D12 | Review/rating markup: **never** from site data. Google ignores self-serving reviews on your own business. Link to GBP instead | — | — | avoids risk |

## 5. Measurement (weekly, 15 minutes, a simple sheet)

| Metric | Where |
|---|---|
| Impressions, clicks and average position per page, for the hubs + top 6 treks + ski course | Search Console → Performance → Pages |
| Pages indexed vs "Discovered/Crawled – not indexed" | Search Console → Pages |
| GBP views, calls, website clicks, direction requests, reviews (count and average) | Business Profile → Performance |
| WhatsApp enquiries **by page tag**, quotes sent, advances paid | WhatsApp labels + the sheet |
| Bookings and revenue by trek | `/admin/bookings` |
| Instagram/YouTube link clicks by `utm_content` | Analytics (D11) |

**Tag WhatsApp links per page** (recommendation): every prefilled message ends with a short code, e.g. `Hi! I'd like dates for the Kuari Pass trek. [web:kuari-pass]`, `[web:home]`, `[gbp]`, `[ig:reel-kuari-01]`. When a chat arrives, apply the label for that code. Count them weekly.

UTM pattern for links outside the site: `?utm_source={instagram|youtube|whatsapp|google}&utm_medium={bio|post|broadcast|catalogue|gbp}&utm_campaign={winter-2026|summer-2027}&utm_content={post-id}`. Never put UTMs on internal links.

## 6. Facts needed from you (placeholders; nothing will be invented)

- **Q1** Are you registered with UTDB? Registration number?
- **Q2** Do you have liability or trekker insurance? Which insurer, and what does it cover?
- **Q3** Trek leaders and ski instructors: names, certifications (institute and course), years on each route. May we show their photos?
- **Q4** Where do the star ratings and review counts in the site data come from? Are the testimonials real customers who agreed to be quoted? Is "since 2010" true?
- **Q5** Cancellation: is the 30% advance refundable or not? Is a date change free, and up to how many days before?
- **Q6** Does the price include the Rishikesh ↔ Joshimath drive and those days? Is there a Rishikesh-pickup price?
- **Q7** Are prices inclusive of 5% GST?
- **Q8** Road distance and time from Joshimath to each trailhead (Dhak/Tugasi, Govindghat, Jumma, Mana, Niti, Malari, Auli).
- **Q9** Our measured Kuari Pass height and distance; Dronagiri's highest point; Pangarchula's height.
- **Q10** Do you run Tungnath–Chandrashila from Joshimath, or only from Delhi? Do you have your own photos?
- **Q11** The real winter 2026–27 batch dates and seat limits per trek and course.
- **Q12** Is no-cost EMI actually offered (through Razorpay)?
- **Q13** The real Instagram, Facebook and YouTube URLs.

---

## Appendix (developer)

- **Live check, 21 Oct 2026:**
  - apex → www returns `307`
  - `/treks-from-joshimath` and `/winter-treks-uttarakhand` return `404`
  - the `/treks/kuari-pass` HTML contains "% OFF", "Filling Fast", "No-cost EMI" and "Reviews)".
- **Analytics:** none installed (no gtag, `@vercel/analytics` or Plausible in `src/` or `package.json`).
- **Funnel order of operations in `handleBookingSubmit`:** `if (!user) { location = "/signup"; return; }` runs before the booking call and before `window.open(wa.me…)`. Signed-out users therefore never reach WhatsApp. Fix by moving the WhatsApp hand-off above the auth check (or making it unconditional), and saving a lead row server-side if an `api/` function slot allows it (currently fewer than 8 functions; check the count first).
- **Do not:** add `AggregateRating`/`Review` markup from `src/data`, re-add a computed "old price", or show "Filling Fast" without real seat data.
- **Constraints:** respect `CLAUDE.md`: static export, content in the HTML, and `tsc` + `eslint` while the dev server runs (no `npm run build`).
