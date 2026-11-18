# Full test report (16–18 Nov 2026)

Six test agents checked the site, each in a different area. Each one only read the code or used the site; none changed code, made bookings, payments or accounts, or sent email.

This file combines their reports, says what has been fixed (uncommitted, on `main`), and lists what is still open.

## At a glance

| Area | Result |
|---|---|
| Type-check, lint, unit tests | Pass: 0 errors, 0 lint warnings, **92/92 tests** (6 new) |
| Browser tests (`npm run test:e2e`) | 3 of 6 failed: Chrome ran out of memory because other agents were running ~60 browsers. Not a site bug; re-run on a quiet machine. |
| Pages in a real browser (17 pages × 320/375/768/1440 px) | All load, one `<h1>` each, no sideways scroll, no script errors. Every filter, sort, tab, menu, lightbox and form check works. |
| Accessibility (WCAG 2.2 AA) | Several contrast and focus problems: the main ones are fixed, the rest are listed below |
| Backend and payments | Prices, ownership checks, webhooks, emails and database access rules are correct. The browser's money rules match the server's in 35,028 tested cases. Some real bugs, mostly fixed. |
| Content | FAQ facts didn't match the trek data, and some claims are unproven. Fixed where the data gives the answer; the rest needs owner answers. |
| SEO and sharing | Titles, descriptions, canonicals, Open Graph, JSON-LD, robots and sitemap all pass. Gaps are content depth and the pricing contradiction. |
| Dependencies (`npm audit`) | Unchanged: 1 critical (`next` 16.2.10), 5 high, 2 moderate. |

## Fixed (16–18 Nov, uncommitted)

**Readability and keyboard**
- Main green button: emerald-600 → emerald-700. White text was 3.77:1 and is now 5.36:1.
- Field borders and placeholders on light pages: 1.48:1 → 4.76:1.
- On the dark login and signup pages, field borders and placeholders are brighter.
- Trek difficulty badge: new darker `DIFFICULTY_INK` shades ("Moderate" was 2.77:1). The originals stay where they sit on the navy sections.
- New "Skip to main content" link: it is the first thing Tab reaches.
- FAQ search box now has a label for screen readers.

**Layout**
- Course page phone bar: "Book Now" was cut off at 320 px.
- Trek and course pages on phones: the fixed booking bar covered the footer's last links. The page now leaves room under it.
- Footer phone numbers: one link held both numbers but dialled only the first. Each number now has its own link.
- Footer "About Us" pointed at a section that didn't exist. It now goes to "Why trek with us" on the home page.
- Breadcrumb said "Adventures"; it now says "Treks", matching the structured data.
- Checkout tab title no longer shows the brand twice.

**Content**
- FAQ now matches `treks.ts`:
  - Brahmatal: 3,250 m / about 10,660 ft over 7 days (was "12,250 ft, 6 days").
  - Hampta Pass: 6 days, Jun–Sep, into Lahaul (not Spiti).
  - Bhrigu Lake: 3 days.
  - Valley of Flowers: Jul–Sep.
  - Kedarkantha: rated easy.
- Removed the unsourced "Uttarakhand's Trek of the Year"; "Lord Laxman" → "Lord Lakshmana".
- "We'll get back to you within 24 hours" → "We reply Mon–Sat, 9 AM–7 PM IST; seats are confirmed when you pay".
- Removed the hard-coded "18 treks" count.
- Checkout date-change line now adds "and that date has seats".
- Voucher WhatsApp link now opens with a prefilled message.

**Backend (money)**
- A booking whose trip has already started can no longer be paid online (409, "contact us on WhatsApp"); payment on the start day itself still works.
- An impossible date such as `2026-13-01` now gets a clear 400 error instead of crashing to a 502.
- A date with extra characters after it (`2026-12-01xyz`) is now rejected instead of cut short.
- New test file `src/lib/__tests__/paymentRules.test.ts` keeps the money rules shown in the browser in line with what the server charges.

**Owner requests, 18 Nov**
- The 7-day skiing course no longer has the Basic package (₹10,000 / ₹20,000). It is Premium only: ₹15,000, or ₹30,000 with stay. The price catalog is regenerated, and the Activities page says "From ₹15,000".
- "Top attractions" on tour pages is redesigned as a photo, the name, a 3-line excerpt and "Read more" (`src/components/TourAttractions.tsx`).
  - Auli has 6 places, two with our own photos (the chairlift and the range). The other four show the "no photo yet" panel until we have our own pictures; none were copied from other sites.
  - Chopta–Tungnath gets the same layout.

## Still open

### Needs the owner (facts only you know)
1. **Refund basis:** "25+ days before: 90% cash refund" doesn't fit "the 30% advance is non-refundable" plus the 3% charge and the 5% GST. What is the 90% of?
2. **Pickup town vs itinerary:** Valley of Flowers, Kuari Pass, Pangarchula, Gupt Khal, Dronagiri, Mana, Niti and Rimkhim are priced "Joshimath to Joshimath", but their day 1 and last day are the Rishikesh drive. Which is right?
3. **Placeholder prices:** Mana Pass, Niti Pass, Rimkhim and Bhrigu Lake are all ₹5,000.
4. **Altitudes that disagree:** in `treks.ts`, the top altitude, the itinerary and the height profile disagree for:
   - Kalindi Khal (5,942 vs 5,660);
   - Gupt Khal (5,800 vs 5,700);
   - Panpatia (5,260 vs 5,150);
   - Pangarchula (15,419 ft vs 4,600 m).

   The profile point counts also don't match the number of days on five treks.
5. **Claims to confirm or remove:**
   - "Acclimatisation days built into every itinerary above 3,000 m" and "spare days built in";
   - "Level 4 / internationally certified" ski coaches;
   - "certified avalanche guide, 15+ years";
   - "AST 1 certification included";
   - "satellite communicator on every trip";
   - "certified pilots and instructors";
   - "designed by nutritionists".
6. **support@himalayanarcadventure.com:** does the mailbox exist? The terms make it the only way to cancel.
7. **3% card surcharge:** you want it, but it isn't built yet (it needs a payment change).
8. **Near-duplicate pages:** `/treks/tungnath` and `/tours/chopta-tungnath`. Which one should Google rank?
9. **Photos:** Auli lake, Gorson Bugyal, Chattrakund, Joshimath and the Chopta places, for the attraction cards. Nine treks still use Unsplash covers, and 12 pages have no share image of their own.

### Dev work
- **High, payments:** a payment that arrives after the 15-minute seat hold can overbook a full batch.
  - `apply_payment()` doesn't check capacity, and the browser-side timeout depends on the visitor's clock.
  - Fix: expire the Razorpay order with the hold, or check seats in `apply_payment()`.
  - Needs a live database change, so the owner must OK it.
- **High, speed:** phones download 1600 px photos, 2.9 MB at the start of the home page. Make 800 px copies and use `srcset`.
- **High, security:** upgrade `next` to 16.4.6 or later and `nodemailer` (`npm audit`).
- **Medium:**
  - Any signed-in user can keep a batch's seats held by calling create-order every 15 minutes. Cap the holds per user.
  - Two browser tabs can create two advance orders for the same booking. Add one open order per booking and kind.
  - Signed-out course bookings have no rate limit or captcha, so anyone can make our Gmail write to strangers.
  - The sticky booking card on trek pages is taller than the screen, so its button scrolls away.
  - Focus isn't returned to the photo or "Info" button after the lightbox or contact popup closes.
  - `/faq`, `/contact`, `/login` and `/signup` have no `<main>` landmark.
- **Low:**
  - Profile email can be changed by the customer, which redirects receipts. Lock that column (database change).
  - Email retries lose Reply-To.
  - A second payment captured on an already-paid order isn't flagged for refund.
  - Some touch targets are under 24 px (carousel dots, breadcrumbs).
  - Heading levels skip (h1 → h3 "Filters", footer h4).
  - FAQ category pills are 4.34:1.
  - After a failed form submit, focus doesn't move to the first error.
  - `sitemap.ts` sets `lastmod` to the build time.
- **SEO content:**
  - a related-treks block, trek FAQs and "Getting to Joshimath" on trek pages;
  - expand the winter hub (about 400 words; competitors list 7–10 treks with month guidance);
  - home h1 "One range. Two seasons." should say what we sell.
- **Tests to add:**
  - API handlers (`bookings`, `create-order`, `verify-payment`, webhook, `cron`, `account`);
  - `applyPayment`, `markFailed`, `bookingState`;
  - `currency.ts`, and the seat edge cases in `departures.ts`.

## Agent reports
- **Test suites:** tsc, lint and 86/86 vitest at the time (now 92/92); e2e 3/6 because of the resource exhaustion described above; `npm audit` unchanged; the gaps in test coverage listed above.
- **Browser QA plus accessibility:** the functional pass and problems listed above. Screenshots and scripts are in the session scratchpad (`qa-browser/`).
- **Accessibility, static pass:** found the contrast and skip-link problems, which are now fixed.
- **Backend and payments:** VERIFIED for duplicate payments (with the two-tab gap), failed payments, server-side prices (catalog = `src/data` exactly; largest order is 120,000,000 paise, safely below the database integer limit), ownership, emails and RLS. The seat-hold overbooking is CONFIRMED.
- **Content:** found the claims, the trek-data mismatches and the contact inconsistencies above.
- **SEO and social:** all 39 sitemap URLs pass the technical checks. The competitor gaps for "Kuari Pass trek", "treks from Joshimath" and "winter treks Uttarakhand" are noted above. *Note: it called "since 2010" unproven, but the owner confirmed it on 13 Nov, so it stays.*
