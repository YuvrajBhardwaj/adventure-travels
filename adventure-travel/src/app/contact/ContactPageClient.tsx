"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FadeUp } from "@/components/MotionWrapper";
import { transition } from "@/lib/motion";

const FAQS = [
  {
    q: "How far in advance should I book my trek?",
    a: "We recommend booking 2–3 months in advance, especially for peak seasons (May–June and September–October). Last-minute availability is sometimes possible for smaller groups — reach out and we'll do our best.",
  },
  {
    q: "What's included in the trek price?",
    a: "Our trek packages include experienced guides, accommodation during the trek, all meals on the trail, ground transport, and all required permits. Flights, personal trekking gear, and travel insurance are not included.",
  },
  {
    q: "Do I need previous trekking experience?",
    a: "Not necessarily. We offer beginner-friendly treks like Kedarkantha and Har Ki Dun, as well as advanced routes like Roopkund. Our team will help you choose the right trek based on your fitness and experience level.",
  },
  {
    q: "What happens if weather affects my trek?",
    a: "Safety is our top priority. If weather conditions make a route unsafe, we'll adjust the itinerary or reschedule your trek. We build buffer days into our plans specifically for this purpose.",
  },
];

/**
 * Accordion body that stays mounted (answers are in the static HTML for search
 * engines): `hidden` once closed, measured height while it moves.
 */
function Collapse({ open, id, children }: { open: boolean; id: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const [settledClosed, setSettledClosed] = useState(!open);
  return (
    <motion.div
      id={id}
      initial={false}
      animate={{ height: open ? "auto" : 0 }}
      transition={reduce ? { duration: 0 } : transition("base")}
      onAnimationComplete={() => setSettledClosed(!open)}
      hidden={!open && settledClosed}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", email: "", type: "General Inquiry", subject: "", message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!form.subject.trim()) next.subject = "Add a subject.";
    if (form.message.trim().length < 10) next.message = "Tell us a little more (at least 10 characters).";
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const text = encodeURIComponent(
      `Inquiry: ${form.type}\nSubject: ${form.subject}\nName: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`
    );
    setWhatsappUrl(`https://wa.me/917817912062?text=${text}`);
  };

  const infoLink = "block text-foreground transition-colors duration-150 ease-out hover:text-emerald-700";
  const quickLink =
    "group inline-flex min-h-11 items-center gap-3 font-heading text-2xl font-semibold text-foreground underline decoration-slate-300 decoration-1 underline-offset-[6px] transition-colors duration-150 ease-out hover:text-emerald-700 hover:decoration-emerald-600 sm:text-3xl";

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Header — words only. The form is the job; the human options sit right here, above it on phones. */}
      <section className="border-b border-slate-200 dark:border-white/10">
        <div className="mx-auto grid max-w-7xl items-end gap-8 px-4 pb-10 pt-28 sm:px-6 sm:pb-14 sm:pt-36 lg:grid-cols-12 lg:gap-12 lg:px-8">
          <div className="lg:col-span-7">
            <p className="mb-4 text-sm text-muted">Get in Touch</p>
            <h1 className="font-heading text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.025em] text-foreground sm:text-6xl">
              Plan Your Himalayan Adventure
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Our team is here to help you plan your next Himalayan trekking adventure. Reach out today.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 lg:col-span-5 lg:items-end">
            <a href="https://wa.me/917817912062" target="_blank" rel="noopener noreferrer" className={quickLink}>
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641l-.442 1.768a1.875 1.875 0 002.261 2.261l1.768-.442c.6-.154 1.194.154 1.641.586A9.49 9.49 0 0012 20.25z" />
              </svg>
              WhatsApp
            </a>
            <a href="tel:+917817912062" className={quickLink}>
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              +91 78179 12062
            </a>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="mx-auto max-w-7xl px-4 py-section-sm sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Contact Form (first on phones) */}
          <div className="order-1 min-w-0 lg:order-2 lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 dark:border-white/10 dark:bg-card">
              <h2 className="mb-2 font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">Send us a Message</h2>
              <p className="mb-6 text-sm text-muted">We&apos;ll prepare your message in WhatsApp. You can review and send it there.</p>

              {whatsappUrl ? (
                <div role="status" className="py-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="mb-2 font-heading text-xl font-semibold text-foreground">Your message is ready</h3>
                  <p className="text-muted">Open WhatsApp and press Send to contact our team.</p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ size: "lg", className: "mt-5" })}
                  >
                    Open WhatsApp
                  </a>
                  <Button variant="link" onClick={() => setWhatsappUrl(null)} className="mt-2 flex min-h-11">
                    Edit message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <Label htmlFor="contact-name">Name</Label>
                      <Input
                        id="contact-name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder="Your full name"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "contact-name-err" : undefined}
                      />
                      {errors.name && <p id="contact-name-err" className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        placeholder="your@email.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "contact-email-err" : undefined}
                      />
                      {errors.email && <p id="contact-email-err" className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact-type">Inquiry Type</Label>
                    <Select
                      id="contact-type"
                      value={form.type}
                      onChange={(e) => setField("type", e.target.value)}
                    >
                      <option>General Inquiry</option>
                      <option>Trek Booking</option>
                      <option>Custom Trip</option>
                      <option>Group Booking</option>
                      <option>Corporate Trek</option>
                      <option>Cancellation</option>
                      <option>Payment</option>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="contact-subject">Subject</Label>
                    <Input
                      id="contact-subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => setField("subject", e.target.value)}
                      placeholder="What's this about?"
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? "contact-subject-err" : undefined}
                    />
                    {errors.subject && <p id="contact-subject-err" className="mt-1 text-xs text-red-600">{errors.subject}</p>}
                  </div>

                  <div>
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => setField("message", e.target.value)}
                      placeholder="Tell us about your dream Himalayan adventure..."
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "contact-message-err" : undefined}
                    />
                    {errors.message && <p id="contact-message-err" className="mt-1 text-xs text-red-600">{errors.message}</p>}
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Prepare WhatsApp message
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Contact details — a plain ruled list */}
          <div className="order-2 min-w-0 lg:order-1 lg:col-span-5">
            <h2 className="mb-3 font-heading text-3xl font-semibold tracking-[-0.02em] text-foreground">Let&apos;s Start Planning Your Trek</h2>
            <p className="mb-8 max-w-lg text-base text-muted">
              Whether you&apos;re a first-time trekker or an experienced mountaineer, our team will craft the perfect Himalayan journey for you.
            </p>

            <div className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
              {/* Phone */}
              <div className="py-5">
                <h3 className="mb-1 text-sm font-semibold text-muted">Phone</h3>
                <a href="tel:+917817912062" className={`${infoLink} py-1 text-lg`}>+91 78179 12062</a>
                <a href="tel:+918650561564" className={`${infoLink} py-1 text-lg`}>+91 86505 61564</a>
                <p className="mt-1 text-sm text-muted">Mon–Fri · 9AM–6PM IST</p>
              </div>

              {/* Email */}
              <div className="min-w-0 py-5">
                <h3 className="mb-1 text-sm font-semibold text-muted">Email</h3>
                <a href="mailto:himalayanarcadventure@gmail.com" className={`${infoLink} py-1 text-lg [overflow-wrap:anywhere]`}>himalayanarcadventure@gmail.com</a>
                <p className="mt-1 text-sm text-muted">We&apos;ll respond within 24 hours</p>
              </div>

              {/* Office */}
              <div className="py-5">
                <h3 className="mb-2 text-sm font-semibold text-muted">Office</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-base font-medium text-foreground">Gurugram Office</p>
                    <p className="text-sm text-muted">M3M Marina, Sector 68</p>
                  </div>
                  <div>
                    <p className="text-base font-medium text-foreground">Uttarakhand Office</p>
                    <p className="text-sm text-muted">Chamoli, Joshimath, Near Military Hospital</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <FadeUp className="mt-10">
              <h3 className="mb-3 font-heading text-lg font-semibold text-foreground">Why Choose Himalayan Arc Adventure?</h3>
              <ul className="divide-y divide-slate-200 border-y border-slate-200 text-sm text-foreground dark:divide-white/10 dark:border-white/10">
                {[
                  "15+ years of Himalayan trekking expertise",
                  "5000+ happy trekkers across India",
                  "24/7 support during treks",
                ].map((item) => (
                  <li key={item} className="py-3">{item}</li>
                ))}
              </ul>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* FAQ Section — heading left, ruled questions right */}
      <section className="bg-surface py-section-sm dark:bg-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          <FadeUp className="lg:col-span-4">
            <p className="text-sm text-muted">FAQ</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">Frequently Asked Questions</h2>
          </FadeUp>

          <div className="divide-y divide-slate-300 border-y border-slate-300 dark:divide-white/10 dark:border-white/10 lg:col-span-8">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`contact-faq-panel-${i}`}
                  className="flex min-h-11 w-full items-start justify-between gap-4 py-5 text-left"
                >
                  <h3 className="font-heading text-lg font-semibold text-foreground">{faq.q}</h3>
                  <svg
                    className={`mt-1 h-5 w-5 flex-shrink-0 text-muted transition-transform duration-150 ease-out motion-reduce:transition-none ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <Collapse open={openFaq === i} id={`contact-faq-panel-${i}`}>
                  <p className="max-w-2xl pb-5 text-sm leading-relaxed text-muted">{faq.a}</p>
                </Collapse>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
