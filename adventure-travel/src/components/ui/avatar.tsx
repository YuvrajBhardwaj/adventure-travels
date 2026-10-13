import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300",
];

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Initials avatar with a stable colour per user (no profile photos are stored). */
export function Avatar({ name, seed, className }: { name: string; seed?: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
        PALETTE[hash(seed || name) % PALETTE.length],
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
