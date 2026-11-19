import Link from "next/link";
import { treks, type Trek } from "@/data/treks";
import { trekPhotos } from "@/data/trekGalleries";
import Price from "@/components/Price";
import NoPhoto from "@/components/NoPhoto";

/** The closest other treks: same pickup town, then region, then grade and length. */
function related(trek: Trek, count: number): Trek[] {
  const score = (t: Trek) =>
    (t.startsFrom === trek.startsFrom ? 4 : 0) +
    (t.region === trek.region ? 2 : 0) +
    (t.difficulty === trek.difficulty ? 1 : 0) -
    Math.abs(t.days - trek.days) / 4;
  return treks
    .filter((t) => t.slug !== trek.slug)
    .map((t) => ({ t, s: score(t) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, count)
    .map(({ t }) => t);
}

/**
 * "More treks like this" under a trek page. Server-rendered, so the links are in the static HTML:
 * they help visitors move on and help Google find and connect every trek page.
 */
export default function RelatedTreks({ trek }: { trek: Trek }) {
  const list = related(trek, 3);
  if (!list.length) return null;
  return (
    <section aria-labelledby="related-treks" className="border-t border-slate-200 bg-white">
      <div className="py-section-sm mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="related-treks" className="font-heading text-3xl font-medium tracking-[-0.02em] text-slate-900 sm:text-4xl">
          More treks like this
        </h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {list.map((t) => {
            const image = trekPhotos(t, 1)[0];
            return (
              <li key={t.slug}>
                <Link
                  href={`/treks/${t.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-150 ease-out hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={t.name} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <NoPhoto profile={t.elevationProfile} label={t.name} className="aspect-[4/3] w-full" />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="font-nav text-xs uppercase tracking-[0.14em] text-slate-500">
                      {t.days} days · {t.maxAltitude.toLocaleString("en-IN")} m · {t.difficulty}
                    </p>
                    <h3 className="mt-2 font-heading text-xl font-medium text-slate-900 group-hover:text-emerald-700">{t.name}</h3>
                    <p className="mt-auto pt-4 font-heading text-xl font-medium tabular-nums text-slate-900">
                      <span className="mr-1.5 font-sans text-sm font-normal text-slate-500">From</span>
                      <Price inr={t.price} />
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
