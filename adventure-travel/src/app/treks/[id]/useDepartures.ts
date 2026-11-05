"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mergeDepartures, seasonDates, todayInIndia, type Departure } from "@/lib/departures";
import { DEPARTURE_CALENDAR } from "@/data/trekSeasons";
import type { Trek } from "@/data/treks";

export interface DeparturesState {
  /** "loading" only until the first render after mount (today's date is known only in the browser). */
  status: "loading" | "ready";
  /** Upcoming departures, earliest first: the season's dates merged with the admin's rows. */
  departures: Departure[];
}

type Row = { id: string; start_date: string; capacity: number; seats_left: number; closed: boolean; tag: string | null };

/**
 * The trek's upcoming departures. Dates come from its season calendar (DEPARTURE_CALENDAR),
 * so they show even when Supabase is down; rows from supabase-departures.sql then override
 * single dates (closed, tagged, or filling up). Computed after mount, so the static HTML and
 * the first client render agree (the loading state).
 */
export function useDepartures(trek: Trek): DeparturesState {
  const [state, setState] = useState<DeparturesState>({ status: "loading", departures: [] });

  useEffect(() => {
    const cal = DEPARTURE_CALENDAR[trek.slug];
    const dates = cal ? seasonDates(cal, todayInIndia()) : [];
    const capacity = trek.groupSize ?? 15;
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "ready", departures: mergeDepartures(dates, [], capacity) });

    const supabase = createClient();
    if (!supabase) return;
    (async () => {
      try {
        const { data, error } = await supabase.rpc("trek_departure_availability", { p_slug: trek.slug });
        if (error) throw error;
        const rows = ((data ?? []) as Row[]).map<Departure>((r) => ({
          id: r.id,
          start: r.start_date,
          capacity: r.capacity,
          seatsLeft: r.seats_left,
          closed: r.closed,
          tag: r.tag ?? "",
        }));
        if (live) setState({ status: "ready", departures: mergeDepartures(dates, rows, capacity) });
      } catch {
        // Overrides couldn't load: the season's dates stay as they are.
      }
    })();
    return () => {
      live = false;
    };
  }, [trek.slug, trek.groupSize]);

  return state;
}
