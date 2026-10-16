import {
  OVERVIEW_CHART_PALETTE_DARK,
  OVERVIEW_CHART_PALETTE_LIGHT,
  type OverviewChartPalette,
} from "@/features/platform-admin/constants/overview-chart-palette";
import { useColorMode } from "@/features/platform-admin/hooks/use-color-mode";

export function useOverviewChartPalette(): OverviewChartPalette {
  return useColorMode() === "dark"
    ? OVERVIEW_CHART_PALETTE_DARK
    : OVERVIEW_CHART_PALETTE_LIGHT;
}
