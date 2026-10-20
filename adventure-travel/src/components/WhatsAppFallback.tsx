import { MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const WA_NUMBER = "917817912062";

/**
 * Shown instead of a success state when the backend can't save something (FR-061):
 * explains what happened and hands the same details to WhatsApp so nothing is lost.
 * Built on the EmptyState layout (amber tone); renders on light pages and inside
 * a DarkScope/ThemeScope alike.
 */
export default function WhatsAppFallback({ message, details = [] }: { message: string; details?: string[] }) {
  const text = details.filter(Boolean).join("\n");
  const href = `https://wa.me/${WA_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  return (
    <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50/70 dark:border-amber-400/20 dark:bg-amber-400/[0.06]">
      <EmptyState
        tone="amber"
        icon={<MessageCircle />}
        title={<span className="text-sm font-medium leading-relaxed text-amber-900 dark:text-amber-100">{message}</span>}
        action={
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants(), "h-auto min-h-11 whitespace-normal py-2.5 text-center")}
          >
            Send these details on WhatsApp
          </a>
        }
        className="px-5 py-6"
      />
    </div>
  );
}
