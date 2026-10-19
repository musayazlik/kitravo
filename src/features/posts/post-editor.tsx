"use client";

import { useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, Copy, FilePlus, ImagePlus, Languages, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Main, PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAccess } from "@/components/access/access-provider";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { articleBodies } from "@/features/blog/data/article-bodies";
import { articleHtml } from "@/features/blog/data/articles";
import { comments } from "@/features/comments/data/comments";
import { MediaPicker } from "@/features/media/components/media-picker";
import { MediaThumb } from "@/features/media/components/media-thumb";
import type { MediaAsset } from "@/features/media/data/media";
import { localeInfo, locales, type Locale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { Link, useRouter } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { slugify } from "@/lib/slugify";
import { cn } from "@/lib/utils";
import { AiDraftDialog, type AiDraftRequest } from "./components/ai-draft-dialog";
import { RichTextEditor } from "./components/rich-text-editor";
import { SerpPreview } from "./components/serp-preview";
import { TagMultiSelect } from "./components/tag-multi-select";
import { TermDialog, type Term } from "./components/term-dialog";
import { categories as seedCategories, tags as seedTags } from "./data/posts";
import {
  EXCERPT_MAX,
  postFormSchema,
  postLocales,
  postStatuses,
  TITLE_MAX,
  type Post,
  type PostContent,
  type PostFormValues,
  type PostStatus,
} from "./data/schema";

/** One language's version of the post while it is being edited. */
type Draft = PostContent & { html: string };

/** Card that groups one concern of the form under a small section label. */
function Section({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-sm border bg-card p-5", className)}>
      <h2 className="mb-4 font-mono text-[10px] font-medium tracking-widest text-muted-foreground uppercase">{label}</h2>
      {children}
    </section>
  );
}

function CharCounter({ value, max }: { value: number; max: number }) {
  return (
    <span className={cn("tabular text-xs", value > max ? "text-destructive" : value > max * 0.9 ? "text-proof-foreground" : "text-muted-foreground")}>
      {value}/{max}
    </span>
  );
}

function scheduleParts(iso: string | null) {
  if (!iso) return { date: "", time: "" };
  const value = new Date(iso);
  return { date: format(value, "yyyy-MM-dd"), time: format(value, "HH:mm") };
}

function initialDrafts(post: Post | undefined, fallback: Locale): Partial<Record<Locale, Draft>> {
  if (!post) return { [fallback]: { title: "", slug: "", excerpt: "", html: "" } };
  return Object.fromEntries(postLocales(post).map((code) => [code, { ...post.translations[code]!, html: articleHtml(post, code) }]));
}

export function PostEditor({ post }: { post?: Post }) {
  const access = useAccess();
  const router = useRouter();
  const { t, f, plural, locale: uiLocale } = useI18n();
  const copy = t.editor;
  const sourceLocale = post?.sourceLocale ?? uiLocale;

  // Every language's text lives in `drafts`; the form holds the one being edited.
  const [drafts, setDrafts] = useState(() => initialDrafts(post, sourceLocale));
  const [contentLocale, setContentLocale] = useState<Locale>(() => (post?.translations[uiLocale] ? uiLocale : sourceLocale));
  const active = drafts[contentLocale]!;
  const [schema] = useState(() => postFormSchema(copy.validation));

  const schedule = scheduleParts(post?.scheduledAt ?? null);
  const form = useForm<PostFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: active.title,
      slug: active.slug,
      excerpt: active.excerpt,
      status: post?.status ?? "draft",
      scheduleDate: schedule.date,
      scheduleTime: schedule.time,
      categoryId: post?.categoryId ?? null,
      tags: post?.tags ?? [],
      featured: post?.featured ?? false,
    },
  });
  const { register, control, watch, setValue, getValues, formState, handleSubmit } = form;

  const [html, setHtml] = useState(active.html);
  const [editorKey, setEditorKey] = useState(0);
  const [cover, setCover] = useState<MediaAsset | null>(null);
  const [savedStatus, setSavedStatus] = useState<PostStatus>(post?.status ?? "draft");
  // Languages whose slug the writer edited by hand; the others follow their title.
  const [touchedSlugs, setTouchedSlugs] = useState<Set<Locale>>(() => new Set(post ? postLocales(post) : []));
  const [categoryOptions, setCategoryOptions] = useState<Term[]>(seedCategories);
  const [tagOptions, setTagOptions] = useState<Term[]>(seedTags);
  const [notice, setNotice] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [newTerm, setNewTerm] = useState<"category" | "tag" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removing, setRemoving] = useState<Locale | null>(null);
  const [allowComments, setAllowComments] = useState(true);
  const postComments = post ? comments.filter((comment) => comment.postId === post.id) : [];
  const waitingComments = postComments.filter((comment) => comment.status === "pending").length;

  const [title, slug, excerpt, status, scheduleDate] = watch(["title", "slug", "excerpt", "status", "scheduleDate"]);
  const contentDir = localeInfo[contentLocale].dir;
  const language = (code: Locale) => f.language(code);

  /** The drafts with the form's current text written back into the active language. */
  const committed = () => ({ ...drafts, [contentLocale]: { title: getValues("title"), slug: getValues("slug"), excerpt: getValues("excerpt"), html } });

  const load = (code: Locale, draft: Draft) => {
    setValue("title", draft.title);
    setValue("slug", draft.slug);
    setValue("excerpt", draft.excerpt);
    form.clearErrors(["title", "slug", "excerpt"]);
    setHtml(draft.html);
    setEditorKey((key) => key + 1);
    setContentLocale(code);
  };

  const openLocale = (code: Locale) => {
    if (code === contentLocale) return;
    const next = committed();
    setDrafts(next);
    load(code, next[code]!);
  };

  const addTranslation = async (code: Locale, mode: "copy" | "ai" | "empty") => {
    const next = committed();
    const source = next[sourceLocale]!;
    // Arabic and Chinese titles have no Latin slug, so a new translation starts from the source slug.
    const draft: Draft =
      mode === "empty"
        ? { title: "", slug: localeInfo[code].latinSlugs ? "" : source.slug, excerpt: "", html: "" }
        : { ...source };
    if (mode === "ai") await new Promise((resolve) => setTimeout(resolve, 900));
    setDrafts({ ...next, [code]: draft });
    setTouchedSlugs((current) => {
      const updated = new Set(current);
      updated.delete(code);
      return updated;
    });
    load(code, draft);
    setNotice(mode === "ai" ? fill(copy.languages.aiPreview, { source: language(sourceLocale) }) : "");
    toast.success(fill(copy.languages.added, { language: language(code) }));
  };

  const removeTranslation = (code: Locale) => {
    const next: Partial<Record<Locale, Draft>> = { ...committed() };
    delete next[code];
    setDrafts(next);
    if (code === contentLocale) load(sourceLocale, next[sourceLocale]!);
    toast.success(fill(copy.languages.removed, { language: language(code) }));
  };

  const submit = handleSubmit(
    async (values) => {
      const changesPublication = [values.status, post?.status].some((status) => status === "published" || status === "scheduled");
      if (!access.can(post ? "posts.update" : "posts.create") || (changesPublication && !access.can("posts.publish"))) {
        toast.error(t.access.forbidden);
        return;
      }
      const all = committed();
      setDrafts(all);
      // Every translation hangs off the source text, so it must exist before anything is saved.
      if ((all[sourceLocale]?.title.trim().length ?? 0) < 3) {
        toast.error(fill(copy.languages.missingSource, { language: language(sourceLocale) }));
        return;
      }
      // Publishing rule: a post cannot go live or be scheduled without a category and at least one tag.
      if ((values.status === "published" || values.status === "scheduled") && (!values.categoryId || values.tags.length === 0)) {
        toast.error(copy.validation.needsTaxonomy);
        return;
      }
      if (values.status === "scheduled") {
        const publishAt = new Date(`${values.scheduleDate}T${values.scheduleTime || "09:00"}`);
        if (!values.scheduleDate || Number.isNaN(publishAt.getTime()) || publishAt <= new Date()) {
          form.setError("scheduleDate", { message: copy.validation.futureDate });
          return;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSavedStatus(values.status);
      toast.success(copy.toasts[values.status === "published" ? "published" : values.status === "scheduled" ? "scheduled" : values.status === "review" ? "review" : "draft"]);
      router.push("/panel/posts");
    },
    () => toast.error(copy.validation.attention),
  );

  const applyAiDraft = async ({ brief }: AiDraftRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 1400));
    const nextTitle = getValues("title").trim() || brief.split(/[.,،。]/)[0].slice(0, TITLE_MAX);
    setValue("title", nextTitle, { shouldValidate: true, shouldDirty: true });
    if (!touchedSlugs.has(contentLocale) && localeInfo[contentLocale].latinSlugs && slugify(nextTitle)) setValue("slug", slugify(nextTitle));
    if (!getValues("excerpt")) setValue("excerpt", copy.aiExcerpt);
    setValue("status", "draft");
    setHtml(fill(articleBodies[contentLocale], { category: "Blog" }));
    setEditorKey((key) => key + 1);
    setNotice(copy.aiNotice);
  };

  const termName = (term: Term) => term.translations?.[uiLocale]?.name || term.name;

  return (
    <Main className="gap-5">
      <PageHeader title={post ? copy.editTitle : copy.newTitle} description={copy.description} />

      <form onSubmit={(event) => event.preventDefault()} className="overflow-hidden rounded-sm border bg-card">
        <div className="flex flex-col gap-3 border-b bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <Button variant="ghost" asChild className="w-fit">
            <Link href="/panel/posts">
              <ArrowLeft /> {copy.back}
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setAiOpen(true)} disabled={formState.isSubmitting}>
              <Sparkles /> {copy.generate}
            </Button>
            {post && (
              <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)} disabled={formState.isSubmitting || !access.can("posts.delete")}>
                <Trash2 /> {copy.deletePost}
              </Button>
            )}
          </div>
        </div>

        {/* Languages: pick the version to edit, or add a missing one. */}
        <div className="grid gap-2 border-b px-5 py-3 md:px-6">
          <div className="flex flex-wrap items-center gap-1.5" aria-label={copy.languages.heading} role="group">
            <span className="me-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Languages className="size-4" /> {copy.languages.heading}
            </span>
            {locales.map((code) => {
              const name = localeInfo[code].name;
              if (drafts[code]) {
                const selected = code === contentLocale;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => openLocale(code)}
                    aria-pressed={selected}
                    title={`${language(code)}: ${copy.languages.translated}`}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-sm border px-2.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected ? "border-ink bg-ink-soft font-medium text-ink" : "hover:bg-muted",
                    )}
                  >
                    <span lang={code}>{name}</span>
                    {code === sourceLocale && (
                      <span className="rounded-sm bg-background px-1 font-mono text-[9px] tracking-wider text-muted-foreground uppercase">{copy.languages.source}</span>
                    )}
                  </button>
                );
              }
              return (
                <DropdownMenu key={code}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      title={`${language(code)}: ${copy.languages.missing}`}
                      className="inline-flex h-8 items-center gap-1 rounded-sm border border-dashed px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:border-ink hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Plus className="size-3.5" />
                      <span lang={code}>{name}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel className="grid gap-0.5">
                      <span>{fill(copy.languages.addTitle, { language: language(code) })}</span>
                      <span className="text-xs font-normal text-muted-foreground">{fill(copy.languages.addBody, { source: language(sourceLocale) })}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => addTranslation(code, "copy")}>
                      <Copy /> {fill(copy.languages.copySource, { source: language(sourceLocale) })}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => addTranslation(code, "ai")}>
                      <Sparkles /> {copy.languages.translateAi}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => addTranslation(code, "empty")}>
                      <FilePlus /> {copy.languages.startEmpty}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
            {contentLocale !== sourceLocale && (
              <Button type="button" variant="ghost" size="sm" className="ms-auto text-destructive hover:text-destructive" onClick={() => setRemoving(contentLocale)}>
                <Trash2 /> {copy.languages.remove}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{copy.languages.help}</p>
        </div>

        {notice && (
          <Alert className="mx-5 mt-4 w-auto border-signal/30 bg-signal-soft md:mx-6" role="status">
            <AlertDescription className="text-signal-foreground">{notice}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Writing column: everything here belongs to the language being edited. */}
          <div className="grid min-w-0 content-start gap-5 p-5 md:p-6 lg:border-e">
            <Section label={`${copy.sections.content} · ${localeInfo[contentLocale].name}`}>
              <div className="grid gap-5" lang={contentLocale} dir={contentDir}>
                <Field data-invalid={!!formState.errors.title}>
                  <div className="flex items-baseline justify-between gap-2">
                    <FieldLabel htmlFor="post-title">
                      {copy.fields.title} <span className="font-normal text-muted-foreground">{fill(copy.fields.titleHint, { max: TITLE_MAX })}</span>
                    </FieldLabel>
                    <CharCounter value={title.length} max={TITLE_MAX} />
                  </div>
                  <Input
                    id="post-title"
                    placeholder={copy.fields.titlePlaceholder}
                    aria-invalid={!!formState.errors.title}
                    {...register("title", {
                      onChange: (event) => {
                        // Arabic and Chinese titles have no Latin form; those translations keep their slug.
                        const next = slugify(event.target.value);
                        if (!touchedSlugs.has(contentLocale) && localeInfo[contentLocale].latinSlugs && next) setValue("slug", next);
                      },
                    })}
                  />
                  <FieldError errors={[formState.errors.title]} />
                </Field>
                <Field data-invalid={!!formState.errors.excerpt}>
                  <div className="flex items-baseline justify-between gap-2">
                    <FieldLabel htmlFor="post-excerpt">
                      {copy.fields.excerpt} <span className="font-normal text-muted-foreground">{copy.fields.excerptHint}</span>
                    </FieldLabel>
                    <CharCounter value={excerpt.length} max={EXCERPT_MAX} />
                  </div>
                  <Textarea id="post-excerpt" rows={3} placeholder={copy.fields.excerptPlaceholder} aria-invalid={!!formState.errors.excerpt} {...register("excerpt")} />
                  <FieldDescription>{copy.fields.excerptHelp}</FieldDescription>
                  <FieldError errors={[formState.errors.excerpt]} />
                </Field>
                <SerpPreview title={title} description={excerpt} slug={slug} locale={contentLocale} />
              </div>
            </Section>

            <div className="grid gap-3">
              <h2 className="font-mono text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                {copy.sections.body} · {localeInfo[contentLocale].name}
              </h2>
              <RichTextEditor
                key={editorKey}
                id="post-content"
                label={copy.sections.body}
                content={html}
                lang={contentLocale}
                dir={contentDir}
                onChange={(next) => setHtml(next)}
              />
            </div>
          </div>

          {/* Settings column: shared by every language. */}
          <aside className="grid content-start gap-5 bg-muted/30 p-5 md:p-6">
            <Section label={copy.sections.publishing}>
              <Field>
                <FieldLabel htmlFor="post-status">{copy.fields.status}</FieldLabel>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.clearErrors("scheduleDate");
                      }}
                    >
                      <SelectTrigger id="post-status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {postStatuses.map((value) => (
                          <SelectItem key={value} value={value} disabled={(value === "published" || value === "scheduled") && !access.can("posts.publish")}>
                            {copy.publish[value].action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldDescription>{copy.publish[status].help}</FieldDescription>
              </Field>

              {status === "scheduled" && (
                <Field className="mt-4 border-t pt-4" data-invalid={!!formState.errors.scheduleDate}>
                  <FieldLabel>{copy.fields.publishOn}</FieldLabel>
                  <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          aria-label={copy.fields.scheduleDate}
                          className={cn("justify-start font-normal", !scheduleDate && "text-muted-foreground")}
                        >
                          <CalendarDays />
                          {scheduleDate ? f.date(`${scheduleDate}T00:00:00Z`) : copy.fields.pickDate}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduleDate ? new Date(`${scheduleDate}T00:00`) : undefined}
                          onSelect={(day) => {
                            setValue("scheduleDate", day ? format(day, "yyyy-MM-dd") : "");
                            form.clearErrors("scheduleDate");
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <Input type="time" aria-label={copy.fields.scheduleTime} {...register("scheduleTime", { onChange: () => form.clearErrors("scheduleDate") })} />
                  </div>
                  <FieldDescription>{copy.fields.timezone}</FieldDescription>
                  <FieldError errors={[formState.errors.scheduleDate]} />
                </Field>
              )}

              <Button type="button" className="mt-5 w-full" onClick={submit} disabled={formState.isSubmitting}>
                {formState.isSubmitting && <Spinner />}
                {formState.isSubmitting ? copy.fields.saving : copy.publish[status].submit}
              </Button>

              <dl className="mt-4 grid gap-2 border-t pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">{copy.fields.currentStatus}</dt>
                  <dd className="font-medium">{t.posts.status[savedStatus]}</dd>
                </div>
                {savedStatus === "scheduled" && post?.scheduledAt && (
                  <div className="flex justify-between gap-3">
                    <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">{copy.fields.scheduledFor}</dt>
                    <dd className="font-medium">{f.dateTime(post.scheduledAt)}</dd>
                  </div>
                )}
              </dl>
            </Section>

            <Section label={copy.sections.cover}>
              {cover ? (
                <div className="overflow-hidden rounded-sm border">
                  <MediaThumb asset={cover} className="aspect-video" />
                  <div className="flex gap-2 border-t bg-muted/40 p-2.5">
                    <Button type="button" size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
                      {copy.fields.change}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setCover(null)}>
                      {copy.fields.remove}
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="grid min-h-36 w-full place-items-center rounded-sm border border-dashed bg-muted/40 text-sm font-medium text-muted-foreground transition-colors outline-none hover:border-ink hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="grid justify-items-center gap-1.5">
                    <ImagePlus className="size-5" />
                    {copy.fields.chooseCover}
                  </span>
                </button>
              )}
              <p className="mt-3 text-xs text-muted-foreground">{copy.fields.coverHelp}</p>
            </Section>

            <Section label={copy.sections.organization}>
              <div className="grid gap-5">
                <Field>
                  <FieldLabel htmlFor="post-category">{copy.fields.category}</FieldLabel>
                  <Controller
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <Select value={field.value ?? "none"} onValueChange={(value) => field.onChange(value === "none" ? null : value)}>
                        <SelectTrigger id="post-category" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{copy.fields.noCategory}</SelectItem>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                              {termName(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Button type="button" size="sm" className="w-full" onClick={() => setNewTerm("category")}>
                    {copy.fields.newCategory}
                  </Button>
                </Field>

                <Field>
                  <FieldLabel htmlFor="post-tags">{copy.fields.tags}</FieldLabel>
                  <Controller
                    control={control}
                    name="tags"
                    render={({ field }) => (
                      <TagMultiSelect
                        id="post-tags"
                        value={field.value}
                        onChange={field.onChange}
                        options={tagOptions.map((tag) => ({ value: tag.id, label: tag.name }))}
                      />
                    )}
                  />
                  <Button type="button" size="sm" className="w-full" onClick={() => setNewTerm("tag")}>
                    {copy.fields.newTag}
                  </Button>
                </Field>

                <Controller
                  control={control}
                  name="featured"
                  render={({ field }) => (
                    <Field orientation="horizontal" className="border-t pt-4">
                      <Checkbox id="post-featured" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
                      <FieldContent>
                        <FieldLabel htmlFor="post-featured">{copy.fields.featured}</FieldLabel>
                        <FieldDescription>{copy.fields.featuredHelp}</FieldDescription>
                      </FieldContent>
                    </Field>
                  )}
                />
              </div>
            </Section>

            <Section label={copy.sections.comments}>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="post-comments">{copy.fields.allowComments}</FieldLabel>
                  <FieldDescription>{copy.fields.allowCommentsHelp}</FieldDescription>
                </FieldContent>
                <Switch id="post-comments" checked={allowComments} onCheckedChange={setAllowComments} />
              </Field>
              {post && (
                <p className="mt-4 flex items-center justify-between border-t pt-4 text-sm">
                  <span className="text-muted-foreground">
                    {plural(copy.fields.commentCount, postComments.length)}
                    {waitingComments > 0 && fill(copy.fields.waiting, { count: waitingComments })}
                  </span>
                  <Link href="/panel/posts/comments" className="font-medium text-ink hover:underline">
                    {copy.fields.moderate}
                  </Link>
                </p>
              )}
            </Section>

            <Section label={`${copy.sections.url} · ${localeInfo[contentLocale].name}`}>
              <Field data-invalid={!!formState.errors.slug}>
                <FieldLabel htmlFor="post-slug">{copy.fields.slug}</FieldLabel>
                <Input
                  id="post-slug"
                  dir="ltr"
                  placeholder={copy.fields.slugPlaceholder}
                  className="font-mono text-sm"
                  aria-invalid={!!formState.errors.slug}
                  {...register("slug", { onChange: () => setTouchedSlugs((current) => new Set(current).add(contentLocale)) })}
                />
                <FieldDescription>
                  {localeInfo[contentLocale].latinSlugs ? copy.fields.slugHelp : fill(copy.fields.slugHelpNonLatin, { language: language(contentLocale) })}
                </FieldDescription>
                <FieldError errors={[formState.errors.slug]} />
              </Field>
            </Section>
          </aside>
        </div>
      </form>

      <MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={setCover} />
      <AiDraftDialog open={aiOpen} onOpenChange={setAiOpen} onDraft={applyAiDraft} locale={contentLocale} />
      {newTerm && (
        <TermDialog
          term={null}
          kind={newTerm}
          withDetails={newTerm === "category"}
          onClose={() => setNewTerm(null)}
          onSave={(term) => {
            if (newTerm === "category") {
              setCategoryOptions((current) => [...current, { ...term, color: term.color ?? "#3d41d6" }]);
              setValue("categoryId", term.id, { shouldDirty: true });
            } else {
              setTagOptions((current) => [...current, term]);
              setValue("tags", [...getValues("tags"), term.id], { shouldDirty: true });
            }
            toast.success(fill(newTerm === "category" ? copy.toasts.categoryCreated : copy.toasts.tagCreated, { name: term.name }));
            setNewTerm(null);
          }}
        />
      )}
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title={removing ? fill(copy.languages.removeTitle, { language: language(removing) }) : ""}
        description={copy.languages.removeBody}
        confirmLabel={copy.languages.remove}
        onConfirm={() => {
          if (removing) removeTranslation(removing);
          setRemoving(null);
        }}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={copy.deleteTitle}
        description={copy.deleteBody}
        confirmLabel={copy.deletePost}
        onConfirm={() => {
          if (!access.can("posts.delete")) return;
          toast.success(copy.toasts.deleted);
          router.push("/panel/posts");
        }}
      />
    </Main>
  );
}
