import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";
import { siteFooterColumns } from "@/config/nav";
import { getI18n } from "@/i18n/server";
import { Container } from "@/components/layout/container";

export async function SiteFooter() {
  const { t } = await getI18n();

  return (
    <footer className="border-t bg-paper/50">
      <Container className="grid gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8 md:grid-cols-[1.8fr_1fr_1fr_1fr]">
        <div className="grid content-start gap-4 sm:col-span-3 md:col-span-1">
          <Link href="/" className="flex w-fit items-center gap-2.5">
            <LogoMark className="size-8" />
            <span className="font-heading text-lg font-semibold">
              {siteConfig.name}
            </span>
          </Link>
          <p className="max-w-[260px] text-sm leading-6 text-muted-foreground">
            {t.site.footer.tagline}
          </p>
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border bg-background px-2.5 py-1.5 text-[10px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-signal" /> {t.site.footer.openSource} ·{" "}
            {siteConfig.githubUrl ? t.site.footer.onGitHub : t.site.footer.comingToGitHub}
          </span>
        </div>
        {siteFooterColumns.map((column) => (
          <nav
            key={column.title}
            aria-label={t.site.links[column.title]}
            className="grid content-start gap-1 text-sm"
          >
            <p className="mb-2 text-xs font-semibold">{t.site.links[column.title]}</p>
            {column.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 w-fit items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-ink"
              >
                {t.site.links[link.label]}
              </Link>
            ))}
          </nav>
        ))}
      </Container>
      <div className="border-t">
        <Container className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 text-[11px] text-muted-foreground sm:px-8">
          <p>
            {siteConfig.name} · {t.site.footer.motto}
          </p>
          <Link
            href="/panel/dashboard"
            className="inline-flex min-h-9 items-center gap-1"
          >
            {t.site.footer.madeWithCare}{" "}
            <ArrowUpRight aria-hidden="true" className="size-3" />
          </Link>
        </Container>
      </div>
    </footer>
  );
}
