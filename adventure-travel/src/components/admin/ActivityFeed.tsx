"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  CircleDollarSign,
  CircleX,
  LogIn,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityAction, ActivityLog, ActivityMetadata } from "@/lib/activity";
import { cn, formatPaise, timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { DURATION, transition } from "@/lib/motion";

const PAGE_SIZE = 25;
const SELECT = "id,user_id,action_type,metadata,created_at,profiles(full_name)";

type Tone = "emerald" | "sky" | "amber" | "red" | "slate";

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

const ACTIONS: Record<
  ActivityAction,
  { label: string; tone: Tone; icon: LucideIcon; describe: (m: ActivityMetadata) => string }
> = {
  SIGNUP: { label: "Sign up", tone: "emerald", icon: UserPlus, describe: () => "created an account" },
  LOGIN: { label: "Login", tone: "sky", icon: LogIn, describe: () => "signed in" },
  BOOKING_CREATED: {
    label: "Booking",
    tone: "slate",
    icon: CalendarCheck,
    describe: (m) => `requested ${str(m.trek_name) ?? "a trek"}${str(m.trek_date) ? ` for ${m.trek_date}` : ""}`,
  },
  PAYMENT_INITIATED: {
    label: "Payment started",
    tone: "amber",
    icon: CircleDollarSign,
    describe: (m) =>
      `started a payment${typeof m.amount === "number" ? ` of ${formatPaise(m.amount)}` : ""}${str(m.trek_name) ? ` for ${m.trek_name}` : ""}`,
  },
  PAYMENT_SUCCESS: {
    label: "Payment",
    tone: "amber",
    icon: CircleDollarSign,
    describe: (m) => `paid${typeof m.amount === "number" ? ` ${formatPaise(m.amount)}` : ""}${str(m.method) ? ` via ${String(m.method).toUpperCase()}` : ""}`,
  },
  PAYMENT_FAILED: {
    label: "Payment failed",
    tone: "red",
    icon: CircleX,
    describe: (m) => `had a failed payment${str(m.reason) ? ` — ${m.reason}` : ""}`,
  },
  SETTINGS_UPDATE: { label: "Settings", tone: "slate", icon: Settings, describe: () => "updated their settings" },
  COURSE_BOOKING_CREATED: {
    label: "Course booking",
    tone: "slate",
    icon: CalendarCheck,
    describe: (m) => `booked ${str(m.course_name) ?? "a course"}`,
  },
  // Logged against the booking's owner, so the sentence describes what happened to their booking.
  ADMIN_STATUS_CHANGE: {
    label: "Status change",
    tone: "slate",
    icon: ShieldCheck,
    describe: (m) =>
      m.from !== m.to
        ? `had a booking changed from ${str(m.from) ?? "—"} to ${str(m.to) ?? "—"} by an admin`
        : `had a booking's payment marked ${str(m.to_payment_state)?.replace(/_/g, " ") ?? "changed"} by an admin`,
  },
};

const FALLBACK = { label: "Activity", tone: "slate" as Tone, icon: Settings, describe: () => "did something" };

function browserLabel(ua: unknown) {
  if (typeof ua !== "string" || !ua) return null;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Browser";
  return `${browser} · ${/Mobi|Android|iPhone/i.test(ua) ? "Mobile" : "Desktop"}`;
}

// PostgREST returns the embedded profile as an object (or a one-item array, depending on version).
function normalize(row: Record<string, unknown>): ActivityLog {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return { ...(row as unknown as ActivityLog), profiles: (profile as ActivityLog["profiles"]) ?? null };
}

function FeedSkeleton() {
  return (
    <ul className="space-y-6" aria-busy="true">
      <li className="sr-only">Loading activity</li>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="hidden h-3 w-16 sm:block" />
        </li>
      ))}
    </ul>
  );
}

export function ActivityFeed() {
  const reduceMotion = useReducedMotion();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [live, setLive] = useState(false);
  const [fresh, setFresh] = useState<string[]>([]);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    const { data, error } = await supabase
      .from("activity_logs")
      .select(SELECT)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);
    if (error) {
      setStatus("error");
      return;
    }
    setLogs((data ?? []).map(normalize));
    setHasMore((data?.length ?? 0) === PAGE_SIZE);
    setStatus("ready");
  }, []);

  const loadMore = async () => {
    const supabase = createClient();
    const last = logs[logs.length - 1];
    if (!supabase || !last) return;
    setLoadingMore(true);
    const { data } = await supabase
      .from("activity_logs")
      .select(SELECT)
      .order("created_at", { ascending: false })
      .lt("created_at", last.created_at)
      .limit(PAGE_SIZE);
    setLogs((prev) => [...prev, ...(data ?? []).map(normalize)]);
    setHasMore((data?.length ?? 0) === PAGE_SIZE);
    setLoadingMore(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void load(), [load]);

  // Keep relative timestamps current.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // New events appear at the top without a refresh.
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const channel = supabase
      .channel("admin-activity-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_logs" }, async (payload: { new: { id: string } }) => {
        const { data } = await supabase.from("activity_logs").select(SELECT).eq("id", payload.new.id).maybeSingle();
        if (!data) return;
        const row = normalize(data);
        setLogs((prev) => (prev.some((l) => l.id === row.id) ? prev : [row, ...prev]));
        setFresh((prev) => [...prev, row.id]);
        setTimeout(() => setFresh((prev) => prev.filter((id) => id !== row.id)), 4000);
      })
      .subscribe((s: string) => setLive(s === "SUBSCRIBED"));
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Sign-ups, logins, bookings and payments as they happen.</CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "hidden items-center gap-1.5 text-xs font-medium sm:flex",
              live ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", live ? "bg-emerald-500" : "bg-slate-400")} />
            {live ? "Live" : "Offline"}
          </span>
          <Button variant="outline" size="sm" onClick={() => void load()} loading={status === "loading"}>
            {status !== "loading" && <RefreshCw className="h-4 w-4" aria-hidden />}
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {status === "loading" && logs.length === 0 && <FeedSkeleton />}

        {status === "error" && (
          <div role="alert">
            <EmptyState
              tone="amber"
              icon={<AlertTriangle />}
              title="Couldn't load activity."
              description="Check that the SQL migration has been run and that your account has the admin role."
              action={
                <Button variant="outline" size="sm" onClick={() => void load()}>
                  Try again
                </Button>
              }
            />
          </div>
        )}

        {status === "ready" && logs.length === 0 && (
          <EmptyState icon={<Activity />} title="No activity yet." />
        )}

        {logs.length > 0 && status !== "error" && (
          <ol className="relative">
            {logs.map((log, index) => {
              const cfg = ACTIONS[log.action_type] ?? FALLBACK;
              const Icon = cfg.icon;
              const name = log.profiles?.full_name?.trim() || str(log.metadata.email) || "Unknown user";
              const detail = [str(log.metadata.email), browserLabel(log.metadata.userAgent), str(log.metadata.ip)]
                .filter(Boolean)
                .join(" · ");
              const isLast = index === logs.length - 1;
              return (
                <motion.li
                  key={log.id}
                  layout={reduceMotion ? false : "position"}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...transition("base"), delay: reduceMotion ? 0 : Math.min(index, 8) * (DURATION.fast / 4) }}
                  className="relative flex gap-4 pb-6 last:pb-0"
                >
                  {!isLast && (
                    <span aria-hidden className="absolute left-5 top-11 bottom-1 w-px bg-slate-200 dark:bg-white/10" />
                  )}
                  <Avatar name={name} seed={log.user_id} />
                  <div
                    className={cn(
                      "min-w-0 flex-1 rounded-xl px-3 py-2 -mx-3 -my-2 transition-colors duration-300 ease-in-out motion-reduce:transition-none",
                      fresh.includes(log.id) && "bg-emerald-50 dark:bg-emerald-400/10"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        <span className="font-semibold text-slate-900 dark:text-white">{name}</span>{" "}
                        {cfg.describe(log.metadata)}
                      </p>
                      <Badge tone={cfg.tone}>
                        <Icon className="h-3 w-3" aria-hidden />
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400">
                      <time dateTime={log.created_at} title={new Date(log.created_at).toLocaleString("en-IN")}>
                        {timeAgo(log.created_at, now)}
                      </time>
                      {detail && <span className="truncate">· {detail}</span>}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}

        {hasMore && status === "ready" && (
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => void loadMore()} loading={loadingMore}>
              Load older activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
