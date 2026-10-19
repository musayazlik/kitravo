import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { publishedTranslations } from "@/features/blog/data/articles";
import { postLocales } from "@/features/posts/data/schema";
import { localizeHref, locales, type Locale } from "@/i18n/config";

const absolute = (path: string, locale: Locale) => `${siteConfig.url}${localizeHref(path, locale)}`;

/** One entry per language for every page, each listing its translations as hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const everyLanguage = (path: string) => Object.fromEntries(locales.map((locale) => [locale, absolute(path, locale)]));

  return [
    ...locales.map((locale) => ({
      url: absolute("/", locale),
      changeFrequency: "weekly" as const,
      priority: 1,
      alternates: { languages: everyLanguage("/") },
    })),
    ...locales.map((locale) => ({
      url: absolute("/blog", locale),
      changeFrequency: "daily" as const,
      priority: 0.8,
      alternates: { languages: everyLanguage("/blog") },
    })),
    ...publishedTranslations().map(({ post, locale, slug }) => ({
      url: absolute(`/blog/${slug}`, locale),
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(postLocales(post).map((code) => [code, absolute(`/blog/${post.translations[code]!.slug}`, code)])),
      },
    })),
  ];
}
