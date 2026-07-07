"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartEmptyState } from "@/features/reports/components/ChartEmptyState";
import {
  platformAdminUsageHourChartConfig,
  platformAdminUsageTrendChartConfig,
} from "@/features/platform-admin/constants/usage-chart-config";
import type {
  PlatformAdminUsageHourPoint,
  PlatformAdminUsageSeries,
  PlatformAdminUsageSeriesPoint,
} from "@/features/platform-admin/types/platform-admin.types";

function formatPeriodLabel(label: string): string {
  const parsed = new Date(`${label}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return label;
  }
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type UsageTrendChartProps = {
  series: PlatformAdminUsageSeries;
};

export function PlatformAdminUsageTrendChart({ series }: UsageTrendChartProps) {
  const labels = series.sign_ins.map((point) => point.label);
  const chartData = labels.map((label) => ({
    label,
    sign_ins: series.sign_ins.find((point) => point.label === label)?.count ?? 0,
    visits: series.visits.find((point) => point.label === label)?.count ?? 0,
    appointments:
      series.appointments.find((point) => point.label === label)?.count ?? 0,
    sales_orders:
      series.sales_orders.find((point) => point.label === label)?.count ?? 0,
    invoices: series.invoices.find((point) => point.label === label)?.count ?? 0,
    payments: series.payments.find((point) => point.label === label)?.count ?? 0,
    claims: series.claims.find((point) => point.label === label)?.count ?? 0,
  }));

  const hasValues = chartData.some((point) =>
    Object.entries(point).some(
      ([key, value]) => key !== "label" && Number(value) > 0,
    ),
  );

  if (!hasValues) {
    return <ChartEmptyState message="No product activity in this period." />;
  }

  return (
    <ChartContainer
      config={platformAdminUsageTrendChartConfig}
      className="h-[320px] w-full min-w-0"
    >
      <LineChart
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
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          width={40}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="sign_ins"
          stroke="var(--color-sign_ins)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="visits"
          stroke="var(--color-visits)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="appointments"
          stroke="var(--color-appointments)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="sales_orders"
          stroke="var(--color-sales_orders)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="invoices"
          stroke="var(--color-invoices)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="payments"
          stroke="var(--color-payments)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="claims"
          stroke="var(--color-claims)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

type UsageMetricChartProps = {
  title: string;
  data: PlatformAdminUsageSeriesPoint[];
  color: string;
};

export function PlatformAdminUsageMetricChart({
  title,
  data,
  color,
}: UsageMetricChartProps) {
  const hasValues = data.some((point) => point.count > 0);

  if (!hasValues) {
    return <ChartEmptyState message={`No ${title.toLowerCase()} in this period.`} />;
  }

  return (
    <ChartContainer
      config={{ count: { label: title, color } }}
      className="h-[220px] w-full min-w-0"
    >
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          tick={{ fontSize: 10 }}
          tickFormatter={formatPeriodLabel}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
        <Bar dataKey="count" fill={color} radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

type UsageHourChartProps = {
  data: PlatformAdminUsageHourPoint[];
};

export function PlatformAdminUsageHourChart({ data }: UsageHourChartProps) {
  const hasValues = data.some((point) => point.count > 0);

  if (!hasValues) {
    return <ChartEmptyState message="No hourly activity in this period." />;
  }

  return (
    <ChartContainer
      config={platformAdminUsageHourChartConfig}
      className="h-[260px] w-full min-w-0"
    >
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          tickMargin={8}
          axisLine={false}
          tick={{ fontSize: 10 }}
          interval={1}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
