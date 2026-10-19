"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAccess } from "@/components/access/access-provider";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";

/** One settings page: heading, intro, fields and a save button that names what it saves. */
export function SettingsSection({
  title,
  description,
  saveLabel,
  children,
}: {
  title: string;
  description: string;
  saveLabel?: string;
  children: ReactNode;
}) {
  const access = useAccess();
  const { t } = useI18n();
  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!access.can("settings.manage")) return;
        toast.success(fill(t.settings.saved, { title }));
      }}
    >
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Separator />
      <fieldset disabled={!access.can("settings.manage")} className="contents">{children}</fieldset>
      {saveLabel && access.can("settings.manage") && (
        <div>
          <Button type="submit">{saveLabel}</Button>
        </div>
      )}
    </form>
  );
}
