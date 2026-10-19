"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { Fragment, Suspense } from "react";
import { Search } from "lucide-react";
import { navGroups, type NavItemKey } from "@/config/nav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCommandMenu } from "./command-menu";
import { LocaleSwitcher } from "./locale-switcher";
import { Notifications } from "./notifications";
import { Container } from "./container";
import { ThemeToggle } from "./theme-toggle";

/** URL segment → nav label key. The parent ("posts" → Blog) wins over its "All posts" child. */
const SEGMENT_KEYS: Record<string, NavItemKey> = Object.fromEntries(
  navGroups.flatMap((group) =>
    group.items.flatMap((item) => [
      ...(item.items ?? []).map((child) => [child.href.split("/").pop()!, child.title]),
      [item.href.split("/").pop()!, item.title],
    ]),
  ),
);

function Crumbs() {
  const { t } = useI18n();
  const segments = usePathname().split("/").filter(Boolean).slice(1);
  const crumbs = segments.map((segment, index) => {
    const key = SEGMENT_KEYS[segment];
    const page = t.nav.crumbs[segment as keyof typeof t.nav.crumbs];
    return {
      href: `/panel/${segments.slice(0, index + 1).join("/")}`,
      // Unknown segments are record ids, e.g. /posts/p3.
      label: key ? t.nav.items[key] : (page ?? t.nav.crumbs.edit),
    };
  });

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            {index > 0 && <BreadcrumbSeparator className="hidden sm:block" />}
            <BreadcrumbItem className={index < crumbs.length - 1 ? "hidden sm:inline-flex" : "truncate"}>
              {index === crumbs.length - 1 ? (
                <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function SiteHeader() {
  const { open } = useCommandMenu();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-20 shrink-0 rounded-t-xl border-b bg-background/85 backdrop-blur-md">
      <Container size="panel" className="flex h-14 items-center gap-2 px-4 md:px-6 lg:px-8">
      <SidebarTrigger className="-ms-1" />
      <Separator orientation="vertical" className="me-1 data-[orientation=vertical]:h-4" />
      <Suspense>
        <Crumbs />
      </Suspense>

      <div className="ms-auto flex items-center gap-1.5">
        <Button
          variant="outline"
          onClick={open}
          className="h-8 w-9 justify-start gap-2 px-2.5 text-muted-foreground sm:w-56 md:w-64"
          aria-label={t.nav.search.label}
        >
          <Search />
          <span className="hidden sm:inline">{t.nav.search.button}</span>
          <KbdGroup className="ms-auto hidden sm:inline-flex">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
        <LocaleSwitcher />
        <ThemeToggle />
        <Notifications />
      </div>
      </Container>
    </header>
  );
}
