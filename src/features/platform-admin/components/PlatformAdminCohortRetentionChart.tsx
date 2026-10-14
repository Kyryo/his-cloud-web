"use client";

import { HeatmapChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import ReactEChartsCore from "echarts-for-react/lib/core";
import type { EChartsOption } from "echarts";
import { useTheme } from "next-themes";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { ChartEmptyState } from "@/features/reports/components/ChartEmptyState";
import type { PlatformAdminCohortRetention } from "@/features/platform-admin/types/platform-admin.types";
import {
  buildCohortRetentionMatrix,
  type CohortRetentionMatrix,
} from "@/features/platform-admin/utils/cohort-retention";

echarts.use([
  HeatmapChart,
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  SVGRenderer,
]);

type ChartPalette = {
  text: string;
  muted: string;
  grid: string;
  surface: string;
  heat: [string, string, string];
};

const LIGHT: ChartPalette = {
  text: "#1f2a37",
  muted: "#7a6e62",
  grid: "rgba(0,0,0,0.08)",
  surface: "#ffffff",
  heat: ["#eef6f6", "#5fa8a8", "#0b6e6e"],
};

const DARK: ChartPalette = {
  text: "#e5e7eb",
  muted: "#9ca3af",
  grid: "rgba(255,255,255,0.08)",
  surface: "#111827",
  heat: ["#13272a", "#2f7f7f", "#5fd0c8"],
};

function heatmapOption(
  m: CohortRetentionMatrix,
  p: ChartPalette,
): EChartsOption {
  return {
    backgroundColor: "transparent",
    textStyle: { color: p.text, fontFamily: "inherit" },
    tooltip: {
      backgroundColor: p.surface,
      borderColor: p.grid,
      textStyle: { color: p.text },
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        const [x, y, pct, active] = item.value as number[];
        return `<b>${m.cohortLabels[y]}</b> · ${m.offsetLabels[x]}<br/>${pct}% retained (${active} of ${m.cohortSizes[y]})`;
      },
    },
    grid: { top: 8, right: 8, bottom: 56, left: 72 },
    xAxis: {
      type: "category",
      data: m.offsetLabels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: p.muted, fontSize: 11 },
      splitArea: { show: false },
    },
    yAxis: {
      type: "category",
      data: m.cohortLabels,
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: p.muted,
        fontSize: 11,
        formatter: (label: string, i: number) =>
          `${label}  (${m.cohortSizes[i]})`,
      },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemHeight: 120,
      itemWidth: 10,
      text: ["100%", "0%"],
      textStyle: { color: p.muted, fontSize: 11 },
      inRange: { color: p.heat },
    },
    series: [
      {
        type: "heatmap",
        data: m.cells.map((cell) => cell.value),
        label: {
          show: true,
          fontSize: 10,
          formatter: (params) => `${Math.round((params.value as number[])[2])}`,
        },
        itemStyle: { borderColor: p.surface, borderWidth: 2, borderRadius: 3 },
        emphasis: { itemStyle: { borderColor: p.text, borderWidth: 1 } },
      },
    ],
  };
}

function curvesOption(
  m: CohortRetentionMatrix,
  p: ChartPalette,
): EChartsOption {
  return {
    backgroundColor: "transparent",
    textStyle: { color: p.text, fontFamily: "inherit" },
    tooltip: {
      trigger: "axis",
      backgroundColor: p.surface,
      borderColor: p.grid,
      textStyle: { color: p.text },
      valueFormatter: (v) => (v == null ? "—" : `${v}%`),
    },
    legend: {
      type: "scroll",
      bottom: 0,
      textStyle: { color: p.muted, fontSize: 11 },
      icon: "roundRect",
      itemWidth: 10,
      itemHeight: 4,
    },
    grid: { top: 12, right: 12, bottom: 40, left: 44 },
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
      axisLabel: { color: p.muted, fontSize: 11, formatter: "{value}%" },
      splitLine: { lineStyle: { color: p.grid } },
    },
    series: [
      ...m.curves.map((curve) => ({
        name: curve.label,
        type: "line" as const,
        data: curve.points,
        showSymbol: false,
        smooth: true,
        lineStyle: { width: 1.25, opacity: 0.45 },
        emphasis: { focus: "series" as const },
      })),
      {
        name: "Average",
        type: "line" as const,
        data: m.average,
        smooth: true,
        showSymbol: false,
        z: 10,
        lineStyle: { width: 3, color: p.heat[2] },
        itemStyle: { color: p.heat[2] },
      },
    ],
  };
}

type View = "heatmap" | "curves";

const VIEWS: { id: View; label: string }[] = [
  { id: "heatmap", label: "Heatmap" },
  { id: "curves", label: "Curves" },
];

type Props = {
  retention: PlatformAdminCohortRetention;
};

export function PlatformAdminCohortRetentionChart({ retention }: Props) {
  const [view, setView] = useState<View>("heatmap");
  const { resolvedTheme } = useTheme();
  const palette = resolvedTheme === "dark" ? DARK : LIGHT;
  const matrix = useMemo(
    () => buildCohortRetentionMatrix(retention),
    [retention],
  );

  if (matrix.offsetLabels.length === 0) {
    return (
      <ChartEmptyState message="No onboarding cohorts with product activity yet." />
    );
  }

  const option =
    view === "heatmap"
      ? heatmapOption(matrix, palette)
      : curvesOption(matrix, palette);
  const height =
    view === "heatmap"
      ? Math.max(260, matrix.cohortLabels.length * 30 + 80)
      : 320;

  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label="Cohort retention view"
        className="inline-flex rounded-md bg-muted p-0.5 text-xs"
      >
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={view === v.id}
            onClick={() => setView(v.id)}
            className={cn(
              "rounded px-3 py-1 font-medium transition-colors",
              view === v.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        notMerge
        opts={{ renderer: "svg" }}
        style={{ height, width: "100%" }}
      />
    </div>
  );
}
