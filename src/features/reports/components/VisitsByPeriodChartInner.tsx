"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartEmptyState } from "@/features/reports/components/ChartEmptyState";
import {
  REPORT_CHART_COLORS,
  visitsByPeriodChartConfig,
} from "@/features/reports/constants/chart-config";
import type { VisitsByPeriodPoint } from "@/features/reports/types/insights.types";

type VisitsByPeriodChartInnerProps = {
  data: VisitsByPeriodPoint[];
};

export function VisitsByPeriodChartInner({
  data,
}: VisitsByPeriodChartInnerProps) {
  const hasValues =
    data.length > 0 && data.some((point) => Number(point.count) > 0);

  if (!hasValues) {
    return <ChartEmptyState message="No visits in this period." />;
  }

  return (
    <ChartContainer
      config={visitsByPeriodChartConfig}
      className="h-[280px] w-full min-w-0"
    >
      <BarChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <Bar dataKey="count" fill={REPORT_CHART_COLORS.sky} radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
