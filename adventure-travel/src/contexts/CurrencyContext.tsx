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
  /** "user" = picked in the switcher, "auto" = detected from the visitor's location. */
  source: "user" | "auto";
  /**
   * The visitor chose to follow their location ("Auto" in the switcher, or "Use my location").
   * Without it the site shows INR (owner, 25 Nov 2026); older "auto" entries saved before
   * that change don't have it, so they go back to INR too.
   */
  chosen?: boolean;
  currency: string;
  country?: string | null;
  /** "device" = from the browser's location (GPS/Wi-Fi), which then wins over the IP guess. */
  countrySource?: "ip" | "device";
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
  /** Where `country` came from: the IP guess (follows VPNs) or the device's own location. */
  countrySource: "ip" | "device";
  /** Ask the browser for the device's location and set country, currency and price list from it. */
  locate: () => Promise<LocateResult>;
  locating: boolean;
}

export type LocateResult = "ok" | "denied" | "unavailable";

/**
 * Country code for a position, via BigDataCloud's free client-side reverse geocoder (no key;
 * listed in the CSP connect-src in vercel.json). Only the rounded coordinates are sent.
 */
async function countryAt(lat: number, lon: number): Promise<string | null> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&localityLanguage=en`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const code = String((await res.json()).countryCode ?? "").toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

function devicePosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60 * 60 * 1000 })
  );
}

const Ctx = createContext<CurrencyCtx>({
  currency: BASE_CURRENCY,
  country: null,
  mode: "user",
  detected: BASE_CURRENCY,
  converted: false,
  rates: null,
  updatedAt: null,
  format: (inr) => formatMoney(inr, BASE_CURRENCY, 1),
  setCurrency: () => {},
  nationality: "indian",
  nationalitySource: "user",
  setNationality: () => {},
  countrySource: "ip",
  locate: async () => "unavailable",
  locating: false,
});

function readSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}
/** Following the location only when the visitor chose it; everyone else sees INR. */
const following = (s: Saved | null | undefined) => s?.source === "auto" && s.chosen === true;

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
  // INR is the default, shown as a normal pick; "auto" only after the visitor chooses it.
  const [mode, setMode] = useState<"auto" | "user">("user");
  const [country, setCountry] = useState<string | null>(null);
  const [rates, setRates] = useState<Rates | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  // Indian national prices unless the visitor picks foreign, or "auto" (follow the location).
  // null = nothing picked = Indian (owner, 25 Nov 2026).
  const [pickedNationality, setPickedNationality] = useState<Nationality | "auto" | null>(null);
  const [countrySource, setCountrySource] = useState<"ip" | "device">("ip");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(NATIONALITY_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (v === "indian" || v === "foreign" || v === "auto") setPickedNationality(v);
    } catch {
      /* storage blocked: Indian prices */
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
      setCountrySource(saved.countrySource ?? "ip");
      const keep = saved.source === "user" || following(saved);
      setMode(following(saved) ? "auto" : "user");
      setCurrencyState(keep && saved.rates[saved.currency] ? saved.currency : BASE_CURRENCY);
    }

    (async () => {
      const [ratesRes, geoRes] = await Promise.allSettled([
        fetch("/api/rates").then((r) => (r.ok ? r.json() : Promise.reject(new Error("rates")))),
        // A country found from the device's location beats the IP guess, so skip the lookup.
        saved?.source === "user" || saved?.countrySource === "device"
          ? Promise.resolve(null)
          : fetch("/api/geo").then((r) => (r.ok ? r.json() : null)),
      ]);
      if (cancelled) return;

      const table: Rates | null = ratesRes.status === "fulfilled" ? ratesRes.value.rates : (saved?.rates ?? null);
      if (ratesRes.status === "fulfilled") setUpdatedAt(ratesRes.value.updatedAt ?? null);
      setRates(table);

      // ?country=US (any 2-letter code) previews the site as a visitor from there, e.g. under
      // `npm run dev`, where /api/geo doesn't run. It only changes what is shown; bookings are
      // still priced by the nationality chosen on the form.
      const forced = new URLSearchParams(window.location.search).get("country");
      // The silent device lookup may have finished while we waited: never overwrite it with the IP guess.
      const latest = readSaved();
      const device = latest?.countrySource === "device" ? latest : saved?.countrySource === "device" ? saved : null;
      const detectedCountry: string | null = forced && /^[a-z]{2}$/i.test(forced)
        ? forced.toUpperCase()
        : device
          ? (device.country ?? null)
          : geoRes.status === "fulfilled" && geoRes.value ? (geoRes.value.country ?? null) : (saved?.country ?? null);
      const fromDevice = !forced && Boolean(device);
      setCountry(detectedCountry);
      setCountrySource(fromDevice ? "device" : "ip");

      // A manual pick stays; "Auto" (chosen) follows the country; everyone else gets INR.
      const auto = following(saved);
      const wanted = saved?.source === "user" ? saved.currency : auto ? currencyForCountry(detectedCountry) : BASE_CURRENCY;
      // No rate (upstream down, unknown code) → stay in INR rather than guess.
      const final = wanted === BASE_CURRENCY || (table && table[wanted]) ? wanted : BASE_CURRENCY;
      setCurrencyState(final);
      setMode(auto ? "auto" : "user");

      if (table) {
        writeSaved({
          source: auto ? "auto" : "user",
          ...(auto ? { chosen: true } : {}),
          currency: final,
          country: detectedCountry,
          countrySource: fromDevice ? "device" : "ip",
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
        writeSaved({ source: "auto", chosen: true, currency: detected, country, rates: rates ?? undefined, ts: Date.now() });
        return;
      }
      const next = code === BASE_CURRENCY || (rates && rates[code]) ? code : BASE_CURRENCY;
      setMode("user");
      setCurrencyState(next);
      writeSaved({ source: "user", currency: next, country, rates: rates ?? undefined, ts: Date.now() });
    },
    [detected, country, rates]
  );

  /**
   * Find the country from the device's location. `chosen` = the visitor tapped "Use my
   * location": currency and price list then follow the location. The silent refresh on page
   * load only updates the country, so the INR / Indian defaults stay unless they chose Auto.
   */
  const runLocate = useCallback(async (chosen: boolean): Promise<LocateResult> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return "unavailable";
    setLocating(true);
    try {
      const pos = await devicePosition();
      const code = await countryAt(pos.coords.latitude, pos.coords.longitude);
      if (!code) return "unavailable";
      setCountry(code);
      setCountrySource("device");
      const saved = readSaved();
      const auto = chosen || following(saved);
      const table = rates ?? saved?.rates ?? null;
      const wanted = currencyForCountry(code);
      const next = auto ? (table && table[wanted] ? wanted : BASE_CURRENCY) : (saved?.source === "user" ? saved.currency : BASE_CURRENCY);
      if (auto) {
        setMode("auto");
        setCurrencyState(next);
      }
      if (chosen) {
        setPickedNationality("auto");
        try {
          localStorage.setItem(NATIONALITY_KEY, "auto");
        } catch {
          /* storage blocked: lasts for this visit */
        }
      }
      writeSaved({
        source: auto ? "auto" : "user",
        ...(auto ? { chosen: true } : {}),
        currency: next,
        country: code,
        countrySource: "device",
        rates: table ?? undefined,
        ts: Date.now(),
      });
      return "ok";
    } catch (err) {
      // GeolocationPositionError code 1 = the visitor said no.
      return (err as { code?: number })?.code === 1 ? "denied" : "unavailable";
    } finally {
      setLocating(false);
    }
  }, [rates]);
  const locate = useCallback(() => runLocate(true), [runLocate]);

  // Visitors who already allowed location for this site get it refreshed silently; nobody is
  // prompted on page load (only the "Use my location" button asks).
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    let cancelled = false;
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((p) => {
        if (!cancelled && p.state === "granted") void runLocate(false);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // Once per page load; locate's identity changes when rates arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setNationality = useCallback((n: Nationality | "auto") => {
    setPickedNationality(n);
    try {
      localStorage.setItem(NATIONALITY_KEY, n);
    } catch {
      /* storage blocked: the pick lasts for this visit */
    }
  }, []);
  const autoNationality: Nationality = country && country.toUpperCase() !== "IN" ? "foreign" : "indian";
  // Nothing picked → Indian national prices; "auto" → from the location.
  const nationality: Nationality = pickedNationality === "auto" ? autoNationality : (pickedNationality ?? "indian");

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
      nationalitySource: pickedNationality === "auto" ? "auto" : "user",
      setNationality,
      countrySource,
      locate,
      locating,
    }),
    [currency, country, mode, detected, rates, updatedAt, rate, setCurrency, nationality, pickedNationality, setNationality, countrySource, locate, locating]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCurrency = () => useContext(Ctx);
