"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 35,
  });
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-ink rtl:origin-right"
      style={{ scaleX: reducedMotion ? scrollYProgress : smoothProgress }}
    />
  );
}
