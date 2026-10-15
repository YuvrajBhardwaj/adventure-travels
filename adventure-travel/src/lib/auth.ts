import { createClient } from "@/lib/supabase/client";
import { trackActivity } from "@/lib/activity";

// ─── LocalStorage helpers (fallback when Supabase isn't configured) ───
const LS_USERS = "eht_users";
const LS_SESSION = "eht_session";
const LS_TREK_BOOKINGS = "eht_trek_bookings";
const LS_ACT_BOOKINGS = "eht_activity_bookings";

function lsRead<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function lsWrite<T>(key: string, data: T[]) { localStorage.setItem(key, JSON.stringify(data)); }

export interface SafeUser {
  id: string;
  email: string;
  user_metadata: { full_name: string; phone: string };
  /** Server-controlled (unlike user_metadata). Only present with Supabase auth. */
  app_metadata?: { role?: string };
}

// ─── Auth ───
export async function signUp(name: string, email: string, phone: string, password: string) {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name, phone },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) throw error;
    if (!data.user) throw new Error("Could not create your account.");
    return { user: data.user as SafeUser, needsEmailConfirmation: !data.session };
  }
  // localStorage fallback
  const users = lsRead<{ id: string; email: string; password: string; full_name: string; phone: string }>(LS_USERS);
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) throw new Error("Email already registered.");
  const user = { id: crypto.randomUUID(), email, password, full_name: name, phone };
  users.push(user);
  lsWrite(LS_USERS, users);
  const safe: SafeUser = { id: user.id, email: user.email, user_metadata: { full_name: name, phone } };
  localStorage.setItem(LS_SESSION, JSON.stringify(safe));
  return { user: safe, needsEmailConfirmation: false };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    trackActivity("LOGIN", { method: "password" });
    return data.user as SafeUser;
  }
  const users = lsRead<{ id: string; email: string; password: string; full_name: string; phone: string }>(LS_USERS);
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!found) throw new Error("Invalid email or password.");
  const safe: SafeUser = { id: found.id, email: found.email, user_metadata: { full_name: found.full_name, phone: found.phone } };
  localStorage.setItem(LS_SESSION, JSON.stringify(safe));
  return safe;
}

// Redirects the browser to Google, then back to /dashboard with a session. New Google
// users get a profile row (and a SIGNUP activity entry) from the database triggers.
export async function signInWithGoogle() {
  const supabase = createClient();
  if (!supabase) throw new Error("Google sign-in isn't available yet.");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
  if (error) throw error;
}

export async function resendSignupConfirmation(email: string) {
  const supabase = createClient();
  if (!supabase) throw new Error("Email confirmation is unavailable in local account mode.");

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
    options: { emailRedirectTo: `${window.location.origin}/login` },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = createClient();
  if (supabase) { await supabase.auth.signOut(); return; }
  localStorage.removeItem(LS_SESSION);
}

export async function getSession(): Promise<SafeUser | null> {
  const supabase = createClient();
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    return (session?.user as SafeUser) ?? null;
  }
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(LS_SESSION) || "null"); } catch { return null; }
}

export function onAuthStateChange(callback: (user: SafeUser | null) => void) {
  const supabase = createClient();
  if (supabase) {
    return supabase.auth.onAuthStateChange((_event: string, session: { user: SafeUser } | null) => { callback(session?.user ?? null); });
  }
  // No-op subscription for localStorage mode
  return { data: { subscription: { unsubscribe: () => {} } } };
}

// ─── Trek Bookings ───
export interface TrekBooking {
  id: string; user_id: string; trek_name: string; trek_slug: string;
  trek_date: string; group_size: string; message: string;
  status: "pending" | "confirmed" | "cancelled"; created_at: string;
}

export async function getTrekBookings(userId: string): Promise<TrekBooking[]> {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase.from("trek_bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  return lsRead<TrekBooking>(LS_TREK_BOOKINGS).filter((b) => b.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createTrekBooking(booking: Omit<TrekBooking, "id" | "status" | "created_at">): Promise<TrekBooking> {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase.from("trek_bookings").insert(booking).select().single();
    if (error) throw error;
    trackActivity("BOOKING_CREATED", {
      booking_id: data.id,
      trek_name: booking.trek_name,
      trek_date: booking.trek_date,
      group_size: booking.group_size,
    });
    return data;
  }
  const b: TrekBooking = { ...booking, id: crypto.randomUUID(), status: "pending", created_at: new Date().toISOString() };
  const all = lsRead<TrekBooking>(LS_TREK_BOOKINGS); all.push(b); lsWrite(LS_TREK_BOOKINGS, all);
  return b;
}

// ─── Activity Bookings ───
export interface ActivityBooking {
  id: string; user_id: string; activity_name: string; activity_type: string;
  activity_date: string; group_size: string; message: string;
  status: "pending" | "confirmed" | "cancelled"; created_at: string;
}

export async function getActivityBookings(userId: string): Promise<ActivityBooking[]> {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase.from("activity_bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  return lsRead<ActivityBooking>(LS_ACT_BOOKINGS).filter((b) => b.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function createActivityBooking(booking: Omit<ActivityBooking, "id" | "status" | "created_at">): Promise<ActivityBooking> {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase.from("activity_bookings").insert(booking).select().single();
    if (error) throw error;
    return data;
  }
  const b: ActivityBooking = { ...booking, id: crypto.randomUUID(), status: "pending", created_at: new Date().toISOString() };
  const all = lsRead<ActivityBooking>(LS_ACT_BOOKINGS); all.push(b); lsWrite(LS_ACT_BOOKINGS, all);
  return b;
}

// ─── Profile ───
export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  city: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

export type ProfileChanges = Partial<
  Pick<Profile, "full_name" | "phone" | "city" | "emergency_contact_name" | "emergency_contact_phone">
>;

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return (data as Profile | null) ?? null;
  }
  const found = lsRead<{ id: string; email: string; full_name: string; phone: string }>(LS_USERS).find((u) => u.id === userId);
  return found
    ? { id: found.id, full_name: found.full_name, phone: found.phone, email: found.email, city: "", emergency_contact_name: "", emergency_contact_phone: "" }
    : null;
}

export async function updateProfile(userId: string, changes: ProfileChanges): Promise<Profile | null> {
  const supabase = createClient();
  if (supabase) {
    const { data, error } = await supabase.from("profiles").update(changes).eq("id", userId).select().single();
    if (error) throw error;
    // Keep the session's own copy in step so the rest of the site shows the new name/phone.
    if (changes.full_name !== undefined || changes.phone !== undefined) {
      await supabase.auth.updateUser({
        data: {
          ...(changes.full_name !== undefined && { full_name: changes.full_name }),
          ...(changes.phone !== undefined && { phone: changes.phone }),
        },
      });
    }
    trackActivity("SETTINGS_UPDATE", { fields: Object.keys(changes) });
    return data as Profile;
  }
  const users = lsRead<{ id: string; email: string; password: string; full_name: string; phone: string }>(LS_USERS);
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  users[idx] = {
    ...users[idx],
    ...(changes.full_name !== undefined && { full_name: changes.full_name }),
    ...(changes.phone !== undefined && { phone: changes.phone }),
  };
  lsWrite(LS_USERS, users);
  return getProfile(userId);
}

// ─── Course bookings (stored server-side by /api/course-bookings) ───
export interface CourseBooking {
  id: string;
  course_slug: string;
  course_name: string;
  course_type: string;
  package_name: string;
  stay: "" | "base" | "full";
  preferred_date: string;
  group_size: number;
  /** Paise, priced on the server. */
  amount: number | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

export async function getCourseBookings(userId: string): Promise<CourseBooking[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("course_bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CourseBooking[];
}

// ─── Payments ───
export interface PaymentRecord {
  id: string;
  amount: number; // paise
  currency: string;
  status: "created" | "paid" | "failed";
  method: string | null;
  created_at: string;
  paid_at: string | null;
  booking_id: string | null;
  course_booking_id: string | null;
  /** Human label for the booking this payment is for. */
  for_label: string;
}

export async function getPayments(userId: string): Promise<PaymentRecord[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("payments")
    .select("id,amount,currency,status,method,created_at,paid_at,booking_id,course_booking_id,trek_bookings(trek_name),course_bookings(course_name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const one = <T,>(v: T | T[] | null | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
  return (data ?? []).map((row: Record<string, unknown>) => {
    const trek = one(row.trek_bookings as { trek_name: string } | { trek_name: string }[] | null);
    const course = one(row.course_bookings as { course_name: string } | { course_name: string }[] | null);
    return {
      id: row.id as string,
      amount: row.amount as number,
      currency: row.currency as string,
      status: row.status as PaymentRecord["status"],
      method: (row.method as string | null) ?? null,
      created_at: row.created_at as string,
      paid_at: (row.paid_at as string | null) ?? null,
      booking_id: (row.booking_id as string | null) ?? null,
      course_booking_id: (row.course_booking_id as string | null) ?? null,
      for_label: trek?.trek_name ?? course?.course_name ?? "Booking",
    };
  });
}

/** Cancels the user's own booking while it is still pending (enforced by RLS). */
export async function cancelTrekBooking(bookingId: string) {
  const supabase = createClient();
  if (!supabase) {
    const all = lsRead<TrekBooking>(LS_TREK_BOOKINGS);
    const idx = all.findIndex((b) => b.id === bookingId);
    if (idx !== -1) { all[idx] = { ...all[idx], status: "cancelled" }; lsWrite(LS_TREK_BOOKINGS, all); }
    return;
  }
  const { error } = await supabase.from("trek_bookings").update({ status: "cancelled" }).eq("id", bookingId);
  if (error) throw error;
}
