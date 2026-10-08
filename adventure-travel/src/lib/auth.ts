import { createClient } from "@/lib/supabase/client";

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
    return data.user as SafeUser;
  }
  const users = lsRead<{ id: string; email: string; password: string; full_name: string; phone: string }>(LS_USERS);
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!found) throw new Error("Invalid email or password.");
  const safe: SafeUser = { id: found.id, email: found.email, user_metadata: { full_name: found.full_name, phone: found.phone } };
  localStorage.setItem(LS_SESSION, JSON.stringify(safe));
  return safe;
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
