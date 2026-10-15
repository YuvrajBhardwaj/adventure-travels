/** All catalogue prices are stored in INR. Everything else is a display conversion. */
export const BASE_CURRENCY = "INR";

const EUROZONE = ["AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES"];

const SINGLE: Record<string, string> = {
  IN: "INR", US: "USD", CA: "CAD", GB: "GBP", AU: "AUD", NZ: "NZD", SG: "SGD", AE: "AED",
  SA: "SAR", QA: "QAR", KW: "KWD", BH: "BHD", OM: "OMR", CH: "CHF", JP: "JPY", CN: "CNY",
  HK: "HKD", KR: "KRW", TH: "THB", MY: "MYR", ID: "IDR", PH: "PHP", VN: "VND", LK: "LKR",
  NP: "NPR", BD: "BDT", PK: "PKR", ZA: "ZAR", EG: "EGP", NG: "NGN", KE: "KES", BR: "BRL",
  MX: "MXN", AR: "ARS", CL: "CLP", CO: "COP", RU: "RUB", TR: "TRY", IL: "ILS", SE: "SEK",
  NO: "NOK", DK: "DKK", PL: "PLN", CZ: "CZK", HU: "HUF", RO: "RON", BG: "BGN", UA: "UAH",
  IS: "ISK",
};

export const COUNTRY_CURRENCY: Record<string, string> = {
  ...SINGLE,
  ...Object.fromEntries(EUROZONE.map((c) => [c, "EUR"])),
};

/** Offered in the manual switcher (a detected currency outside this list is added too). */
export const SWITCHER_CURRENCIES = ["INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED", "NZD", "CHF", "JPY", "THB", "MYR", "ZAR"];

/**
 * Country → display currency.
 *  - no country (local dev, lookup failed) → INR. We never guess from the browser
 *    language: plenty of Indian visitors run an en-US browser.
 *  - a country we haven't mapped → USD, the common international reference.
 */
export function currencyForCountry(country: string | null | undefined): string {
  if (!country) return BASE_CURRENCY;
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? "USD";
}

/** Formats an INR amount in `currency` at `rate` (units of currency per 1 INR). */
export function formatMoney(inr: number, currency: string, rate: number): string {
  if (currency === BASE_CURRENCY || !Number.isFinite(rate) || rate <= 0) {
    // Matches how the site has always written rupee prices.
    return `Rs.${Math.round(inr).toLocaleString("en-IN")}`;
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(inr * rate);
  } catch {
    return `Rs.${Math.round(inr).toLocaleString("en-IN")}`;
  }
}
