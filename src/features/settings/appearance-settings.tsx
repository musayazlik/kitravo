"use client";

import { motion } from "motion/react";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useHydrated } from "@/hooks/use-hydrated";
import { useI18n } from "@/i18n/provider";
import { chartColors } from "@/lib/chart-colors";
import { cn } from "@/lib/utils";
import { SettingsSection } from "./components/settings-section";

/** `label` is a key into `t.settings.appearance`. */
const themes = [
  { value: "light", label: "light", icon: Sun, paper: "#f3f4f7", sheet: "#ffffff", line: "#e3e5eb", ink: chartColors.ink.light[0] },
  { value: "dark", label: "dark", icon: Moon, paper: "#0d0f15", sheet: "#151821", line: "#262a37", ink: chartColors.ink.dark[0] },
  { value: "system", label: "system", icon: Laptop, paper: "linear-gradient(90deg,#f3f4f7 50%,#0d0f15 50%)", sheet: "linear-gradient(90deg,#ffffff 50%,#151821 50%)", line: "#7b8195", ink: chartColors.ink.light[0] },
] as const;

/** Miniature of the panel in each theme, so the choice is visual rather than a word. */
function ThemePreview({ paper, sheet, line, ink }: { paper: string; sheet: string; line: string; ink: string }) {
  return (
    <div className="flex aspect-[16/10] gap-1.5 rounded-md p-1.5" style={{ background: paper }} aria-hidden>
      <div className="grid w-1/4 content-start gap-1 pt-1">
        <span className="h-1.5 w-3/4 rounded-full" style={{ background: ink }} />
        <span className="h-1 w-full rounded-full opacity-60" style={{ background: line }} />
        <span className="h-1 w-2/3 rounded-full opacity-60" style={{ background: line }} />
      </div>
      <div className="grid flex-1 content-start gap-1.5 rounded p-1.5" style={{ background: sheet }}>
        <span className="h-1.5 w-1/2 rounded-full" style={{ background: line }} />
        <span className="h-4 rounded" style={{ background: line, opacity: 0.6 }} />
        <span className="h-1.5 w-1/3 rounded-full" style={{ background: ink }} />
      </div>
    </div>
  );
}

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  // The stored theme is only known in the browser; render no selection until then.
  const mounted = useHydrated();
  const { t } = useI18n();
  const copy = t.settings.appearance;

  return (
    <SettingsSection title={copy.title} description={copy.description}>
      <div role="radiogroup" aria-label={copy.theme} className="grid gap-4 sm:grid-cols-3">
        {themes.map((option) => {
          const selected = mounted && theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(option.value)}
              className={cn(
                "relative grid gap-2 rounded-xl border p-2 text-start transition-colors outline-none hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring",
                selected && "border-ink",
              )}
            >
              <ThemePreview {...option} />
              <span className="flex items-center gap-2 px-1 pb-1 text-sm font-medium">
                <option.icon className="size-4 text-muted-foreground" /> {copy[option.label]}
              </span>
              {selected && (
                <motion.span
                  layoutId="theme-check"
                  className="absolute top-3 end-3 grid size-5 place-items-center rounded-full bg-ink text-primary-foreground"
                >
                  <Check className="size-3" />
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </SettingsSection>
  );
}
