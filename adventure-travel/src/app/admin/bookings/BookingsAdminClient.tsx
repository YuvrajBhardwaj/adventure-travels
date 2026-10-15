"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { History, RefreshCw, Search, X } from "lucide-react";
import { AdminGate } from "@/components/admin/AdminGate";
import { LoadError } from "@/components/admin/LoadError";
import {
  FIELD,
  PAYMENT_STATE_LABEL,
  PAYMENT_STATE_TONE,
  STATUS_TONE,
  TYPE_LABEL,
  cap,
  dateTime,
  shortDate,
} from "@/components/admin/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  filterBookings,
  getBookingEvents,
  listBookings,
  recordRefund,
  updateBookingStatus,
  type AdminBooking,
  type BookingEvent,
  type BookingFilters,
  type BookingType,
} from "@/lib/admin";
import type { BookingStatus, PaymentState } from "@/lib/auth";
import { cn, formatPaise } from "@/lib/utils";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled"];
const PAYMENT_STATES: PaymentState[] = ["unpaid", "advance_paid", "fully_paid", "refunded"];

type ServerFilters = Pick<BookingFilters, "type" | "status" | "paymentState" | "from" | "to">;

export default function BookingsAdminClient() {
  return (
    <AdminGate wide title="Bookings" description="Every trek, course and activity booking. Search, filter and change status.">
      <BookingsAdmin />
    </AdminGate>
  );
}

function BookingsAdmin() {
  const [filters, setFilters] = useState<ServerFilters>({});
  const [q, setQ] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [rows, setRows] = useState<AdminBooking[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmRefund, setConfirmRefund] = useState<string | null>(null);
  const [history, setHistory] = useState<AdminBooking | null>(null);
  const deferredQ = useDeferredValue(q);

  const load = useCallback(async (f: ServerFilters) => {
    setStatus("loading");
    try {
      setRows(await listBookings(f));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void load(filters), [load, filters]);

  const visible = useMemo(() => filterBookings(rows, { q: deferredQ, overdueOnly }), [rows, deferredQ, overdueOnly]);
  const overdueCount = useMemo(() => rows.filter((b) => b.overdue).length, [rows]);

  const setFilter = <K extends keyof ServerFilters>(key: K, value: ServerFilters[K] | "") =>
    setFilters((f) => ({ ...f, [key]: value || undefined }));

  const changeStatus = async (b: AdminBooking, next: BookingStatus) => {
    if (next === b.status) return;
    setBusyId(b.id);
    setNotice("");
    try {
      await updateBookingStatus(b.type, b.id, next);
      setRows((prev) => prev.map((r) => (r.id === b.id ? { ...r, status: next } : r)));
      setNotice(`${b.ref} is now ${next}.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Couldn't change that booking.");
    } finally {
      setBusyId(null);
    }
  };

  const refund = async (b: AdminBooking) => {
    if (b.type === "activity") return;
    setBusyId(b.id);
    setNotice("");
    try {
      await recordRefund(b.type, b.id);
      setRows((prev) => prev.map((r) => (r.id === b.id ? { ...r, paymentState: "refunded", overdue: false } : r)));
      setNotice(`Refund recorded for ${b.ref}. Make sure the money is refunded in the Razorpay dashboard too.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Couldn't record that refund.");
    } finally {
      setBusyId(null);
      setConfirmRefund(null);
    }
  };

  return (
    <>
      <Card className="mb-4">
        <CardContent className="space-y-3 pt-5">
          <label className="relative block">
            <span className="sr-only">Search bookings</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, phone, reference or trek"
              className={cn(FIELD, "w-full pl-9")}
            />
          </label>
          <div className="flex flex-wrap items-end gap-2">
            <Select label="Type" value={filters.type ?? ""} onChange={(v) => setFilter("type", v as BookingType)}>
              <option value="">All types</option>
              <option value="trek">Treks</option>
              <option value="course">Courses</option>
              <option value="activity">Activities</option>
            </Select>
            <Select label="Status" value={filters.status ?? ""} onChange={(v) => setFilter("status", v as BookingStatus)}>
              <option value="">Any status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{cap(s)}</option>
              ))}
            </Select>
            <Select label="Payment" value={filters.paymentState ?? ""} onChange={(v) => setFilter("paymentState", v as PaymentState)}>
              <option value="">Any payment</option>
              {PAYMENT_STATES.map((s) => (
                <option key={s} value={s}>{PAYMENT_STATE_LABEL[s]}</option>
              ))}
            </Select>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Starts from
              <input type="date" value={filters.from ?? ""} onChange={(e) => setFilter("from", e.target.value)} className={cn(FIELD, "mt-1 block")} />
            </label>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              to
              <input type="date" value={filters.to ?? ""} onChange={(e) => setFilter("to", e.target.value)} className={cn(FIELD, "mt-1 block")} />
            </label>
            <label className="flex h-10 items-center gap-2 rounded-xl px-2 text-sm font-medium">
              <input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
              Overdue only{overdueCount > 0 && <Badge tone="red">{overdueCount}</Badge>}
            </label>
            <Button variant="outline" size="sm" className="ml-auto h-10" onClick={() => void load(filters)} disabled={status === "loading"}>
              <RefreshCw className={cn("h-4 w-4", status === "loading" && "animate-spin motion-reduce:animate-none")} aria-hidden />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {notice && (
        <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
          {notice}
        </p>
      )}

      <Card>
        <CardContent className="p-0">
          {status === "loading" && rows.length === 0 ? (
            <div className="space-y-3 p-5" aria-busy aria-label="Loading bookings">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : status === "error" ? (
            <LoadError onRetry={() => void load(filters)} />
          ) : visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">No bookings match.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Ref</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Booking</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Starts</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Group</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Amount</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Paid</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Payment</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {visible.map((b) => {
                    const refundable = b.type !== "activity" && (b.paymentState === "advance_paid" || b.paymentState === "fully_paid");
                    return (
                      <tr key={`${b.type}-${b.id}`} className={cn("align-top", b.overdue && "bg-red-50/60 dark:bg-red-400/5")}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold">{b.ref}</span>
                          <span className="mt-1 block"><Badge tone="slate">{TYPE_LABEL[b.type]}</Badge></span>
                        </td>
                        <td className="max-w-[200px] px-4 py-3">
                          <span className="block truncate font-semibold">{b.customer.name || (b.userId ? "—" : "Deleted user")}</span>
                          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{b.customer.email}</span>
                          {b.customer.phone && (
                            <a href={`tel:${b.customer.phone}`} className="block text-xs text-slate-500 hover:underline dark:text-slate-400">
                              {b.customer.phone}
                            </a>
                          )}
                        </td>
                        <td className="max-w-[220px] px-4 py-3">
                          <span className="block truncate font-medium">{b.item}</span>
                          {b.option && <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{b.option}</span>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">{shortDate(b.startDate)}</td>
                        <td className="px-4 py-3">{b.groupSize}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          {b.amount !== null ? formatPaise(b.amount) : b.quoteRequired ? <Badge tone="amber">Quote</Badge> : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">{b.type === "activity" ? "—" : formatPaise(b.amountPaid)}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {b.paymentState ? <Badge tone={PAYMENT_STATE_TONE[b.paymentState]}>{PAYMENT_STATE_LABEL[b.paymentState]}</Badge> : "—"}
                          {b.overdue && (
                            <span className="mt-1 block">
                              <Badge tone="red">Overdue since {shortDate(b.balanceDueDate)}</Badge>
                            </span>
                          )}
                          {!b.overdue && b.paymentState === "advance_paid" && b.balanceDueDate && (
                            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Balance due {shortDate(b.balanceDueDate)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <label className="sr-only" htmlFor={`status-${b.id}`}>Status for {b.ref}</label>
                          <select
                            id={`status-${b.id}`}
                            value={b.status}
                            disabled={busyId === b.id}
                            onChange={(e) => void changeStatus(b, e.target.value as BookingStatus)}
                            className={cn(FIELD, "h-9 pr-8 font-medium")}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{cap(s)}</option>
                            ))}
                          </select>
                          <span className="mt-1 block"><Badge tone={STATUS_TONE[b.status]}>{cap(b.status)}</Badge></span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <Button variant="ghost" size="sm" onClick={() => setHistory(b)}>
                              <History className="h-4 w-4" aria-hidden />
                              History
                            </Button>
                            {refundable &&
                              (confirmRefund === b.id ? (
                                <span className="flex items-center gap-1">
                                  <Button size="sm" className="bg-red-600 hover:bg-red-700" disabled={busyId === b.id} onClick={() => void refund(b)}>
                                    Confirm refund
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setConfirmRefund(null)}>Keep</Button>
                                </span>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => setConfirmRefund(b.id)}>
                                  Record refund
                                </Button>
                              ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Showing {visible.length} of {rows.length} loaded bookings. Overdue means an advance was paid and the balance due date has passed (India time); nothing changes automatically.
      </p>

      <HistoryDrawer booking={history} onClose={() => setHistory(null)} />
    </>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(FIELD, "mt-1 block pr-8")}>
        {children}
      </select>
    </label>
  );
}

function describeEvent(e: BookingEvent) {
  const parts: string[] = [];
  if (e.fromStatus !== e.toStatus) parts.push(`Status ${e.fromStatus ?? "—"} → ${e.toStatus ?? "—"}`);
  if (e.fromPaymentState !== e.toPaymentState) {
    const label = (s: string | null) => (s ? PAYMENT_STATE_LABEL[s as PaymentState] ?? s : "—");
    parts.push(`Payment ${label(e.fromPaymentState)} → ${label(e.toPaymentState)}`);
  }
  return parts.join(" · ") || "Updated";
}

function HistoryDrawer({ booking, onClose }: { booking: AdminBooking | null; onClose: () => void }) {
  const reduceMotion = useReducedMotion();
  const [events, setEvents] = useState<BookingEvent[] | null>(null);
  const [error, setError] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!booking) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEvents(null);
    setError(false);
    getBookingEvents(booking.type, booking.id)
      .then((rows) => !cancelled && setEvents(rows))
      .catch(() => !cancelled && setError(true));
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKey);
    };
  }, [booking, onClose]);

  return (
    <AnimatePresence>
      {booking && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-[110] bg-slate-950/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`History for booking ${booking.ref}`}
            className="fixed inset-y-0 right-0 z-[111] flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900"
            initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", damping: 32, stiffness: 320 }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/10">
              <div>
                <p className="font-mono text-xs font-semibold text-slate-500">{booking.ref}</p>
                <h2 className="font-heading text-lg font-bold">{booking.item}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {booking.customer.name || "—"} · starts {shortDate(booking.startDate)}
                </p>
              </div>
              <Button ref={closeRef} variant="ghost" size="icon" onClick={onClose} aria-label="Close history">
                <X className="h-5 w-5" aria-hidden />
              </Button>
            </header>
            <div className="flex-1 overflow-y-auto p-5">
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Booked {dateTime(booking.createdAt)}</p>
              {booking.message && (
                <p className="mb-4 rounded-xl bg-slate-100 p-3 text-sm dark:bg-white/5">“{booking.message}”</p>
              )}
              {error ? (
                <p role="alert" className="text-sm text-red-600 dark:text-red-300">Couldn&apos;t load the history.</p>
              ) : events === null ? (
                <div className="space-y-3" aria-busy aria-label="Loading history">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : events.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No changes since it was booked.</p>
              ) : (
                <ol className="space-y-4">
                  {events.map((e) => (
                    <li key={e.id} className="border-l-2 border-emerald-500/40 pl-4">
                      <p className="text-sm font-semibold">{describeEvent(e)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {dateTime(e.createdAt)} · {e.changedBy ? e.changedByName || "A signed-in user" : "System"}
                        {e.note ? ` · ${e.note}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
