import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Only for a control whose action is in progress (Button `loading`, "Load more").
 * Waiting areas use <Skeleton> instead.
 */
export function Spinner({ size = "sm", className }: { size?: "sm" | "md"; className?: string }) {
  return (
    <Loader2
      aria-hidden
      className={cn("shrink-0 animate-spin motion-reduce:animate-none", size === "sm" ? "h-4 w-4" : "h-5 w-5", className)}
    />
  );
}
