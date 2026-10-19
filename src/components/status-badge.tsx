import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "muted" | "proof" | "ink" | "signal" | "rust";

const TONES: Record<Tone, string> = {
  muted: "bg-muted text-muted-foreground",
  proof: "bg-proof-soft text-proof-foreground",
  ink: "bg-ink-soft text-ink",
  signal: "bg-signal-soft text-signal-foreground",
  rust: "bg-destructive/10 text-destructive",
};

const DOTS: Record<Tone, string> = {
  muted: "bg-muted-foreground/60",
  proof: "bg-proof",
  ink: "bg-ink",
  signal: "bg-signal",
  rust: "bg-destructive",
};

/** Label with a colour dot; the label always carries the meaning, never the colour alone. */
export function StatusBadge({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-sm px-2 text-xs font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", DOTS[tone])} />
      {children}
    </span>
  );
}
