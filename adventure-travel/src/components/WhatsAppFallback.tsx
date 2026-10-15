const WA_NUMBER = "917817912062";

/**
 * Shown instead of a success state when the backend can't save something (FR-061):
 * explains what happened and hands the same details to WhatsApp so nothing is lost.
 */
export default function WhatsAppFallback({ message, details = [] }: { message: string; details?: string[] }) {
  const text = details.filter(Boolean).join("\n");
  const href = `https://wa.me/${WA_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  return (
    <div role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
      <p>{message}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        Send these details on WhatsApp
      </a>
    </div>
  );
}
