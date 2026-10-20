"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  signOut,
  getTrekBookings,
  getActivityBookings,
  getCourseBookings,
  getPayments,
  getProfile,
  updateProfile,
  cancelTrekBooking,
  cancelCourseBooking,
  claimBookings,
  deleteAccount,
  type TrekBooking,
  type ActivityBooking,
  type CourseBooking,
  type PaymentRecord,
  type PaymentState,
  type Profile,
} from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { daysUntil, isOverdue } from "@/lib/paymentRules";
import { cn, formatPaise } from "@/lib/utils";
import { Compass, GraduationCap, Mountain, Receipt } from "lucide-react";
import { DarkScope } from "@/components/ui/dark-scope";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const STATUS_TONES: Record<string, BadgeProps["tone"]> = {
  pending: "amber",
  confirmed: "emerald",
  cancelled: "red",
  created: "slate",
  paid: "emerald",
  failed: "red",
  advance_paid: "sky",
  fully_paid: "emerald",
  refunded: "slate",
  overdue: "red",
  quote: "amber",
};

const LABELS: Record<string, string> = {
  advance_paid: "Advance paid",
  fully_paid: "Paid in full",
  overdue: "Balance overdue",
  quote: "Quote requested",
};
const KIND_LABEL = { advance: "30% advance", balance: "Balance", full: "Full payment" } as const;

const WHATSAPP = "https://wa.me/917817912062";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Dates in the database are calendar days; read them as such, not shifted by time zone. */
const day = (iso: string) =>
  new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00Z` : iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(/^\d{4}-\d{2}-\d{2}$/.test(iso) && { timeZone: "UTC" }),
  });

function Pill({ status }: { status: string }) {
  return (
    <Badge
      tone={STATUS_TONES[status] ?? "slate"}
      // An overdue balance is the one status that must stand out.
      className={status === "overdue" ? "bg-red-500 text-white ring-red-500 dark:bg-red-500 dark:text-white dark:ring-red-500" : undefined}
    >
      {LABELS[status] ?? cap(status)}
    </Badge>
  );
}

/** Layout-true placeholder for a list section while the records load (T037). */
function RowsSkeleton({ label, rows = 2, compact = false }: { label: string; rows?: number; compact?: boolean }) {
  return (
    <div aria-busy="true" className={compact ? "space-y-3" : "space-y-4"}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) =>
        compact ? (
          <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 max-w-xs" />
              <Skeleton className="h-3 w-1/2 max-w-[14rem]" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ) : (
          <div key={i} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center">
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-40 max-w-[60%]" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-3/4 max-w-sm" />
              <Skeleton className="h-3.5 w-1/2 max-w-[14rem]" />
            </div>
            <Skeleton className="h-11 w-full rounded-xl sm:w-28" />
          </div>
        )
      )}
    </div>
  );
}

/** Total, paid and balance for one priced booking (T039). */
function Money({ amount, paid, state, dueDate }: { amount: number | null | undefined; paid: number; state: PaymentState; dueDate: string | null | undefined }) {
  if (amount == null) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
      <span className="text-white/50">Total <span className="font-semibold text-white">{formatPaise(amount)}</span></span>
      {paid > 0 && <span className="text-white/50">Paid <span className="font-semibold text-white">{formatPaise(paid)}</span></span>}
      {state === "advance_paid" && (
        <span className="text-white/50">
          Balance <span className="font-semibold text-white">{formatPaise(amount - paid)}</span>
          {dueDate ? ` due by ${day(dueDate)}` : ""}
        </span>
      )}
    </div>
  );
}

type Row = {
  status: TrekBooking["status"];
  payment_state?: PaymentState;
  quote_required?: boolean;
  amount?: number | null;
  balance_due_date?: string | null;
};

/** What a customer can do with a booking right now. */
function actionsFor(b: Row, priceable: boolean) {
  const state = b.payment_state ?? "unpaid";
  const open = b.status !== "cancelled" && state !== "refunded";
  return {
    state,
    payNow: isSupabaseConfigured && open && state === "unpaid" && !b.quote_required && priceable,
    payBalance: isSupabaseConfigured && open && state === "advance_paid",
    // Customers may cancel only while it is pending and nothing is paid (FR-015).
    cancel: b.status === "pending" && state === "unpaid",
    policyNote: b.status !== "cancelled" && (b.status === "confirmed" || state !== "unpaid"),
    overdue: isOverdue(state, b.balance_due_date),
  };
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trekBookings, setTrekBookings] = useState<TrekBooking[]>([]);
  const [activityBookings, setActivityBookings] = useState<ActivityBooking[]>([]);
  const [courseBookings, setCourseBookings] = useState<CourseBooking[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ full_name: "", phone: "", city: "", emergency_contact_name: "", emergency_contact_phone: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const load = useCallback(async (userId: string) => {
    setLoadError("");
    try {
      // Attach any course bookings made earlier (signed out) with this verified email.
      await claimBookings().catch(() => {});
      const [treks, activities, courses, pays, prof] = await Promise.all([
        getTrekBookings(userId),
        getActivityBookings(userId),
        getCourseBookings(userId),
        getPayments(userId),
        getProfile(userId),
      ]);
      setTrekBookings(treks);
      setActivityBookings(activities);
      setCourseBookings(courses);
      setPayments(pays);
      setProfile(prof);
    } catch {
      setLoadError("Couldn't load your latest records. Please refresh.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) void load(user.id);
  }, [user, load]);

  // Ask for an emergency contact before a confirmed trip in the next 30 days (T047).
  const tripSoon = useMemo(() => {
    const soon = (iso: string) => {
      const d = daysUntil(iso);
      return d >= 0 && d <= 30;
    };
    return (
      trekBookings.some((b) => b.status === "confirmed" && soon(b.trek_date)) ||
      courseBookings.some((b) => b.status === "confirmed" && soon(b.preferred_date))
    );
  }, [trekBookings, courseBookings]);

  if (loading || !user) return null;

  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const isAdmin = user.app_metadata?.role === "admin";
  const needsEmergencyContact = !loadingData && tripSoon && !profile?.emergency_contact_name && !bannerDismissed;

  const startEdit = () => {
    setDraft({
      full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
      phone: profile?.phone ?? user.user_metadata?.phone ?? "",
      city: profile?.city ?? "",
      emergency_contact_name: profile?.emergency_contact_name ?? "",
      emergency_contact_phone: profile?.emergency_contact_phone ?? "",
    });
    setSaveMsg("");
    setEditing(true);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.full_name.trim()) {
      setSaveMsg("Please enter your name.");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    try {
      const updated = await updateProfile(user.id, {
        full_name: draft.full_name.trim(),
        phone: draft.phone.trim(),
        city: draft.city.trim(),
        emergency_contact_name: draft.emergency_contact_name.trim(),
        emergency_contact_phone: draft.emergency_contact_phone.trim(),
      });
      if (updated) setProfile(updated);
      setEditing(false);
    } catch {
      setSaveMsg("Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cancelBooking = async (type: "trek" | "course", id: string) => {
    if (!window.confirm("Cancel this booking request?")) return;
    try {
      if (type === "trek") {
        await cancelTrekBooking(id);
        setTrekBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
      } else {
        await cancelCourseBooking(id);
        setCourseBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Couldn't cancel that booking. Please contact us.");
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteText !== "DELETE") return;
    setDeleting(true);
    setDeleteMsg("");
    try {
      await deleteAccount();
      router.push("/");
    } catch (err) {
      setDeleteMsg(err instanceof Error ? err.message : "Couldn't delete your account. Please contact us.");
      setDeleting(false);
    }
  };

  const handleLogout = async () => { await signOut(); router.push("/"); };

  const card = "mb-6 p-5 backdrop-blur-xl sm:p-6";
  const row = "flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center";
  const sectionTitle = "mb-4 font-heading text-lg font-semibold text-white";
  const actions = "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium sm:flex-nowrap sm:justify-end";
  const payButton = cn(buttonVariants(), "w-full sm:w-auto");
  const textLink = cn(buttonVariants({ variant: "link" }), "min-h-11");
  const cancelButton = "min-h-11 text-red-300 hover:bg-red-500/10 hover:text-red-200 dark:text-red-300 dark:hover:bg-red-500/10";
  const empty = "rounded-2xl border border-dashed border-white/10 py-8";

  const policyNote = (
    <p className="mt-2 text-xs text-white/50">
      Need to cancel? See our{" "}
      <Link href="/cancellation-policy" className="text-emerald-400 underline-offset-4 hover:underline">cancellation policy</Link> or{" "}
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline-offset-4 hover:underline">message us on WhatsApp</a>.
    </p>
  );

  return (
    <DarkScope className="min-h-screen bg-navy px-4 pb-12 pt-24 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">My Dashboard</h1>
            <p className="mt-1 text-base text-white/60">Welcome back, {fullName.split(" ")[0]}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAdmin && (
              <Link href="/admin/bookings" className={buttonVariants({ variant: "outline" })}>
                Admin
              </Link>
            )}
            <Link href="/treks" className={buttonVariants()}>
              Explore Treks
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-white/80 dark:text-white/80">
              Log Out
            </Button>
          </div>
        </div>

        {loadError && <p role="alert" className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{loadError}</p>}

        {needsEmergencyContact && (
          <div role="status" className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-amber-100">
              <span className="font-semibold text-amber-200">Add an emergency contact before your trek.</span> Your trek leader needs
              someone to call if anything happens on the trail.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  startEdit();
                  profileRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="bg-amber-400 text-slate-900 shadow-none hover:bg-amber-300 hover:shadow-none"
              >
                Add contact
              </Button>
              <Button
                variant="ghost"
                onClick={() => setBannerDismissed(true)}
                className="text-amber-100/80 hover:bg-amber-400/10 dark:text-amber-100/80 dark:hover:bg-amber-400/10"
              >
                Later
              </Button>
            </div>
          </div>
        )}

        {/* Profile */}
        <Card ref={profileRef} className={`${card} scroll-mt-24`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-white">Profile</h2>
            {!editing && (
              <Button variant="ghost" size="sm" onClick={startEdit} className="-mr-2 min-h-11 text-emerald-400 dark:text-emerald-400">
                Edit
              </Button>
            )}
          </div>
          {editing ? (
            <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="profile-full-name">Full name</Label>
                <Input id="profile-full-name" value={draft.full_name} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="profile-phone">Phone</Label>
                <Input id="profile-phone" type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} autoComplete="tel" />
              </div>
              <div>
                <Label htmlFor="profile-city">City</Label>
                <Input id="profile-city" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} autoComplete="address-level2" />
              </div>
              <div className="hidden sm:block" />
              <div>
                <Label htmlFor="profile-emergency-name">Emergency contact name</Label>
                <Input
                  id="profile-emergency-name"
                  value={draft.emergency_contact_name}
                  onChange={(e) => setDraft({ ...draft, emergency_contact_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="profile-emergency-phone">Emergency contact phone</Label>
                <Input
                  id="profile-emergency-phone"
                  type="tel"
                  value={draft.emergency_contact_phone}
                  onChange={(e) => setDraft({ ...draft, emergency_contact_phone: e.target.value })}
                />
              </div>
              {saveMsg && <p role="alert" className="text-sm text-red-300 sm:col-span-2">{saveMsg}</p>}
              <div className="flex gap-3 sm:col-span-2">
                <Button type="submit" loading={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4 text-sm sm:grid-cols-3" aria-busy={loadingData || undefined}>
              {loadingData && <span className="sr-only">Loading your profile…</span>}
              <div><span className="mb-1 block text-white/50">Name</span><span className="text-white">{fullName}</span></div>
              <div><span className="mb-1 block text-white/50">Email</span><span className="break-words text-white">{user.email}</span></div>
              <div>
                <span className="mb-1 block text-white/50">Phone</span>
                {loadingData ? <Skeleton className="mt-1.5 h-4 w-28" /> : <span className="text-white">{profile?.phone || user.user_metadata?.phone || "—"}</span>}
              </div>
              <div>
                <span className="mb-1 block text-white/50">City</span>
                {loadingData ? <Skeleton className="mt-1.5 h-4 w-24" /> : <span className="text-white">{profile?.city || "—"}</span>}
              </div>
              <div className="sm:col-span-2">
                <span className="mb-1 block text-white/50">Emergency contact</span>
                {loadingData ? (
                  <Skeleton className="mt-1.5 h-4 w-48" />
                ) : (
                  <span className="text-white">
                    {profile?.emergency_contact_name ? `${profile.emergency_contact_name} · ${profile.emergency_contact_phone || "no number"}` : "—"}
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Trek Bookings */}
        <Card className={card}>
          <h2 className={sectionTitle}>Trek Bookings</h2>
          {loadingData ? (
            <RowsSkeleton label="Loading your trek bookings…" />
          ) : trekBookings.length === 0 ? (
            <EmptyState
              className={empty}
              icon={<Mountain />}
              title="No trek bookings yet."
              action={<Link href="/treks" className={buttonVariants()}>Browse treks →</Link>}
            />
          ) : (
            <div className="space-y-4">
              {trekBookings.map((b) => {
                // Bookings made before prices were locked get priced by the server on first payment.
                const priceable = b.amount != null || /^\d+$/.test(b.group_size.trim());
                const a = actionsFor(b, priceable);
                return (
                  <div key={b.id} className={row}>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <Link href={`/treks/${b.trek_slug}`} className="truncate text-base font-semibold text-white transition-colors duration-150 ease-out hover:text-emerald-400">{b.trek_name}</Link>
                        <Pill status={b.status} />
                        {a.state !== "unpaid" && <Pill status={a.state} />}
                        {a.overdue && <Pill status="overdue" />}
                        {b.quote_required && <Pill status="quote" />}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                        <span>Date: {day(b.trek_date)}</span>
                        <span>Group: {b.group_size}</span>
                        {b.room_sharing && <span>Room: {b.room_sharing}</span>}
                        <span>Booked: {day(b.created_at)}</span>
                      </div>
                      <Money amount={b.amount} paid={b.amount_paid ?? 0} state={a.state} dueDate={b.balance_due_date} />
                      {b.quote_required && <p className="mt-2 text-sm text-amber-200/80">Quote requested — we&apos;ll send you a price for your group.</p>}
                      {b.message && <p className="mt-2 truncate text-sm text-white/40">{b.message}</p>}
                      {a.policyNote && policyNote}
                    </div>
                    <div className={actions}>
                      {a.payNow && <Link href={`/checkout?booking=${b.id}`} className={payButton}>Pay now</Link>}
                      {a.payBalance && <Link href={`/checkout?booking=${b.id}&kind=balance`} className={payButton}>Pay balance</Link>}
                      {a.cancel && <Button variant="ghost" size="sm" onClick={() => void cancelBooking("trek", b.id)} className={cancelButton}>Cancel</Button>}
                      <Link href={`/treks/${b.trek_slug}`} className={textLink}>View Trek →</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Course Bookings */}
        <Card className={card}>
          <h2 className={sectionTitle}>Course Bookings</h2>
          {loadingData ? (
            <RowsSkeleton label="Loading your course bookings…" />
          ) : courseBookings.length === 0 ? (
            <EmptyState
              className={empty}
              icon={<GraduationCap />}
              title="No course bookings yet."
              action={<Link href="/courses" className={buttonVariants({ variant: "outline" })}>Browse courses →</Link>}
            />
          ) : (
            <div className="space-y-4">
              {courseBookings.map((b) => {
                const a = actionsFor(b, b.amount != null);
                return (
                  <div key={b.id} className={row}>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <Link href={`/courses/${b.course_slug}`} className="truncate text-base font-semibold text-white transition-colors duration-150 ease-out hover:text-emerald-400">
                          {b.course_name}{b.package_name ? ` · ${b.package_name}` : ""}
                        </Link>
                        <Pill status={b.status} />
                        {a.state !== "unpaid" && <Pill status={a.state} />}
                        {a.overdue && <Pill status="overdue" />}
                        {b.quote_required && <Pill status="quote" />}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                        <span>Date: {day(b.preferred_date)}</span>
                        <span>Group: {b.group_size}</span>
                        <span>Booked: {day(b.created_at)}</span>
                      </div>
                      <Money amount={b.amount} paid={b.amount_paid ?? 0} state={a.state} dueDate={b.balance_due_date} />
                      {b.quote_required && <p className="mt-2 text-sm text-amber-200/80">Quote requested — we&apos;ll send you a price.</p>}
                      {a.policyNote && policyNote}
                    </div>
                    <div className={actions}>
                      {a.payNow && <Link href={`/checkout?course=${b.id}`} className={payButton}>Pay now</Link>}
                      {a.payBalance && <Link href={`/checkout?course=${b.id}&kind=balance`} className={payButton}>Pay balance</Link>}
                      {a.cancel && <Button variant="ghost" size="sm" onClick={() => void cancelBooking("course", b.id)} className={cancelButton}>Cancel</Button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Payments */}
        <Card className={card}>
          <h2 className={sectionTitle}>Payments</h2>
          {loadingData ? (
            <RowsSkeleton label="Loading your payments…" compact />
          ) : payments.length === 0 ? (
            <EmptyState
              className={empty}
              icon={<Receipt />}
              title="No payments yet."
              action={<Link href="/treks" className={buttonVariants({ variant: "outline" })}>Browse treks →</Link>}
            />
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{p.for_label}</p>
                    <p className="text-white/50">
                      {KIND_LABEL[p.kind]} · {day(p.paid_at ?? p.created_at)}{p.method ? ` · ${p.method.toUpperCase()}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">{formatPaise(p.amount)}</span>
                    <Pill status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Activity Bookings */}
        <Card className={card}>
          <h2 className={sectionTitle}>Activity Bookings</h2>
          {loadingData ? (
            <RowsSkeleton label="Loading your activity bookings…" />
          ) : activityBookings.length === 0 ? (
            <EmptyState
              className={empty}
              icon={<Compass />}
              title="No activity bookings yet."
              action={<Link href="/activities" className={buttonVariants({ variant: "outline" })}>Browse activities →</Link>}
            />
          ) : (
            <div className="space-y-4">
              {activityBookings.map((b) => (
                <div key={b.id} className={row}>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="truncate text-base font-semibold text-white">{b.activity_name}</span>
                      <Badge tone="sky">{b.activity_type}</Badge>
                      <Pill status={b.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                      <span>Date: {day(b.activity_date)}</span>
                      <span>Group: {b.group_size}</span>
                      <span>Booked: {day(b.created_at)}</span>
                    </div>
                    {b.message && <p className="mt-2 truncate text-sm text-white/40">{b.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Delete account (FR-070) */}
        <div className="rounded-2xl border border-red-400/20 bg-red-500/5 p-5 sm:p-6">
          <h2 className="font-heading text-lg font-semibold text-white">Delete my account</h2>
          <p className="mt-2 text-sm text-white/60">
            This removes your sign-in and your personal details. Records of payments you&apos;ve made are kept, without your name, because
            the law requires us to keep financial records. Bookings you&apos;ve paid for stay valid — contact us about them on WhatsApp.
          </p>
          <form onSubmit={handleDelete} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="delete-confirm">
                Type <span className="font-mono font-semibold text-white">DELETE</span> to confirm
              </Label>
              <Input id="delete-confirm" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} autoComplete="off" />
            </div>
            <Button type="submit" variant="destructive" loading={deleting} disabled={deleteText !== "DELETE"}>
              {deleting ? "Deleting…" : "Delete my account"}
            </Button>
          </form>
          {deleteMsg && <p role="alert" className="mt-3 text-sm text-red-300">{deleteMsg}</p>}
        </div>
      </div>
    </DarkScope>
  );
}
