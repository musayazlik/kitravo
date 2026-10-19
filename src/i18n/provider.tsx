"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import { localeInfo, type Locale } from "./config";
import type { Plural } from "./define";
import type { Dictionary } from "./dictionary";
import { getFormatter, plural } from "./format";

type I18nValue = { locale: Locale; t: Dictionary };

const I18nContext = createContext<I18nValue | null>(null);

/** Set once in the root layout: the language from the URL and its messages. */
export function I18nProvider({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t: dictionary }), [locale, dictionary]);
  return <I18nContext value={value}>{children}</I18nContext>;
}

/**
 * Messages and formatting for the current language.
 *
 * ```tsx
 * const { t, f, plural } = useI18n();
 * t.posts.title;                       // "Posts"
 * plural(t.posts.rows, 3);             // "3 rows"
 * f.date(post.updatedAt);              // "18 Oct 2026"
 * ```
 */
export function useI18n() {
  const context = use(I18nContext);
  if (!context) throw new Error("useI18n must be used within <I18nProvider>");
  const { locale, t } = context;

  return useMemo(
    () => ({
      locale,
      t,
      dir: localeInfo[locale].dir,
      f: getFormatter(locale),
      plural: (forms: Plural, count: number, values?: Record<string, string | number>) => plural(locale, forms, count, values),
    }),
    [locale, t],
  );
}
