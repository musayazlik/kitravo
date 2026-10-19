"use client";

import { motion } from "motion/react";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/** `label` is a key into `t.auth.strength.levels`. */
const levels = [
  { label: "tooShort", className: "bg-destructive" },
  { label: "weak", className: "bg-destructive" },
  { label: "fair", className: "bg-proof" },
  { label: "good", className: "bg-signal" },
  { label: "strong", className: "bg-signal" },
] as const;

/** Rough strength score: length carries most of it, variety adds the rest. */
export function scorePassword(value: string) {
  if (value.length < 10) return 0;
  let score = 1;
  if (value.length >= 14) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value) || /[^\w\s]/.test(value) || /\s/.test(value)) score++;
  return Math.min(score, 4);
}

export function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);
  const level = levels[score];
  const { t } = useI18n();
  const copy = t.auth.strength;

  return (
    <div className="grid gap-1.5" aria-live="polite">
      <div className="grid grid-cols-4 gap-1" aria-hidden>
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className="h-1 overflow-hidden rounded-sm bg-muted">
            <motion.span
              className={cn("block h-full", level.className)}
              initial={false}
              animate={{ width: value && score >= step ? "100%" : value && step === 1 ? "100%" : "0%" }}
              transition={{ duration: 0.25 }}
            />
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{value ? fill(copy.label, { level: copy.levels[level.label] }) : copy.hint}</p>
    </div>
  );
}
