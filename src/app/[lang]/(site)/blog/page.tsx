import type { Metadata } from "next";
import { BlogIndex } from "@/features/blog/blog-index";
import { blogCategories, publishedPostsIn } from "@/features/blog/data/articles";
import { getI18n, getLocale, localizedAlternates } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.blog.metaTitle,
    description: t.blog.metaDescription,
    alternates: await localizedAlternates("/blog"),
  };
}

/** Each language's blog lists only the posts translated into it. */
export default async function BlogPage() {
  const locale = await getLocale();
  return <BlogIndex posts={publishedPostsIn(locale)} categories={blogCategories(locale)} />;
}
