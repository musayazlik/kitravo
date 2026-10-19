"use client";

import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import { Check, CornerDownRight, MessageSquareReply, MoreHorizontal, ShieldAlert, Trash2, Undo2 } from "lucide-react";
import { DataTableColumnHeader, selectColumn } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { posts } from "@/features/posts/data/posts";
import { localizePost } from "@/features/posts/data/schema";
import { localeInfo } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { fill, type Formatter } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
import { initials } from "@/lib/mock-session";
import { cn } from "@/lib/utils";
import { commentStatusMeta, type BlogComment, type CommentStatus } from "../data/comments";

const inFilter: FilterFn<BlogComment> = (row, id, values: string[]) => values.includes(row.getValue(id));

type Options = {
  t: Dictionary;
  f: Formatter;
  items: BlogComment[];
  canModerate: boolean;
  onMove: (comment: BlogComment, status: CommentStatus) => void;
  onReply: (comment: BlogComment) => void;
  onDelete: (comment: BlogComment) => void;
};

export function commentColumns({ t, f, items, canModerate, onMove, onReply, onDelete }: Options): ColumnDef<BlogComment>[] {
  const copy = t.comments;
  const c = copy.columns;
  return [
    selectColumn<BlogComment>(t),
    {
      accessorKey: "author",
      meta: { label: c.author },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.author} />,
      cell: ({ row: { original: comment } }) => (
        <div className="flex min-w-44 items-center gap-2.5">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className={cn("text-xs", comment.isStaff ? "bg-ink text-primary-foreground" : "bg-ink-soft text-ink")}>{initials(comment.author)}</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.author}</span>
              {comment.isStaff && <StatusBadge tone="ink">{copy.team}</StatusBadge>}
            </div>
            <span className="text-xs text-muted-foreground" dir="ltr">{comment.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "body",
      meta: { label: c.comment },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.comment} />,
      enableHiding: false,
      filterFn: (row, _id, value: string) => [row.original.body, row.original.author, row.original.email].some((text) => text.toLocaleLowerCase().includes(value.toLocaleLowerCase())),
      cell: ({ row: { original: comment } }) => {
        const parent = comment.parentId ? items.find((entry) => entry.id === comment.parentId) : null;
        return (
          <div className="grid min-w-64 max-w-md gap-1 whitespace-normal">
            {parent && <span className="flex items-center gap-1 text-xs text-muted-foreground"><CornerDownRight className="size-3.5 shrink-0 rtl:-scale-x-100" />{fill(copy.inReplyTo, { name: parent.author })}</span>}
            <p className="break-words text-sm leading-relaxed" lang={comment.locale} dir={localeInfo[comment.locale].dir}>{comment.body}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      meta: { label: c.status },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.status} />,
      cell: ({ row }) => <StatusBadge tone={commentStatusMeta[row.original.status].tone}>{copy.status[row.original.status]}</StatusBadge>,
      filterFn: inFilter,
    },
    {
      accessorKey: "postId",
      meta: { label: c.post },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.post} />,
      filterFn: inFilter,
      enableSorting: false,
      cell: ({ row }) => {
        const source = posts.find((post) => post.id === row.original.postId);
        const post = source ? localizePost(source, row.original.locale) : null;
        return post ? (
          <Link href={`/blog/${post.slug}`} locale={post.locale} lang={post.locale} dir={localeInfo[post.locale].dir} target="_blank" rel="noreferrer" className="block min-w-40 max-w-56 whitespace-normal text-ink hover:underline">{post.title}</Link>
        ) : <span className="text-muted-foreground">{copy.deletedPost}</span>;
      },
    },
    {
      accessorKey: "locale",
      meta: { label: c.language },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.language} />,
      cell: ({ row }) => <span className="rounded-sm border px-1.5 py-0.5 font-mono text-xs text-muted-foreground uppercase" title={f.language(row.original.locale)}>{row.original.locale}</span>,
      filterFn: inFilter,
    },
    {
      accessorKey: "createdAt",
      meta: { label: c.date },
      header: ({ column }) => <DataTableColumnHeader column={column} title={c.date} />,
      cell: ({ row }) => <time dateTime={row.original.createdAt} className="tabular whitespace-nowrap text-muted-foreground">{f.date(row.original.createdAt)}</time>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row: { original: comment } }) => canModerate ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={fill(copy.actionsFor, { name: comment.author })}><MoreHorizontal /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {comment.status === "pending" && <DropdownMenuItem onSelect={() => onMove(comment, "approved")}><Check />{copy.approve}</DropdownMenuItem>}
            {comment.status !== "spam" && !comment.isStaff && <DropdownMenuItem onSelect={() => onReply(comment)}><MessageSquareReply />{copy.reply}</DropdownMenuItem>}
            {comment.status !== "spam" && !comment.isStaff && <DropdownMenuItem onSelect={() => onMove(comment, "spam")}><ShieldAlert />{copy.spam}</DropdownMenuItem>}
            {comment.status !== "pending" && !comment.isStaff && <DropdownMenuItem onSelect={() => onMove(comment, "pending")}><Undo2 />{copy.moveToWaiting}</DropdownMenuItem>}
            {(comment.status === "spam" || comment.isStaff) && (
              <>
                {comment.isStaff && <DropdownMenuSeparator />}
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(comment)}><Trash2 />{copy.delete}</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null,
    },
  ];
}
