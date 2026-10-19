import type { Metadata } from "next";
import { SiteFooter } from "@/features/site/components/site-footer";
import { SiteNav } from "@/features/site/components/site-nav";
import { getDictionary } from "@/i18n/server";

export const metadata: Metadata = { robots: { index: true, follow: true } };

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const t = await getDictionary();

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#content"
        className="sr-only z-50 rounded-sm bg-background px-3 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:start-3"
      >
        {t.common.skipToContent}
      </a>
      <SiteNav demoEnabled={process.env.AUTH_DEMO_ENABLED !== "false"} />
      <main id="content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
