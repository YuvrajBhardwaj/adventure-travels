"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CalendarDays, Loader2, Lock, Smartphone, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { TrekBooking, CourseBooking } from "@/lib/auth";
import { treks, pricePerPerson } from "@/data/treks";
import { courses } from "@/data/courses";
import { formatPaise } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeScope } from "@/components/ui/theme-scope";
import { PaymentStatus, type PaymentPhase } from "@/components/checkout/PaymentStatus";
import { TrustSection } from "@/components/checkout/TrustSection";

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

type Phase =
  | "loading"
  | "ready"
  | "creating"
  | "awaiting" // Razorpay window is open
  | PaymentPhase
  | "unavailable"
  | "notfound";

const WHATSAPP = "https://wa.me/917817912062";

export default function CheckoutClient() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { converted, currency: displayCurrency } = useCurrency();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking"); // trek booking
  const courseId = searchParams.get("course"); // course booking
  const { user, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState<TrekBooking | null>(null);
  const [courseBooking, setCourseBooking] = useState<CourseBooking | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  const trek = useMemo(() => treks.find((t) => t.slug === booking?.trek_slug), [booking]);
  const persons = booking && /^\d+$/.test(booking.group_size.trim()) ? Number(booking.group_size) : null;
  const unitInr = trek ? pricePerPerson(trek, booking?.room_sharing) : undefined;
  // Display only — the server recomputes the amount from the same catalog and ignores the browser.
  const totalPaise = unitInr && persons && persons >= 1 && persons <= 10 ? unitInr * persons * 100 : null;

  // One shape for the summary card, whichever kind of booking this is.
  const course = useMemo(() => courses.find((c) => c.slug === courseBooking?.course_slug), [courseBooking]);
  const summary = courseBooking
    ? {
        title: courseBooking.course_name + (courseBooking.package_name ? ` · ${courseBooking.package_name}` : ""),
        dateISO: courseBooking.preferred_date,
        persons: courseBooking.group_size,
        image: course?.image,
        totalPaise: courseBooking.amount,
        unitPaise: courseBooking.amount ? courseBooking.amount / courseBooking.group_size : null,
      }
    : booking
      ? {
          title: booking.trek_name + (booking.room_sharing ? ` · ${booking.room_sharing}` : ""),
          dateISO: booking.trek_date,
          persons,
          image: trek?.image,
          totalPaise,
          unitPaise: unitInr ? unitInr * 100 : null,
        }
      : null;

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  // Load the booking (RLS guarantees it's the signed-in user's) and any prior payment.
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
      if (courseId) {
        // A course booked while logged out becomes ours once the verified email matches.
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          await fetch("/api/claim-bookings", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
        }
        const { data: courseRow } = await supabase.from("course_bookings").select("*").eq("id", courseId).maybeSingle();
        if (cancelled) return;
        if (!courseRow) {
          setPhase("notfound");
          return;
        }
        const { data: coursePaid } = await supabase
          .from("payments")
          .select("id")
          .eq("course_booking_id", courseId)
          .eq("status", "paid")
          .limit(1);
        if (cancelled) return;
        setCourseBooking(courseRow as CourseBooking);
        if (coursePaid && coursePaid.length > 0) {
          setAlreadyPaid(true);
          setPhase("success");
        } else {
          setPhase("ready");
          void loadRazorpay().catch(() => {});
        }
        return;
      }
      const { data: row } = await supabase.from("trek_bookings").select("*").eq("id", bookingId).maybeSingle();
      if (cancelled) return;
      if (!row) {
        setPhase("notfound");
        return;
      }
      const { data: paid } = await supabase
        .from("payments")
        .select("id")
        .eq("booking_id", bookingId)
        .eq("status", "paid")
        .limit(1);
      if (cancelled) return;
      setBooking(row as TrekBooking);
      if (paid && paid.length > 0) {
        setAlreadyPaid(true);
        setPhase("success");
      } else {
        setPhase("ready");
        void loadRazorpay().catch(() => {}); // warm up so the first click is instant
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, bookingId, courseId]);

  const accessToken = async () => {
    const supabase = createClient();
    const { data } = await supabase!.auth.getSession();
    return data.session?.access_token ?? "";
  };

  const pollForPaid = async (orderId: string) => {
    const supabase = createClient();
    for (let i = 0; i < 6; i++) {
      const { data } = await supabase!.from("payments").select("status").eq("razorpay_order_id", orderId).maybeSingle();
      if (data?.status === "paid") return true;
      await sleep(2500);
    }
    return false;
  };

  const confirmPayment = useCallback(async (resp: RazorpaySuccess) => {
    setPhase("processing");
    const startedAt = Date.now();
    let confirmed = false;
    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await accessToken()}` },
        body: JSON.stringify(resp),
      });
      confirmed = res.ok;
    } catch {
      /* network blip — the webhook may still confirm it; fall through to polling */
    }
    if (!confirmed) confirmed = await pollForPaid(resp.razorpay_order_id);
    // Keep the spinner up long enough to read as a deliberate step, not a flicker.
    await sleep(Math.max(0, 900 - (Date.now() - startedAt)));
    setPhase(confirmed ? "success" : "pending");
  }, []);

  const startPayment = async () => {
    if (!booking && !courseBooking) return;
    setError(null);
    setPhase("creating");
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await accessToken()}` },
        body: JSON.stringify(courseBooking ? { courseBookingId: courseBooking.id } : { bookingId: booking!.id }),
      });
      const order = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(order.error || "We couldn't start the payment. Please try again.");
      await loadRazorpay();

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
        handler: (resp: RazorpaySuccess) => void confirmPayment(resp),
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

              {(phase === "unavailable" || phase === "notfound") && (
                <div className="space-y-4 py-4 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {phase === "unavailable"
                      ? "Online payments aren't available right now."
                      : "We couldn't find that booking."}
                  </p>
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
                    Pay via WhatsApp instead
                  </a>
                </div>
              )}

              {summary && (
                <div className="flex gap-4">
                  {summary.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={summary.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-20 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-heading text-base font-bold">{summary.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <CalendarDays className="h-4 w-4 shrink-0" aria-hidden />
                      {new Date(summary.dateISO).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Users className="h-4 w-4 shrink-0" aria-hidden />
                      {summary.persons ?? "—"} {summary.persons === 1 ? "person" : "persons"}
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
                      detail={
                        phase === "success" && alreadyPaid
                          ? "This booking has already been paid. See you in the mountains!"
                          : phase === "failed"
                            ? failure
                            : undefined
                      }
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
                  (phase === "ready" || busy) && (
                    <motion.div
                      key="pay"
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0 }}
                      className="space-y-6"
                    >
                      {summary?.totalPaise ? (
                        <>
                          <dl className="space-y-2 rounded-xl bg-slate-100/70 p-4 text-sm dark:bg-white/5">
                            <div className="flex justify-between text-slate-600 dark:text-slate-300">
                              <dt>
                                {formatPaise(summary.unitPaise ?? 0)} × {summary.persons} {summary.persons === 1 ? "person" : "persons"}
                              </dt>
                              <dd>{formatPaise(summary.totalPaise)}</dd>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold dark:border-white/10">
                              <dt>Total</dt>
                              <dd>{formatPaise(summary.totalPaise)}</dd>
                            </div>
                          </dl>
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
                                Pay {formatPaise(summary.totalPaise)} with UPI
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
