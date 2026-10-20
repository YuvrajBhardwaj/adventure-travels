"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Departure } from "@/lib/departures";

export interface DeparturesState {
  /** "unavailable": Supabase isn't set up or the dates couldn't be loaded. */
  status: "loading" | "ready" | "unavailable";
  /** Upcoming batches, earliest first. */
  departures: Departure[];
}

type Row = { id: string; start_date: string; capacity: number; seats_left: number; closed: boolean; tag: string | null };

/**
 * The trek's upcoming batches with live seats (supabase-departures.sql). Loaded after mount,
 * so the static HTML and the first client render agree (the loading state).
 */
export function useDepartures(slug: string): DeparturesState {
  const [state, setState] = useState<DeparturesState>({
    status: isSupabaseConfigured ? "loading" : "unavailable",
    departures: [],
  });

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    let live = true;
    (async () => {
      try {
        const { data, error } = await supabase.rpc("trek_departure_availability", { p_slug: slug });
        if (error) throw error;
        const departures = ((data ?? []) as Row[]).map<Departure>((r) => ({
          id: r.id,
          start: r.start_date,
          capacity: r.capacity,
          seatsLeft: r.seats_left,
          closed: r.closed,
          tag: r.tag ?? "",
        }));
        if (live) setState({ status: "ready", departures });
      } catch {
        if (live) setState({ status: "unavailable", departures: [] });
      }
    })();
    return () => {
      live = false;
    };
  }, [slug]);

  return state;
}
