"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", email: "", type: "General Inquiry", subject: "", message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
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

    setSubmitting(true);
    const text = encodeURIComponent(
      `Inquiry: ${form.type}\nSubject: ${form.subject}\nName: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`
    );
    // No backend on this static marketing site — hand the message to WhatsApp,
    // then confirm on-page once the handoff has been triggered.
    setTimeout(() => {
      window.open(`https://wa.me/917817912062?text=${text}`, "_blank");
      setSubmitting(false);
      setSent(true);
    }, 900);
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:ring-emerald-500 ${
      hasError ? "border-red-400 focus:border-red-400" : "border-gray-300 dark:border-white/10 focus:border-emerald-500"
    }`;

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Hero Banner */}
      <section className="relative h-[45vh] min-h-[320px] flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1400&q=80"
          alt="Himalayan mountains"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-emerald-400 font-semibold text-sm tracking-widest uppercase mb-3"
          >
            Get in Touch
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Plan Your Himalayan Adventure
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-lg max-w-xl mx-auto"
          >
            Our team is here to help you plan your next Himalayan trekking adventure. Reach out today.
          </motion.p>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column – Contact Info */}
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-foreground mb-3">Let&apos;s Start Planning Your Trek</h2>
            <p className="text-muted mb-8 max-w-lg">
              Whether you&apos;re a first-time trekker or an experienced mountaineer, our team will craft the perfect Himalayan journey for you.
            </p>

            <div className="space-y-5">
              {/* Phone */}
              <div className="flex gap-4 p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                  <a href="tel:+917817912062" className="block text-foreground hover:text-emerald-600 transition-colors">+91 78179 12062</a>
                  <p className="text-sm text-muted mt-1">Mon–Fri · 9AM–6PM IST</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Email</h4>
                  <a href="mailto:himalayanarcadventure@gmail.com" className="block text-foreground hover:text-emerald-600 transition-colors">himalayanarcadventure@gmail.com</a>
                  <p className="text-sm text-muted mt-1">We&apos;ll respond within 24 hours</p>
                </div>
              </div>

              {/* Office */}
              <div className="flex gap-4 p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Office</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Gurugram Office</p>
                      <p className="text-sm text-muted">M3M Marina, Sector 68</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Uttarakhand Office</p>
                      <p className="text-sm text-muted">Chamoli, Joshimath, Near Military Hospital</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="mt-8 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-6 border border-emerald-100">
              <h3 className="font-bold text-foreground mb-4">Why Choose Himalayan Arc Adventure?</h3>
              <div className="space-y-3">
                {[
                  "15+ years of Himalayan trekking expertise",
                  "5000+ happy trekkers across India",
                  "24/7 support during treks",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-foreground">
                    <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column – Contact Form */}
          <div className="lg:w-1/2">
            <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-gray-100 dark:border-white/10 p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>

              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted">We&apos;ll get back to you within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="mt-4 text-emerald-600 font-semibold hover:underline">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder="Your full name"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "contact-name-err" : undefined}
                        className={inputClass(!!errors.name)}
                      />
                      {errors.name && <p id="contact-name-err" className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                      <input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        placeholder="your@email.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "contact-email-err" : undefined}
                        className={inputClass(!!errors.email)}
                      />
                      {errors.email && <p id="contact-email-err" className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-type" className="block text-sm font-medium text-foreground mb-1.5">Inquiry Type</label>
                    <select
                      id="contact-type"
                      value={form.type}
                      onChange={(e) => setField("type", e.target.value)}
                      className={inputClass(false)}
                    >
                      <option>General Inquiry</option>
                      <option>Trek Booking</option>
                      <option>Custom Trip</option>
                      <option>Group Booking</option>
                      <option>Corporate Trek</option>
                      <option>Cancellation</option>
                      <option>Payment</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => setField("subject", e.target.value)}
                      placeholder="What's this about?"
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? "contact-subject-err" : undefined}
                      className={inputClass(!!errors.subject)}
                    />
                    {errors.subject && <p id="contact-subject-err" className="mt-1 text-xs text-red-500">{errors.subject}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-foreground mb-1.5">Message</label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => setField("message", e.target.value)}
                      placeholder="Tell us about your dream Himalayan adventure..."
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? "contact-message-err" : undefined}
                      className={`${inputClass(!!errors.message)} resize-none`}
                    />
                    {errors.message && <p id="contact-message-err" className="mt-1 text-xs text-red-500">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-surface dark:bg-background py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold tracking-widest uppercase text-emerald-600">FAQ</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-card rounded-2xl shadow-md border border-gray-100 dark:border-white/10 p-6">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`contact-faq-panel-${i}`}
                  className="w-full flex items-start justify-between gap-4 text-left"
                >
                  <h3 className="font-bold text-foreground">{faq.q}</h3>
                  <svg
                    className={`w-5 h-5 text-muted flex-shrink-0 mt-0.5 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      id={`contact-faq-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-muted text-sm leading-relaxed mt-3 pt-3 border-t border-gray-100 dark:border-white/10">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}