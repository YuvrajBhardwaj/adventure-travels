"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { History, Inbox, RefreshCw, Search, X } from "lucide-react";
import { AdminGate } from "@/components/admin/AdminGate";
import { LoadError } from "@/components/admin/LoadError";
import {
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
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
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
            <Input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, phone, reference or trek"
              className="pl-9"
            />
          </label>
          <div className="flex flex-wrap items-end gap-2">
            <FilterSelect label="Type" value={filters.type ?? ""} onChange={(v) => setFilter("type", v as BookingType)}>
              <option value="">All types</option>
              <option value="trek">Treks</option>
              <option value="course">Courses</option>
              <option value="activity">Activities</option>
            </FilterSelect>
            <FilterSelect label="Status" value={filters.status ?? ""} onChange={(v) => setFilter("status", v as BookingStatus)}>
              <option value="">Any status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{cap(s)}</option>
              ))}
            </FilterSelect>
            <FilterSelect label="Payment" value={filters.paymentState ?? ""} onChange={(v) => setFilter("paymentState", v as PaymentState)}>
              <option value="">Any payment</option>
              {PAYMENT_STATES.map((s) => (
                <option key={s} value={s}>{PAYMENT_STATE_LABEL[s]}</option>
              ))}
            </FilterSelect>
            <label className={FILTER_LABEL}>
              Starts from
              <Input type="date" value={filters.from ?? ""} onChange={(e) => setFilter("from", e.target.value)} className="mt-1" />
            </label>
            <label className={FILTER_LABEL}>
              to
              <Input type="date" value={filters.to ?? ""} onChange={(e) => setFilter("to", e.target.value)} className="mt-1" />
            </label>
            <Checkbox
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="mt-0"
              labelClassName="items-center px-2 font-medium text-slate-900 dark:text-slate-100 [&>span]:inline-flex [&>span]:items-center [&>span]:gap-2"
              label={<>Overdue only{overdueCount > 0 && <Badge tone="red">{overdueCount}</Badge>}</>}
            />
            <Button variant="outline" className="ml-auto" onClick={() => void load(filters)} loading={status === "loading"}>
              {status !== "loading" && <RefreshCw className="h-4 w-4" aria-hidden />}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {notice && (
        <p role="status" className="mb-4 rounded-2xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
          {notice}
        </p>
      )}

      <Card>
        <CardContent className="p-0">
          {status === "loading" && rows.length === 0 ? (
            <TableSkeleton label="Loading bookings" />
          ) : status === "error" ? (
            <LoadError onRetry={() => void load(filters)} />
          ) : visible.length === 0 ? (
            <EmptyState className="py-12" icon={<Inbox />} title="No bookings match." />
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
                          <Select
                            id={`status-${b.id}`}
                            value={b.status}
                            disabled={busyId === b.id}
                            onChange={(e) => void changeStatus(b, e.target.value as BookingStatus)}
                            wrapperClassName="min-w-[8.5rem]"
                            className="h-9 font-medium"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{cap(s)}</option>
                            ))}
                          </Select>
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
                                  <Button variant="destructive" size="sm" loading={busyId === b.id} onClick={() => void refund(b)}>
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

const FILTER_LABEL = "min-w-[9.5rem] text-xs font-medium text-slate-500 dark:text-slate-400";

function FilterSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className={FILTER_LABEL}>
      {label}
      <Select value={value} onChange={(e) => onChange(e.target.value)} wrapperClassName="mt-1">
        {children}
      </Select>
    </label>
  );
}

/** Placeholder rows shaped like the table: reference + type, customer, booking, date, amounts, badges. */
function TableSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" className="overflow-hidden">
      <span className="sr-only">{label}</span>
      <div className="flex gap-6 border-b border-slate-200 px-4 py-3.5 dark:border-white/10">
        {[10, 24, 24, 12, 10, 14].map((w, i) => (
          <Skeleton key={i} className="h-3" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-6 px-4 py-3">
            <div className="w-[10%] space-y-2">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-5 w-3/4 rounded-full" />
            </div>
            <div className="w-[24%] space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <div className="w-[24%] space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-[12%]" />
            <Skeleton className="h-4 w-[10%]" />
            <Skeleton className="h-5 w-[14%] rounded-full" />
          </div>
        ))}
      </div>
    </div>
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
  const [events, setEvents] = useState<BookingEvent[] | null>(null);
  const [error, setError] = useState(false);
  // Keep the last booking on screen while the sheet slides out.
  const [shown, setShown] = useState<AdminBooking | null>(booking);
  if (booking && booking !== shown) setShown(booking);

  useEffect(() => {
    if (!booking) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEvents(null);
    setError(false);
    getBookingEvents(booking.type, booking.id)
      .then((rows) => !cancelled && setEvents(rows))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [booking]);

  // Radix handles focus (moves in, returns to the History button), Escape, scrim click and scroll lock.
  return (
    <Sheet open={booking !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        title={shown ? `History for booking ${shown.ref}` : "Booking history"}
        hideTitle
        hideClose
        className="w-[min(100vw,448px)]"
      >
        {shown && (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/10">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">{shown.ref}</p>
                <h2 className="font-heading text-lg font-semibold">{shown.item}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {shown.customer.name || "—"} · starts {shortDate(shown.startDate)}
                </p>
              </div>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close history" className="shrink-0">
                  <X className="h-5 w-5" aria-hidden />
                </Button>
              </SheetClose>
            </header>
            <div className="flex-1 p-5">
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Booked {dateTime(shown.createdAt)}</p>
              {shown.message && (
                <p className="mb-4 rounded-2xl bg-slate-100 p-3 text-sm dark:bg-white/5">“{shown.message}”</p>
              )}
              {error ? (
                <p role="alert" className="text-sm text-red-600 dark:text-red-300">Couldn&apos;t load the history.</p>
              ) : events === null ? (
                <div className="space-y-4" aria-busy="true">
                  <span className="sr-only">Loading history</span>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2 border-l-2 border-slate-200 pl-4 dark:border-white/10">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
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
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
