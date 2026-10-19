/**
 * Languages the whole system runs in: the panel interface, the public site
 * and post content. Every route lives under `/[lang]`; `proxy.ts` sends
 * unprefixed URLs to the visitor's language.
 */
export const locales = ["en", "tr", "de", "ar", "zh"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Remembers an explicit choice from the language switcher; read by `proxy.ts`. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export type LocaleInfo = {
  /** Name in its own language, as the switcher shows it. */
  name: string;
  /** Name in English, for search and screen readers. */
  english: string;
  dir: "ltr" | "rtl";
  /** BCP 47 tag for `Intl` formatting. Arabic keeps Latin digits so tables and counters stay comparable. */
  intl: string;
  /** Titles transliterate to a Latin URL slug. Arabic and Chinese do not, so their posts keep the source slug. */
  latinSlugs: boolean;
};

export const localeInfo: Record<Locale, LocaleInfo> = {
  en: { name: "English", english: "English", dir: "ltr", intl: "en-GB", latinSlugs: true },
  tr: { name: "Türkçe", english: "Turkish", dir: "ltr", intl: "tr-TR", latinSlugs: true },
  de: { name: "Deutsch", english: "German", dir: "ltr", intl: "de-DE", latinSlugs: true },
  ar: { name: "العربية", english: "Arabic", dir: "rtl", intl: "ar-u-nu-latn", latinSlugs: false },
  zh: { name: "简体中文", english: "Chinese (Simplified)", dir: "ltr", intl: "zh-CN", latinSlugs: false },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

/** `/tr/posts/1` → `{ locale: "tr", path: "/panel/posts/1" }`. Unprefixed paths return `locale: null`. */
export function splitLocale(pathname: string): { locale: Locale | null; path: string } {
  const [, first, ...rest] = pathname.split("/");
  if (isLocale(first)) return { locale: first, path: `/${rest.join("/")}` };
  return { locale: null, path: pathname || "/" };
}

/** Files and internal routes keep their own URL; everything else is a page under a language. */
function isPagePath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") && !/^\/(api|_next|images)(\/|$)/.test(path) && !/\.[a-z0-9]+$/i.test(path.split(/[?#]/)[0]);
}

/**
 * Prefixes an internal href with the language: `/panel/posts` → `/tr/posts`,
 * `/#start` → `/tr#start`. External links, files and already prefixed
 * paths pass through unchanged.
 */
export function localizeHref(href: string, locale: Locale) {
  if (!isPagePath(href)) return href;
  if (splitLocale(href).locale) return href;
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const suffix = cut === -1 ? "" : href.slice(cut);
  return `/${locale}${path === "/" ? "" : path}${suffix}`;
}

/** The same page in another language. */
export function switchLocaleHref(pathname: string, locale: Locale) {
  return localizeHref(splitLocale(pathname).path, locale);
}
