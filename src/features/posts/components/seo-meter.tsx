"use client";

import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function seoTone(score: number) {
  if (score >= 80) return { key: "good", bar: "bg-signal", stroke: "stroke-signal", text: "text-signal-foreground" } as const;
  if (score >= 60) return { key: "needsWork", bar: "bg-proof", stroke: "stroke-proof", text: "text-proof-foreground" } as const;
  return { key: "poor", bar: "bg-destructive", stroke: "stroke-destructive", text: "text-destructive" } as const;
}

/** Score out of 100 with a short bar; the number and label carry the meaning. */
export function SeoMeter({ score, className }: { score: number; className?: string }) {
  const { t } = useI18n();
  const tone = seoTone(score);

  return (
    <span className={cn("inline-flex items-center gap-2", className)} title={fill(t.posts.seo.score, { score, label: t.posts.seo[tone.key] })}>
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-muted" aria-hidden>
        <span className={cn("block h-full rounded-full", tone.bar)} style={{ width: `${score}%` }} />
      </span>
      <span className={cn("tabular text-xs font-medium", tone.text)}>{score}</span>
    </span>
  );
}
