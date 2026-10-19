import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  FileText,
  ImagePlus,
  PenLine,
  Sparkles,
} from "lucide-react";
import { getI18n } from "@/i18n/server";
import { InteractiveCard } from "./interactive-card";

const workflow = [
  { key: "draft", icon: Sparkles },
  { key: "edit", icon: PenLine },
  { key: "visuals", icon: ImagePlus },
] as const;

export async function AiPublishing() {
  const { t } = await getI18n();
  const copy = t.site.publishing;

  return (
    <section
      id="publishing"
      aria-labelledby="publishing-title"
      className="scroll-mt-24 border-t px-5 py-20 sm:px-6 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <InteractiveCard className="order-2 bg-paper/50 p-3 sm:p-5 lg:order-1">
          <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
              <span className="flex items-center gap-2 text-xs font-medium">
                <FileText aria-hidden="true" className="size-4 text-ink" /> {copy.post}
              </span>
              <span className="rounded-full bg-ink-soft px-2.5 py-1 text-[10px] font-medium text-ink">
                {copy.badge}
              </span>
            </div>
            <div
              aria-hidden="true"
              className="flex flex-wrap items-center gap-4 border-b bg-paper/50 px-5 py-3 text-xs text-muted-foreground"
            >
              <span className="font-semibold">H1</span>
              <span className="font-bold">B</span>
              <span className="italic">I</span>
              <span className="underline">U</span>
              <span className="h-4 border-s" />
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-ink" /> {copy.aiDraft}
              </span>
              <span className="flex items-center gap-1.5">
                <ImagePlus className="size-3.5 text-ink" /> {copy.aiImage}
              </span>
            </div>
            <div className="p-5 sm:p-7">
              <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                {copy.draftLabel}
              </p>
              <p className="mt-3 max-w-sm font-heading text-2xl leading-tight font-medium tracking-tight sm:text-3xl">
                {copy.sampleTitle}
              </p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {copy.sampleText}
              </p>
              <figure className="mt-5 overflow-hidden rounded-xl border">
                <div className="relative aspect-[1.9]">
                  <Image
                    src="/images/landing/possibility-landscape.webp"
                    alt={copy.imageAlt}
                    fill
                    sizes="(max-width: 1023px) 90vw, 560px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="flex items-center gap-2 bg-paper/70 px-3 py-2.5 text-[11px] text-muted-foreground">
                  <Sparkles
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-ink"
                  />{" "}
                  {copy.caption}
                </figcaption>
              </figure>
            </div>
            <div className="flex items-center justify-between gap-3 border-t px-5 py-3 text-[10px] text-muted-foreground">
              <span>{copy.footerLeft}</span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-proof" /> {copy.footerRight}
              </span>
            </div>
          </div>
        </InteractiveCard>
        <div className="order-1 lg:order-2">
          <p className="landing-eyebrow">{copy.eyebrow}</p>
          <h2
            id="publishing-title"
            className="mt-4 text-4xl leading-[1.1] font-medium tracking-[-0.04em] sm:text-5xl"
          >
            {copy.title1}
            <br />
            <span className="text-ink">{copy.title2}</span>
          </h2>
          <p className="mt-5 leading-7 text-muted-foreground">
            {copy.lead}
          </p>
          <ul className="mt-7 space-y-6">
            {workflow.map((step) => (
              <li key={step.key} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border bg-ink-soft/50 text-ink">
                  <step.icon aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{copy.steps[step.key].title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {copy.steps[step.key].description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/panel/posts/new"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink"
          >
            {copy.link}{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
