"use client";

import type { EChartsOption } from "echarts";
import { LineChart as LineIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { OverviewDeltaPill } from "@/features/platform-admin/components/overview/OverviewDeltaPill";
import {
  OverviewEChart,
  verticalGradient,
} from "@/features/platform-admin/components/overview/OverviewEChart";
import { OverviewEmptyState } from "@/features/platform-admin/components/overview/OverviewEmptyState";
import { OverviewSection } from "@/features/platform-admin/components/overview/OverviewSection";
import { OverviewSegmentedControl } from "@/features/platform-admin/components/overview/OverviewSegmentedControl";
import type { OverviewChartPalette } from "@/features/platform-admin/constants/overview-chart-palette";
import { useOverviewChartPalette } from "@/features/platform-admin/hooks/use-overview-chart-palette";
import { formatCohortMonth } from "@/features/platform-admin/utils/cohort-retention";
import {
  availableRanges,
  OVERVIEW_RANGE_LABELS,
  sliceToRange,
  type OverviewRange,
  type TenantGrowthPoint,
} from "@/features/platform-admin/utils/overview-series";

function buildOption(
  points: TenantGrowthPoint[],
  p: OverviewChartPalette,
): EChartsOption {
  const months = points.map((pt) => formatCohortMonth(pt.month));
  return {
    animationDuration: 600,
    animationEasing: "cubicOut",
    textStyle: { fontFamily: "inherit" },
    grid: { top: 16, right: 8, bottom: 24, left: 36 },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: { color: p.muted, type: "dashed", width: 1 },
      },
      backgroundColor: p.surface,
      borderColor: p.tooltipBorder,
      borderWidth: 1,
      padding: [8, 10],
      extraCssText:
        "border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);",
      textStyle: { color: p.text, fontSize: 12 },
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params];
        const index = list[0]?.dataIndex ?? 0;
        const pt = points[index];
        return `<div style="font-weight:600;margin-bottom:4px">${months[index]}</div>
          <div style="display:flex;justify-content:space-between;gap:16px"><span style="color:${p.muted}">Total tenants</span><b>${pt.total}</b></div>
          <div style="display:flex;justify-content:space-between;gap:16px"><span style="color:${p.muted}">New this month</span><b>+${pt.added}</b></div>`;
      },
    },
    xAxis: {
      type: "category",
      data: months,
      boundaryGap: false,
      axisLine: { lineStyle: { color: p.grid } },
      axisTick: { show: false },
      axisLabel: {
        color: p.muted,
        fontSize: 11,
        margin: 12,
        hideOverlap: true,
      },
    },
    yAxis: [
      {
        type: "value",
        minInterval: 1,
        splitNumber: 4,
        axisLabel: { color: p.muted, fontSize: 11 },
        splitLine: { lineStyle: { color: p.grid, type: [3, 4] } },
      },
      {
        type: "value",
        show: false,
        minInterval: 1,
        max: (v) => Math.max(1, v.max * 4),
      },
    ],
    series: [
      {
        name: "New tenants",
        type: "bar",
        yAxisIndex: 1,
        data: points.map((pt) => pt.added),
        barMaxWidth: 14,
        itemStyle: { color: p.bar, borderRadius: [3, 3, 0, 0] },
      },
      {
        name: "Total tenants",
        type: "line",
        data: points.map((pt) => pt.total),
        smooth: 0.35,
        symbol: "circle",
        symbolSize: 7,
        showSymbol: false,
        lineStyle: { width: 2.25, color: p.primary },
        itemStyle: { color: p.primary, borderColor: p.surface, borderWidth: 2 },
        areaStyle: {
          color: verticalGradient(p.primaryFill[0], p.primaryFill[1]),
        },
        emphasis: { focus: "none", scale: true },
      },
    ],
  };
}

type Props = { series: TenantGrowthPoint[]; isPartial?: boolean };

export function OverviewTenantGrowthChart({ series, isPartial }: Props) {
  const palette = useOverviewChartPalette();
  const ranges = useMemo(() => availableRanges(series.length), [series.length]);
  const [range, setRange] = useState<OverviewRange>(
    ranges.includes(12) ? 12 : "all",
  );
  const points = useMemo(() => sliceToRange(series, range), [series, range]);
  const option = useMemo(() => buildOption(points, palette), [points, palette]);

  const total = series.at(-1)?.total ?? 0;
  const startTotal = points.length > 0 ? points[0].total - points[0].added : 0;
  const addedInRange = total - startTotal;

  return (
    <OverviewSection
      title="Tenant growth"
      headline={
        <div className="flex flex-wrap items-baseline gap-3 pt-1">
          <span className="text-[40px] font-semibold leading-none tracking-[-0.035em] text-foreground tabular-nums">
            {total}
          </span>
          {points.length > 1 ? (
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <OverviewDeltaPill
                delta={{
                  current: total,
                  previous: startTotal,
                  change: addedInRange,
                  direction: addedInRange > 0 ? "up" : "flat",
                }}
                format={(c) => `+${c}`}
              />
              new tenants ·{" "}
              {OVERVIEW_RANGE_LABELS[range] === "All"
                ? "all time"
                : `last ${OVERVIEW_RANGE_LABELS[range]}`}
            </span>
          ) : null}
        </div>
      }
      description={
        isPartial
          ? "Tenants created per month (first 200 tenants loaded)."
          : "Tenants created per month, all statuses."
      }
      actions={
        ranges.length > 1 ? (
          <OverviewSegmentedControl
            label="Tenant growth range"
            options={ranges.map((r) => ({
              value: r,
              label: OVERVIEW_RANGE_LABELS[r],
            }))}
            value={range}
            onChange={setRange}
          />
        ) : null
      }
    >
      {series.length === 0 ? (
        <OverviewEmptyState
          icon={LineIcon}
          title="No tenants yet"
          description="Tenant growth appears once the first tenant is provisioned."
          height={300}
        />
      ) : (
        <OverviewEChart
          option={option}
          height={300}
          ariaLabel="Tenant growth over time"
        />
      )}
    </OverviewSection>
  );
}
