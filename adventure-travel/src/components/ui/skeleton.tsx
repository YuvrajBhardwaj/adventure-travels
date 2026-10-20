import { cn } from "@/lib/utils";

/**
 * Layout-true loading placeholder. Callers compose the shape (rows, cards, text
 * lines) and mark the waiting region `aria-busy` with an sr-only label. Fades in
 * after 150ms, shimmers with transform only, and is static for reduced motion
 * (`.ui-skeleton` in globals.css).
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("ui-skeleton rounded-md bg-slate-200/70 dark:bg-white/[0.06]", className)}
      {...props}
    />
  );
}
