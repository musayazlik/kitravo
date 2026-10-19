"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";

export type QueuedUpload = { id: string; name: string; size: number; progress: number; done: boolean };

/** Floating tray of in-flight uploads. Finished rows linger briefly, then leave. */
export function UploadQueue({ items, onCancel }: { items: QueuedUpload[]; onCancel: (id: string) => void }) {
  const { t, f } = useI18n();
  const copy = t.media.queue;

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.section
          aria-label={copy.label}
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, transition: { duration: 0.15 } }}
          className="fixed end-4 bottom-4 z-40 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-popover shadow-xl"
        >
          <header className="flex items-center justify-between border-b px-4 py-2.5">
            <p className="text-sm font-medium">
              {fill(copy.progress, { pending: items.filter((item) => !item.done).length, total: items.length })}
            </p>
          </header>
          <ul className="max-h-64 overflow-y-auto p-2">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 rounded-md p-2">
                    {item.done ? (
                      <CheckCircle2 className="size-5 shrink-0 text-signal" aria-hidden />
                    ) : (
                      <FileUp className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                    )}
                    <div className="grid min-w-0 flex-1 gap-1.5">
                      <div className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="truncate font-medium">{item.name}</span>
                        <span className="tabular shrink-0 text-muted-foreground">
                          {item.done ? f.bytes(item.size) : f.percent(item.progress / 100)}
                        </span>
                      </div>
                      <Progress value={item.progress} className="h-1" aria-label={`${item.name} ${item.progress}%`} />
                    </div>
                    {!item.done && (
                      <Button variant="ghost" size="icon-xs" onClick={() => onCancel(item.id)} aria-label={fill(copy.cancel, { name: item.name })}>
                        <X />
                      </Button>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
