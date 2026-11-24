# Data breach plan

**Himalayan Arc Adventure · himalayanarcadventure.com**
Draft, 24 Nov 2026. This is a working checklist, not legal advice. Have a lawyer check the "Who we must tell" section once.

A *personal data breach* is any time customer data is seen, copied, changed, lost or deleted by someone who shouldn't. For example: a leaked key, a hacked email or admin account, a laptop with exported booking data that goes missing, or a booking email sent to the wrong person.

---

## Who does what

| Role | Who | Phone |
|---|---|---|
| **Decides** (owner) | `[FILL IN: owner name]` | `[FILL IN]` |
| **Fixes** (developer) | `[FILL IN: developer name]` | `[FILL IN]` |
| **Grievance contact** (named on /privacy) | `[FILL IN]` | `[FILL IN]` |

Keep this table filled in on paper or a private note, not only in this file: the GitHub repo is public.

---

## The first hour: contain it

1. **Write down the time** you found out, and what you saw. Every deadline below counts from this moment.
2. **Don't delete anything** (logs, emails, bookings). You'll need them to know what happened.
3. **Change the key that leaked**, or all of them if you're not sure. Do it at the service and in Vercel (Settings → Environment Variables), then redeploy:

| What | Where to change it | Vercel variable |
|---|---|---|
| Database master key | Supabase → Project Settings → API Keys → create a new secret key, then revoke the old one | `SUPABASE_SERVICE_ROLE_KEY` |
| Database public key (only if the access rules were bypassed) | same page, the publishable/anon key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Payment keys | Razorpay → Account & Settings → API Keys → regenerate | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| Payment webhook | Razorpay → Webhooks → edit → new secret | `RAZORPAY_WEBHOOK_SECRET` |
| Email sending | Google Account → Security → App passwords → delete, create new | `SMTP_PASS` |
| Daily job | make up a new long random string | `CRON_SECRET` |

4. **Lock accounts:** if an admin or customer account is involved, reset its password in Supabase → Authentication → Users, and remove the admin role if needed.
5. **If the site itself is leaking** (a page or API showing other people's data), take it down: Vercel → Deployments → promote the last good deployment, or pause the project.

## Within 24 hours: find out what happened

Answer these, in writing:
- What data? (names, emails, phones, cities, emergency contacts, ID details, booking messages, payment references. We never hold card, UPI or bank details: Razorpay does.)
- Whose? How many people? Get the list of affected emails from Supabase.
- When did it start, and when did it stop?
- How? (a leaked key, a bug, a phished password, a lost device)

Where to look: Supabase → Logs (API and Auth); Vercel → Logs (the `api/` functions); `/admin/activity` (account and booking events); the `booking_status_events` table (who changed which booking); Razorpay → Transactions.

## Who we must tell

**Check these with a lawyer.** They are the rules as we understand them.

| Who | When | How |
|---|---|---|
| **Each affected customer** | Without delay (India, DPDP Rules) | Email, plus WhatsApp if serious. Use the template below. |
| **Data Protection Board of India** | Without delay, then a full report within 72 hours (DPDP Rules) | The Board's online portal. |
| **CERT-In** | Within 6 hours of noticing, for reportable cyber incidents, which include data breaches (CERT-In directions, 2022) | incident@cert-in.org.in, using their form. |
| **EU/UK authority** | Within 72 hours, if EU or UK residents' data is involved and GDPR applies to us (ask the lawyer whether it does) | The authority's online form. |
| **Razorpay** | Straight away, if payment keys leaked or payments look wrong | Razorpay support. |

Even if you're unsure whether it counts as a breach, write down why you decided what you did.

## Message to customers (template)

> Subject: Important: a problem with your details at Himalayan Arc Adventure
>
> Hello `[name]`,
>
> On `[date]` we found that `[what happened, in one sentence]`. This may have exposed your `[which details]`. Your card, UPI and bank details were not affected: they are held by Razorpay, not by us.
>
> What we have done: `[keys changed, problem fixed, etc.]`.
> What you can do: `[e.g. watch for calls or emails pretending to be us; we will never ask for your OTP or card number]`.
>
> If you have questions, contact `[grievance contact name, email, phone]`.
>
> We are sorry.
> Himalayan Arc Adventure

## Afterwards (within 2 weeks)

- [ ] Fix the cause, not only the symptom, and add a test or check so it can't happen again.
- [ ] Write a short note: timeline, what leaked, who was told and when, what changed. Keep it for at least 1 year (the DPDP Rules require logs to be kept for a year).
- [ ] Record it in `CHANGELOG.md` without any customer's personal details.
- [ ] Re-read this plan and fix whatever didn't work.

## Prevent (already in place)

Database access rules on every table; the master key only in Vercel server functions, never in the browser; payments only through Razorpay; a Content-Security-Policy; no trackers or analytics; customers can download their data and delete their account from the dashboard.

Still to do (see `TODO.md`): make the GitHub repo private; rotate the Gmail App Password (it was shared in chat once); turn on leaked-password protection in Supabase.
