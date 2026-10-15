import { createClient } from "@/lib/supabase/client";
import { BackendUnavailableError, type BookingStatus, type PaymentState } from "@/lib/auth";
import { istToday, isOverdue } from "@/lib/paymentRules";

// Admin reads and writes go straight to Supabase with the admin's own session. RLS is the
// real gate (public.is_admin()); the admin pages only hide what a non-admin couldn't load
// anyway (specs/001-persistent-backend/contracts/data-access.md).

export type BookingType = "trek" | "course" | "activity";
export type PaymentKind = "advance" | "balance" | "full";

export interface AdminBooking {
  type: BookingType;
  id: string;
  /** First 8 characters of the id, upper-cased — what customers see in emails. */
  ref: string;
  userId: string | null;
  customer: { name: string; email: string; phone: string };
  item: string;
  /** Room tier, course package and stay, or activity type. */
  option: string;
  startDate: string;
  groupSize: string;
  /** Paise. Null for activities (never priced) and quote requests. */
  amount: number | null;
  amountPaid: number;
  /** Null for activities, which are never paid online. */
  paymentState: PaymentState | null;
  balanceDueDate: string | null;
  quoteRequired: boolean;
  status: BookingStatus;
  message: string;
  createdAt: string;
  overdue: boolean;
}

export interface BookingFilters {
  type?: BookingType;
  status?: BookingStatus;
  paymentState?: PaymentState;
  /** Start date range, inclusive (YYYY-MM-DD). */
  from?: string;
  to?: string;
  q?: string;
  overdueOnly?: boolean;
}

export interface AdminPayment {
  id: string;
  userId: string | null;
  bookingType: "trek" | "course";
  bookingId: string | null;
  bookingRef: string;
  item: string;
  customer: string;
  orderId: string;
  paymentId: string | null;
  amount: number;
  kind: PaymentKind;
  method: string | null;
  status: "created" | "paid" | "failed";
  failureReason: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface PaymentFilters {
  status?: AdminPayment["status"];
  kind?: PaymentKind;
  q?: string;
}

export interface AdminCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface FailedNotification {
  id: string;
  kind: string;
  recipient: string;
  subject: string;
  attempts: number;
  lastError: string | null;
  bookingType: string | null;
  bookingId: string | null;
  createdAt: string;
}

export interface BookingEvent {
  id: string;
  fromStatus: string | null;
  toStatus: string | null;
  fromPaymentState: string | null;
  toPaymentState: string | null;
  changedBy: string | null;
  changedByName: string | null;
  note: string;
  createdAt: string;
}

const TABLE: Record<BookingType, string> = {
  trek: "trek_bookings",
  course: "course_bookings",
  activity: "activity_bookings",
};
const START_COLUMN: Record<BookingType, string> = {
  trek: "trek_date",
  course: "preferred_date",
  activity: "activity_date",
};
const LIMIT = 500;

type Row = Record<string, unknown>;

function db() {
  const supabase = createClient();
  if (!supabase) throw new BackendUnavailableError();
  return supabase;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const one = <T,>(v: T | T[] | null | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
export const bookingRef = (id: string) => id.slice(0, 8).toUpperCase();

/** Search across customer name, email, phone, the booking reference / id prefix and the item. */
export function matchesQuery(b: AdminBooking, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const digits = needle.replace(/\D/g, "");
  return (
    b.customer.name.toLowerCase().includes(needle) ||
    b.customer.email.toLowerCase().includes(needle) ||
    (digits.length >= 3 && b.customer.phone.replace(/\D/g, "").includes(digits)) ||
    b.id.toLowerCase().startsWith(needle) ||
    b.item.toLowerCase().includes(needle)
  );
}

export function filterBookings(rows: AdminBooking[], { q, overdueOnly }: Pick<BookingFilters, "q" | "overdueOnly">) {
  return rows.filter((b) => (!overdueOnly || b.overdue) && (!q || matchesQuery(b, q)));
}

interface ProfileLite {
  full_name: string;
  email: string | null;
  phone: string;
}

async function profilesById(ids: string[]): Promise<Map<string, ProfileLite>> {
  const map = new Map<string, ProfileLite>();
  const unique = [...new Set(ids.filter(Boolean))];
  // Chunked so the request URL stays short.
  for (let i = 0; i < unique.length; i += 100) {
    const { data, error } = await db()
      .from("profiles")
      .select("id,full_name,email,phone")
      .in("id", unique.slice(i, i + 100));
    if (error) throw error;
    for (const p of (data ?? []) as Row[]) map.set(p.id as string, p as unknown as ProfileLite);
  }
  return map;
}

function toAdminBooking(type: BookingType, r: Row, profiles: Map<string, ProfileLite>, today: string): AdminBooking {
  const userId = (r.user_id as string | null) ?? null;
  const p = userId ? profiles.get(userId) : undefined;
  const paymentState = type === "activity" ? null : ((r.payment_state as PaymentState | undefined) ?? "unpaid");
  const balanceDueDate = (r.balance_due_date as string | null | undefined) ?? null;
  const base = {
    type,
    id: r.id as string,
    ref: bookingRef(r.id as string),
    userId,
    startDate: str(r[START_COLUMN[type]]),
    groupSize: String(r.group_size ?? ""),
    amountPaid: Number(r.amount_paid ?? 0),
    paymentState,
    balanceDueDate,
    quoteRequired: Boolean(r.quote_required),
    status: r.status as BookingStatus,
    message: str(r.message),
    createdAt: str(r.created_at),
    overdue: isOverdue(paymentState, balanceDueDate, today),
  };
  if (type === "course") {
    return {
      ...base,
      // Course bookings carry their own contact details (they can be made signed out).
      customer: { name: str(r.contact_name), email: str(r.contact_email), phone: str(r.contact_phone) },
      item: str(r.course_name),
      option: [str(r.package_name), r.stay === "full" ? "with stay & meals" : r.stay === "base" ? "without stay" : ""].filter(Boolean).join(" · "),
      amount: (r.amount as number | null) ?? null,
    };
  }
  const customer = { name: p?.full_name ?? "", email: p?.email ?? "", phone: p?.phone ?? "" };
  if (type === "trek") {
    return { ...base, customer, item: str(r.trek_name), option: str(r.room_sharing), amount: (r.amount as number | null) ?? null };
  }
  return { ...base, customer, item: str(r.activity_name), option: str(r.activity_type), amount: null };
}

async function fetchBookings(type: BookingType, f: BookingFilters, extra?: { userId?: string }): Promise<Row[]> {
  // Activities are never paid, so a payment-state filter excludes them entirely.
  if (type === "activity" && f.paymentState) return [];
  let query = db().from(TABLE[type]).select("*").order("created_at", { ascending: false }).limit(LIMIT);
  if (f.status) query = query.eq("status", f.status);
  if (f.paymentState) query = query.eq("payment_state", f.paymentState);
  if (f.from) query = query.gte(START_COLUMN[type], f.from);
  if (f.to) query = query.lte(START_COLUMN[type], f.to);
  if (extra?.userId) query = query.eq("user_id", extra.userId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Row[];
}

async function loadBookings(f: BookingFilters, extra?: { userId?: string }): Promise<AdminBooking[]> {
  const types: BookingType[] = f.type ? [f.type] : ["trek", "course", "activity"];
  const rows = await Promise.all(types.map((t) => fetchBookings(t, f, extra)));
  const profiles = await profilesById(rows.flat().map((r) => (r.user_id as string | null) ?? ""));
  const today = istToday();
  return types
    .flatMap((t, i) => rows[i].map((r) => toAdminBooking(t, r, profiles, today)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Bookings of every type, newest first, filtered and searched (FR-041). */
export async function listBookings(f: BookingFilters = {}): Promise<AdminBooking[]> {
  return filterBookings(await loadBookings(f), f);
}

/** The database trigger records who changed it and when (booking_status_events, FR-042). */
export async function updateBookingStatus(type: BookingType, id: string, status: BookingStatus) {
  const { data, error } = await db().from(TABLE[type]).update({ status }).eq("id", id).select("id").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("That booking couldn't be updated. Check you're signed in as an admin.");
}

/** Records a refund made in the Razorpay dashboard. The money guard only lets admins set "refunded" (FR-028). */
export async function recordRefund(type: "trek" | "course", id: string) {
  const { data, error } = await db().from(TABLE[type]).update({ payment_state: "refunded" }).eq("id", id).select("id").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("That refund couldn't be recorded. Check you're signed in as an admin.");
}

function toCustomer(r: Row): AdminCustomer {
  return {
    id: r.id as string,
    fullName: str(r.full_name),
    email: str(r.email),
    phone: str(r.phone),
    city: str(r.city),
    emergencyContactName: str(r.emergency_contact_name),
    emergencyContactPhone: str(r.emergency_contact_phone),
    createdAt: str(r.created_at),
    deletedAt: (r.deleted_at as string | null) ?? null,
  };
}

export async function listCustomers(q = ""): Promise<AdminCustomer[]> {
  const { data, error } = await db().from("profiles").select("*").order("created_at", { ascending: false }).limit(1000);
  if (error) throw error;
  const needle = q.trim().toLowerCase();
  const digits = needle.replace(/\D/g, "");
  return ((data ?? []) as Row[]).map(toCustomer).filter(
    (c) =>
      !needle ||
      c.fullName.toLowerCase().includes(needle) ||
      c.email.toLowerCase().includes(needle) ||
      (digits.length >= 3 && c.phone.replace(/\D/g, "").includes(digits)) ||
      c.city.toLowerCase().includes(needle)
  );
}

const PAYMENT_SELECT =
  "id,user_id,booking_id,course_booking_id,razorpay_order_id,razorpay_payment_id,amount,kind,method,status,failure_reason,created_at,paid_at," +
  "trek_bookings(trek_name),course_bookings(course_name,contact_name),profiles(full_name,email)";

function toPayment(r: Row): AdminPayment {
  const trek = one(r.trek_bookings as { trek_name: string } | null);
  const course = one(r.course_bookings as { course_name: string; contact_name: string } | null);
  const profile = one(r.profiles as { full_name: string; email: string | null } | null);
  const bookingId = (r.course_booking_id as string | null) ?? (r.booking_id as string | null) ?? null;
  return {
    id: r.id as string,
    userId: (r.user_id as string | null) ?? null,
    bookingType: r.course_booking_id ? "course" : "trek",
    bookingId,
    bookingRef: bookingId ? bookingRef(bookingId) : "—",
    item: trek?.trek_name ?? course?.course_name ?? "Booking",
    customer: profile?.full_name || course?.contact_name || profile?.email || "Deleted user",
    orderId: str(r.razorpay_order_id),
    paymentId: (r.razorpay_payment_id as string | null) ?? null,
    amount: Number(r.amount),
    kind: ((r.kind as PaymentKind | undefined) ?? "full"),
    method: (r.method as string | null) ?? null,
    status: r.status as AdminPayment["status"],
    failureReason: (r.failure_reason as string | null) ?? null,
    createdAt: str(r.created_at),
    paidAt: (r.paid_at as string | null) ?? null,
  };
}

export async function listPayments(f: PaymentFilters = {}, extra?: { userId?: string }): Promise<AdminPayment[]> {
  let query = db().from("payments").select(PAYMENT_SELECT).order("created_at", { ascending: false }).limit(LIMIT);
  if (f.status) query = query.eq("status", f.status);
  if (f.kind) query = query.eq("kind", f.kind);
  if (extra?.userId) query = query.eq("user_id", extra.userId);
  const { data, error } = await query;
  if (error) throw error;
  const needle = (f.q ?? "").trim().toLowerCase();
  return ((data ?? []) as Row[]).map(toPayment).filter(
    (p) =>
      !needle ||
      p.customer.toLowerCase().includes(needle) ||
      p.item.toLowerCase().includes(needle) ||
      p.orderId.toLowerCase().includes(needle) ||
      (p.paymentId ?? "").toLowerCase().includes(needle) ||
      (p.bookingId ?? "").toLowerCase().startsWith(needle)
  );
}

/** A customer's profile with everything they've booked and paid. */
export async function getCustomer(id: string) {
  const { data, error } = await db().from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [bookings, payments] = await Promise.all([loadBookings({}, { userId: id }), listPayments({}, { userId: id })]);
  return { profile: toCustomer(data as Row), bookings, payments };
}

/** Emails the outbox gave up on, or is still retrying (FR-032). */
export async function listFailedNotifications(): Promise<FailedNotification[]> {
  const { data, error } = await db()
    .from("notifications")
    .select("id,kind,recipient,subject,attempts,last_error,booking_type,booking_id,created_at")
    .eq("status", "failed")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return ((data ?? []) as Row[]).map((r) => ({
    id: r.id as string,
    kind: str(r.kind),
    recipient: str(r.recipient),
    subject: str(r.subject),
    attempts: Number(r.attempts ?? 0),
    lastError: (r.last_error as string | null) ?? null,
    bookingType: (r.booking_type as string | null) ?? null,
    bookingId: (r.booking_id as string | null) ?? null,
    createdAt: str(r.created_at),
  }));
}

/** Who changed a booking's status or payment state, and when (written by a database trigger). */
export async function getBookingEvents(type: BookingType, id: string): Promise<BookingEvent[]> {
  const { data, error } = await db()
    .from("booking_status_events")
    .select("*")
    .eq("booking_type", type)
    .eq("booking_id", id)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as Row[];
  const names = await profilesById(rows.map((r) => (r.changed_by as string | null) ?? ""));
  return rows.map((r) => {
    const by = (r.changed_by as string | null) ?? null;
    return {
      id: r.id as string,
      fromStatus: (r.from_status as string | null) ?? null,
      toStatus: (r.to_status as string | null) ?? null,
      fromPaymentState: (r.from_payment_state as string | null) ?? null,
      toPaymentState: (r.to_payment_state as string | null) ?? null,
      changedBy: by,
      changedByName: by ? names.get(by)?.full_name || names.get(by)?.email || null : null,
      note: str(r.note),
      createdAt: str(r.created_at),
    };
  });
}
