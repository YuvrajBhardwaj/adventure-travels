"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signUp } from "@/lib/auth";

export default function SignupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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
      await signUp(form.name.trim(), form.email.trim(), form.phone.trim(), form.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      setErrors({ email: msg });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-heading">Create Account</h1>
          <p className="text-white/60 mt-2">Join Himalayan Arc Adventure</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-5">
          {[
            { key: "name", label: "Full Name", type: "text", autoComplete: "name" },
            { key: "email", label: "Email", type: "email", autoComplete: "email" },
            { key: "phone", label: "Phone Number", type: "tel", autoComplete: "tel" },
            { key: "password", label: "Password", type: "password", autoComplete: "new-password" },
          ].map(({ key, label, type, autoComplete }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-white/80 mb-1.5">{label}</label>
              <input
                type={type}
                autoComplete={autoComplete}
                value={(form as Record<string, string>)[key]}
                onChange={(e) => update(key, e.target.value)}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none placeholder:text-white/30"
              />
              {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
            </div>
          ))}
          <button type="submit" disabled={submitting} className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-70">
            {submitting ? "Creating account…" : "Sign Up"}
          </button>
          <p className="text-center text-white/50 text-sm">
            Already have an account? <Link href="/login" className="text-emerald-400 hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
