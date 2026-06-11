import {
  createEmptyLineItem,
  type InventoryLineItemDraft,
} from "@/features/inventory/components/forms/InventoryLineItemsEditor";
import type { PurchaseOrderLine } from "@/features/inventory/types/inventory.types";

export function purchaseOrderLinesToDrafts(
  lines: PurchaseOrderLine[],
): InventoryLineItemDraft[] {
  if (lines.length === 0) {
    return [createEmptyLineItem()];
  }

  return lines.map((line) => ({
    key: crypto.randomUUID(),
    odoo_product_id: line.odoo_product_id,
    quantity: String(line.quantity),
    unit_cost: String(line.unit_cost),
  }));
}

export function draftsToPurchaseOrderLines(
  drafts: InventoryLineItemDraft[],
): PurchaseOrderLine[] {
  return drafts
    .filter((line) => line.odoo_product_id)
    .map((line) => ({
      odoo_product_id: line.odoo_product_id!,
      quantity: line.quantity,
      unit_cost: line.unit_cost,
    }));
}
