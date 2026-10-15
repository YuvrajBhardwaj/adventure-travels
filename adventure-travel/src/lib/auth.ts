import { createClient } from "@/lib/supabase/client";
import { trackActivity } from "@/lib/activity";

// Accounts and bookings live only in Supabase. There is deliberately no browser-storage
// fallback any more: it looked like it worked while silently losing data and keeping
// readable passwords in the browser (specs/001-persistent-backend, FR-061 / research R10).

/** Thrown whenever the backend isn't reachable/configured, so callers can offer WhatsApp instead. */
export class BackendUnavailableError extends Error {
  constructor(message = "Accounts are temporarily unavailable. Please contact us on WhatsApp.") {
    super(message);
    this.name = "BackendUnavailableError";
  }
}

function requireClient() {
  const supabase = createClient();
  if (!supabase) throw new BackendUnavailableError();
  return supabase;
}

export interface SafeUser {
  id: string;
  email: string;
  user_metadata: { full_name: string; phone: string };
  /** Server-controlled (unlike user_metadata). */
  app_metadata?: { role?: string };
}

export type PaymentState = "unpaid" | "advance_paid" | "fully_paid" | "refunded";
export type BookingStatus = "pending" | "confirmed" | "cancelled";

// ─── Auth ───
export async function signUp(name: string, email: string, phone: string, password: string) {
  const supabase = requireClient();
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

export async function signIn(email: string, password: string) {
  const supabase = requireClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  trackActivity("LOGIN", { method: "password" });
  return data.user as SafeUser;
}

// Redirects the browser to Google, then back to /dashboard with a session. New Google
// users get a profile row (and a SIGNUP activity entry) from the database triggers.
export async function signInWithGoogle() {
  const supabase = requireClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
  if (error) throw error;
}

export async function resendSignupConfirmation(email: string) {
  const supabase = requireClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
    options: { emailRedirectTo: `${window.location.origin}/login` },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = createClient();
  if (supabase) await supabase.auth.signOut();
}

export async function getSession(): Promise<SafeUser | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return (session?.user as SafeUser) ?? null;
}

export function onAuthStateChange(callback: (user: SafeUser | null) => void) {
  const supabase = createClient();
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange((_event: string, session: { user: SafeUser } | null) => {
    callback(session?.user ?? null);
  });
}

// ─── Trek Bookings ───
export interface TrekBooking {
  id: string; user_id: string; trek_name: string; trek_slug: string;
  trek_date: string; group_size: string; message: string;
  /** Room tier label from `Trek.roomSharing`; undefined when the column isn't in the database yet. */
  room_sharing?: string | null;
  /** Paise, locked when the booking is made; null means a quote is required. */
  amount?: number | null;
  quote_required?: boolean;
  amount_paid?: number;
  payment_state?: PaymentState;
  balance_due_date?: string | null;
  status: BookingStatus; created_at: string;
}

export async function getTrekBookings(userId: string): Promise<TrekBooking[]> {
  const supabase = requireClient();
  const { data, error } = await supabase.from("trek_bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** What /api/bookings returns (specs/001-persistent-backend/contracts/http-api.md). Amounts in paise. */
export interface CreatedBooking {
  bookingId: string;
  type: "trek" | "course";
  amount: number | null;
  quoteRequired: boolean;
  advanceAllowed: boolean;
  advanceAmount: number | null;
  emailQueued: boolean;
}

/**
 * Trek bookings are created by the server, which locks the price from the catalog
 * (FR-016) and logs the booking. The browser can no longer insert them directly.
 */
export async function createTrekBooking(input: {
  trekSlug: string;
  date: string;
  groupSize: string;
  roomSharing?: string;
  message?: string;
}): Promise<CreatedBooking> {
  const supabase = requireClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in to book a trek.");

  let res: Response;
  try {
    res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        type: "trek",
        slug: input.trekSlug,
        date: input.date,
        groupSize: input.groupSize === "10+" ? "10+" : Number(input.groupSize),
        roomSharing: input.roomSharing || undefined,
        message: input.message || "",
      }),
    });
  } catch {
    throw new BackendUnavailableError();
  }
  const json = await res.json().catch(() => ({}));
  if (res.status === 503) throw new BackendUnavailableError(json.error);
  if (!res.ok) throw new Error(json.error || "We couldn't save your booking. Please try again.");
  return json as CreatedBooking;
}

// ─── Activity Bookings ───
export interface ActivityBooking {
  id: string; user_id: string; activity_name: string; activity_type: string;
  activity_date: string; group_size: string; message: string;
  status: BookingStatus; created_at: string;
}

export async function getActivityBookings(userId: string): Promise<ActivityBooking[]> {
  const supabase = requireClient();
  const { data, error } = await supabase.from("activity_bookings").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createActivityBooking(booking: Omit<ActivityBooking, "id" | "status" | "created_at">): Promise<ActivityBooking> {
  const supabase = requireClient();
  const { data, error } = await supabase.from("activity_bookings").insert(booking).select().single();
  if (error) throw error;
  return data;
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
  const supabase = requireClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export async function updateProfile(userId: string, changes: ProfileChanges): Promise<Profile | null> {
  const supabase = requireClient();
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

// ─── Course bookings (stored server-side by the bookings API) ───
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
  quote_required?: boolean;
  amount_paid?: number;
  payment_state?: PaymentState;
  balance_due_date?: string | null;
  status: BookingStatus;
  created_at: string;
}

export async function getCourseBookings(userId: string): Promise<CourseBooking[]> {
  const supabase = requireClient();
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
  const supabase = requireClient();
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

/** Cancels the user's own booking while it is still pending and unpaid (enforced by RLS). */
export async function cancelTrekBooking(bookingId: string) {
  const supabase = requireClient();
  const { error } = await supabase.from("trek_bookings").update({ status: "cancelled" }).eq("id", bookingId);
  if (error) throw error;
}
