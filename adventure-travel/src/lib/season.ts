export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthIndex = (word: string) => MONTHS.findIndex((m) => word.toLowerCase().startsWith(m.toLowerCase()));

/**
 * Month numbers (0 = Jan) a trek's `bestSeason` text covers, e.g. "May–Jun & Sept–Oct",
 * "Dec-March (Snow Trek)", "Sep–Jun" (wraps past December), "Mid-May to October".
 * Notes in brackets ("snow Dec–Mar") are ignored: they describe part of the season.
 */
export function seasonMonths(bestSeason: string): number[] {
  const text = bestSeason.replace(/\(.*?\)/g, "").replace(/\b(mid|early|late)[-\s]+/gi, "");
  const months = new Set<number>();
  for (const [, from, to] of text.matchAll(/([A-Za-z]{3,})\s*(?:–|—|-|to)\s*([A-Za-z]{3,})/g)) {
    const a = monthIndex(from);
    const b = monthIndex(to);
    if (a < 0 || b < 0) continue;
    for (let i = a; ; i = (i + 1) % 12) {
      months.add(i);
      if (i === b) break;
    }
  }
  return [...months].sort((x, y) => x - y);
}
