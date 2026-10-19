import type { Metadata } from "next";
import { Suspense } from "react";
import { PanelSession } from "@/components/access/panel-session";
import { DemoNotice } from "@/components/access/demo-notice";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandMenuProvider } from "@/components/layout/command-menu";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getDictionary } from "@/i18n/server";

/** The panel is private; only the website and blog are indexed. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const t = await getDictionary();

  return (
    <Suspense fallback={<div className="p-8">{t.access.loading}</div>}>
    <PanelSession>
    <SidebarProvider>
      <CommandMenuProvider>
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-background px-3 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:start-3"
        >
          {t.common.skipToContent}
        </a>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <SiteHeader />
          <DemoNotice />
          {children}
        </SidebarInset>
      </CommandMenuProvider>
    </SidebarProvider>
    </PanelSession>
    </Suspense>
  );
}
