import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Page shell for checkout and the admin screens: always dark, on the site's navy, with no
 * toggle (the site has no light/dark switch). Forces `.dark` on its subtree so the kit
 * components render their dark variant. The account pages use DarkScope on their own
 * background; this one also sets the page background and text colour.
 */
export function ThemeScope({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("dark relative min-h-screen bg-navy-deep text-slate-100", className)}>{children}</div>;
}
