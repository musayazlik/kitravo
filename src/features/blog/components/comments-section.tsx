"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, CornerDownRight, MessageSquareReply, X } from "lucide-react";
import { z } from "zod";
import { TimeAgo } from "@/components/time-ago";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { BlogComment } from "@/features/comments/data/comments";
import type { Dictionary } from "@/i18n/dictionary";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { rich } from "@/i18n/rich";
import { initials } from "@/lib/mock-session";
import { cn } from "@/lib/utils";

function commentSchema(messages: Dictionary["blog"]["comments"]["validation"]) {
  return z.object({
    author: z.string().trim().min(2, messages.name),
    email: z.email(messages.email),
    body: z.string().trim().min(10, messages.bodyMin).max(2000, messages.bodyMax),
  });
}
type Values = z.infer<ReturnType<typeof commentSchema>>;

function CommentItem({ comment, onReply, isReply }: { comment: BlogComment; onReply?: () => void; isReply?: boolean }) {
  const { t } = useI18n();

  return (
    <div className={cn("flex gap-3", isReply && "mt-5")}>
      <Avatar className="size-9">
        <AvatarFallback className={cn("text-xs", comment.isStaff ? "bg-ink text-primary-foreground" : "bg-ink-soft text-ink")}>
          {initials(comment.author)}
        </AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 flex-1 gap-1">
        <p className="flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-medium">{comment.author}</span>
          {comment.isStaff && <span className="rounded-sm bg-ink-soft px-1.5 text-xs font-medium text-ink">{t.blog.comments.team}</span>}
          <TimeAgo value={comment.createdAt} className="text-muted-foreground" />
        </p>
        <p className="max-w-[65ch] text-[15px] leading-7">{comment.body}</p>
        {onReply && (
          <Button variant="ghost" size="sm" className="-ms-2 w-fit text-muted-foreground" onClick={onReply}>
            <MessageSquareReply /> {t.blog.comments.reply}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Approved comments with one level of replies, and a form whose comments wait for moderation. */
export function CommentsSection({ comments }: { comments: BlogComment[] }) {
  const [replyTo, setReplyTo] = useState<BlogComment | null>(null);
  const [sentAs, setSentAs] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { t, plural } = useI18n();
  const copy = t.blog.comments;
  const [schema] = useState(() => commentSchema(copy.validation));
  const { register, handleSubmit, formState, reset } = useForm<Values>({ resolver: zodResolver(schema) });

  const threads = comments.filter((comment) => !comment.parentId);
  const repliesOf = (id: string) => comments.filter((comment) => comment.parentId === id);

  const startReply = (comment: BlogComment) => {
    setReplyTo(comment);
    setSentAs(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    formRef.current?.querySelector("textarea")?.focus({ preventScroll: true });
  };

  return (
    <section aria-labelledby="comments-title" className="grid gap-8">
      <h2 id="comments-title" className="text-2xl font-semibold">
        {comments.length ? plural(copy.count, comments.length) : copy.none}
      </h2>

      {threads.length > 0 && (
        <ol className="grid gap-8">
          {threads.map((thread) => (
            <li key={thread.id} className="border-b pb-8 last:border-none last:pb-0">
              <CommentItem comment={thread} onReply={() => startReply(thread)} />
              {repliesOf(thread.id).length > 0 && (
                <ol className="ms-4 border-s ps-5 sm:ms-12">
                  {repliesOf(thread.id).map((reply) => (
                    <li key={reply.id}>
                      <CommentItem comment={reply} isReply />
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="rounded-sm border bg-card p-5 md:p-6">
        <AnimatePresence mode="wait" initial={false}>
          {sentAs ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid justify-items-start gap-3"
              role="status"
            >
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}>
                <CheckCircle2 className="size-8 text-signal" />
              </motion.span>
              <h3 className="text-xl font-semibold">{fill(copy.thanks, { name: sentAs })}</h3>
              <p className="text-sm text-muted-foreground">{copy.appears}</p>
              <Button variant="outline" onClick={() => setSentAs(null)}>
                {copy.another}
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              ref={formRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              noValidate
              onSubmit={handleSubmit(async (values) => {
                await new Promise((resolve) => setTimeout(resolve, 700));
                setSentAs(values.author.split(" ")[0]);
                setReplyTo(null);
                reset();
              })}
              className="grid gap-5"
            >
              <div className="grid gap-1">
                <h3 className="text-xl font-semibold">{copy.leave}</h3>
                <p className="text-sm text-muted-foreground">{copy.moderated}</p>
              </div>

              <AnimatePresence initial={false}>
                {replyTo && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 overflow-hidden text-sm"
                  >
                    <CornerDownRight className="size-4 text-muted-foreground" />
                    <span>{rich(copy.replyingTo, { b: (chunks) => <span className="font-medium">{chunks}</span>, name: replyTo.author })}</span>
                    <Button type="button" variant="ghost" size="icon-xs" onClick={() => setReplyTo(null)} aria-label={copy.cancelReply}>
                      <X />
                    </Button>
                  </motion.p>
                )}
              </AnimatePresence>

              <FieldGroup className="gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!formState.errors.author}>
                    <FieldLabel htmlFor="comment-author">{copy.name}</FieldLabel>
                    <Input id="comment-author" autoComplete="name" aria-invalid={!!formState.errors.author} {...register("author")} />
                    <FieldError errors={[formState.errors.author]} />
                  </Field>
                  <Field data-invalid={!!formState.errors.email}>
                    <FieldLabel htmlFor="comment-email">{copy.email}</FieldLabel>
                    <Input id="comment-email" type="email" autoComplete="email" aria-invalid={!!formState.errors.email} {...register("email")} />
                    <FieldError errors={[formState.errors.email]} />
                  </Field>
                </div>
                <Field data-invalid={!!formState.errors.body}>
                  <FieldLabel htmlFor="comment-body">{copy.comment}</FieldLabel>
                  <Textarea id="comment-body" rows={5} aria-invalid={!!formState.errors.body} {...register("body")} />
                  <FieldDescription>{copy.plain}</FieldDescription>
                  <FieldError errors={[formState.errors.body]} />
                </Field>
              </FieldGroup>
              <Button type="submit" className="w-fit" disabled={formState.isSubmitting}>
                {formState.isSubmitting && <Spinner />}
                {formState.isSubmitting ? copy.sending : replyTo ? copy.postReply : copy.postComment}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
