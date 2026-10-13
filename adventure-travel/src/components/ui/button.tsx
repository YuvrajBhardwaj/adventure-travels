import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// shadcn/ui-style Button, wired to this site's emerald palette (no Radix dependency).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white shadow-sm shadow-emerald-900/20 hover:bg-emerald-700 hover:shadow-md hover:shadow-emerald-900/20",
        outline:
          "border border-slate-300 bg-transparent text-slate-800 hover:bg-slate-100 dark:border-white/15 dark:text-slate-100 dark:hover:bg-white/10",
        ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-3.5",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
