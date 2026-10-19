"use client";

import { locales, type Locale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Which languages a piece of content exists in, at a glance: every language
 * is listed, translated ones filled, missing ones dashed, the source ringed.
 * The text (code + screen-reader label) carries the meaning, not the colour.
 */
export function LanguageChips({ available, source, className }: { available: readonly Locale[]; source?: Locale; className?: string }) {
  const { t, f } = useI18n();

  return (
    <ul className={cn("flex gap-1", className)}>
      {locales.map((code) => {
        const has = available.includes(code);
        const label = fill(has ? t.posts.columns.translated : t.posts.columns.missing, { language: f.language(code) });
        return (
          <li
            key={code}
            title={code === source ? `${label} · ${t.editor.languages.source}` : label}
            className={cn(
              "grid h-5 min-w-7 place-items-center rounded-sm px-1 font-mono text-[10px] font-medium uppercase",
              has ? "bg-ink-soft text-ink" : "border border-dashed text-muted-foreground/70",
              code === source && "ring-1 ring-ink/50",
            )}
          >
            <span aria-hidden>{code}</span>
            <span className="sr-only">{label}</span>
          </li>
        );
      })}
    </ul>
  );
}
