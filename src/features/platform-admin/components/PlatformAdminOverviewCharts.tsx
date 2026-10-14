"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartEmptyState } from "@/features/reports/components/ChartEmptyState";
import type { PlatformAdminNetDollarRetention } from "@/features/platform-admin/types/platform-admin.types";
import { formatCohortMonth as formatMonthLabel } from "@/features/platform-admin/utils/cohort-retention";

export { PlatformAdminCohortRetentionChart } from "@/features/platform-admin/components/PlatformAdminCohortRetentionChart";

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
    <ChartContainer
      config={ndrChartConfig}
      className="h-[320px] w-full min-w-0"
    >
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
