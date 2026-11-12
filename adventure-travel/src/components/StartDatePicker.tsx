"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { batchLabel, dayLabel, endDate } from "@/lib/departures";
import { transition } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * The start-date calendar, as on the trek pages: month chips, a Monday-first month grid
 * and the picked date with its Register button. `dates` are the open start days (ISO);
 * null while they're being worked out after mount (today's date is only known in the browser).
 */
export default function StartDatePicker({
  dates,
  days,
  what,
  onRegister,
}: {
  dates: string[] | null;
  days: number;
  /** "course" or "trek", for the summary line. */
  what: string;
  onRegister: (iso: string) => void;
}) {
  const reduce = useReducedMotion();
  const open = useMemo(() => new Set(dates ?? []), [dates]);
  const months = useMemo(() => [...new Set((dates ?? []).map((d) => d.slice(0, 7)))], [dates]);
  const [pickedMonth, setPickedMonth] = useState<string | null>(null);
  const [pickedDay, setPickedDay] = useState<string | null>(null);

  if (dates === null) {
    return (
      <div aria-busy="true" aria-label="Loading dates">
        <div className="mb-4 flex gap-2 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-11 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {Array.from({ length: 35 }, (_, i) => (
              <Skeleton key={i} className="h-11 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (months.length === 0) return null;

  const month = months.includes(pickedMonth ?? "") ? pickedMonth! : months[0];
  const [y, m] = month.split("-").map(Number);
  const selected = pickedDay && pickedDay.startsWith(month) && open.has(pickedDay) ? pickedDay : dates.find((d) => d.startsWith(month))!;
  const blanks = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cell = "relative flex h-11 items-center justify-center rounded-xl text-sm tabular-nums";

  return (
    <>
      <div className="-mx-1 mb-4 flex snap-x gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Choose a month">
        {months.map((k) => {
          const [ky, km] = k.split("-").map(Number);
          const active = k === month;
          return (
            <button
              key={k}
              type="button"
              onClick={() => {
                setPickedMonth(k);
                setPickedDay(null);
              }}
              aria-pressed={active}
              className={cn(
                "min-h-11 shrink-0 snap-start rounded-full px-4 text-sm font-semibold ring-1 transition-colors duration-150 ease-out",
                active ? "bg-emerald-600 text-white ring-emerald-600" : "bg-white text-slate-700 ring-slate-200 hover:bg-emerald-50 hover:ring-emerald-200"
              )}
            >
              {SHORT[km - 1]} {ky}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <h3 className="mb-3 px-1 text-lg font-bold text-foreground">
          {FULL[m - 1]} {y}
        </h3>
        <motion.div
          key={month}
          initial={reduce ? false : { opacity: 0.4, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition("base")}
          className="grid grid-cols-7 gap-1 sm:gap-1.5"
          role="group"
          aria-label={`${FULL[m - 1]} ${y} start dates`}
        >
          {WEEKDAYS.map((w) => (
            <span key={w} aria-hidden className="pb-1 text-center font-nav text-[11px] font-semibold uppercase tracking-wide text-muted">
              {w}
            </span>
          ))}
          {Array.from({ length: blanks }, (_, i) => (
            <span key={`b${i}`} aria-hidden />
          ))}
          {Array.from({ length: count }, (_, i) => {
            const iso = `${month}-${String(i + 1).padStart(2, "0")}`;
            if (!open.has(iso)) {
              return (
                <span key={iso} aria-hidden className={`${cell} text-slate-300`}>
                  {i + 1}
                </span>
              );
            }
            const isSel = iso === selected;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setPickedDay(iso)}
                aria-pressed={isSel}
                aria-label={`${dayLabel(iso)}, available`}
                className={cn(
                  cell,
                  "font-semibold ring-1 transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
                  isSel ? "bg-emerald-600 text-white ring-emerald-600" : "bg-emerald-50 text-emerald-900 ring-emerald-200 hover:bg-emerald-100"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </motion.div>
      </div>

      <div
        aria-live="polite"
        className="mt-4 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="font-nav text-[11px] font-semibold uppercase tracking-wide text-muted">Your {what} dates</p>
          <p className="mt-0.5 font-semibold text-foreground">
            {batchLabel(selected, days)} {endDate(selected, days).slice(0, 4)}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden />
              Available
            </span>
            <span className="text-muted">· {days} days</span>
          </p>
        </div>
        <Button size="lg" onClick={() => onRegister(selected)} className="w-full shrink-0 sm:w-auto">
          Register for this date
        </Button>
      </div>
    </>
  );
}
