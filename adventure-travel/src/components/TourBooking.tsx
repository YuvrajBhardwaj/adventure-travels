"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Price from "@/components/Price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface TourPackage {
  id: string;
  name: string;
  /** e.g. "3 days / 2 nights". */
  length: string;
  /** Per person, INR; null shows "Price on request". */
  price: number | null;
  /** What the price covers, shown under "Show details". */
  includes: { label?: string; text: string }[];
}

/** The package picked on the cards, shared with the enquiry box. */
const PackageContext = createContext<{ selected: string; select: (id: string) => void }>({ selected: "", select: () => {} });

export function TourBookingProvider({ initial, children }: { initial: string; children: ReactNode }) {
  const [selected, select] = useState(initial);
  return <PackageContext.Provider value={{ selected, select }}>{children}</PackageContext.Provider>;
}

/** Selectable package cards; each opens a "Show details" list of what the price covers. */
export function TourPackages({ packages }: { packages: TourPackage[] }) {
  const { selected, select } = useContext(PackageContext);
  return (
    <div role="radiogroup" aria-label="Package options" className="space-y-4">
      {packages.map((p) => {
        const on = selected === p.id;
        return (
          <div
            key={p.id}
            className={cn(
              "rounded-2xl border bg-white p-5 transition-colors duration-150 ease-out sm:p-6",
              on ? "border-emerald-500 ring-1 ring-emerald-500" : "border-slate-200"
            )}
          >
            <button
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => select(p.id)}
              className="flex w-full items-start gap-4 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span
                aria-hidden
                className={cn(
                  "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  on ? "border-emerald-600" : "border-slate-300"
                )}
              >
                {on && <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-xl font-medium text-slate-900">{p.name}</span>
                <span className="mt-1 block text-sm text-slate-500">{p.length}</span>
              </span>
              <span className="shrink-0 text-right">
                {p.price === null ? (
                  <span className="block font-heading text-lg font-medium text-slate-900">Price on request</span>
                ) : (
                  <>
                    <span className="block font-heading text-2xl font-medium tabular-nums text-slate-900"><Price inr={p.price} /></span>
                    <span className="block text-xs text-slate-500">per person</span>
                  </>
                )}
              </span>
            </button>
            <details className="group mt-3 pl-9">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800 [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Show details</span>
                <span className="hidden group-open:inline">Hide details</span>
              </summary>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Price includes</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                {p.includes.map((x) => (
                  <li key={x.text} className="flex gap-2">
                    <span aria-hidden className="text-emerald-600">✓</span>
                    <span>{x.label && <strong className="font-semibold text-slate-800">{x.label}: </strong>}{x.text}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The enquiry box beside a tour page. Nothing is stored: "Send enquiry" opens WhatsApp with
 * the details filled in, like the site's other enquiry forms.
 */
export function TourEnquiry({ tourName, packages, offer }: { tourName: string; packages: TourPackage[]; offer?: string }) {
  const { selected, select } = useContext(PackageContext);
  const [form, setForm] = useState({ name: "", phone: "", date: "", travellers: "2", message: "" });
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const pkg = packages.find((p) => p.id === selected);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.phone.replace(/\D/g, "").length < 10) {
      setError("Please add your name and a 10-digit phone number.");
      return;
    }
    setError("");
    const text = [
      `Hi! I'd like to enquire about the ${tourName}.`,
      pkg && `Package: ${pkg.name}`,
      form.date && `Date: ${form.date}`,
      `Travellers: ${form.travellers}`,
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      form.message.trim() && `Message: ${form.message.trim()}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/917817912062?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <form onSubmit={send} noValidate className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-heading text-2xl font-medium tracking-[-0.015em] text-slate-900">Plan your trip</h2>
      {offer && <p className="mt-1 text-sm font-medium text-emerald-700">{offer}</p>}
      <div className="mt-5 space-y-4">
        <div>
          <Label htmlFor="enq-name">Your name</Label>
          <Input id="enq-name" autoComplete="name" value={form.name} onChange={set("name")} />
        </div>
        <div>
          <Label htmlFor="enq-phone">Phone (WhatsApp)</Label>
          <Input id="enq-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" value={form.phone} onChange={set("phone")} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="enq-date">Travel date</Label>
            <Input id="enq-date" type="date" value={form.date} onChange={set("date")} />
          </div>
          <div>
            <Label htmlFor="enq-travellers">Travellers</Label>
            <Select id="enq-travellers" value={form.travellers} onChange={set("travellers")}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10+"].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </div>
        </div>
        {packages.length > 1 && (
          <div>
            <Label htmlFor="enq-package">Package</Label>
            <Select id="enq-package" value={selected} onChange={(e) => select(e.target.value)}>
              {packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </div>
        )}
        <div>
          <Label htmlFor="enq-message">Message (optional)</Label>
          <Textarea id="enq-message" rows={3} value={form.message} onChange={set("message")} />
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="mt-5 w-full">Send enquiry on WhatsApp</Button>
      <ul className="mt-4 space-y-1.5 text-xs text-slate-500">
        <li className="flex gap-2"><span aria-hidden className="text-emerald-600">✓</span>We don&apos;t store these details; they go to us on WhatsApp.</li>
        <li className="flex gap-2"><span aria-hidden className="text-emerald-600">✓</span>We only use them to reply about your trip.</li>
      </ul>
    </form>
  );
}
