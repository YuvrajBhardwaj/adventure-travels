"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updatePassword } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { DarkScope } from "@/components/ui/dark-scope";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Stage = "waiting" | "ready" | "invalid";

// Landing page for the link in the password-reset email (FR-004). Supabase turns the link
// into a short-lived recovery session; with it, the customer can set a new password.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("waiting");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage("invalid");
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: unknown) => {
      if (event === "PASSWORD_RECOVERY" || session) setStage("ready");
    });
    void supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
      if (data.session) setStage("ready");
    });
    // The link is single-use and expires; if no session shows up, say so instead of spinning.
    const timer = setTimeout(() => setStage((s) => (s === "waiting" ? "invalid" : s)), 8000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Use at least 8 characters."); return; }
    if (form.password !== form.confirm) { setError("The two passwords don't match."); return; }
    setSaving(true);
    try {
      await updatePassword(form.password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update your password. Please try again.");
      setSaving(false);
    }
  };

  return (
    <DarkScope className="flex min-h-screen items-center justify-center bg-navy px-4 pb-12 pt-24 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">Set a new password</h1>
          <p className="mt-2 text-base text-white/60">Choose a password you haven&apos;t used here before.</p>
        </div>

        {stage === "waiting" && (
          <Card className="p-6 text-center text-white/70 backdrop-blur-xl sm:p-8" aria-busy="true" role="status">
            Checking your reset link…
          </Card>
        )}

        {stage === "invalid" && (
          <Card className="space-y-4 p-6 text-center backdrop-blur-xl sm:p-8">
            <p className="text-white/80">This reset link has expired or was already used.</p>
            <Link href="/login" className={cn(buttonVariants(), "h-auto min-h-11 w-full whitespace-normal py-2.5")}>
              Back to log in to request a new one
            </Link>
          </Card>
        )}

        {stage === "ready" && (
          <Card className="p-6 backdrop-blur-xl sm:p-8">
            <form onSubmit={submit} noValidate className="space-y-5">
              <div>
                <Label htmlFor="reset-password">New password</Label>
                <Input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  aria-describedby="reset-password-hint"
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(""); }}
                />
              </div>
              <div>
                <Label htmlFor="reset-confirm">Confirm new password</Label>
                <Input
                  id="reset-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setError(""); }}
                />
              </div>
              <p id="reset-password-hint" className="text-xs text-white/50">At least 8 characters.</p>
              {error && <p role="alert" className="text-center text-sm text-red-400">{error}</p>}
              <Button type="submit" size="lg" loading={saving} className="w-full">
                {saving ? "Saving…" : "Save new password"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </DarkScope>
  );
}
