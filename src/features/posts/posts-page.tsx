"use client";

import { useMemo, useState } from "react";
import { Archive, FilePlus2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable } from "@/components/data-table";
import { Main, PageHeader } from "@/components/layout/page-header";
import { ActionButton } from "@/components/access/action-button";
import { useAccess } from "@/components/access/access-provider";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { locales } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { postColumns } from "./components/posts-columns";
import { categories, posts as seed } from "./data/posts";
import { categoryText, localizePost, postStatuses, type LocalizedPost, type Post, type PostStatus } from "./data/schema";

export function PostsPage({ status }: { status?: PostStatus }) {
  const { t, f, plural, locale } = useI18n();
  const copy = t.posts.list;
  const access = useAccess();
  const [rows, setRows] = useState<Post[]>(seed);
  const [pendingDelete, setPendingDelete] = useState<LocalizedPost[] | null>(null);
  // The list reads every post in the interface language, falling back to its source text.
  const localized = useMemo(() => rows.map((post) => localizePost(post, locale)), [rows, locale]);

  const columns = useMemo(
    () =>
      postColumns({
        t,
        f,
        locale,
        onDelete: (post) => { if (access.can("posts.delete")) setPendingDelete([post]); },
        onDuplicate: (post) => {
          if (!access.can("posts.create")) return;
          const translations = Object.fromEntries(
            Object.entries(post.translations).map(([code, content]) => [code, { ...content, title: fill(copy.copySuffix, { title: content.title }), slug: `${content.slug}-copy` }]),
          );
          const copyOf: Post = { ...post, id: `${post.id}-copy-${rows.length}`, translations, status: "draft", views: 0, publishedAt: null };
          setRows((current) => [copyOf, ...current]);
          toast.success(copy.duplicated);
        },
      }),
    [t, f, locale, copy, rows.length, access],
  );

  const confirmDelete = () => {
    if (!pendingDelete || !access.can("posts.delete")) return;
    const ids = new Set(pendingDelete.map((post) => post.id));
    setRows((current) => current.filter((post) => !ids.has(post.id)));
    toast.success(plural(copy.deleted, pendingDelete.length));
    setPendingDelete(null);
  };

  const setStatus = (ids: Set<string>, next: PostStatus) => {
    if (!access.can(next === "published" ? "posts.publish" : "posts.update")) return;
    if (!access.can("posts.publish") && rows.some((post) => ids.has(post.id) && (post.status === "published" || post.status === "scheduled"))) return;
    setRows((current) => current.map((post) => (ids.has(post.id) ? { ...post, status: next } : post)));
    toast.success(plural(copy.moved, ids.size, { status: t.posts.status[next] }));
  };

  return (
    <Main>
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          <ActionButton permission="posts.create" asChild>
            <Link href="/panel/posts/new">
              <FilePlus2 /> {copy.newPost}
            </Link>
          </ActionButton>
        }
      />

      <DataTable
        columns={columns}
        data={localized}
        getRowId={(post) => post.id}
        searchColumn="title"
        searchPlaceholder={copy.searchTitles}
        initialFilters={status ? [{ id: "status", value: [status] }] : []}
        initialSorting={[{ id: "updatedAt", desc: true }]}
        initialVisibility={{ author: false }}
        filters={[
          { columnId: "status", title: copy.filterStatus, options: postStatuses.map((value) => ({ value, label: t.posts.status[value] })) },
          { columnId: "languages", title: copy.filterLanguage, options: locales.map((code) => ({ value: code, label: f.language(code) })) },
          { columnId: "category", title: copy.filterCategory, options: categories.map((category) => ({ value: category.id, label: categoryText(category, locale).name })) },
        ]}
        bulkActions={(table) => {
          const selected = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
          const ids = new Set(selected.map((post) => post.id));
          return (
            <>
              <ActionButton permission="posts.publish" size="sm" variant="ghost" onClick={() => { setStatus(ids, "published"); table.resetRowSelection(); }}>
                <Send /> {copy.publish}
              </ActionButton>
              <ActionButton permission="posts.update" size="sm" variant="ghost" onClick={() => { setStatus(ids, "draft"); table.resetRowSelection(); }}>
                <Archive /> {copy.moveToDrafts}
              </ActionButton>
              <ActionButton permission="posts.delete" size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { setPendingDelete(selected); table.resetRowSelection(); }}>
                <Trash2 /> {copy.delete}
              </ActionButton>
            </>
          );
        }}
        empty={
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FilePlus2 />
              </EmptyMedia>
              <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
              <EmptyDescription>{copy.emptyBody}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <ActionButton permission="posts.create" asChild>
                <Link href="/panel/posts/new">{copy.write}</Link>
              </ActionButton>
            </EmptyContent>
          </Empty>
        }
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={pendingDelete?.length === 1 ? copy.deleteOneTitle : plural(copy.deleteManyTitle, pendingDelete?.length ?? 0)}
        description={pendingDelete?.length === 1 ? fill(copy.deleteOneBody, { title: pendingDelete[0].title }) : copy.deleteManyBody}
        confirmLabel={pendingDelete?.length === 1 ? copy.deleteOne : copy.deleteMany}
        onConfirm={confirmDelete}
      />
    </Main>
  );
}
