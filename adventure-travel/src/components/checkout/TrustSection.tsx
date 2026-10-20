import { Lock, ShieldCheck, Smartphone } from "lucide-react";

// Wordmark chips, not logos — drop official brand SVGs into public/upi/ if you have
// permission to use them and swap them in here.
const UPI_APPS = [
  { name: "PhonePe", color: "bg-violet-600" },
  { name: "GPay", color: "bg-sky-500" },
  { name: "Paytm", color: "bg-blue-600" },
  { name: "BHIM", color: "bg-orange-500" },
];

const TRUST = [
  { icon: ShieldCheck, label: "Razorpay Secure" },
  { icon: Lock, label: "256-bit encryption" },
  { icon: Smartphone, label: "We never see your UPI PIN" },
];

export function TrustSection() {
  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {TRUST.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex min-h-9 items-center justify-center gap-2 rounded-full bg-slate-100/80 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-white/5 dark:text-slate-300"
          >
            <Icon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
            {label}
          </li>
        ))}
      </ul>

      <div className="text-center">
        <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">Pay with any UPI app</p>
        <ul className="flex flex-wrap items-center justify-center gap-2">
          {UPI_APPS.map((app) => (
            <li
              key={app.name}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              <span
                aria-hidden
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${app.color}`}
              >
                {app.name[0]}
              </span>
              {app.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
