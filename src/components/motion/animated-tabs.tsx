"use client";

import { useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Tabs list whose active pill slides to the chosen tab, so the eye follows
 * the switch instead of seeing two highlights blink.
 */
export function AnimatedTabsList({
  value,
  tabs,
  className,
}: {
  value: string;
  tabs: { value: string; label: ReactNode }[];
  className?: string;
}) {
  const id = useId();

  return (
    <TabsList className={cn("w-full", className)}>
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="data-active:bg-transparent data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-transparent"
        >
          {value === tab.value && (
            <motion.span
              layoutId={`tab-pill-${id}`}
              className="absolute inset-0 rounded-md bg-background shadow-sm dark:bg-input/40"
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          <span className="relative z-10 inline-flex items-center gap-1.5">{tab.label}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
