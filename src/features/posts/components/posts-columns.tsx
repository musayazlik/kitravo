"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Copy, ExternalLink, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import { DataTableColumnHeader, selectColumn } from "@/components/data-table";
import { LanguageChips } from "@/components/language-chips";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { localizeHref, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { fill, type Formatter } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
import { getCategory } from "../data/posts";
import { categoryText, postLocales, postStatusMeta, type LocalizedPost } from "../data/schema";
import { SeoMeter } from "./seo-meter";

const inFilter = (row: { getValue: (id: string) => unknown }, id: string, value: string[]) =>
  value.includes(String(row.getValue(id)));

/** Rows match when the post is translated into any of the picked languages. */
const languageFilter = (row: { original: LocalizedPost }, _id: string, value: Locale[]) =>
  value.some((locale) => Boolean(row.original.translations[locale]));

type Options = {
  t: Dictionary;
  f: Formatter;
  locale: Locale;
  onDelete: (post: LocalizedPost) => void;
  onDuplicate: (post: LocalizedPost) => void;
};

/** Rows are posts read in the interface language; a post without that translation shows its source text. */
export function postColumns({ t, f, locale, onDelete, onDuplicate }: Options): ColumnDef<LocalizedPost>[] {
  const c = t.posts.columns;

  return [
    selectColumn<LocalizedPost>(t),
    {
      accessorKey: "title",
      meta: { label: c.title },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.title} />,
      cell: ({ row }) => {
        const post = row.original;
        return (
          <div className="flex max-w-[28rem] min-w-56 flex-col">
            <Link href={`/panel/posts/${post.id}`} className="flex items-center gap-1.5 font-medium hover:text-ink">
              {/* A fallback title is in another language: mark it so the reader knows. */}
              <span className="truncate" lang={post.isFallback ? post.locale : undefined}>
                {post.title}
              </span>
              {post.isFallback && (
                <span className="shrink-0 rounded-sm border px-1 font-mono text-[10px] text-muted-foreground uppercase" title={fill(c.onlyIn, { language: f.language(post.sourceLocale) })}>
                  {post.locale}
                </span>
              )}
              {post.featured && <Star className="size-3.5 shrink-0 fill-proof text-proof" aria-label={c.featured} />}
            </Link>
            <span className="truncate font-mono text-xs text-muted-foreground" dir="ltr">
              {localizeHref(`/blog/${post.slug}`, post.locale)}
            </span>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "status",
      meta: { label: c.status },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.status} />,
      cell: ({ row }) => <StatusBadge tone={postStatusMeta[row.original.status].tone}>{t.posts.status[row.original.status]}</StatusBadge>,
      filterFn: inFilter,
    },
    {
      id: "languages",
      accessorFn: (post) => postLocales(post).join(" "),
      meta: { label: c.languages },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.languages} />,
      cell: ({ row }) => <LanguageChips available={postLocales(row.original)} source={row.original.sourceLocale} />,
      filterFn: languageFilter,
      enableSorting: false,
    },
    {
      id: "category",
      accessorFn: (post) => post.categoryId ?? "none",
      meta: { label: c.category },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.category} />,
      cell: ({ row }) => {
        const category = getCategory(row.original.categoryId);
        if (!category) return <span className="text-muted-foreground">{c.none}</span>;
        return (
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
            {categoryText(category, locale).name}
          </span>
        );
      },
      filterFn: inFilter,
    },
    {
      accessorKey: "author",
      meta: { label: c.author },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.author} />,
      cell: ({ row }) => <span className="whitespace-nowrap">{row.original.author}</span>,
    },
    {
      accessorKey: "views",
      meta: { label: c.views },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.views} />,
      cell: ({ row }) => <span className="tabular">{row.original.views ? f.compact(row.original.views) : c.noneYet}</span>,
    },
    {
      accessorKey: "seoScore",
      meta: { label: c.seo },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.seo} />,
      cell: ({ row }) => <SeoMeter score={row.original.seoScore} />,
    },
    {
      accessorKey: "updatedAt",
      meta: { label: c.updated },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.updated} />,
      cell: ({ row }) => (
        <time dateTime={row.original.updatedAt} className="tabular whitespace-nowrap text-muted-foreground">
          {f.date(row.original.updatedAt)}
        </time>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={fill(c.actionsFor, { title: row.original.title })}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem asChild>
              <Link href={`/panel/posts/${row.original.id}`}>
                <Pencil /> {c.edit}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={localizeHref(`/blog/${row.original.slug}`, row.original.locale)} target="_blank" rel="noreferrer">
                <ExternalLink /> {c.preview}
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate(row.original)}>
              <Copy /> {c.duplicate}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
              <Trash2 /> {c.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
