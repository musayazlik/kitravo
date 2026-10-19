"use client";

import { EvilBarChart } from "@/components/evilcharts/charts/recharts-bar-chart";
import type { ChartConfig } from "@/components/evilcharts/ui/recharts-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { chartColors } from "@/lib/chart-colors";
import { mailDelivery } from "../data/overview";

export function MailCard() {
  const { t, f } = useI18n();
  const copy = t.dashboard.mail;
  const config = {
    delivered: { label: copy.delivered, colors: chartColors.signal },
    bounced: { label: copy.bounced, colors: chartColors.rust },
  } satisfies ChartConfig;
  const delivered = mailDelivery.reduce((sum, row) => sum + row.delivered, 0);
  const bounced = mailDelivery.reduce((sum, row) => sum + row.bounced, 0);
  const rate = delivered / (delivered + bounced);

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardTitle className="font-heading text-lg">{copy.title}</CardTitle>
        <CardDescription>{fill(copy.description, { rate: f.percent(rate, 1), total: f.number(delivered + bounced) })}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-4" dir="ltr">
        <EvilBarChart
          data={mailDelivery}
          config={config}
          stackType="stacked"
          barRadius={3}
          animationType="left-to-right"
          className="aspect-auto h-[200px] w-full"
        >
          <EvilBarChart.XAxis dataKey="day" minTickGap={16} tickFormatter={(value: string) => f.dayMonth(`2026-${value}`)} />
          <EvilBarChart.Tooltip />
          <EvilBarChart.Bar dataKey="delivered" />
          <EvilBarChart.Bar dataKey="bounced" />
        </EvilBarChart>
      </CardContent>
    </Card>
  );
}
