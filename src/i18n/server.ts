import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { isLocale, localeInfo, locales, localizeHref, type Locale } from "./config";
import type { Plural } from "./define";
import { dictionaryFor, type Dictionary } from "./dictionary";
import { getFormatter, plural } from "./format";

/** The language of the current request, from the `/[lang]` segment. Unknown languages 404. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}

/**
 * Messages, formatting and helpers for Server Components and metadata:
 * `const { t, f } = await getI18n();`
 */
export async function getI18n() {
  const locale = await getLocale();
  return {
    locale,
    t: dictionaryFor(locale),
    dir: localeInfo[locale].dir,
    f: getFormatter(locale),
    plural: (forms: Plural, count: number, values?: Record<string, string | number>) => plural(locale, forms, count, values),
  };
}

/** Messages for the current language, for Server Components that need nothing else. */
export async function getDictionary() {
  return dictionaryFor(await getLocale());
}

/**
 * `generateMetadata` for the many pages whose metadata is just a title:
 * `export const generateMetadata = titleMetadata((t) => t.nav.items.media);`
 */
export function titleMetadata(pick: (t: Dictionary) => string) {
  return async (): Promise<Metadata> => ({ title: pick(await getDictionary()) });
}

/**
 * `alternates` for a page that exists in every language: the canonical URL
 * in the current one, plus `hreflang` links to the rest.
 */
export async function localizedAlternates(path: string, available: readonly Locale[] = locales): Promise<Metadata["alternates"]> {
  const locale = await getLocale();
  return {
    canonical: localizeHref(path, locale),
    languages: {
      ...Object.fromEntries(available.map((code) => [code, `${siteConfig.url}${localizeHref(path, code)}`])),
      "x-default": `${siteConfig.url}${localizeHref(path, available.includes("en") ? "en" : available[0])}`,
    },
  };
}
