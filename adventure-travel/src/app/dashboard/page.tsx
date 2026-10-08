"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOut, getTrekBookings, getActivityBookings, type TrekBooking, type ActivityBooking } from "@/lib/auth";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [trekBookings, setTrekBookings] = useState<TrekBooking[]>([]);
  const [activityBookings, setActivityBookings] = useState<ActivityBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([getTrekBookings(user.id), getActivityBookings(user.id)])
      .then(([treks, activities]) => { setTrekBookings(treks); setActivityBookings(activities); })
      .finally(() => setLoadingBookings(false));
  }, [user]);

  const handleLogout = async () => { await signOut(); router.push("/"); };

  if (loading || !user) return null;

  const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const phone = user.user_metadata?.phone || "—";

  return (
    <div className="min-h-screen bg-[#0F172A] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white font-heading">My Dashboard</h1>
            <p className="text-white/60 mt-1">Welcome back, {fullName.split(" ")[0]}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/treks" className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors text-sm">
              Explore Treks
            </Link>
            <button onClick={handleLogout} className="px-5 py-2.5 bg-white/10 text-white/80 font-medium rounded-xl hover:bg-white/20 transition-colors text-sm">
              Log Out
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Profile</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div><span className="text-white/50 block mb-1">Name</span><span className="text-white">{fullName}</span></div>
            <div><span className="text-white/50 block mb-1">Email</span><span className="text-white">{user.email}</span></div>
            <div><span className="text-white/50 block mb-1">Phone</span><span className="text-white">{phone}</span></div>
          </div>
        </div>

        {/* Trek Bookings */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Trek Bookings</h2>
          {loadingBookings ? (
            <p className="text-white/40 text-center py-8">Loading…</p>
          ) : trekBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 mb-4">No trek bookings yet.</p>
              <Link href="/treks" className="text-emerald-400 font-semibold hover:underline">Browse treks →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {trekBookings.map((b) => (
                <div key={b.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Link href={`/treks/${b.trek_slug}`} className="font-bold text-white hover:text-emerald-400 transition-colors truncate">{b.trek_name}</Link>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[b.status]}`}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                      <span>Date: {new Date(b.trek_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span>Group: {b.group_size}</span>
                      <span>Booked: {new Date(b.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                    {b.message && <p className="text-white/40 text-sm mt-2 truncate">{b.message}</p>}
                  </div>
                  <Link href={`/treks/${b.trek_slug}`} className="text-emerald-400 text-sm font-medium hover:underline whitespace-nowrap">View Trek →</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Bookings */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Activity Bookings</h2>
          {loadingBookings ? (
            <p className="text-white/40 text-center py-8">Loading…</p>
          ) : activityBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 mb-4">No activity bookings yet.</p>
              <Link href="/activities" className="text-emerald-400 font-semibold hover:underline">Browse activities →</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activityBookings.map((b) => (
                <div key={b.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-white truncate">{b.activity_name}</span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700">{b.activity_type}</span>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[b.status]}`}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                      <span>Date: {new Date(b.activity_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
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
