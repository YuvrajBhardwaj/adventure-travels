import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

// shadcn/ui-style Button, wired to this site's emerald palette (no Radix dependency).
// Links that look like buttons use buttonVariants(...) on the <a>/<Link>.
const baseButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 aria-disabled:pointer-events-none aria-disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white shadow-sm shadow-emerald-900/20 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-900/20",
        outline:
          "border border-slate-300 bg-transparent text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:text-slate-100 dark:hover:bg-white/10",
        ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",
        destructive: "bg-red-600 text-white shadow-sm shadow-red-900/20 hover:bg-red-700",
        link: "text-emerald-700 underline-offset-4 hover:underline active:scale-100 dark:text-emerald-400",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "default", size: "default" },
  }
);

/** cva plus tailwind-merge, so a caller's `className` (e.g. `bg-white`) replaces the variant's own class instead of competing with it. */
const buttonVariants = (options?: Parameters<typeof baseButtonVariants>[0]) => cn(baseButtonVariants(options));

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof baseButtonVariants> {
  /** Shows a spinner before the label, sets aria-busy and blocks further presses. */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", loading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
