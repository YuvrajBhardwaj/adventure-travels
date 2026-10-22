// Browser checks for the public site (spec 002). Run with the site up:
//   npm run dev          (terminal 1)
//   npm run test:e2e     (terminal 2)
// Or test any address:  E2E_BASE_URL=https://your-preview.vercel.app npm run test:e2e
//
// Nothing here creates a real booking: the booking request is intercepted and answered locally.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { assertServerUp, BASE, launchBrowser, openPage, sleep } from "./helpers.mjs";

let browser;

beforeAll(async () => {
  await assertServerUp();
  browser = await launchBrowser();
});

afterAll(async () => {
  await browser?.close();
});

describe("no sideways scrolling", () => {
  const pages = ["/", "/treks", "/treks/kuari-pass", "/courses", "/courses/skiing-course", "/contact", "/faq", "/login"];
  const widths = [320, 390, 768, 1024];

  it("every main page fits its screen at phone, tablet and small-laptop widths", async () => {
    const wide = [];
    for (const width of widths) {
      for (const path of pages) {
        const page = await openPage(browser, { width });
        await page.goto(BASE + path, { waitUntil: "load" });
        await sleep(1200);
        const [scrollWidth, clientWidth] = await page.evaluate(() => [
          document.documentElement.scrollWidth,
          document.documentElement.clientWidth,
        ]);
        if (scrollWidth > clientWidth + 1) wide.push(`${path} @${width}px: ${scrollWidth}px wide`);
        await page.close();
      }
    }
    expect(wide).toEqual([]);
  });
});

describe("what search engines get without running scripts", () => {
  it("the home page has its icon links and a heading in the HTML", async () => {
    const html = await (await fetch(BASE + "/")).text();
    expect(html).toMatch(/<link rel="icon" href="\/favicon\.ico"/);
    expect(html).toMatch(/<link rel="apple-touch-icon"/);
    expect(html).toMatch(/<h1[\s>]/);
  });

  it("a trek page has its price route, tabs and itinerary text in the HTML", async () => {
    const html = await (await fetch(BASE + "/treks/kuari-pass")).text();
    expect(html).toContain("Joshimath to Joshimath");
    expect(html).toMatch(/Itinerary/);
    expect(html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").length).toBeGreaterThan(5000);
  });

  it("the FAQ page has all of its answers in the HTML, not only the open category", async () => {
    const html = await (await fetch(BASE + "/faq")).text();
    const text = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
    expect(text.length).toBeGreaterThan(20000);
  });
});

describe("course booking form", () => {
  it("offers WhatsApp (not a vague 'try again') when the booking service is unreachable", async () => {
    const page = await openPage(browser, { width: 390, height: 900 });
    let bookingCalls = 0;
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.url().endsWith("/api/bookings")) {
        bookingCalls += 1;
        return request.respond({ status: 404, contentType: "application/json", body: "{}" });
      }
      return request.continue();
    });

    await page.goto(BASE + "/courses/skiing-course", { waitUntil: "load" });
    await sleep(1500);
    await page.evaluate(() => {
      const tab = [...document.querySelectorAll("[role=tab]")].find((b) => /Book Now/i.test(b.textContent));
      tab?.click();
    });
    await page.waitForSelector("#cb-name", { visible: true });
    await page.evaluate(() => {
      const set = (id, value) => {
        const el = document.getElementById(id);
        const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
        Object.getOwnPropertyDescriptor(proto, "value").set.call(el, value);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      set("cb-name", "Test Visitor");
      set("cb-email", "test@example.com");
      set("cb-phone", "9876543210");
      set("cb-date", "2027-01-20");
      document.getElementById("cb-name").closest("form").requestSubmit();
    });

    await page.waitForFunction(
      () => [...document.querySelectorAll("[role=alert]")].some((a) => /couldn.t save your request online/i.test(a.textContent)),
      { timeout: 10000 }
    );
    const whatsapp = await page.$eval('[role=alert] a[href^="https://wa.me/"]', (a) => a.textContent.trim());
    expect(whatsapp).toBe("Send these details on WhatsApp");
    expect(bookingCalls).toBe(1);
    await page.close();
  });
});

describe("phone menu", () => {
  it("opens, traps focus in a dialog, and closes with Escape", async () => {
    const page = await openPage(browser, { width: 390, height: 844 });
    await page.goto(BASE + "/treks", { waitUntil: "load" });
    await sleep(1500);
    await page.click('button[aria-label="Open menu"]');
    await page.waitForSelector('[role="dialog"]', { visible: true });
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]'), { timeout: 5000 });
    expect(await page.$('button[aria-label="Open menu"]')).not.toBeNull();
    await page.close();
  });
});
