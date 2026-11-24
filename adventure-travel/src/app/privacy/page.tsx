import Link from "@/components/Link";
import { breadcrumbLd, pageMetadata, webPageLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

const DESCRIPTION =
  "What Himalayan Arc Adventure collects when you enquire, sign up, book or pay, who it is shared with, and how to correct or delete it.";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: DESCRIPTION,
  path: "/privacy",
});

const h2 = "mt-10 font-heading text-2xl font-medium tracking-[-0.015em] text-slate-900";
const list = "mt-3 list-disc space-y-2 pl-6";
const a = "font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-800";

export default function PrivacyPage() {
  return (
    <main id="main" className="min-h-screen bg-white">
      <JsonLd graph={[webPageLd("WebPage", "/privacy", "Privacy Policy", DESCRIPTION), breadcrumbLd([["Privacy Policy", "/privacy"]])]} />
      <header className="bg-navy text-white">
        <div className="mx-auto max-w-3xl px-4 pb-12 pt-28 sm:px-6 lg:pb-16 lg:pt-36">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="inline-flex min-h-11 items-center transition-colors duration-150 ease-out hover:text-white">Home</Link>
            <span aria-hidden>/</span>
            <span className="text-white/90">Privacy Policy</span>
          </nav>
          <h1 className="font-heading text-5xl font-medium leading-[0.98] tracking-[-0.02em] sm:text-6xl">Privacy Policy</h1>
          <p className="mt-6 text-white/75">Last updated: 25 Nov 2026</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-section-sm leading-relaxed text-slate-700 sm:px-6">
        <p>
          This page explains what Himalayan Arc Adventure (&ldquo;we&rdquo;) collects through this website, why, and what you
          can do about it. We run guided treks, tours and the Auli ski school from Joshimath (Chamoli, Uttarakhand 246443,
          near the Military Hospital), with an office at M3M Marina, Sector 68, Gurugram 122101.
        </p>

        <h2 className={h2}>What we collect</h2>
        <ul className={list}>
          <li><strong>Your account:</strong> name, email, phone number and password when you sign up. If you use &ldquo;Continue with Google&rdquo;, Google shares your name and email with us. Passwords are handled by our sign-in provider; we never see them.</li>
          <li><strong>Your profile (optional):</strong> city and an emergency contact&apos;s name and phone, if you add them in your dashboard.</li>
          <li><strong>Bookings:</strong> the trek, tour or course, dates, group size, room-sharing option, nationality (Indian or foreign, which sets the price) and any message you write. Course bookings can be made without an account, so they also store the contact name, email and phone you enter.</li>
          <li><strong>Payments:</strong> you pay on Razorpay&apos;s checkout. Your card, UPI or bank details go to Razorpay, not to us. We keep the payment reference, amount, method (for example UPI or card) and status.</li>
          <li><strong>Emails we send:</strong> a copy of each booking confirmation, payment receipt and balance reminder, so we can retry any that fail.</li>
        </ul>

        <h2 className={h2}>Why we use it</h2>
        <ul className={list}>
          <li>To confirm and run your booking, take payment, and send receipts and reminders.</li>
          <li>To contact you, or your emergency contact, about your trip.</li>
          <li>To keep booking and payment records, which we need for our accounts.</li>
        </ul>
        <p className="mt-3">We do not sell your data, and we do not use it for advertising.</p>

        <h2 className={h2}>Who it is shared with</h2>
        <p className="mt-3">Only the services that run the site and your booking:</p>
        <ul className={list}>
          <li><strong>Supabase</strong> stores accounts and bookings, in its Mumbai (India) region.</li>
          <li><strong>Vercel</strong> hosts the website and our booking functions, which also run in Mumbai, and counts page visits for us (see below).</li>
          <li><strong>Razorpay</strong> processes payments.</li>
          <li><strong>Google</strong> delivers our emails (through our Gmail account) and handles Google sign-in if you choose it.</li>
          <li><strong>WhatsApp (Meta)</strong>, if you message us: enquiry buttons open a WhatsApp chat with +91 78179 12062, and that chat is covered by WhatsApp&apos;s own privacy policy.</li>
          <li><strong>Unsplash, Pexels and Wikimedia Commons</strong>: some photos on the site load from these image libraries, so your browser asks them for the picture and they see your IP address. We send them nothing else.</li>
        </ul>

        <h2 className={h2}>Cookies and your browser</h2>
        <ul className={list}>
          <li>
            We use <strong>no advertising trackers and no analytics cookies</strong>. To see which pages are visited, we use Vercel Web
            Analytics, which counts visits without cookies. It records the page address (without anything after a &ldquo;?&rdquo;),
            the page you came from, your browser, device type and country. It tells visitors apart with a code made from your
            connection that is thrown away within 24 hours, so it can&apos;t follow you from day to day or across other websites.
            Our admin pages aren&apos;t counted.
          </li>
          <li>When you sign in, a sign-in cookie keeps you logged in.</li>
          <li>To show prices in your currency, the site asks our server which country your connection comes from. Our host works this out from your IP address; we do not store it. If you tap &ldquo;Use my location&rdquo; and allow it, your browser shares your approximate position (rounded to about 1 km) with BigDataCloud, which tells us only the country; we do not store your position. Your country, currency and nationality choice are saved in your browser&apos;s local storage, not on our servers.</li>
          <li>If you start a trek booking while signed out, the form is kept in that browser tab until you sign up, so you don&apos;t have to fill it in again.</li>
        </ul>

        <h2 className={h2}>Your choices</h2>
        <ul className={list}>
          <li><strong>See and correct:</strong> your profile and bookings are in your <Link href="/dashboard" className={a}>dashboard</Link>.</li>
          <li><strong>Download your data:</strong> from the dashboard, as one file with your details, bookings, payments and account activity.</li>
          <li><strong>Delete your account:</strong> from the dashboard. This removes your sign-in and clears your name, email, phone, city and emergency contact, the contact details on your course bookings, the messages you wrote on your bookings, and our stored copies of emails about your bookings. The booking and payment records themselves are kept, without your name, because we need them for our accounts.</li>
          <li><strong>Anything else:</strong> email <a href="mailto:himalayanarcadventure@gmail.com" className={a}>himalayanarcadventure@gmail.com</a> or call +91 78179 12062 / +91 86505 61564.</li>
        </ul>

        <p className="mt-10 text-sm text-slate-500">
          See also our <Link href="/terms" className={a}>Terms &amp; Conditions</Link> and{" "}
          <Link href="/cancellation-policy" className={a}>Cancellation &amp; Refund Policy</Link>.
        </p>
      </div>
    </main>
  );
}
