"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartEmptyState } from "@/features/reports/components/ChartEmptyState";
import {
  REPORT_CHART_COLORS,
  salesActivityChartConfig,
} from "@/features/reports/constants/chart-config";
import type { SalesActivityPoint } from "@/features/reports/types/insights.types";
import { formatCompactNumber } from "@/utils/format-compact-number";

type SalesActivityChartInnerProps = {
  data: SalesActivityPoint[];
};

function toNumber(value: string): number {
  return Number.parseFloat(value) || 0;
}

function formatPeriodLabel(label: string): string {
  const parsed = new Date(`${label}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return label;
  }
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function SalesActivityChartInner({ data }: SalesActivityChartInnerProps) {
  const chartData = data.map((point) => ({
    label: point.label,
    sales_orders: toNumber(point.sales_orders),
    invoices: toNumber(point.invoices),
    payments: toNumber(point.payments),
  }));

  const hasValues = chartData.some(
    (point) =>
      point.sales_orders > 0 || point.invoices > 0 || point.payments > 0,
  );

  if (!hasValues) {
    return <ChartEmptyState message="No sales activity in this period." />;
  }

  return (
    <ChartContainer
      config={salesActivityChartConfig}
      className="h-[280px] w-full min-w-0"
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fontSize: 11 }}
          tickFormatter={formatPeriodLabel}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          width={56}
          tickFormatter={(value: number) => formatCompactNumber(value)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="sales_orders"
          name="Sales orders"
          fill={REPORT_CHART_COLORS.primary}
          radius={4}
        />
        <Bar
          dataKey="invoices"
          name="Invoices"
          fill={REPORT_CHART_COLORS.sky}
          radius={4}
        />
        <Bar
          dataKey="payments"
          name="Payments"
          fill={REPORT_CHART_COLORS.amber}
          radius={4}
        />
      </BarChart>
    </ChartContainer>
  );
}
