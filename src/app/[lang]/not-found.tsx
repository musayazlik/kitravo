"use client";

import { LogoMark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";

/** 404 inside a language: `notFound()` calls and unknown paths under `/[lang]/…`. */
export default function NotFound() {
  const { t } = useI18n();

  return (
    <main className="grid min-h-svh place-items-center bg-paper p-6">
      <div className="grid max-w-md justify-items-start gap-4">
        <LogoMark className="size-10" />
        <h1 className="text-4xl font-semibold">{t.common.notFound.title}</h1>
        <p className="text-muted-foreground">{t.common.notFound.body}</p>
        <Button asChild>
          <Link href="/panel/dashboard">{t.common.notFound.cta}</Link>
        </Button>
      </div>
    </main>
  );
}
