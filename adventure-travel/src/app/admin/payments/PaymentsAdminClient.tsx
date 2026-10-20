"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { MailWarning, ReceiptText, RefreshCw, Search } from "lucide-react";
import { AdminGate } from "@/components/admin/AdminGate";
import { LoadError } from "@/components/admin/LoadError";
import { KIND_LABEL, PAYMENT_STATUS_TONE, cap, dateTime } from "@/components/admin/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listFailedNotifications,
  listPayments,
  type AdminPayment,
  type FailedNotification,
  type PaymentFilters,
  type PaymentKind,
} from "@/lib/admin";
import { formatPaise } from "@/lib/utils";

export default function PaymentsAdminClient() {
  return (
    <AdminGate wide title="Payments" description="Every payment attempt, and any emails that failed to send.">
      <PaymentsAdmin />
    </AdminGate>
  );
}

function PaymentsAdmin() {
  const [filters, setFilters] = useState<Omit<PaymentFilters, "q">>({});
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);
  const [rows, setRows] = useState<AdminPayment[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async (f: Omit<PaymentFilters, "q">) => {
    setStatus("loading");
    try {
      setRows(await listPayments(f));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void load(filters), [load, filters]);

  const visible = useMemo(() => {
    const needle = deferredQ.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (p) =>
        p.customer.toLowerCase().includes(needle) ||
        p.item.toLowerCase().includes(needle) ||
        p.orderId.toLowerCase().includes(needle) ||
        (p.paymentId ?? "").toLowerCase().includes(needle) ||
        p.bookingRef.toLowerCase().startsWith(needle)
    );
  }, [rows, deferredQ]);

  const collected = useMemo(() => visible.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0), [visible]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-end gap-2 pt-5">
          <label className="relative block min-w-[240px] flex-1">
            <span className="sr-only">Search payments</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Customer, trek, reference or Razorpay id"
              className="pl-9"
            />
          </label>
          <label className={FILTER_LABEL}>
            Status
            <Select
              value={filters.status ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || undefined) as AdminPayment["status"] | undefined }))}
              wrapperClassName="mt-1"
            >
              <option value="">Any status</option>
              <option value="paid">Paid</option>
              <option value="created">Started, not paid</option>
              <option value="failed">Failed</option>
            </Select>
          </label>
          <label className={FILTER_LABEL}>
            Kind
            <Select
              value={filters.kind ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, kind: (e.target.value || undefined) as PaymentKind | undefined }))}
              wrapperClassName="mt-1"
            >
              <option value="">Any kind</option>
              <option value="advance">Advance</option>
              <option value="balance">Balance</option>
              <option value="full">Full</option>
            </Select>
          </label>
          <Button variant="outline" className="ml-auto" onClick={() => void load(filters)} loading={status === "loading"}>
            {status !== "loading" && <RefreshCw className="h-4 w-4" aria-hidden />}
            Refresh
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {status === "loading" && rows.length === 0 ? (
            <PaymentsSkeleton />
          ) : status === "error" ? (
            <LoadError onRetry={() => void load(filters)} />
          ) : visible.length === 0 ? (
            <EmptyState className="py-12" icon={<ReceiptText />} title="No payments match." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Booking</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Kind</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Amount</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Method</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {visible.map((p) => (
                    <tr key={p.id} className="align-top">
                      <td className="whitespace-nowrap px-4 py-3">{dateTime(p.paidAt ?? p.createdAt)}</td>
                      <td className="max-w-[180px] truncate px-4 py-3 font-medium">{p.customer}</td>
                      <td className="max-w-[240px] px-4 py-3">
                        <span className="block truncate">{p.item}</span>
                        <span className="block font-mono text-xs text-slate-500 dark:text-slate-400">{p.bookingRef}</span>
                      </td>
                      <td className="px-4 py-3"><Badge tone="slate">{KIND_LABEL[p.kind]}</Badge></td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{formatPaise(p.amount)}</td>
                      <td className="px-4 py-3 text-xs uppercase">{p.method ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge tone={PAYMENT_STATUS_TONE[p.status]}>{p.status === "created" ? "Not paid" : cap(p.status)}</Badge>
                        {p.failureReason && <span className="mt-1 block max-w-[220px] text-xs text-slate-500 dark:text-slate-400">{p.failureReason}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {status === "ready" && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {visible.length} payments shown · {formatPaise(collected)} collected among them. Refunds are made in the Razorpay dashboard, then recorded on the Bookings tab.
        </p>
      )}

      <FailedEmails />
    </div>
  );
}

const FILTER_LABEL = "min-w-[10rem] text-xs font-medium text-slate-500 dark:text-slate-400";

/** Placeholder rows shaped like the payments table: date, customer, booking + ref, kind, amount, method, status. */
function PaymentsSkeleton() {
  return (
    <div aria-busy="true" className="overflow-hidden">
      <span className="sr-only">Loading payments</span>
      <div className="flex gap-6 border-b border-slate-200 px-4 py-3.5 dark:border-white/10">
        {[14, 16, 26, 8, 10, 8].map((w, i) => (
          <Skeleton key={i} className="h-3" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-6 px-4 py-3">
            <Skeleton className="h-4 w-[14%]" />
            <Skeleton className="h-4 w-[16%]" />
            <div className="w-[26%] space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-[8%] rounded-full" />
            <Skeleton className="h-4 w-[10%]" />
            <Skeleton className="h-5 w-[8%] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FailedEmails() {
  const [rows, setRows] = useState<FailedNotification[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    setRefreshing(true);
    try {
      setRows(await listFailedNotifications());
    } catch {
      setError(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void load(), [load]);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <MailWarning className="h-4 w-4 text-amber-500" aria-hidden />
            Failed emails
          </CardTitle>
          <CardDescription>
            Emails that couldn&apos;t be sent. The daily job retries each one up to 3 times; after that, contact the customer yourself.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => void load()} loading={refreshing}>
          {!refreshing && <RefreshCw className="h-4 w-4" aria-hidden />}
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-300">Couldn&apos;t load failed emails.</p>
        ) : rows === null ? (
          <div className="space-y-2" aria-busy="true">
            <span className="sr-only">Loading failed emails</span>
            <Skeleton className="h-5 w-2/5 rounded-full" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">None. Every email went out.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {rows.map((n) => (
              <li key={n.id} className="py-3 text-sm">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Badge tone={n.attempts >= 3 ? "red" : "amber"}>{n.attempts >= 3 ? "Gave up" : `Retrying (${n.attempts}/3)`}</Badge>
                  <span className="font-semibold">{n.subject}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  To {n.recipient} · {cap(n.kind)} · queued {dateTime(n.createdAt)}
                  {n.bookingId ? ` · booking ${n.bookingId.slice(0, 8).toUpperCase()}` : ""}
                </p>
                {n.lastError && <p className="mt-1 break-words font-mono text-xs text-red-600 dark:text-red-300">{n.lastError}</p>}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
