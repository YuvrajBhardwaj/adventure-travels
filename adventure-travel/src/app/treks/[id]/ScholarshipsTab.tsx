"use client";

import Link from "next/link";
import type { Trek } from "@/data/treks";
import Price from "@/components/Price";

/* ── The offer. Change a number here and every trek page updates. ─────────────────
   These are commitments to customers — only publish numbers the business will honour. */
const CHILD_MAX_AGE = 14;
const CHILD_OFF_PCT = 30;
/** Treks where the children's scholarship applies. Kept to beginner-friendly routes. */
const CHILD_ELIGIBLE: Trek["difficulty"][] = ["Easy", "Moderate"];
const GROUP_EVERY = 5; // every 5 adults in one booking…
const GROUP_OFF_PCT = 50; // …one of them gets this much off the trek fee
const CLAIM_WINDOW_DAYS = 30;

const SUPPORT_EMAIL = "support@himalayanarcadventure.com";
const WHATSAPP = "https://wa.me/917817912062?text=";

const OTHER_PERKS = [
  { title: "Free date change", detail: "Plans shift. Move to another departure of this trek without a change fee." },
  { title: "No-cost EMI", detail: "Spread the fee over instalments with no added interest. Ask us which cards work." },
  { title: "Private departures", detail: "Two or more people can book a private departure with pacing adjusted to you." },
];

export default function ScholarshipsTab({ trek }: { trek: Trek }) {
  const childEligible = CHILD_ELIGIBLE.includes(trek.difficulty);
  const childPays = (trek.price * (100 - CHILD_OFF_PCT)) / 100;
  const groupSaves = (trek.price * GROUP_OFF_PCT) / 100;
  const adultsForFullFee = (GROUP_EVERY * 100) / GROUP_OFF_PCT;

  const claimLink = `${WHATSAPP}${encodeURIComponent(
    `Hi! I finished the ${trek.name} and want to claim a scholarship / group waiver. My booking name: `
  )}`;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Scholarships &amp; Waivers</h2>
      <p className="text-muted mb-8 max-w-2xl">
        Two simple ways to pay less on the {trek.name}: a scholarship for children, and a waiver when you come as a
        group.
      </p>

      <div className="grid gap-5 md:grid-cols-2 mb-10">
        {/* Children */}
        <section className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-6">
          <span className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
            {CHILD_OFF_PCT}% off
          </span>
          <h3 className="mt-3 text-lg font-bold text-foreground">Scholarship for children</h3>
          {childEligible ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                Is your child {CHILD_MAX_AGE} years old or younger? They get {CHILD_OFF_PCT}% off the trek fee.
              </p>
              <p className="mt-3 rounded-xl bg-white/70 dark:bg-white/5 px-4 py-3 text-sm text-foreground">
                On this trek: the fee is <Price inr={trek.price} /> per person, so a child pays{" "}
                <strong><Price inr={childPays} /></strong>.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              We keep this scholarship for our {CHILD_ELIGIBLE.join(" and ")} treks. The {trek.name} is{" "}
              {trek.difficulty.toLowerCase()}, so it isn&apos;t offered here.{" "}
              <Link href="/treks?difficulty=Easy" className="font-semibold text-emerald-700 dark:text-emerald-300 hover:underline">
                See treks that qualify
              </Link>
              .
            </p>
          )}
        </section>

        {/* Groups */}
        <section className="rounded-2xl border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 p-6">
          <span className="inline-block rounded-full bg-sky-600 px-3 py-1 text-xs font-bold text-white">
            {GROUP_OFF_PCT}% off for 1 in every {GROUP_EVERY}
          </span>
          <h3 className="mt-3 text-lg font-bold text-foreground">Waiver for groups</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            Book together with {GROUP_EVERY} adults (age {CHILD_MAX_AGE + 1} and above) and one person&apos;s trek fee
            drops by {GROUP_OFF_PCT}%.
            {Number.isInteger(adultsForFullFee) &&
              ` With ${adultsForFullFee} adults, the savings add up to one full trek fee.`}
          </p>
          <p className="mt-3 rounded-xl bg-white/70 dark:bg-white/5 px-4 py-3 text-sm text-foreground">
            On this trek: a group of {GROUP_EVERY} adults saves <strong><Price inr={groupSaves} /></strong>. We send that
            amount back to you after you finish the trek.
          </p>
        </section>
      </div>

      {/* How to claim */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">How to claim</h3>
      <ol className="grid gap-4 sm:grid-cols-3 mb-4">
        {[
          { n: "1", text: "Book your trek the usual way." },
          { n: "2", text: "Complete the trek." },
          {
            n: "3",
            text: `Within ${CLAIM_WINDOW_DAYS} days of your trek date, email us or message us on WhatsApp with your booking name. We send back the amount you saved.`,
          },
        ].map((step) => (
          <li key={step.n} className="flex gap-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-card p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
              {step.n}
            </span>
            <span className="text-sm leading-relaxed text-foreground">{step.text}</span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted mb-4">
        Requests made after {CLAIM_WINDOW_DAYS} days from your trek date can&apos;t be accepted.
      </p>
      <div className="flex flex-wrap gap-3 mb-12">
        <a
          href={claimLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Claim on WhatsApp
        </a>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-flex items-center rounded-xl border border-gray-300 dark:border-white/15 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-emerald-400"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>

      <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">More ways we keep it easy</h3>
      <ul className="grid gap-4 sm:grid-cols-3">
        {OTHER_PERKS.map((item) => (
          <li key={item.title} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-card p-5">
            <p className="font-semibold text-foreground">{item.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
