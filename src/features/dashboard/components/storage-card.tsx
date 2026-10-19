"use client";

import { Link } from "@/i18n/navigation";
import { EvilRadialChart } from "@/components/evilcharts/charts/recharts-radial-chart";
import type { ChartConfig } from "@/components/evilcharts/ui/recharts-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { chartColors } from "@/lib/chart-colors";
import { workspace } from "@/lib/mock-session";

const data = [
  { kind: "images", mb: 846 },
  { kind: "video", mb: 392 },
  { kind: "documents", mb: 146 },
];

export function StorageCard() {
  const { t, f } = useI18n();
  const copy = t.dashboard.storage;
  const config = {
    images: { label: copy.images, colors: chartColors.ink },
    video: { label: copy.video, colors: chartColors.plum },
    documents: { label: copy.documents, colors: chartColors.proof },
  } satisfies ChartConfig;
  const { usedMb, limitMb } = workspace.storage;

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="font-heading text-lg">{copy.title}</CardTitle>
        <CardDescription>{fill(copy.description, { used: f.bytes(usedMb * 1024 ** 2), limit: f.bytes(limitMb * 1024 ** 2) })}</CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <EvilRadialChart
          data={data}
          nameKey="kind"
          config={config}
          max={limitMb}
          innerRadius="38%"
          className="mx-auto aspect-square h-[200px]"
        >
          <EvilRadialChart.Tooltip />
          <EvilRadialChart.Legend />
          <EvilRadialChart.RadialBar dataKey="mb" cornerRadius={8} showBackground />
        </EvilRadialChart>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href="/panel/media">{copy.open}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
