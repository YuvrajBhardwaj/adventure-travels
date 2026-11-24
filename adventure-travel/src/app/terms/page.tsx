import Link from "@/components/Link";
import { breadcrumbLd, pageMetadata, webPageLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const DESCRIPTION =
  "Booking terms for Himalayan Arc Adventure treks, tours and ski courses: cancellations, refunds, payments and trip changes.";
import TermsConditions from "@/components/TermsConditions";

export const metadata = pageMetadata({
  title: "Terms & Conditions",
  description: DESCRIPTION,
  path: "/terms",
});

const a = "font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-800";

export default function TermsPage() {
  return (
    <main id="main" className="min-h-screen bg-white">
      <JsonLd graph={[webPageLd("WebPage", "/terms", "Terms & Conditions", DESCRIPTION), breadcrumbLd([["Terms & Conditions", "/terms"]])]} />
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-3xl px-4 pb-12 pt-28 sm:px-6 lg:pb-16 lg:pt-36">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-white">Home</Link>
            <span aria-hidden>/</span>
            <span className="text-white/90">Terms &amp; Conditions</span>
          </nav>
          <h1 className="font-heading text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl">Terms &amp; Conditions</h1>
          <p className="mt-6 text-white/75">Last updated: 20 Nov 2026</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-section-sm leading-relaxed text-slate-700 sm:px-6">
        <p className="mb-8">
          These terms apply to every trek, tour and course booked with Himalayan Arc Adventure. The refund tiers and
          date-change rules are set out in full on our{" "}
          <Link href="/cancellation-policy" className={a}>Cancellation &amp; Refund Policy</Link>; how we handle your data is
          in our <Link href="/privacy" className={a}>Privacy Policy</Link>.
        </p>
        <TermsConditions />
      </div>
    </main>
  );
}
