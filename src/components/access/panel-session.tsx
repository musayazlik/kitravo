import { redirect } from "next/navigation";
import { getPrincipal, getSignInHref } from "@/lib/access/session";
import { getI18n } from "@/i18n/server";
import { AccessProvider } from "./access-provider";

export async function PanelSession({ children }: { children: React.ReactNode }) {
  const principal = await getPrincipal();
  const { locale } = await getI18n();
  if (!principal) redirect(await getSignInHref(locale));
  return (
    <AccessProvider principal={principal}>
      {children}
    </AccessProvider>
  );
}
