"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { BackendUnavailableError, createActivityBooking } from "@/lib/auth";
import WhatsAppFallback from "@/components/WhatsAppFallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const ACTIVITIES = [
  { type: "camping", name: "Camping" },
  { type: "paragliding", name: "Paragliding" },
  { type: "rock-climbing", name: "Rock climbing" },
  { type: "trekking", name: "Day trekking" },
];

/**
 * Activity requests are saved to the customer's account but never priced or paid online:
 * activity prices vary by session and group, so the team confirms them (FR-013).
 */
export default function ActivityRequestForm() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ type: ACTIVITIES[0].type, date: "", groupSize: "2", message: "" });
  const [minDate, setMinDate] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  // Date floor set client-side only, to avoid a hydration mismatch around midnight.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMinDate(new Date(Date.now() + 86400000).toISOString().slice(0, 10)), []);

  const activity = ACTIVITIES.find((a) => a.type === form.type) ?? ACTIVITIES[0];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.date) {
      setError("Pick a preferred date.");
      return;
    }
    setError(null);
    setUnavailable(false);
    setStatus("saving");
    try {
      await createActivityBooking({
        user_id: user.id,
        activity_name: activity.name,
        activity_type: activity.type,
        activity_date: form.date,
        group_size: form.groupSize,
        message: form.message.trim(),
      });
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      if (err instanceof BackendUnavailableError) setUnavailable(true);
      else setError(err instanceof Error ? err.message : "We couldn't save your request. Please try again.");
    }
  };

  return (
    <section className="py-section-sm">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-foreground sm:text-4xl">Request an activity</h2>
        <p className="mt-2 text-base text-muted">
          Tell us what you&apos;d like to do and when. We&apos;ll confirm availability and the price for your group.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          {loading ? (
            // Layout-true placeholder: three fields, the message box and the submit button.
            <div aria-busy="true" className="space-y-4">
              <span className="sr-only">Loading the request form</span>
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1, 2].map((i) => (
                  <div key={i}>
                    <Skeleton className="mb-2 h-4 w-24" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                ))}
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-48" />
                <Skeleton className="h-[5.5rem] w-full rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : !user ? (
            <p className="text-sm text-slate-700">
              <Link href="/login" className="font-semibold text-emerald-700 hover:underline">Log in</Link> or{" "}
              <Link href="/signup" className="font-semibold text-emerald-700 hover:underline">create an account</Link>{" "}
              to request an activity. Your requests are then saved to your dashboard.
            </p>
          ) : status === "sent" ? (
            <div role="status" className="text-center">
              <p className="font-semibold text-foreground">Request sent!</p>
              <p className="mt-1 text-sm text-muted">
                We&apos;ll confirm the date and price for {activity.name.toLowerCase()} soon. You can see it in your{" "}
                <Link href="/dashboard" className="font-semibold text-emerald-700 hover:underline">dashboard</Link>.
              </p>
              <Button variant="link" onClick={() => setStatus("idle")} className="mt-2 min-h-11">
                Request another
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Label className="mb-0">
                  Activity
                  <Select wrapperClassName="mt-1.5" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {ACTIVITIES.map((a) => (
                      <option key={a.type} value={a.type}>{a.name}</option>
                    ))}
                  </Select>
                </Label>
                <Label className="mb-0">
                  Preferred date
                  <Input
                    type="date"
                    className="mt-1.5"
                    min={minDate || undefined}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </Label>
                <Label className="mb-0">
                  Group size
                  <Select wrapperClassName="mt-1.5" value={form.groupSize} onChange={(e) => setForm({ ...form, groupSize: e.target.value })}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={String(n)}>{n} {n === 1 ? "person" : "persons"}</option>
                    ))}
                    <option value="10+">10+ persons</option>
                  </Select>
                </Label>
              </div>
              <Label className="mb-0">
                Anything we should know? <span className="font-normal">(optional)</span>
                <Textarea
                  rows={3}
                  className="mt-1.5 resize-none"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </Label>
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              {unavailable && (
                <WhatsAppFallback
                  message="We couldn't save your request online right now."
                  details={[
                    `Hi! I'd like to book ${activity.name.toLowerCase()}.`,
                    form.date && `Date: ${form.date}`,
                    `Group: ${form.groupSize}`,
                    form.message && `Message: ${form.message}`,
                  ].filter((line): line is string => Boolean(line))}
                />
              )}
              <Button type="submit" size="lg" loading={status === "saving"} className="w-full">
                {status === "saving" ? "Sending…" : "Send request"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
