import { ArrowLeft } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { siteConfig } from "@/config/site";
import { commentsFor } from "@/features/comments/data/comments";
import { postLocales, type LocalizedPost } from "@/features/posts/data/schema";
import { localeInfo, localizeHref } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { rich } from "@/i18n/rich";
import { getI18n } from "@/i18n/server";
import { CommentsSection } from "./components/comments-section";
import { PostCard, PostMeta } from "./components/post-card";
import { PostCover } from "./components/post-cover";
import { ReadingProgress } from "./components/reading-progress";
import { articleHtml, relatedPosts, tagNames } from "./data/articles";

export async function ArticlePage({ post }: { post: LocalizedPost }) {
  const { t, locale } = await getI18n();
  const url = `${siteConfig.url}${localizeHref(`/blog/${post.slug}`, locale)}`;
  const tags = tagNames(post);
  const related = relatedPosts(post, locale);
  const otherLanguages = postLocales(post).filter((code) => code !== locale);

  return (
    <>
      <ReadingProgress />
      <article className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 md:pt-14">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> {t.blog.allPosts}
          </Link>
          <header className="mt-8 grid gap-5">
            <PostMeta post={post} />
            <h1 className="text-4xl leading-[1.08] font-semibold md:text-5xl">{post.title}</h1>
            <p className="text-xl leading-relaxed text-muted-foreground">{post.excerpt}</p>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
              <p>{rich(t.blog.article.by, { b: (chunks) => <span className="font-medium">{chunks}</span>, author: post.author })}</p>
              {otherLanguages.length > 0 && (
                <nav aria-label={t.blog.article.alsoIn} className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
                  <span>{t.blog.article.alsoIn}:</span>
                  {otherLanguages.map((code) => (
                    <Link
                      key={code}
                      href={`/blog/${post.translations[code]!.slug}`}
                      locale={code}
                      lang={code}
                      className="rounded-sm border px-1.5 py-0.5 text-xs font-medium text-foreground transition-colors hover:border-ink hover:text-ink"
                    >
                      {localeInfo[code].name}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </header>
        </div>

        <PostCover post={post} className="mt-10 aspect-[21/9] rounded-sm border" />

        <div className="mx-auto mt-12 max-w-3xl">
          {/* Trusted demo HTML; real posts come from the editor and are sanitised on save. */}
          <div className="prose-article" dangerouslySetInnerHTML={{ __html: articleHtml(post, locale) }} />

          <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-y py-5">
            <ul className="flex flex-wrap gap-1.5" aria-label={t.blog.article.tags}>
              {tags.map((tag) => (
                <li key={tag} className="rounded-sm border px-2 py-0.5 text-sm text-muted-foreground">
                  {tag}
                </li>
              ))}
            </ul>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              {t.blog.article.copyLink} <CopyButton value={url} label={t.blog.article.copyLinkLabel} />
            </span>
          </footer>

          <div className="mt-14">
            <CommentsSection comments={commentsFor(post.id, locale)} />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-20 border-t bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 id="related-title" className="text-2xl font-semibold">
              {t.blog.article.keepReading}
            </h2>
            <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
              {related.map((other) => (
                <PostCard key={other.id} post={other} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
