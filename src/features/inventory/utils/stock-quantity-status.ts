import type { InventoryStock } from "@/features/inventory/types/inventory.types";

/** UI heuristic until the API exposes a reorder point per product. */
export const LOW_STOCK_THRESHOLD = 10;

export type StockQuantityStatus = "out" | "low" | "ok" | "unknown";

export type StockPageInsights = {
  lineCount: number;
  locationCount: number;
  outOfStockCount: number;
  lowStockCount: number;
};

export function parseStockQuantity(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isNaN(numeric) ? null : numeric;
}

export function getStockQuantityStatus(
  value: string | number | null | undefined,
): StockQuantityStatus {
  const quantity = parseStockQuantity(value);
  if (quantity === null) {
    return "unknown";
  }
  if (quantity <= 0) {
    return "out";
  }
  if (quantity < LOW_STOCK_THRESHOLD) {
    return "low";
  }
  return "ok";
}

export function getStockQuantityStatusLabel(
  status: StockQuantityStatus,
): string {
  switch (status) {
    case "out":
      return "Out of stock";
    case "low":
      return "Low stock";
    case "ok":
      return "In stock";
    default:
      return "Unknown";
  }
}

export function getStockLineOnHandValue(
  quantity: string | number | null | undefined,
  unitCost: string | number | null | undefined,
): number | null {
  const parsedQuantity = parseStockQuantity(quantity);
  const parsedCost = parseStockQuantity(unitCost);
  if (parsedQuantity === null || parsedCost === null) {
    return null;
  }

  return parsedQuantity * parsedCost;
}

export function summarizeStockItems(
  items: readonly InventoryStock[],
): StockPageInsights {
  const locations = new Set<string>();
  let outOfStockCount = 0;
  let lowStockCount = 0;

  for (const item of items) {
    const location = item.location_name.trim();
    if (location) {
      locations.add(location);
    }

    const status = getStockQuantityStatus(item.quantity_on_hand);
    if (status === "out") {
      outOfStockCount += 1;
    }
    if (status === "low") {
      lowStockCount += 1;
    }
  }

  return {
    lineCount: items.length,
    locationCount: locations.size,
    outOfStockCount,
    lowStockCount,
  };
}
