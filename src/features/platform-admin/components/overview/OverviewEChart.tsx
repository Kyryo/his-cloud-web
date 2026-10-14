"use client";

import { BarChart, HeatmapChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import ReactEChartsCore from "echarts-for-react/lib/core";
import type { EChartsOption } from "echarts";

echarts.use([
  BarChart,
  HeatmapChart,
  LineChart,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
  VisualMapComponent,
  SVGRenderer,
]);

export const overviewEcharts = echarts;

type Props = {
  option: EChartsOption;
  height: number;
  ariaLabel: string;
};

/** Tree-shaken ECharts renderer shared by the overview charts (SVG for crisp hairlines). */
export function OverviewEChart({ option, height, ariaLabel }: Props) {
  return (
    <div role="img" aria-label={ariaLabel} className="w-full min-w-0">
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        notMerge
        lazyUpdate
        opts={{ renderer: "svg" }}
        style={{ height, width: "100%" }}
      />
    </div>
  );
}

export function verticalGradient(from: string, to: string) {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: from },
    { offset: 1, color: to },
  ]);
}
