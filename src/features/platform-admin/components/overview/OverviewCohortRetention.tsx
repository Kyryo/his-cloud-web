"use client";

import type { EChartsOption } from "echarts";
import { Grid3x3 } from "lucide-react";
import { useMemo, useState } from "react";

import { OverviewEChart } from "@/features/platform-admin/components/overview/OverviewEChart";
import { OverviewEmptyState } from "@/features/platform-admin/components/overview/OverviewEmptyState";
import { OverviewSection } from "@/features/platform-admin/components/overview/OverviewSection";
import { OverviewSegmentedControl } from "@/features/platform-admin/components/overview/OverviewSegmentedControl";
import type { OverviewChartPalette } from "@/features/platform-admin/constants/overview-chart-palette";
import { useOverviewChartPalette } from "@/features/platform-admin/hooks/use-overview-chart-palette";
import type { PlatformAdminCohortRetention } from "@/features/platform-admin/types/platform-admin.types";
import {
  buildCohortRetentionMatrix,
  type CohortRetentionMatrix,
} from "@/features/platform-admin/utils/cohort-retention";

type View = "heatmap" | "curves";

function tooltipBase(p: OverviewChartPalette) {
  return {
    backgroundColor: p.surface,
    borderColor: p.tooltipBorder,
    borderWidth: 1,
    padding: [8, 10] as [number, number],
    extraCssText: "border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);",
    textStyle: { color: p.text, fontSize: 12 },
  };
}

function heatmapOption(
  m: CohortRetentionMatrix,
  p: OverviewChartPalette,
): EChartsOption {
  return {
    animationDuration: 500,
    textStyle: { fontFamily: "inherit" },
    tooltip: {
      ...tooltipBase(p),
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        const [x, y, pct, active] = (item.value as number[]) ?? [];
        return `<div style="font-weight:600">${m.cohortLabels[y]} cohort · ${m.offsetLabels[x]}</div>
          <div style="color:${p.muted};margin:2px 0 6px">${active} of ${m.cohortSizes[y]} tenants active</div>
          <div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:4px;border-radius:2px;background:${p.grid};min-width:120px"><div style="width:${pct}%;height:4px;border-radius:2px;background:${p.primary}"></div></div><b>${pct}%</b></div>`;
      },
    },
    grid: { top: 4, right: 4, bottom: 28, left: 92 },
    xAxis: {
      type: "category",
      position: "bottom",
      data: m.offsetLabels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: p.muted, fontSize: 11 },
    },
    yAxis: {
      type: "category",
      data: m.cohortLabels,
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: 11,
        formatter: (label: string, i: number) =>
          `{l|${label}}  {s|${m.cohortSizes[i]}}`,
        rich: {
          l: { color: p.text, fontSize: 11, fontWeight: 500 },
          s: { color: p.muted, fontSize: 10 },
        },
      },
    },
    visualMap: {
      show: false,
      dimension: 2,
      min: 0,
      max: 100,
      inRange: { color: p.heat },
    },
    series: [
      {
        type: "heatmap",
        data: m.cells.map((cell) => ({
          value: cell.value,
          label: { color: cell.value[2] >= 55 ? p.heatInk[1] : p.heatInk[0] },
        })),
        label: {
          show: true,
          fontSize: 10,
          fontWeight: 500,
          formatter: (params) =>
            `${Math.round((params.value as number[])[2])}%`,
        },
        itemStyle: { borderColor: p.surface, borderWidth: 3, borderRadius: 6 },
        emphasis: { itemStyle: { borderColor: p.primary, borderWidth: 2 } },
      },
    ],
  };
}

function curvesOption(
  m: CohortRetentionMatrix,
  p: OverviewChartPalette,
): EChartsOption {
  const n = Math.max(1, m.curves.length - 1);
  return {
    animationDuration: 600,
    textStyle: { fontFamily: "inherit" },
    tooltip: {
      ...tooltipBase(p),
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: { color: p.muted, type: "dashed" },
      },
      order: "valueDesc",
      valueFormatter: (v) => (v == null ? "—" : `${v}%`),
    },
    grid: { top: 12, right: 12, bottom: 28, left: 40 },
    xAxis: {
      type: "category",
      data: m.offsetLabels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: p.grid } },
      axisTick: { show: false },
      axisLabel: { color: p.muted, fontSize: 11 },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 25,
      axisLabel: { color: p.muted, fontSize: 11, formatter: "{value}%" },
      splitLine: { lineStyle: { color: p.grid, type: [3, 4] } },
    },
    series: [
      ...m.curves.map((curve, i) => ({
        name: curve.label,
        type: "line" as const,
        data: curve.points,
        showSymbol: false,
        smooth: 0.3,
        connectNulls: false,
        lineStyle: {
          width: 1.25,
          color: p.heat[1 + Math.round((i / n) * (p.heat.length - 2))],
        },
        itemStyle: {
          color: p.heat[1 + Math.round((i / n) * (p.heat.length - 2))],
        },
        emphasis: { focus: "series" as const, lineStyle: { width: 2 } },
      })),
      {
        name: "Weighted average",
        type: "line" as const,
        data: m.average,
        smooth: 0.3,
        symbol: "circle",
        symbolSize: 6,
        z: 10,
        lineStyle: { width: 3, color: p.primary },
        itemStyle: { color: p.primary, borderColor: p.surface, borderWidth: 2 },
      },
    ],
  };
}

function HeatLegend({ palette }: { palette: OverviewChartPalette }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-muted-foreground tabular-nums">
      <span>0%</span>
      <span
        className="h-1.5 w-28 rounded-full"
        style={{
          background: `linear-gradient(90deg, ${palette.heat.join(",")})`,
        }}
      />
      <span>100%</span>
      <span className="ml-2 hidden sm:inline">
        Cohort size shown beside each month
      </span>
    </div>
  );
}

function CurvesLegend({ palette }: { palette: OverviewChartPalette }) {
  return (
    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span
          className="h-[3px] w-4 rounded-full"
          style={{ background: palette.primary }}
        />
        Weighted average
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="h-[2px] w-4 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${palette.heat[1]}, ${palette.heat[4]})`,
          }}
        />
        Individual cohorts (older → newer)
      </span>
    </div>
  );
}

type Props = { retention: PlatformAdminCohortRetention };

export function OverviewCohortRetention({ retention }: Props) {
  const [view, setView] = useState<View>("heatmap");
  const palette = useOverviewChartPalette();
  const matrix = useMemo(
    () => buildCohortRetentionMatrix(retention),
    [retention],
  );
  const option = useMemo(
    () =>
      view === "heatmap"
        ? heatmapOption(matrix, palette)
        : curvesOption(matrix, palette),
    [view, matrix, palette],
  );
  const isEmpty = matrix.offsetLabels.length === 0;
  const m1 = matrix.average[1];

  return (
    <OverviewSection
      title="Cohort retention"
      headline={
        !isEmpty && m1 != null ? (
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums">
              {m1}%
            </span>
            <span className="text-xs text-muted-foreground">
              avg. month-1 retention
            </span>
          </div>
        ) : null
      }
      description="Share of each onboarding cohort still active (sales order or invoice) by months since onboarding."
      actions={
        isEmpty ? null : (
          <OverviewSegmentedControl
            label="Cohort retention view"
            options={[
              { value: "heatmap", label: "Heatmap" },
              { value: "curves", label: "Curves" },
            ]}
            value={view}
            onChange={setView}
          />
        )
      }
    >
      {isEmpty ? (
        <OverviewEmptyState
          icon={Grid3x3}
          title="No cohorts yet"
          description="No onboarding cohorts with product activity yet."
          height={300}
        />
      ) : (
        <div className="space-y-3">
          <OverviewEChart
            option={option}
            height={
              view === "heatmap"
                ? Math.max(240, matrix.cohortLabels.length * 34 + 40)
                : 300
            }
            ariaLabel={`Cohort retention ${view}`}
          />
          {view === "heatmap" ? (
            <HeatLegend palette={palette} />
          ) : (
            <CurvesLegend palette={palette} />
          )}
        </div>
      )}
    </OverviewSection>
  );
}
