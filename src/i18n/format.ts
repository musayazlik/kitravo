import { localeInfo, type Locale } from "./config";
import type { Plural } from "./define";

type Values = Record<string, string | number>;

/** Fills `{name}` placeholders: `fill("Hi {name}", { name: "Ada" })`. */
export function fill(message: string, values: Values = {}) {
  return message.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Picks the plural form for `count` in `locale` and fills `{count}` plus any other values. */
export function plural(locale: Locale, forms: Plural, count: number, values: Values = {}) {
  const category = new Intl.PluralRules(localeInfo[locale].intl).select(count) as keyof Plural;
  const message = forms[category] ?? forms.other;
  return fill(message, { count: new Intl.NumberFormat(localeInfo[locale].intl).format(count), ...values });
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

/**
 * Dates, numbers and sizes in the conventions of one language. Dates are
 * formatted in UTC so the server and the browser print the same text.
 */
function createFormatter(locale: Locale) {
  const tag = localeInfo[locale].intl;
  const date = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const dateTime = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" });
  const dayMonth = new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", timeZone: "UTC" });
  const longDate = new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const number = new Intl.NumberFormat(tag);
  const compact = new Intl.NumberFormat(tag, { notation: "compact", maximumFractionDigits: 1 });
  const change = new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" });
  const relative = new Intl.RelativeTimeFormat(tag, { numeric: "auto" });
  const list = new Intl.ListFormat(tag, { style: "long", type: "conjunction" });
  const languages = new Intl.DisplayNames([tag], { type: "language" });

  return {
    locale,
    date: (value: string | Date) => date.format(new Date(value)),
    dateTime: (value: string | Date) => dateTime.format(new Date(value)),
    dayMonth: (value: string | Date) => dayMonth.format(new Date(value)),
    longDate: (value: string | Date) => longDate.format(new Date(value)),
    number: (value: number) => number.format(value),
    compact: (value: number) => compact.format(value),
    /** `0.42` → "42%" (or "%42" in Turkish). */
    percent: (ratio: number, digits = 0) => new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: digits }).format(ratio),
    /** `0.186` → "+18.6%", for trends. */
    change: (ratio: number) => change.format(ratio),
    list: (items: string[]) => list.format(items),
    /** A language's name in this language: `language("de")` → "German", "Almanca", "Deutsch"… */
    language: (code: Locale) => languages.of(code) ?? code,
    /** "3 hours ago". Reads the clock, so call it after mount (see `TimeAgo`). */
    timeAgo: (value: string | Date, now = Date.now()) => {
      const seconds = Math.round((new Date(value).getTime() - now) / 1000);
      const [unit, size] = RELATIVE_UNITS.find(([, size]) => Math.abs(seconds) >= size) ?? ["second", 1];
      return relative.format(Math.round(seconds / size), unit);
    },
    bytes: (bytes: number) => {
      if (bytes < 1024) return new Intl.NumberFormat(tag, { style: "unit", unit: "byte", unitDisplay: "short" }).format(bytes);
      if (bytes < 1024 * 1024) return new Intl.NumberFormat(tag, { style: "unit", unit: "kilobyte", unitDisplay: "short", maximumFractionDigits: 0 }).format(bytes / 1024);
      if (bytes < 1024 ** 3) return new Intl.NumberFormat(tag, { style: "unit", unit: "megabyte", unitDisplay: "short", maximumFractionDigits: 1 }).format(bytes / 1024 ** 2);
      return new Intl.NumberFormat(tag, { style: "unit", unit: "gigabyte", unitDisplay: "short", maximumFractionDigits: 1 }).format(bytes / 1024 ** 3);
    },
  };
}

export type Formatter = ReturnType<typeof createFormatter>;

const formatters = new Map<Locale, Formatter>();

/** `Intl` objects are costly to build, so each language gets one formatter, shared. */
export function getFormatter(locale: Locale) {
  let formatter = formatters.get(locale);
  if (!formatter) {
    formatter = createFormatter(locale);
    formatters.set(locale, formatter);
  }
  return formatter;
}
