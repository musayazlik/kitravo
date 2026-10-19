import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { postLocales, type Post } from "@/features/posts/data/schema";
import { localeInfo } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
import { getI18n } from "@/i18n/server";

/**
 * Shown when a reader switches language on a post that has no translation
 * in the new language yet: no dead end, just the versions that do exist.
 */
export async function ArticleUnavailable({ post }: { post: Post }) {
  const { t, f, locale } = await getI18n();
  const available = postLocales(post);
  const language = f.language(locale);

  return (
    <div className="mx-auto grid max-w-2xl justify-items-start gap-5 px-4 py-20 sm:px-6 md:py-28">
      <span className="grid size-11 place-items-center rounded-sm bg-ink-soft text-ink">
        <Languages className="size-5" />
      </span>
      <h1 className="text-3xl font-semibold md:text-4xl">{fill(t.blog.unavailable.title, { language })}</h1>
      <p className="text-lg text-muted-foreground">
        {fill(t.blog.unavailable.body, { languages: f.list(available.map((code) => f.language(code))), language })}
      </p>
      <ul className="flex flex-wrap gap-2">
        {available.map((code) => (
          <li key={code}>
            <Link
              href={`/blog/${post.translations[code]!.slug}`}
              locale={code}
              lang={code}
              dir={localeInfo[code].dir}
              className="grid gap-0.5 rounded-sm border bg-card px-4 py-3 transition-colors hover:border-ink"
            >
              <span className="text-xs font-medium text-muted-foreground">{localeInfo[code].name}</span>
              <span className="font-medium">{post.translations[code]!.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Button variant="outline" asChild>
        <Link href="/blog">{t.blog.unavailable.browse}</Link>
      </Button>
    </div>
  );
}
