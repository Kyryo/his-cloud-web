"use client";

import type { EChartsOption } from "echarts";
import { Repeat } from "lucide-react";
import { useMemo } from "react";

import {
  OverviewEChart,
  verticalGradient,
} from "@/features/platform-admin/components/overview/OverviewEChart";
import { OverviewEmptyState } from "@/features/platform-admin/components/overview/OverviewEmptyState";
import { OverviewSection } from "@/features/platform-admin/components/overview/OverviewSection";
import type { OverviewChartPalette } from "@/features/platform-admin/constants/overview-chart-palette";
import { useOverviewChartPalette } from "@/features/platform-admin/hooks/use-overview-chart-palette";
import type { PlatformAdminNetDollarRetention } from "@/features/platform-admin/types/platform-admin.types";
import { formatCohortMonth } from "@/features/platform-admin/utils/cohort-retention";

function buildOption(
  ndr: PlatformAdminNetDollarRetention,
  p: OverviewChartPalette,
): EChartsOption {
  const values = ndr.series.map((pt) => pt.ndr_percent);
  const min = Math.min(80, ...values);
  const max = Math.max(120, ...values);
  return {
    animationDuration: 600,
    textStyle: { fontFamily: "inherit" },
    grid: { top: 16, right: 12, bottom: 24, left: 44 },
    tooltip: {
      trigger: "axis",
      backgroundColor: p.surface,
      borderColor: p.tooltipBorder,
      borderWidth: 1,
      padding: [8, 10],
      extraCssText:
        "border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);",
      textStyle: { color: p.text, fontSize: 12 },
      axisPointer: {
        type: "line",
        lineStyle: { color: p.muted, type: "dashed" },
      },
      valueFormatter: (v) => `${v}%`,
    },
    xAxis: {
      type: "category",
      data: ndr.series.map((pt) => formatCohortMonth(pt.month)),
      boundaryGap: false,
      axisLine: { lineStyle: { color: p.grid } },
      axisTick: { show: false },
      axisLabel: { color: p.muted, fontSize: 11, hideOverlap: true },
    },
    yAxis: {
      type: "value",
      min: Math.floor(min / 10) * 10,
      max: Math.ceil(max / 10) * 10,
      splitNumber: 4,
      axisLabel: { color: p.muted, fontSize: 11, formatter: "{value}%" },
      splitLine: { lineStyle: { color: p.grid, type: [3, 4] } },
    },
    series: [
      {
        name: "NDR",
        type: "line",
        data: values,
        smooth: 0.35,
        showSymbol: false,
        symbolSize: 7,
        lineStyle: { width: 2.25, color: p.primary },
        itemStyle: { color: p.primary, borderColor: p.surface, borderWidth: 2 },
        areaStyle: {
          color: verticalGradient(p.primaryFill[0], p.primaryFill[1]),
          origin: "start",
        },
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: { color: p.muted, type: [4, 4], width: 1, opacity: 0.7 },
          label: {
            color: p.muted,
            fontSize: 10,
            formatter: "100%",
            position: "insideEndTop",
          },
          data: [{ yAxis: 100 }],
        },
      },
    ],
  };
}

type Props = { ndr: PlatformAdminNetDollarRetention };

export function OverviewNdrChart({ ndr }: Props) {
  const palette = useOverviewChartPalette();
  const option = useMemo(() => buildOption(ndr, palette), [ndr, palette]);
  const current = ndr.current_month_ndr_percent;

  return (
    <OverviewSection
      title="Net dollar retention"
      headline={
        current !== null ? (
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums">
              {current}%
            </span>
            <span className="text-xs text-muted-foreground">this month</span>
          </div>
        ) : null
      }
      description="Revenue from existing tenants vs. the same cohort 12 months prior. Above 100% means expansion outpaces churn."
    >
      {ndr.series.length === 0 ? (
        <OverviewEmptyState
          icon={Repeat}
          title="Not enough history"
          description="Net dollar retention needs at least 13 months of tenant payments."
          height={300}
        />
      ) : (
        <OverviewEChart
          option={option}
          height={300}
          ariaLabel="Net dollar retention over time"
        />
      )}
    </OverviewSection>
  );
}
