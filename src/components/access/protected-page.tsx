import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getPrincipal, getSignInHref } from "@/lib/access/session";
import { can, canPreviewPage, type Permission } from "@/lib/access/catalog";
import { getI18n } from "@/i18n/server";
import { localizeHref } from "@/i18n/config";
import { TablePageSkeleton } from "@/components/page-skeleton";

/** Authorize before invoking the page component, including on direct RSC requests. */
export function protectPage<P extends object>(
  permission: Permission,
  Page: (props: P) => ReactNode | Promise<ReactNode>,
  DemoPage?: (props: P) => ReactNode | Promise<ReactNode>,
) {
  async function Authorized(props: P) {
    const principal = await getPrincipal();
    const { locale, t } = await getI18n();
    if (!principal) redirect(await getSignInHref(locale));
    // A demo must use its own renderer before the real page can query private data.
    if (DemoPage && canPreviewPage(principal, permission)) return <DemoPage {...props} />;
    if (!can(principal, permission)) return (
      <main id="main" className="grid min-h-80 place-content-center gap-3 p-8 text-center">
        <h1 className="text-2xl font-semibold">{t.access.forbidden}</h1>
        <p className="text-muted-foreground">{t.access.forbiddenDescription}</p>
        <a className="text-ink underline" href={localizeHref("/panel/dashboard", locale)}>{t.access.back}</a>
      </main>
    );
    return <Page {...props} />;
  }
  return function ProtectedPage(props: P) {
    return <Suspense fallback={<TablePageSkeleton />}><Authorized {...props} /></Suspense>;
  };
}
