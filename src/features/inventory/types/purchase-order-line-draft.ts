import type { PurchaseOrderLine } from "@/features/inventory/types/inventory.types";
import type { PurchaseOrderLinePayload } from "@/features/inventory/services/purchase-orders.service";

export type PurchaseOrderLineDraft = {
  key: string;
  id?: number;
  product_id: number | null;
  product_uuid?: string | null;
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

export function draftHasProduct(line: {
  product_id: number | null;
  product_uuid?: string | null;
}): boolean {
  return Boolean(line.product_uuid || line.product_id);
}

export function createEmptyPurchaseOrderLineDraft(): PurchaseOrderLineDraft {
  return {
    key: crypto.randomUUID(),
    product_id: null,
    product_uuid: null,
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
    product_uuid: null,
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

/** Keep display names from the editor when the API omits product_name. */
export function preserveProductNamesInDrafts(
  nextDrafts: PurchaseOrderLineDraft[],
  previousDrafts: PurchaseOrderLineDraft[],
): PurchaseOrderLineDraft[] {
  const namesByProductId = new Map<number, string>();
  const namesByProductUuid = new Map<string, string>();
  const previousWithProduct = previousDrafts.filter(draftHasProduct);

  for (const line of previousDrafts) {
    const name = line.productName?.trim();
    if (!name) {
      continue;
    }
    if (line.product_id != null) {
      namesByProductId.set(line.product_id, name);
    }
    if (line.product_uuid) {
      namesByProductUuid.set(line.product_uuid, name);
    }
  }

  let productIndex = 0;

  return nextDrafts.map((draft) => {
    const existingName = draft.productName?.trim();
    if (existingName) {
      if (draftHasProduct(draft)) {
        productIndex += 1;
      }
      return draft;
    }

    const byId =
      draft.product_id != null ? namesByProductId.get(draft.product_id) : undefined;
    const byUuid = draft.product_uuid
      ? namesByProductUuid.get(draft.product_uuid)
      : undefined;
    // After save the API returns product_id but not product_uuid, so also
    // fall back to the same ordinal among product-bearing lines.
    const byIndex = draftHasProduct(draft)
      ? previousWithProduct[productIndex]?.productName?.trim()
      : undefined;

    if (draftHasProduct(draft)) {
      productIndex += 1;
    }

    const preserved = byId ?? byUuid ?? byIndex;
    if (!preserved) {
      return draft;
    }

    const previousMatch = previousWithProduct[productIndex - 1];

    return {
      ...draft,
      productName: preserved,
      product_uuid: draft.product_uuid ?? previousMatch?.product_uuid ?? null,
    };
  });
}

export function linesMissingProductName(lines: PurchaseOrderLineDraft[]): boolean {
  return lines.some((line) => draftHasProduct(line) && !line.productName);
}

export type BatchValidationOptions = {
  batchTrackingEnabled?: boolean;
};

export function lineMissingBatchOrExpiry(
  line: {
    product_id: number | null;
    product_uuid?: string | null;
    batch?: number | null;
    expiry_date?: string | null;
  },
  options: BatchValidationOptions = {},
): boolean {
  if (!options.batchTrackingEnabled || !draftHasProduct(line)) {
    return false;
  }

  return !line.batch || !line.expiry_date?.trim();
}

export function countLinesMissingBatchOrExpiry(
  lines: Array<{
    product_id: number | null;
    product_uuid?: string | null;
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
  if (!draftHasProduct(line)) {
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
    .filter(draftHasProduct)
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
    .filter(draftHasProduct)
    .reduce((sum, line) => sum + calculateLineDraftTotal(line), 0);
}

export function countSavedLineDrafts(lines: PurchaseOrderLineDraft[]): number {
  return lines.filter(draftHasProduct).length;
}

export function draftsToPurchaseOrderLines(
  drafts: PurchaseOrderLineDraft[],
): PurchaseOrderLinePayload[] {
  return drafts.filter(draftHasProduct).map((line) => {
    const productRef = line.product_uuid
      ? { product_uuid: line.product_uuid }
      : { product_id: line.product_id! };

    return {
      id: line.id,
      ...productRef,
      quantity: line.quantity,
      unit_cost: line.unit_cost,
      batch: line.batch ?? null,
      expiry_date: line.expiry_date?.trim() || null,
      notes: line.notes?.trim() || null,
    };
  });
}

export function serializeDraftLines(lines: PurchaseOrderLineDraft[]): string {
  return JSON.stringify(
    lines.map((line) => ({
      id: line.id ?? null,
      product_id: line.product_id,
      product_uuid: line.product_uuid ?? null,
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

export const PURCHASE_ORDER_UNIT_COST_REQUIRED_MESSAGE =
  "Unit cost is required and can't be zero.";

export function hasInvalidLineDraft(line: PurchaseOrderLineDraft): boolean {
  if (!draftHasProduct(line)) {
    return false;
  }

  return (
    parseDraftNumber(line.quantity) <= 0 || parseDraftNumber(line.unit_cost) <= 0
  );
}

export function lineHasInvalidUnitCost(line: PurchaseOrderLineDraft): boolean {
  if (!draftHasProduct(line)) {
    return false;
  }

  return parseDraftNumber(line.unit_cost) <= 0;
}

export function validatePurchaseOrderLinesForSave(
  lines: PurchaseOrderLineDraft[],
): string | null {
  if (lines.length === 0) {
    return "Add at least one line item before saving.";
  }

  for (const line of lines) {
    if (!draftHasProduct(line)) {
      return "Each line item must have a product selected.";
    }

    if (!line.productName?.trim() && !line.product_uuid && line.product_id == null) {
      return "Each line item must have a product selected.";
    }

    const quantity = parseDraftNumber(line.quantity);
    if (quantity <= 0) {
      return "Each line item must have a quantity greater than zero.";
    }

    if (lineHasInvalidUnitCost(line)) {
      return PURCHASE_ORDER_UNIT_COST_REQUIRED_MESSAGE;
    }
  }

  return null;
}

export function validatePurchaseOrderLinesForSubmit(
  lines: PurchaseOrderLineDraft[],
): string | null {
  const saveError = validatePurchaseOrderLinesForSave(lines);
  if (saveError) {
    if (saveError === "Add at least one line item before saving.") {
      return "Add at least one line item before submitting.";
    }
    return saveError;
  }

  return null;
}
