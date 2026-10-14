"use client";

import type { EChartsOption } from "echarts";
import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";

import { OverviewEChart } from "@/features/platform-admin/components/overview/OverviewEChart";
import { OverviewEmptyState } from "@/features/platform-admin/components/overview/OverviewEmptyState";
import { OverviewSection } from "@/features/platform-admin/components/overview/OverviewSection";
import { OverviewSegmentedControl } from "@/features/platform-admin/components/overview/OverviewSegmentedControl";
import type { OverviewChartPalette } from "@/features/platform-admin/constants/overview-chart-palette";
import { useOverviewChartPalette } from "@/features/platform-admin/hooks/use-overview-chart-palette";
import { formatCohortMonth } from "@/features/platform-admin/utils/cohort-retention";
import {
  formatMoney,
  type FinanceMonthPoint,
} from "@/features/platform-admin/utils/finance-series";
import {
  availableRanges,
  OVERVIEW_RANGE_LABELS,
  sliceToRange,
  type OverviewRange,
} from "@/features/platform-admin/utils/overview-series";

const COST_COLOR = { light: "#d4a373", dark: "#c08a55" };

function buildOption(
  points: FinanceMonthPoint[],
  currency: string,
  p: OverviewChartPalette,
): EChartsOption {
  const months = points.map((pt) => formatCohortMonth(pt.month));
  const costColor =
    p.surface === "#ffffff" ? COST_COLOR.light : COST_COLOR.dark;
  return {
    animationDuration: 600,
    textStyle: { fontFamily: "inherit" },
    grid: { top: 16, right: 8, bottom: 24, left: 56 },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
        shadowStyle: { color: p.grid, opacity: 0.5 },
      },
      backgroundColor: p.surface,
      borderColor: p.tooltipBorder,
      borderWidth: 1,
      padding: [8, 10],
      extraCssText:
        "border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);",
      textStyle: { color: p.text, fontSize: 12 },
      formatter: (params) => {
        const i = (Array.isArray(params) ? params[0] : params).dataIndex ?? 0;
        const pt = points[i];
        const row = (label: string, color: string, v: number) =>
          `<div style="display:flex;align-items:center;justify-content:space-between;gap:18px"><span style="display:flex;align-items:center;gap:6px;color:${p.muted}"><i style="width:8px;height:8px;border-radius:2px;background:${color};display:inline-block"></i>${label}</span><b>${formatMoney(v, currency)}</b></div>`;
        return `<div style="font-weight:600;margin-bottom:4px">${months[i]}</div>${row("Revenue", p.primary, pt.revenue)}${row("Costs", costColor, pt.costs)}<div style="border-top:1px solid ${p.grid};margin-top:4px;padding-top:4px">${row("Net", pt.net >= 0 ? p.positive : p.negative, pt.net)}</div>`;
      },
    },
    xAxis: {
      type: "category",
      data: months,
      axisLine: { lineStyle: { color: p.grid } },
      axisTick: { show: false },
      axisLabel: { color: p.muted, fontSize: 11, hideOverlap: true },
    },
    yAxis: {
      type: "value",
      splitNumber: 4,
      axisLabel: {
        color: p.muted,
        fontSize: 11,
        formatter: (v: number) => formatMoney(v, currency, true),
      },
      splitLine: { lineStyle: { color: p.grid, type: [3, 4] } },
    },
    series: [
      {
        name: "Revenue",
        type: "bar",
        data: points.map((pt) => pt.revenue),
        barMaxWidth: 18,
        barGap: "20%",
        itemStyle: { color: p.primary, borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "Costs",
        type: "bar",
        data: points.map((pt) => pt.costs),
        barMaxWidth: 18,
        itemStyle: { color: costColor, borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "Net",
        type: "line",
        data: points.map((pt) => pt.net),
        smooth: 0.3,
        showSymbol: false,
        symbolSize: 6,
        z: 5,
        lineStyle: { width: 2, color: p.text, type: [5, 4], opacity: 0.7 },
        itemStyle: { color: p.text },
      },
    ],
  };
}

type Props = { series: FinanceMonthPoint[]; currency: string };

export function FinanceTrendChart({ series, currency }: Props) {
  const palette = useOverviewChartPalette();
  const ranges = useMemo(() => availableRanges(series.length), [series.length]);
  const [range, setRange] = useState<OverviewRange>(
    ranges.includes(12) ? 12 : "all",
  );
  const points = useMemo(() => sliceToRange(series, range), [series, range]);
  const option = useMemo(
    () => buildOption(points, currency, palette),
    [points, currency, palette],
  );
  const totals = points.reduce(
    (acc, pt) => ({
      revenue: acc.revenue + pt.revenue,
      costs: acc.costs + pt.costs,
    }),
    { revenue: 0, costs: 0 },
  );
  const net = totals.revenue - totals.costs;

  return (
    <OverviewSection
      title="Revenue vs. costs"
      headline={
        points.length > 0 ? (
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 pt-1">
            <span className="text-[40px] font-semibold leading-none tracking-[-0.035em] tabular-nums">
              {formatMoney(net, currency)}
            </span>
            <span className="text-xs text-muted-foreground">
              net ·{" "}
              {range === "all"
                ? "all time"
                : `last ${OVERVIEW_RANGE_LABELS[range]}`}
            </span>
            <span className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <i className="size-2 rounded-[2px] bg-primary" />
                Revenue{" "}
                <b className="font-semibold text-foreground tabular-nums">
                  {formatMoney(totals.revenue, currency)}
                </b>
              </span>
              <span className="flex items-center gap-1.5">
                <i className="size-2 rounded-[2px] bg-[#d4a373] dark:bg-[#c08a55]" />
                Costs{" "}
                <b className="font-semibold text-foreground tabular-nums">
                  {formatMoney(totals.costs, currency)}
                </b>
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-0 w-3 border-t-2 border-dashed border-foreground/60" />
                Net
              </span>
            </span>
          </div>
        ) : null
      }
      description={`Monthly tenant payments against operating costs, in ${currency}.`}
      actions={
        ranges.length > 1 ? (
          <OverviewSegmentedControl
            label="Finance range"
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
          icon={BarChart3}
          title="No payments or costs yet"
          description="Record a tenant payment or operating cost to see the monthly trend."
          height={300}
        />
      ) : (
        <OverviewEChart
          option={option}
          height={300}
          ariaLabel="Revenue versus costs by month"
        />
      )}
    </OverviewSection>
  );
}
