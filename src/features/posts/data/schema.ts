import { z } from "zod";
import { locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { fill } from "@/i18n/format";

export const postStatuses = ["draft", "review", "scheduled", "published"] as const;
export type PostStatus = (typeof postStatuses)[number];

/** Badge tone per status; the label comes from `t.posts.status`. */
export const postStatusMeta: Record<PostStatus, { tone: "muted" | "proof" | "ink" | "signal" }> = {
  draft: { tone: "muted" },
  review: { tone: "proof" },
  scheduled: { tone: "ink" },
  published: { tone: "signal" },
};

const localeSchema = z.enum(locales);

/** A category's name and description in one language. */
export const categoryTextSchema = z.object({ name: z.string().min(1), description: z.string().optional() });

export const categorySchema = z.object({
  id: z.string(),
  /** Name and description in the default language (English); `translations` holds the rest. */
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  color: z.string(),
  postCount: z.number(),
  translations: z.partialRecord(localeSchema, categoryTextSchema).optional(),
});
export type Category = z.infer<typeof categorySchema>;

export const tagSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  postCount: z.number(),
});
export type Tag = z.infer<typeof tagSchema>;

/** What changes per language: the words and the URL. Everything else on a post is shared. */
export const postContentSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
});
export type PostContent = z.infer<typeof postContentSchema>;

export const postSchema = z.object({
  id: z.string(),
  status: z.enum(postStatuses),
  categoryId: z.string().nullable(),
  tags: z.array(z.string()),
  author: z.string(),
  featured: z.boolean(),
  readingTime: z.number(),
  views: z.number(),
  seoScore: z.number().min(0).max(100),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
  scheduledAt: z.string().nullable(),
  /** The language the post was written in. It always has a translation and cannot be removed. */
  sourceLocale: localeSchema,
  translations: z.partialRecord(localeSchema, postContentSchema),
});
export type Post = z.infer<typeof postSchema>;

/** A post read in one language: its translation there, or the source text when there is none yet. */
export type LocalizedPost = Post & PostContent & { locale: Locale; isFallback: boolean };

export function localizePost(post: Post, locale: Locale): LocalizedPost {
  const own = post.translations[locale];
  const content = own ?? post.translations[post.sourceLocale]!;
  return { ...post, ...content, locale: own ? locale : post.sourceLocale, isFallback: !own };
}

/** Languages the post is available in, in the configured order. */
export function postLocales(post: Pick<Post, "translations">): Locale[] {
  return locales.filter((locale) => post.translations[locale]);
}

export function categoryText(category: Category, locale: Locale) {
  const own = category.translations?.[locale];
  return { name: own?.name ?? category.name, description: own?.description ?? category.description };
}

export const TITLE_MAX = 60;
export const EXCERPT_MAX = 160;

/**
 * Editor form: what a writer can change on a post, for the language being
 * edited. The title doubles as the SEO title. Messages come from the
 * current interface language.
 */
export function postFormSchema(messages: Dictionary["editor"]["validation"]) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(3, messages.titleMin)
      .max(TITLE_MAX, fill(messages.titleMax, { max: TITLE_MAX })),
    slug: z
      .string()
      .min(3, messages.slugMin)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, messages.slugPattern),
    excerpt: z.string().max(EXCERPT_MAX, fill(messages.excerptMax, { max: EXCERPT_MAX })),
    status: z.enum(postStatuses),
    scheduleDate: z.string(),
    scheduleTime: z.string(),
    categoryId: z.string().nullable(),
    tags: z.array(z.string()),
    featured: z.boolean(),
  });
}
export type PostFormValues = z.infer<ReturnType<typeof postFormSchema>>;
