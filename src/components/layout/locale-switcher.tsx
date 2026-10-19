"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Check, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { LOCALE_COOKIE, localeInfo, locales, switchLocaleHref, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

/**
 * Moves to the same page in another language and remembers the choice, so
 * the next unprefixed visit (`/`) lands in it too. The URL is read when the
 * choice is made, not while rendering, so no Suspense boundary is needed.
 */
export function useSwitchLocale() {
  const router = useRouter();

  return useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      const { pathname, search, hash } = window.location;
      router.push(`${switchLocaleHref(pathname, next)}${search}${hash}`);
    },
    [router],
  );
}

export function LocaleSwitcher({ className, showLabel = false }: { className?: string; showLabel?: boolean }) {
  const { locale, t, dir } = useI18n();
  const switchLocale = useSwitchLocale();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size={showLabel ? "sm" : "icon"}
              className={cn(showLabel && "gap-1.5", className)}
              aria-label={`${t.common.language.change}: ${localeInfo[locale].name}`}
            >
              <Languages />
              {showLabel ? <span>{localeInfo[locale].name}</span> : <span className="sr-only">{localeInfo[locale].name}</span>}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t.common.language.change}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align={dir === "rtl" ? "start" : "end"} className="min-w-48">
        <DropdownMenuLabel>{t.common.language.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((code) => (
          <DropdownMenuItem key={code} onSelect={() => switchLocale(code)} lang={code}>
            <span className="flex-1">{localeInfo[code].name}</span>
            <span className="font-mono text-[11px] text-muted-foreground uppercase">{code}</span>
            <Check className={cn("size-4", code !== locale && "invisible")} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
