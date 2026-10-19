"use client";

import { getCategory } from "@/features/posts/data/posts";
import { categoryText, type LocalizedPost } from "@/features/posts/data/schema";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { PostCover } from "./post-cover";

export function PostMeta({ post, className }: { post: LocalizedPost; className?: string }) {
  const { t, f, plural, locale } = useI18n();
  const category = getCategory(post.categoryId);

  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground", className)}>
      {category && (
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
          {categoryText(category, locale).name}
        </span>
      )}
      {post.publishedAt && <time dateTime={post.publishedAt}>{f.date(post.publishedAt)}</time>}
      <span>{plural(t.blog.minRead, post.readingTime)}</span>
    </p>
  );
}

/** A post in a list: cover, meta, title and excerpt; the whole card is one link. */
export function PostCard({ post, className }: { post: LocalizedPost; className?: string }) {
  return (
    <article className={cn("group relative grid content-start gap-4", className)}>
      <div className="overflow-hidden rounded-sm border">
        <PostCover post={post} className="aspect-[16/10] transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
      </div>
      <div className="grid gap-2">
        <PostMeta post={post} />
        <h3 className="text-xl leading-snug font-semibold">
          <Link href={`/blog/${post.slug}`} className="outline-none after:absolute after:inset-0 group-hover:text-ink focus-visible:underline">
            {post.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">{post.excerpt}</p>
      </div>
    </article>
  );
}
