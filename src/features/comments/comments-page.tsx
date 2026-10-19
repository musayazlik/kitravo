"use client";

import { useMemo, useState } from "react";
import { Check, MessageSquare, ShieldAlert, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { ActionButton } from "@/components/access/action-button";
import { useAccess } from "@/components/access/access-provider";
import { DataTable } from "@/components/data-table";
import { Main, PageHeader } from "@/components/layout/page-header";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Textarea } from "@/components/ui/textarea";
import { posts } from "@/features/posts/data/posts";
import { localizePost } from "@/features/posts/data/schema";
import { localeInfo, locales } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { commentColumns } from "./components/comments-columns";
import { comments as seed, commentStatusMeta, type BlogComment, type CommentStatus } from "./data/comments";

export function CommentsPage() {
  const access = useAccess();
  const { t, f, locale: uiLocale } = useI18n();
  const copy = t.comments;
  const [items, setItems] = useState(seed);
  const [replyingTo, setReplyingTo] = useState<BlogComment | null>(null);
  const [reply, setReply] = useState("");

  const columns = useMemo(() => commentColumns({
    t,
    f,
    items,
    canModerate: access.can("comments.moderate"),
    onMove: (comment, status) => {
      if (!access.can("comments.moderate")) return;
      setItems((current) => current.map((entry) => entry.id === comment.id ? { ...entry, status } : entry));
      toast.success(status === "approved" ? fill(copy.toasts.approved, { name: comment.author }) : status === "spam" ? copy.toasts.spam : copy.toasts.waiting, {
        action: { label: copy.toasts.undo, onClick: () => setItems((current) => current.map((entry) => entry.id === comment.id ? comment : entry)) },
      });
    },
    onReply: (comment) => {
      setReply("");
      setReplyingTo(comment);
    },
    onDelete: (comment) => {
      if (!access.can("comments.moderate")) return;
      setItems((current) => current.filter((entry) => entry.id !== comment.id));
      toast.success(copy.toasts.deleted);
    },
  }), [t, f, items, access, copy]);

  const moveSelected = (selected: BlogComment[], status: CommentStatus) => {
    if (!access.can("comments.moderate")) return;
    const eligible = selected.filter((comment) => comment.status !== status && (status === "approved" || !comment.isStaff));
    if (!eligible.length) return;
    const ids = new Set(eligible.map((comment) => comment.id));
    setItems((current) => current.map((entry) => ids.has(entry.id) ? { ...entry, status } : entry));
    toast.success(copy.status[status], {
      action: {
        label: copy.toasts.undo,
        onClick: () => {
          const previous = new Map(eligible.map((comment) => [comment.id, comment.status]));
          setItems((current) => current.map((entry) => previous.has(entry.id) ? { ...entry, status: previous.get(entry.id)! } : entry));
        },
      },
    });
  };

  const sendReply = () => {
    if (!replyingTo || !reply.trim() || !access.can("comments.moderate") || !access.principal) return;
    const staffReply: BlogComment = {
      id: crypto.randomUUID(),
      postId: replyingTo.postId,
      parentId: replyingTo.parentId ?? replyingTo.id,
      author: access.principal.name,
      email: access.principal.email,
      body: reply.trim(),
      status: "approved",
      isStaff: true,
      createdAt: new Date().toISOString(),
      locale: replyingTo.locale,
    };
    // Publish the parent too, so an answer never appears without its question.
    setItems((current) => [...current.map((entry) => entry.id === replyingTo.id ? { ...entry, status: "approved" as const } : entry), staffReply]);
    setReply("");
    setReplyingTo(null);
    toast.success(replyingTo.status === "pending" ? copy.toasts.repliedApproved : copy.toasts.replied);
  };

  return (
    <Main>
      <PageHeader title={copy.title} description={copy.description} />
      <DataTable
        columns={columns}
        data={items}
        getRowId={(comment) => comment.id}
        searchColumn="body"
        searchPlaceholder={copy.search}
        initialSorting={[{ id: "createdAt", desc: true }]}
        filters={[
          { columnId: "status", title: copy.columns.status, options: (Object.keys(commentStatusMeta) as CommentStatus[]).map((value) => ({ value, label: copy.status[value] })) },
          { columnId: "locale", title: copy.columns.language, options: locales.map((value) => ({ value, label: f.language(value) })) },
          { columnId: "postId", title: copy.columns.post, options: posts.filter((post) => items.some((comment) => comment.postId === post.id)).map((post) => ({ value: post.id, label: localizePost(post, uiLocale).title })) },
        ]}
        bulkActions={(table) => {
          const selected = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
          return (
            <>
              <ActionButton permission="comments.moderate" size="sm" variant="ghost" onClick={() => { moveSelected(selected, "approved"); table.resetRowSelection(); }}>
                <Check /> {copy.approve}
              </ActionButton>
              <ActionButton permission="comments.moderate" size="sm" variant="ghost" onClick={() => { moveSelected(selected, "spam"); table.resetRowSelection(); }}>
                <ShieldAlert /> {copy.spam}
              </ActionButton>
              <ActionButton permission="comments.moderate" size="sm" variant="ghost" onClick={() => { moveSelected(selected, "pending"); table.resetRowSelection(); }}>
                <Undo2 /> {copy.moveToWaiting}
              </ActionButton>
            </>
          );
        }}
        empty={
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><MessageSquare /></EmptyMedia>
              <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
              <EmptyDescription>{copy.emptyBody}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      />

      <Dialog open={replyingTo !== null} onOpenChange={(open) => { if (!open) setReplyingTo(null); }}>
        <DialogContent className="sm:max-w-xl">
          {replyingTo && (
            <form className="flex min-h-0 flex-col" onSubmit={(event) => { event.preventDefault(); sendReply(); }}>
              <DialogHeader>
                <DialogTitle>{fill(copy.replyLabel, { name: replyingTo.author })}</DialogTitle>
                <DialogDescription>{fill(copy.replyLanguage, { language: f.language(replyingTo.locale) })}</DialogDescription>
              </DialogHeader>
              <DialogBody className="space-y-4">
                <blockquote className="border-s-2 ps-3 text-sm leading-relaxed text-muted-foreground" lang={replyingTo.locale} dir={localeInfo[replyingTo.locale].dir}>
                  {replyingTo.body}
                </blockquote>
                <Textarea
                  autoFocus
                  rows={4}
                  lang={replyingTo.locale}
                  dir={localeInfo[replyingTo.locale].dir}
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={fill(copy.replyPlaceholder, { name: replyingTo.author.split(" ")[0], me: access.principal?.name ?? "" })}
                  aria-label={fill(copy.replyLabel, { name: replyingTo.author })}
                />
              </DialogBody>
              <DialogFooter>
                <ActionButton permission="comments.moderate" type="button" variant="ghost" onClick={() => setReplyingTo(null)}>{t.common.cancel}</ActionButton>
                <ActionButton permission="comments.moderate" type="submit" disabled={!reply.trim()}>{copy.publishReply}</ActionButton>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Main>
  );
}
