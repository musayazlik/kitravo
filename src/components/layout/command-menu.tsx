"use client";

import { useRouter } from "@/i18n/navigation";
import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { FilePlus2, Languages, Laptop, Moon, Sun, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { accessibleNavGroups } from "@/config/nav";
import { useAccess, Can } from "@/components/access/access-provider";
import { localeInfo, locales } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { useSwitchLocale } from "./locale-switcher";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

const CommandMenuContext = createContext<{ open: () => void } | null>(null);

export function useCommandMenu() {
  const context = use(CommandMenuContext);
  if (!context) throw new Error("useCommandMenu must be used within <CommandMenuProvider>");
  return context;
}

export function CommandMenuProvider({ children }: { children: ReactNode }) {
  const { principal } = useAccess();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const run = useCallback((action: () => void) => {
    setIsOpen(false);
    action();
  }, []);

  const value = useMemo(() => ({ open: () => setIsOpen(true) }), []);
  const { t, locale } = useI18n();
  const switchLocale = useSwitchLocale();

  return (
    <CommandMenuContext value={value}>
      {children}
      <CommandDialog open={isOpen} onOpenChange={setIsOpen} title={t.nav.search.label} description={t.nav.search.description}>
        <CommandInput placeholder={t.nav.search.placeholder} />
        <CommandList>
          <CommandEmpty>{t.nav.search.empty}</CommandEmpty>
          <CommandGroup heading={t.nav.search.create}>
            <Can permission="posts.create"><CommandItem onSelect={() => run(() => router.push("/panel/posts/new"))}>
              <FilePlus2 /> {t.nav.search.newPost}
              <CommandShortcut>N</CommandShortcut>
            </CommandItem></Can>
            <Can permission="media.upload"><CommandItem onSelect={() => run(() => router.push("/panel/media?upload=1"))}>
              <Upload /> {t.nav.search.uploadMedia}
            </CommandItem></Can>
          </CommandGroup>
          {accessibleNavGroups(principal).map((group) => (
            <CommandGroup key={group.label} heading={t.nav.groups[group.label]}>
              {group.items.flatMap((item) =>
                (item.items ?? [{ title: item.title, href: item.href }]).map((entry) => {
                  const parent = t.nav.items[item.title];
                  const label = t.nav.items[entry.title];
                  return (
                    <CommandItem key={entry.href + entry.title} value={`${parent} ${label}`} onSelect={() => run(() => router.push(entry.href))}>
                      <item.icon />
                      {item.items ? `${parent}: ${label}` : label}
                    </CommandItem>
                  );
                }),
              )}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading={t.nav.search.theme}>
            <CommandItem onSelect={() => run(() => setTheme("light"))}>
              <Sun /> {t.nav.search.light}
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTheme("dark"))}>
              <Moon /> {t.nav.search.dark}
            </CommandItem>
            <CommandItem onSelect={() => run(() => setTheme("system"))}>
              <Laptop /> {t.nav.search.system}
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading={t.common.language.label}>
            {locales
              .filter((code) => code !== locale)
              .map((code) => (
                // English names keep every language findable whatever the interface language is.
                <CommandItem key={code} value={`${localeInfo[code].name} ${localeInfo[code].english} ${code}`} onSelect={() => run(() => switchLocale(code))}>
                  <Languages /> <span lang={code}>{localeInfo[code].name}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandMenuContext>
  );
}
