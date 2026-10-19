"use client";

import { useState, type ComponentProps } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { PANEL_HOME, PANEL_SIGN_IN } from "@/config/routes";

export function DemoEntry({ enabled = true, children, ...props }: ComponentProps<typeof Button> & { enabled?: boolean }) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const { t } = useI18n();
  return <Button {...props} disabled={pending} onClick={async () => {
    if (!enabled) { router.push(PANEL_SIGN_IN); return; }
    setPending(true);
    try {
      const session = await authClient.getSession();
      if (session.error) throw new Error(t.access.error);
      if (!session.data) {
        const result = await authClient.signIn.anonymous();
        if (result.error) throw new Error(result.error.message ?? t.access.error);
      }
      router.push(PANEL_HOME); router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : t.access.error); }
    finally { setPending(false); }
  }}>{pending ? t.access.loading : children ?? t.studio.demo}{pending ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" aria-hidden />}</Button>;
}
