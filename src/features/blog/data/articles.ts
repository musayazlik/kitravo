import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { categories, getCategory, posts, tags } from "@/features/posts/data/posts";
import { categoryText, localizePost, postLocales, type LocalizedPost, type Post } from "@/features/posts/data/schema";
import { articleBodies } from "./article-bodies";

/** Every published post, newest first, in any language. */
const published = posts
  .filter((post) => post.status === "published")
  .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

/** What one language's blog lists: published posts that have a translation in that language. */
export function publishedPostsIn(locale: Locale): LocalizedPost[] {
  return published.filter((post) => post.translations[locale]).map((post) => localizePost(post, locale));
}

/** Every published translation, for the sitemap and static params. */
export function publishedTranslations() {
  return published.flatMap((post) => postLocales(post).map((locale) => ({ post, locale, slug: post.translations[locale]!.slug })));
}

/**
 * Resolves a blog URL. A slug from the current language wins; a slug from
 * another language still finds the post, so the language switcher can keep
 * the reader on the same article (the page then redirects to the local slug
 * or explains that this language has no version yet).
 */
export function findPublishedPost(slug: string, locale: Locale): { post: Post; matched: Locale } | null {
  const own = published.find((post) => post.translations[locale]?.slug === slug);
  if (own) return { post: own, matched: locale };
  for (const post of published) {
    const matched = postLocales(post).find((code) => post.translations[code]!.slug === slug);
    if (matched) return { post, matched };
  }
  return null;
}

export function tagNames(post: Post) {
  return post.tags.map((id) => tags.find((tag) => tag.id === id)?.name).filter(Boolean) as string[];
}

/** Categories that have at least one post in this language, with names in it. */
export function blogCategories(locale: Locale) {
  const listed = publishedPostsIn(locale);
  return categories
    .filter((category) => listed.some((post) => post.categoryId === category.id))
    .map((category) => ({ id: category.id, color: category.color, name: categoryText(category, locale).name }));
}

export function relatedPosts(post: Post, locale: Locale, limit = 3) {
  const others = publishedPostsIn(locale).filter((other) => other.id !== post.id);
  const sameCategory = others.filter((other) => other.categoryId === post.categoryId);
  const rest = others.filter((other) => other.categoryId !== post.categoryId);
  return [...sameCategory, ...rest].slice(0, limit);
}

/** Demo body for a post in one language. Real posts store the editor's HTML per translation. */
export function articleHtml(post: Post, locale: Locale) {
  const category = getCategory(post.categoryId);
  return fill(articleBodies[locale], { category: category ? categoryText(category, locale).name : "Blog" });
}
