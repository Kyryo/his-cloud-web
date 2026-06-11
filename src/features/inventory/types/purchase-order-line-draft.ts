import type { PurchaseOrderLine } from "@/features/inventory/types/inventory.types";

export type PurchaseOrderLineDraft = {
  key: string;
  id?: number;
  odoo_product_id: number | null;
  productName: string | null;
  quantity: string;
  unit_cost: string;
  isNew?: boolean;
};

export function createEmptyPurchaseOrderLineDraft(): PurchaseOrderLineDraft {
  return {
    key: crypto.randomUUID(),
    odoo_product_id: null,
    productName: null,
    quantity: "1",
    unit_cost: "0",
    isNew: true,
  };
}

export function purchaseOrderLineToDraft(line: PurchaseOrderLine): PurchaseOrderLineDraft {
  return {
    key: crypto.randomUUID(),
    id: line.id,
    odoo_product_id: line.odoo_product_id,
    productName: null,
    quantity: String(line.quantity),
    unit_cost: String(line.unit_cost),
  };
}

export function parseDraftNumber(value: string): number {
  const numeric = Number.parseFloat(value);
  return Number.isNaN(numeric) ? 0 : numeric;
}

export function calculateLineDraftTotal(line: PurchaseOrderLineDraft): number {
  return parseDraftNumber(line.quantity) * parseDraftNumber(line.unit_cost);
}

export function calculateDraftsTotal(lines: PurchaseOrderLineDraft[]): number {
  return lines
    .filter((line) => line.odoo_product_id)
    .reduce((sum, line) => sum + calculateLineDraftTotal(line), 0);
}

export function countSavedLineDrafts(lines: PurchaseOrderLineDraft[]): number {
  return lines.filter((line) => line.odoo_product_id).length;
}

export function draftsToPurchaseOrderLines(
  drafts: PurchaseOrderLineDraft[],
): PurchaseOrderLine[] {
  return drafts
    .filter((line) => line.odoo_product_id)
    .map((line) => ({
      id: line.id,
      odoo_product_id: line.odoo_product_id!,
      quantity: line.quantity,
      unit_cost: line.unit_cost,
    }));
}

export function serializeDraftLines(lines: PurchaseOrderLineDraft[]): string {
  return JSON.stringify(
    lines.map((line) => ({
      id: line.id ?? null,
      odoo_product_id: line.odoo_product_id,
      quantity: line.quantity,
      unit_cost: line.unit_cost,
    })),
  );
}

export function hasInvalidLineDraft(line: PurchaseOrderLineDraft): boolean {
  if (!line.odoo_product_id) {
    return false;
  }

  return (
    parseDraftNumber(line.quantity) <= 0 || parseDraftNumber(line.unit_cost) <= 0
  );
}

export function validatePurchaseOrderLinesForSubmit(
  lines: PurchaseOrderLineDraft[],
): string | null {
  const savedLines = lines.filter((line) => line.odoo_product_id);

  if (savedLines.length === 0) {
    return "Add at least one line item before submitting.";
  }

  const invalidLine = savedLines.find(hasInvalidLineDraft);
  if (invalidLine) {
    return "Each line item must have a quantity and unit cost greater than zero.";
  }

  return null;
}
