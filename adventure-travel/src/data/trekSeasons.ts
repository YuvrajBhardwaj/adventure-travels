import type { MonthName } from "@/lib/season";

/**
 * What each in-season month is like on a trek, shown next to the month on the Dates tab
 * ("November 2026 · Clearest views") and in its "When to go" strip. Every month that the
 * trek's `bestSeason` covers has a line, and no other month does (unit-tested).
 *
 * Sources checked 21 Oct 2026: Indiahikes and Trek The Himalayas season guides, Outlook
 * Traveller (Valley of Flowers open 1 Jun–31 Oct, blooms peak mid-Jul to mid-Aug),
 * Supreme Court ruling of 20 Jul 2026 reopening camping on the Roopkund bugyals.
 */
export const MONTH_HIGHLIGHTS: Record<string, Partial<Record<MonthName, string>>> = {
  "valley-of-flowers": { Jul: "Peak bloom", Aug: "Peak bloom", Sep: "Quieter trails" },
  kedarkantha: { Dec: "First snow", Jan: "Deep snow", Feb: "Deepest snow", Mar: "Snow & sunshine", Apr: "Spring thaw" },
  brahmatal: { Dec: "First snow", Jan: "Frozen lake", Feb: "Deepest snow", Mar: "Snow & sunshine" },
  roopkund: { May: "Snow at the lake", Jun: "Green bugyals", Sep: "Post-monsoon greens", Oct: "Clearest views" },
  "har-ki-dun": {
    Mar: "Late snow", Apr: "Spring blooms", May: "Long clear days", Jun: "Green meadows",
    Sep: "Post-monsoon greens", Oct: "Autumn colours", Nov: "Crisp, clear skies", Dec: "First snow",
  },
  "pangarchula-peak": {
    Mar: "Firm summit snow", Apr: "Best summit window", May: "Snow & long days", Oct: "Clearest views", Nov: "Crisp, clear skies",
  },
  "kuari-pass": {
    Sep: "Post-monsoon greens", Oct: "Autumn colours", Nov: "Clearest views", Dec: "First snow", Jan: "Snow trek",
    Feb: "Deepest snow", Mar: "Snow & sunshine", Apr: "Rhododendrons", May: "Rhododendrons", Jun: "Long green days",
  },
  "hampta-pass": { Jun: "Snow on the pass", Jul: "Green Kullu valley", Aug: "Wildflowers", Sep: "Clear skies" },
  "satopanth-lake": { May: "Snow at the lake", Jun: "Long clear days", Sep: "Clear skies return", Oct: "Clearest views" },
  "nandi-kund": { May: "Snow on the pass", Jun: "Alpine meadows", Sep: "Post-monsoon greens", Oct: "Clearest views" },
  "kalindi-khal": { Jun: "Best pass window", Jul: "Monsoon meadows", Sep: "Clear skies", Oct: "Cold, clear views" },
  "gupt-khal": { May: "Snow on the col", Jun: "Stable snow", Sep: "Clear skies", Oct: "Clearest views" },
  "panpatia-col": { May: "Snow on the col", Jun: "Stable snow", Sep: "Clear skies", Oct: "Clearest views" },
  "dronagiri-base-camp": { May: "Snow-capped meadows", Jun: "Green meadows", Sep: "Post-monsoon greens", Oct: "Clearest views" },
  "nanda-devi-base-camp": { May: "Snow-capped peaks", Jun: "Green meadows", Sep: "Post-monsoon greens", Oct: "Clearest views" },
  "mana-pass": { Jun: "Snow on the pass", Jul: "Rain-shadow skies", Sep: "Clear skies", Oct: "Clearest views" },
  "niti-pass": { Jun: "Snow on the pass", Jul: "Rain-shadow skies", Sep: "Clear skies", Oct: "Clearest views" },
  rimkhim: { Jun: "Snow on the pass", Jul: "Rain-shadow skies", Sep: "Clear skies", Oct: "Clearest views" },
  "bhrigu-lake": {
    May: "Snow at the lake", Jun: "Green meadows", Jul: "Monsoon greens", Aug: "Monsoon greens", Sep: "Clear skies", Oct: "Autumn colours",
  },
  tungnath: {
    Sep: "Post-monsoon greens", Oct: "Clearest views", Nov: "Crisp, clear skies", Dec: "First snow", Jan: "Snow trek",
    Feb: "Deepest snow", Mar: "Rhododendrons", Apr: "Rhododendrons", May: "Long clear days", Jun: "Green meadows",
  },
  madhyamaheshwar: { May: "Long clear days", Jun: "Green meadows", Sep: "Post-monsoon greens", Oct: "Clearest views", Nov: "Crisp, clear skies" },
};
