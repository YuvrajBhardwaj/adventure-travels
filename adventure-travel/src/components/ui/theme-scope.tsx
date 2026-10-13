"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const KEY = "hac_theme";

/**
 * Scoped dark mode. The site has no global dark theme (its `dark:` variants are
 * intentionally inert), so instead of toggling <html> this wraps one page in a
 * `.dark` container. Starts from the saved choice, else the OS preference.
 */
export function ThemeScope({ children, className }: { children: ReactNode; className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDark(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch {
      /* storage blocked — stay light */
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={cn(
        dark && "dark",
        "relative min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 motion-reduce:transition-none dark:bg-slate-950 dark:text-slate-100",
        className
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="absolute right-4 top-24 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-sm backdrop-blur transition hover:scale-105 active:scale-95 motion-reduce:transition-none dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
      >
        {dark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
      </button>
      {children}
    </div>
  );
}
