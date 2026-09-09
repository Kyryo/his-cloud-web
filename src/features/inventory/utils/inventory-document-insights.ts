import type { InventoryInsightCard } from "@/features/inventory/components/InventoryListInsights";
import type {
  InternalOrder,
  InventoryMovement,
  PurchaseOrder,
  StockAdjustment,
} from "@/features/inventory/types/inventory.types";
import { parseStockQuantity } from "@/features/inventory/utils/stock-quantity-status";
import { formatCompactAmount } from "@/utils/format-compact-number";

const PAGE_HINT = "On this page";
const LIST_HINT = "In the current list";

export function summarizePurchaseOrders(
  orders: readonly PurchaseOrder[],
  totalCount: number,
): InventoryInsightCard[] {
  let draftCount = 0;
  let confirmedCount = 0;
  let pageValue = 0;

  for (const order of orders) {
    if (order.status === "DRAFT") {
      draftCount += 1;
    }
    if (order.status === "CONFIRMED") {
      confirmedCount += 1;
    }
    pageValue += parseStockQuantity(order.total_value) ?? 0;
  }

  return [
    {
      label: "Orders",
      value: totalCount,
      hint: LIST_HINT,
      dotClass: "bg-brand-primary",
    },
    {
      label: "Draft",
      value: draftCount,
      hint: PAGE_HINT,
      dotClass: "bg-stone-400",
    },
    {
      label: "Confirmed",
      value: confirmedCount,
      hint: PAGE_HINT,
      dotClass: "bg-emerald-500",
    },
    {
      label: "Page value",
      value: pageValue,
      display: formatCompactAmount(pageValue),
      hint: PAGE_HINT,
      dotClass: "bg-teal-600",
    },
  ];
}

export function summarizeInternalOrders(
  orders: readonly InternalOrder[],
  totalCount: number,
): InventoryInsightCard[] {
  let draftCount = 0;
  let dispatchedCount = 0;
  let receivedCount = 0;

  for (const order of orders) {
    if (order.status === "DRAFT") {
      draftCount += 1;
    }
    if (order.status === "DISPATCHED") {
      dispatchedCount += 1;
    }
    if (order.status === "RECEIVED") {
      receivedCount += 1;
    }
  }

  return [
    {
      label: "Orders",
      value: totalCount,
      hint: LIST_HINT,
      dotClass: "bg-brand-primary",
    },
    {
      label: "Draft",
      value: draftCount,
      hint: PAGE_HINT,
      dotClass: "bg-stone-400",
    },
    {
      label: "Dispatched",
      value: dispatchedCount,
      hint: PAGE_HINT,
      dotClass: "bg-teal-600",
      emphasize: dispatchedCount > 0,
      emphasizeClass: "text-teal-800",
    },
    {
      label: "Received",
      value: receivedCount,
      hint: PAGE_HINT,
      dotClass: "bg-emerald-500",
    },
  ];
}

export function summarizeStockAdjustments(
  adjustments: readonly StockAdjustment[],
  totalCount: number,
): InventoryInsightCard[] {
  let draftCount = 0;
  let appliedCount = 0;
  let quantityCount = 0;

  for (const adjustment of adjustments) {
    if (adjustment.status === "DRAFT") {
      draftCount += 1;
    }
    if (adjustment.status === "APPLIED") {
      appliedCount += 1;
    }
    if (adjustment.adjustment_type === "QUANTITY") {
      quantityCount += 1;
    }
  }

  return [
    {
      label: "Adjustments",
      value: totalCount,
      hint: LIST_HINT,
      dotClass: "bg-brand-primary",
    },
    {
      label: "Draft",
      value: draftCount,
      hint: PAGE_HINT,
      dotClass: "bg-stone-400",
    },
    {
      label: "Applied",
      value: appliedCount,
      hint: PAGE_HINT,
      dotClass: "bg-emerald-500",
    },
    {
      label: "Quantity",
      value: quantityCount,
      hint: "Quantity type on this page",
      dotClass: "bg-amber-500",
    },
  ];
}

export function summarizeMovements(
  movements: readonly InventoryMovement[],
  totalCount: number,
): InventoryInsightCard[] {
  const products = new Set<number>();
  const locations = new Set<string>();
  let inboundCount = 0;

  for (const movement of movements) {
    products.add(movement.product_id);
    const from = movement.from_location_name?.trim();
    const to = movement.to_location_name?.trim();
    if (from) {
      locations.add(from);
    }
    if (to) {
      locations.add(to);
    }
    if (
      movement.movement_type === "PURCHASE_RECEIPT" ||
      movement.movement_type === "INTERNAL_ORDER_IN"
    ) {
      inboundCount += 1;
    }
  }

  return [
    {
      label: "Movements",
      value: totalCount,
      hint: LIST_HINT,
      dotClass: "bg-brand-primary",
    },
    {
      label: "Products",
      value: products.size,
      hint: PAGE_HINT,
      dotClass: "bg-teal-600",
    },
    {
      label: "Locations",
      value: locations.size,
      hint: PAGE_HINT,
      dotClass: "bg-stone-500",
    },
    {
      label: "Inbound",
      value: inboundCount,
      hint: "Receipts and transfers in",
      dotClass: "bg-emerald-500",
    },
  ];
}
