"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin ink bar under the header that tracks how far through the article you are. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });

  return <motion.div aria-hidden className="fixed inset-x-0 top-16 z-30 h-0.5 origin-left bg-ink rtl:origin-right" style={{ scaleX }} />;
}
