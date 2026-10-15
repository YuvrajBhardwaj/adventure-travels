"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  type TrekBooking,
  type ActivityBooking,
  type CourseBooking,
  type PaymentRecord,
  type Profile,
} from "@/lib/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatPaise } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
  created: "bg-slate-100 text-slate-600",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-600",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Pill({ status }: { status: string }) {
  return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[status] ?? ""}`}>{cap(status)}</span>;
}

const FIELD =
  "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none placeholder:text-white/30";

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

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const load = useCallback(async (userId: string) => {
    setLoadError("");
    try {
      // Attach any course bookings made earlier (logged out) with this verified email.
      const supabase = createClient();
      const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
      if (token) {
        await fetch("/api/claim-bookings", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      }
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

  const paidTrek = useMemo(() => new Set(payments.filter((p) => p.status === "paid" && p.booking_id).map((p) => p.booking_id)), [payments]);
  const paidCourse = useMemo(() => new Set(payments.filter((p) => p.status === "paid" && p.course_booking_id).map((p) => p.course_booking_id)), [payments]);

  if (loading || !user) return null;

  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const isAdmin = user.app_metadata?.role === "admin";
  const canPayOnline = isSupabaseConfigured;

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

  const cancelBooking = async (id: string) => {
    if (!window.confirm("Cancel this booking request?")) return;
    try {
      await cancelTrekBooking(id);
      setTrekBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
    } catch {
      setLoadError("Couldn't cancel that booking. Please contact us.");
    }
  };

  const handleLogout = async () => { await signOut(); router.push("/"); };

  const card = "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6";
  const row = "bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4";

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
              <Link href="/admin/activity" className="px-5 py-2.5 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors text-sm">
                Admin activity
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

        {/* Profile */}
        <div className={card}>
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
                const paid = paidTrek.has(b.id);
                const payable = canPayOnline && !paid && b.status !== "cancelled" && /^\d+$/.test(b.group_size.trim());
                return (
                  <div key={b.id} className={row}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <Link href={`/treks/${b.trek_slug}`} className="font-bold text-white hover:text-emerald-400 transition-colors truncate">{b.trek_name}</Link>
                        <Pill status={b.status} />
                        {paid && <Pill status="paid" />}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                        <span>Date: {day(b.trek_date)}</span>
                        <span>Group: {b.group_size}</span>
                        {b.room_sharing && <span>Room: {b.room_sharing}</span>}
                        <span>Booked: {new Date(b.created_at).toLocaleDateString("en-IN")}</span>
                      </div>
                      {b.message && <p className="text-white/40 text-sm mt-2 truncate">{b.message}</p>}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium whitespace-nowrap">
                      {payable && <Link href={`/checkout?booking=${b.id}`} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Pay now</Link>}
                      {b.status === "pending" && !paid && (
                        <button onClick={() => void cancelBooking(b.id)} className="text-red-300 hover:underline">Cancel</button>
                      )}
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
                const paid = paidCourse.has(b.id);
                const payable = canPayOnline && !paid && b.status !== "cancelled" && Boolean(b.amount);
                return (
                  <div key={b.id} className={row}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <Link href={`/courses/${b.course_slug}`} className="font-bold text-white hover:text-emerald-400 transition-colors truncate">
                          {b.course_name}{b.package_name ? ` · ${b.package_name}` : ""}
                        </Link>
                        <Pill status={b.status} />
                        {paid && <Pill status="paid" />}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                        <span>Date: {day(b.preferred_date)}</span>
                        <span>Group: {b.group_size}</span>
                        {b.amount ? <span>Total: {formatPaise(b.amount)}</span> : null}
                        <span>Booked: {new Date(b.created_at).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                    {payable && (
                      <Link href={`/checkout?course=${b.id}`} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 whitespace-nowrap">
                        Pay now
                      </Link>
                    )}
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
                      {day(p.paid_at ?? p.created_at)}{p.method ? ` · ${p.method.toUpperCase()}` : ""}
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
                      <span>Booked: {new Date(b.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                    {b.message && <p className="text-white/40 text-sm mt-2 truncate">{b.message}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
