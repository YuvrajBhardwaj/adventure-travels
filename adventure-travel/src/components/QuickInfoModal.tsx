"use client";

import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Trek } from "@/data/treks";
import { DIFFICULTY_COLORS } from "@/data/treks";
import Price from "@/components/Price";
import { seasonMonths } from "@/lib/season";

export type QuickInfoId =
  | "difficulty" | "duration" | "altitude" | "season" | "group"
  | "basecamp" | "age" | "accommodation" | "fitness" | "offloading" | "cloakroom"
  | "inc-tent" | "inc-permits" | "inc-medical" | "inc-meals";

/* ponytail: heuristics keyed off difficulty — replace with per-trek data if it ever matters */
const AGE: Record<string, string> = { Easy: "8 – 62 years", Moderate: "10 – 60 years", Challenging: "14 – 55 years", Strenuous: "16 – 50 years" };
const FITNESS: Record<string, string> = { Easy: "5 km in 45 mins", Moderate: "5 km in 40 mins", Challenging: "5 km in 35 mins", Strenuous: "10 km in 60 mins" };
const EXPERIENCE: Record<string, string> = {
  Easy: "First-timers welcome — no prior trekking experience needed.",
  Moderate: "Some prior high-altitude hiking recommended, or strong hill-walking fitness.",
  Challenging: "At least one moderate Himalayan trek under your belt.",
  Strenuous: "Multiple Himalayan treks, including one challenging/expedition-grade trek.",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function H({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-stretch gap-3">
      <span className="w-1 rounded-full bg-emerald-600" />
      <h3 className="font-heading text-lg font-bold text-foreground">{children}</h3>
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm leading-relaxed text-muted">{children}</p>;
}

function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mb-3 space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function quickInfoModalBody(id: QuickInfoId, trek: Trek): { title: string; body: React.ReactNode } {
  const ft = Math.round(trek.maxAltitude * 3.28084);
  const totalHours = trek.itinerary.reduce((s, d) => s + d.hours, 0);
  const longestDay = trek.itinerary.reduce((a, b) => (b.hours > a.hours ? b : a), trek.itinerary[0]);
  const basecamp = trek.location ?? trek.region;
  const isUttarakhand = trek.region.includes("Uttarakhand");
  // Whole ranges, wrapping past December ("Sep–Jun"); bracketed notes are ignored.
  const months = new Set(seasonMonths(trek.bestSeason).map((i) => MONTHS[i]));

  switch (id) {
    case "difficulty":
      return {
        title: `What ${trek.difficulty} really means`,
        body: (
          <>
            <P>
              The <strong>{trek.name}</strong> is graded <strong style={{ color: DIFFICULTY_COLORS[trek.difficulty] }}>{trek.difficulty}</strong> on our
              four-level scale. Here is exactly what that means on the trail.
            </P>
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["Easy", "Moderate", "Challenging", "Strenuous"] as const).map((d) => (
                <div
                  key={d}
                  className={`rounded-xl border p-2.5 text-center text-xs font-semibold ${
                    d === trek.difficulty ? "border-transparent text-white" : "border-slate-200 text-muted dark:border-white/10"
                  }`}
                  style={d === trek.difficulty ? { backgroundColor: DIFFICULTY_COLORS[d] } : undefined}
                >
                  {d}
                </div>
              ))}
            </div>
            {trek.difficulty === "Easy" && (
              <UL items={[
                "Gentle, well-defined trails with gradual climbs and predictable terrain.",
                "Trekking days of 4–6 hours; no technical sections or steep scrambles.",
                "Altitude stays in a comfortable zone — ideal first Himalayan trek.",
                "Basic fitness and a positive attitude are all you need.",
              ]} />
            )}
            {trek.difficulty === "Moderate" && (
              <UL items={[
                "Steadier climbs with some long days and steeper sections.",
                "Expect 5–7 hours of walking on mixed terrain — forest, meadow, moraine.",
                "Altitude becomes a factor; a calm pace and hydration matter.",
                "Prior day-hiking experience and regular walking fitness recommended.",
              ]} />
            )}
            {trek.difficulty === "Challenging" && (
              <UL items={[
                "Long trekking days (6–8+ hrs) with significant altitude gain.",
                "Steep ascents/descents, possible snow patches and scree.",
                "Sleeping altitude crosses zones where AMS must be respected.",
                "You need proven fitness and at least one moderate trek behind you.",
              ]} />
            )}
            {trek.difficulty === "Strenuous" && (
              <UL items={[
                "Expedition-grade effort: big days, high passes, remote terrain.",
                "Technical sections — moraine, boulder zones, possible rope-fixing.",
                "Extreme altitude with real AMS/HAPE/HACE risk; health checks daily.",
                "Only for trekkers with multiple high-altitude treks and strong conditioning.",
              ]} />
            )}
          </>
        ),
      };

    case "duration":
      return {
        title: "Your day-by-day effort",
        body: (
          <>
            <P>
              <strong>{trek.days} days</strong> on the mountain with roughly <strong>{totalHours} hours</strong> of actual trekking. This is how the
              effort spreads across the itinerary:
            </P>
            <div className="mb-4 overflow-hidden rounded-xl border border-slate-100 dark:border-white/10">
              {trek.itinerary.map((d) => (
                <div
                  key={d.day}
                  className="flex items-center justify-between gap-3 border-b border-slate-50 px-4 py-2.5 text-sm last:border-0 dark:border-white/5"
                >
                  <span className="font-semibold text-foreground">Day {d.day}</span>
                  <span className="min-w-0 flex-1 truncate text-muted">{d.title}</span>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    d === longestDay ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-muted dark:bg-white/10"
                  }`}>
                    {d.hours}h · {d.altitude.toLocaleString("en-IN")}m
                  </span>
                </div>
              ))}
            </div>
            <P>
              The longest day is <strong>Day {longestDay.day} — {longestDay.title}</strong> ({longestDay.hours} hours). Pace yourself the evening
              before, hydrate well, and pack your day-pack light.
            </P>
          </>
        ),
      };

    case "altitude":
      return {
        title: `Sleeping and climbing to ${ft.toLocaleString("en-IN")} ft`,
        body: (
          <>
            <P>
              The highest point of this trek is <strong>{trek.maxAltitude.toLocaleString("en-IN")} m ({ft.toLocaleString("en-IN")} ft)</strong>.
              {trek.maxAltitude >= 3500
                ? ` That puts your summit day in the high-altitude zone, where the air holds roughly ${Math.round(100 - (trek.maxAltitude / 8848) * 65)}% of sea-level oxygen.`
                : " This is a comfortable altitude where most trekkers feel little to no altitude effect."}
            </P>
            <div className="mb-4 space-y-2">
              {[
                { range: "Below 3,000 m", note: "Low altitude — minimal risk", active: trek.maxAltitude < 3000 },
                { range: "3,000 – 4,000 m", note: "Moderate zone — acclimatise, hydrate", active: trek.maxAltitude >= 3000 && trek.maxAltitude < 4000 },
                { range: "4,000 – 5,000 m", note: "High zone — AMS symptoms possible", active: trek.maxAltitude >= 4000 && trek.maxAltitude < 5000 },
                { range: "Above 5,000 m", note: "Very high zone — serious acclimatisation required", active: trek.maxAltitude >= 5000 },
              ].map((z) => (
                <div
                  key={z.range}
                  className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm ${
                    z.active ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-slate-100 text-muted dark:border-white/10"
                  }`}
                >
                  <span>{z.range}</span>
                  <span className="text-xs">{z.note}</span>
                </div>
              ))}
            </div>
            {trek.maxAltitude >= 3000 && (
              <UL items={[
                "Our itinerary builds in acclimatisation — never climb higher while symptoms persist.",
                "Daily pulse and oxygen (SpO₂) checks at every camp by your trek leader.",
                "Diamox is a personal choice — discuss with your doctor before the trek.",
                "Descend immediately if you have a severe headache, vomiting, or breathlessness at rest.",
              ]} />
            )}
          </>
        ),
      };

    case "season":
      return {
        title: `Best window: ${trek.bestSeason}`,
        body: (
          <>
            <P>Months highlighted below are the ideal window for the {trek.name}:</P>
            <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {MONTHS.map((m) => (
                <div
                  key={m}
                  className={`rounded-xl py-2 text-center text-xs font-semibold ${
                    months.has(m) ? "bg-emerald-600 text-white" : "bg-slate-100 text-muted dark:bg-white/10"
                  }`}
                >
                  {m}
                </div>
              ))}
            </div>
            <UL items={[
              months.has("Dec") || months.has("Jan") ? "Winter window: snow-loaded trails, frozen lakes, and the clearest mountain views of the year." : "Pre-monsoon (Apr–Jun): blooming meadows and long daylight hours.",
              months.has("Jul") || months.has("Aug") ? "Monsoon-window trek: lush greenery but pack full rain protection." : "Post-monsoon (Sep–Nov): the most stable weather and crystal-clear skies.",
              "Shoulder months can still work — talk to our team about current trail conditions.",
            ]} />
          </>
        ),
      };

    case "group":
      return {
        title: "Small batches, by design",
        body: (
          <UL items={[
            trek.groupSize ? `This trek runs with a maximum of ${trek.groupSize} trekkers per batch.` : "We cap every departure at a small batch size.",
            "Trek leader to trekker ratio kept high enough that nobody gets left behind on the trail.",
            "Smaller groups mean safer river crossings, faster emergency response, and quieter campsites.",
            "Meals, tents, and attention are simply better when the kitchen team isn't feeding an army.",
            "Solo trekkers are welcome — our batches naturally mix experience levels.",
          ]} />
        ),
      };

    case "basecamp":
      return {
        title: `Getting to ${basecamp}`,
        body: (
          <>
            <P>
              The trek starts and ends at <strong>{basecamp}</strong> ({trek.region}). We coordinate a group pickup for every batch —
              details are shared on your WhatsApp group after booking.
            </P>
            <UL items={[
              <span key="air"><strong>Nearest airport:</strong> {isUttarakhand ? "Dehradun (Jolly Grant, DED)" : "Bhuntar (KUU), near Kullu — Chandigarh (IXC) is the well-connected alternative"}</span>,
              <span key="rail"><strong>Nearest railhead:</strong> {isUttarakhand ? "Dehradun Railway Station" : "Chandigarh Junction"}</span>,
              <span key="road"><strong>By road:</strong> overnight Volvo/buses and shared taxis run to the base town from these hubs</span>,
              <span key="map">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${basecamp}, ${trek.region}, India`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
                >
                  Open {basecamp} in Google Maps ↗
                </a>
              </span>,
            ]} />
            <P>Plan to arrive at the pickup city the evening before Day 1 — mountain drives start early.</P>
          </>
        ),
      };

    case "age":
      return {
        title: "Who this trek is for",
        body: (
          <>
            <P>
              Recommended age range: <strong>{AGE[trek.difficulty]}</strong>. {EXPERIENCE[trek.difficulty]}
            </P>
            <H>Who should think twice</H>
            <UL items={[
              "Trekkers with uncontrolled blood pressure, cardiac conditions, or asthma triggered by cold exertion — get a doctor's clearance first.",
              "Anyone recovering from knee, ankle, or back injuries — descents are the real test.",
              treks50Plus(trek) ? "Trekkers above 58: we require a basic cardiac fitness (treadmill test) report before the trek." : "If you're above 58, a basic treadmill test report is required before joining.",
              "Minors under 18 must be accompanied by a parent or legal guardian.",
            ]} />
          </>
        ),
      };

    case "accommodation":
      if (trek.stay) return stayBody(trek, "Where you'll sleep");
      return {
        title: "Where you'll sleep",
        body: (
          <UL items={[
            "High-altitude dome tents (2-sharing) with sleeping mats — tested for Himalayan wind and rain.",
            "Sleeping bags rated for sub-zero temperatures, with fresh hygiene liners for every trekker.",
            "Guesthouse/lodge stay on drive-in days at the base town where the itinerary allows.",
            "Toilet tents with dry-eco pits at wilderness campsites — we leave no trace.",
            "Want a tent to yourself? Single supplements are available on request (subject to availability).",
          ]} />
        ),
      };

    case "fitness":
      return {
        title: `Target: ${FITNESS[trek.difficulty]}`,
        body: (
          <>
            <P>
              Before the trek you should comfortably be able to cover <strong>{FITNESS[trek.difficulty]}</strong>. This is the single best
              predictor of whether you&apos;ll enjoy the {trek.name} or endure it.
            </P>
            <H>Your 4-week prep plan</H>
            <UL items={[
              <span key="1"><strong>Week 1:</strong> 3 brisk walks of 45 mins + 2 easy jogs. Start climbing stairs instead of lifts.</span>,
              <span key="2"><strong>Week 2:</strong> 3–4 walks of 60 mins carrying a 4–5 kg backpack. One longer weekend hike.</span>,
              <span key="3"><strong>Week 3:</strong> Time yourself on the target benchmark. Add hill/stair repeats (up-down, 30 mins).</span>,
              <span key="4"><strong>Week 4:</strong> Taper — two 45-min walks, stretch daily, sleep well, and hydrate more than usual.</span>,
            ]} />
            <P>Leg strength (squats, lunges) and core (planks) twice a week will make the descents dramatically easier.</P>
          </>
        ),
      };

    case "offloading":
      return {
        title: "Read before you offload",
        body: (
          <UL items={[
            "When you offload, a mule or porter carries your belongings between camps.",
            "Offloading is intended for trekkers with injuries, health issues, or genuine limitations.",
            "Max weight: 9 kg per person — packed into our weather-resistant kit bag.",
            "The kit bag is carried by mules or porters and reunites with you at each campsite.",
            "You will not need your trekking backpack if you're offloading — but bring a small day pack for water, rain layers, and snacks.",
            "Offloading slots are limited per batch — book in advance via WhatsApp.",
            <span key="wa">
              <a
                href="https://wa.me/917817912062?text=Hi!%20I'd%20like%20to%20book%20offloading%20for%20my%20trek."
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
              >
                Book offloading on WhatsApp ↗
              </a>
            </span>,
          ]} />
        ),
      };

    case "cloakroom":
      return {
        title: "What is our cloakroom facility?",
        body: (
          <>
            <P>
              Carrying extra luggage you don&apos;t want on the trail? Leave it at our basecamp cloakroom. It&apos;s a locked storage room at the
              base town where non-essential bags stay safe while you trek.
            </P>
            <UL items={[
              "You won't have access to your cloakroom bag during the trek — anything you might need on the trail stays in your backpack.",
              "One piece of luggage can be left behind at no charge.",
              "Anything beyond one piece is chargeable at Rs. 500 per extra bag.",
              <span key="val"><em>Note: <strong>do not leave valuables in your cloakroom bag</strong> — wallets, passports, and laptops are best carried with you. Bags are stored together in one room under team supervision, not in individual lockers.</em></span>,
            ]} />
          </>
        ),
      };

    case "inc-tent":
      if (trek.stay) return stayBody(trek, trek.stay.label);
      return {
        title: "Twin Sharing Tent Accommodation",
        body: (
          <>
            <P>
              Standard on every trek — you share a spacious dome tent with a fellow trekker of the same gender. The cost of tents is fully
              included in your trek price.
            </P>
            <UL items={[
              "High-altitude alpine dome tents, weather-tested for Himalayan wind and rain.",
              "Sleeping bags rated for sub-zero temperatures, plus a fresh hygiene liner for every trekker.",
              "Foam sleeping mats given to each person for insulation against the cold ground.",
              "Tents are set up and taken down by our camp crew — you just walk in at the day's end.",
              "Want a tent to yourself? Single Tent Occupancy is available on request at an extra cost.",
            ]} />
          </>
        ),
      };

    case "inc-permits":
      return {
        title: "All Permits & Entry Fees",
        body: (
          <>
            <P>
              We arrange every permit and entry fee required for your trek — so you don&apos;t handle paperwork, queue at checkposts, or pay extra
              at the last minute.
            </P>
            <UL items={[
              "Forest department trekking permits are arranged in advance by our team.",
              "National park and sanctuary entry fees are included where applicable.",
              "For ILP-restricted frontier treks, we also arrange the Inner Line Permit (ILP).",
              "Porters, guides, and camp staff are fully licensed and registered.",
              "A government-linked ID (Aadhaar / Passport / Driving Licence) is all you need to carry.",
            ]} />
          </>
        ),
      };

    case "inc-medical":
      return {
        title: "Daily Medical & Safety Check-ups",
        body: (
          <>
            <P>
              Your safety is non-negotiable. Every batch carries a certified trek leader and a full first-aid kit, and every trekker gets a
              health check at the start of each trekking day.
            </P>
            <UL items={[
              "Baseline health check (pulse, blood pressure, SpO₂) at the start of the trek.",
              "Daily pulse and oxygen (SpO₂) monitoring at every campsite by your trek leader.",
              "A complete first-aid kit and emergency oxygen cylinder travel with every batch.",
              "Satellite phone / Garmin device for emergency communication in remote zones.",
              "Emergency evacuation protocol in place, with the nearest medical facility identified on each route.",
            ]} />
          </>
        ),
      };

    case "inc-meals":
      return {
        title: "Freshly Cooked Meals on Trail",
        body: (
          <>
            <P>
              Our trail kitchen serves hygienic, freshly cooked hot meals at every camp — plentiful Indian food designed for the altitude,
              and the cost is included in your trek price.
            </P>
            <UL items={[
              "The meals marked for each day in the itinerary — on most trekking days that's breakfast, packed lunch, evening tea & snacks, and dinner.",
              "High-carb, high-energy meals — rotis, dal, rice, sabzi, soups, and more.",
              "Hot beverages (tea, coffee, lemon tea, hot water) served through the day.",
              "Dinner and breakfast are prepared to order in our on-trail kitchen, not pre-packaged.",
              "Veg meals by default; eggs/dairy where appropriate. Vegan or Jain preferences can be arranged on request.",
              "Purified/filtered drinking water is made available at every camp.",
            ]} />
          </>
        ),
      };
  }
}

/** Rooms instead of tents: the trek's own stay, with its room-sharing prices when it has them. */
function stayBody(trek: Trek, title: string) {
  return {
    title,
    body: (
      <>
        <P>{trek.stay?.detail}. The cost of the stay is included in your trek price.</P>
        {trek.roomSharing && (
          <UL items={trek.roomSharing.map((r) => (
            <span key={r.label}>
              <strong>{r.label}</strong>, {r.perRoom} to a room: <Price inr={r.price} /> per person
            </span>
          ))} />
        )}
      </>
    ),
  };
}

function treks50Plus(trek: Trek) {
  return trek.difficulty === "Challenging" || trek.difficulty === "Strenuous";
}

/**
 * The "Know more" panel behind the trek facts and the booking card's inclusions. Kit Dialog:
 * rises from the bottom on phones, centred from `sm` up; focus trap, Escape and scroll lock
 * come from Radix. Callers keep it mounted with open=false after closing so it animates out.
 */
export function QuickInfoModal({
  id,
  open = true,
  label,
  trek,
  onClose,
}: {
  id: QuickInfoId;
  open?: boolean;
  label: string;
  trek: Trek;
  onClose: () => void;
}) {
  const { title, body } = quickInfoModalBody(id, trek);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="lg" placement="bottom" tone="light" hideClose className="max-w-2xl">
        <DialogTitle className="sr-only">{`${label} details`}</DialogTitle>
        <div className="px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-8">
          <Badge className="mb-4 bg-emerald-600 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white ring-0">
            {label}
          </Badge>
          <DialogClose
            aria-label="Close popup"
            className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-slate-900"
          >
            <svg className="h-5 w-5" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </DialogClose>
          <H>{title}</H>
          <div className="pr-1">{body}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
