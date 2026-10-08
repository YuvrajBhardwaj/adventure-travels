"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getSession, onAuthStateChange, type SafeUser } from "@/lib/auth";

interface AuthCtx {
  user: SafeUser | null;
  loading: boolean;
  setUser: (user: SafeUser | null) => void;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, setUser: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then((u) => { setUser(u); setLoading(false); });
    const { data: { subscription } } = onAuthStateChange((u) => { setUser(u); setLoading(false); });
    return () => subscription.unsubscribe();
  }, []);

  return <Ctx.Provider value={{ user, loading, setUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
