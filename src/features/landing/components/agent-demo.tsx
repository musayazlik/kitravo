"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Bot,
  Check,
  CirclePlay,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { InteractiveCard } from "./interactive-card";

const tasks = [
  { tool: "ai_write_post", key: "writePost" },
  { tool: "ai_generate_image", key: "generateImage" },
  { tool: "blog_posts_create", key: "createPost" },
] as const;

const benefits = [
  { icon: Bot, key: "clients" },
  { icon: ShieldCheck, key: "scoped" },
  { icon: Sparkles, key: "tools" },
] as const;

export function AgentDemo() {
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [runCount, setRunCount] = useState(0);
  const reducedMotion = useReducedMotion();
  const { t } = useI18n();
  const copy = t.site.agents;
  const played = running || complete;
  function replay() {
    setRunCount((count) => count + 1);
    setComplete(false);
    setRunning(true);
  }
  return (
    <section
      id="agents"
      aria-labelledby="agents-title"
      className="scroll-mt-24 border-y bg-paper/65 px-5 py-20 sm:px-6 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <p className="landing-eyebrow">{copy.eyebrow}</p>
          <h2
            id="agents-title"
            className="mt-4 text-4xl leading-[1.1] font-medium tracking-[-0.04em] sm:text-5xl"
          >
            {copy.title1}
            <br />
            <span className="text-ink">{copy.title2}</span>
          </h2>
          <p className="mt-5 max-w-md leading-7 text-muted-foreground">
            {copy.lead}
          </p>
          <div className="mt-7 space-y-3 text-sm">
            {benefits.map((item) => (
              <p key={item.key} className="flex items-center gap-3">
                <item.icon aria-hidden="true" className="size-4 text-ink" />
                {copy.benefits[item.key]}
              </p>
            ))}
          </div>
          <Link
            href="/panel/mcp"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink"
          >
            {copy.link}{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <p className="mt-3 max-w-sm text-xs leading-5 text-muted-foreground">
            {copy.note}
          </p>
        </div>
        <InteractiveCard className="bg-background p-3 shadow-xl shadow-foreground/5 sm:p-5">
          <div className="flex items-center justify-between border-b px-2 pt-1 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-ink-soft text-ink">
                <Sparkles aria-hidden="true" className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{copy.cardTitle}</p>
                <p className="text-[11px] text-muted-foreground">{copy.cardSub}</p>
              </div>
            </div>
            <span className="rounded-full border bg-paper px-2 py-1 font-mono text-[10px] text-muted-foreground">
              {copy.preview}
            </span>
          </div>
          <div className="p-2 pt-5 sm:p-3 sm:pt-5">
            <div className="ms-6 rounded-2xl rounded-se-sm bg-paper p-4 text-sm leading-6">
              {copy.prompt}
              <span className="mt-2 block text-[11px] text-muted-foreground">{copy.promptMeta}</span>
            </div>
            <div className="mt-5 flex gap-3">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-ink text-primary-foreground">
                <Bot aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{copy.reply}</p>
                <ol className="mt-4 space-y-2.5">
                  {tasks.map((task, index) => (
                    <li
                      key={task.tool}
                      className="flex items-center gap-3 rounded-xl border p-3"
                    >
                      <motion.span
                        key={`${runCount}-${index}`}
                        initial={
                          running ? { scale: reducedMotion ? 1 : 0 } : false
                        }
                        animate={{
                          scale: played ? 1 : 0.9,
                          backgroundColor: played
                            ? "var(--signal-soft)"
                            : "var(--paper)",
                        }}
                        transition={{
                          delay: running && !reducedMotion ? index * 0.6 : 0,
                          duration: reducedMotion ? 0 : 0.3,
                        }}
                        className="grid size-6 shrink-0 place-items-center rounded-full text-signal-foreground"
                      >
                        {played ? (
                          <Check aria-hidden="true" className="size-3.5" />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {index + 1}
                          </span>
                        )}
                      </motion.span>
                      <div>
                        <p className="text-xs font-medium">{task.tool}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {copy.tasks[task.key]}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                <motion.div
                  key={runCount}
                  initial={
                    running ? { opacity: 0, y: reducedMotion ? 0 : 6 } : false
                  }
                  animate={{ opacity: played ? 1 : 0, y: played ? 0 : 6 }}
                  transition={{
                    delay: running && !reducedMotion ? 1.9 : 0,
                    duration: reducedMotion ? 0 : 0.3,
                  }}
                  onAnimationComplete={() => {
                    if (running) {
                      setComplete(true);
                      setRunning(false);
                    }
                  }}
                  className="mt-3 rounded-xl border border-signal/20 bg-signal-soft px-3 py-2.5 text-xs text-signal-foreground"
                  role="status"
                  aria-hidden={!played}
                >
                  {copy.done}
                </motion.div>
              </div>
            </div>
            <Button
              onClick={replay}
              disabled={running}
              variant="outline"
              className="relative z-20 mt-5 h-11 w-full rounded-xl"
            >
              {complete ? (
                <RotateCcw aria-hidden="true" className="size-4" />
              ) : (
                <CirclePlay aria-hidden="true" className="size-4" />
              )}
              {running ? copy.playing : complete ? copy.again : copy.play}
            </Button>
          </div>
        </InteractiveCard>
      </div>
    </section>
  );
}
