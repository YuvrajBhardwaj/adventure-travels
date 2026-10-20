import * as React from "react";
import { cn } from "@/lib/utils";

/** Shared field box for Input, Select and Textarea: light field on light pages, white-alpha on dark ones. */
export const fieldClasses =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 text-base text-slate-900 shadow-sm shadow-slate-900/[0.03] placeholder:text-slate-400 transition-[border-color,box-shadow,background-color] duration-150 ease-out outline-none focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus-visible:ring-red-500/30 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-none dark:placeholder:text-white/35 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/25 motion-reduce:transition-none";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Red border plus aria-invalid; link the error text with aria-describedby. */
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={cn(fieldClasses, "h-11", className)}
      {...props}
    />
  )
);
Input.displayName = "Input";
