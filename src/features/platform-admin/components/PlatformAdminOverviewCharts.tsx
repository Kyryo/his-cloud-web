"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartEmptyState } from "@/features/reports/components/ChartEmptyState";
import type {
  PlatformAdminCohortRetention,
  PlatformAdminNetDollarRetention,
} from "@/features/platform-admin/types/platform-admin.types";

const COHORT_COLORS = [
  "#0b6e6e",
  "#2f5e46",
  "#4a7c59",
  "#6b8f3a",
  "#b86a1f",
  "#c98a2b",
  "#6b4c9a",
  "#8a5bb0",
  "#1f6f8b",
  "#3a8ba3",
  "#8b4513",
  "#a35a2b",
  "#5a5a5a",
];

function formatMonthLabel(month: string): string {
  const parsed = new Date(`${month}-01T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return month;
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
  });
}

type CohortChartProps = {
  retention: PlatformAdminCohortRetention;
};

export function PlatformAdminCohortRetentionChart({
  retention,
}: CohortChartProps) {
  const maxOffset = retention.cohorts.reduce(
    (max, cohort) => Math.max(max, cohort.months.length),
    0,
  );

  if (maxOffset === 0) {
    return (
      <ChartEmptyState message="No onboarding cohorts with product activity yet." />
    );
  }

  const config: ChartConfig = {};
  for (let offset = 0; offset < maxOffset; offset += 1) {
    config[`m${offset}`] = {
      label: `Month ${offset}`,
      color: COHORT_COLORS[offset % COHORT_COLORS.length],
    };
  }

  const chartData = retention.cohorts.map((cohort) => {
    const row: Record<string, number | string> = {
      cohort: formatMonthLabel(cohort.cohort_month),
    };
    for (const point of cohort.months) {
      row[`m${point.offset}`] = point.active_count;
    }
    return row;
  });

  return (
    <ChartContainer config={config} className="h-[340px] w-full min-w-0">
      <BarChart
        accessibilityLayer
        layout="vertical"
        data={chartData}
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="cohort"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          width={64}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        {Object.keys(config).map((key) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="cohort"
            fill={`var(--color-${key})`}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

const ndrChartConfig = {
  ndr_percent: {
    label: "NDR %",
    color: "#0b6e6e",
  },
} satisfies ChartConfig;

type NdrChartProps = {
  ndr: PlatformAdminNetDollarRetention;
};

export function PlatformAdminNdrChart({ ndr }: NdrChartProps) {
  if (ndr.series.length === 0) {
    return (
      <ChartEmptyState message="Net dollar retention needs at least 13 months of tenant payments." />
    );
  }

  const chartData = ndr.series.map((point) => ({
    month: formatMonthLabel(point.month),
    ndr_percent: point.ndr_percent,
  }));

  return (
    <ChartContainer config={ndrChartConfig} className="h-[320px] w-full min-w-0">
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          width={44}
          tickFormatter={(value: number) => `${value}%`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="ndr_percent"
          stroke="var(--color-ndr_percent)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
