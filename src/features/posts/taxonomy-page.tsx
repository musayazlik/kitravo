"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable, DataTableColumnHeader, selectColumn } from "@/components/data-table";
import { LanguageChips } from "@/components/language-chips";
import { Main, PageHeader } from "@/components/layout/page-header";
import { ActionButton } from "@/components/access/action-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { TermDialog, type Term } from "./components/term-dialog";
import { categories as seedCategories, tags as seedTags } from "./data/posts";

/** Languages a term reads well in: the default (its own name) plus every filled translation. */
function termLocales(term: Term): Locale[] {
  return locales.filter((locale) => locale === defaultLocale || term.translations?.[locale]?.name);
}

/** Categories and tags share one screen: a table plus a create/edit dialog. */
export function TaxonomyPage({ kind }: { kind: "categories" | "tags" }) {
  const { t, plural, locale } = useI18n();
  const copy = t.posts.taxonomy;
  const isCategory = kind === "categories";
  const [rows, setRows] = useState<Term[]>(isCategory ? seedCategories : seedTags);
  const [editing, setEditing] = useState<Term | "new" | null>(null);
  const [deleting, setDeleting] = useState<Term | null>(null);

  // Categories are shown in the interface language; their name in the default language stays the record's own.
  const view = useMemo(
    () =>
      rows.map((term) => ({
        ...term,
        name: term.translations?.[locale]?.name || term.name,
        description: term.translations?.[locale]?.description || term.description,
      })),
    [rows, locale],
  );

  const columns = useMemo<ColumnDef<Term>[]>(
    () => [
      selectColumn<Term>(t),
      {
        accessorKey: "name",
        meta: { label: copy.name },
        header: ({ column }) => <DataTableColumnHeader column={column} title={copy.name} />,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.color && <span aria-hidden className="size-3 rounded-full" style={{ backgroundColor: row.original.color }} />}
            <div className="grid">
              <span className="font-medium">{row.original.name}</span>
              {row.original.description && <span className="text-xs text-muted-foreground">{row.original.description}</span>}
            </div>
          </div>
        ),
        enableHiding: false,
      },
      ...(isCategory
        ? [
            {
              id: "languages",
              meta: { label: copy.languages },
              header: copy.languages,
              cell: ({ row }) => <LanguageChips available={termLocales(rows.find((term) => term.id === row.original.id) ?? row.original)} source={defaultLocale} />,
            } satisfies ColumnDef<Term>,
          ]
        : []),
      {
        accessorKey: "slug",
        meta: { label: copy.slug },
        header: ({ column }) => <DataTableColumnHeader column={column} title={copy.slug} />,
        cell: ({ row }) => <code className="font-mono text-xs text-muted-foreground">{row.original.slug}</code>,
      },
      {
        accessorKey: "postCount",
        meta: { label: copy.posts },
        header: ({ column }) => <DataTableColumnHeader column={column} title={copy.posts} />,
        cell: ({ row }) => <span className="tabular">{row.original.postCount}</span>,
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ActionButton permission="taxonomy.manage" variant="ghost" size="icon-sm" aria-label={fill(copy.actionsFor, { name: row.original.name })}>
                <MoreHorizontal />
              </ActionButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditing(rows.find((term) => term.id === row.original.id) ?? null)}>
                <Pencil /> {copy.edit}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(row.original)}>
                <Trash2 /> {copy.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, copy, isCategory, rows],
  );

  const save = (term: Term) => {
    setRows((current) => (current.some((row) => row.id === term.id) ? current.map((row) => (row.id === term.id ? term : row)) : [term, ...current]));
    toast.success(editing === "new" ? (isCategory ? copy.categoryCreated : copy.tagCreated) : copy.saved);
    setEditing(null);
  };

  return (
    <Main>
      <PageHeader
        title={isCategory ? copy.categories : copy.tags}
        description={isCategory ? copy.categoriesDescription : copy.tagsDescription}
        actions={
          <ActionButton permission="taxonomy.manage" onClick={() => setEditing("new")}>
            <Plus /> {isCategory ? copy.newCategory : copy.newTag}
          </ActionButton>
        }
      />
      <DataTable
        columns={columns}
        data={view}
        getRowId={(term) => term.id}
        searchColumn="name"
        searchPlaceholder={isCategory ? copy.searchCategories : copy.searchTags}
        initialSorting={[{ id: "postCount", desc: true }]}
        bulkActions={(table) => (
          <ActionButton permission="taxonomy.manage"
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              const ids = new Set(table.getFilteredSelectedRowModel().rows.map((row) => row.original.id));
              setRows((current) => current.filter((row) => !ids.has(row.id)));
              table.resetRowSelection();
              toast.success(plural(isCategory ? copy.categoriesDeleted : copy.tagsDeleted, ids.size));
            }}
          >
            <Trash2 /> {copy.delete}
          </ActionButton>
        )}
      />

      {editing && (
        <TermDialog
          key={editing === "new" ? "new" : editing.id}
          term={editing === "new" ? null : editing}
          withDetails={isCategory}
          kind={isCategory ? "category" : "tag"}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={fill(copy.deleteTitle, { name: deleting?.name ?? "" })}
        description={plural(isCategory ? copy.deleteCategoryBody : copy.deleteTagBody, deleting?.postCount ?? 0)}
        confirmLabel={isCategory ? copy.deleteCategory : copy.deleteTag}
        onConfirm={() => {
          setRows((current) => current.filter((row) => row.id !== deleting?.id));
          toast.success(isCategory ? copy.categoryDeleted : copy.tagDeleted);
          setDeleting(null);
        }}
      />
    </Main>
  );
}
