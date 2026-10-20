"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Mail, Phone, RefreshCw, Search, UserSearch, Users } from "lucide-react";
import { AdminGate } from "@/components/admin/AdminGate";
import { LoadError } from "@/components/admin/LoadError";
import {
  KIND_LABEL,
  PAYMENT_STATE_LABEL,
  PAYMENT_STATE_TONE,
  PAYMENT_STATUS_TONE,
  STATUS_TONE,
  TYPE_LABEL,
  cap,
  shortDate,
} from "@/components/admin/labels";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getCustomer, listCustomers, type AdminCustomer } from "@/lib/admin";
import { cn, formatPaise } from "@/lib/utils";

type Detail = NonNullable<Awaited<ReturnType<typeof getCustomer>>>;

export default function CustomersAdminClient() {
  return (
    <AdminGate wide title="Customers" description="Everyone with an account, with their bookings and payments.">
      <CustomersAdmin />
    </AdminGate>
  );
}

function CustomersAdmin() {
  const [all, setAll] = useState<AdminCustomer[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailState, setDetailState] = useState<"idle" | "loading" | "error">("idle");
  const detailRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setAll(await listCustomers());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void load(), [load]);

  const visible = useMemo(() => {
    const needle = deferredQ.trim().toLowerCase();
    const digits = needle.replace(/\D/g, "");
    return all.filter(
      (c) =>
        !needle ||
        c.fullName.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle) ||
        (digits.length >= 3 && c.phone.replace(/\D/g, "").includes(digits)) ||
        c.city.toLowerCase().includes(needle)
    );
  }, [all, deferredQ]);

  const open = async (id: string) => {
    setSelected(id);
    setDetailState("loading");
    try {
      const d = await getCustomer(id);
      setDetail(d);
      setDetailState(d ? "idle" : "error");
      // On narrow screens the detail sits below the list.
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ block: "start", behavior: "smooth" }));
    } catch {
      setDetailState("error");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <Card className="self-start">
        <CardContent className="space-y-3 pt-5">
          <div className="flex gap-2">
            <label className="relative block flex-1">
              <span className="sr-only">Search customers</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <Input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name, email, phone or city"
                className="pl-9"
              />
            </label>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={() => void load()}
              aria-label="Refresh customers"
              loading={status === "loading"}
            >
              {status !== "loading" && <RefreshCw className="h-4 w-4" aria-hidden />}
            </Button>
          </div>
          {status === "error" ? (
            <LoadError onRetry={() => void load()} />
          ) : status === "loading" && all.length === 0 ? (
            <ul className="space-y-1" aria-busy="true">
              <li className="sr-only">Loading customers</li>
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  <span className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-3/5" />
                    <Skeleton className="h-3 w-4/5" />
                  </span>
                </li>
              ))}
            </ul>
          ) : visible.length === 0 ? (
            <EmptyState className="py-8" icon={<UserSearch />} title="No customers match." />
          ) : (
            <ul className="-mx-2 max-h-[65vh] space-y-1 overflow-y-auto px-2">
              {visible.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => void open(c.id)}
                    aria-current={selected === c.id}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors duration-150 ease-out motion-reduce:transition-none",
                      selected === c.id ? "bg-emerald-50 dark:bg-emerald-400/10" : "hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                  >
                    <Avatar name={c.fullName || c.email || "?"} seed={c.id} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{c.deletedAt ? "Deleted user" : c.fullName || "No name"}</span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{c.email || c.phone || "—"}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">{visible.length} of {all.length} customers</p>
        </CardContent>
      </Card>

      <div ref={detailRef} className="scroll-mt-24">
        {!selected ? (
          <Card>
            <EmptyState className="py-16" icon={<Users />} title="Pick a customer to see their bookings and payments." />
          </Card>
        ) : detailState === "loading" ? (
          <div className="space-y-4" aria-busy="true">
            <span className="sr-only">Loading customer</span>
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </Card>
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="space-y-3 p-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </Card>
            ))}
          </div>
        ) : detailState === "error" || !detail ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-red-600 dark:text-red-300">Couldn&apos;t load this customer.</CardContent>
          </Card>
        ) : (
          <CustomerDetail detail={detail} />
        )}
      </div>
    </div>
  );
}

function CustomerDetail({ detail }: { detail: Detail }) {
  const { profile: p, bookings, payments } = detail;
  const paid = payments.filter((x) => x.status === "paid").reduce((sum, x) => sum + x.amount, 0);
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar name={p.fullName || p.email || "?"} seed={p.id} className="h-14 w-14 text-lg" />
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-xl font-bold">{p.deletedAt ? "Deleted user" : p.fullName || "No name"}</h2>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
                {p.email && (
                  <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1.5 hover:underline">
                    <Mail className="h-4 w-4" aria-hidden />
                    {p.email}
                  </a>
                )}
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="inline-flex items-center gap-1.5 hover:underline">
                    <Phone className="h-4 w-4" aria-hidden />
                    {p.phone}
                  </a>
                )}
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-slate-500 dark:text-slate-400">Paid in total</p>
              <p className="text-lg font-bold">{formatPaise(paid)}</p>
            </div>
          </div>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">City</dt>
              <dd className="font-medium">{p.city || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Emergency contact</dt>
              <dd className="font-medium">
                {p.emergencyContactName ? `${p.emergencyContactName} · ${p.emergencyContactPhone || "no number"}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Customer since</dt>
              <dd className="font-medium">{shortDate(p.createdAt)}</dd>
            </div>
          </dl>
          {p.deletedAt && (
            <p className="mt-4 rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
              This account was deleted on {shortDate(p.deletedAt)}. Its payment records are kept for legal reasons.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Bookings ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No bookings.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/5">
              {bookings.map((b) => (
                <li key={`${b.type}-${b.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm">
                  <span className="font-mono text-xs font-semibold">{b.ref}</span>
                  <Badge tone="slate">{TYPE_LABEL[b.type]}</Badge>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {b.item}
                    {b.option ? <span className="text-slate-500 dark:text-slate-400"> · {b.option}</span> : null}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">{shortDate(b.startDate)}</span>
                  {b.amount !== null && <span className="font-semibold">{formatPaise(b.amount)}</span>}
                  {b.paymentState && <Badge tone={PAYMENT_STATE_TONE[b.paymentState]}>{PAYMENT_STATE_LABEL[b.paymentState]}</Badge>}
                  {b.overdue && <Badge tone="red">Overdue</Badge>}
                  <Badge tone={STATUS_TONE[b.status]}>{cap(b.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Payments ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No payments.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/5">
              {payments.map((x) => (
                <li key={x.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{shortDate(x.paidAt ?? x.createdAt)}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{x.item}</span>
                  <Badge tone="slate">{KIND_LABEL[x.kind]}</Badge>
                  {x.method && <span className="text-xs uppercase text-slate-500 dark:text-slate-400">{x.method}</span>}
                  <span className="font-semibold">{formatPaise(x.amount)}</span>
                  <Badge tone={PAYMENT_STATUS_TONE[x.status]}>{cap(x.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
