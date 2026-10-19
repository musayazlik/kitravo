"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu } from "lucide-react";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { LogoMark } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { siteNavLinks } from "@/config/nav";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";
import { DemoEntry } from "@/features/landing/components/demo-entry";

/** Public site header. It gains a border and a frosted background once the page scrolls. */
export function SiteNav({ demoEnabled = true }: { demoEnabled?: boolean }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { t, dir } = useI18n();
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 8));

  return (
    <motion.header
      className={cn(
        "sticky top-0 z-40 border-b border-transparent bg-background/85 backdrop-blur-xl transition-[background-color,border-color] duration-300",
        scrolled && "border-border bg-background/80 backdrop-blur-md",
      )}
    >
      <Container className="flex h-[76px] items-center gap-3 px-5 sm:gap-6 sm:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogoMark className="size-11 sm:size-12" sizes="48px" />
          <span className="font-heading text-2xl font-semibold tracking-tight sm:text-[26px]">
            {siteConfig.name}
          </span>
        </Link>

        <nav
          aria-label={t.site.nav.main}
          className="mx-auto hidden items-center gap-1 lg:flex"
        >
          {siteNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-full px-3 text-[13px] text-muted-foreground transition-colors hover:bg-paper hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {t.site.links[link.label]}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/panel/sign-in">{t.site.nav.signIn}</Link>
          </Button>
          <DemoEntry enabled={demoEnabled} className="hidden h-10 gap-2 rounded-lg px-4 text-xs sm:inline-flex">{t.site.nav.explore}</DemoEntry>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11 lg:hidden"
                aria-label={t.site.nav.openMenu}
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === "rtl" ? "left" : "right"} className="w-72">
              <SheetHeader>
                <SheetTitle className="text-start">{t.site.nav.menu}</SheetTitle>
              </SheetHeader>
              <nav aria-label={t.site.nav.mobile} className="grid gap-1 px-4">
                {siteNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-sm px-3 py-2.5 hover:bg-muted"
                  >
                    {t.site.links[link.label]}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto grid gap-2 p-4">
                <Button variant="outline" asChild>
                  <Link href="/panel/sign-in">{t.site.nav.signIn}</Link>
                </Button>
                <Button asChild>
                  <Link href="/panel/dashboard">{t.site.nav.openPanel}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </motion.header>
  );
}
