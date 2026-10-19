"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/provider";

/**
 * Relative time ("3 hours ago", "vor 3 Stunden"). The first render shows the
 * absolute date so server and client agree; the clock is read only after
 * mount, which also keeps the route prerenderable under Cache Components.
 */
export function TimeAgo({ value, className }: { value: string; className?: string }) {
  const { f } = useI18n();
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setLabel(f.timeAgo(value));
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [value, f]);

  return (
    <time dateTime={value} title={f.dateTime(value)} className={className}>
      {label ?? f.date(value)}
    </time>
  );
}
