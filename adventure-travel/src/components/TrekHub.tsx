import Link from "next/link";
import type { ReactNode } from "react";
import { priceRoute, type Trek } from "@/data/treks";
import { MONTHS, seasonMonths } from "@/lib/season";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import Price from "@/components/Price";
import { ElevationLine } from "@/components/ElevationLine";
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
  const th = "px-3 py-3 text-left text-xs font-medium text-slate-500";
  // The route this page tops out on: a real number and a real profile for the header.
  const highest = treks.reduce<Trek | undefined>((best, t) => (!best || t.maxAltitude > best.maxAltitude ? t : best), undefined);

  return (
    <main id="main" className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Runs under the fixed navbar, so there's no light strip between the two. */}
      <header className="bg-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-28 sm:px-6 lg:grid-cols-12 lg:items-end lg:gap-12 lg:px-8 lg:pb-16 lg:pt-36">
          <div className="lg:col-span-7">
            <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-white/60">
              <Link href="/" className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-white">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/treks" className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-white">Treks</Link>
              <span aria-hidden>/</span>
              <span className="text-white/90">{title}</span>
            </nav>
            <h1 className="font-heading text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl xl:text-7xl">{title}</h1>
            <div className="mt-6 max-w-xl space-y-3 text-base leading-relaxed text-white/75 sm:text-lg">{intro}</div>
          </div>
          {highest && (
            <div className="border-t border-white/15 pt-4 lg:col-span-5">
              <p className="text-sm text-white/60">
                Highest point on this page:{" "}
                <Link href={`/treks/${highest.slug}`} className="text-white/90 underline decoration-white/30 underline-offset-4 transition-colors duration-150 ease-out hover:text-white">{highest.name}</Link>
              </p>
              <p className="mt-2 font-heading text-6xl font-medium tabular-nums leading-none sm:text-7xl">
                {highest.maxAltitude.toLocaleString("en-IN")}
                <span className="ml-2 font-nav text-xl font-normal text-white/60">m</span>
              </p>
              <div className="mt-5 h-20 text-emerald-400 sm:h-24">
                <ElevationLine profile={highest.elevationProfile} strokeWidth={2} />
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="py-section-sm mx-auto max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        <section aria-labelledby="compare" className="lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <h2 id="compare" className="font-heading text-3xl font-medium tracking-[-0.02em] text-slate-900 sm:text-4xl">Compare the treks</h2>
            <p className="mt-3 max-w-xs text-sm text-slate-500">Prices are per person. Tap a trek for its day-by-day itinerary, what&apos;s included and dates.</p>
          </div>
          <div className="relative mt-6 overflow-x-auto lg:col-span-9 lg:mt-0">
            <table className="w-full min-w-[760px] border-y border-slate-200 text-sm">
              <thead className="border-b border-slate-300">
                <tr>
                  <th scope="col" className={th}>Trek</th>
                  <th scope="col" className={th}>Days</th>
                  <th scope="col" className={th}>Highest point</th>
                  <th scope="col" className={th}>Grade</th>
                  <th scope="col" className={th}>Best season</th>
                  <th scope="col" className={`${th} text-right`}>From</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {treks.map((t) => (
                  <tr key={t.slug} className="align-top">
                    <th scope="row" className="px-3 py-4 text-left">
                      <Link href={`/treks/${t.slug}`} className="font-heading text-lg font-medium text-slate-900 transition-colors duration-150 ease-out hover:text-emerald-700">{t.name}</Link>
                    </th>
                    <td className="px-3 py-4 font-heading text-lg tabular-nums text-slate-900">{t.days}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-slate-600"><span className="font-heading text-lg tabular-nums text-slate-900">{t.maxAltitude.toLocaleString("en-IN")}</span> m</td>
                    <td className="whitespace-nowrap px-3 py-4 text-slate-600">{t.difficulty}</td>
                    <td className="px-3 py-4 text-slate-600">{t.bestSeason}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-right">
                      <span className="font-heading text-lg font-medium tabular-nums text-slate-900"><Price inr={t.price} /></span>
                      {priceRoute(t) && <span className="block text-xs text-slate-500">{priceRoute(t)}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="season" className="border-t border-slate-200 pt-12 lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <h2 id="season" className="font-heading text-3xl font-medium tracking-[-0.02em] text-slate-900 sm:text-4xl">When to go</h2>
          </div>
          <div className="relative mt-6 overflow-x-auto lg:col-span-9 lg:mt-0">
            <table className="w-full min-w-[760px] border-y border-slate-200 text-sm">
              <thead className="border-b border-slate-300">
                <tr>
                  <th scope="col" className={th}>Trek</th>
                  {MONTHS.map((m) => (
                    <th key={m} scope="col" className="px-1 py-3 text-center text-xs font-medium text-slate-500">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {treks.map((t) => {
                  const open = new Set(seasonMonths(t.bestSeason));
                  return (
                    <tr key={t.slug}>
                      <th scope="row" className="whitespace-nowrap px-3 py-3 text-left font-heading text-base font-medium text-slate-900">{t.name}</th>
                      {MONTHS.map((m, i) => (
                        <td key={m} className="px-1 py-3 text-center">
                          {open.has(i) ? (
                            <span className="inline-block h-2.5 w-full max-w-8 rounded-full bg-emerald-500" title={`${m}: good season`}>
                              <span className="sr-only">{m}: good season</span>
                            </span>
                          ) : (
                            <span className="inline-block h-2.5 w-full max-w-8 rounded-full bg-slate-100" aria-hidden />
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

        <section aria-labelledby="treks" className="border-t border-slate-200 pt-12">
          <h2 id="treks" className="font-heading text-3xl font-medium tracking-[-0.02em] text-slate-900 sm:text-4xl">The treks</h2>
          <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
            {treks.map((t) => (
              <TrekCard key={t.slug} trek={t} />
            ))}
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
