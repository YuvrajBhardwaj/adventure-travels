# Hosting the site on GoDaddy instead of Vercel

Written 10 Nov 2026 for the owner. Short answer: **you can put the website pages on GoDaddy, but online booking and payment stop working there.** Keep Vercel for as long as the site takes bookings and payments online.

## Why only part of the site works on GoDaddy

The site has two parts:

| Part | What it is | Runs on GoDaddy shared hosting? |
|---|---|---|
| **Pages** (home, treks, courses, contact, FAQ, login, dashboard, admin) | Plain HTML, CSS, JS and images made by `npm run build` into the `out/` folder | Yes |
| **Server functions** in `api/` (8 of them) | Small Node.js programs that hold secret keys | **No** (shared hosting runs PHP, not these) |

What the 8 server functions do, and what breaks without them:

| Function | Job | On GoDaddy |
|---|---|---|
| `bookings` | Saves trek and course bookings with the price from the server | Booking forms fail; visitors see the WhatsApp fallback |
| `create-order` | Starts a Razorpay payment | **No online payment** |
| `verify-payment` | Confirms a payment right after paying | No payment confirmation |
| `razorpay-webhook` | Razorpay confirms a payment directly | Razorpay webhook stops working |
| `cron` | Daily: balance reminders, retrying emails | No reminders, no email retries |
| `account` | Links signed-out course bookings; deletes accounts | These two buttons fail |
| `geo`, `rates` | Shows prices in the visitor's currency | Prices stay in INR only |

Sign-up, log-in and the admin pages read the database (Supabase) directly, so they still work.

## If you still want the pages on GoDaddy (WhatsApp-only bookings)

1. **Build** on your computer, from `adventure-travel/` (stop `npm run dev` first):
   ```bash
   npm run build
   ```
   The site is now in `adventure-travel/out/`. (Next.js names this folder `out`, not `dist`.)
   `.env.local` must have `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, or log-in won't work on the built site.
2. **Zip** everything *inside* `out/` (not the `out` folder itself).
3. **Upload:** GoDaddy → My Products → Web Hosting → **cPanel** → **File Manager** → open `public_html` → delete the old files there → **Upload** the zip → right-click → **Extract**.
   FTP works too (FileZilla with the FTP login from cPanel → FTP Accounts).
4. **Clean addresses:** in `public_html` create a file named `.htaccess` with:
   ```apache
   RewriteEngine On
   # /treks/kuari-pass -> /treks/kuari-pass.html
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteCond %{REQUEST_FILENAME}.html -f
   RewriteRule ^(.*)$ $1.html [L]
   ErrorDocument 404 /404.html
   ```
5. **Point the domain at GoDaddy hosting:** GoDaddy → Domains → himalayanarcadventure.com → DNS. Change the `A` record for `@` from Vercel's IP to your hosting IP (shown in cPanel), and the `www` CNAME to `@`. DNS changes take up to a few hours.
6. **HTTPS:** cPanel → **SSL/TLS Status** → run **AutoSSL** for the domain.
7. **Every change** means repeating steps 1–3 by hand. There's no automatic deploy from GitHub.

To go back to Vercel, put the DNS records back the way Vercel shows them (Vercel → Project → Settings → Domains).

## How long do we stay on Vercel?

**For as long as the site takes bookings and payments online.** Vercel builds and publishes every push to `main` automatically and runs the 8 functions next to the database in Mumbai.

One thing to fix before real money: the site is on Vercel's free **Hobby** plan, which Vercel allows for **personal, non-commercial** use only. Once Razorpay live keys are on, this is a business taking payments, so move to **Vercel Pro** (about US$20 a month) at the same time. Pro also lifts the daily deploy limit that likely stopped the 7 Nov deploy.

When moving off Vercel would make sense:

- **You drop online payments** and take bookings only on WhatsApp: then GoDaddy (steps above) is enough.
- **Vercel Pro costs too much later:** the 8 functions can move to another host that runs Node.js (for example a GoDaddy VPS, not shared hosting, or Supabase Edge Functions), with the pages on GoDaddy. That needs code changes (an API address setting and cross-site permissions), roughly a day of work.

## Recommendation

Stay on Vercel. Keep the domain at GoDaddy, pointing to Vercel as it does now. Upgrade to Vercel Pro when you switch Razorpay to live keys.
