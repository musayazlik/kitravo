import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { ArticlePage } from "@/features/blog/article-page";
import { ArticleUnavailable } from "@/features/blog/article-unavailable";
import { findPublishedPost, publishedTranslations } from "@/features/blog/data/articles";
import { localizePost, postLocales } from "@/features/posts/data/schema";
import { localizeHref } from "@/i18n/config";
import { getLocale } from "@/i18n/server";

/** Every published translation is prerendered under its own language and slug. */
export async function generateStaticParams() {
  const locale = await getLocale();
  return publishedTranslations()
    .filter((entry) => entry.locale === locale)
    .map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const locale = await getLocale();
  const found = findPublishedPost(decodeURIComponent((await params).slug), locale);
  const own = found?.post.translations[locale];
  if (!found || !own) return { robots: { index: false } };

  const languages = Object.fromEntries(
    postLocales(found.post).map((code) => [code, `${siteConfig.url}${localizeHref(`/blog/${found.post.translations[code]!.slug}`, code)}`]),
  );
  return {
    title: own.title,
    description: own.excerpt,
    alternates: { canonical: localizeHref(`/blog/${own.slug}`, locale), languages },
    openGraph: { type: "article", locale, title: own.title, description: own.excerpt, publishedTime: found.post.publishedAt ?? undefined },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const locale = await getLocale();
  const slug = decodeURIComponent((await params).slug);
  const found = findPublishedPost(slug, locale);
  if (!found) notFound();

  const own = found.post.translations[locale];
  // Not translated into this language: say so, and link the versions that exist.
  if (!own) return <ArticleUnavailable post={found.post} />;
  // A slug from another language (the switcher keeps it): move to this language's URL.
  if (own.slug !== slug) permanentRedirect(localizeHref(`/blog/${own.slug}`, locale));

  return <ArticlePage post={localizePost(found.post, locale)} />;
}
