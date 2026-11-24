import Link from "@/components/Link";
import { cn } from "@/lib/utils";

/**
 * Notice shown where a form collects personal details (sign-up, booking and request forms), so
 * people see what the details are for and can read the policy before sending them (DPDP Act notice).
 */
export function PrivacyNotice({ action = "sending", className }: { action?: string; className?: string }) {
  const link = "font-medium underline underline-offset-2 hover:text-primary";
  return (
    <p className={cn("text-xs leading-relaxed text-muted", className)}>
      We use these details only to arrange your trip and contact you about it. By {action} you agree to our{" "}
      <Link href="/terms" className={link}>Terms</Link> and{" "}
      <Link href="/privacy" className={link}>Privacy Policy</Link>.
    </p>
  );
}
