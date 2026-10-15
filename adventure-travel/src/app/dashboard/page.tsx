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
import { formatPaise } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
  created: "bg-slate-100 text-slate-600",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-600",
  advance_paid: "bg-sky-100 text-sky-700",
  fully_paid: "bg-emerald-100 text-emerald-700",
  refunded: "bg-slate-200 text-slate-700",
  overdue: "bg-red-500 text-white",
  quote: "bg-amber-100 text-amber-800",
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
  return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[status] ?? ""}`}>{LABELS[status] ?? cap(status)}</span>;
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

const FIELD =
  "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none placeholder:text-white/30";

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

  const card = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6";
  const row = "bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4";

  const policyNote = (
    <p className="mt-2 text-xs text-white/50">
      Need to cancel? See our{" "}
      <Link href="/cancellation-policy" className="text-emerald-400 hover:underline">cancellation policy</Link> or{" "}
      <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">message us on WhatsApp</a>.
    </p>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white font-heading">My Dashboard</h1>
            <p className="text-white/60 mt-1">Welcome back, {fullName.split(" ")[0]}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAdmin && (
              <Link href="/admin/bookings" className="px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors text-sm">
                Admin
              </Link>
            )}
            <Link href="/treks" className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors text-sm">
              Explore Treks
            </Link>
            <button onClick={handleLogout} className="px-5 py-2.5 bg-white/10 text-white/80 font-medium rounded-xl hover:bg-white/20 transition-colors text-sm">
              Log Out
            </button>
          </div>
        </div>

        {loadError && <p role="alert" className="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{loadError}</p>}

        {needsEmergencyContact && (
          <div role="status" className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-amber-100">
              <span className="font-semibold text-amber-200">Add an emergency contact before your trek.</span> Your trek leader needs
              someone to call if anything happens on the trail.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  startEdit();
                  profileRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
              >
                Add contact
              </button>
              <button onClick={() => setBannerDismissed(true)} className="text-sm text-amber-100/80 hover:underline">
                Later
              </button>
            </div>
          </div>
        )}

        {/* Profile */}
        <div ref={profileRef} className={`${card} scroll-mt-24`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Profile</h2>
            {!editing && (
              <button onClick={startEdit} className="text-sm font-semibold text-emerald-400 hover:underline">Edit</button>
            )}
          </div>
          {editing ? (
            <form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm text-white/70">Full name
                <input className={`${FIELD} mt-1.5`} value={draft.full_name} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} autoComplete="name" />
              </label>
              <label className="block text-sm text-white/70">Phone
                <input className={`${FIELD} mt-1.5`} type="tel" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} autoComplete="tel" />
              </label>
              <label className="block text-sm text-white/70">City
                <input className={`${FIELD} mt-1.5`} value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} autoComplete="address-level2" />
              </label>
              <div className="hidden sm:block" />
              <label className="block text-sm text-white/70">Emergency contact name
                <input className={`${FIELD} mt-1.5`} value={draft.emergency_contact_name} onChange={(e) => setDraft({ ...draft, emergency_contact_name: e.target.value })} />
              </label>
              <label className="block text-sm text-white/70">Emergency contact phone
                <input className={`${FIELD} mt-1.5`} type="tel" value={draft.emergency_contact_phone} onChange={(e) => setDraft({ ...draft, emergency_contact_phone: e.target.value })} />
              </label>
              {saveMsg && <p role="alert" className="sm:col-span-2 text-sm text-red-300">{saveMsg}</p>}
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 text-sm disabled:opacity-70">
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="px-5 py-2.5 bg-white/10 text-white/80 rounded-xl hover:bg-white/20 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div><span className="text-white/50 block mb-1">Name</span><span className="text-white">{fullName}</span></div>
              <div><span className="text-white/50 block mb-1">Email</span><span className="text-white">{user.email}</span></div>
              <div><span className="text-white/50 block mb-1">Phone</span><span className="text-white">{profile?.phone || user.user_metadata?.phone || "—"}</span></div>
              <div><span className="text-white/50 block mb-1">City</span><span className="text-white">{profile?.city || "—"}</span></div>
              <div className="sm:col-span-2">
                <span className="text-white/50 block mb-1">Emergency contact</span>
                <span className="text-white">
                  {profile?.emergency_contact_name ? `${profile.emergency_contact_name} · ${profile.emergency_contact_phone || "no number"}` : "—"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Trek Bookings */}
        <div className={card}>
          <h2 className="text-lg font-bold text-white mb-4">Trek Bookings</h2>
          {loadingData ? (
            <p className="text-white/40 text-center py-8">Loading…</p>
          ) : trekBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 mb-4">No trek bookings yet.</p>
              <Link href="/treks" className="text-emerald-400 font-semibold hover:underline">Browse treks →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {trekBookings.map((b) => {
                // Bookings made before prices were locked get priced by the server on first payment.
                const priceable = b.amount != null || /^\d+$/.test(b.group_size.trim());
                const a = actionsFor(b, priceable);
                return (
                  <div key={b.id} className={row}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <Link href={`/treks/${b.trek_slug}`} className="font-bold text-white hover:text-emerald-400 transition-colors truncate">{b.trek_name}</Link>
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
                      {b.message && <p className="text-white/40 text-sm mt-2 truncate">{b.message}</p>}
                      {a.policyNote && policyNote}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium whitespace-nowrap">
                      {a.payNow && <Link href={`/checkout?booking=${b.id}`} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Pay now</Link>}
                      {a.payBalance && <Link href={`/checkout?booking=${b.id}&kind=balance`} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Pay balance</Link>}
                      {a.cancel && <button onClick={() => void cancelBooking("trek", b.id)} className="text-red-300 hover:underline">Cancel</button>}
                      <Link href={`/treks/${b.trek_slug}`} className="text-emerald-400 hover:underline">View Trek →</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Course Bookings */}
        <div className={card}>
          <h2 className="text-lg font-bold text-white mb-4">Course Bookings</h2>
          {loadingData ? (
            <p className="text-white/40 text-center py-8">Loading…</p>
          ) : courseBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 mb-4">No course bookings yet.</p>
              <Link href="/courses" className="text-emerald-400 font-semibold hover:underline">Browse courses →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courseBookings.map((b) => {
                const a = actionsFor(b, b.amount != null);
                return (
                  <div key={b.id} className={row}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <Link href={`/courses/${b.course_slug}`} className="font-bold text-white hover:text-emerald-400 transition-colors truncate">
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
                    <div className="flex items-center gap-4 text-sm font-medium whitespace-nowrap">
                      {a.payNow && <Link href={`/checkout?course=${b.id}`} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Pay now</Link>}
                      {a.payBalance && <Link href={`/checkout?course=${b.id}&kind=balance`} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Pay balance</Link>}
                      {a.cancel && <button onClick={() => void cancelBooking("course", b.id)} className="text-red-300 hover:underline">Cancel</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payments */}
        <div className={card}>
          <h2 className="text-lg font-bold text-white mb-4">Payments</h2>
          {loadingData ? (
            <p className="text-white/40 text-center py-8">Loading…</p>
          ) : payments.length === 0 ? (
            <p className="text-white/40 text-center py-8">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{p.for_label}</p>
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
        </div>

        {/* Activity Bookings */}
        <div className={card}>
          <h2 className="text-lg font-bold text-white mb-4">Activity Bookings</h2>
          {loadingData ? (
            <p className="text-white/40 text-center py-8">Loading…</p>
          ) : activityBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 mb-4">No activity bookings yet.</p>
              <Link href="/activities" className="text-emerald-400 font-semibold hover:underline">Browse activities →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activityBookings.map((b) => (
                <div key={b.id} className={row}>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="font-bold text-white truncate">{b.activity_name}</span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700">{b.activity_type}</span>
                      <Pill status={b.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                      <span>Date: {day(b.activity_date)}</span>
                      <span>Group: {b.group_size}</span>
                      <span>Booked: {day(b.created_at)}</span>
                    </div>
                    {b.message && <p className="text-white/40 text-sm mt-2 truncate">{b.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete account (FR-070) */}
        <div className="rounded-2xl border border-red-400/20 bg-red-500/5 p-6">
          <h2 className="text-lg font-bold text-white">Delete my account</h2>
          <p className="mt-2 text-sm text-white/60">
            This removes your sign-in and your personal details. Records of payments you&apos;ve made are kept, without your name, because
            the law requires us to keep financial records. Bookings you&apos;ve paid for stay valid — contact us about them on WhatsApp.
          </p>
          <form onSubmit={handleDelete} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block flex-1 text-sm text-white/70">
              Type <span className="font-mono font-semibold text-white">DELETE</span> to confirm
              <input className={`${FIELD} mt-1.5`} value={deleteText} onChange={(e) => setDeleteText(e.target.value)} autoComplete="off" />
            </label>
            <button
              type="submit"
              disabled={deleteText !== "DELETE" || deleting}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete my account"}
            </button>
          </form>
          {deleteMsg && <p role="alert" className="mt-3 text-sm text-red-300">{deleteMsg}</p>}
        </div>
      </div>
    </div>
  );
}
