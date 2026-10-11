"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const CHART_CONFIG: ChartConfig = {
  views: { label: "Views", color: "var(--color-brand-primary)" },
};

const AXIS_DATE = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

type BlogPostViewsChartProps = {
  data: Array<{ date: string; views: number }>;
};

export function BlogPostViewsChart({ data }: BlogPostViewsChartProps) {
  return (
    <ChartContainer config={CHART_CONFIG} className="aspect-auto h-48 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="blog-views-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-views)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--color-views)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          minTickGap={32}
          tickFormatter={(value: string) => AXIS_DATE.format(new Date(value))}
        />
        <YAxis tickLine={false} axisLine={false} width={36} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} fill="url(#blog-views-fill)" />
      </AreaChart>
    </ChartContainer>
  );
}
