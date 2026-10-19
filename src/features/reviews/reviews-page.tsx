"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Main, PageHeader } from "@/components/layout/page-header";
import { AnimatedTabsList } from "@/components/motion/animated-tabs";
import { TimeAgo } from "@/components/time-ago";
import { ActionButton } from "@/components/access/action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { localeInfo, type Locale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

type ReviewStatus = "pending" | "approved" | "rejected";
/** `locale` is the language the review was written in; it is shown as written. */
type Review = { id: string; author: string; email: string; product: string; rating: number; body: string; status: ReviewStatus; createdAt: string; locale: Locale };

const seed: Review[] = [
  { id: "r1", author: "Sabine Krüger", email: "sabine@krueger.design", product: "Nordform", rating: 5, body: "Wir haben dieses Quartal drei Websites mit Nordform gelauncht. Dank der Site Sets war das Onboarding von Junior-Entwicklern ganz einfach, und die Redaktion liebt die Content Blocks.", status: "pending", createdAt: "2026-10-17T14:20:00Z", locale: "de" },
  { id: "r2", author: "Daniel Roth", email: "d.roth@rothmedia.de", product: "Nordform", rating: 5, body: "Clean code, sensible defaults and the accessibility work is real, not a checkbox. Support answered within hours.", status: "pending", createdAt: "2026-10-18T07:02:00Z", locale: "en" },
  { id: "r3", author: "Mehmet Aydın", email: "mehmet@aydin.dev", product: "Foundation", rating: 3, body: "Sağlam bir temel, ancak özel sayfa düzenlerinin dokümantasyonunda daha fazla örnek olabilirdi.", status: "pending", createdAt: "2026-10-18T09:45:00Z", locale: "tr" },
  { id: "r4", author: "Laura Fischer", email: "laura@fischer-web.de", product: "Campus", rating: 4, body: "Die Fakultätsseiten skalieren gut. Wir hätten gern mehr Farbvorlagen.", status: "approved", createdAt: "2026-10-10T12:00:00Z", locale: "de" },
  { id: "r5", author: "Spam Bot", email: "promo@cheap-links.biz", product: "Nordform", rating: 1, body: "Buy backlinks now!!! best price", status: "rejected", createdAt: "2026-10-09T03:11:00Z", locale: "en" },
  { id: "r6", author: "Felix Braun", email: "felix@braun.studio", product: "Nordform", rating: 5, body: "The mega menu in 2.4 finally solved our navigation headaches.", status: "approved", createdAt: "2026-10-05T16:30:00Z", locale: "en" },
];

function Stars({ rating }: { rating: number }) {
  const { t } = useI18n();

  return (
    <span className="flex gap-0.5" role="img" aria-label={fill(t.reviews.stars, { rating })}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={cn("size-4", index < rating ? "fill-proof text-proof" : "text-border")} aria-hidden />
      ))}
    </span>
  );
}

export function ReviewsPage() {
  const [reviews, setReviews] = useState(seed);
  const [tab, setTab] = useState<ReviewStatus>("pending");
  const [lastExit, setLastExit] = useState<ReviewStatus | "deleted">("approved");
  const { t, f, plural, dir } = useI18n();
  const copy = t.reviews;

  const count = (status: ReviewStatus) => reviews.filter((review) => review.status === status).length;
  const visible = reviews.filter((review) => review.status === tab);
  const approved = reviews.filter((review) => review.status === "approved");
  const average = approved.reduce((sum, review) => sum + review.rating, 0) / Math.max(approved.length, 1);

  const moderate = (review: Review, status: ReviewStatus) => {
    setLastExit(status);
    setReviews((current) => current.map((entry) => (entry.id === review.id ? { ...entry, status } : entry)));
    toast.success(fill(status === "approved" ? copy.approvedToast : copy.rejectedToast, { name: review.author }), {
      action: { label: copy.undo, onClick: () => setReviews((current) => current.map((entry) => (entry.id === review.id ? review : entry))) },
    });
  };

  return (
    <Main>
      <PageHeader title={t.nav.items.reviews} description={copy.description} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid content-start gap-4">
          <Tabs value={tab} onValueChange={(value) => setTab(value as ReviewStatus)}>
            <AnimatedTabsList
              value={tab}
              className="w-full sm:w-fit"
              tabs={(["pending", "approved", "rejected"] as const).map((status) => ({
                value: status,
                label: fill(copy.tab, { label: copy.status[status], count: count(status) }),
              }))}
            />
          </Tabs>

          <ul className="grid gap-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((review) => (
                <motion.li
                  key={review.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    x: (lastExit === "approved" ? 48 : -48) * (dir === "rtl" ? -1 : 1),
                    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
                  }}
                  className="rounded-xl border bg-card p-4 md:p-5"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Stars rating={review.rating} />
                    <span className="text-sm font-medium">{review.author}</span>
                    <span className="text-sm text-muted-foreground">{fill(copy.on, { product: review.product })}</span>
                    <TimeAgo value={review.createdAt} className="ms-auto text-xs text-muted-foreground" />
                  </div>
                  <p className="mt-3 max-w-[70ch] text-[15px] leading-7" lang={review.locale} dir={localeInfo[review.locale].dir}>
                    {review.body}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="me-auto text-xs text-muted-foreground">
                      {fill(copy.writtenIn, { email: review.email, language: f.language(review.locale) })}
                    </span>
                    {review.status === "pending" && (
                      <ActionButton permission="reviews.manage" size="sm" variant="outline" onClick={() => moderate(review, "rejected")}>
                        <X /> {copy.reject}
                      </ActionButton>
                    )}
                    {review.status === "pending" && (
                      <ActionButton permission="reviews.manage" size="sm" className="bg-signal text-primary-foreground hover:bg-signal/90" onClick={() => moderate(review, "approved")}>
                        <Check /> {copy.approve}
                      </ActionButton>
                    )}
                    {review.status === "approved" && (
                      <ActionButton permission="reviews.manage" size="sm" variant="outline" onClick={() => moderate(review, "pending")}>
                        {copy.moveBack}
                      </ActionButton>
                    )}
                    {review.status === "rejected" && (
                      <ActionButton permission="reviews.manage"
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setLastExit("deleted");
                          setReviews((current) => current.filter((entry) => entry.id !== review.id));
                          toast.success(copy.deleted);
                        }}
                      >
                        <Trash2 /> {t.common.delete}
                      </ActionButton>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
            {visible.length === 0 && (
              <li className="rounded-xl border border-dashed px-6 py-14 text-center text-sm text-muted-foreground">
                {tab === "pending" ? copy.emptyPending : copy.empty}
              </li>
            )}
          </ul>
        </div>

        <Card className="h-fit gap-4">
          <CardHeader>
            <CardTitle className="font-heading text-lg">{copy.rating}</CardTitle>
            <CardDescription>{plural(copy.from, approved.length)}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="flex items-baseline gap-2">
              <span className="font-heading text-4xl font-semibold tabular">{new Intl.NumberFormat(localeInfo[f.locale].intl, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(average)}</span>
              <span className="text-sm text-muted-foreground">{copy.outOf}</span>
            </p>
            <ul className="grid gap-1.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const n = approved.filter((review) => review.rating === stars).length;
                const width = approved.length ? (n / approved.length) * 100 : 0;
                return (
                  <li key={stars} className="flex items-center gap-2 text-sm">
                    <span className="tabular w-3 text-muted-foreground">{stars}</span>
                    <Star className="size-3.5 fill-proof text-proof" aria-hidden />
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <motion.span className="block h-full rounded-full bg-proof" initial={false} animate={{ width: `${width}%` }} />
                    </span>
                    <span className="tabular w-4 text-end text-muted-foreground">{n}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </Main>
  );
}
