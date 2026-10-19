"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { posts } from "@/features/posts/data/posts";
import { localizePost } from "@/features/posts/data/schema";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";

export function TopPosts() {
  const { t, f, locale } = useI18n();
  const top = posts
    .filter((post) => post.status === "published")
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((post) => localizePost(post, locale));
  const max = top[0]?.views ?? 1;

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="font-heading text-lg">{t.dashboard.top.title}</CardTitle>
        <CardDescription>{t.dashboard.top.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3">
          {top.map((post) => (
            <li key={post.id}>
              <Link href={`/panel/posts/${post.id}`} className="group grid gap-1.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <span className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium group-hover:text-ink" lang={post.isFallback ? post.locale : undefined}>
                    {post.title}
                  </span>
                  <span className="tabular shrink-0 text-muted-foreground">{f.compact(post.views)}</span>
                </span>
                <span className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <span className="block h-full rounded-full bg-ink/70" style={{ width: `${(post.views / max) * 100}%` }} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
