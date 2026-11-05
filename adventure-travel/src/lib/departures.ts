import { MONTHS, seasonMonths } from "./season";
import type { DepartureCalendar } from "@/data/trekSeasons";

/**
 * The departure calendar as the trek page shows it. Dates are generated from the trek's
 * season (src/data/trekSeasons.ts `DEPARTURE_CALENDAR`); rows in Supabase
 * (supabase-departures.sql) override a date: closed, tagged or with a real seat cap.
 * These helpers are pure so they're unit-tested.
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
      return "Filling fast";
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

const addDays = (iso: string, days: number) => new Date(utc(iso).getTime() + days * DAY_MS).toISOString().slice(0, 10);

/** Is "MM-DD" inside a window? A window like ["09-15", "06-30"] wraps past December. */
const inWindow = (md: string, [from, to]: [string, string]) => (from <= to ? md >= from && md <= to : md >= from || md <= to);

/**
 * Start dates from `today + leadDays` up to `horizonDays` ahead: every day inside the
 * season windows, or every Saturday for a weekly trek.
 */
export function seasonDates(cal: DepartureCalendar, today: string, horizonDays = 365): string[] {
  const lead = cal.leadDays ?? (cal.cadence === "daily" ? 3 : 21);
  const out: string[] = [];
  for (let i = lead; i <= horizonDays; i++) {
    const iso = addDays(today, i);
    if (cal.cadence === "weekly" && utc(iso).getUTCDay() !== 6) continue;
    if (cal.windows.some((w) => inWindow(iso.slice(5), w))) out.push(iso);
  }
  return out;
}

/**
 * One open departure per generated date; an admin row on the same date replaces it, and
 * admin rows on other dates (special departures) are kept. Earliest first.
 */
export function mergeDepartures(dates: string[], rows: Departure[], capacity: number): Departure[] {
  const byDate = new Map(rows.map((r) => [r.start, r]));
  const list = dates.map<Departure>(
    (start) => byDate.get(start) ?? { id: `gen-${start}`, start, capacity, seatsLeft: capacity, closed: false, tag: "" },
  );
  const generated = new Set(dates);
  for (const r of rows) if (!generated.has(r.start)) list.push(r);
  return list.sort((a, b) => a.start.localeCompare(b.start));
}

/** "Starts every day" / "Starts every Saturday". */
export const cadenceLabel = (cal: DepartureCalendar) => (cal.cadence === "daily" ? "Starts every day" : "Starts every Saturday");

const mdLabel = (md: string) => `${Number(md.slice(3))} ${MONTHS[Number(md.slice(0, 2)) - 1]}`;

/** "15 Sep – 30 Jun" or "1 Jun – 30 Jun & 1 Sep – 30 Sep". */
export const windowsLabel = (cal: DepartureCalendar) => cal.windows.map(([a, b]) => `${mdLabel(a)} – ${mdLabel(b)}`).join(" & ");

/** Today in India, YYYY-MM-DD (the team's calendar, whatever the visitor's time zone). */
export const todayInIndia = (now = new Date()) => new Date(now.getTime() + 330 * 60_000).toISOString().slice(0, 10);

/** Is this date inside the trek's season windows (any weekday)? */
export const inSeason = (cal: DepartureCalendar, iso: string) => cal.windows.some((w) => inWindow(iso.slice(5), w));
