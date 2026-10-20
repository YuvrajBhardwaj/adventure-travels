import Link from "next/link";
import { treks } from "@/data/treks";
import { seasonMonths } from "@/lib/season";
import { fitDescription, fitTitle, pageMetadata } from "@/lib/seo";
import { TrekHub } from "@/components/TrekHub";

const PATH = "/winter-treks-uttarakhand";
const TITLE = "Winter Treks in Uttarakhand";
// "Winter" = the trek's own season covers January, the heart of the Himalayan winter.
const WINTER_TREKS = treks.filter((t) => t.region === "Uttarakhand" && seasonMonths(t.bestSeason).includes(0));
const SNOW_TREKS = WINTER_TREKS.filter((t) => /snow/i.test(t.bestSeason));
const fromPrice = Math.min(...WINTER_TREKS.map((t) => t.price));

export const metadata = pageMetadata({
  title: fitTitle(TITLE, ["December to February"]),
  description: fitDescription([
    `${WINTER_TREKS.length} Uttarakhand treks we run through the winter: ${WINTER_TREKS.map((t) => t.name).join(", ")}.`,
    `From ₹${fromPrice.toLocaleString("en-IN")} per person.`,
    "Compare days, altitude, grade and price.",
  ]),
  path: PATH,
});

export default function WinterTreksPage() {
  return (
    <TrekHub
      path={PATH}
      title={TITLE}
      treks={WINTER_TREKS}
      intro={
        <>
          <p>
            Every trek on this page runs in January, the heart of the Himalayan winter
            {SNOW_TREKS.length > 0 && <>, and {SNOW_TREKS.length} of them are snow treks</>}. Snow and trail conditions change
            from one season to the next, so check the latest with us before you book.
          </p>
        </>
      }
    >
      <section aria-labelledby="more" className="rounded-2xl bg-slate-50 p-5 sm:p-6">
        <h2 id="more" className="font-heading text-2xl font-bold tracking-[-0.02em] text-slate-900 sm:text-3xl">More winter ideas</h2>
        <ul className="mt-3 space-y-2 text-slate-600">
          <li>
            Learn to ski or snowboard: <Link href="/courses" className="font-semibold text-emerald-700 hover:underline">our courses in Auli</Link>.
          </li>
          <li>
            Starting from our base: <Link href="/treks-from-joshimath" className="font-semibold text-emerald-700 hover:underline">treks from Joshimath</Link>.
          </li>
          <li>
            Ask about conditions this month on{" "}
            <a href="https://wa.me/917817912062" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 hover:underline">
              WhatsApp
            </a>
            .
          </li>
        </ul>
      </section>
    </TrekHub>
  );
}
