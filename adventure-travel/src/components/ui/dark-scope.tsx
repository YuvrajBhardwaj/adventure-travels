import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Forces the kit's dark variant on a subtree, with no toggle. The account pages
 * (login, signup, reset password, dashboard) keep their navy background and
 * render the same components as everywhere else, in dark.
 */
export function DarkScope({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("dark", className)}>{children}</div>;
}
