"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, CalendarDays, Clock, IndianRupee, MailWarning, RefreshCw, Undo2 } from "lucide-react";
import { AdminGate } from "@/components/admin/AdminGate";
import { LoadError } from "@/components/admin/LoadError";
import { STATUS_TONE, TYPE_LABEL, cap, shortDate } from "@/components/admin/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { loadSummary, type AdminBooking } from "@/lib/admin";
import type { AdminSummary } from "@/lib/adminSummary";
import { formatPaise } from "@/lib/utils";

export default function OverviewAdminClient() {
  return (
    <AdminGate wide title="Overview" description="Money, bookings that need you, and who is heading out in the next two weeks.">
      <Overview />
    </AdminGate>
  );
}

function Overview() {
  const [data, setData] = useState<{ summary: AdminSummary; failedEmails: number } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setData(await loadSummary());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void load(), [load]);

  if (status === "error") return <LoadError onRetry={load} />;
  const s = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={load} loading={status === "loading"}>
          <RefreshCw className="h-4 w-4" aria-hidden /> Refresh
        </Button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<IndianRupee className="h-4 w-4" />} label="Collected this month" value={s && formatPaise(s.collectedThisMonth)} note={s && `${formatPaise(s.collectedTotal)} in total`} href="/admin/payments" />
        <Stat icon={<Clock className="h-4 w-4" />} label="Still to collect" value={s && formatPaise(s.outstanding)} note="On live bookings" href="/admin/bookings" />
        <Stat icon={<CalendarDays className="h-4 w-4" />} label="New bookings, last 7 days" value={s && String(s.newThisWeek)} note={s && `${s.pending.length} waiting for confirmation`} href="/admin/bookings" />
        <Stat icon={<MailWarning className="h-4 w-4" />} label="Emails that failed" value={data && String(data.failedEmails)} note="The daily job retries them" href="/admin/payments" warn={!!data?.failedEmails} />
      </ul>

      <div className="grid gap-6 lg:grid-cols-2">
        <BookingList
          title="Needs you"
          description="Overdue balances and bookings still waiting for your confirmation."
          icon={<AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />}
          rows={s && [...s.overdue, ...s.pending.filter((p) => !s.overdue.includes(p))]}
          empty="Nothing overdue or waiting. All caught up."
          tag={(b) => (b.overdue ? <Badge tone="red">Balance overdue</Badge> : <Badge tone={STATUS_TONE[b.status]}>{cap(b.status)}</Badge>)}
        />
        <BookingList
          title="Starting in the next 14 days"
          description="Live bookings by start date."
          icon={<CalendarDays className="h-4 w-4 text-emerald-600" aria-hidden />}
          rows={s?.upcoming}
          empty="No departures in the next two weeks."
          tag={(b) => <span className="whitespace-nowrap text-sm font-semibold text-foreground">{shortDate(b.startDate)}</span>}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Undo2 className="h-4 w-4 text-red-600" aria-hidden /> Payments to refund</CardTitle>
          <CardDescription>Paid after the booking was cancelled or refunded, or more than the booking total. Refund them in Razorpay.</CardDescription>
        </CardHeader>
        <CardContent>
          {!s ? (
            <Skeleton className="h-12 rounded-xl" />
          ) : s.needsRefund.length === 0 ? (
            <p className="text-sm text-muted">None.</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {s.needsRefund.map((p) => (
                <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm">
                  <span>
                    <span className="font-semibold text-foreground">{p.customer}</span> · {p.item} · ref {p.bookingRef}
                    <span className="block text-xs text-muted">{p.failureReason}</span>
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">{formatPaise(p.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ icon, label, value, note, href, warn }: { icon: ReactNode; label: string; value?: string | null; note?: string | null | false; href: string; warn?: boolean }) {
  return (
    <li>
      <Link
        href={href}
        className="block h-full rounded-2xl border border-slate-200 bg-white p-4 transition-shadow duration-150 ease-out hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:border-white/10 dark:bg-white/5"
      >
        <p className={`flex items-center gap-2 text-xs font-semibold ${warn ? "text-red-600" : "text-muted"}`}>
          {icon}
          {label}
        </p>
        {value == null ? <Skeleton className="mt-2 h-8 w-28" /> : <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>}
        {note && <p className="mt-1 text-xs text-muted">{note}</p>}
      </Link>
    </li>
  );
}

function BookingList({
  title,
  description,
  icon,
  rows,
  empty,
  tag,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  rows?: AdminBooking[];
  empty: string;
  tag: (b: AdminBooking) => ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{icon}{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {!rows ? (
          <div className="space-y-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title={empty} />
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-white/10">
            {rows.slice(0, 12).map((b) => (
              <li key={`${b.type}-${b.id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-foreground">{b.customer.name || b.customer.email || "Customer"}</span>
                  <span className="block truncate text-xs text-muted">
                    {TYPE_LABEL[b.type]} · {b.item} · {b.groupSize} {b.groupSize === "1" ? "person" : "people"} · ref {b.ref}
                  </span>
                </span>
                {tag(b)}
              </li>
            ))}
          </ul>
        )}
        {rows && rows.length > 12 && (
          <Link href="/admin/bookings" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
            See all {rows.length} on Bookings
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
