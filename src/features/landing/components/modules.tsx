import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  ArrowUpRight,
  Check,
  Code2,
  FileText,
  Globe,
  ImageIcon,
  Layers3,
  Mail,
  MessageSquare,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { getI18n } from "@/i18n/server";
import { InteractiveCard } from "./interactive-card";

const modules = [
  { key: "blog", icon: FileText, href: "/panel/posts" },
  { key: "media", icon: ImageIcon, href: "/panel/media" },
  { key: "comments", icon: MessageSquare, href: "/panel/posts/comments" },
  { key: "inbox", icon: Mail, href: "/panel/mail" },
  { key: "seo", icon: Globe, href: "/panel/seo" },
  { key: "people", icon: Users, href: "/panel/users" },
] as const;

export async function Modules() {
  const { t } = await getI18n();
  const copy = t.site.modules;

  return (
    <section
      id="modules"
      aria-labelledby="modules-title"
      className="scroll-mt-24 px-5 py-20 sm:px-6 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="landing-eyebrow">{copy.eyebrow}</p>
          <h2
            id="modules-title"
            className="mt-4 text-4xl leading-[1.1] font-medium tracking-[-0.04em] sm:text-5xl"
          >
            {copy.title1}
            <br />
            <span className="text-muted-foreground">{copy.title2}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg leading-7 text-muted-foreground">
            {copy.lead}
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <InteractiveCard className="landing-modular-card min-h-[370px] bg-paper md:col-span-2">
            <div className="relative z-20 max-w-sm p-7 sm:p-8">
              <span className="landing-icon">
                <Layers3 aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 text-2xl font-medium">{copy.kitTitle}</h3>
              <p className="mt-3 max-w-[240px] text-sm leading-6 text-muted-foreground">
                {copy.kitText}
              </p>
              <Link
                href="/panel/dashboard"
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink"
              >
                {copy.kitLink}{" "}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <Image
              src="/images/landing/modular-blocks.webp"
              alt={copy.kitImageAlt}
              width={900}
              height={900}
              sizes="(max-width: 1023px) 270px, 360px"
              className="pointer-events-none absolute -end-12 -bottom-12 w-[260px] transition-transform duration-500 group-hover/spot:-translate-y-3 md:-end-16 lg:end-0 lg:w-[360px]"
            />
          </InteractiveCard>
          <InteractiveCard className="min-h-[370px] bg-ink-soft/50 p-7 sm:p-8">
            <span className="landing-icon">
              <SlidersHorizontal aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-5 text-2xl font-medium">
              {copy.themeTitle1}
              <br />
              {copy.themeTitle2}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {copy.themeText}
            </p>
            <div
              aria-hidden="true"
              className="mt-8 rounded-xl border bg-background p-4 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">{copy.brand}</span>
                <Check className="size-4 text-ink" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                {[
                  "bg-ink",
                  "bg-proof",
                  "bg-signal",
                  "bg-foreground",
                  "bg-paper",
                ].map((color) => (
                  <span
                    key={color}
                    className={`size-8 rounded-full border border-foreground/10 ${color}`}
                  />
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <span className="h-2 w-20 rounded-full bg-muted" />
                <span className="h-2 w-12 rounded-full bg-muted" />
              </div>
            </div>
          </InteractiveCard>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <InteractiveCard
              key={module.key}
              className="transition-colors duration-200 hover:border-ink/30"
            >
              <Link
                href={module.href}
                className="relative z-20 block h-full p-6 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-ring"
              >
                <div className="flex items-center justify-between">
                  <module.icon aria-hidden="true" className="size-5 text-ink" />
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover/spot:translate-x-0.5 group-hover/spot:-translate-y-0.5 rtl:group-hover/spot:-translate-x-0.5"
                  />
                </div>
                <h3 className="mt-5 text-lg font-medium">{copy.items[module.key].name}</h3>
                <p className="mt-2 max-w-[32ch] text-sm leading-6 text-muted-foreground">
                  {copy.items[module.key].description}
                </p>
              </Link>
            </InteractiveCard>
          ))}
        </div>
        <p className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <Code2 aria-hidden="true" className="size-4 shrink-0" /> {copy.footnote}
        </p>
      </div>
    </section>
  );
}
