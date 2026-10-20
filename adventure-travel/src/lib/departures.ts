import { MONTHS, seasonMonths } from "./season";

/**
 * The batch calendar as the trek page shows it. Batches come from Supabase
 * (supabase-departures.sql); these helpers are pure so they're unit-tested.
 */

/** One upcoming batch. */
export interface Departure {
  id: string;
  /** Start date, YYYY-MM-DD. */
  start: string;
  capacity: number;
  seatsLeft: number;
  closed: boolean;
  /** Optional label set by the admin, e.g. "Stargazing". */
  tag: string;
}

export type SeatStatus = "available" | "few" | "full" | "closed";

/** At or below this many seats, a batch shows "3 seats left". */
export const FEW_SEATS = 3;

type Seats = Pick<Departure, "seatsLeft" | "closed">;

export function seatStatus(d: Seats): SeatStatus {
  if (d.closed) return "closed";
  if (d.seatsLeft <= 0) return "full";
  return d.seatsLeft <= FEW_SEATS ? "few" : "available";
}

export function seatLabel(d: Seats): string {
  switch (seatStatus(d)) {
    case "closed":
      return "Closed";
    case "full":
      return "Full";
    case "few":
      return d.seatsLeft === 1 ? "1 seat left" : `${d.seatsLeft} seats left`;
    default:
      return "Available";
  }
}

export const isBookable = (d: Seats) => {
  const s = seatStatus(d);
  return s === "available" || s === "few";
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_MS = 86_400_000;
const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** Last day of a batch that starts on `start` and lasts `days` days. */
export function endDate(start: string, days: number): string {
  return new Date(utc(start).getTime() + (Math.max(days, 1) - 1) * DAY_MS).toISOString().slice(0, 10);
}

/** Every `weekday` (0 = Sun … 6 = Sat) from `from` to `to`, both included, every `everyWeeks` weeks. */
export function weeklyDates(from: string, to: string, weekday: number, everyWeeks = 1): string[] {
  const out: string[] = [];
  const first = utc(from);
  const last = utc(to).getTime();
  const step = Math.max(1, Math.floor(everyWeeks)) * 7 * DAY_MS;
  for (let t = first.getTime() + ((weekday - first.getUTCDay() + 7) % 7) * DAY_MS; t <= last; t += step) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
}

/** "Sat 7 Nov". */
export function dayLabel(iso: string): string {
  const d = utc(iso);
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** "Sat 7 Nov – Wed 11 Nov". */
export function batchLabel(start: string, days: number): string {
  return `${dayLabel(start)} – ${dayLabel(endDate(start, days))}`;
}

export interface DepartureMonth {
  /** "2026-11" */
  key: string;
  year: number;
  /** 0 = Jan */
  month: number;
  departures: Departure[];
}

/** Batches grouped by the month they start in, earliest first. */
export function groupByMonth(list: Departure[]): DepartureMonth[] {
  const groups: DepartureMonth[] = [];
  for (const d of [...list].sort((a, b) => a.start.localeCompare(b.start))) {
    const key = d.start.slice(0, 7);
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) - 1, departures: [] };
      groups.push(group);
    }
    group.departures.push(d);
  }
  return groups;
}

/** The trek card's badge, from the next three batches that can still be booked. */
export function datesBadge(list: Departure[]): "open" | "filling" | "waitlist" | null {
  if (list.length === 0) return null;
  const next = list.filter(isBookable).slice(0, 3);
  if (next.length === 0) return "waitlist";
  return next.some((d) => seatStatus(d) === "few") ? "filling" : "open";
}

/** Twelve months, Jan–Dec, marking the trek's season and what each month is like. */
export function seasonStrip(bestSeason: string, highlights: Partial<Record<string, string>> = {}) {
  const open = new Set(seasonMonths(bestSeason));
  return MONTHS.map((name, month) => ({ name, month, inSeason: open.has(month), highlight: highlights[name] }));
}
