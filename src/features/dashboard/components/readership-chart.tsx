"use client";

import { EvilAreaChart } from "@/components/evilcharts/charts/recharts-area-chart";
import type { ChartConfig } from "@/components/evilcharts/ui/recharts-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { chartColors } from "@/lib/chart-colors";
import { readershipFor, type Range } from "../data/overview";

export function ReadershipChart({ range }: { range: Range }) {
  const { t, f } = useI18n();
  const copy = t.dashboard.readership;
  const config = {
    views: { label: copy.views, colors: chartColors.ink },
    readers: { label: copy.readers, colors: chartColors.signal },
  } satisfies ChartConfig;
  const data = readershipFor(range);
  const total = data.reduce((sum, row) => sum + row.views, 0);

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="font-heading text-lg">{copy.title}</CardTitle>
        <CardDescription>{fill(copy.description, { total: f.compact(total) })}</CardDescription>
      </CardHeader>
      {/* Time runs left to right on the chart in every language. */}
      <CardContent className="px-2 sm:px-4" dir="ltr">
        {/* key restarts the reveal when the range changes, so the new period draws in. */}
        <EvilAreaChart
          key={range}
          data={data}
          config={config}
          className="aspect-auto h-[260px] w-full"
          curveType="monotone"
          animationType="left-to-right"
          xDataKey="date"
        >
          <EvilAreaChart.Grid />
          <EvilAreaChart.XAxis
            dataKey="date"
            minTickGap={28}
            tickFormatter={(value: string) => f.dayMonth(value)}
          />
          <EvilAreaChart.YAxis width={56} tickFormatter={(value: number) => f.compact(value)} />
          <EvilAreaChart.Tooltip />
          <EvilAreaChart.Legend align="right" verticalAlign="top" isClickable />
          <EvilAreaChart.Area dataKey="views" variant="gradient" isClickable>
            <EvilAreaChart.ActiveDot variant="colored-border" />
          </EvilAreaChart.Area>
          <EvilAreaChart.Area dataKey="readers" variant="gradient" strokeVariant="dashed" isClickable>
            <EvilAreaChart.ActiveDot variant="colored-border" />
          </EvilAreaChart.Area>
        </EvilAreaChart>
      </CardContent>
    </Card>
  );
}
