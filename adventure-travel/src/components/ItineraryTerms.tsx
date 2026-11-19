import Link from "next/link";
import { PAYMENT_TERMS, REFUND_TIERS, SKI_TERMS } from "@/data/cancellationPolicy";

/** The main booking terms, shown under a trek or course itinerary. Full text: /cancellation-policy. */
export default function ItineraryTerms({ kind }: { kind: "trek" | "course" }) {
  const payment = kind === "course" ? PAYMENT_TERMS : PAYMENT_TERMS.slice(0, 2);
  return (
    <aside aria-labelledby={`${kind}-terms-h`} className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600 dark:border-white/10 dark:bg-card dark:text-muted sm:p-6">
      <h3 id={`${kind}-terms-h`} className="font-heading text-lg font-semibold text-slate-900 dark:text-foreground">
        Before you book
      </h3>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        {payment.map((t) => <li key={t}>{t}</li>)}
        {REFUND_TIERS.map((t) => (
          <li key={t.window}>
            Cancel {t.window.toLowerCase()} the start: {t.cash.toLowerCase()}.{t.detail && ` ${t.detail}`}
          </li>
        ))}
        {kind === "course" && SKI_TERMS.filter((t) => t.title !== "December batches").map((t) => <li key={t.title}>{t.text}</li>)}
      </ul>
      <Link href="/cancellation-policy" className="mt-3 inline-block font-semibold text-emerald-700 underline decoration-emerald-700/30 underline-offset-2 hover:text-emerald-800 dark:text-emerald-400">
        Full payment and cancellation policy
      </Link>
    </aside>
  );
}
