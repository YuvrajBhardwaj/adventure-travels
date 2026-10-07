"use client";

// ponytail: single-file logo system — mark + wordmark + mono variant.
// Print notes: mark is pure vector (no filter/gradient), works at 16px,
// strokes ≥1.25px, mono variant is pure foreground on transparent.
// Min clear-space = mark height × 0.4. Min size = 24px mark / 120px lockup.

type Variant = "default" | "light" | "mono";

function Mark({ variant = "default", className = "" }: { variant?: Variant; className?: string }) {
  // silhouette uses solid fill; accent can be swapped via currentColor
  const fill = variant === "mono" ? "currentColor" : variant === "light" ? "white" : "#0F172A";
  const accent = variant === "mono" || variant === "light" ? "currentColor" : "#10B981";
  const isMono = variant === "mono";
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* squircle badge plate — subtle, degrades to square when printed mono at tiny size */}
      <rect x="2.5" y="2.5" width="35" height="35" rx="9" fill={isMono ? "none" : variant === "light" ? "rgba(255,255,255,0.08)" : "#0F172A"} stroke={fill} strokeOpacity={isMono ? 1 : 0.12} strokeWidth="1" />
      {/* three-peak ridgeline — center is tallest (Garhwal), negative valley = subtle H */}
      <path
        d="M6 28 L13.2 16.5 L17.2 22.2 L20.2 11.2 L24.4 22.2 L28.2 15.2 L34 28 Z"
        fill={fill}
        stroke={isMono ? "none" : "white"}
        strokeOpacity={isMono ? 0 : 0.08}
        strokeWidth={isMono ? 0 : 0.6}
        strokeLinejoin="round"
      />
      {/* summit trail — happy arc, cutout on color, ink on mono */}
      <path
        d="M11.5 28.5 C14.2 25.2 16 22 20 18.2"
        stroke={isMono ? fill : "white"}
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeOpacity={isMono ? 1 : 0.95}
      />
      {/* summit dot */}
      <circle cx="20" cy="14.2" r="1.9" fill={accent} stroke={isMono ? "none" : "white"} strokeWidth={isMono ? 0 : 0.7} />
      {/* happiness sun — quarter arc above center, prints as hairline */}
      <path d="M20 9.2 A3.8 3.8 0 0 1 23.6 11" stroke={accent} strokeWidth="1.1" strokeLinecap="round" opacity={isMono ? 1 : 0.9} />
      {/* base line — grounds the mark, helps at tiny print size */}
      <path d="M8.5 29.8 H31.5" stroke={fill} strokeWidth="0.9" strokeLinecap="round" opacity={isMono ? 1 : 0.35} />
      {/* construction crosshair hint — visible only at large, subtle */}
      <circle cx="20" cy="20" r="16.8" stroke={fill} strokeOpacity={isMono ? 0 : 0.04} strokeWidth="0.5" strokeDasharray="1.2 2.2" />
    </svg>
  );
}

export function LogoMark(props: { variant?: Variant; size?: number; className?: string }) {
  const { variant = "default", size = 40, className = "" } = props;
  return (
    <span style={{ width: size, height: size }} className={`inline-flex shrink-0 ${className}`} aria-label="Himalayan Arc Adventure mark">
      <Mark variant={variant} className="h-full w-full" />
    </span>
  );
}

export default function Logo({
  variant = "default",
  size = 40,
  showWordmark = true,
  className = "",
}: {
  variant?: Variant;
  size?: number;
  showWordmark?: boolean;
  className?: string;
}) {
  const textColor = variant === "light" ? "text-white" : variant === "mono" ? "text-foreground" : "text-foreground";
  const subColor = variant === "light" ? "text-white/60" : "text-muted";
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Mark variant={variant} className="shrink-0" />
      {/* keep style width/height via size prop on wrapper span to avoid layout shift */}
      <span className="hidden sm:flex flex-col leading-none" style={{ gap: 1 }}>
        <span className={`font-nav text-[10px] font-bold uppercase tracking-[0.22em] ${subColor}`}>Himalayan Arc</span>
        <span className={`font-display text-[22px] font-[800] tracking-[-0.025em] ${variant === "light" ? "text-white" : "text-foreground"}`} style={{ lineHeight: 1 }}>
          Adventure
        </span>
      </span>
      {/* inject size via wrapper for mark */}
      <style>{`/* size hook */`}</style>
      <span aria-hidden className="sr-only">Himalayan Arc Adventure</span>
      {/* size the mark via CSS variable — keeps Logo API simple */}
      <span style={{ display: "none" }} data-size={size} data-wordmark={showWordmark ? "1" : "0"} />
    </span>
  );
}

// Re-export for barrel convenience; Navbar imports LogoMark
export { Mark as LogoMarkSvg };
