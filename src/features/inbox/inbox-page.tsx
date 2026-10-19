"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Archive, ArchiveRestore, ArrowLeft, Inbox as InboxIcon, Mail, MailOpen, Reply, Search } from "lucide-react";
import { toast } from "sonner";
import { Main, PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAccess } from "@/components/access/access-provider";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedTabsList } from "@/components/motion/animated-tabs";
import { TimeAgo } from "@/components/time-ago";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { initials } from "@/lib/mock-session";
import { cn } from "@/lib/utils";
import { inquiries as seed, type Inquiry } from "./data/inquiries";

export function InboxPage() {
  const access = useAccess();
  // The first message opens on arrival, so it starts out read.
  const [items, setItems] = useState(() => seed.map((item, index) => (index === 0 ? { ...item, read: true } : item)));
  const [folder, setFolder] = useState<"inbox" | "unread" | "archived">("inbox");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(seed[0].id);
  const [reply, setReply] = useState("");
  const { t, f, plural, dir } = useI18n();
  const copy = t.inbox;

  const update = (id: string, patch: Partial<Inquiry>) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const visible = items.filter((item) => {
    if (folder === "archived" ? !item.archived : item.archived) return false;
    if (folder === "unread" && item.read) return false;
    const haystack = `${item.name} ${item.agency} ${item.subject}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });
  const active = items.find((item) => item.id === activeId) ?? null;
  const unread = items.filter((item) => !item.read && !item.archived).length;

  const open = (item: Inquiry) => {
    setActiveId(item.id);
    setReply("");
    if (!item.read) update(item.id, { read: true });
  };

  return (
    <Main className="lg:h-[calc(100svh-4.5rem)]">
      <PageHeader title={t.nav.items.inbox} description={copy.description} />

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-xl border md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <section aria-label={copy.messages} className={cn("flex min-h-0 flex-col border-e", active && "max-md:hidden")}>
          <div className="grid gap-3 border-b p-3">
            <Tabs value={folder} onValueChange={(value) => setFolder(value as typeof folder)}>
              <AnimatedTabsList
                value={folder}
                tabs={[
                  { value: "inbox", label: copy.folders.inbox },
                  { value: "unread", label: <>{copy.folders.unread} {unread > 0 && <Badge className="h-4 min-w-4 rounded-sm bg-proof-soft px-1 text-[10px] text-proof-foreground">{unread}</Badge>}</> },
                  { value: "archived", label: copy.folders.archived },
                ]}
              />
            </Tabs>
            <InputGroup className="h-8">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput placeholder={copy.search} value={query} onChange={(event) => setQuery(event.target.value)} aria-label={copy.search} />
            </InputGroup>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto p-2">
            <AnimatePresence initial={false}>
              {visible.map((item) => (
                <motion.li key={item.id} layout exit={{ opacity: 0, x: dir === "rtl" ? 20 : -20, transition: { duration: 0.15 } }}>
                  <button
                    type="button"
                    onClick={() => open(item)}
                    aria-current={item.id === activeId}
                    className={cn(
                      "grid w-full gap-1 rounded-lg p-3 text-start transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                      item.id === activeId && "bg-muted",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {!item.read && <span className="size-2 shrink-0 rounded-full bg-ink" aria-label={copy.unreadDot} />}
                      <span className={cn("truncate text-sm", !item.read && "font-semibold")}>{item.name}</span>
                      <TimeAgo value={item.receivedAt} className="ms-auto shrink-0 text-xs text-muted-foreground" />
                    </span>
                    <span className="truncate text-sm">{item.subject}</span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">{item.message}</span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
            {visible.length === 0 && (
              <li className="px-4 py-12 text-center text-sm text-muted-foreground">
                {copy.empty[folder]}
              </li>
            )}
          </ul>
        </section>

        <section aria-label={copy.message} className={cn("flex min-h-0 flex-col", !active && "max-md:hidden")}>
          {active ? (
            <AnimatePresence mode="wait">
              <motion.article
                key={active.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.2 }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <header className="flex items-center gap-1 border-b p-2">
                  <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setActiveId(null)} aria-label={copy.back}>
                    <ArrowLeft />
                  </Button>
                  <Button variant="ghost" size="sm" disabled={!access.can("inbox.manage")} onClick={() => { update(active.id, { read: false }); toast(copy.markedUnread); }}>
                    <Mail /> {copy.markUnread}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!access.can("inbox.manage")} onClick={() => {
                      update(active.id, { archived: !active.archived });
                      toast.success(active.archived ? copy.movedToInbox : copy.archived);
                      setActiveId(null);
                    }}
                  >
                    {active.archived ? <ArchiveRestore /> : <Archive />}
                    {active.archived ? copy.moveToInbox : copy.archive}
                  </Button>
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-ink-soft text-ink">{initials(active.name)}</AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 flex-1">
                      <h2 className="text-xl font-semibold">{active.subject}</h2>
                      <p className="text-sm text-muted-foreground">
                        {active.name}, {active.agency} &lt;{active.email}&gt;
                      </p>
                    </div>
                    <time dateTime={active.receivedAt} className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                      {f.dateTime(active.receivedAt)}
                    </time>
                  </div>
                  <dl className="mt-4 flex flex-wrap gap-2 text-xs">
                    <div className="rounded-md bg-muted px-2 py-1">
                      <dt className="inline text-muted-foreground">{copy.themeVersion} </dt>
                      <dd className="inline font-medium">{active.themeVersion}</dd>
                    </div>
                    <div className="rounded-md bg-muted px-2 py-1">
                      <dt className="inline text-muted-foreground">{copy.licence} </dt>
                      <dd className="inline font-medium">{copy.licences[active.licence]}</dd>
                    </div>
                  </dl>
                  <div className="mt-6 grid max-w-[70ch] gap-4 text-[15px] leading-7">
                    {active.message.split(/\n{2,}/).map((paragraph, index) => (
                      <p key={index} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
                <form
                  className="grid gap-2 border-t p-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!access.can("inbox.manage")) return;
                    toast.success(fill(copy.replySent, { email: active.email }));
                    setReply("");
                  }}
                >
                  <Textarea
                    rows={3}
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder={fill(copy.replyPlaceholder, { name: active.name.split(" ")[0] })}
                    aria-label={copy.reply}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{fill(copy.sentVia, { address: "hello@kitravo.com" })}</span>
                    <Button type="submit" size="sm" disabled={!reply.trim() || !access.can("inbox.manage")}>
                      <Reply /> {copy.sendReply}
                    </Button>
                  </div>
                </form>
              </motion.article>
            </AnimatePresence>
          ) : (
            <Empty className="flex-1">
              <EmptyHeader>
                <EmptyMedia variant="icon">{unread ? <InboxIcon /> : <MailOpen />}</EmptyMedia>
                <EmptyTitle>{unread ? plural(copy.unreadCount, unread) : copy.allCaught}</EmptyTitle>
                <EmptyDescription>{copy.pick}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </div>
    </Main>
  );
}
