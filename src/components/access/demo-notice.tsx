"use client";

import { Eye } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/provider";
import { useAccess } from "./access-provider";

/** Keep the demo notice inside the workspace so the fixed sidebar stays aligned. */
export function DemoNotice() {
  const { principal } = useAccess();
  const { t } = useI18n();
  if (!principal?.demo) return null;

  return (
    <Container size="panel" className="px-4 pt-4 md:px-6 md:pt-6 lg:px-8">
      <Card size="sm" role="status" className="border border-proof/25 bg-proof-soft text-proof-foreground ring-0">
        <CardContent className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-proof/15">
            <Eye aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0 space-y-1 text-start">
            <p className="font-medium">{t.access.demoTitle}</p>
            <p className="text-sm leading-relaxed">{t.access.demoDescription}</p>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
