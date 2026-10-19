"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import { Direction } from "radix-ui";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { localeInfo, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionary";
import { I18nProvider } from "@/i18n/provider";

export function Providers({ locale, dictionary, children }: { locale: Locale; dictionary: Dictionary; children: ReactNode }) {
  const dir = localeInfo[locale].dir;

  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      {/* Radix menus, selects and sliders read the direction for keyboard order and placement. */}
      <Direction.Provider dir={dir}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          // Only the server-rendered script needs to execute, before the first paint.
          scriptProps={{ type: typeof window === "undefined" ? "text/javascript" : "text/plain" }}
        >
          {/* "user" turns every motion component static when the OS asks for reduced motion. */}
          <MotionConfig reducedMotion="user">
            <TooltipProvider delayDuration={300}>
              {children}
              <Toaster position={dir === "rtl" ? "bottom-left" : "bottom-right"} dir={dir} />
            </TooltipProvider>
          </MotionConfig>
        </ThemeProvider>
      </Direction.Provider>
    </I18nProvider>
  );
}
