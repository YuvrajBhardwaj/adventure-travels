import Link from "next/link";
import type { ReactNode } from "react";
import { DIFFICULTY_COLORS, priceRoute, type Trek } from "@/data/treks";
import { MONTHS, seasonMonths } from "@/lib/season";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import Price from "@/components/Price";
import { TrekCard } from "@/app/treks/TreksPageClient";

/**
 * A server-rendered landing page for one group of treks (e.g. "Treks from Joshimath").
 * Every fact in it comes from src/data, so it can't drift from the trek pages it links to.
 */
export function TrekHub({
  path,
  title,
  intro,
  treks,
  children,
}: {
  path: string;
  title: string;
  intro: ReactNode;
  treks: Trek[];
  children?: ReactNode;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: title,
        numberOfItems: treks.length,
        itemListElement: treks.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: absoluteUrl(`/treks/${t.slug}`) })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Treks", item: absoluteUrl("/treks") },
          { "@type": "ListItem", position: 3, name: title, item: absoluteUrl(path) },
        ],
      },
    ],
  };
  const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Runs under the fixed navbar, so there's no light strip between the two. */}
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 pb-14 pt-32 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="transition-colors duration-150 ease-out hover:text-white">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/treks" className="transition-colors duration-150 ease-out hover:text-white">Treks</Link>
            <span aria-hidden>/</span>
            <span className="text-white/90">{title}</span>
          </nav>
          <h1 className="font-heading text-4xl font-bold tracking-[-0.02em] sm:text-5xl">{title}</h1>
          <div className="mt-5 max-w-3xl space-y-3 text-lg leading-relaxed text-white/80">{intro}</div>
        </div>
      </header>

      <main className="py-section-sm mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        <section aria-labelledby="compare">
          <h2 id="compare" className="font-heading text-3xl font-bold tracking-[-0.02em] text-slate-900 sm:text-4xl">Compare the treks</h2>
          <div className="relative mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className={th}>Trek</th>
                  <th scope="col" className={th}>Days</th>
                  <th scope="col" className={th}>Highest point</th>
                  <th scope="col" className={th}>Grade</th>
                  <th scope="col" className={th}>Best season</th>
                  <th scope="col" className={`${th} text-right`}>From</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {treks.map((t) => (
                  <tr key={t.slug} className="align-top">
                    <th scope="row" className="px-4 py-3 text-left font-semibold">
                      <Link href={`/treks/${t.slug}`} className="text-slate-900 transition-colors duration-150 ease-out hover:text-emerald-600">{t.name}</Link>
                    </th>
                    <td className="px-4 py-3 tabular-nums">{t.days}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums">{t.maxAltitude.toLocaleString("en-IN")} m</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: DIFFICULTY_COLORS[t.difficulty] }} aria-hidden />
                      {t.difficulty}
                    </td>
                    <td className="px-4 py-3">{t.bestSeason}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <span className="font-semibold"><Price inr={t.price} /></span>
                      {priceRoute(t) && <span className="block text-xs text-slate-500">{priceRoute(t)}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">Prices are per person. Tap a trek for its day-by-day itinerary, what&apos;s included and dates.</p>
        </section>

        <section aria-labelledby="season">
          <h2 id="season" className="font-heading text-3xl font-bold tracking-[-0.02em] text-slate-900 sm:text-4xl">When to go</h2>
          <div className="relative mt-5 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className={th}>Trek</th>
                  {MONTHS.map((m) => (
                    <th key={m} scope="col" className="px-1 py-3 text-center text-xs font-semibold text-slate-500">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {treks.map((t) => {
                  const open = new Set(seasonMonths(t.bestSeason));
                  return (
                    <tr key={t.slug}>
                      <th scope="row" className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-slate-800">{t.name}</th>
                      {MONTHS.map((m, i) => (
                        <td key={m} className="px-1 py-2.5 text-center">
                          {open.has(i) ? (
                            <span className="inline-block h-3 w-full max-w-8 rounded-full bg-emerald-500" title={`${m}: good season`}>
                              <span className="sr-only">{m}: good season</span>
                            </span>
                          ) : (
                            <span className="inline-block h-3 w-full max-w-8 rounded-full bg-slate-100" aria-hidden />
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="treks">
          <h2 id="treks" className="font-heading text-3xl font-bold tracking-[-0.02em] text-slate-900 sm:text-4xl">The treks</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            {treks.map((t) => (
              <TrekCard key={t.slug} trek={t} />
            ))}
          </div>
        </section>

        {children}
      </main>
    </div>
  );
}
