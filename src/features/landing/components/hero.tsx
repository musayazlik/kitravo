import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowDown, ArrowRight, Check, GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getI18n } from "@/i18n/server";
import { PressSheet } from "./press-sheet";

export async function Hero() {
  const { t } = await getI18n();
  const hero = t.site.hero;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden pt-12 sm:pt-16 lg:pt-20"
    >
      <div
        aria-hidden="true"
        className="landing-hero-glow pointer-events-none absolute inset-x-0 top-0 h-[550px]"
      />
      <div className="relative mx-auto max-w-6xl px-5 text-center sm:px-6">
        <Link
          href="#open-source"
          className="inline-flex min-h-9 items-center gap-2.5 rounded-full border bg-background/80 py-1 pe-3 ps-1.5 text-xs font-medium shadow-xs transition-colors hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span className="rounded-full bg-ink-soft px-2 py-1 text-[10px] font-semibold tracking-wide text-ink">
            {hero.badge}
          </span>
          {siteConfig.githubUrl ? hero.buildWithUs : hero.comingToGitHub}{" "}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
        <h1
          id="hero-title"
          className="mx-auto mt-7 max-w-4xl text-[clamp(2.75rem,6.1vw,5.5rem)] leading-[1.04] font-medium tracking-[-0.055em]"
        >
          {hero.title1}
          <br />
          <span className="text-ink">{hero.title2}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
          {hero.lead}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            asChild
            className="landing-button h-12 rounded-full px-6 text-sm shadow-lg shadow-ink/15"
          >
            <Link href="/panel/dashboard">
              {hero.demo}{" "}
              <ArrowRight aria-hidden="true" className="ms-1 size-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="landing-button h-12 rounded-full bg-background px-6 text-sm"
          >
            <Link
              href={siteConfig.githubUrl ?? "#open-source"}
              target={siteConfig.githubUrl ? "_blank" : undefined}
              rel={siteConfig.githubUrl ? "noopener noreferrer" : undefined}
            >
              {siteConfig.githubUrl ? hero.github : hero.source}{" "}
              <GitFork aria-hidden="true" className="ms-1 size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {hero.checks.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <Check aria-hidden="true" className="size-3.5 text-signal" />
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="relative mx-auto mt-12 max-w-[1440px] px-3 sm:px-8 lg:mt-14">
        <div className="relative isolate overflow-hidden rounded-[28px] border border-ink/10 bg-ink-soft px-3 pt-9 pb-7 sm:px-10 sm:pt-12 sm:pb-10 lg:px-28 lg:pt-14">
          <Image
            src="/images/landing/possibility-landscape.webp"
            alt=""
            fill
            sizes="(max-width: 1440px) 100vw, 1440px"
            preload
            className="-z-10 object-cover"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-ink/5"
          />
          <div className="mx-auto max-w-[960px]">
            <PressSheet />
          </div>
          <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-white/50 bg-white px-4 py-2 text-xs text-[var(--preview-muted)] shadow-sm">
            <span className="size-1.5 rounded-full bg-[var(--preview-signal)]" />{" "}
            {hero.ready}
          </div>
        </div>
        <Link
          href="#stack"
          aria-label={hero.discoverStack}
          className="relative mx-auto -mt-5 flex size-11 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ArrowDown aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  );
}
