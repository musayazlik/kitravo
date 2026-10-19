import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { locales } from "@/i18n/config";

/** Panel and auth pages, closed to crawlers in every language. */
const PRIVATE = ["/panel"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...locales.flatMap((locale) => PRIVATE.map((path) => `/${locale}${path}`)), "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
