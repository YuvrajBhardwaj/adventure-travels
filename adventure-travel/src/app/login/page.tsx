"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { resendSignupConfirmation, signIn } from "@/lib/auth";

export default function LoginPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resending, setResending] = useState(false);

  if (user) { router.push("/dashboard"); return null; }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError("");
    setNeedsEmailConfirmation(false);
    setResendMessage("");
    if (!form.email || !form.password) { setError("Fill in all fields."); return; }
    setSubmitting(true);
    try {
      const user = await signIn(form.email, form.password);
      setUser(user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      const code = typeof err === "object" && err !== null && "code" in err ? err.code : undefined;
      const confirmationRequired = code === "email_not_confirmed" || /email.*not confirmed/i.test(msg);
      setNeedsEmailConfirmation(confirmationRequired);
      setError(confirmationRequired ? "Confirm your email address before logging in." : msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-heading">Welcome Back</h1>
          <p className="text-white/60 mt-2">Log in to your account</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
            <input type="email" autoComplete="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(""); setNeedsEmailConfirmation(false); setResendMessage(""); }}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none placeholder:text-white/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
            <input type="password" autoComplete="current-password" value={form.password} onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(""); }}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none placeholder:text-white/30" />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {needsEmailConfirmation && (
            <div className="space-y-2 text-center">
              <button
                type="button"
                disabled={resending || !form.email.trim()}
                onClick={async () => {
                  setResending(true);
                  setResendMessage("");
                  try {
                    await resendSignupConfirmation(form.email);
                    setResendMessage("Confirmation email sent. Check your inbox.");
                  } catch (err) {
                    setResendMessage(err instanceof Error ? err.message : "Could not resend the confirmation email.");
                  } finally {
                    setResending(false);
                  }
                }}
                className="text-sm font-semibold text-emerald-400 hover:underline disabled:opacity-60"
              >
                {resending ? "Sending…" : "Resend confirmation email"}
              </button>
              {resendMessage && <p className="text-sm text-white/70" aria-live="polite">{resendMessage}</p>}
            </div>
          )}
          <button type="submit" disabled={submitting} className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-70">
            {submitting ? "Logging in…" : "Log In"}
          </button>
          <p className="text-center text-white/50 text-sm">
            Don&apos;t have an account? <Link href="/signup" className="text-emerald-400 hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
