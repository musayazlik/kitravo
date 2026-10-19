"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fill } from "@/i18n/format";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/i18n/provider";
import { rich } from "@/i18n/rich";
import { mcpActivity } from "../data/overview";

export function McpActivity() {
  const { t, f, plural } = useI18n();
  const copy = t.dashboard.mcp;
  const detail = (entry: (typeof mcpActivity)[number]) =>
    "count" in entry.detail ? plural(copy.details[entry.detail.key], entry.detail.count) : fill(copy.details[entry.detail.key], { title: entry.detail.title });

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="font-heading text-lg">{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative grid gap-4 border-s ps-5">
          {mcpActivity.map((entry) => (
            <li key={entry.id} className="relative">
              <span aria-hidden className="absolute top-1.5 -start-[25px] size-2.5 rounded-full border-2 border-card bg-ink" />
              <p className="text-sm text-muted-foreground">
                {rich(copy.ran, {
                  client: <span className="font-medium text-foreground">{entry.client}</span>,
                  tool: <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">{entry.tool}</code>,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {detail(entry)} · <time dateTime={entry.at}>{f.dateTime(entry.at)}</time>
              </p>
            </li>
          ))}
        </ol>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href="/panel/mcp">{copy.manage}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
