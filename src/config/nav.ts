import {
  Bot,
  FileText,
  Globe,
  Image,
  Inbox,
  LayoutDashboard,
  Mail,
  Settings,
  ShieldCheck,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Dictionary } from "@/i18n/dictionary";
import { can, canPreviewPage, permissionForPath, type Principal } from "@/lib/access/catalog";

/** Key into the live counts shown as a sidebar badge. */
export type NavBadge = "inbox" | "reviews" | "comments";

/** Labels are keys into the `nav` messages, so every language reads the same config. */
export type NavItemKey = keyof Dictionary["nav"]["items"];

export type NavChild = { title: NavItemKey; href: string; badge?: NavBadge };

export type NavLink = {
  title: NavItemKey;
  href: string;
  icon: LucideIcon;
  badge?: NavBadge;
  items?: NavChild[];
};

export type NavGroup = { label: keyof Dictionary["nav"]["groups"]; items: NavLink[] };

type SiteLinkKey = keyof Dictionary["site"]["links"];

export const siteNavLinks: { href: string; label: SiteLinkKey }[] = [
  { href: "/#modules", label: "modules" },
  { href: "/#agents", label: "agents" },
  { href: "/#start", label: "start" },
  { href: "/#open-source", label: "openSource" },
  { href: "/blog", label: "blog" },
];

export const siteFooterColumns: { title: SiteLinkKey; links: { href: string; label: SiteLinkKey }[] }[] = [
  {
    title: "explore",
    links: [
      ...siteNavLinks.slice(0, 3),
      { href: "/panel/dashboard", label: "demo" },
    ],
  },
  {
    title: "resources",
    links: [
      { href: "/#open-source", label: "github" },
      { href: "/blog", label: "fromBlog" },
      { href: "/sitemap.xml", label: "sitemap" },
    ],
  },
  {
    title: "workspace",
    links: [
      { href: "/panel/sign-in", label: "signIn" },
      { href: "/panel/sign-up", label: "signUp" },
    ],
  },
];

/** Single source of truth for the sidebar and the command menu. */
export const navGroups: NavGroup[] = [
  {
    label: "workspace",
    items: [
      { title: "dashboard", href: "/panel/dashboard", icon: LayoutDashboard },
      { title: "inbox", href: "/panel/inbox", icon: Inbox, badge: "inbox" },
    ],
  },
  {
    label: "content",
    items: [
      {
        title: "blog",
        href: "/panel/posts",
        icon: FileText,
        items: [
          { title: "allPosts", href: "/panel/posts" },
          { title: "categories", href: "/panel/posts/categories" },
          { title: "tags", href: "/panel/posts/tags" },
          { title: "comments", href: "/panel/posts/comments", badge: "comments" },
        ],
      },
      { title: "media", href: "/panel/media", icon: Image },
      { title: "reviews", href: "/panel/reviews", icon: Star, badge: "reviews" },
    ],
  },
  {
    label: "growth",
    items: [
      { title: "seo", href: "/panel/seo", icon: Globe },
      { title: "mail", href: "/panel/mail", icon: Mail },
    ],
  },
  {
    label: "system",
    items: [
      { title: "users", href: "/panel/users", icon: Users },
      { title: "roles", href: "/panel/roles", icon: ShieldCheck },
      { title: "mcp", href: "/panel/mcp", icon: Bot },
      { title: "settings", href: "/panel/settings", icon: Settings },
    ],
  },
];

export function accessibleNavGroups(principal: Principal | null): NavGroup[] {
  const allowed = (href: string) => {
    const permission = permissionForPath(href);
    return permission !== undefined && (can(principal, permission) || canPreviewPage(principal, permission));
  };
  return navGroups.map((group) => ({ ...group, items: group.items.flatMap((item) => {
    if (item.items) {
      const items = item.items.filter((child) => allowed(child.href));
      return items.length ? [{ ...item, items }] : [];
    }
    return allowed(item.href) ? [item] : [];
  }) })).filter((group) => group.items.length > 0);
}

/** A section is active on its own route and on every route nested under it. */
export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
