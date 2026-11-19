"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { BASE_CURRENCY, currencyForCountry, formatMoney } from "@/lib/currency";

const STORAGE_KEY = "hac_currency_v1";
/** A visitor's own pick of the Indian or foreign price list (absent = follow their location). */
const NATIONALITY_KEY = "hac_nationality_v1";

export type Nationality = "indian" | "foreign";
const FRESH_MS = 6 * 60 * 60 * 1000;

type Rates = Record<string, number>;

interface Saved {
  /** "user" = picked in the switcher, "auto" = detected from the visitor's IP. */
  source: "user" | "auto";
  currency: string;
  country?: string | null;
  rates?: Rates;
  ts: number;
}

interface CurrencyCtx {
  /** Currency prices are currently shown in. */
  currency: string;
  /** Country the IP lookup reported, if any. */
  country: string | null;
  /** "auto" means following the visitor's location, "user" a manual pick. */
  mode: "auto" | "user";
  /** Currency auto-detection would choose (shown as the "Auto" option). */
  detected: string;
  /** True when amounts are being converted away from INR. */
  converted: boolean;
  rates: Rates | null;
  updatedAt: string | null;
  format: (inr: number) => string;
  setCurrency: (code: string | "auto") => void;
  /** Which price list to show: foreign nationals pay FOREIGN_MULTIPLIER × (src/lib/paymentRules.ts). */
  nationality: Nationality;
  /** "auto" = from the visitor's location (outside India → foreign), "user" = picked. */
  nationalitySource: "auto" | "user";
  setNationality: (n: Nationality | "auto") => void;
}

const Ctx = createContext<CurrencyCtx>({
  currency: BASE_CURRENCY,
  country: null,
  mode: "auto",
  detected: BASE_CURRENCY,
  converted: false,
  rates: null,
  updatedAt: null,
  format: (inr) => formatMoney(inr, BASE_CURRENCY, 1),
  setCurrency: () => {},
  nationality: "indian",
  nationalitySource: "auto",
  setNationality: () => {},
});

function readSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
function writeSaved(value: Saved) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage blocked — fine, we just re-detect next time */
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Server HTML and the first client render are always INR, so hydration never
  // mismatches; conversion happens right after mount.
  const [currency, setCurrencyState] = useState(BASE_CURRENCY);
  const [mode, setMode] = useState<"auto" | "user">("auto");
  const [country, setCountry] = useState<string | null>(null);
  const [rates, setRates] = useState<Rates | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  // Indian until we know better, so the static HTML and first render match.
  const [pickedNationality, setPickedNationality] = useState<Nationality | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(NATIONALITY_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (v === "indian" || v === "foreign") setPickedNationality(v);
    } catch {
      /* storage blocked: follow the location */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const saved = readSaved();

    // Instant paint from the last visit, then revalidate below.
    if (saved?.rates && saved.ts && Date.now() - saved.ts < FRESH_MS) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRates(saved.rates);
      setCountry(saved.country ?? null);
      setMode(saved.source);
      setCurrencyState(saved.rates[saved.currency] ? saved.currency : BASE_CURRENCY);
    }

    (async () => {
      const [ratesRes, geoRes] = await Promise.allSettled([
        fetch("/api/rates").then((r) => (r.ok ? r.json() : Promise.reject(new Error("rates")))),
        saved?.source === "user" ? Promise.resolve(null) : fetch("/api/geo").then((r) => (r.ok ? r.json() : null)),
      ]);
      if (cancelled) return;

      const table: Rates | null = ratesRes.status === "fulfilled" ? ratesRes.value.rates : (saved?.rates ?? null);
      if (ratesRes.status === "fulfilled") setUpdatedAt(ratesRes.value.updatedAt ?? null);
      setRates(table);

      // ?country=US (any 2-letter code) previews the site as a visitor from there, e.g. under
      // `npm run dev`, where /api/geo doesn't run. It only changes what is shown; bookings are
      // still priced by the nationality chosen on the form.
      const forced = new URLSearchParams(window.location.search).get("country");
      const detectedCountry: string | null = forced && /^[a-z]{2}$/i.test(forced)
        ? forced.toUpperCase()
        : geoRes.status === "fulfilled" && geoRes.value ? (geoRes.value.country ?? null) : (saved?.country ?? null);
      setCountry(detectedCountry);

      const wanted = saved?.source === "user" ? saved.currency : currencyForCountry(detectedCountry);
      // No rate (upstream down, unknown code) → stay in INR rather than guess.
      const final = table && table[wanted] ? wanted : BASE_CURRENCY;
      setCurrencyState(final);
      setMode(saved?.source === "user" ? "user" : "auto");

      if (table) {
        writeSaved({
          source: saved?.source === "user" ? "user" : "auto",
          currency: final,
          country: detectedCountry,
          rates: table,
          ts: Date.now(),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const detected = useMemo(() => {
    const code = currencyForCountry(country);
    return rates && rates[code] ? code : BASE_CURRENCY;
  }, [country, rates]);

  const setCurrency = useCallback(
    (code: string | "auto") => {
      if (code === "auto") {
        setMode("auto");
        setCurrencyState(detected);
        writeSaved({ source: "auto", currency: detected, country, rates: rates ?? undefined, ts: Date.now() });
        return;
      }
      const next = code === BASE_CURRENCY || (rates && rates[code]) ? code : BASE_CURRENCY;
      setMode("user");
      setCurrencyState(next);
      writeSaved({ source: "user", currency: next, country, rates: rates ?? undefined, ts: Date.now() });
    },
    [detected, country, rates]
  );

  const setNationality = useCallback((n: Nationality | "auto") => {
    setPickedNationality(n === "auto" ? null : n);
    try {
      if (n === "auto") localStorage.removeItem(NATIONALITY_KEY);
      else localStorage.setItem(NATIONALITY_KEY, n);
    } catch {
      /* storage blocked: the pick lasts for this visit */
    }
  }, []);
  const autoNationality: Nationality = country && country.toUpperCase() !== "IN" ? "foreign" : "indian";
  const nationality = pickedNationality ?? autoNationality;

  const rate = currency === BASE_CURRENCY ? 1 : (rates?.[currency] ?? 1);
  const value = useMemo<CurrencyCtx>(
    () => ({
      currency,
      country,
      mode,
      detected,
      converted: currency !== BASE_CURRENCY,
      rates,
      updatedAt,
      format: (inr: number) => formatMoney(inr, currency, rate),
      setCurrency,
      nationality,
      nationalitySource: pickedNationality ? "user" : "auto",
      setNationality,
    }),
    [currency, country, mode, detected, rates, updatedAt, rate, setCurrency, nationality, pickedNationality, setNationality]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCurrency = () => useContext(Ctx);
