"use client";

import { Link } from "@/i18n/navigation";
import NumberFlow from "@number-flow/react";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";
import { postStatuses } from "@/features/posts/data/schema";
import { useHydrated } from "@/hooks/use-hydrated";
import { useI18n } from "@/i18n/provider";
import { rich } from "@/i18n/rich";
import { pipeline, previousPublished, type Range } from "../data/overview";
import { cn } from "@/lib/utils";

const SEGMENT = {
  draft: "bg-muted-foreground/25",
  review: "bg-proof",
  scheduled: "bg-ink/70",
  published: "bg-ink",
} as const;

/**
 * The dashboard's one orchestrated moment: four stages of the publishing
 * pipeline fill in left to right, their counts rolling up as they land.
 */
export function PipelineBand({ range }: { range: Range }) {
  const counts = pipeline[range];
  const total = postStatuses.reduce((sum, status) => sum + counts[status], 0);
  const delta = counts.published - previousPublished[range];

  // Counts render as zero until hydration, then NumberFlow rolls them up.
  const hydrated = useHydrated();
  const { t } = useI18n();

  return (
    <section aria-labelledby="pipeline-title" className="rounded-xl border bg-card p-5 md:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="pipeline-title" className="text-lg font-semibold">
          {t.dashboard.pipeline.title}
        </h2>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <TrendingUp className="size-4 text-signal" aria-hidden />
          <span>
            {rich(delta >= 0 ? t.dashboard.pipeline.summaryMore : t.dashboard.pipeline.summaryFewer, {
              b: (chunks) => <span className="tabular font-medium text-foreground">{chunks}</span>,
              count: counts.published,
              delta: Math.abs(delta),
            })}
          </span>
        </p>
      </div>

      {/* The band fills in reading order: left to right, or right to left in Arabic. */}
      <div className="mt-5 flex h-3 gap-1 overflow-hidden rounded-sm" aria-hidden>
        {postStatuses.map((status, index) => (
          <motion.div
            key={status}
            className={cn("h-full rounded-sm", SEGMENT[status])}
            initial={{ flexGrow: 0.0001 }}
            animate={{ flexGrow: counts[status] / total }}
            transition={{ delay: 0.15 + index * 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ flexBasis: 0 }}
          />
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4">
        {postStatuses.map((status) => (
          <Link
            key={status}
            href={`/panel/posts?status=${status}`}
            className="group -m-2 rounded-lg p-2 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <span aria-hidden className={cn("size-2 rounded-full", SEGMENT[status])} />
              {t.posts.status[status]}
            </dt>
            <dd className="mt-1 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              <NumberFlow value={hydrated ? counts[status] : 0} className="tabular" />
            </dd>
          </Link>
        ))}
      </dl>
    </section>
  );
}
