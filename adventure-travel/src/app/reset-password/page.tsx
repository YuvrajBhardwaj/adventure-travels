"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updatePassword } from "@/lib/auth";

const FIELD =
  "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none placeholder:text-white/30";

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
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-heading">Set a new password</h1>
          <p className="text-white/60 mt-2">Choose a password you haven&apos;t used here before.</p>
        </div>

        {stage === "waiting" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center text-white/70" aria-busy>
            Checking your reset link…
          </div>
        )}

        {stage === "invalid" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center space-y-4">
            <p className="text-white/80">This reset link has expired or was already used.</p>
            <Link href="/login" className="inline-block text-emerald-400 font-semibold hover:underline">
              Back to log in to request a new one
            </Link>
          </div>
        )}

        {stage === "ready" && (
          <form onSubmit={submit} noValidate className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-5">
            <label className="block text-sm font-medium text-white/80">
              New password
              <input
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(""); }}
                className={`${FIELD} mt-1.5`}
              />
            </label>
            <label className="block text-sm font-medium text-white/80">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setError(""); }}
                className={`${FIELD} mt-1.5`}
              />
            </label>
            <p className="text-xs text-white/50">At least 8 characters.</p>
            {error && <p role="alert" className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" disabled={saving} className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-70">
              {saving ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
