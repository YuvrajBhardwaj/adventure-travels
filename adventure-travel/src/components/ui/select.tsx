import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fieldClasses } from "./input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  /** Classes for the positioning wrapper (width, margins); `className` styles the field itself. */
  wrapperClassName?: string;
}

/**
 * A styled native <select> (research R4): the system picker on phones, no
 * JavaScript, and the value stays in the static HTML.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, wrapperClassName, invalid, children, ...props }, ref) => (
    <div className={cn("relative", wrapperClassName)}>
      <select
        ref={ref}
        aria-invalid={invalid || props["aria-invalid"] || undefined}
        className={cn(fieldClasses, "h-11 cursor-pointer appearance-none pr-10 dark:[&>option]:bg-navy", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-white/50"
      />
    </div>
  )
);
Select.displayName = "Select";
