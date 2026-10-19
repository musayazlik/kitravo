"use client";

import { ChevronRight, Globe, Inbox, MailWarning, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { attention } from "../data/overview";

const ICONS = { reviews: Star, inbox: Inbox, seo: Globe, mail: MailWarning };

export function AttentionList() {
  const { t, plural } = useI18n();
  const copy = t.dashboard.attention;

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="font-heading text-lg">{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="px-3">
        <ul className="grid gap-1">
          {attention.map((item) => {
            const Icon = ICONS[item.kind];
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span className="relative grid size-9 shrink-0 place-items-center rounded-lg bg-proof-soft text-proof-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate text-sm font-medium">{plural(copy[item.kind], item.count)}</span>
                    <span className="truncate text-xs text-muted-foreground">{copy[`${item.kind}Detail`]}</span>
                  </span>
                  <ChevronRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
