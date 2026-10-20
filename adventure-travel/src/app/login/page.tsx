"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BackendUnavailableError, requestPasswordReset, resendSignupConfirmation, signIn } from "@/lib/auth";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { DarkScope } from "@/components/ui/dark-scope";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  if (user) { router.push("/dashboard"); return null; }

  // Same answer whether or not the email has an account, so the form can't be used to
  // find out who is registered.
  const sendReset = async () => {
    setError("");
    setResetMessage("");
    if (!form.email.trim()) { setError("Enter your email above, then tap “Forgot password?”."); return; }
    setSendingReset(true);
    try {
      await requestPasswordReset(form.email);
    } catch (err) {
      if (err instanceof BackendUnavailableError) {
        setError(err.message);
        setSendingReset(false);
        return;
      }
    }
    setResetMessage("If that email has an account, a reset link is on its way.");
    setSendingReset(false);
  };

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
    <DarkScope className="flex min-h-screen items-center justify-center bg-navy px-4 pb-12 pt-24 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">Welcome Back</h1>
          <p className="mt-2 text-base text-white/60">Log in to your account</p>
        </div>
        <Card className="p-6 backdrop-blur-xl sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={form.email}
                invalid={Boolean(error) && !form.email.trim()}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(""); setNeedsEmailConfirmation(false); setResendMessage(""); }}
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <Label htmlFor="login-password" className="mb-0">Password</Label>
                <Button
                  variant="link"
                  onClick={() => void sendReset()}
                  disabled={sendingReset}
                  className="-my-3 min-h-11 text-xs"
                >
                  {sendingReset ? "Sending…" : "Forgot password?"}
                </Button>
              </div>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(""); }}
              />
            </div>
            {resetMessage && <p className="text-center text-sm text-emerald-300" aria-live="polite">{resetMessage}</p>}
            {error && <p role="alert" className="text-center text-sm text-red-400">{error}</p>}
            {needsEmailConfirmation && (
              <div className="space-y-2 text-center">
                <Button
                  variant="link"
                  loading={resending}
                  disabled={!form.email.trim()}
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
                  className="min-h-11"
                >
                  {resending ? "Sending…" : "Resend confirmation email"}
                </Button>
                {resendMessage && <p className="text-sm text-white/70" aria-live="polite">{resendMessage}</p>}
              </div>
            )}
            <Button type="submit" size="lg" loading={submitting} className="w-full">
              {submitting ? "Logging in…" : "Log In"}
            </Button>
            <GoogleSignInButton />
            <p className="text-center text-sm text-white/50">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-emerald-400 underline-offset-4 hover:underline">Sign up</Link>
            </p>
          </form>
        </Card>
      </div>
    </DarkScope>
  );
}
