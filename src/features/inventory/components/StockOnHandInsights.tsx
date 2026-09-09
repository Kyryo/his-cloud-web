"use client";

import { InventoryListInsights } from "@/features/inventory/components/InventoryListInsights";
import {
  LOW_STOCK_THRESHOLD,
  type StockPageInsights,
} from "@/features/inventory/utils/stock-quantity-status";

type StockOnHandInsightsProps = {
  totalLines: number;
  insights: StockPageInsights;
  isLoading?: boolean;
};

export function StockOnHandInsights({
  totalLines,
  insights,
  isLoading = false,
}: StockOnHandInsightsProps) {
  return (
    <InventoryListInsights
      isLoading={isLoading}
      data-testid="stock-on-hand-insights"
      cards={[
        {
          label: "Stock lines",
          value: totalLines,
          hint: "In the current list",
          dotClass: "bg-brand-primary",
        },
        {
          label: "Locations",
          value: insights.locationCount,
          hint: "On this page",
          dotClass: "bg-teal-600",
        },
        {
          label: "Out of stock",
          value: insights.outOfStockCount,
          hint: "On this page",
          dotClass: "bg-rose-500",
          emphasize: insights.outOfStockCount > 0,
          emphasizeClass: "text-rose-700",
        },
        {
          label: "Running low",
          value: insights.lowStockCount,
          hint: `Below ${LOW_STOCK_THRESHOLD} on this page`,
          dotClass: "bg-amber-500",
          emphasize: insights.lowStockCount > 0,
          emphasizeClass: "text-amber-800",
        },
      ]}
    />
  );
}
