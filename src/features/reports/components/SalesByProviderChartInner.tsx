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
  salesByProviderChartConfig,
} from "@/features/reports/constants/chart-config";
import type { SalesByProviderPoint } from "@/features/reports/types/insights.types";
import { formatCompactNumber } from "@/utils/format-compact-number";

type SalesByProviderChartInnerProps = {
  data: SalesByProviderPoint[];
};

export function SalesByProviderChartInner({
  data,
}: SalesByProviderChartInnerProps) {
  const chartData = data.map((point) => ({
    name: point.provider_name,
    total: Number.parseFloat(point.total) || 0,
  }));

  const hasValues = chartData.length > 0 && chartData.some((point) => point.total > 0);

  if (!hasValues) {
    return <ChartEmptyState message="No provider sales in this period." />;
  }

  return (
    <ChartContainer
      config={salesByProviderChartConfig}
      className="h-[280px] w-full min-w-0"
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={(value: number) => formatCompactNumber(value)}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="total" fill={REPORT_CHART_COLORS.primary} radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
