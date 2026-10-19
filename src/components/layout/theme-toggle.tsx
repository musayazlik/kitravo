"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n } from "@/i18n/provider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useI18n();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* The label stays fixed: the server cannot know the theme, so a theme-specific label would not hydrate. */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label={t.common.theme.toggle}>
          {/* Both icons render; CSS picks one so the server and client markup match. */}
          <Sun className="hidden dark:block" />
          <Moon className="dark:hidden" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t.common.theme.switch}</TooltipContent>
    </Tooltip>
  );
}
