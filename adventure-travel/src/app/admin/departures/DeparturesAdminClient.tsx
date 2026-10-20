"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarPlus, RefreshCw, Trash2 } from "lucide-react";
import { AdminGate } from "@/components/admin/AdminGate";
import { LoadError } from "@/components/admin/LoadError";
import { FIELD } from "@/components/admin/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { byPopularity, type Trek } from "@/data/treks";
import {
  addDepartures,
  countDepartures,
  deleteDeparture,
  listDepartures,
  updateDeparture,
  type AdminDeparture,
  type DepartureChange,
} from "@/lib/admin";
import { batchLabel, dayLabel, seatLabel, seatStatus, weeklyDates, type SeatStatus } from "@/lib/departures";
import { istToday } from "@/lib/paymentRules";
import { seasonMonths } from "@/lib/season";
import { cn } from "@/lib/utils";

const TREKS = byPopularity();
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SEAT_TONE: Record<SeatStatus, "emerald" | "amber" | "slate" | "red"> = {
  available: "emerald",
  few: "amber",
  full: "slate",
  closed: "red",
};
const defaultCapacity = (trek: Trek) => trek.groupSize ?? 12;

export default function DeparturesAdminClient() {
  return (
    <AdminGate wide title="Departures" description="Each trek's batch dates and seats. Visitors see them on the trek's Dates tab.">
      <DeparturesAdmin />
    </AdminGate>
  );
}

function DeparturesAdmin() {
  const [slug, setSlug] = useState(TREKS[0].slug);
  const trek = TREKS.find((t) => t.slug === slug) ?? TREKS[0];
  const [rows, setRows] = useState<AdminDeparture[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async (s: string) => {
    setStatus("loading");
    try {
      const [list, perTrek] = await Promise.all([listDepartures(s), countDepartures()]);
      setRows(list);
      setCounts(perTrek);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void load(slug), [load, slug]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Trek
            <select
              value={slug}
              onChange={(e) => {
                setRows([]);
                setSlug(e.target.value);
              }}
              className={cn(FIELD, "mt-1 block w-full min-w-[260px] pr-8")}
            >
              {TREKS.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name} ({counts[t.slug] ?? 0} upcoming)
                </option>
              ))}
            </select>
          </label>
          <p className="pb-2 text-sm text-slate-600 dark:text-slate-300">
            Best season <strong>{trek.bestSeason}</strong> · {trek.days} days · groups of {defaultCapacity(trek)}
          </p>
          <Button variant="outline" size="sm" className="ml-auto h-10" onClick={() => void load(slug)} disabled={status === "loading"}>
            <RefreshCw className={cn("h-4 w-4", status === "loading" && "animate-spin motion-reduce:animate-none")} aria-hidden />
            Refresh
          </Button>
        </CardContent>
      </Card>

      <AddBatches key={trek.slug} trek={trek} existing={rows} onAdded={() => void load(slug)} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming batches</CardTitle>
          <CardDescription>
            Changes save when you leave a field. Seats left = capacity − sold offline − website bookings that are confirmed or paid.
            Unpaid requests don&apos;t hold a seat; the payment step checks the seats again. A closed batch stays listed but can&apos;t be booked.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {status === "loading" && rows.length === 0 ? (
            <div className="space-y-3 p-5" aria-busy="true" aria-label="Loading batches">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : status === "error" ? (
            <LoadError onRetry={() => void load(slug)} />
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              No upcoming batches for {trek.name}. Visitors see &ldquo;Ask for dates on WhatsApp&rdquo; until you add some.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Batch</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Capacity</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Sold offline</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Website</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Visitors see</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Label</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Closed</th>
                    <th scope="col" className="px-4 py-3"><span className="sr-only">Delete</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {rows.map((d) => (
                    <BatchRow key={d.id} d={d} days={trek.days} onChanged={() => void load(slug)} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddBatches({ trek, existing, onAdded }: { trek: Trek; existing: AdminDeparture[]; onAdded: () => void }) {
  const [mode, setMode] = useState<"series" | "one">("series");
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [weekday, setWeekday] = useState(6);
  const [every, setEvery] = useState(1);
  const [capacity, setCapacity] = useState(String(defaultCapacity(trek)));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const today = istToday();
  const picked = mode === "one" ? (date ? [date] : []) : from && to && from <= to ? weeklyDates(from, to, weekday, every) : [];
  const have = new Set(existing.map((r) => r.startDate));
  const fresh = picked.filter((d) => d > today && !have.has(d));
  const skipped = picked.length - fresh.length;
  const season = new Set(seasonMonths(trek.bestSeason));
  const offSeason = fresh.filter((d) => !season.has(Number(d.slice(5, 7)) - 1)).length;
  const seats = Number(capacity);
  const seatsOk = Number.isInteger(seats) && seats >= 1 && seats <= 100;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fresh.length === 0 || !seatsOk) return;
    setBusy(true);
    setResult(null);
    try {
      const added = await addDepartures(trek.slug, fresh, seats);
      setResult({ ok: true, text: `Added ${added} ${added === 1 ? "batch" : "batches"} to ${trek.name}.` });
      onAdded();
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : "Couldn't add the batches." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarPlus className="h-4 w-4 text-emerald-600" aria-hidden />
          Add batches
        </CardTitle>
        <CardDescription>Pick a start date, or a weekly series. Dates already listed and past dates are skipped.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="inline-flex rounded-xl border border-slate-200 p-1 dark:border-white/10" role="group" aria-label="How to add">
            {(["series", "one"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors motion-reduce:transition-none",
                  mode === m ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                )}
              >
                {m === "series" ? "Weekly series" : "One date"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {mode === "one" ? (
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Start date
                <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} className={cn(FIELD, "mt-1 block")} />
              </label>
            ) : (
              <>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Every
                  <select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} className={cn(FIELD, "mt-1 block pr-8")}>
                    {WEEKDAYS.map((w, i) => <option key={w} value={i}>{w}</option>)}
                  </select>
                </label>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Repeat
                  <select value={every} onChange={(e) => setEvery(Number(e.target.value))} className={cn(FIELD, "mt-1 block pr-8")}>
                    <option value={1}>Every week</option>
                    <option value={2}>Every 2 weeks</option>
                    <option value={4}>Every 4 weeks</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  From
                  <input type="date" value={from} min={today} onChange={(e) => setFrom(e.target.value)} className={cn(FIELD, "mt-1 block")} />
                </label>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  To
                  <input type="date" value={to} min={from || today} onChange={(e) => setTo(e.target.value)} className={cn(FIELD, "mt-1 block")} />
                </label>
              </>
            )}
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Seats per batch
              <input
                type="number"
                min={1}
                max={100}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                aria-invalid={!seatsOk}
                className={cn(FIELD, "mt-1 block w-28")}
              />
            </label>
            <Button type="submit" className="h-10" loading={busy} disabled={fresh.length === 0 || !seatsOk}>
              Add {fresh.length || ""} {fresh.length === 1 ? "batch" : "batches"}
            </Button>
          </div>

          {picked.length > 0 && (
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {fresh.length > 0 && (
                <p>
                  {fresh.slice(0, 6).map(dayLabel).join(", ")}
                  {fresh.length > 6 && ` and ${fresh.length - 6} more`}
                </p>
              )}
              {skipped > 0 && <p className="text-slate-500 dark:text-slate-400">{skipped} skipped: already listed or not in the future.</p>}
              {offSeason > 0 && (
                <p className="font-medium text-amber-700 dark:text-amber-300">
                  {offSeason} of these {offSeason === 1 ? "is" : "are"} outside the best season ({trek.bestSeason}).
                </p>
              )}
            </div>
          )}
          {result && (
            <p role="status" className={cn("text-sm font-medium", result.ok ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400")}>
              {result.text}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function BatchRow({ d, days, onChanged }: { d: AdminDeparture; days: number; onChanged: () => void }) {
  const [capacity, setCapacity] = useState(String(d.capacity));
  const [offline, setOffline] = useState(String(d.offlineSeats));
  const [tag, setTag] = useState(d.tag);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const label = batchLabel(d.startDate, days);

  const save = async (change: DepartureChange) => {
    setState("saving");
    try {
      await updateDeparture(d.id, change);
      setState("saved");
      onChanged();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Couldn't save.");
    }
  };

  // Saves a seat count when it changed and is a whole number in range; otherwise puts it back.
  const saveSeats = (raw: string, current: number, min: number, key: "capacity" | "offlineSeats", reset: (v: string) => void) => {
    const n = Number(raw);
    if (n === current) return;
    if (!Number.isInteger(n) || n < min || n > 100) {
      reset(String(current));
      setState("error");
      setError(`Enter a whole number from ${min} to 100.`);
      return;
    }
    void save({ [key]: n });
  };

  const remove = async () => {
    const booked = d.onlineSeats > 0 ? ` ${d.onlineSeats} website seats are booked on it; those bookings keep their date.` : "";
    if (!window.confirm(`Delete the ${label} batch?${booked}`)) return;
    try {
      await deleteDeparture(d.id);
      onChanged();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Couldn't delete.");
    }
  };

  const cell = "px-4 py-2.5";
  return (
    <tr className="align-middle">
      <td className={cn(cell, "whitespace-nowrap font-medium")}>
        {label} <span className="text-slate-400">{d.startDate.slice(0, 4)}</span>
        {state !== "idle" && (
          <span
            role="status"
            className={cn("mt-0.5 block text-xs font-normal", state === "error" ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400")}
          >
            {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : error}
          </span>
        )}
      </td>
      <td className={cell}>
        <input
          type="number"
          min={1}
          max={100}
          value={capacity}
          aria-label={`Capacity, ${label}`}
          onChange={(e) => setCapacity(e.target.value)}
          onBlur={() => saveSeats(capacity, d.capacity, 1, "capacity", setCapacity)}
          className={cn(FIELD, "h-9 w-20")}
        />
      </td>
      <td className={cell}>
        <input
          type="number"
          min={0}
          max={100}
          value={offline}
          aria-label={`Seats sold offline, ${label}`}
          onChange={(e) => setOffline(e.target.value)}
          onBlur={() => saveSeats(offline, d.offlineSeats, 0, "offlineSeats", setOffline)}
          className={cn(FIELD, "h-9 w-20")}
        />
      </td>
      <td className={cn(cell, "tabular-nums")}>{d.onlineSeats}</td>
      <td className={cell}>
        <Badge tone={SEAT_TONE[seatStatus(d)]}>{seatLabel(d)}</Badge>
      </td>
      <td className={cell}>
        <input
          type="text"
          maxLength={30}
          value={tag}
          placeholder="e.g. Stargazing"
          aria-label={`Label, ${label}`}
          onChange={(e) => setTag(e.target.value)}
          onBlur={() => tag.trim() !== d.tag && void save({ tag })}
          className={cn(FIELD, "h-9 w-36")}
        />
      </td>
      <td className={cell}>
        <input
          type="checkbox"
          checked={d.closed}
          aria-label={`Closed, ${label}`}
          onChange={(e) => void save({ closed: e.target.checked })}
          className="h-4 w-4 accent-emerald-600"
        />
      </td>
      <td className={cn(cell, "text-right")}>
        <Button variant="ghost" size="icon" onClick={() => void remove()} aria-label={`Delete ${label}`}>
          <Trash2 className="h-4 w-4 text-red-600" aria-hidden />
        </Button>
      </td>
    </tr>
  );
}
