"use client";

import type { PointerEvent, ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";

/** Cursor spotlight and perspective inspired by Magic UI Magic Card and Aceternity 3D Card. */
export function InteractiveCard({
  children,
  className,
  tilt = false,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 180, damping: 24 });
  const rotateY = useSpring(0, { stiffness: 180, damping: 24 });
  const background = useMotionTemplate`radial-gradient(420px circle at ${x}px ${y}px, color-mix(in oklch, var(--ink) 12%, transparent), transparent 75%)`;

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - bounds.left);
    y.set(event.clientY - bounds.top);
    if (tilt) {
      rotateX.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -5);
      rotateY.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 5);
    }
  }

  return (
    <motion.div
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className={cn(
        "landing-interactive group/spot relative isolate overflow-hidden rounded-[24px] border bg-card",
        className,
      )}
    >
      <motion.div
        aria-hidden="true"
        style={{ background }}
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
      />
      {children}
    </motion.div>
  );
}
