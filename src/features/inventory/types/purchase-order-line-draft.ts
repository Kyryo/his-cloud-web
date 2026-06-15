import type { PurchaseOrderLine } from "@/features/inventory/types/inventory.types";

export type PurchaseOrderLineDraft = {
  key: string;
  id?: number;
  product_id: number | null;
  productName: string | null;
  quantity: string;
  unit_cost: string;
  batch?: number | null;
  batchUuid?: string | null;
  batchNumber?: string | null;
  expiry_date?: string | null;
  manufactureDate?: string | null;
  supplier?: string | null;
  notes?: string | null;
  isNew?: boolean;
};

export function createEmptyPurchaseOrderLineDraft(): PurchaseOrderLineDraft {
  return {
    key: crypto.randomUUID(),
    product_id: null,
    productName: null,
    quantity: "1",
    unit_cost: "0",
    batch: null,
    batchUuid: null,
    batchNumber: null,
    expiry_date: null,
    isNew: true,
  };
}

export function purchaseOrderLineToDraft(line: PurchaseOrderLine): PurchaseOrderLineDraft {
  return {
    key: crypto.randomUUID(),
    id: line.id,
    product_id: line.product_id,
    productName: line.product_name?.trim() || null,
    quantity: String(line.quantity),
    unit_cost: String(line.unit_cost),
    batch: line.batch ?? null,
    batchUuid: null,
    batchNumber: line.batch_number?.trim() || null,
    expiry_date: line.expiry_date ?? null,
    notes: line.notes ?? null,
  };
}

export function linesMissingProductName(lines: PurchaseOrderLineDraft[]): boolean {
  return lines.some((line) => line.product_id && !line.productName);
}

export type BatchValidationOptions = {
  batchTrackingEnabled?: boolean;
};

export function lineMissingBatchOrExpiry(
  line: {
    product_id: number | null;
    batch?: number | null;
    expiry_date?: string | null;
  },
  options: BatchValidationOptions = {},
): boolean {
  if (!options.batchTrackingEnabled || !line.product_id) {
    return false;
  }

  return !line.batch || !line.expiry_date?.trim();
}

export function countLinesMissingBatchOrExpiry(
  lines: Array<{
    product_id: number | null;
    batch?: number | null;
    expiry_date?: string | null;
  }>,
  options: BatchValidationOptions = {},
): number {
  return lines.filter((line) => lineMissingBatchOrExpiry(line, options)).length;
}

export function getLineValidationIssues(
  line: PurchaseOrderLineDraft,
  options: BatchValidationOptions = {},
): string[] {
  if (!line.product_id) {
    return [];
  }

  const issues: string[] = [];
  if (lineMissingBatchOrExpiry(line, options)) {
    issues.push("batch");
  }
  if (parseDraftNumber(line.quantity) <= 0) {
    issues.push("quantity");
  }
  if (parseDraftNumber(line.unit_cost) <= 0) {
    issues.push("unit_cost");
  }
  return issues;
}

export function countLinesWithValidationIssues(
  lines: PurchaseOrderLineDraft[],
  options: BatchValidationOptions = {},
): number {
  return lines.filter((line) => getLineValidationIssues(line, options).length > 0).length;
}

export function calculateDraftsTotalQuantity(lines: PurchaseOrderLineDraft[]): number {
  return lines
    .filter((line) => line.product_id)
    .reduce((sum, line) => sum + parseDraftNumber(line.quantity), 0);
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
    .filter((line) => line.product_id)
    .reduce((sum, line) => sum + calculateLineDraftTotal(line), 0);
}

export function countSavedLineDrafts(lines: PurchaseOrderLineDraft[]): number {
  return lines.filter((line) => line.product_id).length;
}

export function draftsToPurchaseOrderLines(
  drafts: PurchaseOrderLineDraft[],
): PurchaseOrderLine[] {
  return drafts
    .filter((line) => line.product_id)
    .map((line) => ({
      id: line.id,
      product_id: line.product_id!,
      quantity: line.quantity,
      unit_cost: line.unit_cost,
      batch: line.batch ?? null,
      expiry_date: line.expiry_date?.trim() || null,
      notes: line.notes?.trim() || null,
    }));
}

export function serializeDraftLines(lines: PurchaseOrderLineDraft[]): string {
  return JSON.stringify(
    lines.map((line) => ({
      id: line.id ?? null,
      product_id: line.product_id,
      productName: line.productName,
      quantity: line.quantity,
      unit_cost: line.unit_cost,
      batch: line.batch ?? null,
      batchUuid: line.batchUuid ?? null,
      batchNumber: line.batchNumber ?? null,
      expiry_date: line.expiry_date ?? null,
      manufactureDate: line.manufactureDate ?? null,
      supplier: line.supplier ?? null,
      notes: line.notes ?? null,
    })),
  );
}

export function hasInvalidLineDraft(line: PurchaseOrderLineDraft): boolean {
  if (!line.product_id) {
    return false;
  }

  return (
    parseDraftNumber(line.quantity) <= 0 || parseDraftNumber(line.unit_cost) <= 0
  );
}

export function validatePurchaseOrderLinesForSubmit(
  lines: PurchaseOrderLineDraft[],
): string | null {
  const savedLines = lines.filter((line) => line.product_id);

  if (savedLines.length === 0) {
    return "Add at least one line item before submitting.";
  }

  const invalidLine = savedLines.find(hasInvalidLineDraft);
  if (invalidLine) {
    return "Each line item must have a quantity and unit cost greater than zero.";
  }

  return null;
}
