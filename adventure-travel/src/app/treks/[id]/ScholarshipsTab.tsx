"use client";

import type { Trek } from "@/data/treks";

const WHATSAPP = "https://wa.me/917817912062?text=";

/**
 * Scholarship programmes the business actually runs. Leave empty until there is a
 * real programme — the tab then offers a personal request route instead of
 * advertising anything that doesn't exist. Example entry:
 *   { title: "Local youth spots", detail: "Two places per departure for trekkers from Garhwal villages." }
 */
const SCHOLARSHIPS: { title: string; detail: string }[] = [];

const BUILT_IN = [
  {
    title: "Free date change",
    detail: "Plans shift. Move your booking to another departure of this trek without paying a change fee.",
  },
  {
    title: "No-cost EMI",
    detail: "Spread the fee over instalments without added interest. Ask us which cards and banks it works with.",
  },
  {
    title: "Voucher instead of a lost fee",
    detail: "If you have to cancel, part of the fee can come back as a Trek Voucher valid for a year. The Terms & Conditions tab has the slabs.",
  },
  {
    title: "Private departures",
    detail: "Groups of two or more can book a private departure with pacing and rest days adjusted to you.",
  },
];

export default function ScholarshipsTab({ trek }: { trek: Trek }) {
  const askLink = `${WHATSAPP}${encodeURIComponent(
    `Hi! I'd like to ask about a scholarship or fee waiver for the ${trek.name}.`
  )}`;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Scholarships &amp; Waivers</h2>
      <p className="text-muted mb-8 max-w-2xl">
        The fee shouldn&apos;t be the only thing standing between you and {trek.name}. Here&apos;s what is already built
        into every booking, and how to ask for more.
      </p>

      <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">Already built in</h3>
      <ul className="grid gap-4 sm:grid-cols-2 mb-10">
        {BUILT_IN.map((item) => (
          <li key={item.title} className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-card p-5">
            <p className="font-semibold text-foreground">{item.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.detail}</p>
          </li>
        ))}
      </ul>

      <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">Scholarships</h3>
      {SCHOLARSHIPS.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 mb-6">
          {SCHOLARSHIPS.map((s) => (
            <li key={s.title} className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-5">
              <p className="font-semibold text-foreground">{s.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.detail}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-500/40 p-6">
        <p className="font-semibold text-foreground">Need support to make this trek happen?</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted max-w-xl">
          Tell us a little about yourself and why this trek matters to you. Requests are handled personally by our team.
          Waivers and scholarships are decided case by case and may not be available for every departure.
        </p>
        <a
          href={askLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Ask us on WhatsApp
        </a>
      </div>
    </div>
  );
}
