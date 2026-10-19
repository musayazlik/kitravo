"use client";

import { motion } from "motion/react";
import { Bell, HardDrive, Languages, Palette, SlidersHorizontal } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/** `label` is a key into `t.settings.nav`. */
const items = [
  { href: "/panel/settings", label: "general", icon: SlidersHorizontal },
  { href: "/panel/settings/appearance", label: "appearance", icon: Palette },
  { href: "/panel/settings/languages", label: "languages", icon: Languages },
  { href: "/panel/settings/storage", label: "storage", icon: HardDrive },
  { href: "/panel/settings/notifications", label: "notifications", icon: Bell },
] as const;

export function SettingsNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav aria-label={t.settings.nav.label} className="-mx-1 flex gap-1 overflow-x-auto px-1 lg:mx-0 lg:flex-col lg:px-0">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="settings-nav-pill"
                className="absolute inset-0 rounded-lg bg-muted"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <item.icon className="relative size-4" />
            <span className="relative">{t.settings.nav[item.label]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
