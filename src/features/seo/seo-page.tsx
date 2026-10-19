"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink, Languages, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EvilRadialChart } from "@/components/evilcharts/charts/recharts-radial-chart";
import type { ChartConfig } from "@/components/evilcharts/ui/recharts-chart";
import { Main, PageHeader } from "@/components/layout/page-header";
import { StatusBadge, type Tone } from "@/components/status-badge";
import { ActionButton } from "@/components/access/action-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { siteConfig } from "@/config/site";
import { publishedTranslations } from "@/features/blog/data/articles";
import { posts } from "@/features/posts/data/posts";
import { defaultLocale, localeInfo, locales, type Locale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { chartColors } from "@/lib/chart-colors";

const health = [{ name: "score", value: 82 }];

type IssueKey = "meta" | "alt" | "long" | "cover" | "translations";
const issues: { id: string; key: IssueKey; severity: "high" | "medium" | "low"; count: number; href: string }[] = [
  { id: "s1", key: "meta", severity: "high", count: 5, href: "/panel/posts" },
  { id: "s2", key: "alt", severity: "high", count: 2, href: "/panel/media" },
  { id: "s3", key: "long", severity: "medium", count: 3, href: "/panel/posts" },
  { id: "s4", key: "cover", severity: "low", count: 1, href: "/panel/posts" },
];

const severityTone: Record<"high" | "medium" | "low", Tone> = { high: "rust", medium: "proof", low: "muted" };

/** Published posts per language: how much of the blog each language's readers (and search engines) can see. */
const publishedTotal = posts.filter((post) => post.status === "published").length;
const coverage = Object.fromEntries(
  locales.map((locale) => [locale, publishedTranslations().filter((entry) => entry.locale === locale).length]),
) as Record<Locale, number>;
/** The language with the most published posts still untranslated, raised as an SEO issue. */
const weakest = locales.reduce((low, locale) => (coverage[locale] < coverage[low] ? locale : low), defaultLocale);

type Redirect = { id: string; from: string; to: string; code: 301 | 302; hits: number };

export function SeoPage() {
  const { t, f, plural } = useI18n();
  const copy = t.seo;
  const healthConfig = { score: { label: copy.health, colors: chartColors.signal } } satisfies ChartConfig;
  const allIssues = [
    ...issues,
    ...(coverage[weakest] < publishedTotal
      ? [{ id: "s5", key: "translations" as const, severity: "medium" as const, count: publishedTotal - coverage[weakest], href: "/panel/posts" }]
      : []),
  ].sort((a, b) => ["high", "medium", "low"].indexOf(a.severity) - ["high", "medium", "low"].indexOf(b.severity));
  const [indexing, setIndexing] = useState(true);
  const [redirects, setRedirects] = useState<Redirect[]>([
    { id: "d1", from: "/themes/nordform-classic", to: "/theme/nordform", code: 301, hits: 412 },
    { id: "d2", from: "/blog/website-migration", to: `/blog/${posts[0].translations.en!.slug}`, code: 301, hits: 96 },
    { id: "d3", from: "/pricing-old", to: "/pricing", code: 302, hits: 12 },
  ]);
  const [draft, setDraft] = useState({ from: "", to: "" });
  const robots = indexing
    ? `User-agent: *\nAllow: /\nDisallow: /panel\nDisallow: /api/\n\nSitemap: ${siteConfig.url}/sitemap.xml`
    : "User-agent: *\nDisallow: /";

  return (
    <Main>
      <PageHeader
        title={t.nav.items.seo}
        description={copy.description}
        actions={
          <ActionButton permission="seo.manage" variant="outline" asChild>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer">
              <ExternalLink /> {copy.viewSitemap}
            </a>
          </ActionButton>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Card className="gap-2">
          <CardHeader>
            <CardTitle className="font-heading text-lg">{copy.health}</CardTitle>
            <CardDescription>{copy.healthHelp}</CardDescription>
          </CardHeader>
          <CardContent className="relative" dir="ltr">
            <EvilRadialChart data={health} nameKey="name" config={healthConfig} variant="semi" max={100} innerRadius="78%" className="mx-auto aspect-[2/1] h-[150px]">
              <EvilRadialChart.RadialBar dataKey="value" cornerRadius={10} showBackground />
            </EvilRadialChart>
            <p className="absolute inset-x-0 bottom-3 text-center">
              <span className="font-heading text-4xl font-semibold tabular">82</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </p>
          </CardContent>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                [copy.stats.indexed, f.number(81)],
                [copy.stats.sitemap, f.number(84)],
                [copy.stats.redirects, f.number(redirects.length)],
                [copy.stats.broken, f.number(0)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-muted/60 p-2.5">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="font-heading text-xl font-semibold tabular">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="font-heading text-lg">{copy.issues}</CardTitle>
            <CardDescription>{copy.issuesHelp}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {allIssues.map((issue) => (
                <li key={issue.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <StatusBadge tone={severityTone[issue.severity]} className="min-w-28 justify-center">
                    {copy.severity[issue.severity]}
                  </StatusBadge>
                  <div className="grid min-w-0 flex-1">
                    <span className="text-sm font-medium">{plural(copy.issueList[issue.key].title, issue.count, { language: f.language(weakest) })}</span>
                    <span className="text-xs text-muted-foreground">
                      {fill(copy.issueList[issue.key].detail, { files: f.list(["lcp-before-after.png", "avif-comparison.webp"]) })}
                    </span>
                  </div>
                  <ActionButton permission="seo.manage" variant="ghost" size="sm" asChild>
                    <Link href={issue.href}>
                      {copy.review} <ArrowRight data-icon="inline-end" />
                    </Link>
                  </ActionButton>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-lg">
            <Languages className="size-5 text-ink" /> {copy.multilingual.title}
          </CardTitle>
          <CardDescription>{fill(copy.multilingual.description, { language: f.language(defaultLocale) })}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-5">
            {locales.map((locale) => (
              <li key={locale} className="grid gap-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium" lang={locale}>
                    {localeInfo[locale].name}
                  </span>
                  {locale === defaultLocale && <StatusBadge tone="ink">x-default</StatusBadge>}
                </div>
                <code className="truncate font-mono text-xs text-muted-foreground" dir="ltr" title={copy.multilingual.urls}>
                  /{locale}/blog/…
                </code>
                <Progress value={(coverage[locale] / publishedTotal) * 100} className="h-1.5" aria-label={`${copy.multilingual.coverage}: ${localeInfo[locale].name}`} />
                <span className="text-xs text-muted-foreground">
                  {copy.multilingual.coverage}: {fill(copy.multilingual.of, { count: coverage[locale], total: publishedTotal })}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">{copy.engines}</CardTitle>
            <CardDescription>{copy.enginesHelp}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field orientation="horizontal" className="rounded-lg border p-3">
                <div className="grid flex-1 gap-1">
                  <FieldLabel htmlFor="indexing">{copy.indexing}</FieldLabel>
                  <FieldDescription>{copy.indexingHelp}</FieldDescription>
                </div>
                <Switch id="indexing" checked={indexing} onCheckedChange={setIndexing} />
              </Field>
              <Field>
                <FieldLabel htmlFor="suffix">{copy.suffix}</FieldLabel>
                <Input id="suffix" defaultValue={` | ${siteConfig.name}`} />
                <FieldDescription>{copy.suffixHelp}</FieldDescription>
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                {["Google", "Bing", "Yandex"].map((engine) => (
                  <Field key={engine}>
                    <FieldLabel htmlFor={`verify-${engine}`}>{fill(copy.code, { engine })}</FieldLabel>
                    <Input id={`verify-${engine}`} dir="ltr" className="font-mono text-xs" placeholder={copy.paste} defaultValue={engine === "Google" ? "x7Kq2-ZcM0hP" : ""} />
                  </Field>
                ))}
              </div>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <ActionButton permission="seo.manage" onClick={() => toast.success(copy.saved)}>{copy.save}</ActionButton>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">robots.txt</CardTitle>
            <CardDescription>{copy.robotsHelp}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre dir="ltr" className="overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs leading-6">
              {robots}
            </pre>
            {!indexing && <p className="mt-3 text-sm text-destructive">{copy.indexingOff}</p>}
          </CardContent>
        </Card>
      </div>

      <Card className="gap-3">
        <CardHeader>
          <CardTitle className="font-heading text-lg">{copy.redirects}</CardTitle>
          <CardDescription>{copy.redirectsHelp}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form
            className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              setRedirects((current) => [{ id: `d${Date.now()}`, from: draft.from, to: draft.to, code: 301, hits: 0 }, ...current]);
              setDraft({ from: "", to: "" });
              toast.success(copy.added);
            }}
          >
            <Input aria-label={copy.oldPath} placeholder="/old-path" dir="ltr" className="font-mono text-sm" value={draft.from} onChange={(event) => setDraft({ ...draft, from: event.target.value })} required pattern="/.*" />
            <Input aria-label={copy.newPath} placeholder="/new-path" dir="ltr" className="font-mono text-sm" value={draft.to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} required pattern="/.*" />
            <ActionButton permission="seo.manage" type="submit" variant="secondary">
              <Plus /> {copy.addRedirect}
            </ActionButton>
          </form>
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>{copy.from}</TableHead>
                  <TableHead>{copy.to}</TableHead>
                  <TableHead>{copy.type}</TableHead>
                  <TableHead className="text-end">{copy.hits}</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {redirects.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell className="max-w-56 truncate font-mono text-xs" dir="ltr">
                      {redirect.from}
                    </TableCell>
                    <TableCell className="max-w-72 truncate font-mono text-xs" dir="ltr">
                      {redirect.to}
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={redirect.code === 301 ? "ink" : "muted"}>{redirect.code === 301 ? copy.permanent : copy.temporary}</StatusBadge>
                    </TableCell>
                    <TableCell className="tabular text-end">{redirect.hits}</TableCell>
                    <TableCell>
                      <ActionButton permission="seo.manage"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={fill(copy.deleteRedirect, { path: redirect.from })}
                        onClick={() => setRedirects((current) => current.filter((entry) => entry.id !== redirect.id))}
                      >
                        <Trash2 />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </Main>
  );
}
