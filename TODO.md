# TODO

What's left, most urgent first. Tick items off here and record the change in [CHANGELOG.md](CHANGELOG.md).
**You** = the business owner (accounts, dashboards, decisions). **Dev** = code work Claude or a developer can do.
Last updated: 16 Oct 2026.

## 1. Set up the backend (blocks login, booking and payments)
Until this is done, login and sign-up show "Accounts are temporarily unavailable". This is true on this computer and almost certainly on the live site too.

- [ ] **You:** Create a Supabase project (a separate dev and production project is best).
- [ ] **You:** Run the 5 SQL files in order in the Supabase SQL Editor (list in the [Backend tracker](CHANGELOG.md#backend-tracker)), then give your own account admin rights.
- [ ] **You:** Supabase → Authentication:
  - turn on "Confirm email"
  - set up custom SMTP
  - set the Site URL
  - add `/dashboard` and `/reset-password` as redirect URLs
  - turn on the Google provider.
- [ ] **You:** Razorpay in **Test mode**: copy the keys, and add a webhook to `https://<site>/api/razorpay-webhook` for `payment.captured`, `order.paid` and `payment.failed`.
- [ ] **You:** Create an email App Password for the business mailbox (for SMTP).
- [ ] **You:** Make up a long random `CRON_SECRET`.
- [ ] **You or Dev:** Put all of the above in `adventure-travel/.env.local` and in Vercel (Development, Preview and Production), then restart the dev server. Full list in [.env.example](adventure-travel/.env.example).

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
- [ ] **Star ratings.** `src/data/treks.ts` has ratings and review counts, and when a trek has no count the trek page tells Google it has **100** reviews. Google treats invented review counts as spam. Are these from real reviews? If not, remove them (Dev, 10 minutes).
- [ ] **Stock photos.** Brahmatal, Roopkund, Kalindi Khal, Gupt Khal, Mana Pass, Niti Pass and Rimkhim show generic stock mountain photos (gallery and banner slideshow). Keep them, or show only the main image until you have real photos?
- [ ] **Navbar wording.** "Adventures" → "Treks", "Home" removed from the desktop bar, and the phone menu's main button now opens WhatsApp. OK?
- [ ] **SEO agent in git?** It's ignored with the rest of `.claude/`. Should it be shared in the repo?

## 5. Code and content
- [x] ~~Commit the navbar redesign and the `.gitignore` change~~ (done: `1be764a`, pushed to the preview branch).
- [ ] **Dev:** Commit `CHANGELOG.md`, `TODO.md` and the `CLAUDE.md` note.
- [ ] **You:** Re-save `panpatia-col-trek/IMG_6013.jpeg` and `IMG_6015.jpeg` the right way up. **Dev:** then remove them from `SIDEWAYS_PHOTOS` in `TrekDetailClient.tsx`.
- [ ] **Dev:** Run the SEO/SMO agent for a first audit and competitor-gap report, starting with Kuari Pass, Pangarchula, Dronagiri, Valley of Flowers and Kedarkantha.
- [ ] **Dev:** Fix the 9 remaining lint warnings (all minor: unused variables and similar).
- [ ] **Dev:** Optional: run `/impeccable init` once to record your brand and audience, so future design work fits better.
- [ ] **You:** Real photos for Tungnath and Madhyamaheshwar. They show a "no photo" panel at the moment.

## Done recently
See [CHANGELOG.md](CHANGELOG.md):
- trek slideshows and "Joshimath to Joshimath" pricing
- the finished backend: admin area, advance/balance payments, reminders, account self-service
- the navbar redesign
- the SEO/SMO agent.
