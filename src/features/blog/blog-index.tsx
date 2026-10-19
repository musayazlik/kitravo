"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { LocalizedPost } from "@/features/posts/data/schema";
import { fill } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { PostCard, PostMeta } from "./components/post-card";
import { PostCover } from "./components/post-cover";

/** One language's blog: the posts translated into it, filterable by category. */
export function BlogIndex({ posts, categories }: { posts: LocalizedPost[]; categories: { id: string; name: string; color: string }[] }) {
  const { t, f, locale } = useI18n();
  const [category, setCategory] = useState("all");
  const [featured, ...rest] = posts;
  const visible = category === "all" ? rest : posts.filter((post) => post.categoryId === category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold md:text-5xl">{t.blog.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t.blog.lead}</p>
      </header>

      {posts.length === 0 && <p className="mt-12 text-muted-foreground">{fill(t.blog.empty, { language: f.language(locale) })}</p>}

      {category === "all" && featured && (
        <article className="group relative mt-12 grid overflow-hidden rounded-sm border md:grid-cols-[1.2fr_1fr]">
          <PostCover post={featured} className="aspect-[16/10] md:aspect-auto md:min-h-80" />
          <div className="grid content-center gap-3 bg-card p-6 md:p-10">
            <PostMeta post={featured} />
            <h2 className="text-3xl leading-tight font-semibold">
              <Link href={`/blog/${featured.slug}`} className="outline-none after:absolute after:inset-0 group-hover:text-ink focus-visible:underline">
                {featured.title}
              </Link>
            </h2>
            <p className="text-muted-foreground">{featured.excerpt}</p>
          </div>
        </article>
      )}

      {categories.length > 0 && (
        <div role="tablist" aria-label={t.blog.filterLabel} className="mt-14 flex flex-wrap gap-1.5 border-b pb-4">
          {[{ id: "all", name: t.blog.allPosts }, ...categories].map((entry) => {
            const selected = category === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setCategory(entry.id)}
                className={cn(
                  "relative rounded-sm px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {selected && (
                  <motion.span layoutId="blog-filter" className="absolute inset-0 rounded-sm bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                )}
                <span className="relative">{entry.name}</span>
              </button>
            );
          })}
        </div>
      )}

      <motion.div layout className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
