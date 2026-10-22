// Shared setup for the browser checks in e2e/ (Puppeteer drives a real Edge or Chrome).
// Set E2E_BASE_URL to test another address (default: the dev server on :3000). Set
// PUPPETEER_EXECUTABLE_PATH if your browser is not in one of the usual places.
import puppeteer from "puppeteer-core";
import { existsSync } from "node:fs";

export const BASE = (process.env.E2E_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
].filter(Boolean);

export async function launchBrowser() {
  const executablePath = CANDIDATES.find((p) => existsSync(p));
  if (!executablePath) {
    throw new Error("No Edge or Chrome found. Install one, or set PUPPETEER_EXECUTABLE_PATH to its full path.");
  }
  return puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
}

export async function assertServerUp() {
  try {
    const res = await fetch(BASE + "/");
    if (!res.ok) throw new Error(`status ${res.status}`);
  } catch (error) {
    throw new Error(`Nothing is answering at ${BASE} (${error.message}). Start the site first (npm run dev), or set E2E_BASE_URL.`);
  }
}

/** A fresh page at a phone/desktop size. Skips the once-per-session welcome chooser. */
export async function openPage(browser, { width, height = 900 }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, isMobile: width <= 768, hasTouch: width <= 768 });
  await page.evaluateOnNewDocument(() => {
    try {
      sessionStorage.setItem("hac_welcome_seen", "1");
    } catch {
      /* storage blocked */
    }
  });
  return page;
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
