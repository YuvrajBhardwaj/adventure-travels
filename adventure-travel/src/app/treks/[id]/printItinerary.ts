import type { Trek } from "@/data/treks";
import { getTrekPackage } from "@/data/trekPackage";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
const inr = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;
const list = (items: string[]) => `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

/**
 * Opens the trek's itinerary as a plain, print-ready page and the browser's print
 * dialog, where "Save as PDF" gives the visitor a file to keep or forward. Built from
 * the same data as the trek page, so it can't drift from what the site shows.
 * Returns false when a popup blocker stopped the new window.
 */
export function printItinerary(trek: Trek): boolean {
  const win = window.open("", "_blank");
  if (!win) return false;
  const pkg = getTrekPackage(trek);
  const ft = Math.round(trek.maxAltitude * 3.28084).toLocaleString("en-IN");

  const facts = [
    `${trek.days} days`,
    trek.difficulty,
    `Highest point ${trek.maxAltitude.toLocaleString("en-IN")} m (${ft} ft)`,
    trek.startsFrom ? `Starts from ${trek.startsFrom}` : trek.location ?? trek.region,
    `Best season: ${trek.bestSeason}`,
  ];
  const prices = trek.roomSharing
    ? trek.roomSharing.map((r) => `<li>${esc(r.label)} (${r.perRoom} per room): <b>${inr(r.price)}</b> per person</li>`).join("")
    : `<li><b>${inr(trek.price)}</b> per person</li>`;
  const days = trek.itinerary
    .map(
      (d) => `
      <section class="day">
        <h3><span>Day ${d.day}</span>${esc(d.title)}</h3>
        <p class="meta">${d.altitude.toLocaleString("en-IN")} m${d.hours ? ` · ${d.hours} hrs` : ""}${d.meals ? ` · Meals: ${esc(d.meals)}` : ""}</p>
        <p>${esc(d.description)}</p>
        ${d.note ? `<p class="note">Note: ${esc(d.note)}</p>` : ""}
      </section>`,
    )
    .join("");

  win.document.write(`<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8">
<title>${esc(trek.name)} itinerary · Himalayan Arc Adventure</title>
<style>
  @page { margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { font: 13px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 24px auto; max-width: 760px; padding: 0 16px; }
  header { border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 16px; }
  .brand { color: #059669; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; font-size: 11px; }
  h1 { font-size: 26px; margin: 4px 0 8px; }
  .facts { color: #475569; margin: 0; }
  h2 { font-size: 15px; margin: 22px 0 8px; color: #047857; text-transform: uppercase; letter-spacing: .05em; }
  ul { margin: 0; padding-left: 18px; }
  .day { border-left: 3px solid #d1fae5; padding: 2px 0 2px 12px; margin: 0 0 12px; break-inside: avoid; }
  .day h3 { font-size: 14px; margin: 0; }
  .day h3 span { display: inline-block; background: #059669; color: #fff; border-radius: 4px; padding: 0 6px; margin-right: 8px; font-size: 11px; }
  .day p { margin: 4px 0 0; }
  .meta { color: #64748b; font-size: 12px; }
  .note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 6px 8px; font-weight: 600; color: #78350f; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; break-inside: avoid; }
  footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 10px; color: #475569; font-size: 12px; }
  @media (max-width: 560px) { .cols { grid-template-columns: 1fr; } }
</style></head><body>
<header>
  <div class="brand">Himalayan Arc Adventure</div>
  <h1>${esc(trek.name)}</h1>
  <p class="facts">${facts.map(esc).join(" · ")}</p>
</header>
<p>${esc(trek.blurb)}</p>
<h2>Price</h2><ul>${prices}</ul>
<h2>Day by day</h2>${days}
<div class="cols">
  <div><h2>Included</h2>${list(pkg.included)}</div>
  <div><h2>Not included</h2>${list(pkg.excluded.map((i) => i.replace(/ — see the Packing List tab$/, "")))}</div>
</div>
<footer>
  Questions or bookings: +91 78179 12062 · +91 86505 61564 (call or WhatsApp)<br>
  www.himalayanarcadventure.com/treks/${esc(trek.slug)}
</footer>
</body></html>`);
  win.document.close();
  win.focus();
  win.print();
  return true;
}
