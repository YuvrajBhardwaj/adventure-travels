"use client";

import { useState } from "react";
import { PAYMENT_TERMS, REFUND_NOTE, REFUND_TIERS, REGISTRATION_NOTE } from "@/data/cancellationPolicy";

const TERMS_TABS = [
  { id: "cancellation", label: "Cancellation Policy" },
  { id: "payments", label: "Payments Terms & Policy" },
  { id: "others", label: "Others" },
] as const;

type TabId = (typeof TERMS_TABS)[number]["id"];

export default function TermsConditions() {
  const [activeTab, setActiveTab] = useState<TabId>("cancellation");

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Terms &amp; Conditions</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {TERMS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold transition-colors duration-150 ease-out motion-reduce:transition-none ${
              activeTab === tab.id
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-slate-100 text-muted hover:text-foreground dark:border-white/10 dark:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-50 dark:bg-card p-5 sm:p-6 md:p-8 text-foreground leading-relaxed text-sm md:text-base">
        <div hidden={activeTab !== "cancellation"} className="space-y-4">
            <p>
              <strong>Note:</strong> No refund on unused services of the package, if any. See the{" "}
              <strong>Cancellation Process &amp; Terms &amp; Conditions</strong> below.
            </p>
            <p>
              To cancel your booking, email <strong>support@himalayanarcadventure.com</strong> with your booking
              reference number. Cancellation requests cannot be taken over phone calls or messages.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              {REFUND_TIERS.map((t) => (
                <li key={t.window}>
                  <strong>Cancel {t.window.toLowerCase()} the start</strong> — {t.cash.toLowerCase()}.{t.detail && ` ${t.detail}`}
                </li>
              ))}
              <li><strong>On the start day / no-show</strong> — no refund.</li>
              {REFUND_NOTE.slice(2).map((n) => <li key={n.text}>{n.text}</li>)}
            </ul>
            <p className="font-semibold pt-4">In the rare event that we cancel a trek</p>
            <p>
              We almost never cancel. But for lockdowns, natural calamities (snowstorms, thunderstorms, floods,
              landslides, earthquakes, bad weather), political unrest, curfews, or government orders, we issue a
              voucher for the <strong>full amount</strong> paid — or arrange an alternate trek. The voucher is valid
              for one year and can be extended in emergencies. <strong>No cash refund</strong> is made in this case.
            </p>
            <p className="font-semibold pt-4">If a trek is abandoned mid-way</p>
            <p>
              There is <strong>no refund</strong> if you cannot complete a trek due to natural calamities, unrest,
              government orders, or if your trek leader sends you back for a safety or health issue. Instead, use our{" "}
              <strong>&ldquo;Come Back &amp; Trek Again&rdquo;</strong> feature (not applicable on winter treks): email
              us for a Refcode, then rebook the <em>same</em> trek next season with it — no extra trek fee.
              Offloading, travel, and rental fees are not included.
            </p>
            <p className="font-semibold pt-4">Trek Vouchers</p>
            <p>
              A Trek Voucher is credit added to your account, redeemable on any future fixed departure for one year.
              Vouchers are non-transferable — only the person they were issued to can redeem them. To redeem, reply
              to your voucher email or WhatsApp your trek coordinator on{" "}
              <a href={`https://wa.me/917817912062?text=${encodeURIComponent("Hi! I'd like to redeem my Trek Voucher. Code: ")}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:underline">
                +91 78179 12062
              </a>{" "}
              with your voucher code and preferred batch date.
            </p>
        </div>
        <ul hidden={activeTab !== "payments"} className="list-disc pl-6 space-y-2">
            {PAYMENT_TERMS.slice(0, 2).map((t) => <li key={t}>{t}</li>)}
            <li>Your seats are held while you pay and confirmed once the payment goes through. If weather or permits force a change, we offer another date or a refund under our cancellation policy.</li>
            <li>Cheques not accepted.</li>
            <li>Payments accepted via UPI, credit card, and net banking (3% extra charged on credit cards).</li>
            <li>Online payments are confirmed automatically and you get a receipt by email. If we have agreed a bank transfer with you, send us the UTR number on WhatsApp so we can match it.</li>
            <li>Solo female travellers who prefer not to share accommodation will be charged an additional cost.</li>
          </ul>
        <ul hidden={activeTab !== "others"} className="list-disc pl-6 space-y-2">
            <li>We reserve the right to alter the day-wise schedule without prior information (based on traffic, route restrictions, or unforeseen travel circumstances).</li>
            <li>In case of a surge in transportation or accommodation costs (e.g. fuel price hikes), the total package cost will increase accordingly.</li>
            <li>We are not responsible for itinerary changes due to natural calamities or unforeseen circumstances; any additional cost is borne by the client.</li>
            <li>Anything not mentioned in the inclusions is not part of the package.</li>
            <li>Images of sites, hotels, etc. are for illustration purposes only.</li>
            <li>{REGISTRATION_NOTE}</li>
            <li>Additional charges apply for passengers who wish to stay back at the destination or in transit.</li>
          </ul>
      </div>
    </div>
  );
}
