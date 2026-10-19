"use client";

import NextLink from "next/link";
import { usePathname as useNextPathname, useRouter as useNextRouter } from "next/navigation";
import { useMemo, type ComponentProps } from "react";
import { localizeHref, splitLocale } from "./config";
import { useI18n } from "./provider";

/**
 * Language-aware replacements for `next/link` and `next/navigation`. Write
 * hrefs without the language (`/panel/posts`); they resolve to the current one
 * (`/tr/posts`). Pass `locale` to link to another language.
 */
export function Link({ href, locale: target, ...props }: Omit<ComponentProps<typeof NextLink>, "locale"> & { locale?: ReturnType<typeof useI18n>["locale"] }) {
  const { locale } = useI18n();
  const lang = target ?? locale;
  const localized = typeof href === "string" ? localizeHref(href, lang) : { ...href, pathname: href.pathname ? localizeHref(href.pathname, lang) : href.pathname };
  return <NextLink href={localized} hrefLang={target} {...props} />;
}

export function useRouter() {
  const router = useNextRouter();
  const { locale } = useI18n();

  return useMemo(
    () => ({
      ...router,
      push: (href: string, options?: Parameters<typeof router.push>[1]) => router.push(localizeHref(href, locale), options),
      replace: (href: string, options?: Parameters<typeof router.replace>[1]) => router.replace(localizeHref(href, locale), options),
      prefetch: (href: string, options?: Parameters<typeof router.prefetch>[1]) => router.prefetch(localizeHref(href, locale), options),
    }),
    [router, locale],
  );
}

/** The current path without its language: `/tr/posts/tags` → `/panel/posts/tags`. Reads URL data, so render it inside `<Suspense>`. */
export function usePathname() {
  return splitLocale(useNextPathname()).path;
}
