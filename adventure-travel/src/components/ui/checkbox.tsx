import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** When given, the box and its text are one 44px-tall touch target. */
  label?: React.ReactNode;
  labelClassName?: string;
}

const boxClasses =
  "h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-emerald-600 disabled:cursor-not-allowed dark:accent-emerald-500";

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, labelClassName, ...props }, ref) => {
    const box = <input ref={ref} type="checkbox" className={cn(boxClasses, label ? "mt-0.5" : "", className)} {...props} />;
    if (!label) return box;
    return (
      <label
        className={cn(
          "flex min-h-11 cursor-pointer items-start gap-3 py-2.5 text-sm text-slate-700 dark:text-white/70",
          labelClassName
        )}
      >
        {box}
        <span>{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
