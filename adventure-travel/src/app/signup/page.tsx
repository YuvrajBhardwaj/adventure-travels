"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { resendSignupConfirmation, signUp } from "@/lib/auth";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { DarkScope } from "@/components/ui/dark-scope";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [resending, setResending] = useState(false);

  if (user) { router.push("/dashboard"); return null; }

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.phone.replace(/\D/g, "").length < 7) e.phone = "Enter a valid phone.";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    try {
      const result = await signUp(form.name.trim(), form.email.trim(), form.phone.trim(), form.password);
      if (result.needsEmailConfirmation) {
        setConfirmationEmail(result.user.email);
        setSubmitting(false);
        return;
      }
      setUser(result.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setErrors({ email: msg });
      setSubmitting(false);
    }
  };

  return (
    <DarkScope className="flex min-h-screen items-center justify-center bg-navy px-4 pb-12 pt-24 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-[-0.02em] text-white sm:text-4xl">Create Account</h1>
          <p className="mt-2 text-base text-white/60">Join Himalayan Arc Adventure</p>
        </div>
        <Card className="p-6 backdrop-blur-xl sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {confirmationEmail ? (
              <div className="space-y-4 text-center" role="status">
                <h2 className="font-heading text-xl font-semibold text-white">Confirm your email</h2>
                <p className="text-sm leading-relaxed text-white/65">
                  We sent a confirmation link to <span className="font-semibold text-white">{confirmationEmail}</span>. Open it before logging in.
                </p>
                <Button
                  variant="outline"
                  loading={resending}
                  onClick={async () => {
                    setResending(true);
                    setConfirmationMessage("");
                    try {
                      await resendSignupConfirmation(confirmationEmail);
                      setConfirmationMessage("Confirmation email sent again.");
                    } catch (err) {
                      setConfirmationMessage(err instanceof Error ? err.message : "Could not resend the confirmation email.");
                    } finally {
                      setResending(false);
                    }
                  }}
                  className="w-full"
                >
                  {resending ? "Sending…" : "Resend confirmation email"}
                </Button>
                {confirmationMessage && <p className="text-sm text-emerald-300" aria-live="polite">{confirmationMessage}</p>}
                <Link href="/login" className={buttonVariants({ className: "w-full" })}>Go to log in</Link>
                <Button variant="ghost" size="sm" onClick={() => setConfirmationEmail("")} className="min-h-11 text-white/60 dark:text-white/60">
                  Use a different email
                </Button>
              </div>
            ) : (
              <>
                {[
                  { key: "name", label: "Full Name", type: "text", autoComplete: "name" },
                  { key: "email", label: "Email", type: "email", autoComplete: "email" },
                  { key: "phone", label: "Phone Number", type: "tel", autoComplete: "tel" },
                  { key: "password", label: "Password", type: "password", autoComplete: "new-password" },
                ].map(({ key, label, type, autoComplete }) => (
                  <div key={key}>
                    <Label htmlFor={`signup-${key}`}>{label}</Label>
                    <Input
                      id={`signup-${key}`}
                      type={type}
                      autoComplete={autoComplete}
                      value={(form as Record<string, string>)[key]}
                      onChange={(e) => update(key, e.target.value)}
                      invalid={Boolean(errors[key])}
                      aria-describedby={errors[key] ? `signup-${key}-error` : undefined}
                    />
                    {errors[key] && <p id={`signup-${key}-error`} className="mt-1.5 text-xs text-red-400">{errors[key]}</p>}
                  </div>
                ))}
                <Button type="submit" size="lg" loading={submitting} className="w-full">
                  {submitting ? "Creating account…" : "Sign Up"}
                </Button>
                <GoogleSignInButton />
                <p className="text-center text-sm text-white/50">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-emerald-400 underline-offset-4 hover:underline">Log in</Link>
                </p>
              </>
            )}
          </form>
        </Card>
      </div>
    </DarkScope>
  );
}
