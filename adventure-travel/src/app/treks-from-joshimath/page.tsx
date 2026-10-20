import Link from "next/link";
import { treks } from "@/data/treks";
import { courses } from "@/data/courses";
import { fitDescription, fitTitle, pageMetadata } from "@/lib/seo";
import { TrekHub } from "@/components/TrekHub";

const PATH = "/treks-from-joshimath";
const TITLE = "Treks from Joshimath";
const JOSHIMATH_TREKS = treks.filter((t) => t.startsFrom === "Joshimath");
const PERMIT_TOURS = JOSHIMATH_TREKS.filter((t) => t.permitTour);
const fromPrice = Math.min(...JOSHIMATH_TREKS.map((t) => t.price));

export const metadata = pageMetadata({
  title: fitTitle(TITLE, [`${JOSHIMATH_TREKS.length} Guided Routes`]),
  description: fitDescription([
    `${JOSHIMATH_TREKS.length} guided treks that start and end in Joshimath, Uttarakhand: ${JOSHIMATH_TREKS.map((t) => t.name).join(", ")}.`,
    `From ₹${fromPrice.toLocaleString("en-IN")} per person, Joshimath to Joshimath.`,
  ]),
  path: PATH,
});

export default function TreksFromJoshimathPage() {
  return (
    <TrekHub
      path={PATH}
      title={TITLE}
      treks={JOSHIMATH_TREKS}
      intro={
        <>
          <p>
            These {JOSHIMATH_TREKS.length} treks start and finish in Joshimath, in Chamoli district, where our office is (near the
            Military Hospital). Their prices are quoted Joshimath to Joshimath.
          </p>
          {/* Distances from the Rishikesh → Joshimath drives in the trek itineraries (src/data/treks.ts). */}
          <p>Getting here: Joshimath is 245–270 km by road from Rishikesh, a 9–10 hour drive up the Alaknanda valley.</p>
        </>
      }
    >
      {PERMIT_TOURS.length > 0 && (
        <section aria-labelledby="permits" className="rounded-2xl bg-slate-50 p-5 sm:p-6">
          <h2 id="permits" className="font-heading text-2xl font-bold tracking-[-0.02em] text-slate-900 sm:text-3xl">Permit tours to the Tibet border</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            {PERMIT_TOURS.map((t, i) => (
              <span key={t.slug}>
                {i > 0 && (i === PERMIT_TOURS.length - 1 ? " and " : ", ")}
                <Link href={`/treks/${t.slug}`} className="font-semibold text-emerald-700 hover:underline">{t.name}</Link>
              </span>
            ))}{" "}
            go into the Inner Line restricted zone above Joshimath. We process the Inner Line Permit and the frontier-zone paperwork
            for you; message us on{" "}
            <a href="https://wa.me/917817912062" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 hover:underline">
              WhatsApp
            </a>{" "}
            to check which documents you need.
          </p>
        </section>
      )}

      <section aria-labelledby="auli" className="rounded-2xl bg-slate-50 p-5 sm:p-6">
        <h2 id="auli" className="font-heading text-2xl font-bold tracking-[-0.02em] text-slate-900 sm:text-3xl">Winter in Auli</h2>
        <p className="mt-3 max-w-3xl text-slate-600">Our ski and snowboard school runs in Auli, just above Joshimath:</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {courses.map((c) => (
            <li key={c.slug}>
              <Link href={`/courses/${c.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 transition-colors duration-150 ease-out hover:border-emerald-400 hover:text-emerald-700">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-600">
          Looking for snow on foot? See <Link href="/winter-treks-uttarakhand" className="font-semibold text-emerald-700 hover:underline">winter treks in Uttarakhand</Link>.
        </p>
      </section>
    </TrekHub>
  );
}
