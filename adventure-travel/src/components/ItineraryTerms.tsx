import Link from "@/components/Link";
import { COURSE_REFUND_NOTE, COURSE_REFUND_TIERS, PAYMENT_TERMS, REFUND_TIERS, SKI_TERMS } from "@/data/cancellationPolicy";

/** The booking terms under a course itinerary — the only place ski and snowboard course terms are shown (owner, 20 Nov 2026). */
export default function ItineraryTerms({ kind, onFullTerms }: { kind: "trek" | "course"; onFullTerms?: () => void }) {
  const payment = kind === "course" ? PAYMENT_TERMS : PAYMENT_TERMS.slice(0, 2);
  const tiers = kind === "course" ? COURSE_REFUND_TIERS : REFUND_TIERS;
  return (
    <aside aria-labelledby={`${kind}-terms-h`} className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-600 dark:border-white/10 dark:bg-card dark:text-muted sm:p-6">
      <h3 id={`${kind}-terms-h`} className="font-heading text-lg font-semibold text-slate-900 dark:text-foreground">
        Before you book
      </h3>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        {payment.map((t) => <li key={t}>{t}</li>)}
        {tiers.map((t) => (
          <li key={t.window}>
            Cancel {t.window.toLowerCase()} the start: {t.cash.toLowerCase()}.{t.detail && ` ${t.detail}`}
          </li>
        ))}
        {kind === "course" && COURSE_REFUND_NOTE.map((n) => <li key={n.text}>{n.text}</li>)}
        {kind === "course" && SKI_TERMS.filter((t) => t.title !== "December batches").map((t) => <li key={t.title}>{t.text}</li>)}
      </ul>
      {onFullTerms ? (
        <a href="#tnc" onClick={onFullTerms} className="mt-3 inline-block font-semibold text-emerald-700 underline decoration-emerald-700/30 underline-offset-2 hover:text-emerald-800 dark:text-emerald-400">
          Cancellation policy &amp; T&amp;C
        </a>
      ) : (
        <Link href="/cancellation-policy" className="mt-3 inline-block font-semibold text-emerald-700 underline decoration-emerald-700/30 underline-offset-2 hover:text-emerald-800 dark:text-emerald-400">
          Full payment and cancellation policy
        </Link>
      )}
    </aside>
  );
}
