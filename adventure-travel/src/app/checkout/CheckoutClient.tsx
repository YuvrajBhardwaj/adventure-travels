"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CalendarDays, Loader2, Lock, Smartphone, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { claimBookings, type BookingStatus, type PaymentKind, type PaymentState } from "@/lib/auth";
import { treks, pricePerPerson } from "@/data/treks";
import { courses } from "@/data/courses";
import { formatPaise } from "@/lib/utils";
import { advanceAmount, balanceDueDate, isAdvanceAllowed } from "@/lib/paymentRules";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeScope } from "@/components/ui/theme-scope";
import { PaymentStatus, type PaymentPhase } from "@/components/checkout/PaymentStatus";
import { TrustSection } from "@/components/checkout/TrustSection";
import { PaymentChoice, type PaymentChoiceValue } from "@/components/PaymentChoice";

/* ─── Razorpay Checkout (loaded from their CDN, see loadRazorpay) ─── */
interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayFailure {
  error?: { description?: string; reason?: string };
}
interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", cb: (r: RazorpayFailure) => void): void;
}
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-razorpay]");
    const script =
      existing ??
      Object.assign(document.createElement("script"), {
        src: "https://checkout.razorpay.com/v1/checkout.js",
        async: true,
      });
    script.dataset.razorpay = "1";
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Couldn't load the payment window. Check your connection.")));
    if (!existing) document.body.appendChild(script);
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

type Phase =
  | "loading"
  | "ready"
  | "creating"
  | "awaiting" // Razorpay window is open
  | PaymentPhase
  | "closed" // cancelled or refunded: nothing to pay
  | "unavailable"
  | "notfound";

const WHATSAPP = "https://wa.me/917817912062";

/** One shape for trek and course bookings. Amounts are paise. */
interface Payable {
  type: "trek" | "course";
  id: string;
  title: string;
  startDate: string;
  persons: number | null;
  image?: string;
  /** Locked when booked. Null = a quote is needed. */
  total: number | null;
  amountPaid: number;
  paymentState: PaymentState;
  status: BookingStatus;
  balanceDueDate: string | null;
}

function toPayable(type: "trek" | "course", row: Record<string, unknown>): Payable {
  const base = {
    type,
    id: row.id as string,
    amountPaid: Number(row.amount_paid ?? 0),
    paymentState: ((row.payment_state as PaymentState | undefined) ?? "unpaid") as PaymentState,
    status: row.status as BookingStatus,
    balanceDueDate: (row.balance_due_date as string | null | undefined) ?? null,
  };
  if (type === "course") {
    const course = courses.find((c) => c.slug === row.course_slug);
    return {
      ...base,
      title: `${row.course_name}${row.package_name ? ` · ${row.package_name}` : ""}`,
      startDate: row.preferred_date as string,
      persons: Number(row.group_size),
      image: course?.image,
      total: (row.amount as number | null) ?? null,
    };
  }
  const trek = treks.find((t) => t.slug === row.trek_slug);
  const groupSize = String(row.group_size ?? "").trim();
  const persons = /^\d+$/.test(groupSize) ? Number(groupSize) : null;
  // Bookings made before prices were locked at booking time have no amount yet; the server
  // prices them from the catalog on the first payment, so show the same estimate here.
  const unit = trek ? pricePerPerson(trek, row.room_sharing as string | null | undefined) : undefined;
  const legacy = row.amount == null && !row.quote_required && unit && persons && persons <= 10 ? unit * persons * 100 : null;
  return {
    ...base,
    title: `${row.trek_name}${row.room_sharing ? ` · ${row.room_sharing}` : ""}`,
    startDate: row.trek_date as string,
    persons,
    image: trek?.image,
    total: (row.amount as number | null) ?? legacy,
  };
}

/** Where the booking stands after a payment, read from the booking row itself. */
function describePaid(p: Payable) {
  return p.paymentState === "advance_paid" && p.total !== null
    ? `Advance received. The balance of ${formatPaise(p.total - p.amountPaid)} is due by ${longDate(p.balanceDueDate ?? balanceDueDate(p.startDate))}.`
    : "Paid in full. See you in the mountains!";
}

export default function CheckoutClient() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { converted, currency: displayCurrency } = useCurrency();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking"); // trek booking
  const courseId = searchParams.get("course"); // course booking
  const kindParam = searchParams.get("kind"); // "balance" from reminder emails, or a preselected choice
  const { user, loading: authLoading } = useAuth();

  const [payable, setPayable] = useState<Payable | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [choice, setChoice] = useState<PaymentChoiceValue>("full");
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [successDetail, setSuccessDetail] = useState<string | null>(null);

  const loadPayable = useCallback(async (): Promise<Payable | null> => {
    const supabase = createClient();
    if (!supabase) return null;
    const table = courseId ? "course_bookings" : "trek_bookings";
    const { data } = await supabase.from(table).select("*").eq("id", courseId ?? bookingId).maybeSingle();
    return data ? toPayable(courseId ? "course" : "trek", data) : null;
  }, [bookingId, courseId]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  // Load the booking (RLS guarantees it's the signed-in user's).
  useEffect(() => {
    if (authLoading || !user) return;
    const supabase = createClient();
    if (!isSupabaseConfigured || !supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("unavailable");
      return;
    }
    if (!bookingId && !courseId) {
      setPhase("notfound");
      return;
    }
    let cancelled = false;
    (async () => {
      // A course booked while signed out becomes ours once the verified email matches.
      if (courseId) await claimBookings().catch(() => {});
      const p = await loadPayable();
      if (cancelled) return;
      if (!p) {
        setPhase("notfound");
        return;
      }
      setPayable(p);
      if (p.paymentState === "fully_paid") {
        setSuccessDetail("This booking is paid in full. See you in the mountains!");
        setPhase("success");
      } else if (p.status === "cancelled" || p.paymentState === "refunded") {
        setPhase("closed");
      } else {
        const advanceOk = p.total !== null && isAdvanceAllowed(p.startDate, p.amountPaid);
        setChoice(kindParam === "full" || !advanceOk ? "full" : "advance");
        setPhase("ready");
        void loadRazorpay().catch(() => {}); // warm up so the first click is instant
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, bookingId, courseId, kindParam, loadPayable]);

  // What this payment is, and how much it charges now.
  const plan = useMemo(() => {
    if (!payable || payable.total === null) return null;
    const total = payable.total;
    const advanceAllowed = isAdvanceAllowed(payable.startDate, payable.amountPaid);
    const kind: PaymentKind = payable.paymentState === "advance_paid" ? "balance" : choice === "advance" && advanceAllowed ? "advance" : "full";
    const now = kind === "advance" ? advanceAmount(total) : total - payable.amountPaid;
    return { total, kind, now, advanceAllowed, advance: advanceAmount(total), dueDate: balanceDueDate(payable.startDate) };
  }, [payable, choice]);

  const accessToken = async () => {
    const supabase = createClient();
    const { data } = await supabase!.auth.getSession();
    return data.session?.access_token ?? "";
  };

  const confirmPayment = useCallback(
    async (resp: RazorpaySuccess, paidBefore: number) => {
      setPhase("processing");
      const startedAt = Date.now();
      try {
        await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await accessToken()}` },
          body: JSON.stringify(resp),
        });
      } catch {
        /* network blip — the webhook still confirms it; we watch the booking below */
      }
      // The booking's payment state is the truth, whichever of verify-payment or the webhook applied it.
      let latest: Payable | null = null;
      for (let i = 0; i < 8; i++) {
        latest = await loadPayable();
        if (latest && latest.amountPaid > paidBefore) break;
        await sleep(2500);
      }
      // Keep the spinner up long enough to read as a deliberate step, not a flicker.
      await sleep(Math.max(0, 900 - (Date.now() - startedAt)));
      if (latest && latest.amountPaid > paidBefore) {
        setPayable(latest);
        setSuccessDetail(describePaid(latest));
        setPhase("success");
      } else {
        setPhase("pending");
      }
    },
    [loadPayable]
  );

  const startPayment = async () => {
    if (!payable || !plan) return;
    setError(null);
    setPhase("creating");
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await accessToken()}` },
        body: JSON.stringify({ bookingType: payable.type, bookingId: payable.id, kind: plan.kind }),
      });
      const order = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(order.error || "We couldn't start the payment. Please try again.");
      await loadRazorpay();

      const paidBefore = payable.amountPaid;
      const rzp = new window.Razorpay!({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Himalayan Arc Adventure",
        description: order.description,
        image: `${window.location.origin}/favicon.png`,
        prefill: order.prefill,
        theme: { color: "#059669" },
        // UPI first (PhonePe, GPay, Paytm, BHIM…), other methods stay available below it.
        config: {
          display: {
            blocks: { upi: { name: "Pay using UPI", instruments: [{ method: "upi" }] } },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: true },
          },
        },
        modal: { ondismiss: () => setPhase((p) => (p === "awaiting" ? "ready" : p)) },
        handler: (resp: RazorpaySuccess) => void confirmPayment(resp, paidBefore),
      });
      rzp.on("payment.failed", (r) => {
        setFailure(r.error?.description || r.error?.reason || null);
        setPhase("failed");
      });
      setPhase("awaiting");
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setPhase("ready");
    }
  };

  const showStatus = phase === "processing" || phase === "success" || phase === "failed" || phase === "pending";
  const busy = phase === "creating" || phase === "awaiting";

  return (
    <ThemeScope>
      {/* soft background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-96 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
      </div>

      <main className="relative mx-auto max-w-lg px-4 pb-16 pt-28">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          My bookings
        </Link>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="overflow-hidden border-white/60 bg-white/80 shadow-xl shadow-emerald-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/30">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-slate-200/70 pb-4 dark:border-white/10">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                Secure checkout
              </CardTitle>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Powered by Razorpay</span>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {phase === "loading" && (
                <div className="space-y-4" aria-busy aria-label="Loading checkout">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              )}

              {(phase === "unavailable" || phase === "notfound" || phase === "closed") && (
                <div className="space-y-4 py-4 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {phase === "unavailable"
                      ? "Online payments aren't available right now."
                      : phase === "notfound"
                        ? "We couldn't find that booking."
                        : payable?.paymentState === "refunded"
                          ? "This booking was refunded, so there's nothing to pay."
                          : "This booking was cancelled, so there's nothing to pay."}
                  </p>
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
                    {phase === "closed" ? "Questions? Message us on WhatsApp" : "Pay via WhatsApp instead"}
                  </a>
                </div>
              )}

              {payable && (
                <div className="flex gap-4">
                  {payable.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={payable.image} alt="" loading="lazy" decoding="async" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-heading text-base font-bold">{payable.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
                      {longDate(payable.startDate)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Users className="h-4 w-4 shrink-0" aria-hidden />
                      {payable.persons ?? "—"} {payable.persons === 1 ? "person" : "persons"}
                    </p>
                  </div>
                </div>
              )}

              <AnimatePresence mode="wait" initial={false}>
                {showStatus ? (
                  <motion.div
                    key="status"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0 }}
                  >
                    <PaymentStatus
                      phase={phase as PaymentPhase}
                      detail={phase === "success" ? successDetail : phase === "failed" ? failure : undefined}
                      onRetry={() => {
                        setFailure(null);
                        setPhase("ready");
                      }}
                    />
                    {(phase === "success" || phase === "pending") && (
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <Link href="/dashboard" className={buttonVariants({ className: "flex-1" })}>
                          View my bookings
                        </Link>
                        <Link href="/treks" className={buttonVariants({ variant: "outline", className: "flex-1" })}>
                          Explore more treks
                        </Link>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  (phase === "ready" || busy) &&
                  payable && (
                    <motion.div
                      key="pay"
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                      className="space-y-6"
                    >
                      {plan ? (
                        <>
                          <dl className="space-y-2 rounded-xl bg-slate-100/70 p-4 text-sm dark:bg-white/5">
                            {payable.persons ? (
                              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <dt>
                                  {formatPaise(plan.total / payable.persons)} × {payable.persons} {payable.persons === 1 ? "person" : "persons"}
                                </dt>
                                <dd>{formatPaise(plan.total)}</dd>
                              </div>
                            ) : null}
                            {payable.amountPaid > 0 && (
                              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <dt>Advance paid</dt>
                                <dd>− {formatPaise(payable.amountPaid)}</dd>
                              </div>
                            )}
                            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold dark:border-white/10">
                              <dt>{plan.kind === "balance" ? "Balance to pay" : "Total"}</dt>
                              <dd>{formatPaise(plan.total - payable.amountPaid)}</dd>
                            </div>
                          </dl>

                          {plan.kind === "balance" ? (
                            <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
                              Pay the balance of {formatPaise(plan.now)}
                              {payable.balanceDueDate ? ` by ${longDate(payable.balanceDueDate)}` : ""} to complete your booking.
                            </p>
                          ) : (
                            <PaymentChoice
                              total={plan.total}
                              advance={plan.advance}
                              advanceAllowed={plan.advanceAllowed}
                              balanceDueDate={plan.dueDate}
                              value={plan.kind === "advance" ? "advance" : "full"}
                              onChange={setChoice}
                              noun={payable.type}
                            />
                          )}

                          {converted && (
                            <p className="text-xs leading-snug text-slate-500 dark:text-slate-400">
                              The rest of the site shows estimates in {displayCurrency}. This is the exact amount you&apos;re
                              charged, in INR — your card issuer converts it at their own rate.
                            </p>
                          )}

                          {error && (
                            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-400/10 dark:text-red-300">
                              {error}
                            </p>
                          )}

                          <Button size="lg" className="w-full" onClick={() => void startPayment()} disabled={busy}>
                            {phase === "creating" ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden />
                                Preparing secure payment…
                              </>
                            ) : phase === "awaiting" ? (
                              "Complete payment in the Razorpay window"
                            ) : (
                              <>
                                <Smartphone className="h-5 w-5" aria-hidden />
                                Pay {formatPaise(plan.now)} with UPI
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-3 text-center text-sm text-slate-600 dark:text-slate-300">
                          <p>This booking is priced individually — we&apos;ll send you a quote.</p>
                          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
                            Get a group quote on WhatsApp
                          </a>
                        </div>
                      )}
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              <TrustSection />

              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                By paying you agree to our{" "}
                <Link href="/cancellation-policy" className="underline underline-offset-2 hover:text-slate-900 dark:hover:text-white">
                  cancellation policy
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </ThemeScope>
  );
}
