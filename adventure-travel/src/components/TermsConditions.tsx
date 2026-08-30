"use client";

import { useState } from "react";

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
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 dark:bg-white/5 text-muted hover:text-foreground border border-gray-200 dark:border-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-card p-6 md:p-8 text-foreground leading-relaxed space-y-4 text-sm md:text-base">
        {activeTab === "cancellation" && (
          <>
            <p>
              <strong>Note:</strong> No refund on unutilized services of the package, if any. See the{" "}
              <strong>Cancellation Process &amp; Terms &amp; Conditions</strong> below.
            </p>
            <p>
              To cancel your booking, email <strong>support@expeditionhappinesstreks.com</strong> with your booking
              reference number. Cancellation requests cannot be taken over phone calls or messages.
            </p>
            <p><strong>The advance amount is non-refundable.</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cancellation 25+ days before the trek</strong> — 90% cash refund, or 100% of the fee as a Trek Voucher.</li>
              <li><strong>24–15 days before</strong> — 70% cash refund, or 80% as a Trek Voucher.</li>
              <li><strong>14–10 days before</strong> — 50% cash refund, or 70% as a Trek Voucher.</li>
              <li><strong>9–1 days before</strong> — no refund; 10% Trek Voucher.</li>
              <li><strong>On the start day / no-show</strong> — no refund, no voucher.</li>
              <li>Trek Vouchers are issued only when the full amount has been paid.</li>
              <li>No refund applies if only the advance amount was paid.</li>
              <li>Refunds are processed within 7–14 working days of cancellation.</li>
              <li>A <strong>3% payment processing charge</strong> applies to all refunds.</li>
              <li><strong>5% GST is non-refundable.</strong></li>
              <li>Bookings marked <strong>NON REFUNDABLE</strong> receive no refund or voucher.</li>
            </ul>
            <p>
              <strong>Important:</strong> offloading, rental, and travel fees are non-refundable. Trek Vouchers are
              issued only for the trek fee.
            </p>
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
              <a href="https://wa.me/917817912062" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-semibold hover:underline">
                +91 78179 12062
              </a>{" "}
              with your voucher code and preferred batch date.
            </p>
          </>
        )}
        {activeTab === "payments" && (
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Full amount</strong> to be paid to confirm booking.</li>
            <li>Booking confirmations are subject to availability of accommodation.</li>
            <li>Cheques not accepted.</li>
            <li>Payments accepted via UPI, credit card, and net banking (3% extra charged on credit cards).</li>
            <li>After payment, share a screenshot of the confirmation with our team — date, time, and UTR number clearly visible.</li>
            <li>Solo female travellers who prefer not to share accommodation will be charged an additional cost.</li>
          </ul>
        )}
        {activeTab === "others" && (
          <ul className="list-disc pl-6 space-y-2">
            <li>We reserve the right to alter the day-wise schedule without prior information (based on traffic, route restrictions, or unforeseen travel circumstances).</li>
            <li>In case of a surge in transportation or accommodation costs (e.g. fuel price hikes), the total package cost will increase accordingly.</li>
            <li>We are not responsible for itinerary changes due to natural calamities or unforeseen circumstances; any additional cost is borne by the client.</li>
            <li>Anything not mentioned in the inclusions is not part of the package.</li>
            <li>Images of sites, hotels, etc. are for illustration purposes only.</li>
            <li>Additional charges apply for passengers who wish to stay back at the destination or in transit.</li>
          </ul>
        )}
      </div>
    </div>
  );
}
