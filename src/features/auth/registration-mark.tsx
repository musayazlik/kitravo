"use client";

import { motion, useReducedMotion } from "motion/react";
import { LogoMark } from "@/components/layout/logo";
import { useI18n } from "@/i18n/provider";

/** The sign-in illustration uses the same transparent mark as every navigation surface. */
export function RegistrationMark() {
  const { t } = useI18n();
  const reduced = useReducedMotion();

  return (
    <div className="absolute inset-0 grid place-items-center">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="aspect-square w-[min(52%,24rem)]"
      >
        <LogoMark
          sizes="(min-width: 1024px) 384px, 50vw"
          className="size-full"
        />
      </motion.div>
      <p className="absolute inset-x-0 bottom-12 mx-auto max-w-sm px-6 text-center font-heading text-2xl font-medium tracking-tight text-foreground/80 text-balance">
        {t.auth.tagline}
      </p>
    </div>
  );
}
