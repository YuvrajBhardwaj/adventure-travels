const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const iso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);

/**
 * A course's season from its `dates` text, e.g. "Dec 2026 — Mar 2027" or "Jan — Mar 2027":
 * the first day of the first month to the last day of the last month. Null if unreadable.
 */
export function courseSeason(dates: string): { from: string; to: string } | null {
  const months = (dates.match(/[A-Za-z]{3,}/g) ?? [])
    .map((t) => MONTHS.indexOf(t.slice(0, 3).toLowerCase()))
    .filter((i) => i >= 0);
  const years = (dates.match(/20\d{2}/g) ?? []).map(Number);
  if (months.length < 2 || years.length === 0) return null;
  const [m1, m2] = [months[0], months[months.length - 1]];
  const y2 = years[years.length - 1];
  // "Jan — Mar 2027" has one year; a season that wraps past December starts the year before.
  const y1 = years.length > 1 ? years[0] : m1 > m2 ? y2 - 1 : y2;
  return { from: iso(y1, m1, 1), to: iso(y2, m2 + 1, 0) };
}

/**
 * Every day a course can start: inside the season, at least `leadDays` from today, and
 * finishing by the season's last day. Like the treks, a group starts any day of the season.
 */
export function courseStartDates(dates: string, days: number, today: string, leadDays = 3): string[] {
  const season = courseSeason(dates);
  if (!season) return [];
  const t = new Date(`${today}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + leadDays);
  const first = t.toISOString().slice(0, 10) > season.from ? t.toISOString().slice(0, 10) : season.from;
  const last = new Date(`${season.to}T00:00:00Z`);
  last.setUTCDate(last.getUTCDate() - (days - 1));
  const out: string[] = [];
  for (let d = new Date(`${first}T00:00:00Z`); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
