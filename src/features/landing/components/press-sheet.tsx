"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  CircleHelp,
  Command,
  FileText,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";
import { navGroups, type NavItemKey } from "@/config/nav";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { InteractiveCard } from "./interactive-card";

/** Sidebar items that switch the preview instead of leaving the page. */
const previewTabs = ["dashboard", "blog", "media"] as const satisfies readonly NavItemKey[];
type PreviewTab = (typeof previewTabs)[number];

export function PressSheet() {
  const [active, setActive] = useState<PreviewTab>("dashboard");
  const reducedMotion = useReducedMotion();
  const { t, f } = useI18n();
  const copy = t.site.preview;
  const posts = copy.posts;
  return (
    <InteractiveCard
      tilt
      className="landing-preview rounded-xl border-white/70 bg-[var(--preview-sheet)] text-[var(--preview-text)] shadow-[0_30px_90px_-25px_var(--landing-shadow)] sm:rounded-2xl"
    >
      <div className="flex h-10 items-center justify-between border-b border-[var(--preview-border)] bg-[var(--preview-paper)] px-4 sm:h-11">
        <div aria-hidden="true" className="flex gap-1.5">
          {[1, 2, 3].map((dot) => (
            <span
              key={dot}
              className="size-2 rounded-full bg-[var(--preview-muted)]/25"
            />
          ))}
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--preview-muted)]">
          <span className="size-1.5 rounded-full bg-[var(--preview-signal)]" />{" "}
          {siteConfig.name} / {t.studio.workspace}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-3 text-[var(--preview-muted)]"
        />
      </div>
      <div className="grid sm:grid-cols-[150px_minmax(0,1fr)] lg:grid-cols-[180px_minmax(0,1fr)]">
        <aside className="hidden flex-col border-e border-[var(--preview-border)] bg-[var(--preview-paper)] p-3 text-[11px] sm:flex">
          <div className="mb-6 flex items-center gap-2 px-1 pt-1">
            <LogoMark className="size-6" />
            <span className="font-heading text-sm font-semibold">
              {siteConfig.name}
            </span>
            <ChevronDown aria-hidden="true" className="ms-auto size-3" />
          </div>
          {navGroups.slice(0, 3).map((group) => (
            <div key={group.label} className="mb-4">
              <p className="mb-1.5 px-2 text-[9px] font-medium tracking-wider text-[var(--preview-muted)] uppercase">
                {t.nav.groups[group.label]}
              </p>
              {group.items
                .slice(0, group.label === "content" ? 3 : 2)
                .map((item) => {
                  const preview = previewTabs.find((tab) => tab === item.title);
                  const className = cn(
                    "mb-0.5 flex min-h-8 w-full items-center gap-2 rounded-md px-2 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                    active === item.title
                      ? "bg-[var(--preview-ink-soft)] font-medium text-[var(--preview-ink)]"
                      : "text-[var(--preview-muted)] hover:bg-[var(--preview-border)]/50",
                  );
                  return preview ? (
                    <button
                      key={item.title}
                      onClick={() => setActive(preview)}
                      className={className}
                      aria-pressed={active === preview}
                    >
                      <item.icon aria-hidden="true" className="size-3.5" />
                      {t.nav.items[item.title]}
                    </button>
                  ) : (
                    <Link
                      key={item.title}
                      href={item.href}
                      className={className}
                    >
                      <item.icon aria-hidden="true" className="size-3.5" />
                      {t.nav.items[item.title]}
                    </Link>
                  );
                })}
            </div>
          ))}
          <Link
            href="/panel/settings"
            className="mt-auto flex min-h-8 items-center gap-2 px-2 text-[var(--preview-muted)]"
          >
            <Settings aria-hidden="true" className="size-3.5" /> {t.nav.items.settings}
          </Link>
          <div className="mt-3 flex items-center gap-2 border-t border-[var(--preview-border)] px-1 pt-3">
            <span className="grid size-7 place-items-center rounded-full bg-[var(--preview-ink-soft)] text-[10px] font-semibold text-[var(--preview-ink)]">
              JD
            </span>
            <div>
              <p className="font-medium">Jamie Davis</p>
              <p className="text-[9px] text-[var(--preview-muted)]">
                {copy.personal}
              </p>
            </div>
          </div>
        </aside>
        <div className="min-w-0">
          <div className="flex h-11 items-center justify-between border-b border-[var(--preview-border)] px-4 text-[10px] sm:px-5">
            <span className="text-[var(--preview-muted)]">
              {copy.crumbRoot} <span className="mx-2 opacity-50">/</span>
              <span className="text-[var(--preview-text)]">{t.nav.items[active]}</span>
            </span>
            <div
              aria-hidden="true"
              className="flex items-center gap-3 text-[var(--preview-muted)]"
            >
              <Search className="size-3.5" />
              <Command className="size-3" />
              <Bell className="size-3.5" />
              <span className="grid size-5 place-items-center rounded-full bg-[var(--preview-ink-soft)] text-[8px] text-[var(--preview-ink)]">
                JD
              </span>
            </div>
          </div>
          <div className="p-4 sm:px-5 sm:pt-5">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold sm:text-xl">
                  {active === "dashboard" ? copy.headings.dashboard : active === "blog" ? copy.headings.posts : copy.headings.media}
                </h2>
                <p className="mt-1 text-[10px] text-[var(--preview-muted)]">
                  {active === "dashboard" ? copy.subDashboard : copy.subOther}
                </p>
              </div>
              <Link
                href={active === "media" ? "/panel/media" : "/panel/posts/new"}
                className="hidden min-h-8 shrink-0 items-center gap-1 rounded-md bg-[var(--preview-ink)] px-2.5 text-[10px] font-medium text-white md:flex"
              >
                + {active === "media" ? copy.upload : copy.newPost}
              </Link>
            </div>
            <div
              role="group"
              aria-label={copy.screens}
              className="mb-4 flex w-fit gap-1 rounded-lg bg-[var(--preview-paper)] p-1 sm:hidden"
            >
              {previewTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActive(tab)}
                  aria-pressed={active === tab}
                  className={cn(
                    "min-h-11 rounded-md px-3 text-xs",
                    active === tab &&
                      "bg-[var(--preview-sheet)] text-[var(--preview-ink)] shadow-sm",
                  )}
                >
                  {t.nav.items[tab]}
                </button>
              ))}
            </div>
            <div
              className="min-h-[280px] sm:min-h-[310px]"
              aria-live="polite"
              aria-atomic="true"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.18 }}
                >
                  {active === "dashboard" && <DashboardPreview />}
                  {active === "blog" && (
                    <div className="overflow-hidden rounded-lg border border-[var(--preview-border)]">
                      <div className="flex justify-between border-b border-[var(--preview-border)] bg-[var(--preview-paper)] p-3 text-[10px] text-[var(--preview-muted)]">
                        <span>{fill(copy.allPosts, { count: f.number(128) })}</span>
                        <span>{copy.latest}</span>
                      </div>
                      {posts.map((post) => (
                        <Link
                          key={post.title}
                          href="/panel/posts"
                          className="flex min-h-20 items-center gap-3 border-b border-[var(--preview-border)] p-3 last:border-0 hover:bg-[var(--preview-paper)]"
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--preview-ink-soft)] text-[var(--preview-ink)]">
                            <FileText aria-hidden="true" className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium">
                              {post.title}
                            </p>
                            <p className="mt-1 text-[10px] text-[var(--preview-muted)]">
                              {post.category}
                            </p>
                          </div>
                          <span className="ms-auto hidden rounded-full bg-[var(--preview-paper)] px-2 py-1 text-[9px] sm:block">
                            {post.status}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {active === "media" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative aspect-[1.5] overflow-hidden rounded-lg">
                        <Image
                          src="/images/landing/possibility-landscape.webp"
                          alt={copy.coverAlt}
                          fill
                          sizes="300px"
                          className="object-cover"
                        />
                      </div>
                      <div className="relative aspect-[1.5] overflow-hidden rounded-lg bg-[var(--preview-ink-soft)]">
                        <Image
                          src="/images/landing/modular-blocks.webp"
                          alt={copy.blocksAlt}
                          fill
                          sizes="300px"
                          className="object-contain p-3"
                        />
                      </div>
                      <div className="col-span-2 rounded-lg border border-dashed border-[var(--preview-border)] p-5 text-center">
                        <p className="text-xs font-medium">{copy.nextVisual}</p>
                        <Link
                          href="/panel/media"
                          className="mt-2 inline-flex min-h-11 items-center text-[11px] text-[var(--preview-ink)]"
                        >
                          {copy.exploreMedia}{" "}
                          <ArrowUpRight
                            aria-hidden="true"
                            className="ms-1 size-3"
                          />
                        </Link>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex h-8 items-center justify-between border-t border-[var(--preview-border)] px-4 text-[9px] text-[var(--preview-muted)] sm:px-5">
            <span className="flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-[var(--preview-signal)]" />{" "}
              {copy.footer}
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <CircleHelp aria-hidden="true" className="size-3" /> {copy.help}
            </span>
          </div>
        </div>
      </div>
    </InteractiveCard>
  );
}

function DashboardPreview() {
  const { t, f } = useI18n();
  const copy = t.site.preview;

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          [copy.views, f.number(24892), f.change(0.186)],
          [copy.publishedPosts, f.number(128), f.change(0.122)],
          [copy.subscribers, f.number(1842), f.change(0.084)],
        ].map(([label, value, change]) => (
          <div
            key={label}
            className="rounded-lg border border-[var(--preview-border)] p-2.5 sm:p-3"
          >
            <p className="text-[9px] text-[var(--preview-muted)]">{label}</p>
            <p className="mt-1 font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              {value}
            </p>
            <p className="mt-1 flex items-center gap-0.5 text-[9px] text-[var(--preview-signal)]">
              <ArrowUpRight aria-hidden="true" className="size-2.5" />
              {change}
              <span className="ms-1 hidden text-[var(--preview-muted)] lg:inline">
                {copy.vsLast}
              </span>
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-[1.6fr_1fr]">
        <div className="rounded-lg border border-[var(--preview-border)] p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium">{copy.reach}</p>
            <span className="text-[9px] text-[var(--preview-muted)]">{copy.last30}</span>
          </div>
          <svg
            viewBox="0 0 400 116"
            className="mt-3 h-[95px] w-full"
            role="img"
            aria-label={copy.trend}
          >
            <defs>
              <linearGradient
                id="landing-chart-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--preview-ink)"
                  stopOpacity="0.2"
                />
                <stop
                  offset="100%"
                  stopColor="var(--preview-ink)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            {[15, 45, 75, 105].map((y) => (
              <path
                key={y}
                d={`M0 ${y}H400`}
                stroke="var(--preview-border)"
                strokeDasharray="3 5"
              />
            ))}
            <path
              d="M0 95C20 95 25 65 45 72S75 100 95 70 125 80 145 55 175 77 200 48 225 65 245 37 275 58 300 30 335 45 355 19 380 26 400 7V116H0Z"
              fill="url(#landing-chart-fill)"
            />
            <path
              d="M0 95C20 95 25 65 45 72S75 100 95 70 125 80 145 55 175 77 200 48 225 65 245 37 275 58 300 30 335 45 355 19 380 26 400 7"
              fill="none"
              stroke="var(--preview-ink)"
              strokeWidth="2.5"
            />
          </svg>
          {/* The chart runs left to right in every language, so its axis does too. */}
          <div dir="ltr" className="mt-1 flex justify-between text-[9px] text-[var(--preview-muted)]">
            {["2026-10-01", "2026-10-10", "2026-10-20", "2026-10-30"].map((day) => (
              <span key={day}>{f.dayMonth(day)}</span>
            ))}
          </div>
        </div>
        <div className="hidden rounded-lg border border-[var(--preview-border)] p-3 md:block">
          <p className="text-[11px] font-medium">{copy.pipeline}</p>
          <div className="mt-4 flex h-2 gap-1 overflow-hidden rounded-full">
            <span className="w-1/2 bg-[var(--preview-ink)]" />
            <span className="w-1/4 bg-[var(--preview-ink)]/40" />
            <span className="w-1/4 bg-[var(--preview-proof)]" />
          </div>
          {[
            [copy.published, "12", "bg-[var(--preview-ink)]"],
            [copy.scheduled, "4", "bg-[var(--preview-ink)]/40"],
            [copy.inReview, "3", "bg-[var(--preview-proof)]"],
          ].map(([label, value, color]) => (
            <div
              key={label}
              className="mt-3 flex items-center gap-1.5 text-[10px]"
            >
              <span className={cn("size-1.5 rounded-full", color)} />
              <span className="text-[var(--preview-muted)]">{label}</span>
              <span className="ms-auto font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--preview-paper)] px-3 py-2.5 text-[10px]">
        <Sparkles
          aria-hidden="true"
          className="size-3.5 shrink-0 text-[var(--preview-ink)]"
        />
        <span className="text-[var(--preview-muted)]">
          {copy.clear}
        </span>
      </div>
    </>
  );
}
