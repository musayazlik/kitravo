import { Link } from "@/i18n/navigation";
import { ArrowUpRight, Braces, Code2, Folder, GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getI18n } from "@/i18n/server";

export async function OpenSource() {
  const { t } = await getI18n();
  const copy = t.site.openSource;

  return (
    <section
      id="open-source"
      aria-labelledby="open-source-title"
      className="scroll-mt-24 px-5 pb-20 sm:px-6 lg:pb-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 rounded-[28px] border border-ink/15 bg-ink-soft/40 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16 lg:p-12">
        <div>
          <p className="landing-eyebrow">{copy.eyebrow}</p>
          <h2
            id="open-source-title"
            className="mt-4 text-4xl leading-[1.1] font-medium tracking-[-0.04em] sm:text-5xl"
          >
            {copy.title1}
            <br />
            {copy.title2}
          </h2>
          <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
            {siteConfig.githubUrl ? copy.released : copy.preparing} {copy.lead}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium">
            <span className="flex items-center gap-2">
              <Code2 aria-hidden="true" className="size-4 text-ink" /> {copy.explore}
            </span>
            <span className="flex items-center gap-2">
              <Braces aria-hidden="true" className="size-4 text-ink" /> {copy.shape}
            </span>
          </div>
          {siteConfig.githubUrl ? (
            <Button
              asChild
              className="landing-button mt-7 h-12 rounded-full px-6"
            >
              <a
                href={siteConfig.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitFork aria-hidden="true" className="size-4" /> {copy.view}{" "}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </Button>
          ) : (
            <div className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full border bg-background px-4 py-2.5 text-sm font-medium">
              <GitFork aria-hidden="true" className="size-4 text-ink" /> {copy.soon}
            </div>
          )}
          <Link
            href="/panel/dashboard"
            className="mt-3 flex min-h-11 w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-ink"
          >
            {copy.demo}{" "}
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
            <span className="flex items-center gap-2 text-sm font-medium">
              <GitFork aria-hidden="true" className="size-4 text-ink" /> {siteConfig.name}
            </span>
            <span className="rounded-full border bg-paper px-2 py-1 text-[10px] text-muted-foreground">
              {siteConfig.githubUrl ? copy.statusOpen : copy.statusPreparing}
            </span>
          </div>
          <ul className="divide-y px-5 text-xs">
            {[
              ["src/features/landing", copy.folders.landing],
              ["src/features/blog", copy.folders.blog],
              ["src/features/posts", copy.folders.posts],
              ["src/features/mcp", copy.folders.mcp],
              ["src/components", copy.folders.components],
            ].map(([path, label]) => (
              <li
                key={path}
                className="grid grid-cols-[auto_1fr] items-start gap-x-2 gap-y-1 py-3.5 sm:grid-cols-[auto_1fr_auto]"
              >
                <Folder
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 text-ink"
                />
                <span className="break-all font-mono text-[11px]">{path}</span>
                <span className="col-start-2 text-[10px] text-muted-foreground sm:col-auto">
                  {label}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t bg-paper/50 px-5 py-3 text-[11px] text-muted-foreground">
            Next.js · TypeScript · Tailwind CSS · shadcn/ui
          </div>
        </div>
      </div>
    </section>
  );
}
