"use client";

import { siteConfig } from "@/config/site";
import { localeInfo, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

/** Rough preview of how the post appears in search results, for the language being edited. */
export function SerpPreview({ title, description, slug, locale }: { title: string; description: string; slug: string; locale: Locale }) {
  const { t } = useI18n();
  const copy = t.editor.serp;
  const host = siteConfig.url.replace(/^https?:\/\//, "");

  return (
    <figure className="grid gap-1 rounded-sm border bg-muted/40 px-4 py-3">
      <figcaption className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">{copy.caption}</figcaption>
      <p className="mt-1 text-xs break-all text-signal-foreground" dir="ltr">
        {host} › {locale} › blog › {slug || copy.slugPlaceholder}
      </p>
      <div lang={locale} dir={localeInfo[locale].dir} className="grid gap-1">
        <p className="text-base font-semibold tracking-tight break-words text-[#1a3fbf] dark:text-[#99b4ff]">{title.trim() || copy.titlePlaceholder}</p>
        <p className="text-[13px] leading-relaxed break-words text-muted-foreground">{description.trim() || copy.descriptionPlaceholder}</p>
      </div>
    </figure>
  );
}
