import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared empty and error state (FR-022): an icon, a title, a line of help and
 * one clear next step (a Button, or a link styled with buttonVariants).
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "amber";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      {icon && (
        <div
          aria-hidden
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl [&_svg]:h-6 [&_svg]:w-6",
            tone === "amber"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
              : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-white/50"
          )}
        >
          {icon}
        </div>
      )}
      <p className="text-base font-semibold text-slate-900 dark:text-white">{title}</p>
      {description && (
        <div className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted dark:text-white/55">{description}</div>
      )}
      {action && <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{action}</div>}
    </div>
  );
}
