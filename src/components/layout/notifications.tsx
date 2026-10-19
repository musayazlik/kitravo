"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Bot, CheckCheck, MailWarning, Star, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

type Notice = { id: "reviews" | "bounced" | "mcp"; icon: LucideIcon; href: string; tone: "proof" | "ink" | "rust" };

/** Stand-ins for system events; their text comes from the `common.notifications` messages. */
const INITIAL: Notice[] = [
  { id: "reviews", icon: Star, href: "/panel/reviews", tone: "proof" },
  { id: "bounced", icon: MailWarning, href: "/panel/mail", tone: "rust" },
  { id: "mcp", icon: Bot, href: "/panel/mcp", tone: "ink" },
];

const TONE = {
  proof: "bg-proof-soft text-proof-foreground",
  ink: "bg-ink-soft text-ink",
  rust: "bg-destructive/10 text-destructive",
};

export function Notifications() {
  const [items, setItems] = useState(INITIAL);
  const { t, plural, dir } = useI18n();
  const text = {
    reviews: { title: plural(t.common.notifications.reviews, 3), detail: t.common.notifications.reviewsDetail },
    bounced: { title: plural(t.common.notifications.bounced, 2), detail: t.common.notifications.bouncedDetail },
    mcp: { title: t.common.notifications.mcp, detail: t.common.notifications.mcpDetail },
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={fill(t.common.notifications.label, { count: items.length })}>
          <Bell />
          <AnimatePresence>
            {items.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1.5 end-1.5 size-2 rounded-full bg-proof ring-2 ring-background"
              />
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-heading text-sm font-semibold">{t.common.notifications.title}</p>
          <Button variant="ghost" size="xs" onClick={() => setItems([])} disabled={items.length === 0}>
            <CheckCheck /> {t.common.notifications.markAllRead}
          </Button>
        </div>
        <ul className="max-h-80 overflow-y-auto p-1.5">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                exit={{ opacity: 0, x: dir === "rtl" ? -24 : 24, transition: { duration: 0.15 } }}
              >
                <Link
                  href={item.href}
                  onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                  className="flex gap-3 rounded-md p-2.5 transition-colors hover:bg-muted"
                >
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-md", TONE[item.tone])}>
                    <item.icon className="size-4" />
                  </span>
                  <span className="grid gap-0.5">
                    <span className="text-sm font-medium">{text[item.id].title}</span>
                    <span className="text-xs text-muted-foreground">{text[item.id].detail}</span>
                  </span>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">{t.common.notifications.empty}</li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
