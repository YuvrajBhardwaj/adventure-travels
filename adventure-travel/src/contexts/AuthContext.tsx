"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { SafeUser } from "@/lib/auth";

interface AuthCtx {
  user: SafeUser | null;
  loading: boolean;
  setUser: (user: SafeUser | null) => void;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, setUser: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  // The Supabase SDK (~64 KB gzipped) is loaded after the page paints, not in every page's
  // startup bundle: most visitors never sign in. `loading` stays true until it has answered.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/auth").then(({ getSession, onAuthStateChange }) => {
      if (cancelled) return;
      getSession().then((u) => { if (!cancelled) { setUser(u); setLoading(false); } });
      const { data: { subscription } } = onAuthStateChange((u) => { setUser(u); setLoading(false); });
      unsubscribe = () => subscription.unsubscribe();
    });
    return () => { cancelled = true; unsubscribe?.(); };
  }, []);

  return <Ctx.Provider value={{ user, loading, setUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
