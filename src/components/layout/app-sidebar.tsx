"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { Suspense } from "react";
import { ChevronRight, ChevronsUpDown, LogOut, Moon, Settings, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { isActivePath, accessibleNavGroups, type NavChild, type NavLink } from "@/config/nav";
import { cn } from "@/lib/utils";
import { fill } from "@/i18n/format";
import { initials, liveCounts, workspace } from "@/lib/mock-session";
import { useAccess, Can } from "@/components/access/access-provider";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoMark } from "./logo";

export function AppSidebar() {
  const { dir } = useI18n();

  return (
    // The sidebar sits at the start of the reading direction: left, or right in Arabic.
    <Sidebar variant="inset" collapsible="icon" side={dir === "rtl" ? "right" : "left"}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/panel/dashboard" aria-label={workspace.name}>
                {/* The shared PNG mark keeps its own size in either sidebar mode. */}
                <LogoMark className="size-8! shrink-0" />
                <span className="grid leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="font-heading text-[15px] font-semibold">{workspace.name}</span>
                  <span className="text-xs text-muted-foreground">{workspace.domain}</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* The active item depends on the URL, so it streams in; the fallback is the same menu, unhighlighted. */}
        <Suspense fallback={<NavGroups pathname="" />}>
          <LiveNavGroups />
        </Suspense>
      </SidebarContent>

      <SidebarFooter>
        <StorageMeter />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function LiveNavGroups() {
  return <NavGroups pathname={usePathname()} />;
}

function NavGroups({ pathname }: { pathname: string }) {
  const { t } = useI18n();
  const { principal } = useAccess();

  return (
    <>
      {accessibleNavGroups(principal).map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{t.nav.groups[group.label]}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => {
              const active = isActivePath(pathname, item.href);
              const count = item.badge ? liveCounts[item.badge] : 0;

              if (item.items) {
                // The deepest matching child wins, so /posts/tags lights "Tags", not "All posts".
                const activeChild = item.items
                  .filter((child) => isActivePath(pathname, child.href))
                  .sort((a, b) => b.href.length - a.href.length)[0];

                return <NavCollapsible key={item.href} item={item} items={item.items} active={active} activeHref={activeChild?.href} />;
              }

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={t.nav.items[item.title]} isActive={active}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{t.nav.items[item.title]}</span>
                    </Link>
                  </SidebarMenuButton>
                  {count > 0 && (
                    <SidebarMenuBadge className="rounded-sm bg-proof-soft px-1.5 text-proof-foreground">
                      <WaitingCount count={count} />
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

function WaitingCount({ count }: { count: number }) {
  const { t } = useI18n();

  return (
    <>
      {count}
      <span className="sr-only"> {t.common.waiting}</span>
    </>
  );
}

function childCount(child: NavChild) {
  return child.badge ? liveCounts[child.badge] : 0;
}

/**
 * A nav item with children. Expanded sidebar: the list slides open under the
 * item. Icon-only sidebar: there is no room for the list, so the children
 * open in a menu beside the icon instead.
 */
function NavCollapsible({
  item,
  items,
  active,
  activeHref,
}: {
  item: NavLink;
  items: NonNullable<NavLink["items"]>;
  active: boolean;
  activeHref?: string;
}) {
  const { state, isMobile } = useSidebar();
  const { t, dir } = useI18n();
  const title = t.nav.items[item.title];
  const total = items.reduce((sum, child) => sum + childCount(child), 0);

  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip={title} isActive={active}>
              <item.icon />
              <span>{title}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={dir === "rtl" ? "left" : "right"} align="start" sideOffset={8} className="min-w-44">
            <DropdownMenuLabel>{title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {items.map((child) => (
              <DropdownMenuItem key={child.href} asChild className={activeHref === child.href ? "bg-accent" : undefined}>
                <Link href={child.href}>
                  {t.nav.items[child.title]}
                  {childCount(child) > 0 && (
                    <span className="ms-auto rounded-sm bg-proof-soft px-1.5 text-xs font-medium text-proof-foreground tabular-nums">
                      <WaitingCount count={childCount(child)} />
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible asChild defaultOpen={active} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={title} isActive={active}>
            <item.icon />
            <span>{title}</span>
            {/* While the list is closed the parent carries its children's counts. */}
            {total > 0 && (
              <span className="ms-auto rounded-sm bg-proof-soft px-1.5 text-xs font-medium text-proof-foreground tabular-nums group-data-[state=open]/collapsible:hidden">
                <WaitingCount count={total} />
              </span>
            )}
            <ChevronRight
              className={cn(
                // The icon is mirrored in right-to-left languages, so it turns the other way to point down.
                "transition-transform duration-200 ease-out group-data-[state=open]/collapsible:ms-auto group-data-[state=open]/collapsible:rotate-90 rtl:group-data-[state=open]/collapsible:-rotate-90",
                total === 0 && "ms-auto",
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <SidebarMenuSub>
            {items.map((child) => (
              <SidebarMenuSubItem key={child.href}>
                <SidebarMenuSubButton asChild isActive={activeHref === child.href}>
                  <Link href={child.href}>
                    <span className="truncate">{t.nav.items[child.title]}</span>
                    {childCount(child) > 0 && (
                      <span className="ms-auto rounded-sm bg-proof-soft px-1.5 text-xs font-medium text-proof-foreground tabular-nums">
                        <WaitingCount count={childCount(child)} />
                      </span>
                    )}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function StorageMeter() {
  const { t, f } = useI18n();
  const access = useAccess();
  if (!access.can("media.read")) return null;
  const { usedMb, limitMb } = workspace.storage;
  const percent = Math.round((usedMb / limitMb) * 100);

  return (
    <Link
      href="/panel/media"
      className="mx-2 mb-1 grid gap-2 rounded-lg border border-sidebar-border bg-background/60 p-3 text-xs transition-colors hover:bg-background group-data-[collapsible=icon]:hidden"
    >
      <span className="flex items-center justify-between">
        <span className="font-medium text-foreground">{t.nav.storage}</span>
        <span className="tabular text-muted-foreground">
          {fill(t.nav.storageOf, { used: f.bytes(usedMb * 1024 ** 2), limit: f.bytes(limitMb * 1024 ** 2) })}
        </span>
      </span>
      <Progress value={percent} aria-label={fill(t.nav.storageUsed, { percent })} className="h-1.5" />
    </Link>
  );
}

function NavUser() {
  const { isMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();
  const { t, dir } = useI18n();
  const { principal } = useAccess();
  const router = useRouter();
  if (!principal) return null;
  const currentUser = principal;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-ink-soft text-ink">{initials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <span className="grid flex-1 text-start leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium">{currentUser.name}</span>
                <span className="truncate text-xs text-muted-foreground">{currentUser.email}</span>
              </span>
              <ChevronsUpDown className="ms-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            side={isMobile ? "bottom" : dir === "rtl" ? "left" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="font-normal">
              <span className="block text-sm font-medium text-foreground">{currentUser.name}</span>
              <span className="block text-xs text-muted-foreground">{currentUser.roles.map((role) => role.name).join(", ")}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/panel/dashboard">
                  <UserRound /> {t.nav.user.account}
                </Link>
              </DropdownMenuItem>
              <Can permission="settings.read"><DropdownMenuItem asChild>
                <Link href="/panel/settings">
                  <Settings /> {t.nav.user.settings}
                </Link>
              </DropdownMenuItem></Can>
              <DropdownMenuItem onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
                {resolvedTheme === "dark" ? <Sun /> : <Moon />}
                {resolvedTheme === "dark" ? t.common.theme.light : t.common.theme.dark}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={async () => {
              const result = await authClient.signOut();
              if (!result.error) { router.replace("/panel/sign-in"); router.refresh(); }
            }}>
                <LogOut /> {t.nav.user.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
